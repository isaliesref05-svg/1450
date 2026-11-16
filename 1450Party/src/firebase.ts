import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export interface CloudProfileFields {
  name: string;
  coins: number;
  matches: number;
  owned: string[];
  equipped: Record<string, { outfit: string; hat: string | null; accessory: string | null }>;
  colors: string[];
  muted: boolean;
  volume: number;
  musicVolume: number;
  musicMuted: boolean;
  battleVolume: number;
  battleMuted: boolean;
  shakeEnabled: boolean;
  joystickSize: 'small' | 'normal' | 'large';
}

export interface CloudUserDoc extends CloudProfileFields {
  uid: string;
  email: string | null;
  photoURL: string | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const RESERVED_PLAYER_NAMES = new Set(['p1', 'p2', 'p3', 'p4', 'host']);

export function isReservedPlayerName(name: string): boolean {
  return RESERVED_PLAYER_NAMES.has(name.trim().toLowerCase());
}

export function encodeNameKey(name: string): string {
  const clean = name.trim().toLowerCase().slice(0, 14);
  const bytes = new TextEncoder().encode(clean);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return `n_${hex || 'empty'}`;
}

export async function checkUsernameAvailable(name: string, currentUid?: string | null): Promise<boolean> {
  const clean = name.trim().slice(0, 14);
  if (!clean || isReservedPlayerName(clean)) return false;
  const key = encodeNameKey(clean);
  const path = `usernames/${key}`;
  try {
    const snap = await getDoc(doc(db, 'usernames', key));
    if (!snap.exists()) return true;
    return snap.data()?.uid === currentUid;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function claimUniqueUsername(
  user: User,
  newName: string,
  oldName?: string | null
): Promise<string> {
  const cleanNew = newName.trim().slice(0, 14);
  if (!cleanNew || isReservedPlayerName(cleanNew)) {
    throw new Error('NAME_INVALID');
  }
  const newKey = encodeNameKey(cleanNew);
  const cleanOld = (oldName || '').trim().slice(0, 14);
  const oldKey = cleanOld && !isReservedPlayerName(cleanOld) ? encodeNameKey(cleanOld) : null;
  const path = `usernames/${newKey}`;

  try {
    await runTransaction(db, async (tx) => {
      const newRef = doc(db, 'usernames', newKey);
      const oldRef = oldKey && oldKey !== newKey ? doc(db, 'usernames', oldKey) : null;

      const newSnap = await tx.get(newRef);
      const oldSnap = oldRef ? await tx.get(oldRef) : null;

      if (newSnap.exists() && newSnap.data()?.uid !== user.uid) {
        throw new Error('NAME_TAKEN');
      }

      if (oldRef && oldSnap && oldSnap.exists() && oldSnap.data()?.uid === user.uid) {
        tx.delete(oldRef);
      }

      tx.set(newRef, {
        uid: user.uid,
        name: cleanNew,
        updatedAt: serverTimestamp(),
      });
    });
    return cleanNew;
  } catch (error) {
    if (error instanceof Error && (error.message === 'NAME_TAKEN' || error.message === 'NAME_INVALID')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function ensureUniqueCloudUsername(
  user: User,
  preferredName: string,
  oldName?: string | null
): Promise<string> {
  let base = preferredName.trim().slice(0, 14);
  if (!base || isReservedPlayerName(base)) {
    const fallback = (user.displayName || '').trim().slice(0, 14);
    base = fallback && !isReservedPlayerName(fallback) ? fallback : 'Oyuncu';
  }

  for (let attempt = 0; attempt < 15; attempt++) {
    const suffix =
      attempt === 0
        ? ''
        : attempt <= 9
          ? `_${attempt}`
          : `_${Math.floor(10 + Math.random() * 89)}`;
    const candidate = `${base.slice(0, Math.max(1, 14 - suffix.length))}${suffix}`;
    try {
      return await claimUniqueUsername(user, candidate, attempt === 0 ? oldName : null);
    } catch (err) {
      if (err instanceof Error && err.message === 'NAME_TAKEN') {
        continue;
      }
      throw err;
    }
  }
  const randSuffix = `_${String(Math.floor(100 + Math.random() * 899))}`;
  const lastTry = `${base.slice(0, Math.max(1, 14 - randSuffix.length))}${randSuffix}`;
  return claimUniqueUsername(user, lastTry, oldName);
}

function sanitizeProfilePayload(user: User, p: CloudProfileFields) {
  const ownedClean = Array.from(
    new Set(
      ['classic', ...(Array.isArray(p.owned) ? p.owned : [])]
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
        .map((id) => id.slice(0, 32))
    )
  ).slice(0, 100);

  const colorsClean = [0, 1, 2, 3].map((idx) => {
    const c = Array.isArray(p.colors) ? p.colors[idx] : undefined;
    return typeof c === 'string' && c.length > 0 ? c.slice(0, 16) : '#3b82f6';
  });

  const cleanSlot = (slot?: { outfit?: string; hat?: string | null; accessory?: string | null }) => ({
    outfit: typeof slot?.outfit === 'string' && slot.outfit ? slot.outfit.slice(0, 32) : 'classic',
    hat: typeof slot?.hat === 'string' && slot.hat ? slot.hat.slice(0, 32) : null,
    accessory: typeof slot?.accessory === 'string' && slot.accessory ? slot.accessory.slice(0, 32) : null,
  });

  const clamp01 = (v: number, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : fallback;

  return {
    name: String(p.name || '').trim().slice(0, 32),
    email: user.email ? String(user.email).slice(0, 160) : null,
    photoURL: user.photoURL ? String(user.photoURL).slice(0, 512) : null,
    coins: Math.max(0, Math.min(10000000, Math.floor(Number(p.coins) || 0))),
    matches: Math.max(0, Math.min(1000000, Math.floor(Number(p.matches) || 0))),
    owned: ownedClean,
    equipped: {
      '0': cleanSlot(p.equipped?.['0']),
      '1': cleanSlot(p.equipped?.['1']),
      '2': cleanSlot(p.equipped?.['2']),
      '3': cleanSlot(p.equipped?.['3']),
    },
    colors: colorsClean,
    muted: !!p.muted,
    volume: clamp01(p.volume, 0.8),
    musicVolume: clamp01(p.musicVolume, 0.4),
    musicMuted: !!p.musicMuted,
    battleVolume: clamp01(p.battleVolume, 0.4),
    battleMuted: !!p.battleMuted,
    shakeEnabled: p.shakeEnabled !== false,
    joystickSize:
      p.joystickSize === 'small' || p.joystickSize === 'large' ? p.joystickSize : ('normal' as const),
  };
}

export async function signInWithGoogleAccount(): Promise<User> {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function signOutGoogleAccount(): Promise<void> {
  await signOut(auth);
}

export function subscribeAuthState(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

export async function fetchUserProfile(uid: string): Promise<CloudUserDoc | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as CloudUserDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createUserProfile(user: User, profile: CloudProfileFields): Promise<void> {
  const path = `users/${user.uid}`;
  const clean = sanitizeProfilePayload(user, profile);
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      ...clean,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function saveUserProfile(user: User, profile: CloudProfileFields): Promise<void> {
  const path = `users/${user.uid}`;
  const clean = sanitizeProfilePayload(user, profile);
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
