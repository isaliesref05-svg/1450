import { PartyEconomy } from './economy';

type SfxName = 'shot' | 'boom' | 'hit' | 'coin' | 'buy' | 'error' | 'jump' | 'portal';

class AudioController {
  private ac: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private musicEl: HTMLAudioElement | null = null;
  private battleEl: HTMLAudioElement | null = null;
  private musicGain: GainNode | null = null;
  private battleGain: GainNode | null = null;
  private lastShot = 0;
  private lastHit = 0;
  private musicStarted = false;
  private inGame = false;
  private listenersBound = false;

  init() {
    if (typeof window === 'undefined' || this.listenersBound) return;
    this.listenersBound = true;

    this.musicEl = new Audio('/assets/aistudio/background-music_78e9cc1f.mp3');
    this.musicEl.loop = true;
    this.musicEl.preload = 'auto';

    this.battleEl = new Audio('/assets/aistudio/battle-music_9f546401.mp3');
    this.battleEl.loop = true;
    this.battleEl.preload = 'auto';

    const unlock = () => {
      this.musicStarted = true;
      this.ensure();
    };
    document.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('keydown', unlock, { passive: true });
    document.addEventListener('touchstart', unlock, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.musicEl?.pause();
        this.battleEl?.pause();
      } else if (this.musicStarted) {
        this.ensure();
      }
    });
  }

  setInGame(active: boolean) {
    this.inGame = active;
    this.syncMusic();
  }

  ensure = () => {
    if (typeof window === 'undefined') return;
    if (!this.ac) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        this.ac = new AC();
        this.master = this.ac.createGain();
        this.master.gain.value = PartyEconomy.isMuted() ? 0 : PartyEconomy.volume();
        this.master.connect(this.ac.destination);

        if (this.musicEl && this.battleEl) {
          this.musicGain = this.ac.createGain();
          this.ac.createMediaElementSource(this.musicEl).connect(this.musicGain).connect(this.ac.destination);
          this.battleGain = this.ac.createGain();
          this.ac.createMediaElementSource(this.battleEl).connect(this.battleGain).connect(this.ac.destination);
        }

        this.noiseBuf = this.ac.createBuffer(1, this.ac.sampleRate * 0.5, this.ac.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      } catch {
        this.ac = null;
      }
    }
    if (this.ac && this.ac.state === 'suspended') {
      this.ac.resume().catch(() => {});
    }
    this.syncMusic();
  };

  syncMusic() {
    if (!this.musicEl || !this.battleEl) return;
    const tracks: Array<[HTMLAudioElement, GainNode | null, number, boolean]> = [
      [this.musicEl, this.musicGain, PartyEconomy.isMusicMuted() ? 0 : PartyEconomy.musicVolume(), !this.inGame],
      [this.battleEl, this.battleGain, PartyEconomy.isBattleMuted() ? 0 : PartyEconomy.battleVolume(), this.inGame],
    ];
    for (const [track, gain, vol, active] of tracks) {
      if (gain) gain.gain.value = vol;
      else track.volume = vol;

      if (!this.musicStarted || document.hidden || !active || vol === 0) {
        if (!track.paused) track.pause();
        continue;
      }
      if (this.ac && this.ac.state !== 'running') {
        this.ac.resume().catch(() => {});
      }
      if (track.paused) {
        track.play().catch(() => {});
      }
    }
  }

  private env(g: GainNode, t0: number, a: number, peak: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  private tone(freq: number, dur: number, type: OscillatorType, peak: number, slide?: number) {
    if (!this.ac || !this.master) return;
    const o = this.ac.createOscillator();
    const g = this.ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ac.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, this.ac.currentTime + dur);
    this.env(g, this.ac.currentTime, 0.008, peak, dur);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ac.currentTime + dur + 0.02);
  }

  private noise(dur: number, peak: number, freq: number) {
    if (!this.ac || !this.master || !this.noiseBuf) return;
    const s = this.ac.createBufferSource();
    const g = this.ac.createGain();
    const f = this.ac.createBiquadFilter();
    s.buffer = this.noiseBuf;
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, this.ac.currentTime);
    f.frequency.exponentialRampToValueAtTime(120, this.ac.currentTime + dur);
    this.env(g, this.ac.currentTime, 0.005, peak, dur);
    s.connect(f).connect(g).connect(this.master);
    s.start();
    s.stop(this.ac.currentTime + dur + 0.02);
  }

  play(name: SfxName) {
    if (PartyEconomy.isMuted()) return;
    this.ensure();
    if (!this.ac || this.ac.state !== 'running') return;
    const now = performance.now();
    if (name === 'shot') {
      if (now - this.lastShot < 70) return;
      this.lastShot = now;
      this.noise(0.09, 0.12, 2400);
      this.tone(320, 0.07, 'square', 0.05, 120);
    } else if (name === 'boom') {
      this.noise(0.45, 0.35, 900);
      this.tone(90, 0.4, 'sine', 0.25, 40);
    } else if (name === 'hit') {
      if (now - this.lastHit < 90) return;
      this.lastHit = now;
      this.tone(180, 0.08, 'triangle', 0.1, 90);
    } else if (name === 'coin') {
      this.tone(880, 0.12, 'sine', 0.14);
      setTimeout(() => {
        if (!PartyEconomy.isMuted() && this.ac && this.ac.state === 'running') {
          this.tone(1320, 0.18, 'sine', 0.14);
        }
      }, 90);
    } else if (name === 'buy') {
      this.tone(520, 0.1, 'triangle', 0.12);
      setTimeout(() => {
        if (!PartyEconomy.isMuted() && this.ac && this.ac.state === 'running') {
          this.tone(780, 0.16, 'triangle', 0.12);
        }
      }, 80);
    } else if (name === 'jump') {
      this.tone(240, 0.09, 'sine', 0.07, 460);
    } else if (name === 'portal') {
      this.tone(420, 0.15, 'sine', 0.1, 920);
    } else if (name === 'error') {
      this.tone(140, 0.16, 'sawtooth', 0.08, 90);
    }
  }

  toggleSfx(): boolean {
    const muted = !PartyEconomy.isMuted();
    PartyEconomy.setMuted(muted);
    if (this.master) this.master.gain.value = muted ? 0 : PartyEconomy.volume();
    if (!muted) {
      this.ensure();
      this.play('buy');
    }
    return muted;
  }

  setSfxVolume(v: number) {
    PartyEconomy.setVolume(v);
    if (this.master) this.master.gain.value = PartyEconomy.isMuted() ? 0 : PartyEconomy.volume();
  }

  setMusicVolume(v: number) {
    PartyEconomy.setMusicVolume(v);
    this.syncMusic();
  }

  toggleMusic() {
    PartyEconomy.setMusicMuted(!PartyEconomy.isMusicMuted());
    this.syncMusic();
  }

  setBattleVolume(v: number) {
    PartyEconomy.setBattleVolume(v);
    this.syncMusic();
  }

  toggleBattleMusic() {
    PartyEconomy.setBattleMuted(!PartyEconomy.isBattleMuted());
    this.syncMusic();
  }
}

export const PartyAudio = new AudioController();
