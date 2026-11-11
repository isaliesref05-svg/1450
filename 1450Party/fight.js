/* Stickman Party - Stick Fight style VS engine (side view, physics, weapons, maps) */
(function () {
const W = 1280, H = 720, GRAV = 0.55;
const WD = { fist:{cd:16,dur:10,hit:4}, sword:{cd:22,dur:14,hit:6}, hammer:{cd:60,dur:28,hit:15}, spear:{cd:46,dur:10,hit:5}, gun:{cd:16,dur:8}, smg:{cd:4,dur:3}, shotgun:{cd:48,dur:12}, bow:{cd:42,dur:10}, bomb:{cd:56,dur:10}, mine:{cd:70,dur:8}, sniper:{cd:90,dur:14}, rocket:{cd:78,dur:14}, flame:{cd:3,dur:4}, axe:{cd:40,dur:20,hit:10}, laser:{cd:12,dur:6}, shuriken:{cd:30,dur:8}, staff:{cd:50,dur:12}, frost:{cd:20,dur:8}, tesla:{cd:44,dur:10}, rifle:{cd:6,dur:4}, minigun:{cd:2,dur:3}, grenade:{cd:64,dur:12}, chainsaw:{cd:5,dur:5,hit:1}, boomerang:{cd:36,dur:8}, katana:{cd:12,dur:9,hit:3} };
const ME = { sword:{d:18,kx:8,ky:-4,r:66}, hammer:{d:38,kx:18,ky:-9,r:62}, fist:{d:7,kx:5,ky:-2,r:44}, axe:{d:26,kx:13,ky:-7,r:58}, katana:{d:11,kx:6,ky:-3,r:74}, chainsaw:{d:5,kx:2,ky:-1,r:50} };
const AM = { fist:Infinity, sword:30, hammer:12, spear:10, gun:28, smg:44, shotgun:10, bow:16, bomb:5, mine:4, sniper:6, rocket:5, flame:120, axe:16, laser:34, shuriken:14, staff:10, frost:22, tesla:12, rifle:40, minigun:150, grenade:6, chainsaw:90, boomerang:10, katana:24 };
const LIM = new Set(['flame','mine']);
const MUZ = { gun:34, smg:36, shotgun:46, sniper:64, rocket:44, laser:36, frost:42, flame:38, staff:66, tesla:46, rifle:56, minigun:60, grenade:58 };
const MUZC = { gun:'#ffd54a', smg:'#ffd54a', shotgun:'#ffb02e', sniper:'#ff6a6a', rocket:'#ffb347', laser:'#4ff', frost:'#9df', flame:'#ff9a2e', staff:'#d58bff', tesla:'#8ff', rifle:'#ffd54a', minigun:'#ffd54a', grenade:'#ffb347' };
const CAS = new Set(['gun','smg','rifle','minigun','sniper','shotgun']);
const PC = { L:'#5ff', H:'#cfd8e0', O:'#c6f', Z:'#9df' };
const jag = (x1,y1,x2,y2) => { const n=10, dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L, q=[[x1,y1]]; for (let k=1;k<n;k++){ const o=Math.random()*22-11; q.push([x1+dx*k/n+nx*o, y1+dy*k/n+ny*o]); } q.push([x2,y2]); return q; };
const bp = b => { ctx.beginPath(); if (b.pts) b.pts.forEach((q,i) => i ? ctx.lineTo(q[0],q[1]) : ctx.moveTo(q[0],q[1])); else { ctx.moveTo(b.x1,b.y1); ctx.lineTo(b.x2,b.y2); } ctx.stroke(); };
const LOOTW = { sword:10, hammer:7, spear:8, gun:10, smg:8, shotgun:8, bow:7, bomb:8, mine:5, sniper:5, rocket:4, flame:6, axe:8, laser:8, shuriken:7, staff:6, frost:6, tesla:6, rifle:8, minigun:5, grenade:4, chainsaw:5, boomerang:6, katana:8 };
const DM = { b:11, p:8, F:3, s:4, A:30, S:32, L:12, H:8, O:22, Z:5, r:8, m:2.6 }, KB = { b:4, p:2.5, F:1, s:1.2, A:6, S:9, L:3, H:2, O:9, Z:1, r:2.2, m:.8 };
const ICON = { fist:'👊', sword:'🗡️', gun:'🔫', bomb:'💣', hammer:'🔨', shotgun:'💥', sniper:'🎯', rocket:'🚀', flame:'🔥', spear:'🔱', bow:'🏹', smg:'💨', mine:'🧨', axe:'🪓', laser:'🛸', shuriken:'🌟', staff:'🔮', frost:'❄️', tesla:'⚡', rifle:'🔰', minigun:'⚙️', grenade:'🍍', chainsaw:'🪚', boomerang:'🪃', katana:'⚔️' };
const MAPS = {
  arena:{ name:'Qar adaları', style:'snow', pl:[[480,560,320,50],[150,430,190,40],[940,430,190,40],[330,300,150,36],[800,300,150,36],[560,190,160,36],[40,280,90,36],[1150,280,90,36]], sp:[[1,.5],[2,.5],[3,.5],[4,.5]] },
  castle:{ name:'Zəncirli körpü', style:'chain', pl:[[230,520,820,44],[60,360,150,32],[1070,360,150,32],[520,330,240,30]], sp:[[1,.5],[2,.5],[0,.3],[0,.7]],
    bars:[[-30,20,330,270],[1310,20,950,270]] },
  platforms:{ name:'Neon şəhər', style:'neon', pl:[[0,600,360,120],[920,600,360,120],[450,470,380,34],[100,360,200,30],[980,360,200,30],[300,230,180,28],[800,230,180,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]], pads:[[180,600,80],[1100,600,80]] },
  lava:{ name:'Lava', style:'lava', pl:[[100,520,260,36],[920,520,260,36],[500,430,280,36],[250,310,200,36],[830,310,200,36],[520,190,240,36]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]], lava:true },
  space:{ name:'Kosmos', style:'space', g:.3, js:.74, pl:[[80,520,200,40],[1000,520,200,40],[520,420,240,40],[250,300,160,34],[870,300,160,34],[560,170,160,34],[30,200,100,30],[1150,200,100,30]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  forest:{ name:'Meşə', style:'forest', pl:[[0,570,420,150],[540,570,200,150],[860,570,420,150],[150,420,200,30],[930,420,200,30],[520,330,240,30],[300,210,160,28],[820,210,160,28]], sp:[[0,.5],[2,.5],[3,.5],[4,.5]] },
  sky:{ name:'Göy adaları', style:'sky', pl:[[80,500,260,34],[940,500,260,34],[500,410,280,34],[230,290,180,30],[870,290,180,30],[540,170,200,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  factory:{ name:'Zavod', style:'factory', pl:[[100,560,420,50],[760,560,420,50],[430,430,420,34],[60,320,200,30],[1020,320,200,30],[500,230,280,28]], sp:[[0,.3],[1,.7],[3,.5],[4,.5]], belts:[[2,1],[5,-1]] },
  graveyard:{ name:'Qəbiristanlıq', style:'graveyard', pl:[[0,590,300,130],[380,590,520,130],[980,590,300,130],[200,430,200,30],[880,430,200,30],[540,330,200,28],[60,260,160,28],[1060,260,160,28]], sp:[[0,.5],[2,.5],[3,.5],[4,.5]] },
  desert:{ name:'Səhra', style:'desert', pl:[[0,580,520,140],[760,580,520,140],[300,430,200,34],[780,430,200,34],[540,300,200,30],[60,300,150,28],[1070,300,150,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  ocean:{ name:'Dəniz dibi', style:'ocean', g:.4, js:.85, pl:[[100,540,300,40],[880,540,300,40],[490,430,300,34],[220,310,180,30],[880,310,180,30],[540,190,200,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  sakura:{ name:'Sakura məbədi', style:'sakura', pl:[[60,560,360,40],[860,560,360,40],[450,440,380,34],[160,320,200,30],[920,320,200,30],[540,200,200,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  rooftop:{ name:'Dam üstü', style:'rooftop', pl:[[60,560,300,160],[920,560,300,160],[440,470,400,40],[150,360,180,30],[950,360,180,30],[520,250,240,30],[30,220,100,28],[1150,220,100,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  candy:{ name:'Şirniyyat', style:'candy', pl:[[80,540,300,36],[900,540,300,36],[480,440,320,36],[240,320,190,32],[850,320,190,32],[550,200,180,30]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  icecave:{ name:'Buz mağarası', style:'ice', fr:.975, pl:[[0,600,380,120],[900,600,380,120],[420,500,440,36],[120,380,220,30],[940,380,220,30],[500,270,280,30],[60,250,140,28],[1080,250,140,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  retro:{ name:'Retro dalğa', style:'retro', pl:[[100,560,320,34],[860,560,320,34],[450,450,380,30],[200,330,200,28],[880,330,200,28],[540,220,200,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] },
  mars:{ name:'Mars', style:'mars', g:.32, js:.78, pl:[[60,540,260,40],[960,540,260,40],[500,440,280,36],[240,310,180,32],[860,310,180,32],[540,190,200,30],[40,380,110,28],[1130,380,110,28]], sp:[[0,.5],[1,.5],[3,.5],[4,.5]] }
};
['castle','platforms','forest','factory','graveyard','desert','ocean','icecave'].forEach(k => MAPS[k].walls = true);
const F = { on:false, raf:0, netRole:null };
let M, bg, fs = [], beams = [], parts = [], debris = [], proj = [], crates = [], fx = [], t = 0, shake = 0, banner = 0, bannerTxt = '', cd = 0, over = false, lavaY = 760, crateT = 0, snow = [], cfg = {};
let sc = 1, ox = 0, oy = 0;
const rnd = (a, b) => a + Math.random() * (b - a);
const rndMap = () => { const k = Object.keys(MAPS); return k[Math.floor(Math.random() * k.length)]; };
const rndWep = () => { const ks = Object.keys(LOOTW); let r = Math.random() * ks.reduce((a, k) => a + LOOTW[k], 0); for (const k of ks) { r -= LOOTW[k]; if (r <= 0) return k; } return 'sword'; };
function giveWeapon(f, w) { f.weapon = w; f.empty = false; f.ammo = (cfg.loot || LIM.has(w)) ? AM[w] : Infinity; }
let Mkey = 'arena';
function setMap(k) { Mkey = MAPS[k] ? k : 'arena'; M = MAPS[Mkey]; bg = buildBG(M.style); }

function seeded(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
function buildBG(style) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = seeded(7);
  const cols = { snow:['#070c24','#1c2b57'], chain:['#3a3224','#74623e'], ball:['#34301f','#6d5c3c'], lava:['#150404','#4a1410'], neon:['#0a0420','#35104f'], space:['#02030d','#150a35'], forest:['#04120f','#10402f'], sky:['#2e1a63','#ff9a62'], factory:['#17151a','#4b3424'], graveyard:['#0c0a1e','#3b2452'], desert:['#f08a3c','#ffd88a'], ocean:['#03243a','#0b7090'], sakura:['#2a1236','#e57fa6'], rooftop:['#05060f','#1d2447'], candy:['#ffb6e1','#8fd3ff'], ice:['#031a24','#0f4a5c'], retro:['#12002b','#ff3f9f'], mars:['#2a0e08','#c4562c'] }[style];
  const gr = g.createLinearGradient(0,0,0,H); gr.addColorStop(0,cols[0]); gr.addColorStop(1,cols[1]); g.fillStyle = gr; g.fillRect(0,0,W,H);
  if (style === 'snow') { for (let i=0;i<120;i++){ g.fillStyle='rgba(255,255,255,'+rnd(.2,.8)+')'; g.fillRect(r()*W,r()*H*.8,1.6,1.6);} const mg=g.createRadialGradient(900,150,10,900,150,220); mg.addColorStop(0,'rgba(200,220,255,.5)'); mg.addColorStop(1,'rgba(200,220,255,0)'); g.fillStyle=mg; g.fillRect(600,0,600,400); }
  if (style === 'lava') { const vg=g.createRadialGradient(640,720,50,640,720,500); vg.addColorStop(0,'rgba(255,90,20,.45)'); vg.addColorStop(1,'rgba(255,90,20,0)'); g.fillStyle=vg; g.fillRect(0,0,W,H); }
  if (style === 'space') { for (let i=0;i<280;i++){ g.fillStyle='rgba(255,255,255,'+(.2+r()*.8)+')'; const z=r()<.1?2.4:1.2; g.fillRect(r()*W,r()*H,z,z);} [[300,200,420,'rgba(120,60,255,.28)'],[950,450,380,'rgba(255,60,160,.2)'],[700,100,300,'rgba(40,160,255,.2)']].forEach(([x,y,rad,c])=>{ const n=g.createRadialGradient(x,y,0,x,y,rad); n.addColorStop(0,c); n.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=n; g.fillRect(0,0,W,H); });
    const pg=g.createRadialGradient(1020,150,10,1020,150,90); pg.addColorStop(0,'#ffcf8a'); pg.addColorStop(1,'#a8432c'); g.fillStyle=pg; g.beginPath(); g.arc(1020,150,90,0,6.3); g.fill(); g.strokeStyle='rgba(255,220,170,.5)'; g.lineWidth=6; g.beginPath(); g.ellipse(1020,150,150,28,-.3,0,6.3); g.stroke(); }
  if (style === 'neon') { const sg=g.createLinearGradient(0,200,0,470); sg.addColorStop(0,'#ffe14a'); sg.addColorStop(1,'#ff2bd6'); g.fillStyle=sg; g.beginPath(); g.arc(640,400,150,0,6.3); g.fill(); g.fillStyle='#240a45'; for(let k=0;k<7;k++) g.fillRect(480,360+k*22,320,3+k*1.5);
    for (let x=-20;x<W;x+=64){ const w=46+r()*36, h=170+r()*290, y=H-h; g.fillStyle='#0b0524'; g.fillRect(x,y,w,h); g.fillStyle='rgba(255,255,255,.04)'; g.fillRect(x,y,4,h); for(let k=0;k<26;k++){ if(r()<.45){ g.fillStyle=['#00f0ff','#ff2bd6','#ffe14a'][Math.floor(r()*3)]; g.globalAlpha=.7; g.fillRect(x+6+r()*(w-14),y+10+r()*(h-20),4,5); g.globalAlpha=1; } } } }
  if (style === 'forest') { const mg=g.createRadialGradient(420,140,5,420,140,200); mg.addColorStop(0,'rgba(230,255,220,.9)'); mg.addColorStop(.2,'rgba(190,240,200,.35)'); mg.addColorStop(1,'rgba(190,240,200,0)'); g.fillStyle=mg; g.fillRect(150,0,600,360); g.fillStyle='#e9ffe4'; g.beginPath(); g.arc(420,140,34,0,6.3); g.fill(); }
  if (style === 'sky') { const sg=g.createRadialGradient(640,470,10,640,470,260); sg.addColorStop(0,'#fff2b0'); sg.addColorStop(.3,'rgba(255,200,120,.8)'); sg.addColorStop(1,'rgba(255,150,90,0)'); g.fillStyle=sg; g.fillRect(300,200,700,500); g.fillStyle='rgba(60,20,90,.35)'; for(let i=0;i<5;i++){ g.beginPath(); g.ellipse(100+i*280,640,260,70,0,0,6.3); g.fill(); } }
  if (style === 'factory') { g.fillStyle='rgba(255,120,30,.18)'; g.fillRect(0,560,W,160); for(let i=0;i<4;i++){ const y=60+i*130; const pg=g.createLinearGradient(0,y,0,y+26); pg.addColorStop(0,'#59606b'); pg.addColorStop(1,'#22262c'); g.fillStyle=pg; g.fillRect(0,y,W,26); g.fillStyle='rgba(0,0,0,.4)'; for(let x=40;x<W;x+=160) g.fillRect(x,y-4,12,34); }
    g.strokeStyle='rgba(0,0,0,.45)'; g.lineWidth=10; g.setLineDash([8,8]); [[200,300,90],[1040,220,70],[640,380,60]].forEach(([x,y,rad])=>{ g.beginPath(); g.arc(x,y,rad,0,6.3); g.stroke(); }); g.setLineDash([]); }
  if (style === 'graveyard') { const mg=g.createRadialGradient(900,140,5,900,140,190); mg.addColorStop(0,'rgba(255,240,255,.9)'); mg.addColorStop(.25,'rgba(210,180,255,.35)'); mg.addColorStop(1,'rgba(210,180,255,0)'); g.fillStyle=mg; g.fillRect(600,0,600,340); g.fillStyle='#f4ecff'; g.beginPath(); g.arc(900,140,36,0,6.3); g.fill();
    g.fillStyle='rgba(0,0,0,.55)'; for(let i=0;i<14;i++){ const x=30+i*92+r()*30, h=40+r()*40; g.beginPath(); g.moveTo(x,H); g.lineTo(x,H-h-130); g.arc(x+16,H-h-130,16,Math.PI,0); g.lineTo(x+32,H); g.fill(); } }
  if (style === 'desert') { const sg=g.createRadialGradient(900,210,10,900,210,300); sg.addColorStop(0,'#fff6c8'); sg.addColorStop(.25,'rgba(255,230,150,.6)'); sg.addColorStop(1,'rgba(255,200,100,0)'); g.fillStyle=sg; g.fillRect(500,0,800,500); g.fillStyle='#fff3b8'; g.beginPath(); g.arc(900,210,48,0,6.3); g.fill();
    g.fillStyle='rgba(120,55,20,.45)'; g.beginPath(); g.moveTo(120,580); g.lineTo(270,400); g.lineTo(420,580); g.fill(); g.beginPath(); g.moveTo(380,580); g.lineTo(470,470); g.lineTo(560,580); g.fill(); }
  if (style === 'ocean') { for (let i=0;i<6;i++){ const x=60+i*230; g.fillStyle='rgba(160,240,255,.07)'; g.beginPath(); g.moveTo(x,0); g.lineTo(x+90,0); g.lineTo(x-140,H); g.lineTo(x-230,H); g.fill(); }
    g.fillStyle='rgba(0,0,0,.25)'; for (let i=0;i<14;i++){ const x=r()*W, y=80+r()*420, s2=10+r()*16; g.beginPath(); g.ellipse(x,y,s2,s2*.45,0,0,6.3); g.fill(); g.beginPath(); g.moveTo(x+s2*.8,y); g.lineTo(x+s2*1.6,y-s2*.45); g.lineTo(x+s2*1.6,y+s2*.45); g.fill(); } }
  if (style === 'sakura') { const mg=g.createRadialGradient(360,170,5,360,170,220); mg.addColorStop(0,'rgba(255,230,240,.8)'); mg.addColorStop(1,'rgba(255,230,240,0)'); g.fillStyle=mg; g.fillRect(100,0,520,420); g.fillStyle='#ffe4ef'; g.beginPath(); g.arc(360,170,64,0,6.3); g.fill();
    g.fillStyle='rgba(110,18,30,.7)'; g.fillRect(520,300,26,300); g.fillRect(734,300,26,300); g.fillRect(470,296,340,24); g.fillRect(500,352,280,14); }
  if (style === 'rooftop') { const mg=g.createRadialGradient(950,130,5,950,130,200); mg.addColorStop(0,'rgba(200,215,255,.55)'); mg.addColorStop(1,'rgba(200,215,255,0)'); g.fillStyle=mg; g.fillRect(600,0,680,380); g.fillStyle='#dfe8ff'; g.beginPath(); g.arc(950,130,30,0,6.3); g.fill();
    for (let L=0;L<2;L++){ for (let x=-20;x<W;x+=(L?64:90)){ const w=(L?46:70)+r()*30, h=(L?150:230)+r()*(L?260:200), y=H-h; g.fillStyle=L?'#0a0d1f':'#12183a'; g.fillRect(x,y,w,h); for(let k=0;k<(L?20:14);k++){ if(r()<.5){ g.fillStyle=['#ffe27a','#7df','#ff7ad9'][Math.floor(r()*3)]; g.globalAlpha=.55; g.fillRect(x+5+r()*(w-14),y+8+r()*(h-20),4,6); g.globalAlpha=1; } } if(r()<.3){ g.fillStyle=L?'#0a0d1f':'#12183a'; g.fillRect(x+w/2,y-26,2,26); g.fillStyle='#f33'; g.fillRect(x+w/2-1,y-28,4,4); } } } }
  if (style === 'candy') { ['#ff6b6b','#ffb347','#ffe66b','#7be07b','#6bc7ff','#b58bff'].forEach((c,i)=>{ g.strokeStyle=c; g.globalAlpha=.35; g.lineWidth=16; g.beginPath(); g.arc(640,740,420-i*16,Math.PI,0); g.stroke(); }); g.globalAlpha=1;
    g.fillStyle='rgba(255,255,255,.8)'; for (let i=0;i<5;i++){ const cx=100+i*270+r()*50, cy=110+r()*110; [[0,0,38],[34,8,30],[-34,10,28],[14,-14,26]].forEach(([dx,dy,rad])=>{ g.beginPath(); g.arc(cx+dx,cy+dy,rad,0,6.3); g.fill(); }); }
    g.fillStyle='rgba(255,140,200,.55)'; g.beginPath(); g.moveTo(0,H); for(let x=0;x<=W;x+=40) g.lineTo(x,640+Math.sin(x*.012)*30); g.lineTo(W,H); g.fill();
    for (let i=0;i<7;i++){ const x=60+i*185+r()*60, h=130+r()*80, rad=34; g.strokeStyle='#f4eaff'; g.lineWidth=6; g.beginPath(); g.moveTo(x,H); g.lineTo(x,H-h); g.stroke(); const cl=['#ff4f9a','#ffd23f','#3fd0ff']; for(let k=0;k<3;k++){ g.fillStyle=cl[(k+i)%3]; g.beginPath(); g.moveTo(x,H-h-rad); g.arc(x,H-h-rad,rad,k*2.094,(k+1)*2.094); g.closePath(); g.fill(); } } }
  if (style === 'ice') { for(let i=0;i<14;i++){ const x=i*100+r()*40, h=60+r()*140; const sg=g.createLinearGradient(0,0,0,h); sg.addColorStop(0,'#04202b'); sg.addColorStop(1,'#1d6f86'); g.fillStyle=sg; g.beginPath(); g.moveTo(x,-5); g.lineTo(x+60,-5); g.lineTo(x+30,h); g.fill(); }
    for(let i=0;i<9;i++){ const x=40+i*150+r()*80, y=H-80-r()*40, h=60+r()*100; const cg=g.createLinearGradient(x,y-h,x,y); cg.addColorStop(0,'rgba(180,250,255,.9)'); cg.addColorStop(1,'rgba(40,150,200,.35)'); g.fillStyle=cg; g.beginPath(); g.moveTo(x,y); g.lineTo(x+8,y-h); g.lineTo(x+22,y-h*.6); g.lineTo(x+30,y); g.fill(); }
    const gl=g.createRadialGradient(640,300,10,640,300,420); gl.addColorStop(0,'rgba(120,230,255,.22)'); gl.addColorStop(1,'rgba(120,230,255,0)'); g.fillStyle=gl; g.fillRect(0,0,W,H); }
  if (style === 'retro') { for(let i=0;i<120;i++){ g.fillStyle='rgba(255,255,255,'+(r()*.8)+')'; g.fillRect(r()*W,r()*360,1.6,1.6); }
    const sg=g.createLinearGradient(0,250,0,590); sg.addColorStop(0,'#ffe14a'); sg.addColorStop(.55,'#ff7a3a'); sg.addColorStop(1,'#ff2bd6'); g.fillStyle=sg; g.beginPath(); g.arc(640,420,170,0,6.3); g.fill(); g.fillStyle='#12002b'; for(let k=0;k<7;k++) g.fillRect(460,430+k*22,360,4+k*2.4);
    g.fillStyle='#12002b'; g.fillRect(0,520,W,200); g.strokeStyle='rgba(255,60,200,.55)'; g.lineWidth=1.4; for(let i=-14;i<=14;i++){ g.beginPath(); g.moveTo(640+i*30,520); g.lineTo(640+i*150,H); g.stroke(); }
    g.strokeStyle='#00f0ff'; g.lineWidth=2; g.shadowColor='#00f0ff'; g.shadowBlur=10; g.beginPath(); g.moveTo(0,520); for(let x=0;x<=W;x+=80){ g.lineTo(x+40,520-30-r()*90); g.lineTo(x+80,520); } g.stroke(); g.shadowBlur=0;
    g.strokeStyle='#ff2bd6'; g.lineWidth=3; g.beginPath(); g.moveTo(0,520); g.lineTo(W,520); g.stroke(); }
  if (style === 'mars') { for(let i=0;i<120;i++){ g.fillStyle='rgba(255,230,210,'+(.2+r()*.5)+')'; g.fillRect(r()*W,r()*300,1.4,1.4); }
    const pg=g.createRadialGradient(330,160,6,330,160,80); pg.addColorStop(0,'#fff1e6'); pg.addColorStop(1,'#a08a85'); g.fillStyle=pg; g.beginPath(); g.arc(330,160,70,0,6.3); g.fill(); g.fillStyle='rgba(0,0,0,.18)'; [[310,150,16],[350,180,10],[320,190,8]].forEach(([x,y,rad])=>{ g.beginPath(); g.arc(x,y,rad,0,6.3); g.fill(); });
    g.fillStyle='#d9c2a8'; g.beginPath(); g.arc(900,110,22,0,6.3); g.fill();
    for(let L=0;L<3;L++){ g.fillStyle=['rgba(90,25,10,.5)','rgba(70,18,8,.65)','rgba(45,10,5,.85)'][L]; g.beginPath(); g.moveTo(0,H); let y=420+L*80; for(let x=0;x<=W;x+=50){ y=Math.max(330+L*70,Math.min(600,y+(r()-.5)*90)); g.lineTo(x,y); } g.lineTo(W,H); g.fill(); } }
  const flat = ['space','neon','sky','factory','ocean','rooftop','candy','ice','retro','mars'].includes(style);
  for (let L=0; L<(flat?0:3); L++) { g.fillStyle = ['rgba(0,0,0,.18)','rgba(0,0,0,.28)','rgba(0,0,0,.4)'][L]; g.beginPath(); g.moveTo(0,H); let y=380+L*70; for (let x=0;x<=W;x+=40){ y=Math.max(260+L*60,Math.min(520,y+(r()-.5)*70)); g.lineTo(x,y);} g.lineTo(W,H); g.fill(); }
  if (style === 'chain') { g.fillStyle='rgba(0,0,0,.35)'; for (let x=0;x<W;x+=60){ g.fillRect(x,300+(x%120?0:-26),44,200);} }
  g.strokeStyle='rgba(0,0,0,.6)'; g.lineWidth=4; g.lineCap='round';
  for (let i=0;i<(flat?0:style==='forest'?13:7);i++){ const x=60+i*190+r()*80, y=H-40-(style==='ball'?150:0); g.beginPath(); g.moveTo(x,y); g.lineTo(x+(r()-.5)*20,y-110); for(let k=0;k<4;k++){ const yy=y-40-k*20; g.moveTo(x,yy); g.lineTo(x+(r()-.5)*70,yy-35);} g.stroke(); }
  if (style === 'ball') { g.fillStyle='#07072a'; g.fillRect(0,570,W,150); g.fillStyle='rgba(255,255,255,.07)'; for(let i=0;i<40;i++) g.fillRect(r()*W,590+r()*120,34,12); }
  return c;
}

function spawnFighter(i, wep) {
  const s = M.sp[i], p = M.pl[s[0]];
  return { index:i, color:PLAYER_COLORS[i], x:p[0]+p[2]*s[1], y:p[1]-26, vx:0, vy:0, hw:11, hh:26, dir:i%2?-1:1, aim:i%2?Math.PI:0, va:i%2?Math.PI:0, fs:i%2?-1:1, hp:100, alive:true, ground:false, jumps:2, jh:false,
    weapon:wep, fuel:130, cd:0, atkT:0, atkP:0, hitDone:true, phase:0, inv:0, shield:90, empty:false, ammo:Infinity, base:'sword', flash:0, recoil:0, slow:0, mf:0, sq:0, score:(players[i]?players[i].score:0) };
}
function newRound() {
  resetInputs();
  if (cfg.rndMap) setMap(rndMap());
  beams=[]; proj=[]; parts=[]; debris=[]; crates=[]; fx=[]; crateT=cfg.loot?60:240; lavaY=760; over=false; banner=0;
  const keep = fs.map(f => f.weapon0 || f.weapon), sco = fs.map(f => f.score);
  fs = []; for (let i=0;i<cfg.n;i++){ let w0=cfg.loot?'fist':(cfg.weps[i]||'sword'); if(w0==='random') w0=rndWep(); const f=spawnFighter(i, w0); f.base=cfg.loot?'fist':(LIM.has(w0)?'sword':w0); giveWeapon(f,w0); f.weapon0=f.weapon; f.score=sco[i]||0; fs.push(f);} 
  players = fs; cd = 150; hud();
}
function hud() { for (let i=0;i<4;i++){ const e=document.getElementById('scoreP'+(i+1)); if(e) e.textContent = fs[i]?fs[i].score:0; if(i>=2){ const b=document.getElementById('badgeP'+(i+1)); if(b) b.classList.toggle('hidden', i>=cfg.n);} } }

F.start = function (map, n, rounds, weps) {
  if (window.PartyEconomy) window.PartyEconomy.beginMatch();
  if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
  cancelAnimationFrame(F.raf); clearTimeout(roundTimeout);
  const rm = map === 'random'; setMap(rm ? rndMap() : map);
  cfg = { n, rounds:rounds||3, weps:weps||[], rndMap:rm, loot:!!window.lootMode }; fs = []; players = [];
  currentMode='vs'; currentMinigame=''; playerCount=n; maxRounds=cfg.rounds; currentRound=1; paused=false; gameState='playing';
  canvas = document.getElementById('gameCanvas'); ctx = canvas.getContext('2d');
  const po=document.getElementById('pauseOverlay'); if(po) po.classList.remove('visible'); hideWinner();
  setupAllJoysticks(onlineMode ? 1 : n); showScreen('gameScreen');
  snow = Array.from({length:70}, () => ({x:rnd(0,W), y:rnd(0,H), s:rnd(.5,2), v:rnd(.3,1.2)}));
  newRound(); F.on = true; t = 0; F.last = 0; F.acc = 0; F.raf = requestAnimationFrame(loop);
};
F.stop = function () { F.on = false; cancelAnimationFrame(F.raf); };
F.restart = function () { if (window.PartyEconomy) window.PartyEconomy.beginMatch(); fs.forEach(f => f.score = 0); currentRound = 1; gameState = 'playing'; hideWinner(); newRound(); };
F.serialize = function () {
  return {
    map: Mkey, cfg: { n: cfg.n, rounds: cfg.rounds, loot: !!cfg.loot, rndMap: !!cfg.rndMap, weps: cfg.weps },
    fs, proj, beams, fx, crates,
    parts: parts.length > 140 ? parts.slice(parts.length - 140) : parts,
    debris: debris.length > 60 ? debris.slice(debris.length - 60) : debris,
    t, cd, over, banner, bannerTxt, bannerCol, lavaY,
    round: currentRound, gs: gameState
  };
};
F.apply = function (s) {
  if (!s) return;
  if (Mkey !== s.map) setMap(s.map);
  cfg = s.cfg; fs = s.fs; players = fs; proj = s.proj; beams = s.beams; fx = s.fx; crates = s.crates;
  parts = s.parts; debris = s.debris; t = s.t; cd = s.cd; over = s.over; banner = s.banner;
  bannerTxt = s.bannerTxt; bannerCol = s.bannerCol; lavaY = s.lavaY; currentRound = s.round;
  hud();
  if (s.gs === 'matchEnd') { if (gameState !== 'matchEnd') { gameState = 'matchEnd'; showWinner(); } }
  else { if (gameState === 'matchEnd') hideWinner(); gameState = s.gs; }
};

// ---------- helpers ----------
function burst(x, y, c, n, sp, life, g) { for (let i=0;i<n;i++){ const a=rnd(0,6.283), s=rnd(.3,1)*sp; parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,l:life,m:life,c,r:rnd(1.5,4),g}); } }
function kill(f) {
  if (!f.alive) return; f.alive = false; shake = Math.max(shake, 10);
  burst(f.x, f.y, f.color, 30, 7, 50, true); burst(f.x, f.y, '#d81b3c', 14, 5, 60, false);
  for (let i=0;i<6;i++) debris.push({x:f.x,y:f.y+rnd(-18,14),vx:f.vx+rnd(-5,5),vy:f.vy-rnd(2,8),a:rnd(0,6),va:rnd(-.3,.3),len:rnd(10,20),c:f.color});
}
function hurt(f, dmg, kx, ky, px, py, force) {
  if (!f.alive || f.shield > 0 || (f.inv > 0 && !force)) return;
  f.hp -= dmg; f.vx += kx; f.vy += ky; f.flash = 6; f.inv = force ? 2 : 6; shake = Math.max(shake, 3 + dmg / 6);
  if (window.PartyAudio) window.PartyAudio.play('hit');
  burst(px ?? f.x, py ?? f.y, '#d81b3c', 6, 4, 28, false); if (f.hp <= 0) kill(f);
}
function boom(x, y, owner, R = 130, D = 55) {
  if (window.PartyAudio) window.PartyAudio.play('boom');
  fx.push({x,y,t:0}); shake = 16; burst(x,y,'#ffb02e',40,9,45,true); burst(x,y,'#ff5a1f',25,6,40,true);
  for (const f of fs) { if (!f.alive) continue; const dx=f.x-x, dy=f.y-y, d=Math.hypot(dx,dy); if (d<R){ const k=1-d/R; f.inv=0; hurt(f, D*k, dx/(d||1)*16*k, dy/(d||1)*12*k-6*k, f.x, f.y);} }
}
const inRect = (x, y) => M.pl.some(p => x>p[0] && x<p[0]+p[2] && y>p[1] && y<p[1]+p[3]);
function segRect(x0,y0,x1,y1,r){ const dx=x1-x0, dy=y1-y0; let t0=0,t1=1; const p=[-dx,dx,-dy,dy], q=[x0-r[0], r[0]+r[2]-x0, y0-r[1], r[1]+r[3]-y0]; for(let i=0;i<4;i++){ if(p[i]===0){ if(q[i]<0) return false; } else { const t=q[i]/p[i]; if(p[i]<0){ if(t>t1) return false; if(t>t0) t0=t; } else { if(t<t0) return false; if(t<t1) t1=t; } } } return true; }
function segFighter(x0,y0,x1,y1,f,pad){ return segRect(x0,y0,x1,y1,[f.x-f.hw-pad,f.y-f.hh-pad,f.hw*2+pad*2,f.hh*2+pad*2]); }
function assistedAim(f){ const inp=inputPlayers[f.index]; if(inp && Math.hypot(inp.x,inp.y)>.35) return f.aim; let best=null,bs=1e9; for(const o of fs){ if(!o.alive||o===f) continue; const dx=o.x-f.x, dy=o.y-f.y, dist=Math.hypot(dx,dy); if(dist>560||dist<8) continue; let da=Math.atan2(dy,dx)-f.aim; while(da>Math.PI)da-=2*Math.PI; while(da<-Math.PI)da+=2*Math.PI; if(Math.abs(da)<.38){ const score=dist+Math.abs(da)*180; if(score<bs){bs=score;best=f.aim+da*.7;} } } return best===null?f.aim:best; }
function ov(f, p) { return f.x+f.hw>p[0] && f.x-f.hw<p[0]+p[2] && f.y+f.hh>p[1] && f.y-f.hh<p[1]+p[3]; }
function move(o) {
  o.x += o.vx; for (const p of M.pl) if (ov(o,p)) { const lift = o.y + o.hh - p[1]; if (o.jumps !== undefined && lift > 0 && lift <= 22) { o.y = p[1] - o.hh; if (o.vy > 0) o.vy = 0; continue; } if (o.vx>0) o.x=p[0]-o.hw; else if (o.vx<0) o.x=p[0]+p[2]+o.hw; o.vx = o.bounce ? -o.vx*.5 : 0; }
  { const pad = M.walls ? 16 : 0, lo = pad + o.hw, hi = W - pad - o.hw; if (o.x < lo) { o.x = lo; o.vx = o.bounce ? -o.vx * .5 : 0; } else if (o.x > hi) { o.x = hi; o.vx = o.bounce ? -o.vx * .5 : 0; } }
  o.y += o.vy; o.ground = false;
  for (const p of M.pl) if (ov(o,p)) { if (o.vy>0){ o.y=p[1]-o.hh; o.ground=true; o.vy = o.bounce && Math.abs(o.vy)>2 ? -o.vy*.45 : 0; } else { if (o.jumps !== undefined) { const l = o.x + o.hw - p[0], r = p[0] + p[2] - (o.x - o.hw); if (l > 0 && l <= 12) { o.x = p[0] - o.hw; continue; } if (r > 0 && r <= 12) { o.x = p[0] + p[2] + o.hw; continue; } } o.y=p[1]+p[3]+o.hh; o.vy = 0; } }
}

// ---------- weapons ----------
function attack0(f) {
  const wp = f.weapon, w = WD[wp], a = assistedAim(f), ax = Math.cos(a), ay = Math.sin(a), d = f.dir;
  f.cd = w.cd; f.atkT = w.dur; f.hitDone = false; f.atkWeapon = wp;
  const hx = f.x + ax * 18, hy = f.y - 8 + ay * 18, mx = n => hx + ax * n, my = n => hy + ay * n;
  const sh = (spd, spr) => { const b = a + rnd(-spr, spr); return [Math.cos(b) * spd, Math.sin(b) * spd]; };
  if (wp === 'gun') { const [vx, vy] = sh(16, .04); proj.push({x:mx(22),y:my(22),vx,vy,t:'b',o:f.index,l:52}); f.vx -= ax * 1.2; f.recoil = 1; burst(mx(28),my(28),'#ffd54a',5,3,8,true); }
  if (wp === 'shotgun') { for (let i = 0; i < 6; i++) { const [vx, vy] = sh(rnd(13, 17), .2); proj.push({x:mx(22),y:my(22),vx,vy,t:'p',o:f.index,l:22}); }
    f.vx -= ax * 11; f.vy -= ay * 9; f.recoil = 1; shake = Math.max(shake, 6); burst(mx(30),my(30),'#ffd54a',10,5,10,true); }
  if (wp === 'sniper') { let x = mx(30), y = my(30); const hit = new Set();
    for (let i = 0; i < 230; i++) { x += ax * 6; y += ay * 6; if (x < -10 || x > W + 10 || y < -60 || y > H + 60 || inRect(x, y)) break;
      for (const o of fs) if (o.alive && o !== f && !hit.has(o) && Math.abs(o.x - x) < o.hw + 3 && Math.abs(o.y - y) < o.hh) { hit.add(o); hurt(o, 55, ax * 15, ay * 10 - 4, x, y); } }
    beams.push({x1:mx(30),y1:my(30),x2:x,y2:y,l:14}); f.vx -= ax * 6; f.vy -= ay * 3; f.recoil = 1.5; shake = Math.max(shake, 7); burst(mx(34),my(34),'#ff6a6a',8,5,10,true); }
  if (wp === 'rocket') { proj.push({x:mx(24),y:my(24),vx:ax*7,vy:ay*7,t:'R',o:f.index,l:140}); f.vx -= ax * 2; f.recoil = 1; burst(mx(-10),my(-10),'#ddd',6,3,16,false); }
  if (wp === 'flame') { for (let k = 0; k < 2; k++) { const b = a + rnd(-.12, .12), s2 = rnd(5.5, 8); proj.push({x:mx(26),y:my(26),vx:Math.cos(b)*s2+f.vx*.3,vy:Math.sin(b)*s2,t:'F',o:f.index,l:24}); } }
  if (wp === 'smg') { const [vx, vy] = sh(15, .06); proj.push({x:mx(22),y:my(22),vx,vy,t:'s',o:f.index,l:36}); f.vx -= ax * 1.0; f.vy -= ay * .2; f.recoil = Math.min(1.6, f.recoil + .8); shake = Math.max(shake, 2.4); burst(mx(30),my(30),'#ffd54a',3,3,6,true); }
  if (wp === 'bow') { proj.push({x:mx(18),y:my(18)-2,vx:ax*13,vy:ay*13-1.2,t:'A',o:f.index,l:100}); f.recoil = .8; }
  if (wp === 'mine') { proj.push({x:f.x+d*14,y:f.y+8,vx:d*2.5,vy:-3,t:'M',o:f.index,l:1600,hw:6,hh:6,arm:45}); }
  if (wp === 'spear') { const [vx, vy] = sh(17, .02); proj.push({x:mx(30),y:my(30),vx,vy,t:'S',o:f.index,l:70}); f.recoil = .6; }
  if (MUZ[wp]) { f.mf = 4; if (CAS.has(wp)) window.PartyAudio && window.PartyAudio.play('shot'); }
  if (CAS.has(wp)) parts.push({x:hx+ax*6,y:hy-4,vx:-d*rnd(1,2.6)-ax*.5,vy:-rnd(2,4.5),l:34,m:34,c:'#e8c35a',r:2.6,g:false});
  if (wp === 'rifle') { const [vx, vy] = sh(18, .03); proj.push({x:mx(26),y:my(26),vx,vy,t:'r',o:f.index,l:48}); f.vx -= ax * 1.3; f.vy -= ay * .25; f.recoil = Math.min(1.8, f.recoil + .9); shake = Math.max(shake, 2.8); burst(mx(34),my(34),'#ffd54a',3,3,8,true); }
  if (wp === 'minigun') { const [vx, vy] = sh(17, .09); proj.push({x:mx(30),y:my(30),vx,vy,t:'m',o:f.index,l:38}); f.vx -= ax * 1.1; f.vy -= ay * .35; f.recoil = Math.min(1.8, f.recoil + .9); shake = Math.max(shake, 3.2); burst(mx(38),my(38),'#ffd54a',2,3,6,true); }
  if (wp === 'grenade') { proj.push({x:mx(30),y:my(30),vx:ax*11+f.vx*.3,vy:ay*11-2,t:'N',o:f.index,l:90,hw:7,hh:7,bounce:true}); f.vx -= ax * 3; f.vy -= ay * 1.5; f.recoil = 1.4; shake = Math.max(shake, 5); burst(mx(36),my(36),'#bbb',8,4,16,false); }
  if (wp === 'chainsaw') { f.recoil = .3; f.vx += ax * .8; }
  if (wp === 'katana') { f.vx += ax * 8; f.vy += ay * 2; }
  if (wp === 'boomerang') { proj.push({x:mx(16),y:my(16),vx:ax*12+f.vx*.3,vy:ay*12,t:'Y',o:f.index,l:200,age:0}); f.recoil = .3; }
  if (wp === 'axe') { f.vx += ax * 5; f.vy += ay * 2; }
  if (wp === 'laser') { const [vx, vy] = sh(20, .02); proj.push({x:mx(26),y:my(26),vx,vy,t:'L',o:f.index,l:50}); f.recoil = .5; burst(mx(34),my(34),'#4ff',4,3,8,true); }
  if (wp === 'shuriken') { for (const o of [-.16, 0, .16]) { const b = a + o; proj.push({x:mx(16),y:my(16),vx:Math.cos(b)*12,vy:Math.sin(b)*12,t:'H',o:f.index,l:60}); } f.recoil = .6; }
  if (wp === 'staff') { proj.push({x:mx(40),y:my(40),vx:ax*5,vy:ay*5,t:'O',o:f.index,l:150}); f.recoil = .8; burst(mx(40),my(40),'#d58bff',10,4,14,true); }
  if (wp === 'frost') { const [vx, vy] = sh(11, .05); proj.push({x:mx(30),y:my(30),vx,vy,t:'Z',o:f.index,l:60}); f.recoil = .6; burst(mx(34),my(34),'#9df',6,3,12,true); }
  if (wp === 'tesla') { const sx = mx(30), sy = my(30); let tg = null, bd = 1e9;
    for (const o of fs) if (o.alive && o !== f) { const dx = o.x - f.x, dy = o.y - f.y, pr = dx*ax + dy*ay, pp = Math.abs(dx*ay - dy*ax); if (pr > -10 && pr < 300 && pp < 54 && pr < bd) { bd = pr; tg = o; } }
    if (tg) { hurt(tg, 20, ax*8, ay*5 - 4, tg.x, tg.y); beams.push({x1:sx,y1:sy,x2:tg.x,y2:tg.y,l:12,c:'#8ff',pts:jag(sx,sy,tg.x,tg.y)});
      let t2 = null, b2 = 1e9; for (const o of fs) if (o.alive && o !== f && o !== tg) { const dd = Math.hypot(o.x - tg.x, o.y - tg.y); if (dd < 170 && dd < b2) { b2 = dd; t2 = o; } }
      if (t2) { hurt(t2, 12, Math.sign(t2.x - tg.x)*5, -4, t2.x, t2.y); beams.push({x1:tg.x,y1:tg.y,x2:t2.x,y2:t2.y,l:12,c:'#8ff',pts:jag(tg.x,tg.y,t2.x,t2.y)}); } }
    else { const ex = sx + ax*150, ey = sy + ay*150; beams.push({x1:sx,y1:sy,x2:ex,y2:ey,l:8,c:'#8ff',pts:jag(sx,sy,ex,ey)}); }
    f.recoil = .6; burst(sx,sy,'#8ff',6,4,10,true); shake = Math.max(shake, 3); }
  if (wp === 'sword') { f.vx += ax * 6; f.vy += ay * 3; } // lunge forward with the swing
  if (wp === 'bomb') { proj.push({x:hx,y:hy-6,vx:ax*7+f.vx*.5,vy:ay*7-5,t:'B',o:f.index,l:80,hw:7,hh:7,bounce:true,arm:12}); }
}
function aimUpdate(f, inp) {
  const x = inp.releaseAction ? inp.releaseX : inp.x;
  const y = inp.releaseAction ? inp.releaseY : inp.y;
  if (Math.hypot(x, y) > .35) f.aim = Math.atan2(y, x);
  if (Math.abs(Math.cos(f.aim)) > .2) f.dir = Math.cos(f.aim) > 0 ? 1 : -1;
}
function attack(f) {
  attack0(f); if (f.ammo !== Infinity && --f.ammo <= 0) f.empty = true;
}
function meleeHit(f, wp) {
  const w = wp || f.atkWeapon || f.weapon;
  const m = ME[w]; if (!m) return; const a = assistedAim(f), ax = Math.cos(a), ay = Math.sin(a);
  for (const o of fs) { if (o === f || !o.alive) continue; const dx = o.x - f.x, dy = o.y - f.y, pr = dx * ax + dy * ay, pp = Math.abs(dx * ay - dy * ax);
    if (pr > -14 && pr < m.r + 16 && pp < 50) hurt(o, m.d, ax * m.kx, ay * m.kx * .6 + m.ky, o.x, o.y, true); }
  if (w === 'chainsaw') burst(f.x + ax*52, f.y - 8 + ay*52, '#ffd54a', 3, 5, 10, true);
  if (w === 'hammer') { shake = Math.max(shake, 9); burst(f.x + ax * 50, f.y + ay * 50 + 10, '#cfd8dc', 10, 5, 20, true); }
}

function step() {
  t++; if (shake > 0) shake *= .88;
  if (cd > 0) { cd--; } 
  if (!over && cd <= 0) {
    if (M.lava) lavaY = Math.max(300, 740 - t * .12 + (t>9999?0:0));
    crateT--; if (crateT <= 0 && cfg.loot && crates.length < 3) { crateT = cfg.loot ? 260 : 420; const pp = M.pl[Math.floor(Math.random()*M.pl.length)]; crates.push({x:pp[0]+rnd(16,Math.max(17,pp[2]-16)),y:-30,vx:0,vy:0,hw:14,hh:14,w:rndWep()}); }
    for (const f of fs) {
      if (!f.alive) continue; const inp = inputPlayers[f.index];
      if (Math.abs(inp.x) > .15) { const cap = f.slow > 0 ? 2.6 : 5.8; f.vx = Math.max(-cap, Math.min(cap, f.vx + inp.x * .95)); }
      aimUpdate(f, inp);
      { let da = f.aim - f.va; while (da > Math.PI) da -= 2*Math.PI; while (da < -Math.PI) da += 2*Math.PI;
        if (Math.abs(da) > 2.8) { const mid = f.va + da/2; if (Math.sin(mid) > 0) da += da > 0 ? -2*Math.PI : 2*Math.PI; }
        f.va += da * .3; f.fs += (f.dir - f.fs) * .3; if (Math.abs(f.dir - f.fs) < .02) f.fs = f.dir; }
      f.vx *= f.ground ? (M.fr || .86) : .95;
      if (inp.jump && !f.jh && f.jumps > 0) { f.vy = (f.jumps === 2 ? -13.2 : -11.4) * (M.js||1) * (f.slow > 0 ? .8 : 1); f.jumps--; f.ground = false; burst(f.x,f.y+24,'#ffffff',4,2,12,false); }
      f.jh = inp.jump; f.vy = Math.min(14, f.vy + (M.g||GRAV));
      const pg = f.ground, pvy = f.vy; move(f); if (f.ground) f.jumps = 2; if (f.ground && !pg && pvy > 4) { f.sq = 8; burst(f.x, f.y + 26, '#dfe6ee', 7, 2.5, 14, false); } if (f.sq > 0) f.sq--; if (f.ground && Math.abs(f.vx) > 3.2 && t % 6 === 0) burst(f.x - f.dir*8, f.y + 26, '#cfd8e0', 2, 1.5, 12, false);
      if (M.belts && f.ground) for (const [bi,dr] of M.belts) { const bp = M.pl[bi]; if (Math.abs(f.y+f.hh-bp[1])<2 && f.x>bp[0] && f.x<bp[0]+bp[2]) f.vx += dr*.25; }
      if (M.pads) for (const pd of M.pads) if (f.ground && Math.abs(f.x-pd[0])<pd[2]/2 && Math.abs(f.y+f.hh-pd[1])<3) { f.vy=-17.5; f.jumps=1; f.ground=false; burst(f.x,f.y+24,'#7dff9a',10,4,18,true); }
      f.phase += Math.abs(f.vx) * .12; if (f.cd>0) f.cd--; if (f.inv>0) f.inv--; if (f.shield>0) f.shield--; if (f.flash>0) f.flash--; if (f.mf>0) f.mf--; if (f.slow>0) { f.slow--; if (t % 6 === 0) burst(f.x+rnd(-10,10), f.y+rnd(-20,20), '#bff', 1, 1, 14, true); } f.recoil *= .85;
      if (f.empty && f.atkT <= 0) { f.empty = false; f.weapon = f.base; f.ammo = Infinity; }
      if ((inp.action || inp.releaseAction) && f.cd <= 0 && !f.empty) attack(f);
      if (f.atkT > 0) { const aw = f.atkWeapon || f.weapon; f.atkT--; f.atkP = 1 - f.atkT / WD[aw].dur; if (!f.hitDone && ME[aw] && WD[aw].dur - f.atkT >= WD[aw].hit) { f.hitDone = true; meleeHit(f, aw); } }
      for (let i=crates.length-1;i>=0;i--) { const c=crates[i]; if (Math.abs(c.x-f.x)<f.hw+c.hw && Math.abs(c.y-f.y)<f.hh+c.hh) { giveWeapon(f, c.w); f.cd = 10; crates.splice(i,1); burst(c.x,c.y,'#ffd54a',14,5,25,true); } }
      if (f.y > H + 120 || (M.lava && f.y + f.hh > lavaY + 8)) { if (M.lava && f.y < H) burst(f.x,lavaY,'#ff7a1f',20,6,30,true); kill(f); }
      if (M.ball) { const bx = ballPos(); if (Math.hypot(f.x-bx[0], f.y-bx[1]) < 150 + 10) kill(f); }
      if (M.bars) for (const b of M.bars) for (let k=0;k<=10;k++) { const px=b[0]+(b[2]-b[0])*k/10, py=b[1]+(b[3]-b[1])*k/10; if (Math.hypot(f.x-px,f.y-py)<34) kill(f); }
    }
    for (const c of crates) { c.vy = Math.min(3.6, c.vy + (M.g||GRAV) * .6); move(c); }
    crates = crates.filter(c => c.y < H + 60);
    for (let i=proj.length-1;i>=0;i--) { const p = proj[i]; p.l--;
      if (p.t === 'M') { p.vy += (M.g||GRAV); move(p); if (p.ground) p.vx *= .8; p.arm--; if (p.l <= 0) { proj.splice(i,1); continue; }
        if (p.arm <= 0) for (const o of fs) if (o.alive && Math.abs(o.x-p.x)<28 && Math.abs(o.y-p.y)<34) { boom(p.x,p.y,p.o,105,48); proj.splice(i,1); break; }
        continue; }
      if (p.t === 'N') { p.vy += .32; move(p); let hp = false; for (const o of fs) if (o.alive && o.index !== p.o && Math.abs(o.x-p.x) < o.hw+8 && Math.abs(o.y-p.y) < o.hh+8) hp = true;
        if (hp || p.l <= 0) { boom(p.x,p.y,p.o,120,50); proj.splice(i,1); } else if (t % 3 === 0) parts.push({x:p.x,y:p.y,vx:rnd(-.4,.4),vy:rnd(-.6,0),l:20,m:20,c:'#888',r:rnd(2,4),g:false}); continue; }
      if (p.t === 'Y') { p.age++; const ow = fs[p.o];
        if (p.age >= 28) { if (ow && ow.alive) { const dx = ow.x-p.x, dy = ow.y-p.y, dd = Math.hypot(dx,dy) || 1; p.vx += dx/dd*.9; p.vy += dy/dd*.9; const sp = Math.hypot(p.vx,p.vy); if (sp > 13) { p.vx *= 13/sp; p.vy *= 13/sp; } if (dd < 22) { proj.splice(i,1); continue; } } else p.l = 0; }
        p.x += p.vx; p.y += p.vy; if (p.age < 28 && inRect(p.x,p.y)) p.age = 28;
        for (const o of fs) if (o.alive && o.index !== p.o && Math.abs(o.x-p.x) < o.hw+10 && Math.abs(o.y-p.y) < o.hh+6) { if (!p.hs) p.hs = {}; if (p.hs[o.index] === undefined || p.age - p.hs[o.index] > 14) { p.hs[o.index] = p.age; hurt(o, 14, Math.sign(p.vx||1)*5, -4, p.x, p.y, true); } }
        if (p.l <= 0 || p.x < -40 || p.x > W+40 || p.y < -120 || p.y > H+120) proj.splice(i,1); continue; }
      if (p.t === 'B') { p.vy += .35; move(p); if (p.arm > 0) p.arm--;
        let hit = false;
        for (const o of fs) { if (!o.alive) continue; if (o.index === p.o && p.arm > 0) continue; if (Math.abs(o.x-p.x) < o.hw+10 && Math.abs(o.y-p.y) < o.hh+10) { hit = true; break; } }
        if (hit || p.l <= 0) { boom(p.x,p.y,p.o,130,48); proj.splice(i,1); }
        else if (t % 2 === 0) parts.push({x:p.x+rnd(-3,3),y:p.y-8,vx:rnd(-.6,.6),vy:rnd(-1.2,-.3),l:14,m:14,c:'#ffd54a',r:rnd(1.5,3),g:false});
        continue; }
      if (p.t === 'R') { p.vx *= 1.025; p.vy *= 1.025; p.x += p.vx; p.y += p.vy; if (t % 2) parts.push({x:p.x-p.vx*.9,y:p.y-p.vy*.9,vx:rnd(-.5,.5),vy:rnd(-.8,.2),l:26,m:26,c:'#ffb347',r:rnd(3,6),g:true}); else parts.push({x:p.x-p.vx*.9,y:p.y-p.vy*.9,vx:0,vy:-.3,l:34,m:34,c:'#777',r:rnd(3,6),g:false});
        let hit = inRect(p.x,p.y) || p.x < -20 || p.x > W + 20 || p.y < -80 || p.y > H + 80 || p.l <= 0; for (const f of fs) if (f.alive && f.index !== p.o && Math.abs(f.x-p.x)<f.hw+8 && Math.abs(f.y-p.y)<f.hh+4) hit = true;
        if (hit) { boom(p.x,p.y,p.o,125,50); proj.splice(i,1); } continue; }
      if (p.t === 'A') p.vy += .16; if (p.t === 'S') p.vy += .2; if (p.t === 'H') p.vy += .04;
      if (p.t === 'O') { let best = null, bd = 1e9; for (const o of fs) if (o.alive && o.index !== p.o) { const dd = Math.hypot(o.x - p.x, o.y - p.y); if (dd < bd) { bd = dd; best = o; } }
        if (best) { p.vx += (best.x - p.x)/bd*.32; p.vy += (best.y - p.y)/bd*.32; const sp = Math.hypot(p.vx, p.vy); if (sp > 6.5) { p.vx *= 6.5/sp; p.vy *= 6.5/sp; } }
        if (t % 2) parts.push({x:p.x,y:p.y,vx:rnd(-.6,.6),vy:rnd(-.6,.6),l:20,m:20,c:'#c6f',r:rnd(2,4),g:true}); }
      if (p.t === 'Z' && t % 2) parts.push({x:p.x,y:p.y,vx:rnd(-.5,.5),vy:rnd(-.5,.5),l:14,m:14,c:'#bff',r:rnd(1.5,3),g:true});
      const px0 = p.x, py0 = p.y;
      p.x += p.vx; p.y += p.vy; let dead = p.l <= 0 || p.x < -20 || p.x > W + 20 || p.y < -80 || p.y > H + 80 || M.pl.some(r => segRect(px0,py0,p.x,p.y,r));
      if (!dead) for (const f of fs) if (f.alive && f.index !== p.o && segFighter(px0,py0,p.x,p.y,f,5)) { hurt(f, DM[p.t]||15, Math.sign(p.vx)*(KB[p.t]||5), -2, p.x, p.y, true); if (p.t==='Z') f.slow = 150; if (p.t==='O') { burst(p.x,p.y,'#c6f',18,6,28,true); shake = Math.max(shake,5); } dead = true; break; }
      if (dead) { burst(p.x,p.y,PC[p.t]||'#ffd54a',3,2,8,true); proj.splice(i,1); }
    }
    const alive = fs.filter(f => f.alive);
    if (alive.length <= 1) { over = true; banner = 150; if (alive.length === 1) { alive[0].score++; bannerTxt = ((typeof PLAYER_NAMES !== 'undefined' && PLAYER_NAMES[alive[0].index]) || ('P' + (alive[0].index + 1))) + ' qazandı!'; bannerCol = alive[0].color; } else { bannerTxt = 'Bərabərlik'; bannerCol = '#fff'; } hud(); }
  } else if (over) { for (const f of fs) if (f.alive) { f.vy = Math.min(14, f.vy + (M.g||GRAV)); f.vx *= .86; move(f); }
    if (--banner <= 0) { if (currentRound >= cfg.rounds) { over = false; gameState = 'matchEnd'; showWinner(); } else { currentRound++; newRound(); } } }
  for (let i=parts.length-1;i>=0;i--) { const p=parts[i]; p.vy+=.22; p.x+=p.vx; p.y+=p.vy; if (p.vy>0 && inRect(p.x,p.y)) { p.vy*=-.3; p.vx*=.6; } if(--p.l<=0) parts.splice(i,1); }
  for (let i=debris.length-1;i>=0;i--) { const d=debris[i]; d.vy+=.45; d.x+=d.vx; d.y+=d.vy; d.a+=d.va; if (inRect(d.x,d.y+4)&&d.vy>0){ d.vy*=-.35; d.vx*=.7; d.va*=.6; d.y-=2; } if (d.y>H+80) debris.splice(i,1); }
  for (let i=fx.length-1;i>=0;i--) if (++fx[i].t > 30) fx.splice(i,1);
  for (let i=beams.length-1;i>=0;i--) if (--beams[i].l <= 0) beams.splice(i,1);
  clearReleasedActions();
}
let bannerCol = '#fff';
function ballPos() { const a = .55 * Math.sin(t * .015); return [640 + 640 * Math.sin(a), -230 + 640 * Math.cos(a), a]; }

// ---------- drawing ----------
function platform(p) {
  const [x,y,w,h] = p, st = M.style; ctx.save();
  if (st === 'snow') { ctx.fillStyle='#2e7482'; rr(x,y,w,h,5); ctx.fill(); ctx.fillStyle='#f4f9ff'; rr(x-3,y-4,w+6,9,4); ctx.fill(); }
  else if (st === 'neon') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#2b1068'); g.addColorStop(1,'#0c0522'); ctx.fillStyle=g; rr(x,y,w,h,4); ctx.fill(); ctx.shadowColor='#00f0ff'; ctx.shadowBlur=16; ctx.fillStyle='#00f0ff'; ctx.fillRect(x,y,w,3); ctx.shadowColor='#ff2bd6'; ctx.fillStyle='#ff2bd6'; ctx.fillRect(x,y+h-3,w,2); }
  else if (st === 'space') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#8a8fa8'); g.addColorStop(1,'#2c2f44'); ctx.fillStyle=g; rr(x,y,w,h,Math.min(16,h/2)); ctx.fill(); ctx.fillStyle='rgba(0,0,0,.25)'; for(let k=0;k<Math.floor(w/45);k++){ ctx.beginPath(); ctx.arc(x+22+k*45,y+h*.6,4+(k%3)*2,0,6.3); ctx.fill(); } ctx.shadowColor='#9ab4ff'; ctx.shadowBlur=10; ctx.fillStyle='rgba(190,210,255,.8)'; ctx.fillRect(x+8,y,w-16,2); }
  else if (st === 'forest') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#4a2f16'); g.addColorStop(1,'#1b0f07'); ctx.fillStyle=g; rr(x,y,w,h,4); ctx.fill(); ctx.fillStyle='#2fa85a'; ctx.beginPath(); ctx.moveTo(x-3,y+7); for (let k=0;k<=w;k+=12) ctx.lineTo(x+k, y-3-Math.abs(Math.sin(k*.5+x))*5); ctx.lineTo(x+w+3,y+7); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.07)'; ctx.fillRect(x,y+8,w,2); }
  else if (st === 'sky') { ctx.fillStyle='#4a3a2a'; ctx.beginPath(); ctx.moveTo(x+8,y+h-2); ctx.lineTo(x+w/2,y+h+30); ctx.lineTo(x+w-8,y+h-2); ctx.fill(); const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#7a5a3a'); g.addColorStop(1,'#4a3a2a'); ctx.fillStyle=g; rr(x,y,w,h,8); ctx.fill(); ctx.fillStyle='#5fcf6a'; rr(x-2,y-4,w+4,12,6); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.25)'; ctx.fillRect(x+6,y-3,w-12,2); }
  else if (st === 'factory') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#6b7480'); g.addColorStop(1,'#262b33'); ctx.fillStyle=g; rr(x,y,w,h,3); ctx.fill(); ctx.fillStyle='#ffcf33'; ctx.fillRect(x,y,w,4); ctx.fillStyle='rgba(0,0,0,.5)'; for (let k=x;k<x+w-6;k+=16) ctx.fillRect(k,y,7,4); ctx.fillStyle='rgba(255,255,255,.18)'; for (let k=x+10;k<x+w-4;k+=40) { ctx.beginPath(); ctx.arc(k,y+h/2+3,2.2,0,6.3); ctx.fill(); } }
  else if (st === 'graveyard') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#5a5a73'); g.addColorStop(1,'#1d1b2b'); ctx.fillStyle=g; rr(x,y,w,h,4); ctx.fill(); ctx.fillStyle='#3d7a4a'; ctx.beginPath(); ctx.moveTo(x-2,y+6); for (let k=0;k<=w;k+=16) ctx.lineTo(x+k, y-2-Math.abs(Math.sin(k*.7+x))*4); ctx.lineTo(x+w+2,y+6); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(x,y+7,w,2); }
  else if (st === 'desert') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#d9a05a'); g.addColorStop(1,'#6b3d1c'); ctx.fillStyle=g; rr(x,y,w,h,5); ctx.fill(); ctx.fillStyle='#f2d28e'; rr(x-2,y-3,w+4,9,4); ctx.fill(); ctx.strokeStyle='rgba(90,50,20,.35)'; ctx.lineWidth=2; for (let k=y+16;k<y+h-4;k+=14) line(x+4,k,x+w-4,k); }
  else if (st === 'ocean') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#3d7a8d'); g.addColorStop(1,'#0e2f3b'); ctx.fillStyle=g; rr(x,y,w,h,8); ctx.fill(); for (let k=x+10;k<x+w-6;k+=18) { ctx.fillStyle=k%36<18?'#ff7aa2':'#ffb36b'; ctx.beginPath(); ctx.arc(k,y-1,5+(k%5),Math.PI,0); ctx.fill(); } }
  else if (st === 'sakura') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#6b2326'); g.addColorStop(1,'#2a0d10'); ctx.fillStyle=g; rr(x,y,w,h,4); ctx.fill(); ctx.fillStyle='#e8c36a'; ctx.fillRect(x,y,w,3); ctx.fillStyle='rgba(255,170,200,.7)'; for (let k=x+14;k<x+w-6;k+=34) { ctx.beginPath(); ctx.arc(k,y-1,3,0,6.3); ctx.fill(); } }
  else if (st === 'rooftop') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#3d4360'); g.addColorStop(1,'#12152a'); ctx.fillStyle=g; rr(x,y,w,h,3); ctx.fill(); ctx.fillStyle='#7b84a6'; ctx.fillRect(x-3,y-3,w+6,6); ctx.shadowColor='#00f0ff'; ctx.shadowBlur=10; ctx.fillStyle='#00f0ff'; ctx.fillRect(x,y+4,w,2); ctx.shadowBlur=0; if (w>200) { ctx.fillStyle='#262b44'; rr(x+w*.2,y-14,26,11,2); ctx.fill(); rr(x+w*.7,y-10,18,8,2); ctx.fill(); }
    if (h>100) for (let k=x+14;k<x+w-14;k+=28) for (let j=y+22;j<y+h-16;j+=30) { ctx.fillStyle=((k*7+j*3)|0)%5<2?'rgba(255,226,122,.75)':'rgba(255,255,255,.07)'; ctx.fillRect(k,j,12,16); } }
  else if (st === 'candy') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#ff9ad5'); g.addColorStop(1,'#c6559a'); ctx.fillStyle=g; rr(x,y,w,h,12); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(x-3,y+9); for (let k=0;k<=w;k+=16) ctx.lineTo(x+k,y-3-Math.abs(Math.sin(k*.4+x))*4+ (k%32?4:0)); ctx.lineTo(x+w+3,y+9); ctx.fill(); ctx.fillStyle='#fff'; for (let k=x+10;k<x+w-4;k+=32) { ctx.beginPath(); ctx.arc(k,y+12,4,0,6.3); ctx.arc(k+2,y+17,3,0,6.3); ctx.fill(); }
    const cl=['#ffd23f','#6bd4ff','#7be07b','#c58bff']; for (let k=x+8,i=0;k<x+w-6;k+=14,i++) { ctx.fillStyle=cl[i%4]; ctx.fillRect(k,y-2+(i%3),5,2.2); } }
  else if (st === 'ice') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#c4f3ff'); g.addColorStop(.25,'#5bb6d8'); g.addColorStop(1,'#14506e'); ctx.fillStyle=g; rr(x,y,w,h,6); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.85)'; rr(x-2,y-3,w+4,8,4); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.28)'; ctx.lineWidth=1.5; for (let k=x+16;k<x+w-10;k+=46) line(k,y+8,k+12,Math.min(y+h-4,y+8+Math.min(36,h-12))); ctx.fillStyle='rgba(190,245,255,.8)'; for (let k=x+20;k<x+w-10;k+=40) { ctx.beginPath(); ctx.moveTo(k,y+h); ctx.lineTo(k+7,y+h+Math.min(22,h*.6)); ctx.lineTo(k+14,y+h); ctx.fill(); } }
  else if (st === 'retro') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#2a0a5e'); g.addColorStop(1,'#0a0220'); ctx.fillStyle=g; rr(x,y,w,h,3); ctx.fill(); ctx.strokeStyle='rgba(255,60,200,.22)'; ctx.lineWidth=1; for (let k=x+14;k<x+w;k+=28) line(k,y,k,y+h); ctx.shadowColor='#ff2bd6'; ctx.shadowBlur=16; ctx.fillStyle='#ff2bd6'; ctx.fillRect(x,y,w,3); ctx.shadowColor='#00f0ff'; ctx.fillStyle='#00f0ff'; ctx.fillRect(x,y+h-2,w,2); ctx.shadowBlur=0; }
  else if (st === 'mars') { const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,'#b5502c'); g.addColorStop(1,'#3e170d'); ctx.fillStyle=g; rr(x,y,w,h,6); ctx.fill(); ctx.fillStyle='#e0824a'; rr(x-2,y-3,w+4,9,4); ctx.fill(); ctx.fillStyle='rgba(0,0,0,.25)'; for (let k=x+18;k<x+w-8;k+=38) { ctx.beginPath(); ctx.ellipse(k,y+h*.6,6,3,0,0,6.3); ctx.fill(); } ctx.fillStyle='rgba(255,200,150,.35)'; for (let k=x+10;k<x+w-6;k+=24) ctx.fillRect(k,y-1,5,2); }
  else if (st === 'lava') { ctx.fillStyle='#2b1b1b'; rr(x,y,w,h,4); ctx.fill(); ctx.fillStyle='#ff6a1a'; ctx.fillRect(x,y,w,3); ctx.fillStyle='rgba(255,120,30,.25)'; ctx.fillRect(x,y+3,w,6); }
  else { ctx.fillStyle='#08082b'; rr(x,y,w,h,3); ctx.fill(); ctx.fillStyle='#c91e3c'; ctx.beginPath(); ctx.moveTo(x-4,y+6); for (let k=0;k<=w;k+=14) ctx.lineTo(x+k, y-2 - Math.abs(Math.sin(k*.3+x))*5); ctx.lineTo(x+w+4,y+6); ctx.fill(); }
  ctx.restore();
}
function rr(x,y,w,h,r) { ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function line(a,b,c,d) { ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(c,d); ctx.stroke(); }
const lg = (x0,y0,x1,y1,a) => { const g = ctx.createLinearGradient(x0,y0,x1,y1); a.forEach((c,i) => g.addColorStop(i/(a.length-1), c)); return g; };
function poly(pts, fill) { ctx.beginPath(); pts.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1])); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
function glow(c, b) { ctx.shadowColor = c; ctx.shadowBlur = b; }
function shuriken(cx, cy, R, rot) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.beginPath();
  for (let k = 0; k < 8; k++) { const an = k * Math.PI / 4, r = k % 2 ? R * .35 : R; k ? ctx.lineTo(Math.cos(an)*r, Math.sin(an)*r) : ctx.moveTo(Math.cos(an)*r, Math.sin(an)*r); }
  ctx.closePath(); ctx.fillStyle = lg(-R,-R,R,R,['#f4f7fa','#8f9ba8','#47525e']); ctx.fill(); ctx.strokeStyle = '#2b323b'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#0b0f1a'; ctx.beginPath(); ctx.arc(0, 0, R * .2, 0, 6.3); ctx.fill(); ctx.restore();
}
function weaponSprite(w) {
  if (w === 'fist') return;
  if (NEWSPR[w]) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; NEWSPR[w](Date.now()); return; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const T = Date.now();
  if (w === 'sword') {
    ctx.strokeStyle = '#4a2c12'; ctx.lineWidth = 5; line(-6,0,6,0);
    ctx.fillStyle = lg(0,-4,0,4,['#ffffff','#b8c4d2','#6c7889']); ctx.beginPath(); ctx.moveTo(9,-3.4); ctx.lineTo(44,-2.4); ctx.lineTo(54,0); ctx.lineTo(44,2.4); ctx.lineTo(9,3.4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,95,130,.7)'; ctx.lineWidth = 1; line(12,0,46,0);
    glow('#9cf',6); ctx.strokeStyle = 'rgba(200,230,255,.9)'; line(10,-3.2,44,-2.3); ctx.shadowBlur = 0;
    ctx.fillStyle = lg(0,-10,0,10,['#ffe38a','#c8922a','#8a5f16']); rr(6,-10,5,20,2); ctx.fill();
    ctx.fillStyle = '#e8b43c'; ctx.beginPath(); ctx.arc(-8,0,3.2,0,6.3); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(-8,0,1.3,0,6.3); ctx.fill();
  }
  else if (w === 'hammer') {
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 5.5; line(-6,0,36,0);
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1.5; for (let k = 0; k < 5; k++) line(2+k*5,-3,5+k*5,3);
    poly([[38,-9],[44,-18],[50,-9]],'#aeb7c1'); poly([[38,9],[44,18],[50,9]],'#aeb7c1');
    ctx.fillStyle = lg(0,-13,0,13,['#eef2f6','#9aa5b1','#4d5763']); rr(28,-13,22,26,3); ctx.fill();
    ctx.fillStyle = '#2f3944'; ctx.fillRect(31,-13,2.5,26); ctx.fillRect(44.5,-13,2.5,26);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(34,-11,9,2);
  }
  else if (w === 'axe') {
    ctx.strokeStyle = '#6b4423'; ctx.lineWidth = 5; line(-8,0,42,0);
    ctx.strokeStyle = '#2d1c0d'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) line(-4+k*4,-3,-2+k*4,3);
    poly([[30,2],[25,15],[41,4]],'#7a8693');
    ctx.fillStyle = lg(28,-26,56,0,['#f4f7fa','#8f9ba8','#47525e']); ctx.beginPath(); ctx.moveTo(30,-4); ctx.bezierCurveTo(28,-18,38,-28,54,-26); ctx.bezierCurveTo(60,-14,55,-3,44,1); ctx.lineTo(30,2); ctx.closePath(); ctx.fill();
    glow('#9ef',8); ctx.strokeStyle = 'rgba(180,240,255,.95)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(54,-26); ctx.bezierCurveTo(60,-14,55,-3,44,1); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#caa23a'; ctx.fillRect(27,-4,5,8);
  }
  else if (w === 'gun') {
    poly([[3,2],[13,2],[11,16],[1,16]],'#3a2a1e'); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) line(3+k*.8,6+k*3,11-k*.4,6+k*3);
    ctx.strokeStyle = '#1c2128'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(16,4,4,0,Math.PI); ctx.stroke();
    ctx.fillStyle = lg(0,-7,0,3,['#69747f','#2b323b','#171b21']); rr(0,-7,30,10,2.5); ctx.fill();
    ctx.fillStyle = '#0e1116'; ctx.fillRect(30,-5,5,5);
    ctx.fillStyle = '#ff9a2e'; ctx.fillRect(4,-5,8,2);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; for (let k = 0; k < 4; k++) line(18+k*3,-6,18+k*3,0);
    ctx.fillStyle = '#ffd54a'; ctx.fillRect(27,-9,3,2.2);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(2,-6.5,26,1.4);
  }
  else if (w === 'shotgun') {
    poly([[-16,-2],[-4,-3],[-1,7],[-14,10]],'#6b4423'); ctx.strokeStyle = 'rgba(40,20,5,.5)'; ctx.lineWidth = 1; line(-14,1,-3,1); line(-13,5,-2,4);
    ctx.fillStyle = lg(0,-6,0,0,['#9aa5b1','#2b323b']); rr(0,-6,44,5,2); ctx.fill();
    ctx.fillStyle = lg(0,0,0,5,['#7d8995','#1d232a']); rr(0,0,44,5,2); ctx.fill();
    ctx.fillStyle = '#3b434d'; rr(-2,-7,14,14,2); ctx.fill(); ctx.fillStyle = '#d9a441'; ctx.fillRect(2,-5,6,2);
    ctx.fillStyle = lg(0,2,0,9,['#8a5a2e','#4a2e14']); rr(20,3,14,6,2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 4; k++) line(23+k*3,3,23+k*3,9);
    ctx.fillStyle = '#000'; ctx.fillRect(43,-5,2,3.5); ctx.fillRect(43,.8,2,3.5);
  }
  else if (w === 'smg') {
    ctx.fillStyle = lg(0,12,0,20,['#6b7480','#2b323b']); ctx.beginPath(); ctx.arc(12,12,8,0,6.3); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(12,12,2.5+k*2,0,6.3); ctx.stroke(); }
    ctx.fillStyle = lg(0,-6,0,5,['#69747f','#2b323b','#171b21']); rr(0,-6,26,11,3); ctx.fill();
    ctx.fillStyle = '#20262d'; rr(26,-4,11,7,2); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) line(28+k*3,-4,28+k*3,3);
    poly([[17,4],[23,4],[22,12],[16,12]],'#3a2a1e');
    ctx.fillStyle = '#ff3b3b'; ctx.fillRect(9,-9,5,3); ctx.fillStyle = '#ffd54a'; ctx.fillRect(1,-4,6,2); ctx.fillStyle = '#20262d'; ctx.fillRect(-10,-3,10,5);
  }
  else if (w === 'sniper') {
    poly([[-14,-4],[2,-4],[4,6],[-10,8],[-14,2]],'#6b4423');
    ctx.fillStyle = lg(0,-4,0,4,['#566170','#1b2027']); rr(2,-4,38,8,2); ctx.fill();
    ctx.fillStyle = '#14181d'; ctx.fillRect(40,-2.2,20,4.4); ctx.fillStyle = '#2d343d'; ctx.fillRect(58,-3.2,5,6.4);
    ctx.fillStyle = '#2b323b'; ctx.fillRect(12,-6,3,3); ctx.fillRect(25,-6,3,3);
    ctx.fillStyle = lg(0,-14,0,-6,['#6a7584','#1f252d']); rr(8,-13,24,7,3.5); ctx.fill();
    glow('#6df',8); ctx.fillStyle = '#8ff'; ctx.fillRect(31,-12,2.5,5); ctx.fillRect(7,-12,2.5,5); ctx.shadowBlur = 0;
    ctx.strokeStyle = '#59636f'; ctx.lineWidth = 2; line(46,2,52,12); line(46,2,41,12);
  }
  else if (w === 'rocket') {
    poly([[-16,-9],[-8,-7],[-8,7],[-16,9]],'#2c3329');
    ctx.fillStyle = lg(0,-9,0,9,['#8a9a7a','#4a5640','#2b3326']); rr(-10,-8,46,16,5); ctx.fill();
    ctx.fillStyle = '#ffcf33'; ctx.fillRect(6,-8,4,16); ctx.fillStyle = '#1a1f17'; ctx.fillRect(10,-8,2,16); ctx.fillStyle = '#ffcf33'; ctx.fillRect(16,-8,4,16);
    ctx.fillStyle = '#1a1f17'; rr(34,-9,5,18,2); ctx.fill();
    poly([[38,-6],[53,0],[38,6]],'#d83a2a'); poly([[38,-6],[47,-3],[38,0]],'#ff8a6a');
    ctx.fillStyle = '#222'; rr(6,7,6,11,2); ctx.fill(); ctx.fillStyle = '#8cf'; ctx.fillRect(22,-12,6,4);
  }
  else if (w === 'flame') {
    ctx.fillStyle = lg(-20,0,-2,0,['#e74c3c','#8c1d18']); rr(-20,-2,18,15,6); ctx.fill();
    ctx.fillStyle = '#ffd54a'; ctx.fillRect(-14,-2,3,15);
    ctx.strokeStyle = '#222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-4,6); ctx.quadraticCurveTo(0,15,8,4); ctx.stroke();
    ctx.fillStyle = lg(0,-5,0,4,['#7d8995','#2b323b']); rr(2,-5,24,9,3); ctx.fill();
    ctx.fillStyle = lg(26,-8,36,4,['#ffb347','#c4541a']); ctx.beginPath(); ctx.moveTo(26,-5); ctx.lineTo(36,-8); ctx.lineTo(36,4); ctx.lineTo(26,4); ctx.closePath(); ctx.fill();
    glow('#ff9a2e',10); ctx.fillStyle = Math.random() < .5 ? '#ffd54a' : '#ff6a1a'; ctx.beginPath(); ctx.ellipse(38,-2,3+Math.random()*1.5,2,0,0,6.3); ctx.fill(); ctx.shadowBlur = 0;
  }
  else if (w === 'bow') {
    ctx.strokeStyle = lg(0,-20,0,20,['#c58a4a','#7a4a1f','#c58a4a']); ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(6,0,20,-1.25,1.25); ctx.stroke();
    const tx = 6 + 20 * Math.cos(1.25), ty = 20 * Math.sin(1.25);
    ctx.fillStyle = '#e8b43c'; ctx.beginPath(); ctx.arc(tx,-ty,2.6,0,6.3); ctx.fill(); ctx.beginPath(); ctx.arc(tx,ty,2.6,0,6.3); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx,-ty); ctx.lineTo(-3,0); ctx.lineTo(tx,ty); ctx.stroke();
    ctx.strokeStyle = '#d9b27a'; ctx.lineWidth = 2; line(-3,0,30,0); poly([[30,-3.5],[39,0],[30,3.5]],'#e6edf3');
    ctx.strokeStyle = '#e23'; ctx.lineWidth = 1.5; line(-3,0,-7,-3.5); line(-1,0,-5,-3.5); line(-3,0,-7,3.5); line(-1,0,-5,3.5);
    ctx.fillStyle = '#3a2410'; ctx.fillRect(24,-4,4,8);
  }
  else if (w === 'spear') {
    ctx.strokeStyle = lg(0,-3,0,3,['#c99a60','#6b4423']); ctx.lineWidth = 4; line(-10,0,66,0);
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 1.5; for (let k = 0; k < 5; k++) line(-4+k*5,-2.5,-2+k*5,2.5);
    ctx.fillStyle = '#d83a2a'; ctx.beginPath(); ctx.moveTo(60,0); ctx.lineTo(70,-6); ctx.lineTo(67,0); ctx.lineTo(70,6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c9a43a'; ctx.fillRect(63,-3.5,5,7);
    ctx.fillStyle = lg(0,-8,0,8,['#ffffff','#b8c4d2','#6c7889']); ctx.beginPath(); ctx.moveTo(68,0); ctx.quadraticCurveTo(74,-9,94,0); ctx.quadraticCurveTo(74,9,68,0); ctx.fill();
    ctx.strokeStyle = 'rgba(70,95,130,.7)'; ctx.lineWidth = 1; line(70,0,91,0);
  }
  else if (w === 'mine') {
    ctx.fillStyle = lg(0,-3,0,10,['#59626d','#22272e']); ctx.beginPath(); ctx.ellipse(8,3,11,6,0,0,6.3); ctx.fill();
    ctx.fillStyle = '#39414b'; ctx.beginPath(); ctx.ellipse(8,1,7,5,0,Math.PI,6.283); ctx.fill();
    ctx.strokeStyle = '#9aa4ae'; ctx.lineWidth = 2; for (let k = 0; k < 5; k++) line(8+(k-2)*4,-2,8+(k-2)*5,-6);
    glow('#f33',8); ctx.fillStyle = (T % 600 < 300) ? '#ff3b3b' : '#7a1515'; ctx.beginPath(); ctx.arc(8,-1,2.2,0,6.3); ctx.fill(); ctx.shadowBlur = 0;
  }
  else if (w === 'laser') {
    poly([[3,5],[12,5],[10,16],[2,16]],'#2b3440'); ctx.fillStyle = 'rgba(80,255,255,.85)'; ctx.fillRect(3.5,8,2,5);
    poly([[4,-7],[10,-13],[17,-7]],'#aab6c2');
    ctx.fillStyle = lg(0,-7,0,5,['#ffffff','#c9d3dd','#7d8995']); rr(0,-7,28,12,5); ctx.fill();
    glow('#4ff',10); ctx.fillStyle = '#4ff'; rr(6,-3,16,3,1.5); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#2b3440'; rr(28,-5,6,8,2); ctx.fill();
    glow('#4ff',12); ctx.fillStyle = '#bff'; ctx.beginPath(); ctx.arc(35,-1,2.4,0,6.3); ctx.fill(); ctx.shadowBlur = 0;
  }
  else if (w === 'shuriken') {
    shuriken(5,7,10,.3); shuriken(12,-2,13,T * .004);
  }
  else if (w === 'staff') {
    ctx.strokeStyle = lg(0,-3,0,3,['#a06a36','#4a2e14']); ctx.lineWidth = 5; line(-12,0,50,0);
    ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 2; line(8,-3.5,8,3.5); line(30,-3.5,30,3.5);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(50,0); ctx.quadraticCurveTo(54,-12,64,-10); ctx.moveTo(50,0); ctx.quadraticCurveTo(54,12,64,10); ctx.stroke();
    const pu = 1 + Math.sin(T * .008) * .15; glow('#c6f',16);
    const g = ctx.createRadialGradient(59,0,1,60,0,9*pu); g.addColorStop(0,'#fff'); g.addColorStop(.5,'#d58bff'); g.addColorStop(1,'#6a1fb0'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(60,0,7.5*pu,0,6.3); ctx.fill(); ctx.shadowBlur = 0;
  }
  else if (w === 'frost') {
    poly([[3,5],[11,5],[9,16],[1,16]],'#2c5d8a');
    ctx.fillStyle = lg(0,-7,0,6,['#e8f9ff','#8fd0f2','#3a86c4']); rr(0,-7,24,13,5); ctx.fill();
    glow('#9df',10); poly([[24,-6],[41,-2],[24,0]],'#dff6ff'); poly([[24,0],[43,2],[24,6]],'#b7e6ff'); poly([[20,-7],[29,-17],[30,-6]],'#e8fbff'); ctx.shadowBlur = 0;
    glow('#fff',6); ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(6,-3,10,3); ctx.shadowBlur = 0;
    if (Math.random() < .25) { ctx.fillStyle = '#fff'; ctx.fillRect(40+Math.random()*8,-6+Math.random()*12,2,2); }
  }
  else if (w === 'tesla') {
    poly([[3,5],[11,5],[9,16],[1,16]],'#2b323b');
    ctx.fillStyle = lg(0,-6,0,6,['#6b7480','#2b323b','#14181d']); rr(-2,-6,18,12,3); ctx.fill();
    ctx.strokeStyle = '#d98a3a'; ctx.lineWidth = 2.5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(19+k*5,0,2.5,7,0,0,6.3); ctx.stroke(); }
    ctx.strokeStyle = '#cfd6de'; ctx.lineWidth = 2.5; line(36,-4,44,-9); line(36,4,44,9);
    glow('#8ff',10); ctx.strokeStyle = '#dff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(44,-9); ctx.lineTo(40+Math.random()*3,-4); ctx.lineTo(46,-1); ctx.lineTo(41+Math.random()*3,3); ctx.lineTo(44,9); ctx.stroke(); ctx.shadowBlur = 0;
  }
  else {
    const g = ctx.createRadialGradient(5,-3,1,8,0,11); g.addColorStop(0,'#6a727c'); g.addColorStop(1,'#101216'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(8,0,9.5,0,6.3); ctx.fill();
    ctx.save(); ctx.translate(8,0); ctx.rotate(-.8); ctx.fillStyle = '#9aa4ae'; ctx.fillRect(-3,-12.5,6,4); ctx.restore();
    ctx.strokeStyle = '#d9b27a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(13,-7); ctx.quadraticCurveTo(18,-10,17,-15); ctx.stroke();
    glow('#ffb02e',10); ctx.fillStyle = Math.random() < .6 ? '#ffe27a' : '#ff6a1a'; ctx.beginPath(); ctx.arc(17,-16,3+Math.random()*1.5,0,6.3); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(4,-4,2.2,0,6.3); ctx.fill();
  }
}
const GR = { gun:[7,9], smg:[20,8,32,1], shotgun:[3,2,20,6], sniper:[4,2,20,3], rocket:[9,13,24,4], flame:[12,0], laser:[7,11], frost:[7,11], tesla:[7,11], mine:[8,2], bomb:[8,0], bow:[6,0], spear:[10,0,26,0], staff:[6,0,22,0], shuriken:[8,0], rifle:[15,9,34,3], minigun:[17,12,29,11], grenade:[8,10,25,10], chainsaw:[-3,10,13,10], sword:[0,0], katana:[0,0], hammer:[4,0], axe:[4,0], boomerang:[12,0] };
const ONE_RANGED = new Set(['gun','laser','frost','tesla','flame']);
const NEWSPR = {
  rifle() {
    poly([[-14,-4],[0,-5],[2,5],[-10,8],[-15,2]],'#3a2a1e');
    ctx.fillStyle = lg(0,-7,0,4,['#6b7480','#2b323b','#14181d']); rr(0,-7,30,11,2); ctx.fill();
    ctx.fillStyle = lg(0,-5,0,3,['#9a7a44','#4a3418']); rr(28,-5,16,8,2); ctx.fill();
    ctx.fillStyle = '#14181d'; ctx.fillRect(44,-3,12,4); ctx.fillStyle = '#2b323b'; ctx.fillRect(54,-4.5,4,7);
    poly([[12,3],[19,3],[17,14],[10,14]],'#1c2128');
    ctx.fillStyle = lg(0,4,0,18,['#59626d','#22272e']); ctx.beginPath(); ctx.moveTo(24,4); ctx.lineTo(30,4); ctx.quadraticCurveTo(33,12,29,18); ctx.lineTo(23,18); ctx.quadraticCurveTo(26,11,24,4); ctx.fill();
    ctx.fillStyle = '#14181d'; ctx.fillRect(4,-10,10,3); ctx.fillRect(40,-8,3,4);
    ctx.fillStyle = '#ff3b3b'; ctx.fillRect(9,-9,2,2); ctx.fillStyle = '#ff9a2e'; ctx.fillRect(2,-5,7,2);
  },
  minigun(T) {
    const sp = T * .03;
    ctx.fillStyle = '#4a5640'; rr(8,-17,16,9,2); ctx.fill(); ctx.strokeStyle = '#ffcf33'; ctx.lineWidth = 1.2; for (let k = 0; k < 4; k++) line(11+k*4,-17,11+k*4,-8);
    ctx.fillStyle = '#2b323b'; ctx.fillRect(-4,-6,10,11);
    ctx.fillStyle = lg(0,-9,0,8,['#7d8995','#3b434d','#1b2027']); rr(6,-9,24,17,4); ctx.fill();
    for (let k = 0; k < 6; k++) { const a = sp + k * 1.047, yy = Math.sin(a) * 5; ctx.fillStyle = Math.cos(a) > 0 ? '#9aa5b1' : '#4d5763'; ctx.fillRect(30,yy-1.7,28,3.4); }
    ctx.fillStyle = '#2b323b'; ctx.fillRect(34,-8,3,16); ctx.fillRect(52,-8,3,16);
    poly([[13,8],[20,8],[18,17],[12,17]],'#1c2128'); ctx.fillStyle = '#1c2128'; rr(26,8,6,9,2); ctx.fill();
  },
  grenade() {
    ctx.fillStyle = lg(0,-8,0,6,['#8a9a7a','#4a5640','#2b3326']); rr(0,-8,36,14,4); ctx.fill();
    ctx.fillStyle = lg(0,-6,0,5,['#7d8995','#2b323b']); rr(34,-6,22,11,3); ctx.fill(); ctx.fillStyle = '#14181d'; ctx.fillRect(54,-7,4,13);
    ctx.fillStyle = lg(0,-4,0,14,['#59626d','#22272e']); ctx.beginPath(); ctx.arc(14,5,9,0,6.3); ctx.fill();
    ctx.fillStyle = '#0e1116'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(14+Math.cos(k*1.047)*5,5+Math.sin(k*1.047)*5,1.8,0,6.3); ctx.fill(); }
    poly([[5,4],[12,4],[10,15],[3,15]],'#1c2128'); poly([[22,6],[28,6],[27,15],[21,15]],'#1c2128');
    ctx.fillStyle = '#ffcf33'; ctx.fillRect(40,-10,4,3);
  },
  chainsaw(T) {
    ctx.fillStyle = lg(0,-8,0,7,['#ffb04a','#e8731a','#a8430a']); rr(-8,-8,26,15,4); ctx.fill();
    ctx.fillStyle = '#8f9ba8'; rr(18,-4.5,32,9,4.5); ctx.fill(); ctx.fillStyle = '#2b323b'; rr(20,-3,28,6,3); ctx.fill();
    ctx.fillStyle = '#e8eef5'; const off = (T * .05) % 5; for (let x = 18 + off; x < 47; x += 5) { ctx.fillRect(x,-6.4,2.2,2.2); ctx.fillRect(x,4.2,2.2,2.2); }
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2; for (let k = 0; k < 4; k++) line(-2+k*4,-6,-2+k*4,-1);
    poly([[-6,6],[2,6],[0,15],[-8,15]],'#1c2128'); poly([[10,6],[17,6],[16,15],[9,15]],'#1c2128');
  },
  boomerang() {
    ctx.strokeStyle = lg(0,-16,16,16,['#ffd27a','#d8862a','#8a4a12']); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(4,-16); ctx.lineTo(14,0); ctx.lineTo(4,16); ctx.stroke();
    ctx.strokeStyle = '#d83a2a'; ctx.lineWidth = 2; line(6,-9,12,-6); line(6,9,12,6);
  },
  katana() {
    ctx.strokeStyle = '#14181d'; ctx.lineWidth = 4.5; line(-9,0,4,0); ctx.strokeStyle = '#d83a2a'; ctx.lineWidth = 1.2; for (let k = 0; k < 4; k++) line(-8+k*3,-2.5,-6+k*3,2.5);
    ctx.fillStyle = '#c9a43a'; ctx.beginPath(); ctx.arc(-10,0,2.6,0,6.3); ctx.fill();
    ctx.fillStyle = lg(0,-6,0,6,['#ffe38a','#c8922a']); ctx.beginPath(); ctx.ellipse(6,0,2.6,6.5,0,0,6.3); ctx.fill();
    ctx.fillStyle = lg(0,-4,0,3,['#ffffff','#b8c4d2','#6c7889']); ctx.beginPath(); ctx.moveTo(8,-2); ctx.quadraticCurveTo(38,-3,64,-8); ctx.quadraticCurveTo(40,2.2,8,2.5); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,95,130,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(10,.7); ctx.quadraticCurveTo(38,-.4,58,-4.5); ctx.stroke();
    glow('#9cf',6); ctx.strokeStyle = 'rgba(210,235,255,.95)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(9,-2); ctx.quadraticCurveTo(38,-3,64,-8); ctx.stroke(); ctx.shadowBlur = 0;
  }
};
function ik(ax, ay, bx, by, L1, L2, px, py) {
  let dx = bx - ax, dy = by - ay, dd = Math.hypot(dx, dy) || .001; const m = L1 + L2 - .01;
  if (dd > m) { bx = ax + dx / dd * m; by = ay + dy / dd * m; dx = bx - ax; dy = by - ay; dd = m; }
  const a = (L1*L1 - L2*L2 + dd*dd) / (2*dd), h = Math.sqrt(Math.max(0, L1*L1 - a*a)), mx = ax + dx/dd*a, my = ay + dy/dd*a, nx = -dy/dd, ny = dx/dd;
  const e1 = [mx + nx*h, my + ny*h], e2 = [mx - nx*h, my - ny*h];
  const s1 = (e1[0]-mx)*px + (e1[1]-my)*py, s2 = (e2[0]-mx)*px + (e2[1]-my)*py;
  return { e: s1 >= s2 ? e1 : e2, h: [bx, by] };
}
function limb(ax, ay, bx, by, px, py) {
  const r = ik(ax, ay, bx, by, 11, 11, px, py);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(r.e[0], r.e[1]); ctx.lineTo(r.h[0], r.h[1]); ctx.stroke(); return r.h;
}
function drawF(f) {
  if (f.shield > 0 && f.shield % 6 < 3) return;
  const d = f.dir, col = f.flash > 0 ? '#ffffff' : f.slow > 0 ? '#9fe8ff' : f.color, air = !f.ground;
  const run = f.ground ? Math.min(1, Math.abs(f.vx) / 3) : 0;
  const lean = Math.max(-6, Math.min(6, f.vx * .9));
  const bob = -Math.abs(Math.cos(f.phase)) * 3 * run + Math.sin(t * .08 + f.index) * .7 * (1 - run);
  const sqz = f.sq > 0 ? f.sq * .02 : 0, str = air ? Math.min(.08, Math.abs(f.vy) * .005) : 0;
  const scx = 1 + sqz - str * .5, scy = 1 - sqz + str;
  ctx.save(); ctx.translate(f.x, f.y); ctx.translate(0, 26); ctx.scale(scx, scy); ctx.translate(0, -26);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 5.5; ctx.strokeStyle = col; ctx.shadowColor = f.color; ctx.shadowBlur = 10;
  const hipY = 8 + bob, neckY = -13 + bob, shx = lean, shy = neckY + 3;
  // legs
  const sp0 = 5 * (1 - run); let tf, tb;
  if (air) { if (f.vy < 0) { tf = [7*d, 17]; tb = [-5*d, 21]; } else { tf = [9*d, 25]; tb = [-8*d, 24]; } }
  else { const a = f.phase; tf = [Math.sin(a)*12*run + sp0*d, 26 - Math.max(0, Math.cos(a))*7*run]; tb = [Math.sin(a+Math.PI)*12*run - sp0*d, 26 - Math.max(0, Math.cos(a+Math.PI))*7*run]; }
  for (const tg of [tb, tf]) { const h = limb(0, hipY, tg[0], tg[1], d, 0); ctx.beginPath(); ctx.moveTo(h[0], h[1]); ctx.lineTo(h[0] + d*4, h[1]); ctx.stroke(); }
  line(0, hipY, lean, neckY);
  const look = window.PartyEconomy ? window.PartyEconomy.look(f.index) : null;
  if (look) window.PartyEconomy.drawOutfit(ctx, look.outfit, 0, hipY, lean, neckY, 7);
  // weapon pose
  const wp = f.weapon, g = GR[wp] || [0, 0], two = g.length > 2, atk = f.atkT > 0, p = f.atkP;
  let ang = f.va, extra = 0;
  if (atk) { if (wp === 'fist' || wp === 'spear' || wp === 'staff') extra = -.5 + 1.0 * p; else if (wp === 'sword') extra = -1.4 + 2.8 * p; else if (wp === 'katana') extra = -1.2 + 2.4 * p; else if (wp === 'hammer' || wp === 'axe') extra = p < .55 ? -2.0 * (p / .55) : -2.0 + 3.0 * ((p - .55) / .45); else if (wp === 'chainsaw') extra = Math.sin(t * 1.9) * .07; }
  else extra = (wp === 'hammer' || wp === 'axe') ? -.9 : wp === 'sword' ? -.35 : wp === 'katana' ? -.45 : wp === 'bomb' ? -.5 : wp === 'boomerang' ? -.3 : 0;
  ang += d * extra - d * f.recoil * .12;
  const rc = f.recoil * 6.5;
  let d1 = wp === 'fist' ? 13 + (atk ? 11 * Math.sin(p * Math.PI) : 0) : two ? Math.max(6, 21 - (g[2] - g[0])) : ONE_RANGED.has(wp) ? 20 : 16;
  d1 -= rc;
  const ca = Math.cos(ang), sa = Math.sin(ang), sgn = Math.abs(f.fs) < .05 ? (f.fs < 0 ? -.05 : .05) : f.fs;
  const h1 = [shx + ca * d1, shy + sa * d1];
  const W = (px, py) => { const lx = px - g[0], ly = (py - g[1]) * sgn; return [h1[0] + lx*ca - ly*sa, h1[1] + lx*sa + ly*ca]; };
  // back arm (hanging) behind body
  if (!two) limb(shx, shy, shx + Math.sin(f.phase + Math.PI) * 9 * run - d * 3, shy + (air ? 10 : 15), 0, 1);
  // head
  const hx0 = lean * 1.2, hy0 = -23 + bob;
  ctx.lineWidth = 5.5; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(hx0, hy0, 9, 0, 6.3); ctx.fillStyle = col; ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.fillRect(hx0 + Math.cos(f.va) * 3.5 - 1, hy0 - 2 + Math.sin(f.va) * 2.5 - 1, 3, 3);
  if (look) window.PartyEconomy.drawHeadgear(ctx, look, hx0, hy0, 1, d);
  ctx.shadowBlur = 10; ctx.strokeStyle = col; ctx.lineWidth = 5.5;
  // weapon
  ctx.save(); ctx.translate(h1[0], h1[1]); ctx.rotate(ang); ctx.scale(1, sgn); ctx.translate(-g[0], -g[1]); ctx.shadowBlur = 0;
  if (wp !== 'fist' && !(wp === 'spear' && f.cd > 8)) weaponSprite(wp);
  if (f.mf > 0 && MUZ[wp]) { ctx.globalCompositeOperation = 'lighter'; const m0 = MUZ[wp], r0 = 10 + f.mf * 3, g0 = ctx.createRadialGradient(m0, 0, 0, m0, 0, r0); g0.addColorStop(0, '#fff'); g0.addColorStop(.4, MUZC[wp]); g0.addColorStop(1, 'rgba(255,160,0,0)'); ctx.fillStyle = g0; ctx.beginPath(); ctx.arc(m0, 0, r0, 0, 6.3); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  if (atk && (wp === 'sword' || wp === 'katana' || wp === 'hammer' || wp === 'axe') && p > .3 && p < .8) { ctx.save(); ctx.translate(h1[0], h1[1]); ctx.rotate(ang); ctx.scale(1, sgn); ctx.shadowColor = '#bfe6ff'; ctx.shadowBlur = 12; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, wp === 'sword' ? 44 : wp === 'katana' ? 52 : 50, -1.0, .6); ctx.stroke(); ctx.restore(); }
  // front arm + hands
  ctx.shadowBlur = 10; ctx.strokeStyle = col; ctx.lineWidth = 5.5; ctx.fillStyle = col;
  const ha = limb(shx, shy, h1[0], h1[1], 0, 1); ctx.beginPath(); ctx.arc(ha[0], ha[1], wp === 'fist' ? 4.6 : 3.4, 0, 6.3); ctx.fill();
  if (look && look.accessory && look.accessory.kind === 'bracelet') window.PartyEconomy.drawAccessory(ctx, 'bracelet', ha[0], ha[1], 1, d);
  if (two) { const t2 = W(g[2], g[3]), hb = limb(shx, shy, t2[0], t2[1], 0, 1); ctx.beginPath(); ctx.arc(hb[0], hb[1], 3.4, 0, 6.3); ctx.fill(); }
  ctx.restore();
}
const crateIcons = new Map();
function crateIcon(w) {
  if (crateIcons.has(w)) return crateIcons.get(w);
  const image = document.createElement('canvas'); image.width = 320; image.height = 200;
  const g = image.getContext('2d'), previous = ctx;
  g.setTransform(2, 0, 0, 2, 70, 100);
  try { ctx = g; weaponSprite(w); } finally { ctx = previous; }
  const pixels = g.getImageData(0, 0, image.width, image.height).data;
  let left = image.width, top = image.height, right = 0, bottom = 0;
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) {
    if (pixels[(y * image.width + x) * 4 + 3] < 8) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  const icon = { image, x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
  crateIcons.set(w, icon);
  return icon;
}
function draw() {
  const cw = canvas.width, ch = canvas.height; sc = Math.min(cw / W, ch / H); ox = (cw - W * sc) / 2; oy = (ch - H * sc) / 2;
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle = '#05060f'; ctx.fillRect(0,0,cw,ch);
  const sx = (Math.random() - .5) * shake, sy = (Math.random() - .5) * shake;
  ctx.setTransform(sc,0,0,sc,ox + sx*sc, oy + sy*sc); ctx.save(); ctx.beginPath(); ctx.rect(-30,-30,W+60,H+60); ctx.clip();
  ctx.drawImage(bg, 0, 0);
  if (M.style === 'snow') { ctx.fillStyle='rgba(255,255,255,.8)'; for (const s of snow) ctx.fillRect(s.x,(s.y+t*s.v*.35)%H,s.s,s.s); }
  if (M.style === 'lava' || M.style === 'factory') { ctx.fillStyle='rgba(255,140,40,.7)'; for (const s of snow) ctx.fillRect(s.x, H - ((s.y*1.3 + t*s.v*.5) % H), s.s, s.s); }
  if (M.style === 'forest') { ctx.shadowColor='#c8ff78'; ctx.shadowBlur=8; for (const s of snow) { ctx.fillStyle='rgba(190,255,120,'+(.45+.45*Math.sin(t*.012+s.s*9))+')'; ctx.beginPath(); ctx.arc(s.x+Math.sin(t*.005+s.s*5)*26, 70+((s.x*7.3)%470)+Math.sin(t*.007+s.x)*16, s.s+.8,0,6.3); ctx.fill(); } ctx.shadowBlur=0; }
  if (M.style === 'sky') { ctx.fillStyle='rgba(255,255,255,.16)'; for (let i=0;i<5;i++) { ctx.beginPath(); ctx.ellipse(((i*330+t*.25*(1+i%3))%1600)-160,110+i*85,120,24,0,0,6.3); ctx.fill(); } }
  if (M.style === 'graveyard') { for (const s of snow) { ctx.fillStyle='rgba(170,200,255,'+(.12+.12*Math.sin(t*.01+s.x))+')'; ctx.beginPath(); ctx.arc(s.x+Math.sin(t*.006+s.s*4)*30, 120+((s.x*5.1)%420)+Math.sin(t*.008+s.x)*20, 5+s.s*2,0,6.3); ctx.fill(); } }
  if (M.style === 'neon') { ctx.strokeStyle='rgba(120,220,255,.3)'; ctx.lineWidth=1.2; for (const s of snow) { const y=(s.y+t*s.v*1.2)%H; line(s.x,y,s.x-4,y+16); } }
  if (M.style === 'space') { ctx.fillStyle='#fff'; for (const s of snow) { ctx.globalAlpha=.3+.7*Math.abs(Math.sin(t*.03+s.x)); ctx.fillRect(s.x,s.y*.9,s.s,s.s); } ctx.globalAlpha=1; }
  if (M.style === 'desert') { ctx.strokeStyle='rgba(255,230,180,.28)'; ctx.lineWidth=1.5; for (const s of snow) { const x=(s.x+t*s.v*.8)%W, y=s.y*.95; line(x,y,x+14,y); } }
  if (M.style === 'ocean') { ctx.strokeStyle='rgba(200,245,255,.55)'; ctx.lineWidth=1.2; for (const s of snow) { const y=H-((s.y*1.05+t*s.v*.18)%H); ctx.beginPath(); ctx.arc(s.x+Math.sin(t*.008+s.y)*5,y,s.s*1.7+1,0,6.3); ctx.stroke(); } }
  if (M.style === 'sakura') { ctx.fillStyle='rgba(255,170,200,.85)'; for (const s of snow) { ctx.beginPath(); ctx.ellipse(s.x+Math.sin(t*.004+s.y*.05)*18,(s.y+t*s.v*.45)%H,3+s.s,2,t*.008+s.x,0,6.3); ctx.fill(); } }
  if (M.style === 'rooftop') { ctx.strokeStyle='rgba(170,200,255,.35)'; ctx.lineWidth=1.2; for (const s of snow) { const yy=((s.y*1.3+t*(1.4+s.v*1.4))%H), xx=(s.x-yy*.18+W)%W; line(xx,yy,xx-3,yy+14); } if (t%700<4) { ctx.fillStyle='rgba(220,230,255,.14)'; ctx.fillRect(0,0,W,H); } }
  if (M.style === 'candy') { for (let i=0;i<snow.length;i++) { const s=snow[i]; ctx.fillStyle=['#ff6b6b','#ffd23f','#6bd4ff','#7be07b','#c58bff'][i%5]; ctx.save(); ctx.translate(s.x+Math.sin(t*.01+s.y)*18,(s.y+t*s.v*.35)%H); ctx.rotate(t*.03+i); ctx.fillRect(-4,-1.5,8,3); ctx.restore(); } }
  if (M.style === 'ice') { ctx.fillStyle='rgba(220,250,255,.75)'; for (const s of snow) { ctx.beginPath(); ctx.arc(s.x+Math.sin(t*.004+s.y)*10,(s.y+t*s.v*.25)%H,s.s*.9+.4,0,6.3); ctx.fill(); } }
  if (M.style === 'retro') { ctx.lineWidth=1.5; for (let k=0;k<9;k++) { const z=((t*.006+k/9)%1), yy=520+z*z*200; ctx.strokeStyle='rgba(255,60,200,'+(.2+z*.4)+')'; line(0,yy,W,yy); } for (const s of snow) { ctx.fillStyle='rgba(255,255,255,'+(.3+.7*Math.abs(Math.sin(t*.03+s.x)))+')'; ctx.fillRect(s.x,s.y*.45,s.s,s.s); } }
  if (M.style === 'mars') { ctx.strokeStyle='rgba(255,200,160,.25)'; ctx.lineWidth=1.5; for (const s of snow) { const xx=(s.x+t*s.v*.8)%W, yy=s.y*.95; line(xx,yy,xx+16,yy); } }
  if (M.style === 'chain') { ctx.strokeStyle='#7d7567'; ctx.lineWidth=9; ctx.setLineDash([14,9]); line(230,525,0,470); line(1050,525,1280,470); ctx.setLineDash([]); }
  if (M.bars) for (const b of M.bars) { ctx.lineCap='round'; ctx.strokeStyle='#c91e3c'; ctx.lineWidth=48; line(b[0],b[1],b[2],b[3]); ctx.strokeStyle='#0a0a1e'; ctx.lineWidth=34; line(b[0],b[1],b[2],b[3]);
    ctx.fillStyle='#0a0a1e'; for (let k=0;k<=10;k++){ const px=b[0]+(b[2]-b[0])*k/10, py=b[1]+(b[3]-b[1])*k/10; ctx.beginPath(); ctx.moveTo(px-9,py+14); ctx.lineTo(px,py+36); ctx.lineTo(px+9,py+14); ctx.fill(); } }
  if (M.ball) { const [bx,by,a] = ballPos(); ctx.strokeStyle='#222'; ctx.lineWidth=5; line(640,-230,bx,by); ctx.save(); ctx.translate(bx,by); ctx.rotate(a*2); ctx.fillStyle='#05051c'; ctx.beginPath();
    for (let k=0;k<32;k++){ const an=k/32*6.283, r=k%2?150:176; ctx.lineTo(Math.cos(an)*r, Math.sin(an)*r); } ctx.fill(); ctx.restore(); }
  M.pl.forEach(platform);
  if (M.walls) for (const x of [0, W-16]) { ctx.fillStyle='rgba(6,6,14,.85)'; ctx.fillRect(x,-20,16,H+40); ctx.fillStyle='rgba(255,255,255,.16)'; ctx.fillRect(x?x:14,-20,2,H+40); }
  if (M.belts) for (const [bi,dr] of M.belts) { const b = M.pl[bi]; ctx.save(); ctx.beginPath(); ctx.rect(b[0],b[1]+4,b[2],10); ctx.clip(); ctx.fillStyle='#ffcf33'; for (let x=b[0]-24+(((t*1.4*dr)%24)+24)%24; x<b[0]+b[2]; x+=24) ctx.fillRect(x,b[1]+5,10,6); ctx.restore(); }
  if (M.pads) for (const pd of M.pads) { ctx.save(); ctx.shadowColor='#7dff9a'; ctx.shadowBlur=14; ctx.fillStyle='#7dff9a'; rr(pd[0]-pd[2]/2,pd[1]-6,pd[2],6,3); ctx.fill(); ctx.fillStyle='rgba(125,255,154,.5)'; ctx.fillRect(pd[0]-pd[2]/2+6,pd[1]-14+Math.sin(t*.2)*3,pd[2]-12,3); ctx.restore(); }
  for (const c of crates) { ctx.save(); if (!c.ground) { ctx.strokeStyle='#ffd54a'; ctx.lineWidth=1.5; ctx.fillStyle='rgba(255,213,74,.35)'; ctx.beginPath(); ctx.arc(c.x,c.y-34,22,Math.PI,0); ctx.fill(); ctx.stroke(); line(c.x-22,c.y-34,c.x-8,c.y-14); line(c.x+22,c.y-34,c.x+8,c.y-14); } ctx.shadowColor='#ffd54a'; ctx.shadowBlur=14; ctx.fillStyle='#3a2a10'; rr(c.x-14,c.y-14,28,28,4); ctx.fill(); ctx.strokeStyle='#ffd54a'; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0; const icon=crateIcon(c.w), fit=Math.min(24/icon.w,24/icon.h); ctx.drawImage(icon.image,icon.x,icon.y,icon.w,icon.h,c.x-icon.w*fit/2,c.y-icon.h*fit/2,icon.w*fit,icon.h*fit); ctx.restore(); }
  for (const p of proj) { if (p.t==='B') { ctx.save(); ctx.translate(p.x,p.y); weaponSprite('bomb'); ctx.restore(); if (p.l<30 && p.l%6<3){ ctx.fillStyle='rgba(255,60,30,.5)'; ctx.beginPath(); ctx.arc(p.x,p.y,13,0,6.3); ctx.fill(); } }
    else if (p.t==='S') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.atan2(p.vy,p.vx)); ctx.translate(-80,0); weaponSprite('spear'); ctx.restore(); }
    else if (p.t==='A') { ctx.strokeStyle='#d9b27a'; ctx.lineWidth=2.5; const a=Math.atan2(p.vy,p.vx), c=Math.cos(a), sn=Math.sin(a); line(p.x-c*14,p.y-sn*14,p.x+c*8,p.y+sn*8); ctx.fillStyle='#dfe6ee'; ctx.beginPath(); ctx.moveTo(p.x+c*13,p.y+sn*13); ctx.lineTo(p.x+c*5-sn*3,p.y+sn*5+c*3); ctx.lineTo(p.x+c*5+sn*3,p.y+sn*5-c*3); ctx.fill(); }
    else if (p.t==='M') { ctx.save(); ctx.translate(p.x,p.y); weaponSprite('mine'); if (p.arm<=0 && t%24<8) { ctx.fillStyle='rgba(255,40,40,.6)'; ctx.beginPath(); ctx.arc(8,-3,6,0,6.3); ctx.fill(); } ctx.restore(); }
    else if (p.t==='R') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.atan2(p.vy,p.vx)); ctx.fillStyle='#d0d6dc'; ctx.fillRect(-9,-3,18,6); ctx.fillStyle='#e23'; ctx.beginPath(); ctx.moveTo(9,-3); ctx.lineTo(15,0); ctx.lineTo(9,3); ctx.fill(); ctx.restore(); }
    else if (p.t==='N') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(t*.2); ctx.fillStyle='#4a5640'; ctx.beginPath(); ctx.arc(0,0,7.5,0,6.3); ctx.fill(); ctx.fillStyle='#ffcf33'; ctx.fillRect(-7.5,-1.5,15,3); ctx.restore(); if (p.l<30 && p.l%6<3) { ctx.fillStyle='rgba(255,60,30,.5)'; ctx.beginPath(); ctx.arc(p.x,p.y,13,0,6.3); ctx.fill(); } }
    else if (p.t==='Y') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(t*.5); ctx.translate(-12,0); weaponSprite('boomerang'); ctx.restore(); }
    else if (p.t==='L') { ctx.save(); ctx.lineCap='round'; ctx.shadowColor='#4ff'; ctx.shadowBlur=14; ctx.strokeStyle='#4ff'; ctx.lineWidth=5; line(p.x,p.y,p.x-p.vx*1.6,p.y-p.vy*1.6); ctx.strokeStyle='#fff'; ctx.lineWidth=2; line(p.x,p.y,p.x-p.vx*1.3,p.y-p.vy*1.3); ctx.restore(); }
    else if (p.t==='H') { ctx.save(); ctx.shadowColor='#fff'; ctx.shadowBlur=6; shuriken(p.x,p.y,11,t*.5); ctx.restore(); }
    else if (p.t==='O') { const pu=1+Math.sin(t*.4)*.15; ctx.save(); ctx.shadowColor='#c6f'; ctx.shadowBlur=20; const g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,13*pu); g.addColorStop(0,'#fff'); g.addColorStop(.45,'#d58bff'); g.addColorStop(1,'rgba(120,30,200,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,13*pu,0,6.3); ctx.fill(); ctx.restore(); }
    else if (p.t==='Z') { ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.atan2(p.vy,p.vx)); ctx.shadowColor='#9df'; ctx.shadowBlur=14; ctx.fillStyle='#dff6ff'; ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(0,-5); ctx.lineTo(-10,0); ctx.lineTo(0,5); ctx.closePath(); ctx.fill(); ctx.fillStyle='#6cc3f0'; ctx.beginPath(); ctx.moveTo(12,0); ctx.lineTo(0,0); ctx.lineTo(0,5); ctx.closePath(); ctx.fill(); ctx.restore(); }
    else if (p.t==='F') { const k=p.l/24, rad=5+(1-k)*9; ctx.globalAlpha=k; const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad); g.addColorStop(0,'#fff3a0'); g.addColorStop(.5,'#ff8a1f'); g.addColorStop(1,'rgba(255,60,0,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,6.3); ctx.fill(); ctx.globalAlpha=1; }
    else { ctx.strokeStyle='#ffe27a'; ctx.lineWidth=p.t==='p'?2:3; ctx.shadowColor='#ffd54a'; ctx.shadowBlur=8; line(p.x,p.y,p.x-p.vx*1.6,p.y-p.vy*1.6); ctx.shadowBlur=0; } }
  for (const f of fs) if (f.alive && f.weapon === 'sniper') { const ax = Math.cos(f.aim), ay = Math.sin(f.aim), x0 = f.x + ax * 38, y0 = f.y - 8 + ay * 38; let x = x0, y = y0;
    for (let i = 0; i < 230; i++) { x += ax * 6; y += ay * 6; if (x < -10 || x > W + 10 || y < -60 || y > H + 60 || inRect(x, y)) break; }
    ctx.save(); ctx.strokeStyle = 'rgba(255,40,40,' + (.55 + .25 * Math.sin(t * .4)) + ')'; ctx.lineWidth = 1.6; ctx.shadowColor = '#f22'; ctx.shadowBlur = 8; line(x0, y0, x, y); ctx.fillStyle = '#ff5050'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 6.3); ctx.fill(); ctx.restore(); }
  for (const f of fs) if (f.alive && f.ground) { ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(f.x,f.y+27,15,4,0,0,6.3); ctx.fill(); }
  for (const f of fs) if (f.alive) drawF(f);
  // player name tags
  ctx.save(); ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of fs) {
    if (!f.alive) continue;
    const nm = (typeof PLAYER_NAMES !== 'undefined' && PLAYER_NAMES[f.index]) || ('P' + (f.index + 1));
    const look = window.PartyEconomy ? window.PartyEconomy.look(f.index) : null;
    const ext = look ? window.PartyEconomy.headTop(look, 12) : 12;
    const hpY = f.y - 23 - ext - 8;
    const w = ctx.measureText(nm).width + 18, x = f.x, y = hpY - 13;
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 18, hpY, 36, 4);
    ctx.fillStyle = f.hp > 40 ? '#4ade80' : '#f87171'; ctx.fillRect(x - 18, hpY, 36 * Math.max(0, f.hp) / 100, 4);
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1; ctx.strokeRect(x - 18, hpY, 36, 4);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(5,9,18,.72)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x - w / 2, y - 9, w, 18, 9); else ctx.rect(x - w / 2, y - 9, w, 18);
    ctx.fill();
    ctx.strokeStyle = f.color; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(x - w / 2 + 8, y, 2.6, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#eaf2ff'; ctx.fillText(nm, x + 4, y + 0.5);
  }
  ctx.restore(); ctx.globalAlpha = 1;
  for (const d of debris) { ctx.save(); ctx.translate(d.x,d.y); ctx.rotate(d.a); ctx.strokeStyle=d.c; ctx.lineWidth=5; ctx.lineCap='round'; line(-d.len/2,0,d.len/2,0); ctx.restore(); }
  ctx.globalCompositeOperation = 'lighter';
  for (const p of parts) if (p.g) { ctx.globalAlpha = p.l / p.m; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*1.6,0,6.3); ctx.fill(); }
  for (const b of beams) { const bc = b.c || '#ff5a5a'; ctx.globalAlpha = Math.min(1, b.l / 14); ctx.strokeStyle = bc; ctx.lineWidth = 5; ctx.shadowColor = bc; ctx.shadowBlur = 14; bp(b); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; bp(b); ctx.shadowBlur = 0; }
  for (const e of fx) { const k = e.t / 30, g = ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,40+k*110); g.addColorStop(0,'rgba(255,230,140,'+(1-k)+')'); g.addColorStop(.5,'rgba(255,120,30,'+(.7*(1-k))+')'); g.addColorStop(1,'rgba(255,60,0,0)'); ctx.globalAlpha=1; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(e.x,e.y,40+k*110,0,6.3); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  for (const p of parts) if (!p.g) { ctx.globalAlpha = p.l / p.m; ctx.fillStyle = p.c; ctx.fillRect(p.x,p.y,p.r,p.r); } ctx.globalAlpha = 1;
  if (M.lava) { const g = ctx.createLinearGradient(0,lavaY,0,H); g.addColorStop(0,'#ffb02e'); g.addColorStop(.15,'#ff5a1f'); g.addColorStop(1,'#7a1205'); ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(0,H); for (let x=0;x<=W;x+=20) ctx.lineTo(x, lavaY + Math.sin(x*.03+t*.06)*5); ctx.lineTo(W,H); ctx.fill(); }
  const vg = ctx.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.55)'); ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center'; ctx.shadowColor='#000'; ctx.shadowBlur=8;
  ctx.fillStyle='rgba(255,255,255,.6)'; ctx.font='bold 15px Arial'; ctx.fillText(M.name + (cfg.loot ? '  •  📦 Loot Drop' : '') + '  •  Raund ' + currentRound + '/' + cfg.rounds, W/2, 24);
  if (cd > 0) { const n = Math.ceil((cd - 30) / 40); ctx.fillStyle='#fff'; ctx.font='bold 96px Arial'; ctx.fillText(n > 0 ? n : 'DÖYÜŞ!', W/2, H/2 - 20); }
  if (over && banner > 0) { ctx.fillStyle=bannerCol; ctx.font='bold 60px Arial'; ctx.fillText(bannerTxt, W/2, H/2); }
  ctx.shadowBlur = 0; ctx.restore();
}
function loop(now) {
  if (!F.on) return; F.raf = requestAnimationFrame(loop);
  if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; cw = canvas.width; ch = canvas.height; }
  pollKeyboard(); if (paused) { F.acc = 0; return; }
  if (now === undefined) now = performance.now();
  if (!F.last) F.last = now;
  F.acc = (F.acc || 0) + (now - F.last); F.last = now;
  const STEP = 1000 / 60; let n = 0;
  if (F.netRole !== 'guest') { while (F.acc >= STEP && n < 4) { if (gameState === 'playing' || over) step(); F.acc -= STEP; n++; } }
  else F.acc = 0;
  if (F.acc > STEP * 4) F.acc = 0;
  draw();
  if (F.netRole && window.__fightSend) window.__fightSend();
  window._ht = (window._ht || 0) + 1;
}

window.addEventListener('DOMContentLoaded', () => {
  const st = document.createElement('style'); st.textContent = '.weapon-choices{flex-wrap:wrap}.weapon-chip{flex:1 1 21%}'; document.head.appendChild(st);
  document.querySelectorAll('.weapon-choices').forEach(box => {
    const p = +box.dataset.player;
    [['shotgun','','Shotgun'],['sniper','🎯','Snayper'],['rocket','🚀','Raket'],['flame','🔥','Alov'],['spear','🔱','Nizə'],['bow','🏹','Ox'],['smg','💨','SMG'],['mine','🧨','Mina'],['axe','🪓','Balta'],['laser','🛸','Lazer'],['shuriken','🌟','Şüriken'],['staff','🔮','Əsa'],['frost','❄️','Buz'],['tesla','⚡','Tesla'],['rifle','🔰','Avtomat'],['minigun','⚙️','Pulemyot'],['grenade','🍍','Qranat'],['chainsaw','🪚','Mişar'],['boomerang','🪃','Bumeranq'],['katana','⚔️','Katana'],['random','🎲','Təsadüfi']].forEach(([k, ic, n]) => {
      const c = document.createElement('div'); c.className = 'weapon-chip'; c.dataset.weapon = k; c.setAttribute('onclick', 'selectWeapon(this,' + p + ')');
      c.innerHTML = '<span class="weapon-icon">' + ((typeof WEP_SVG !== 'undefined' && WEP_SVG[k]) || ic) + '</span>' + n; box.appendChild(c);
    });
  });
  const grid = document.getElementById('mapGrid');
  const set = (key, ic, ti, de) => {
    let c = grid.querySelector('[data-map="' + key + '"]');
    if (!c) { c = document.createElement('div'); c.className = 'game-card'; c.dataset.map = key; c.setAttribute('onclick', 'selectMap(this)');
      c.innerHTML = '<span class="card-icon"></span><span class="card-title"></span><span class="card-desc"></span>'; grid.appendChild(c); }
    c.querySelector('.card-icon').textContent = ic; c.querySelector('.card-title').textContent = ti; c.querySelector('.card-desc').textContent = de;
  };
  set('arena','🏔️','Qar adaları','Qarlı gecə'); set('castle','🏰','Zəncirli körpü','Mişarlı tələ'); set('platforms','🌆','Neon şəhər','Atlama pedləri');
  set('lava','🌋','Lava','Qalxan lava'); set('space','🚀','Kosmos','Aşağı cazibə'); set('forest','🌲','Meşə','Atəşböcəkləri'); set('desert','🏜️','Səhra','Qum küləyi'); set('ocean','🌊','Dəniz dibi','Baloncuklar'); set('sakura','🌸','Sakura məbədi','Çiçək yağışı'); set('sky','☁️','Göy adaları','Gün batımı'); set('factory','🏭','Zavod','Konveyer lentləri'); set('graveyard','🪦','Qəbiristanlıq','Ruhlar'); set('rooftop','🌃','Dam üstü','Yağış və ildırım'); set('candy','🍭','Şirniyyat','Şəkər yağışı'); set('icecave','🧊','Buz mağarası','Sürüşkən yer'); set('retro','🌴','Retro dalğa','Neon şəbəkə'); set('mars','🪐','Mars','Aşağı cazibə'); set('random','🎲','Təsadüfi','Hər raund yeni xəritə');
  const wsel = document.getElementById('weaponSelector'), h = wsel.previousElementSibling, row = document.createElement('div');
  row.className = 'btn-row mb-12'; row.innerHTML = '<button class="btn btn-sm" id="modeArmed">⚔️ Silahlı</button><button class="btn btn-sm" id="modeLoot">📦 Loot Drop</button>';
  h.parentNode.insertBefore(row, h);
  const setMode = l => { window.lootMode = l; document.getElementById('modeArmed').className = 'btn btn-sm ' + (l ? 'btn-ghost' : 'btn-danger'); document.getElementById('modeLoot').className = 'btn btn-sm ' + (l ? 'btn-warning' : 'btn-ghost'); wsel.style.display = h.style.display = l ? 'none' : ''; };
  document.getElementById('modeArmed').onclick = () => setMode(false); document.getElementById('modeLoot').onclick = () => setMode(true); setMode(false);
});
window.FightPreview = function (cv, index, phase) {
  const g = cv.getContext('2d'); if (!g) return;
  const prevCtx = ctx;
  ctx = g;
  const scale = cv.width / 70;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, cv.width / scale, cv.height / scale);
  const fake = { index, color: PLAYER_COLORS[index] || '#5ff', x: cv.width / (2 * scale), y: cv.height / scale - 30,
    vx: Math.sin(phase) * 1.4, vy: 0, dir: 1, aim: 0, va: 0, fs: 1, ground: true, phase,
    weapon: 'fist', atkT: 0, atkP: 0, recoil: 0, mf: 0, sq: 0, flash: 0, slow: 0, shield: 0, hp: 100, alive: true };
  const prevT = t; t = Math.round(phase * 6);
  try { drawF(fake); } finally { t = prevT; ctx = prevCtx; }
};
window.Fight = F;
window.FightMeta = { ICON, MAPNAMES: Object.fromEntries(Object.entries(MAPS).map(([k, v]) => [k, v.name])), WEAPONS: Object.keys(WD), MAPS: Object.keys(MAPS) };

// hook into the existing engine
const _sg = startGame, _qm = quitToMenu, _rm = restartMatch;
startGame = function (mode, map, pc, rounds, weps) {
  if (mode === 'vs') { F.netRole = onlineMode ? (isHost ? 'host' : 'guest') : null; F.start(map, pc, rounds, weps); }
  else { F.stop(); F.netRole = null; _sg.apply(null, arguments); }
};
quitToMenu = function () { F.stop(); F.netRole = null; _qm(); };
restartMatch = function () { if (F.on) { if (F.netRole === 'guest') { if (window.__sendRematch) window.__sendRematch(); } else F.restart(); } else _rm(); };
})();
