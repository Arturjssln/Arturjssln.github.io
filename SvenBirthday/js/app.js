/* La Pellicule — bundle (généré, ne pas éditer : modifier les fichiers sources dans js/) */
/* ===== js/audio.js ===== */
/* La Pellicule — sons synthétisés (aucun fichier audio) */
(function () {
  'use strict';
  let ac = null, master = null, sfxBus = null, musicBus = null;
  let muted = false, musicTimer = null, musicStep = 0, musicNext = 0;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.55; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0.0; musicBus.connect(master);
  }

  function noiseBuffer(sec) {
    const b = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * sec)), ac.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone(freq, t, dur, type, vol, bus) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    env(g, t, 0.005, vol || 0.3, dur);
    o.connect(g); g.connect(bus || sfxBus); o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  // Music-box note: sine + soft octave partial
  function mbox(freq, t, vol, bus) {
    tone(freq, t, 1.1, 'sine', vol, bus);
    tone(freq * 2, t, 0.5, 'triangle', vol * 0.25, bus);
  }
  function noise(t, dur, vol, ftype, f0, f1, q) {
    const s = ac.createBufferSource(); s.buffer = noiseBuffer(dur + 0.05);
    const f = ac.createBiquadFilter(); f.type = ftype || 'bandpass'; f.Q.value = q || 1;
    f.frequency.setValueAtTime(f0 || 1000, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain(); env(g, t, 0.01, vol || 0.3, dur);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t); s.stop(t + dur + 0.05);
  }
  const N = (m) => 440 * Math.pow(2, (m - 69) / 12); // MIDI -> Hz

  const SFX = {
    shutter(t) { noise(t, 0.04, 0.6, 'highpass', 2500); noise(t + 0.07, 0.05, 0.45, 'highpass', 1800); },
    clink(t) { tone(2637, t, 0.5, 'sine', 0.18); tone(3322, t + 0.01, 0.4, 'sine', 0.12); tone(2637, t + 0.12, 0.35, 'sine', 0.1); },
    pop(t) { const o = tone(700, t, 0.12, 'sine', 0.35); o.frequency.exponentialRampToValueAtTime(180, t + 0.12); },
    whoosh(t) { noise(t, 0.45, 0.25, 'bandpass', 400, 2400, 0.8); },
    swoosh(t) { noise(t, 0.3, 0.2, 'bandpass', 2400, 500, 0.8); },
    flap(t) { noise(t, 0.025, 0.4, 'bandpass', 3000, null, 2); tone(160, t, 0.03, 'square', 0.05); },
    tick(t) { noise(t, 0.015, 0.25, 'highpass', 4000); },
    type(t) { noise(t, 0.02, 0.18, 'bandpass', 2600, null, 3); },
    ding(t) { tone(N(88), t, 1.2, 'sine', 0.22); tone(N(100), t, 0.8, 'sine', 0.08); },
    chime(t) { [72, 76, 79, 84].forEach((m, i) => mbox(N(m), t + i * 0.09, 0.16)); },
    magic(t) { [84, 88, 91, 96, 100].forEach((m, i) => mbox(N(m), t + i * 0.05, 0.08)); },
    tada(t) { [67, 72, 76, 79].forEach((m, i) => mbox(N(m), t + i * 0.07, 0.17)); tone(N(84), t + 0.3, 1.2, 'triangle', 0.12); },
    oops(t) { const o = tone(520, t, 0.35, 'triangle', 0.2); o.frequency.exponentialRampToValueAtTime(220, t + 0.35); },
    boing(t) { const o = tone(180, t, 0.4, 'sine', 0.3); o.frequency.exponentialRampToValueAtTime(420, t + 0.12); o.frequency.exponentialRampToValueAtTime(240, t + 0.4); },
    rumble(t) { noise(t, 1.6, 0.35, 'lowpass', 220, 120, 0.7); },
    sweep(t) { noise(t, 0.12, 0.3, 'bandpass', 1800, 900, 1.2); },
    thud(t) { const o = tone(120, t, 0.25, 'sine', 0.5); o.frequency.exponentialRampToValueAtTime(50, t + 0.25); },
    confetti(t) { for (let i = 0; i < 6; i++) { const o = tone(500 + Math.random() * 600, t + i * 0.06, 0.08, 'sine', 0.12); o.frequency.exponentialRampToValueAtTime(150, t + i * 0.06 + 0.08); } },
    unlock(t) { tone(N(76), t, 0.12, 'sine', 0.2); tone(N(83), t + 0.08, 0.25, 'sine', 0.2); },
    blow(t) { noise(t, 0.6, 0.25, 'lowpass', 900, 300, 0.6); },
    bell(t) { tone(N(81), t, 1.6, 'sine', 0.2); tone(N(81) * 2.76, t, 0.6, 'sine', 0.05); },
  };

  function play(name) {
    if (!ac || muted) return;
    const f = SFX[name]; if (!f) return;
    try { f(ac.currentTime + 0.01); } catch (e) { /* ignore */ }
  }

  // Soft music-box loop (I–vi–IV–V in C, 84 bpm)
  const PROG = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
  const PATTERN = [0, 1, 2, 1, 2, 1, 0, 2];
  function scheduleMusic() {
    const spb = 60 / 84 / 2; // eighth notes
    while (musicNext < ac.currentTime + 0.4) {
      const bar = Math.floor(musicStep / 8) % PROG.length;
      const chord = PROG[bar];
      const k = musicStep % 8;
      const note = chord[PATTERN[k]] + 12;
      mbox(N(note), musicNext, 0.07, musicBus);
      if (k === 0) tone(N(chord[0] - 12), musicNext, 1.6, 'sine', 0.06, musicBus);
      musicStep++; musicNext += spb;
    }
  }
  function musicStart() {
    if (!ac || musicTimer) return;
    musicNext = ac.currentTime + 0.1; musicStep = 0;
    musicBus.gain.cancelScheduledValues(ac.currentTime);
    musicBus.gain.setValueAtTime(0.0001, ac.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.9, ac.currentTime + 2);
    musicTimer = setInterval(scheduleMusic, 120);
  }
  function musicStop(fade) {
    if (!ac || !musicTimer) return;
    const t = ac.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t);
    musicBus.gain.exponentialRampToValueAtTime(0.0001, t + (fade || 0.8));
    const id = musicTimer; musicTimer = null;
    setTimeout(() => clearInterval(id), (fade || 0.8) * 1000 + 50);
  }
  function musicVolume(v, sec) {
    if (!ac) return;
    const t = ac.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), t);
    musicBus.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), t + (sec || 0.5));
  }

  // "Joyeux anniversaire" (traditional melody, public domain), music box
  function birthday() {
    if (!ac || muted) return;
    const q = 0.36, t0 = ac.currentTime + 0.1;
    const M = [[67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
               [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
               [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
               [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3]];
    let t = t0;
    M.forEach(([m, d]) => { mbox(N(m + 5), t, 0.2); t += d * q; });
    return t - t0;
  }

  function setMuted(m) {
    muted = !!m;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 1, ac.currentTime, 0.05);
  }

  window.Sound = {
    init, play, birthday,
    music: { start: musicStart, stop: musicStop, volume: musicVolume },
    get muted() { return muted; }, setMuted,
    get ready() { return !!ac; },
  };
})();
;

/* ===== js/engine.js ===== */
/* La Pellicule — moteur d'animation (scènes, personnages, visionneuse photo)
 * Stage logique : 360 × 640 px, mis à l'échelle pour remplir l'écran.
 * Chaque scène = un fichier js/scenes/NN-id.js qui appelle Story.register({...}).
 */
(function () {
  'use strict';
  const W = 360, H = 640;
  const params = new URLSearchParams(location.search);
  const DEV = {
    scene: params.get('scene'),
    t: params.has('t') ? parseFloat(params.get('t')) : null,
  };
  DEV.still = DEV.t != null;

  // The camera roll, in story order (n = 1..6)
  const ROLL = [
    { src: 'img/p6-selfie.jpg', w: 812, h: 1080 },
    { src: 'img/p3-lac.jpg', w: 812, h: 1080 },
    { src: 'img/p5-ouay-stand.jpg', w: 909, h: 1080 },
    { src: 'img/p2-curling.jpg', w: 1080, h: 810 },
    { src: 'img/p7-curling-equipe.jpg', w: 1024, h: 768 },
    { src: 'img/p1-strasbourg.jpg', w: 810, h: 1080 },
  ];
  const ASSETS = ROLL.map(r => r.src).concat(['img/face-sven.png', 'img/face-artur.png', 'img/p4-ouay-logo.png']);

  const scenes = [];
  let cur = -1, ctx = null, started = false;
  const el = (id) => document.getElementById(id);

  /* ---------- helpers ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function fromHTML(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function escapeHTML(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  /* ---------- characters ---------- */
  const SKIN = { sven: '#e9b38f', artur: '#f0b896' };
  const OUTFITS = {
    'tshirt-white': { top: '#f6f3ef', edge: '#d8d1ca', neck: 'v', pants: '#2f3a56', shoes: '#2b2a30' },
    'tshirt-grey': { top: '#4b4b52', edge: '#3a3a40', neck: 'v', pants: '#3d4b6c', shoes: '#2b2a30', shorts: true },
    'ouay': { top: '#1f9d5b', edge: '#17824a', neck: 'round', pants: '#25304b', shoes: '#2b2a30', logo: true },
    'ouay-collar': { top: '#1f9d5b', edge: '#17824a', neck: 'collar', pants: '#25304b', shoes: '#7a2232', logo: true },
    'hoodie': { top: '#3a3b41', edge: '#2c2d32', neck: 'hood', pants: '#34353b', shoes: '#46d3d6', sole: '#ff6a4a' },
    'coat': { top: '#222a3c', edge: '#181e2c', neck: 'scarf', scarf: '#9cc6e6', pants: '#1d2230', shoes: '#1f1f22' },
    'parka': { top: '#5a6b48', edge: '#48573a', neck: 'fur', fur: '#cbb999', pants: '#2b2f3a', shoes: '#3a2f2a' },
    'smart': { top: '#1f2a44', edge: '#162036', neck: 'shirt', pants: '#1a2236', shoes: '#141416' },
    'casual': { top: '#5b7fa6', edge: '#4a6a8c', neck: 'round', pants: '#2f3a56', shoes: '#2b2a30' },
  };

  function charSVG(who, o) {
    const skin = SKIN[who] || '#e9b38f';
    const legs = o.shorts
      ? `<rect x="43" y="168" width="15" height="20" rx="5" fill="${o.pants}"/><rect x="45" y="186" width="11" height="22" rx="5" fill="${skin}"/>`
      : `<rect x="43" y="168" width="15" height="40" rx="6" fill="${o.pants}"/>`;
    const legsR = o.shorts
      ? `<rect x="62" y="168" width="15" height="20" rx="5" fill="${o.pants}"/><rect x="64" y="186" width="11" height="22" rx="5" fill="${skin}"/>`
      : `<rect x="62" y="168" width="15" height="40" rx="6" fill="${o.pants}"/>`;
    const sole = o.sole ? `<path d="M38 211 Q49 215 60 211" stroke="${o.sole}" stroke-width="2.5" fill="none"/>` : '';
    const soleR = o.sole ? `<path d="M60 211 Q71 215 82 211" stroke="${o.sole}" stroke-width="2.5" fill="none"/>` : '';
    let neck = '';
    if (o.neck === 'v') neck = `<path d="M51 117 L60 133 L69 117 Z" fill="${skin}"/>`;
    if (o.neck === 'round') neck = `<path d="M52 117 Q60 125 68 117 Z" fill="${skin}"/>`;
    if (o.neck === 'collar') neck = `<path d="M50 116 L60 128 L70 116 L66 113 L60 120 L54 113 Z" fill="#ffffff"/>`;
    if (o.neck === 'shirt') neck = `<path d="M51 115 L60 140 L69 115 Z" fill="#ffffff"/><path d="M55 125 L60 140 L65 125" fill="none" stroke="#162036" stroke-width="1.5"/>`;
    if (o.neck === 'hood') neck = `<path d="M38 121 Q60 104 82 121 Q74 132 60 132 Q46 132 38 121 Z" fill="${o.edge}"/>`;
    if (o.neck === 'fur') neck = `<ellipse cx="60" cy="120" rx="31" ry="9" fill="${o.fur}"/><ellipse cx="60" cy="118" rx="22" ry="5" fill="#b9a681"/>`;
    if (o.neck === 'scarf') neck = `<ellipse cx="60" cy="120" rx="21" ry="7" fill="${o.scarf}"/><rect x="62" y="122" width="8" height="26" rx="3" fill="${o.scarf}"/>`;
    const logo = o.logo
      ? `<g transform="translate(66 136) scale(.14)" fill="#ffffff"><circle cx="25" cy="18" r="14"/><circle cx="75" cy="18" r="14"/><path d="M8 40 Q25 34 40 46 Q50 54 60 46 Q75 34 92 40 L92 90 L70 90 L70 62 Q50 72 30 62 L30 90 L8 90 Z"/></g>`
      : '';
    return `
<svg class="ch-svg" viewBox="0 0 120 220" overflow="visible" aria-hidden="true">
  <g class="ch-legL">${legs}<ellipse cx="48" cy="209" rx="11" ry="6" fill="${o.shoes}"/>${sole}</g>
  <g class="ch-legR">${legsR}<ellipse cx="72" cy="209" rx="11" ry="6" fill="${o.shoes}"/>${soleR}</g>
  <g class="ch-armL"><rect x="22" y="121" width="14" height="48" rx="7" fill="${o.top}"/><circle cx="29" cy="171" r="7" fill="${skin}"/><g class="ch-handL" transform="translate(29 171)"></g></g>
  <g class="ch-torso">
    <path d="M34 120 Q60 110 86 120 L89 172 Q60 181 31 172 Z" fill="${o.top}"/>
    <path d="M31 172 Q60 181 89 172" stroke="${o.edge}" stroke-width="3" fill="none"/>
    ${neck}${logo}
  </g>
  <g class="ch-armR"><rect x="84" y="121" width="14" height="48" rx="7" fill="${o.top}"/><circle cx="91" cy="171" r="7" fill="${skin}"/><g class="ch-handR" transform="translate(91 171)"></g></g>
</svg>`;
  }

  function makeChar(ctx, who, opts) {
    opts = opts || {};
    const h = opts.h || 200, w = h * 120 / 220;
    const outfit = typeof opts.outfit === 'object' ? opts.outfit : (OUTFITS[opts.outfit] || OUTFITS.casual);
    const root = fromHTML(`<div class="ch ch-${who}" style="width:${w}px;height:${h}px">${charSVG(who, outfit)}<div class="ch-head"><img src="img/face-${who}.png" alt="" draggable="false"></div></div>`);
    (opts.parent || ctx.root).appendChild(root);
    const q = (s) => root.querySelector(s);
    const c = {
      who, el: root, w, h,
      svg: q('.ch-svg'), head: q('.ch-head'), face: q('.ch-head img'),
      torso: q('.ch-torso'), armL: q('.ch-armL'), armR: q('.ch-armR'),
      legL: q('.ch-legL'), legR: q('.ch-legR'), handL: q('.ch-handL'), handR: q('.ch-handR'),
    };
    gsap.set(c.armL, { svgOrigin: '29 126' });
    gsap.set(c.armR, { svgOrigin: '91 126' });
    gsap.set(c.legL, { svgOrigin: '50 170' });
    gsap.set(c.legR, { svgOrigin: '70 170' });
    if (opts.flip) { gsap.set([c.svg, c.face], { scaleX: -1 }); c.flipped = true; }

    // position: (x, y) = bottom-centre in stage px
    c.at = (x, y) => { root.style.left = (x - w / 2) + 'px'; root.style.top = (y - h) + 'px'; return c; };
    if (opts.x != null) c.at(opts.x, opts.y != null ? opts.y : 600);
    c.flip = (on) => { c.flipped = on !== false; gsap.set([c.svg, c.face], { scaleX: c.flipped ? -1 : 1 }); return c; };
    c.hold = (side, svgMarkup) => {
      const g = side === 'L' ? c.handL : c.handR;
      g.insertAdjacentHTML('beforeend', svgMarkup);
      return g.lastElementChild;
    };
    const tl = ctx.tl;
    c.walk = (at, dx, dur) => {
      dur = dur || Math.max(0.5, Math.abs(dx) / 120);
      const steps = Math.max(2, Math.round(dur / 0.2));
      tl.to(root, { x: '+=' + dx, duration: dur, ease: 'none' }, at);
      tl.to(c.legL, { rotation: 16, duration: dur / steps, yoyo: true, repeat: steps - 1, ease: 'sine.inOut' }, at);
      tl.to(c.legR, { rotation: -16, duration: dur / steps, yoyo: true, repeat: steps - 1, ease: 'sine.inOut' }, at);
      tl.to(c.head, { y: -3, duration: dur / steps, yoyo: true, repeat: steps - 1, ease: 'sine.inOut' }, at);
      tl.set([c.legL, c.legR], { rotation: 0 }, at + dur);
      tl.set(c.head, { y: 0 }, at + dur);
      return at + dur;
    };
    c.hop = (at, height) => {
      height = height || 18;
      tl.to(root, { y: '-=' + height, duration: 0.18, ease: 'power2.out' }, at);
      tl.to(root, { y: '+=' + height, duration: 0.2, ease: 'power2.in' }, at + 0.18);
      return at + 0.38;
    };
    c.raise = (at, side, angle, dur) => {
      const arm = side === 'L' ? c.armL : c.armR;
      const a = angle != null ? angle : (side === 'L' ? 150 : -150);
      tl.to(arm, { rotation: a, duration: dur || 0.3, ease: 'back.out(1.6)' }, at);
      return at + (dur || 0.3);
    };
    c.lower = (at, side, dur) => {
      tl.to(side === 'L' ? c.armL : c.armR, { rotation: 0, duration: dur || 0.3, ease: 'power2.inOut' }, at);
      return at + (dur || 0.3);
    };
    c.wave = (at, side, times) => {
      side = side || 'R'; times = times || 2;
      const arm = side === 'L' ? c.armL : c.armR, base = side === 'L' ? 140 : -140, d = side === 'L' ? 25 : -25;
      tl.to(arm, { rotation: base, duration: 0.25, ease: 'back.out(2)' }, at);
      tl.to(arm, { rotation: base + d, duration: 0.16, yoyo: true, repeat: times * 2 - 1, ease: 'sine.inOut' }, at + 0.25);
      tl.to(arm, { rotation: 0, duration: 0.3, ease: 'power2.inOut' }, at + 0.25 + times * 0.32);
      return at + 0.55 + times * 0.32;
    };
    c.tilt = (at, deg, dur) => { tl.to(c.head, { rotation: deg, duration: dur || 0.3, ease: 'sine.inOut' }, at); return at + (dur || 0.3); };
    c.nod = (at) => {
      tl.to(c.head, { rotation: 6, y: 2, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at);
      return at + 0.56;
    };
    c.say = (at, text, dur, opts2) => ctx.bubble(c, text, at, dur, opts2);
    c.emote = (at, sym, dur) => {
      const b = fromHTML(`<div class="ch-emote">${escapeHTML(sym)}</div>`);
      root.appendChild(b);
      tl.fromTo(b, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(3)' }, at);
      tl.to(b, { opacity: 0, y: -10, duration: 0.25 }, at + (dur || 1.2));
      return b;
    };
    c.idle = () => {
      ctx.loop(gsap.to(c.head, { rotation: 3, duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      return c;
    };
    return c;
  }

  /* ---------- scene context ---------- */
  function makeCtx(def, index) {
    const root = el('scene');
    root.innerHTML = '';
    root.style.background = def.bg || '#1d1622';
    const tl = gsap.timeline({ paused: true });
    const loops = [], timers = [], listeners = [];
    const ctx = {
      id: def.id, index, W, H, root, tl, still: DEV.still, rand: mulberry32(hash(def.id)),
      holds: [], beats: [], waiting: false, seeking: false, ROLL,
      img: (name) => 'img/' + name,
      html(markup, parent) { const n = fromHTML(markup); (parent || root).appendChild(n); return n; },
      char(who, opts) { return makeChar(ctx, who, opts); },
      loop(tween) { loops.push(tween); return tween; },
      timeout(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; },
      on(target, ev, fn, o) { target.addEventListener(ev, fn, o); listeners.push([target, ev, fn, o]); },
      interactive(node) { node.setAttribute('data-tap', ''); return node; },
      sfx(name, at) { tl.call(() => { if (!ctx.seeking && !DEV.still) Sound.play(name); }, null, at); },
      backdrop(top, bottom, at) {
        const bg = `linear-gradient(${top} 0 50%, ${bottom || top} 50% 100%)`;
        if (!at) el('backdrop').style.background = bg;
        tl.call(() => { el('backdrop').style.background = bg; }, null, at || 0);
      },
      caption(text, at, opts) { return caption(ctx, text, at, opts || {}); },
      bubble(c, text, at, dur, opts) { return bubble(ctx, c, text, at, dur, opts || {}); },
      flash(at) { return flash(ctx, at); },
      photo(n, at, opts) { return photo(ctx, n, at, opts || {}); },
      setRoll(n, at) { tl.call(() => setRoll(n), null, at); },
      hold(at) {
        if (DEV.still) return at;
        ctx.holds.push(at); ctx.holds.sort((a, b) => a - b);
        tl.addPause(at, () => { ctx.waiting = true; showHint(true); });
        tl.set({}, {}, at + 0.05); // keep a pause from sitting exactly at the end (onComplete would skip it)
        return at;
      },
      beat(at) {
        // A skip point: tapping jumps here but playback keeps going (no pause).
        ctx.beats.push(at); ctx.beats.sort((a, b) => a - b);
        return at;
      },
      wait(at, setup, opts) {
        // Pause at `at` until setup's done() is called (or timeout / tap elsewhere).
        if (DEV.still) return at;
        opts = opts || {};
        ctx.holds.push(at); ctx.holds.sort((a, b) => a - b);
        tl.addPause(at, () => {
          ctx.waiting = true; let finished = false;
          const done = () => { if (finished) return; finished = true; ctx.resume(); };
          ctx._waitDone = done;
          setup(done);
          if (opts.timeout) ctx.timeout(done, opts.timeout * 1000);
          if (opts.hint) showHint(true, opts.hint);
        });
        tl.set({}, {}, at + 0.05);
        return at;
      },
      resume() {
        if (!ctx.waiting) return;
        ctx.waiting = false; ctx._waitDone = null; showHint(false);
        tl.resume();
      },
      destroy() {
        tl.kill(); loops.forEach(t => t.kill()); timers.forEach(clearTimeout);
        listeners.forEach(([t, e, f, o]) => t.removeEventListener(e, f, o));
        gsap.killTweensOf(root.querySelectorAll('*'));
        root.innerHTML = '';
        showHint(false);
      },
    };
    return ctx;
  }

  /* ---------- captions / bubbles / flash / photo viewer ---------- */
  function caption(ctx, text, at, o) {
    const pos = o.pos || 'bottom';
    const variant = o.variant || 'card';
    const n = fromHTML(`<div class="cap cap-${variant} cap-${typeof pos === 'string' ? pos : 'xy'}">${o.html ? text : escapeHTML(text)}</div>`);
    if (typeof pos === 'object') { n.style.left = pos.x + 'px'; n.style.top = pos.y + 'px'; n.style.transform = 'translate(-50%, 0)'; }
    if (o.size) n.style.fontSize = o.size + 'px';
    if (o.width) n.style.maxWidth = o.width + 'px';
    (o.parent || ctx.root).appendChild(n);
    gsap.set(n, { opacity: 0 });
    ctx.tl.fromTo(n, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, at);
    if (o.dur) ctx.tl.to(n, { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in' }, at + o.dur);
    return n;
  }

  function bubble(ctx, c, text, at, dur, o) {
    const side = o.side || 'center';
    const n = fromHTML(`<div class="ch-bubble ch-bubble-${side}">${o.html ? text : escapeHTML(text)}</div>`);
    c.el.appendChild(n);
    gsap.set(n, { opacity: 0 });
    ctx.tl.fromTo(n, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, at);
    ctx.sfx('pop', at);
    if (dur) ctx.tl.to(n, { opacity: 0, scale: 0.9, duration: 0.25 }, at + dur);
    return n;
  }

  function flash(ctx, at) {
    const f = ctx.html('<div class="flash"></div>');
    gsap.set(f, { opacity: 0 });
    ctx.tl.to(f, { opacity: 1, duration: 0.06, ease: 'none' }, at);
    ctx.tl.to(f, { opacity: 0, duration: 0.55, ease: 'power2.out' }, at + 0.08);
    ctx.sfx('shutter', at);
    return at + 0.08;
  }

  function photo(ctx, n, at, o) {
    const r = ROLL[n - 1];
    const thumbs = ROLL.slice(0, n).map((p, i) => `<i class="${i === n - 1 ? 'on' : ''}" style="background-image:url(${p.src})"></i>`).join('');
    const land = r.w > r.h;
    const v = ctx.html(`
      <div class="viewer${land ? ' land' : ''}">
        <div class="v-top"><span>‹ Pellicule</span><b>${n}</b></div>
        <div class="v-photo"><img src="${r.src}" alt="" draggable="false"></div>
        ${o.caption ? `<div class="v-cap">${o.html ? o.caption : escapeHTML(o.caption)}</div>` : ''}
        <div class="v-thumbs">${thumbs}</div>
      </div>`);
    const img = v.querySelector('.v-photo img');
    const cap = v.querySelector('.v-cap');
    gsap.set(v, { opacity: 0 });
    if (o.flash !== false) flash(ctx, at);
    const t0 = at + (o.flash !== false ? 0.07 : 0);
    ctx.tl.set(v, { opacity: 1 }, t0);
    ctx.tl.fromTo(img, { scale: 1.12, filter: 'blur(10px) brightness(1.6)' }, { scale: 1, filter: 'blur(0px) brightness(1)', duration: 1.1, ease: 'power2.out' }, t0);
    ctx.tl.call(() => {
      setRoll(n);
      if (!DEV.still) ctx.loop(gsap.fromTo(img, { scale: 1 }, { scale: 1.05, duration: 9, ease: 'none' }));
    }, null, t0 + 1.1);
    if (cap) ctx.tl.fromTo(cap, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, t0 + 0.9);
    const end = t0 + 1.5;
    if (o.hold !== false) ctx.hold(end);
    return { el: v, img, cap, end };
  }

  /* ---------- chrome: bars, hint, roll chip ---------- */
  function setRoll(n) {
    const chip = el('rollchip');
    chip.querySelector('b').textContent = n;
    chip.classList.toggle('show', n > 0);
  }
  function rollBefore(i) {
    let m = 0;
    for (let k = 0; k < i; k++) (scenes[k].photos || []).forEach(p => { m = Math.max(m, p); });
    return m;
  }
  let hintTimer = null;
  function showHint(on, text) {
    const h = el('hint');
    clearTimeout(hintTimer);
    if (!on) { h.classList.remove('show'); return; }
    h.textContent = text || 'Touche pour continuer ›';
    hintTimer = setTimeout(() => h.classList.add('show'), text ? 200 : 1300);
  }
  function buildBars() {
    const bars = el('bars');
    bars.innerHTML = scenes.filter(s => s.bar !== false).map(s => `<i data-id="${s.id}"><b></b></i>`).join('');
  }
  function updateBars() {
    const list = el('bars').children;
    let reached = false;
    for (const node of list) {
      const id = node.dataset.id, b = node.firstElementChild;
      if (ctx && id === ctx.id) { reached = true; b.style.width = (ctx.tl.duration() ? ctx.tl.progress() * 100 : 0) + '%'; continue; }
      b.style.width = reached ? '0%' : '100%';
    }
    if (ctx && !scenes.some((s, i) => i <= cur && s.bar !== false && s.id === ctx.id)) {
      // current scene has no bar: mark all previous as full
    }
  }

  /* ---------- playback ---------- */
  function play(i) {
    if (i < 0 || i >= scenes.length) return;
    if (ctx) ctx.destroy();
    cur = i;
    const def = scenes[i];
    ctx = makeCtx(def, i);
    setRoll(rollBefore(i));
    el('skipgift').classList.toggle('show', !!def.skippable);
    el('rollchip').classList.toggle('hide', !!def.hideChip || ['depart', 'zurich', 'colmar', 'choix'].includes(def.id));
    el('ui').classList.toggle('dark-ui', !!def.darkUI);
    el('stage').dataset.scene = def.id;
    try { def.build(ctx); } catch (e) { console.error('Scene ' + def.id + ' failed', e); }
    if (def.music === 'off') Sound.music.volume(0.0001, 0.6);
    else if (def.music === 'low') Sound.music.volume(0.35, 0.6);
    else Sound.music.volume(0.9, 0.6);
    const myCtx = ctx;
    ctx.tl.eventCallback('onComplete', () => { if (myCtx === ctx && !myCtx.waiting && !DEV.still && !def.final) next(); });
    if (DEV.still && i === startIndex) {
      ctx.seeking = true;
      ctx.tl.seek(DEV.t, false);
      ctx.seeking = false;
      ctx.tl.pause();
    } else {
      ctx.tl.play(0);
    }
    updateBars();
  }
  let startIndex = 0;
  function next() { if (cur + 1 < scenes.length) play(cur + 1); }
  function prev() { play(Math.max(0, cur - 1)); }
  function indexOf(id) { return scenes.findIndex(s => s.id === id); }
  function goto(id) { const i = typeof id === 'number' ? id : indexOf(id); if (i >= 0) play(i); }

  function tapNext() {
    if (!ctx) return;
    if (ctx.waiting) {
      if (ctx._waitDone) ctx._waitDone(); else ctx.resume();
      return;
    }
    const t = ctx.tl.time();
    const nh = ctx.holds.find(h => h > t + 0.02);
    const nb = ctx.beats.find(b => b > t + 0.05);
    if (nb != null && (nh == null || nb < nh)) {
      ctx.seeking = true;
      ctx.tl.seek(nb, false);
      ctx.seeking = false;
      ctx.tl.play();
    } else if (nh != null) {
      ctx.seeking = true;
      ctx.tl.seek(Math.max(0, nh - 0.001), false);
      ctx.seeking = false;
      ctx.tl.play();
    } else if (scenes[cur].final) {
      // last scene: nothing to skip to
    } else {
      next();
    }
  }
  function tapBack() {
    if (!ctx) return;
    if (ctx.tl.time() > 1.2) play(cur); else prev();
  }

  function fit() {
    if (params.has('shot')) { // screenshot mode: stage at 1:1 in the top-left corner
      const st = el('stage'); st.style.left = '0'; st.style.top = '0'; st.style.transform = 'none'; Story.scale = 1; return;
    }
    const vv = window.visualViewport;
    const vw = vv ? vv.width : innerWidth, vh = vv ? vv.height : innerHeight;
    const s = Math.min(vw / W, vh / H);
    el('stage').style.transform = `translate(-50%, -50%) scale(${s})`;
    Story.scale = s;
  }

  function bindInput() {
    const stage = el('stage');
    let downX = 0, downY = 0, downT = 0;
    stage.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; downT = Date.now(); });
    stage.addEventListener('pointerup', (e) => {
      if (e.target.closest('[data-tap],[data-ui]')) return;
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 30) return; // a swipe, not a tap
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      if (x < 0.28) tapBack(); else tapNext();
    });
    document.addEventListener('keydown', (e) => {
      if (el('stage').hidden) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); tapNext(); }
      if (e.key === 'ArrowLeft') tapBack();
    });
    el('skipgift').addEventListener('click', () => goto('depart'));
    el('mute').addEventListener('click', () => {
      Sound.setMuted(!Sound.muted);
      el('mute').classList.toggle('off', Sound.muted);
    });
    addEventListener('resize', fit);
    if (window.visualViewport) visualViewport.addEventListener('resize', fit);
  }

  function preload() {
    const imgs = ASSETS.map(src => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = src; }));
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    return Promise.all(imgs.concat([fonts]));
  }

  function start(id) {
    const stage = el('stage');
    stage.hidden = false;
    el('backdrop').hidden = false;
    document.body.classList.add('story-on');
    fit();
    if (!started) { buildBars(); bindInput(); gsap.ticker.add(() => { if (ctx) updateBars(); }); started = true; }
    startIndex = id ? Math.max(0, indexOf(id)) : 0;
    play(startIndex);
  }

  window.Story = {
    W, H, ROLL, DEV, scenes,
    register(def) { scenes.push(def); scenes.sort((a, b) => a.order - b.order); },
    start, goto, next, prev, preload, fit,
    get current() { return ctx; },
    makeChar: (who, opts) => makeChar(ctx, who, opts),
  };
})();
;

/* ===== js/scenes/01-rewind.js ===== */
/* Scène 1 · « rewind » (~6 s, sans pause, enchaîne seule)
 * Le petit gâteau du 404 se balance dans la nuit. On souffle la bougie, une volute de fumée
 * monte et se transforme en compteur de date qui rembobine de 12.10.2026 à 03.11.2017,
 * façon compteur de magnétoscope (◀◀ REW). Volet blanc vers l'amphi.
 */
Story.register({
  id: 'rewind', order: 1, title: 'On rembobine', photos: [], skippable: false,
  bg: '#2f2537', music: 'normal', darkUI: false,
  build(ctx) {
    const tl = ctx.tl, rand = ctx.rand;
    const S = '#stage[data-scene="rewind"]';
    ctx.backdrop('#2f2537', '#1d1622');

    ctx.html(`<style>
${S} .rw-bg{position:absolute;inset:0;background:linear-gradient(#2f2537 0%,#2a2131 55%,#1d1622 100%)}
${S} .rw-stars,${S} .rw-fx,${S} .rw-world svg{position:absolute;left:0;top:0;width:360px;height:640px;overflow:visible;pointer-events:none}
${S} .rw-world{position:absolute;left:0;top:0;width:360px;height:640px}
${S} .rw-glow{position:absolute;left:30px;top:236px;width:300px;height:300px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,186,96,.34),rgba(255,140,140,.12) 55%,rgba(255,140,140,0))}
${S} .rw-cake{position:absolute;left:92px;top:368px;width:176px;height:176px}
${S} .rw-cake svg{position:static;width:176px;height:176px}
${S} .rw-counter{position:absolute;left:34px;top:222px;width:292px;height:66px;box-sizing:border-box;display:flex;gap:4px;
  align-items:center;justify-content:center;padding:10px 12px;border-radius:16px;
  background:linear-gradient(#33283b,#1b1420);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 12px 30px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.07)}
${S} .rw-cell{position:relative;width:27px;height:46px;border-radius:6px;overflow:hidden;background:#120d16;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)}
${S} .rw-strip{position:absolute;left:0;top:0;width:100%}
${S} .rw-strip span{display:block;height:46px;line-height:46px;text-align:center;font:600 30px var(--font-mono);color:#fff8f2;
  text-shadow:1px 0 rgba(255,90,140,.45),-1px 0 rgba(90,220,255,.45)}
${S} .rw-cell::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(rgba(12,7,14,.88),rgba(12,7,14,0) 34%,rgba(255,255,255,.04) 50%,rgba(12,7,14,0) 66%,rgba(12,7,14,.88))}
${S} .rw-dot{width:8px;text-align:center;font:600 30px/46px var(--font-mono);color:var(--pink)}
${S} .rw-osd{position:absolute;left:20px;top:86px;height:22px;font:600 16px/22px var(--font-mono);color:#fff;letter-spacing:.06em;
  text-shadow:1.5px 0 rgba(255,60,120,.7),-1.5px 0 rgba(80,220,255,.7)}
${S} .rw-osd span{position:absolute;left:0;top:0;display:flex;align-items:center;gap:7px;white-space:nowrap}
${S} .rw-osd svg{height:14px;width:auto;fill:#fff;filter:drop-shadow(1.5px 0 rgba(255,60,120,.7)) drop-shadow(-1.5px 0 rgba(80,220,255,.7))}
${S} .rw-sea{position:absolute;left:0;top:0;width:30px;height:30px}
${S} .rw-sea svg{position:absolute;left:0;top:0;width:30px;height:30px}
${S} .rw-sea i{position:absolute;left:18px;top:13px;height:4px;border-radius:2px}
${S} .rw-scan{position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(rgba(255,255,255,.035) 0 1px,rgba(0,0,0,0) 1px 3px)}
${S} .rw-track{position:absolute;left:0;top:0;width:360px;height:16px;pointer-events:none;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,.16) 0 7px,rgba(255,255,255,.03) 7px 11px,rgba(255,255,255,.22) 11px 13px,rgba(255,255,255,0) 13px 23px);
  box-shadow:0 0 12px rgba(255,255,255,.12)}
${S} .rw-wipe{position:absolute;left:0;top:0;width:480px;height:640px;z-index:45;pointer-events:none;
  background:linear-gradient(90deg,#fff 0,#fff 86%,rgba(255,255,255,0) 100%)}
${S} .rw-warm{position:absolute;left:-999px;top:0;font:700 20px var(--font-hand);opacity:0}
</style>`);

    /* ---------- background + stars ---------- */
    ctx.html('<div class="rw-bg"></div>');
    let stars = '';
    for (let i = 0; i < 38; i++) {
      const x = (rand() * 360).toFixed(1), y = (64 + rand() * 520).toFixed(1);
      const r = (0.6 + rand() * 1.2).toFixed(2), o = (0.25 + rand() * 0.55).toFixed(2);
      stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6e8" opacity="${o}"/>`;
    }
    // a few four-point sparkles
    [[52, 150, 1], [306, 120, 0.8], [292, 430, 0.7], [40, 470, 0.9], [210, 96, 0.6]].forEach(([x, y, s]) => {
      stars += `<path d="M${x} ${y - 6 * s} Q${x + 1 * s} ${y - 1 * s} ${x + 6 * s} ${y} Q${x + 1 * s} ${y + 1 * s} ${x} ${y + 6 * s} Q${x - 1 * s} ${y + 1 * s} ${x - 6 * s} ${y} Q${x - 1 * s} ${y - 1 * s} ${x} ${y - 6 * s}Z" fill="#ffe1ea" opacity=".75"/>`;
    });
    const starSvg = ctx.html(`<svg class="rw-stars" viewBox="0 0 360 640">${stars}</svg>`);
    // twinkle (seeded phases, so stills are reproducible)
    Array.from(starSvg.children).forEach((s) => {
      ctx.loop(gsap.to(s, { opacity: 0.12, duration: 1.1 + rand() * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand() * 1.6 }));
    });
    // font warm-up for the next scenes (Caveat is not used by the gate)
    ctx.html('<div class="rw-warm">3 novembre 2017 Satellite</div>');

    /* ---------- season icons (streak right → left, behind the counter) ---------- */
    const ICON = {
      leaf: { c: '#ff9a52', svg: '<path d="M15 3 L17.5 9 L23 7.5 L21 13 L26 15.5 L20 18 L21.5 23 L16 21 L15 27 L14 21 L8.5 23 L10 18 L4 15.5 L9 13 L7 7.5 L12.5 9 Z" fill="#ff9a52"/><path d="M15 9 V27" stroke="#d96a2b" stroke-width="1.4" stroke-linecap="round"/>' },
      sun: { c: '#ffc66e', svg: '<circle cx="15" cy="15" r="6.5" fill="#ffc66e"/><g stroke="#ffc66e" stroke-width="2.2" stroke-linecap="round"><path d="M15 2.5v3.5M15 24v3.5M2.5 15H6M24 15h3.5M6.2 6.2l2.5 2.5M21.3 21.3l2.5 2.5M6.2 23.8l2.5-2.5M21.3 8.7l2.5-2.5"/></g>' },
      flower: { c: '#ff9fbd', svg: '<g fill="#ff9fbd"><circle cx="15" cy="8.5" r="5"/><circle cx="21.2" cy="13" r="5"/><circle cx="18.8" cy="20.3" r="5"/><circle cx="11.2" cy="20.3" r="5"/><circle cx="8.8" cy="13" r="5"/></g><circle cx="15" cy="15" r="3.6" fill="#ffc66e"/>' },
      snow: { c: '#bfe3ff', svg: '<g stroke="#cfe9ff" stroke-width="2" stroke-linecap="round" fill="none"><path d="M15 3v24M4.6 9l20.8 12M4.6 21l20.8-12"/><path d="M12 5.5l3 2.5 3-2.5M12 24.5l3-2.5 3 2.5M5.2 12.6l3.9-.6-1.2-3.8M24.8 17.4l-3.9.6 1.2 3.8M5.2 17.4l3.9.6-1.2 3.8M24.8 12.6l-3.9-.6 1.2-3.8"/></g>' },
    };
    const SEQ = ['leaf', 'sun', 'flower', 'snow']; // going back in time from October
    const seaLayer = ctx.html('<div class="rw-fx" style="pointer-events:none"></div>');
    const NSEA = 22, R0 = 2.95, R1 = 4.55;
    for (let i = 0; i < NSEA; i++) {
      const kind = ICON[SEQ[i % 4]];
      const above = i % 2 === 0;
      const y = above ? 112 + rand() * 88 : 298 + rand() * 46;
      const sc = 0.7 + rand() * 0.45;
      const len = 40 + rand() * 70;
      const n = ctx.html(`<div class="rw-sea" style="top:${y.toFixed(1)}px"><i style="width:${len.toFixed(0)}px;background:linear-gradient(90deg,${kind.c},rgba(255,255,255,0))"></i><svg viewBox="0 0 30 30">${kind.svg}</svg></div>`, seaLayer);
      const u = i / (NSEA - 1);
      const t = R0 + (R1 - R0) * u;
      const mid = 1 - Math.abs(u - 0.5) * 2; // faster in the middle of the rewind
      const d = 0.62 - 0.32 * mid + rand() * 0.08;
      gsap.set(n, { scale: sc, opacity: 0, x: 380 });
      tl.fromTo(n, { x: 380 + rand() * 30 }, { x: -60 - len, duration: d, ease: 'none' }, t);
      tl.fromTo(n, { opacity: 0 }, { opacity: 0.5 + rand() * 0.4, duration: 0.08, ease: 'none' }, t);
      tl.to(n, { opacity: 0, duration: 0.1 }, t + d - 0.1);
    }

    /* ---------- world: glow, cake, wind, smoke (moves down as the camera tilts up) ---------- */
    const world = ctx.html('<div class="rw-world"></div>');
    const glow = ctx.html('<div class="rw-glow"></div>', world);
    const cakeBox = ctx.html(`<div class="rw-cake"><svg viewBox="0 0 150 150" overflow="visible">
  <defs>
    <radialGradient id="rwFlameGlow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".9"/><stop offset=".45" stop-color="#ffb43b" stop-opacity=".35"/><stop offset="1" stop-color="#ffb43b" stop-opacity="0"/></radialGradient>
    <linearGradient id="rwCakeSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdbe5"/><stop offset="1" stop-color="#ffc4d4"/></linearGradient>
  </defs>
  <ellipse cx="75" cy="141" rx="50" ry="6" fill="#000" opacity=".28"/>
  <g class="rw-body">
    <circle class="rw-fglow" cx="75" cy="9" r="24" fill="url(#rwFlameGlow)"/>
    <rect x="70" y="18" width="10" height="30" rx="3" fill="#7fd6c2"/>
    <path d="M70 27 L80 23 M70 35 L80 31 M70 43 L80 39" stroke="#5cbca6" stroke-width="2" stroke-linecap="round"/>
    <rect x="71.6" y="20" width="2.2" height="26" rx="1.1" fill="#fff" opacity=".4"/>
    <path d="M75 18 L75 14.5" stroke="#3a2e3f" stroke-width="1.6" stroke-linecap="round"/>
    <circle class="rw-ember" cx="75" cy="14.3" r="1.8" fill="#ff8a3d"/>
    <g class="rw-flameO"><g class="rw-flameI">
      <path d="M75 1 C68.5 8.5 70.5 14 75 15 C79.5 14 81.5 8.5 75 1 Z" fill="#ffb43b"/>
      <path d="M75 5.5 C72 9.5 72.6 13 75 13.6 C77.4 13 78 9.5 75 5.5 Z" fill="#ffe08a"/>
      <path d="M75 9 C73.6 11 73.9 13 75 13.4 C76.1 13 76.4 11 75 9 Z" fill="#fff6d6"/>
    </g></g>
    <rect x="22" y="48" width="106" height="78" rx="16" fill="url(#rwCakeSide)"/>
    <path d="M22 70 Q35 82 48 70 T74 70 T100 70 T128 70 L128 62 Q128 48 114 48 L36 48 Q22 48 22 62 Z" fill="#ff7aa2"/>
    <path d="M30 56 Q34 51 42 51 L60 51" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".35"/>
    <rect x="26" y="112" width="98" height="10" rx="5" fill="#ffb9cb" opacity=".55"/>
    <circle cx="40" cy="104" r="3" fill="#7fd6c2"/><circle cx="110" cy="108" r="3" fill="#ffc66e"/><circle cx="76" cy="118" r="2.5" fill="#ff7aa2"/>
    <circle cx="117" cy="88" r="2.2" fill="#7fd6c2"/><circle cx="31" cy="90" r="2" fill="#ffc66e"/>
    <g class="rw-happy">
      <path d="M53 90 Q58 84 63 90" stroke="#3a2e3f" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M87 90 Q92 84 97 90" stroke="#3a2e3f" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <path d="M64 100 Q75 113 86 100 Z" fill="#3a2e3f"/>
      <path d="M69 104.5 Q75 109 81 104.5 Q75 107 69 104.5Z" fill="#ff8fb1"/>
    </g>
    <g class="rw-wow" opacity="0">
      <circle cx="58" cy="88" r="5" fill="#3a2e3f"/><circle cx="92" cy="88" r="5" fill="#3a2e3f"/>
      <circle cx="59.6" cy="85.6" r="1.7" fill="#fff"/><circle cx="93.6" cy="85.6" r="1.7" fill="#fff"/>
      <ellipse cx="75" cy="104" rx="5" ry="6" fill="#3a2e3f"/>
    </g>
    <ellipse cx="46" cy="100" rx="6" ry="3.5" fill="#ff9fbd" opacity=".7"/>
    <ellipse cx="104" cy="100" rx="6" ry="3.5" fill="#ff9fbd" opacity=".7"/>
  </g>
</svg></div>`, world);
    const q = (s) => cakeBox.querySelector(s);
    const body = q('.rw-body'), flameO = q('.rw-flameO'), flameI = q('.rw-flameI'), fglow = q('.rw-fglow');
    const ember = q('.rw-ember'), happy = q('.rw-happy'), wow = q('.rw-wow');

    gsap.set(body, { svgOrigin: '75 132' });
    gsap.set(flameO, { svgOrigin: '75 15', scale: 1.55 });
    gsap.set(flameI, { svgOrigin: '75 15' });
    gsap.set(ember, { opacity: 0 });
    ctx.loop(gsap.fromTo(body, { rotation: -3 }, { rotation: 3, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    ctx.loop(gsap.to(flameI, { scaleX: 0.86, scaleY: 1.14, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    ctx.loop(gsap.to(fglow, { scale: 1.12, svgOrigin: '75 9', duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));

    // wind (Sven blowing from the screen) + smoke, in world coordinates
    const fx = ctx.html(`<svg viewBox="0 0 360 640" overflow="visible">
  <g class="rw-wind" fill="none" stroke="#fff8f2" stroke-linecap="round">
    <path pathLength="100" stroke-width="4" opacity=".7" d="M318 700 C312 590 300 480 262 418 C244 390 214 380 182 386 C150 392 120 380 112 360 C106 344 124 336 130 348"/>
    <path pathLength="100" stroke-width="3" opacity=".5" d="M300 720 C296 610 286 500 252 430 C236 400 210 396 184 398 C156 400 132 396 116 384"/>
    <path pathLength="100" stroke-width="3" opacity=".55" d="M338 680 C330 580 314 470 274 404 C254 372 222 366 188 374 C162 380 142 372 132 358"/>
  </g>
  <g class="rw-smoke" fill="none" stroke-linecap="round">
    <path pathLength="100" stroke="#b6a6c4" stroke-width="10" opacity=".22" d="M180 386 C168 370 194 356 182 340 C170 324 164 308 178 292 C192 276 196 262 182 248 C176 242 178 236 182 232"/>
    <path pathLength="100" stroke="#d9cde2" stroke-width="3.6" opacity=".6" d="M180 386 C168 370 194 356 182 340 C170 324 164 308 178 292 C192 276 196 262 182 248 C176 242 178 236 182 232"/>
  </g>
  <g class="rw-wisps" fill="#cbbdd6"></g>
</svg>`, world);
    const winds = fx.querySelectorAll('.rw-wind path');
    const smokes = fx.querySelectorAll('.rw-smoke path');
    const wisps = fx.querySelector('.rw-wisps');
    gsap.set(winds, { strokeDasharray: '34 200', strokeDashoffset: 34 });
    gsap.set(smokes, { strokeDasharray: '100 100', strokeDashoffset: 100 });

    /* ---------- counter ---------- */
    const counter = ctx.html('<div class="rw-counter"></div>');
    const START = '12.10.2026';
    const strips = [];
    for (const ch of START) {
      if (ch === '.') { ctx.html('<div class="rw-dot">.</div>', counter); continue; }
      const cell = ctx.html('<div class="rw-cell"><div class="rw-strip">' +
        '0123456789'.split('').concat(['0']).map(d => `<span>${d}</span>`).join('') + '</div></div>', counter);
      strips.push(cell.firstElementChild);
    }
    const CELL = 46;
    const setPos = (strip, pos) => {
      pos = ((pos % 10) + 10) % 10;
      strip.style.transform = `translate3d(0,${(-pos * CELL).toFixed(2)}px,0)`;
    };
    // tape-counter logic: the year rolls like an odometer, day & month spin fast
    function renderCounter(p) {
      const Y = 2026 - 9 * p;
      const ones = Y % 10;
      const tens = Math.floor(Y / 10) % 10 + Math.max(0, ones - 9);
      setPos(strips[0], 1 - p * 21);   // 1 → 0
      setPos(strips[1], 2 - p * 69);   // 2 → 3
      setPos(strips[2], 1 - p * 10);   // 1 → 1
      setPos(strips[3], 0 - p * 39);   // 0 → 1
      setPos(strips[4], 2);
      setPos(strips[5], 0);
      setPos(strips[6], tens);
      setPos(strips[7], ones);
    }
    renderCounter(0);
    const roll = { p: 0 };
    const T_ROLL = 2.9, D_ROLL = 1.9, EASE_ROLL = 'power2.inOut';

    // OSD (VHS on-screen display)
    const osd = ctx.html(`<div class="rw-osd">
  <span class="rw-rew"><svg viewBox="0 0 30 16"><path d="M14 1 L1 8 L14 15Z M29 1 L16 8 L29 15Z"/></svg>REW</span>
  <span class="rw-play"><svg viewBox="0 0 14 16"><path d="M1 1 L13 8 L1 15Z"/></svg>PLAY</span>
</div>`);
    const rew = osd.querySelector('.rw-rew'), play = osd.querySelector('.rw-play');

    // smoke puffs that bloom into the counter
    const puffs = ctx.html('<svg class="rw-fx" viewBox="0 0 360 640"><defs><radialGradient id="rwPuff"><stop offset="0" stop-color="#e6dcee" stop-opacity=".9"/><stop offset=".6" stop-color="#cbbdd6" stop-opacity=".45"/><stop offset="1" stop-color="#cbbdd6" stop-opacity="0"/></radialGradient></defs></svg>');
    const puffEls = [];
    [[180, 256, 30], [128, 252, 26], [232, 258, 27], [88, 258, 20], [272, 252, 21], [154, 244, 18], [206, 266, 19]].forEach(([x, y, r]) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r); c.setAttribute('fill', 'url(#rwPuff)');
      puffs.appendChild(c); puffEls.push(c);
    });
    gsap.set(puffEls, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%' });

    // VHS overlays
    const scan = ctx.html('<div class="rw-scan"></div>');
    const track = ctx.html('<div class="rw-track"></div>');
    gsap.set([scan, track], { opacity: 0 });

    // final white wipe
    const wipe = ctx.html('<div class="rw-wipe"></div>');
    gsap.set(wipe, { x: -480 });

    /* ======================= timeline ======================= */
    // 0 · intro: the cake settles in, flame alive
    tl.fromTo(world, { y: -100 }, { y: -100, duration: 0.01 }, 0);
    tl.fromTo(cakeBox, { opacity: 0, scale: 0.86, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.8)' }, 0);
    tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.05);

    // 0.8 · anticipation: flame shivers, then the breath arrives from below
    tl.to(flameO, { rotation: 8, duration: 0.18, ease: 'sine.out' }, 0.72);
    winds.forEach((w, i) => tl.to(w, { strokeDashoffset: -100, duration: 0.6, ease: 'none' }, 0.66 + i * 0.06));
    ctx.sfx('blow', 0.9);
    tl.to(flameO, { rotation: -55, scaleX: 1.1, scaleY: 0.9, duration: 0.14, ease: 'power2.out' }, 1.0);
    tl.to(flameO, { scale: 0, opacity: 0, duration: 0.16, ease: 'power2.in' }, 1.14);
    tl.to(fglow, { opacity: 0, duration: 0.3 }, 1.12);
    tl.to(glow, { opacity: 0, duration: 0.6 }, 1.12);
    tl.fromTo(ember, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 1.24);
    tl.to(ember, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 1.32);

    // 1.3 · smoke rises while the camera tilts up
    tl.to(smokes, { strokeDashoffset: 0, duration: 1.1, ease: 'power1.inOut' }, 1.3);
    tl.to(smokes, { strokeDashoffset: -100, opacity: 0, duration: 0.7, ease: 'power1.in' }, 2.25);
    tl.to(world, { y: 0, duration: 1.05, ease: 'power2.inOut' }, 1.45);
    // little wisps drifting off the curl
    [[184, 360, 4], [176, 330, 5], [186, 300, 5.5], [172, 270, 6]].forEach(([x, y, r], i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
      wisps.appendChild(c);
      gsap.set(c, { opacity: 0, transformOrigin: '50% 50%' });
      const t = 1.45 + i * 0.2;
      tl.fromTo(c, { opacity: 0, scale: 0.4, x: 0, y: 0 }, { opacity: 0.45, scale: 1, duration: 0.3, ease: 'sine.out' }, t);
      tl.to(c, { opacity: 0, scale: 1.8, x: (i % 2 ? -12 : 12), y: -30, duration: 0.7, ease: 'sine.in' }, t + 0.3);
    });
    // the cake looks up, amazed
    tl.to(happy, { opacity: 0, duration: 0.12 }, 1.95);
    tl.to(wow, { opacity: 1, duration: 0.12 }, 1.95);

    // 2.2 · the smoke blooms and condenses into the counter
    puffEls.forEach((c, i) => {
      tl.to(c, { opacity: 0.8, scale: 1.25, duration: 0.35, ease: 'sine.out' }, 2.12 + i * 0.03);
      tl.to(c, { opacity: 0, scale: 1.8, duration: 0.45, ease: 'sine.in' }, 2.5 + i * 0.03);
    });
    tl.fromTo(counter, { opacity: 0, scale: 0.84, filter: 'blur(8px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }, 2.3);
    tl.set(counter, { filter: 'none' }, 2.91);

    ctx.caption('Avant le cadeau… on rembobine.', 2.4, { pos: 'bottom', variant: 'light', size: 19 });

    // 2.8 · ◀◀ REW: VHS overlay, blinking OSD
    tl.fromTo(osd, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 2.8);
    tl.set(play, { opacity: 0 }, 0);
    tl.fromTo(rew, { opacity: 1 }, { opacity: 0.15, duration: 0.2, ease: 'steps(1)', repeat: 9, yoyo: true }, 2.85);
    tl.to(scan, { opacity: 1, duration: 0.2 }, 2.8);
    tl.to(scan, { opacity: 0, duration: 0.3 }, 4.85);
    tl.fromTo(track, { opacity: 0.38, y: -20 }, { y: 660, duration: 0.75, ease: 'none', repeat: 1 }, 3.0);
    tl.set(track, { opacity: 0 }, 4.5);

    // 2.9 · the tape counter rolls backwards
    tl.fromTo(roll, { p: 0 }, { p: 1, duration: D_ROLL, ease: EASE_ROLL, onUpdate: () => renderCounter(roll.p) }, T_ROLL);
    tl.to(counter, { x: 1.2, duration: 0.05, ease: 'none', yoyo: true, repeat: 33 }, T_ROLL + 0.05);
    tl.set(counter, { x: 0 }, T_ROLL + D_ROLL);
    const fastCells = strips.slice(0, 4).map(s => s.parentNode);
    tl.to(fastCells, { filter: 'blur(1.4px)', duration: 0.4, ease: 'sine.in' }, T_ROLL + 0.3);
    tl.to(fastCells, { filter: 'blur(0px)', duration: 0.45, ease: 'sine.out' }, T_ROLL + D_ROLL - 0.55);
    tl.set(fastCells, { filter: 'none' }, T_ROLL + D_ROLL);
    tl.to(body, { y: -4, duration: 0.12, yoyo: true, repeat: 7, ease: 'sine.inOut' }, T_ROLL + 0.2);

    // tick bursts: one tick per year that goes by, plus the fast day/month digits
    const ease = gsap.parseEase(EASE_ROLL);
    const timeAt = (target) => { // inverse of the ease, by bisection
      let a = 0, b = 1;
      for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (ease(m) < target) a = m; else b = m; }
      return T_ROLL + D_ROLL * (a + b) / 2;
    };
    const ticks = [];
    for (let k = 1; k <= 39; k++) ticks.push(timeAt(k / 39));
    let last = -1;
    ticks.sort((a, b) => a - b).forEach(t => { if (t - last >= 0.055) { ctx.sfx('tick', t); last = t; } });

    // 4.8 · landing on 03.11.2017
    const T_END = T_ROLL + D_ROLL;
    tl.to(counter, { scale: 1.07, duration: 0.1, ease: 'power2.out', yoyo: true, repeat: 1 }, T_END);
    tl.to(counter, {
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.10),0 12px 30px rgba(0,0,0,.45),0 0 0 2px rgba(255,122,162,.95),0 0 34px rgba(255,122,162,.55)',
      duration: 0.18, ease: 'power2.out',
    }, T_END);
    tl.to(counter, {
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.10),0 12px 30px rgba(0,0,0,.45),0 0 0 1px rgba(255,122,162,.5),0 0 18px rgba(255,122,162,.25)',
      duration: 0.5, ease: 'power1.out',
    }, T_END + 0.2);
    ctx.sfx('ding', T_END);
    tl.set(rew, { opacity: 0 }, T_END + 0.05);
    tl.fromTo(play, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.2, ease: 'power2.out' }, T_END + 0.05);
    tl.to(cakeBox, { y: -12, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 }, T_END + 0.05);

    // 5.45 · white wipe into the amphitheatre
    ctx.sfx('swoosh', 5.42);
    tl.to(wipe, { x: 0, duration: 0.42, ease: 'power2.in' }, 5.45);
    ctx.backdrop('#ffffff', '#ffffff', 5.7);
    tl.set(wipe, { x: 0 }, 6.0);
  },
});
;

/* ===== js/scenes/02-amphi.js ===== */
/* Scène 2 · « amphi » (~14 s + pause finale)
 * Plan 1 : le tableau noir de l'amphi, la date s'écrit à la craie (« 3 novembre 2017 »).
 * Panoramique filé → plan 2 : les gradins en bois clair, lumière du jour. Artur, au premier rang,
 * déballe son iPhone X ; Sven, juste derrière, se penche par-dessus son épaule :
 * « Oh waw, c'est le nouveau iPhone X ? ». Pause sur la bulle.
 */
Story.register({
  id: 'amphi', order: 2, title: 'L’amphi', photos: [], skippable: true,
  bg: '#f1e2c9', music: 'normal', darkUI: true,
  build(ctx) {
    const tl = ctx.tl, rand = ctx.rand;
    const S = '#stage[data-scene="amphi"]';
    ctx.backdrop('#eadabd', '#e2b880');

    ctx.html(`<style>
${S} .am-layer{position:absolute;left:0;top:0;width:360px;height:640px;overflow:hidden}
${S} .am-svg{position:absolute;left:0;top:0;width:360px;height:640px;overflow:visible;pointer-events:none}
${S} .am-date{position:absolute;left:22px;top:118px;width:316px;text-align:center;white-space:nowrap;
  font:700 45px/1.1 var(--font-hand);color:#f4f0e6;letter-spacing:.01em;
  text-shadow:0 0 1px rgba(255,255,255,.75),0 0 9px rgba(255,255,255,.18)}
${S} .am-chalk{position:absolute;left:0;top:0;width:22px;height:7px;margin:-3px 0 0 -2px;border-radius:3.5px;
  background:linear-gradient(#ffffff,#e4ded2);box-shadow:0 1px 2px rgba(0,0,0,.35);transform-origin:0 50%}
${S} .am-dust{position:absolute;left:0;top:0;width:3px;height:3px;border-radius:50%;background:#f3efe6}
${S} .am-speed{position:absolute;left:0;top:0;width:360px;height:640px;pointer-events:none;z-index:30}
${S} .am-speed i{position:absolute;left:0;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,250,240,.9),rgba(255,255,255,0))}
${S} .am-box{position:absolute;left:162px;top:456px;width:76px;height:48px;overflow:visible;z-index:7}
${S} .am-phone{position:absolute;left:-14px;top:-28px;width:28px;height:56px;z-index:8}
${S} .am-phone svg{position:absolute;left:0;top:0;width:28px;height:56px;overflow:visible}
${S} .am-halo{position:absolute;left:-46px;top:-32px;width:120px;height:120px;border-radius:50%;
  background:radial-gradient(closest-side,rgba(255,250,225,.95),rgba(255,214,140,.45) 45%,rgba(255,214,140,0))}
${S} .am-spark{position:absolute;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;z-index:8}
${S} .am-bub{position:absolute;width:0;height:0;z-index:12}
${S} .am-bub .ch-bubble{font-size:15px;max-width:224px;padding:9px 13px}
${S} .am-zz{position:absolute;font:600 15px var(--font-display);color:#8a6f8f;z-index:4}
${S} .am-wipe{position:absolute;left:-70px;top:0;width:480px;height:640px;z-index:45;pointer-events:none;
  background:linear-gradient(90deg,rgba(255,255,255,0) 0,#fff 14%,#fff 100%)}
</style>`);

    // shared gradients (phone screen etc.)
    ctx.html(`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="amScreen" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff8fb1"/><stop offset=".45" stop-color="#9b7bff"/><stop offset="1" stop-color="#3fb6e8"/></linearGradient>
  <radialGradient id="amScreenHi" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs></svg>`);
    const PHONE = `
  <rect x="0" y="0" width="28" height="56" rx="5.6" fill="#18181c"/>
  <rect x="0.5" y="0.5" width="27" height="55" rx="5.2" fill="none" stroke="#5a5a62" stroke-width=".8"/>
  <rect x="1.5" y="1.5" width="25" height="53" rx="4.4" fill="url(#amScreen)"/>
  <rect x="1.5" y="1.5" width="25" height="53" rx="4.4" fill="url(#amScreenHi)"/>
  <path d="M8.6 1.5 H19.4 V2.6 Q19.4 4.6 17.4 4.6 H10.6 Q8.6 4.6 8.6 2.6 Z" fill="#18181c"/>
  <rect x="10.5" y="9" width="7" height="2.4" rx="1.2" fill="#fff" opacity=".85"/>
  <rect x="9.5" y="51.6" width="9" height="1.1" rx=".55" fill="#fff" opacity=".85"/>
  <path d="M3 3 L13 3 L3 22 Z" fill="#fff" opacity=".10"/>`;

    /* ================= SHOT A — the blackboard ================= */
    const shotA = ctx.html('<div class="am-layer" style="z-index:1"></div>');
    ctx.html(`<svg class="am-svg" viewBox="0 0 360 640">
<defs>
  <linearGradient id="amAWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5e8d3"/><stop offset="1" stop-color="#ead6b6"/></linearGradient>
  <linearGradient id="amABoard" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d6555"/><stop offset=".55" stop-color="#305446"/><stop offset="1" stop-color="#284739"/></linearGradient>
  <linearGradient id="amAFrame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58f56"/><stop offset="1" stop-color="#9f6c3b"/></linearGradient>
  <linearGradient id="amABeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6dc" stop-opacity=".9"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></linearGradient>
  <linearGradient id="amADesk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2d6a8"/><stop offset="1" stop-color="#e0b47a"/></linearGradient>
  <linearGradient id="amAWain" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcb47e"/><stop offset="1" stop-color="#c99b62"/></linearGradient>
  <pattern id="amAStripe" width="24" height="10" patternUnits="userSpaceOnUse"><rect x="0" width="1.5" height="10" fill="#b98a52" opacity=".5"/><rect x="12" width="1" height="10" fill="#e8c693" opacity=".6"/></pattern>
</defs>
<rect width="360" height="640" fill="url(#amAWall)"/>
<rect width="360" height="66" fill="#eadabd"/>
<rect y="64" width="360" height="4" fill="#d9c29c"/>
<rect x="34" y="38" width="96" height="9" rx="4.5" fill="#fffaf0"/><rect x="230" y="38" width="96" height="9" rx="4.5" fill="#fffaf0"/>
<rect x="20" y="104" width="334" height="320" rx="9" fill="#5b3d22" opacity=".14"/>
<rect x="14" y="96" width="332" height="318" rx="8" fill="url(#amAFrame)"/>
<rect x="16" y="98" width="328" height="3" rx="1.5" fill="#e0ad73" opacity=".7"/>
<rect x="22" y="104" width="316" height="300" rx="3" fill="url(#amABoard)"/>
<g fill="none" stroke="#ffffff" stroke-linecap="round" opacity=".055">
  <path d="M46 214 C110 200 190 232 312 208" stroke-width="34"/>
  <path d="M60 392 C140 372 230 398 320 382" stroke-width="22"/>
  <path d="M250 130 C280 124 300 136 326 128" stroke-width="18"/>
</g>
<rect x="22" y="248" width="316" height="2" fill="#1d3329" opacity=".75"/><rect x="22" y="250" width="316" height="1" fill="#6a9080" opacity=".35"/>
<text x="180" y="228" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="23" fill="#ece7dc" opacity=".72">Chap. 4 — Intégrales</text>
<g fill="#ece7dc" font-family="Caveat, cursive" font-weight="700" opacity=".84">
  <text x="36" y="290" font-size="27">f(x) = x² − 3x + 2</text>
  <path d="M38 318 L47.5 299 L57 318 Z" fill="none" stroke="#ece7dc" stroke-width="2.3" stroke-linejoin="round"/>
  <text x="63" y="319" font-size="26">= 9 − 8 = 1</text>
  <path d="M50 336 C45 333 43 338 44.5 344 L47.5 364 C49 372 45 375 40.5 372" fill="none" stroke="#ece7dc" stroke-width="2.4" stroke-linecap="round"/>
  <text x="52" y="340" font-size="15">1</text><text x="35" y="380" font-size="15">0</text>
  <text x="60" y="364" font-size="26">f(x) dx = 5/6</text>
  <rect x="144" y="341" width="50" height="31" rx="6" fill="none" stroke="#ffc9d8" stroke-width="2" opacity=".9"/>
</g>
<g stroke="#ece7dc" stroke-width="2.1" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".82">
  <path d="M222 372 H332 M327 367.5 L332.5 372 L327 376.5"/>
  <path d="M238 390 V274 M233.5 279.5 L238 273.5 L242.5 279.5"/>
  <path d="M241 331 Q283 425 325 331" stroke="#ffd98a"/>
  <path d="M268 368 V376 M298 368 V376"/>
</g>
<g fill="#ece7dc" font-family="Caveat, cursive" font-weight="700" font-size="17" opacity=".8">
  <text x="264" y="392">1</text><text x="294" y="392">2</text>
</g>
<circle cx="268" cy="372" r="2.8" fill="#ffd98a"/><circle cx="298" cy="372" r="2.8" fill="#ffd98a"/>
<rect x="12" y="410" width="336" height="11" rx="3" fill="#8b5c31"/><rect x="12" y="410" width="336" height="3" rx="1.5" fill="#b9814a"/>
<rect x="58" y="404" width="24" height="6" rx="3" fill="#fbf7ee"/><rect x="90" y="405" width="15" height="5" rx="2.5" fill="#ffc9d8"/><rect x="112" y="405.5" width="10" height="4.5" rx="2.2" fill="#ffe08a"/>
<rect x="246" y="398" width="48" height="8" rx="2" fill="#5a4337"/><rect x="246" y="405" width="48" height="5" rx="1" fill="#d9d3c8"/>
<rect y="434" width="360" height="114" fill="url(#amAWain)"/><rect y="434" width="360" height="114" fill="url(#amAStripe)"/>
<rect y="430" width="360" height="6" fill="#e9c897"/>
<polygon points="360,70 360,170 170,640 40,640" fill="url(#amABeam)" opacity=".32"/>
<path d="M-4 548 L364 534 L364 640 L-4 640 Z" fill="url(#amADesk)"/>
<path d="M-4 550 L364 536" stroke="#fbe9c8" stroke-width="3"/>
<g stroke="#d4a56b" stroke-width="1" opacity=".45" fill="none">
  <path d="M-4 578 C80 570 160 580 364 562"/><path d="M-4 612 C120 600 220 612 364 596"/><path d="M-4 632 C90 626 260 636 364 626"/>
</g>
<g transform="translate(10 566) rotate(-7)">
  <rect x="2" y="3" width="98" height="70" rx="3" fill="#000" opacity=".12"/>
  <rect width="98" height="70" rx="3" fill="#fffdf6"/>
  <g stroke="#bcd4ea" stroke-width="1"><path d="M6 14 H92 M6 24 H92 M6 34 H92 M6 44 H92 M6 54 H92 M6 64 H92"/></g>
  <path d="M10 12 C16 6 22 16 28 9 S40 12 46 8" stroke="#4a6fa5" stroke-width="1.6" fill="none"/>
  <path d="M10 22 C18 18 26 24 34 20 S52 22 60 19" stroke="#4a6fa5" stroke-width="1.6" fill="none"/>
  <path d="M10 32 C14 30 20 33 26 31" stroke="#4a6fa5" stroke-width="1.6" fill="none"/>
  <path d="M70 40 C66 34 60 40 70 48 C80 40 74 34 70 40 Z" fill="#ff7aa2" opacity=".85"/>
  <g fill="#9a8f86"><circle cx="49" cy="-2" r="2.2"/><circle cx="59" cy="-2" r="2.2"/><circle cx="39" cy="-2" r="2.2"/><circle cx="69" cy="-2" r="2.2"/></g>
</g>
<g transform="translate(118 598) rotate(-24)"><rect width="46" height="5" rx="2.5" fill="#3b5998"/><path d="M46 0 L54 2.5 L46 5 Z" fill="#e8d2b0"/><rect width="10" height="5" rx="2" fill="#2b4170"/></g>
<g transform="translate(270 560) rotate(6)">
  <rect x="2" y="4" width="66" height="40" rx="5" fill="#000" opacity=".12"/>
  <rect width="66" height="34" rx="4" fill="#ffffff"/>
  <rect y="30" width="66" height="10" rx="3" fill="#e7e7ec"/>
  <rect x="21" y="4" width="24" height="25" rx="3.5" fill="#2a2a30"/>
  <rect x="22.5" y="5.5" width="21" height="22" rx="2.6" fill="url(#amScreen)"/>
  <rect x="29" y="5.5" width="8" height="2" rx="1" fill="#2a2a30"/>
</g>
</svg>`, shotA);
    const dateEl = ctx.html('<div class="am-date">3 novembre 2017</div>', shotA);
    const under = ctx.html(`<svg class="am-svg" viewBox="0 0 360 640"><path d="M70 186 C120 180 190 190 290 181" fill="none" stroke="#f4f0e6" stroke-width="3" stroke-linecap="round" pathLength="100" opacity=".9"/></svg>`, shotA).firstElementChild;
    const chalk = ctx.html('<div class="am-chalk"></div>', shotA);
    const beamDots = ctx.html('<svg class="am-svg" viewBox="0 0 360 640"></svg>', shotA);
    for (let i = 0; i < 9; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', (120 + rand() * 200).toFixed(1)); c.setAttribute('cy', (150 + rand() * 380).toFixed(1));
      c.setAttribute('r', (0.8 + rand() * 1.1).toFixed(2)); c.setAttribute('fill', '#fffbea'); c.setAttribute('opacity', '.7');
      beamDots.appendChild(c);
      ctx.loop(gsap.to(c, { x: 6 + rand() * 10, y: -14 - rand() * 16, duration: 3 + rand() * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }

    /* ================= SHOT B — the tiers ================= */
    const shotB = ctx.html('<div class="am-layer" style="z-index:2"></div>');
    const SL = 0.05;
    const RY = { 1: 500, 2: 398, 3: 312, 4: 242 };
    const RD = { 1: 16, 2: 12, 3: 9, 4: 7 };
    const yTop = (r, x) => RY[r] - SL * x;
    const desk = (r, bottom) => {
      const y0 = RY[r], y1 = RY[r] - SL * 360, d = RD[r];
      return `
  <path d="M-2 ${y0 + d} L362 ${y1 + d} L362 ${bottom} L-2 ${bottom} Z" fill="url(#amGrain)"/>
  <path d="M-2 ${y0 + d} L362 ${y1 + d} L362 ${bottom} L-2 ${bottom} Z" fill="url(#amPanelShade)"/>
  <path d="M-2 ${y0 + d} L362 ${y1 + d} L362 ${y1 + d + 7} L-2 ${y0 + d + 7} Z" fill="#7a4f25" opacity=".16"/>
  <path d="M-2 ${y0} L362 ${y1} L362 ${y1 + d} L-2 ${y0 + d} Z" fill="url(#amTop)"/>
  <path d="M-2 ${y0} L362 ${y1}" stroke="#d9b07a" stroke-width="1"/>
  <path d="M-2 ${y0 + d} L362 ${y1 + d}" stroke="#fdeccd" stroke-width="${r === 1 ? 2.6 : 1.7}"/>`;
    };
    const seats = (r, xs, w, h) => xs.map(x => {
      const y = yTop(r, x) - h;
      return `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h + 14}" rx="${w * 0.3}" fill="#b54a48"/>
  <rect x="${x - w / 2 + 3}" y="${y + 3}" width="${w - 6}" height="${h * 0.42}" rx="${w * 0.24}" fill="#cf625c"/>
  <rect x="${x - w / 2 + w * 0.2}" y="${y + 5}" width="${w * 0.25}" height="${h * 0.16}" rx="${w * 0.08}" fill="#e2807a" opacity=".7"/>`;
    }).join('');
    // simple drawn students (never real faces)
    const student = (x, r, s, o) => {
      const yd = yTop(r, x), hr = 13.5 * s, cy = yd - 25 * s, sh = cy + hr * 0.95;
      const hair = o.hair || '#4a3428', skin = o.skin || '#f1c3a0';
      let m = `<path d="M${x - 19 * s} ${yd + 14} L${x - 19 * s} ${sh + 6 * s} Q${x - 18 * s} ${sh} ${x} ${sh - 1.5 * s} Q${x + 18 * s} ${sh} ${x + 19 * s} ${sh + 6 * s} L${x + 19 * s} ${yd + 14} Z" fill="${o.top}"/>`;
      m += `<path d="M${x - 5 * s} ${sh - 1.2 * s} Q${x} ${sh + 4 * s} ${x + 5 * s} ${sh - 1.2 * s} Z" fill="${skin}" opacity=".9"/>`;
      m += `<circle cx="${x}" cy="${cy}" r="${hr}" fill="${skin}"/>`;
      if (o.style === 'beanie') {
        m += `<path d="M${x - hr * 1.02} ${cy - hr * 0.1} Q${x - hr} ${cy - hr * 1.35} ${x} ${cy - hr * 1.3} Q${x + hr} ${cy - hr * 1.35} ${x + hr * 1.02} ${cy - hr * 0.1} Z" fill="${hair}"/><rect x="${x - hr * 1.05}" y="${cy - hr * 0.42}" width="${hr * 2.1}" height="${hr * 0.38}" rx="${hr * 0.18}" fill="#ffffff" opacity=".35"/><circle cx="${x}" cy="${cy - hr * 1.32}" r="${hr * 0.22}" fill="${hair}"/>`;
      } else if (o.style === 'long') {
        m += `<path d="M${x - hr * 1.12} ${cy + hr * 1.1} Q${x - hr * 1.3} ${cy - hr * 1.3} ${x} ${cy - hr * 1.18} Q${x + hr * 1.3} ${cy - hr * 1.3} ${x + hr * 1.12} ${cy + hr * 1.1} L${x + hr * 0.82} ${cy + hr * 1.05} Q${x + hr * 0.9} ${cy - hr * 0.3} ${x + hr * 0.2} ${cy - hr * 0.55} Q${x - hr * 0.7} ${cy - hr * 0.3} ${x - hr * 0.82} ${cy + hr * 1.05} Z" fill="${hair}"/>`;
      } else {
        m += `<path d="M${x - hr * 1.02} ${cy - hr * 0.05} Q${x - hr * 1.15} ${cy - hr * 1.25} ${x - hr * 0.1} ${cy - hr * 1.18} Q${x + hr * 1.2} ${cy - hr * 1.3} ${x + hr * 1.02} ${cy - hr * 0.05} Q${x + hr * 0.75} ${cy - hr * 0.62} ${x + hr * 0.1} ${cy - hr * 0.6} Q${x - hr * 0.6} ${cy - hr * 0.68} ${x - hr * 1.02} ${cy - hr * 0.05} Z" fill="${hair}"/>`;
      }
      const ey = cy + hr * 0.12;
      if (o.eyes === 'down') {
        m += `<path d="M${x - hr * 0.48} ${ey} q${hr * 0.16} ${hr * 0.12} ${hr * 0.32} 0 M${x + hr * 0.16} ${ey} q${hr * 0.16} ${hr * 0.12} ${hr * 0.32} 0" stroke="#3a2e3f" stroke-width="${1.3 * s}" fill="none" stroke-linecap="round"/>`;
      } else {
        m += `<circle cx="${x - hr * 0.34}" cy="${ey}" r="${1.5 * s}" fill="#3a2e3f"/><circle cx="${x + hr * 0.34}" cy="${ey}" r="${1.5 * s}" fill="#3a2e3f"/>`;
      }
      m += `<path d="M${x - hr * 0.22} ${cy + hr * 0.5} Q${x} ${cy + hr * 0.66} ${x + hr * 0.22} ${cy + hr * 0.5}" stroke="#3a2e3f" stroke-width="${1.1 * s}" fill="none" stroke-linecap="round"/>`;
      m += `<circle cx="${x - hr * 0.55}" cy="${cy + hr * 0.38}" r="${hr * 0.16}" fill="#ff9fbd" opacity=".45"/><circle cx="${x + hr * 0.55}" cy="${cy + hr * 0.38}" r="${hr * 0.16}" fill="#ff9fbd" opacity=".45"/>`;
      if (o.glasses) m += `<g fill="none" stroke="#3a2e3f" stroke-width="${0.9 * s}"><circle cx="${x - hr * 0.34}" cy="${ey}" r="${hr * 0.25}"/><circle cx="${x + hr * 0.34}" cy="${ey}" r="${hr * 0.25}"/><path d="M${x - hr * 0.09} ${ey} H${x + hr * 0.09}"/></g>`;
      return m;
    };
    const laptop = (x, r, s) => {
      const yd = yTop(r, x) + RD[r] * 0.6;
      return `<path d="M${x - 17 * s} ${yd} L${x - 14 * s} ${yd - 19 * s} L${x + 14 * s} ${yd - 19 * s} L${x + 17 * s} ${yd} Z" fill="#c9ced8"/><path d="M${x - 14 * s} ${yd - 19 * s} L${x + 14 * s} ${yd - 19 * s}" stroke="#e8ebf0" stroke-width="1.2"/><circle cx="${x + 5 * s}" cy="${yd - 10 * s}" r="${3 * s}" fill="#ff7aa2" opacity=".85"/><rect x="${x - 10 * s}" y="${yd - 13 * s}" width="${7 * s}" height="${4 * s}" rx="1" fill="#7fd6c2" opacity=".85"/>`;
    };

    // background: ceiling, windows with a view on the lake & Alps, wooden slat wall, back rows
    ctx.html(`<svg class="am-svg" viewBox="0 0 360 640" style="z-index:1">
<defs>
  <linearGradient id="amSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe0f2"/><stop offset=".75" stop-color="#f8e8cc"/><stop offset="1" stop-color="#fbe2b8"/></linearGradient>
  <linearGradient id="amTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c995"/><stop offset="1" stop-color="#f4dbb0"/></linearGradient>
  <linearGradient id="amPanelShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".06"/><stop offset="1" stop-color="#6b4320" stop-opacity=".22"/></linearGradient>
  <pattern id="amGrain" width="28" height="12" patternUnits="userSpaceOnUse"><rect width="28" height="12" fill="#ddb47c"/><rect width="1.4" height="12" fill="#c99b62" opacity=".7"/><rect x="9" width="1" height="12" fill="#e9c896" opacity=".7"/><rect x="19" width="1" height="12" fill="#d3a76d" opacity=".6"/></pattern>
  <pattern id="amSlat" width="9" height="20" patternUnits="userSpaceOnUse"><rect width="9" height="20" fill="#cfa46e"/><rect x="1" width="5.5" height="20" fill="#e2c08c"/><rect x="6.5" width="1.2" height="20" fill="#b98d56"/></pattern>
</defs>
<rect width="360" height="80" fill="#efe1c8"/>
<ellipse cx="70" cy="44" rx="34" ry="5" fill="#fffaf0"/><ellipse cx="190" cy="40" rx="34" ry="5" fill="#fffaf0"/><ellipse cx="310" cy="44" rx="34" ry="5" fill="#fffaf0"/>
<rect y="74" width="360" height="66" fill="#c99f6c"/>
<rect x="4" y="78" width="352" height="58" fill="url(#amSky)"/>
<path d="M4 120 L20 111 L36 114 L58 98 L78 108 L100 102 L122 112 L148 93 L170 105 L194 99 L220 110 L246 95 L268 106 L292 100 L316 110 L338 97 L356 105 L356 126 L4 126 Z" fill="#a9b4d4"/>
<path d="M51 103 L58 98 L65 103 L61 102 L58 104 Z M141 98 L148 93 L155 98 L151 97.5 L148 99.5 Z M239 100 L246 95 L253 100 L249 99 L246 101 Z M331 102 L338 97 L345 102 L341 101 L338 103 Z" fill="#ffffff"/>
<rect x="4" y="121" width="352" height="8" fill="#8cc0d6"/>
<path d="M30 124 H52 M120 125 H150 M210 124 H236 M290 125 H318" stroke="#e8f6fb" stroke-width="1.2" opacity=".8"/>
<rect x="4" y="128" width="352" height="8" fill="#86a66d"/>
<g fill="#c99f6c"><rect x="60" y="78" width="5" height="58"/><rect x="121" y="78" width="5" height="58"/><rect x="182" y="78" width="5" height="58"/><rect x="243" y="78" width="5" height="58"/><rect x="304" y="78" width="5" height="58"/><rect x="4" y="105" width="352" height="2.5" opacity=".7"/></g>
<path d="M20 82 L40 82 L14 132 L4 132 Z M150 82 L162 82 L138 132 L128 132 Z" fill="#ffffff" opacity=".18"/>
<rect y="140" width="360" height="8" fill="#b78e5c"/>
<rect y="148" width="360" height="110" fill="url(#amSlat)"/>
<rect x="26" y="156" width="32" height="17" rx="2.5" fill="#2e9d64"/>
<g fill="#ffffff"><circle cx="35" cy="160" r="1.7"/><path d="M34 162.5 L37 163 L39 166 L38 166.6 L36.4 164.6 L35.6 167 L37.8 170 L36.6 170.6 L34.6 168 L32.6 170.6 L31.6 169.8 L33.4 167 L34 164.6 L32.4 165.8 L31.6 165 Z"/><path d="M44 164.5 H52 M49 161.8 L52.2 164.5 L49 167.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
${seats(4, [24, 60, 96, 132, 168, 204, 240, 276, 312, 348], 25, 22)}
${student(118, 4, 0.62, { top: '#6c8fbf', hair: '#2f2622' })}
${student(306, 4, 0.62, { top: '#8f6aa8', hair: '#b45d3a', style: 'beanie' })}
${desk(4, 330)}
${seats(3, [22, 66, 110, 154, 198, 242, 286, 330], 31, 30)}
${student(64, 3, 0.86, { top: '#e07a5f', hair: '#3b2a20', style: 'long', eyes: 'down' })}
${laptop(64, 3, 0.95)}
${student(156, 3, 0.86, { top: '#4f9d8a', hair: '#5b3b26', glasses: true })}
${student(324, 3, 0.86, { top: '#f2c14e', hair: '#2a211d', eyes: 'down' })}
${desk(3, 420)}
${seats(2, [36, 92, 148, 204, 260, 316], 38, 40)}
</svg>`, shotB);

    // row 2 desk + the sleeper
    ctx.html(`<svg class="am-svg" viewBox="0 0 360 640" style="z-index:4">
${desk(2, 520)}
<g>
  <ellipse cx="34" cy="${yTop(2, 34) + 4}" rx="30" ry="9" fill="#7c6aa6"/>
  <ellipse cx="38" cy="${yTop(2, 34) + 1}" rx="22" ry="7" fill="#8e7bb8"/>
  <circle cx="34" cy="${yTop(2, 34) - 10}" r="14" fill="#f0c19c"/>
  <path d="M20 ${yTop(2, 34) - 12} Q22 ${yTop(2, 34) - 28} 38 ${yTop(2, 34) - 25} Q50 ${yTop(2, 34) - 20} 47 ${yTop(2, 34) - 8} Q40 ${yTop(2, 34) - 18} 28 ${yTop(2, 34) - 16} Z" fill="#6b4a33"/>
  <path d="M27 ${yTop(2, 34) - 7} q3 2 6 0 M37 ${yTop(2, 34) - 7} q3 2 6 0" stroke="#3a2e3f" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="34" cy="${yTop(2, 34) - 1}" rx="2.4" ry="1.6" fill="#3a2e3f" opacity=".7"/>
</g>
<g transform="translate(206 ${yTop(2, 206) + 4}) skewX(-28)">
  <rect width="34" height="8" rx="1.2" fill="#fffdf6"/><path d="M3 3 H31 M3 5.6 H31" stroke="#bcd4ea" stroke-width=".7"/>
</g>
</svg>`, shotB);

    // Sven (2nd row, right) — seated at his desk, hands resting on it (legs hidden by the desk)
    const sven = ctx.char('sven', { outfit: 'tshirt-white', h: 172, x: 250, y: 430, parent: shotB });
    sven.el.style.zIndex = 4;
    gsap.set([sven.legL, sven.legR], { opacity: 0 });
    gsap.set(sven.armL, { rotation: 10 });
    gsap.set(sven.armR, { rotation: -10 });
    gsap.set(sven.el, { transformOrigin: '50% 76%' });

    // row-1 seat backs (in front of Sven)
    ctx.html(`<svg class="am-svg" viewBox="0 0 360 640" style="z-index:4">
${seats(1, [46, 110, 174, 238, 302], 48, 52)}
<g transform="translate(300 ${yTop(1, 300) + 2})">
  <path d="M-8 0 L-6.5 -22 L6.5 -22 L8 0 Z" fill="#ffffff"/><rect x="-7.5" y="-26" width="15" height="5" rx="2" fill="#5a4337"/>
  <rect x="-7" y="-15" width="14" height="6" fill="#ff7aa2" opacity=".85"/>
</g>
</svg>`, shotB);
    const zz = [ctx.html('<div class="am-zz" style="left:46px;top:362px">z</div>', shotB),
      ctx.html('<div class="am-zz" style="left:56px;top:350px;font-size:13px">z</div>', shotB)];
    zz.forEach((z, i) => ctx.loop(gsap.fromTo(z, { opacity: 0, y: 6, x: 0 }, { opacity: 0.9, y: -16, x: 6, duration: 1.8, ease: 'sine.out', repeat: -1, delay: i * 0.9 })));

    // Artur (front row, left) — behind the front desk
    const artur = ctx.char('artur', { outfit: 'casual', h: 200, x: 110, y: 546, parent: shotB });
    artur.el.style.zIndex = 5;
    const held = artur.hold('R', `<g class="am-held" opacity="0"><g transform="translate(-15.4 -58) scale(1.1)">${PHONE}</g></g>`);
    gsap.set(held, { svgOrigin: '0 0' });

    // front desk with a notebook
    ctx.html(`<svg class="am-svg" viewBox="0 0 360 640" style="z-index:6">
${desk(1, 640)}
<g transform="translate(18 ${yTop(1, 18) + 3}) skewX(-30)">
  <rect width="46" height="11" rx="1.5" fill="#fffdf6"/><path d="M4 4 H42 M4 7.5 H42" stroke="#bcd4ea" stroke-width=".8"/>
</g>
<g transform="translate(66 ${yTop(1, 66) + 9}) rotate(-8)"><rect width="28" height="3" rx="1.5" fill="#3b5998"/></g>
<path d="M0 560 C80 552 200 566 360 548 M0 598 C120 590 240 602 360 588" stroke="#c99b62" stroke-width="1" fill="none" opacity=".35"/>
</svg>`, shotB);

    // the iPhone box on the front desk
    const box = ctx.html(`<svg class="am-box" viewBox="0 0 76 48">
  <defs><radialGradient id="amGlow"><stop offset="0" stop-color="#fffdf2"/><stop offset=".35" stop-color="#ffe7a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="38" cy="43.5" rx="35" ry="3.6" fill="#6b4420" opacity=".25"/>
  <rect x="8" y="20" width="60" height="22" rx="2.5" fill="#e9e9ef"/>
  <rect x="8" y="35" width="60" height="7" rx="2" fill="#d9d9e1"/>
  <path d="M10 20 L66 20 L63 16.5 L13 16.5 Z" fill="#c9cad3"/>
  <rect class="am-inner" x="20" y="17" width="36" height="3" rx="1.5" fill="#202024"/>
  <g class="am-rays" opacity="0">
    <g fill="#ffd98a">
      <path d="M38 18 L20 -62 L30 -62 Z" opacity=".75"/><path d="M38 18 L35 -76 L43 -76 Z" opacity=".85"/><path d="M38 18 L49 -66 L58 -61 Z" opacity=".75"/>
      <path d="M38 18 L2 -40 L10 -47 Z" opacity=".55"/><path d="M38 18 L70 -44 L77 -37 Z" opacity=".55"/>
    </g>
  </g>
  <circle class="am-glow" cx="38" cy="16" r="36" fill="url(#amGlow)" opacity="0"/>
  <g class="am-lid">
    <path d="M10 4 L66 4 L70 14 L6 14 Z" fill="#ffffff"/>
    <path d="M27 5.4 L49 5.4 L50.6 12.6 L25.4 12.6 Z" fill="#2a2a30"/>
    <path d="M28.2 6.2 L47.8 6.2 L49 11.8 L27 11.8 Z" fill="url(#amScreen)" opacity=".9"/>
    <rect x="6" y="14" width="64" height="26" rx="2.5" fill="#f7f7fa"/>
    <rect x="6" y="33" width="64" height="7" rx="2" fill="#e8e8ee"/>
    <rect x="9" y="16" width="3" height="18" rx="1.5" fill="#ffffff"/>
    <path d="M6 14.2 H70" stroke="#e1e1e8" stroke-width=".8"/>
  </g>
</svg>`, shotB);
    const lid = box.querySelector('.am-lid'), glowC = box.querySelector('.am-glow'), rays = box.querySelector('.am-rays');
    const inner = box.querySelector('.am-inner');
    gsap.set(glowC, { transformOrigin: '50% 50%', scale: 0.2 });
    gsap.set(rays, { svgOrigin: '38 18', scale: 0.4 });
    gsap.set(lid, { svgOrigin: '38 40' });
    ctx.loop(gsap.to(rays, { rotation: 10, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));

    // the floating iPhone X
    const phone = ctx.html(`<div class="am-phone"><div class="am-halo"></div><svg viewBox="0 0 28 56">${PHONE}</svg></div>`, shotB);
    const halo = phone.querySelector('.am-halo');
    gsap.set(phone, { x: 200, y: 478, scale: 0.3, opacity: 0 });
    ctx.loop(gsap.to(halo, { scale: 1.14, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    const SPARK = '<svg viewBox="0 0 16 16"><path d="M8 0 Q9 7 16 8 Q9 9 8 16 Q7 9 0 8 Q7 7 8 0Z" fill="#fff3c4"/></svg>';
    const sparks = [[160, 400, 1], [230, 386, 0.8], [176, 452, 0.7], [224, 440, 1.1], [200, 366, 0.7], [150, 430, 0.6]].map(([x, y, s]) => {
      const n = ctx.html(`<div class="am-spark">${SPARK}</div>`, shotB);
      gsap.set(n, { x, y, scale: 0, opacity: 0 });
      return { n, s };
    });

    // sunbeams + dust over everything (warm daylight)
    const beams = ctx.html(`<svg class="am-svg" viewBox="0 0 360 640" style="z-index:9">
  <defs><linearGradient id="amBeamB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></linearGradient></defs>
  <polygon points="196,136 268,136 30,640 -110,640" fill="url(#amBeamB)" opacity=".2"/>
  <polygon points="300,136 352,136 200,640 96,640" fill="url(#amBeamB)" opacity=".14"/>
</svg>`, shotB);
    for (let i = 0; i < 10; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', (40 + rand() * 260).toFixed(1)); c.setAttribute('cy', (160 + rand() * 330).toFixed(1));
      c.setAttribute('r', (0.8 + rand() * 1.0).toFixed(2)); c.setAttribute('fill', '#fffbea'); c.setAttribute('opacity', '.75');
      beams.appendChild(c);
      ctx.loop(gsap.to(c, { x: -8 - rand() * 10, y: 10 + rand() * 18, duration: 3.5 + rand() * 2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }

    // Sven's speech bubble, anchored in stage space so it stays upright while he leans
    const bubAnchor = ctx.html('<div class="am-bub" style="left:200px;top:252px"></div>', shotB);
    const bubble = ctx.html('<div class="ch-bubble">Oh waw, c’est le nouveau iPhone X ?</div>', bubAnchor);
    gsap.set(bubble, { opacity: 0 });

    // whip-pan speed lines + white wipe-out from the previous scene
    const speed = ctx.html('<div class="am-speed"></div>');
    for (let i = 0; i < 9; i++) {
      ctx.html(`<i style="top:${(90 + rand() * 470).toFixed(0)}px;width:${(120 + rand() * 160).toFixed(0)}px;left:${(rand() * 200).toFixed(0)}px;opacity:${(0.4 + rand() * 0.5).toFixed(2)}"></i>`, speed);
    }
    gsap.set(speed, { opacity: 0 });
    const wipe = ctx.html('<div class="am-wipe"></div>');

    /* ======================= timeline ======================= */
    // 0 · the white wipe continues off to the right
    tl.fromTo(wipe, { x: 0 }, { x: 440, duration: 0.55, ease: 'power2.out' }, 0.02);

    // 0.5 · chalk writes the date
    gsap.set(shotB, { x: 360 });
    gsap.set(dateEl, { clipPath: 'inset(0% 100% 0% 0%)' });
    gsap.set(under, { strokeDasharray: '100 100', strokeDashoffset: 100 });
    gsap.set(chalk, { x: 40, y: 150, rotation: -38, opacity: 0 });
    ctx.caption('3 novembre 2017. EPFL, en plein cours.', 0.7, { pos: 'bottom', dur: 3.05 });
    tl.to(chalk, { opacity: 1, duration: 0.15 }, 0.55);
    tl.to(dateEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'none' }, 0.75);
    tl.to(chalk, { x: 316, duration: 1.6, ease: 'none' }, 0.75);
    tl.to(chalk, { y: 128, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 7 }, 0.75);
    tl.to(chalk, { x: 66, y: 190, duration: 0.3, ease: 'power2.inOut' }, 2.38);
    tl.to(under, { strokeDashoffset: 0, duration: 0.45, ease: 'power1.inOut' }, 2.72);
    tl.to(chalk, { x: 290, y: 184, duration: 0.45, ease: 'power1.inOut' }, 2.72);
    tl.to(chalk, { x: 330, y: 400, rotation: -8, duration: 0.5, ease: 'power2.in' }, 3.25);
    tl.to(chalk, { opacity: 0, duration: 0.15 }, 3.6);
    [1.0, 1.4, 1.8, 2.15, 2.8].forEach(t => ctx.sfx('sweep', t));
    for (let i = 0; i < 7; i++) {
      const d = ctx.html('<div class="am-dust"></div>', shotA);
      const t = 0.85 + i * 0.24, x = 40 + (276 * (t - 0.75)) / 1.6;
      gsap.set(d, { opacity: 0, x, y: 168 });
      tl.fromTo(d, { opacity: 0.9, x, y: 166 + rand() * 6 }, { opacity: 0, x: x + (rand() * 10 - 5), y: 200 + rand() * 18, duration: 0.7, ease: 'power1.in' }, t);
    }

    // slow push-ins keep the shots alive
    gsap.set(shotA, { transformOrigin: '50% 28%' });
    tl.fromTo(shotA, { scale: 1 }, { scale: 1.05, duration: 4.4, ease: 'none' }, 0);
    gsap.set(shotB, { transformOrigin: '200px 380px' });
    tl.fromTo(shotB, { scale: 1 }, { scale: 1.035, duration: 9.5, ease: 'sine.inOut' }, 4.5);

    // skip points: a tap jumps to the next beat instead of straight to the final pause
    ctx.beat(3.9);
    ctx.beat(8.8);

    // 3.95 · whip pan to the students
    ctx.sfx('whoosh', 3.9);
    tl.to(shotA, { x: -360, duration: 0.55, ease: 'power3.inOut' }, 3.95);
    tl.to(shotB, { x: 0, duration: 0.55, ease: 'power3.inOut' }, 3.95);
    tl.fromTo(speed, { opacity: 0, x: 60 }, { opacity: 1, x: -60, duration: 0.22, ease: 'none' }, 4.05);
    tl.to(speed, { opacity: 0, x: -140, duration: 0.2, ease: 'none' }, 4.27);
    ctx.backdrop('#efe1c8', '#c79f6c', 4.2);

    // 4.7 · unboxing
    ctx.caption('Jour de sortie de l’iPhone X. Je le déballe…', 4.75, { pos: 'bottom', dur: 3.75 });
    artur.tilt(5.0, 8, 0.35);
    tl.to(artur.armR, { rotation: -50, duration: 0.45, ease: 'power2.out' }, 5.25);
    // the lid slides up, slowly (that famous suction)
    tl.to(lid, { y: -9, duration: 0.5, ease: 'power1.inOut' }, 5.75);
    tl.to(lid, { y: -24, duration: 0.7, ease: 'power2.inOut' }, 6.25);
    tl.to(lid, { rotation: -3, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 5.8);
    tl.to(artur.armR, { rotation: -64, duration: 0.7, ease: 'power2.inOut' }, 6.25);
    tl.to(glowC, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 6.2);
    tl.to(rays, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 6.35);
    ctx.sfx('magic', 6.3);
    tl.to(lid, { x: 62, y: 4, rotation: 4, duration: 0.5, ease: 'power2.inOut' }, 6.95);
    tl.to(artur.armR, { rotation: 0, duration: 0.45, ease: 'power2.inOut' }, 6.95);
    artur.tilt(6.95, -2, 0.4);
    // the phone rises in a halo
    tl.to(inner, { opacity: 0, duration: 0.1 }, 7.0);
    tl.to(phone, { opacity: 1, duration: 0.15 }, 7.0);
    tl.to(phone, { y: 408, x: 198, scale: 1, duration: 0.85, ease: 'back.out(1.3)' }, 7.0);
    tl.fromTo(phone, { rotation: -14 }, { rotation: 6, duration: 0.85, ease: 'sine.inOut' }, 7.0);
    tl.to(phone, { rotation: 0, y: 402, duration: 0.4, ease: 'sine.inOut' }, 7.85);
    tl.to(rays, { opacity: 0, duration: 0.6 }, 7.7);
    tl.to(glowC, { opacity: 0, duration: 0.6 }, 7.7);
    sparks.forEach(({ n, s }, i) => {
      const t = 7.2 + i * 0.12;
      tl.to(n, { scale: s, opacity: 1, rotation: 45, duration: 0.25, ease: 'back.out(3)' }, t);
      tl.to(n, { scale: 0, opacity: 0, rotation: 90, duration: 0.3, ease: 'power2.in' }, t + 0.45);
    });
    const spEm = ctx.html('<div class="ch-emote" style="padding:0;width:30px"><svg viewBox="0 0 16 16" width="17" height="17"><path d="M8 0 Q9 7 16 8 Q9 9 8 16 Q7 9 0 8 Q7 7 8 0Z" fill="#3a2e3f"/></svg></div>', artur.el);
    tl.fromTo(spEm, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: 'back.out(3)' }, 7.45);
    tl.to(spEm, { opacity: 0, y: -10, duration: 0.25 }, 8.55);
    artur.tilt(7.5, 6, 0.3);
    // Artur catches it
    tl.to(artur.armR, { rotation: -110, duration: 0.42, ease: 'back.out(1.2)' }, 8.05);
    tl.to(held, { rotation: 110, duration: 0.42, ease: 'back.out(1.2)' }, 8.05);
    tl.to(phone, { x: 176.7, y: 422.2, duration: 0.42, ease: 'power2.inOut' }, 8.05);
    tl.to(held, { opacity: 1, duration: 0.01 }, 8.47);
    tl.to(phone.querySelector('svg'), { opacity: 0, duration: 0.01 }, 8.47);
    tl.to(halo, { opacity: 0, duration: 0.35 }, 8.1);
    artur.tilt(8.5, 9, 0.35);

    // 8.85 · …and right behind me, someone leans in
    ctx.caption('…et juste derrière moi, quelqu’un se penche.', 8.85, { pos: 'bottom' });
    ctx.loop(gsap.fromTo(sven.face, { rotation: -1.5 }, { rotation: 1.5, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    sven.tilt(9.25, -9, 0.3);
    sven.emote(9.5, '!', 1.15);
    ctx.sfx('pop', 9.5);
    tl.to(sven.el, { rotation: 3, y: -4, duration: 0.2, ease: 'power1.out' }, 9.85);
    tl.to(sven.el, { rotation: -17, x: -40, y: 8, scale: 1.08, duration: 0.6, ease: 'back.out(1.5)' }, 10.05);
    tl.to(sven.armL, { rotation: 22, duration: 0.5, ease: 'power2.out' }, 10.05);
    tl.to(sven.armR, { rotation: -2, duration: 0.5, ease: 'power2.out' }, 10.05);
    sven.tilt(10.05, -4, 0.4);
    ctx.sfx('swoosh', 10.05);
    tl.fromTo(bubble, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.2)' }, 10.75);
    ctx.sfx('pop', 10.75);
    artur.tilt(11.7, 13, 0.35);
    tl.to(artur.armR, { rotation: -104, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 12.1);
    tl.to(held, { rotation: 104, duration: 0.25, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 12.1);

    // pause on the bubble. (A hold placed exactly at the end of a timeline does not pause in this
    // engine — onComplete wins — so the scene keeps a short tail after it.)
    ctx.hold(14.0);
    tl.to(bubble, { opacity: 0, scale: 0.92, duration: 0.25, ease: 'power1.in' }, 14.02);
    tl.set({}, {}, 14.3);
  },
});
;

/* ===== js/scenes/03-satellite.js ===== */
/* Scène 3 · « satellite » (~13 s, finit sur la photo 1)
 * Le soir même, au Satellite (le bar étudiant de l'EPFL) : plafond sombre, lampes industrielles,
 * fresque colorée, banquette verte capitonnée, deux bières. Artur montre son iPhone X,
 * Sven : « Fais voir ! », le prend et le lève pour un selfie. On plonge dans l'écran :
 * Face ID, appareil photo en mode PORTRAIT, retardateur 3-2-1… et la photo 1.
 */
Story.register({
  id: 'satellite', order: 3, title: 'Le Satellite', photos: [1], skippable: true,
  bg: '#1a1520', music: 'normal', darkUI: false,
  build(ctx) {
    const tl = ctx.tl, rand = ctx.rand;
    const S = '#stage[data-scene="satellite"]';
    const NS = 'http://www.w3.org/2000/svg';
    ctx.backdrop('#141118', '#181217');

    ctx.html(`<style>
${S} .sa-layer{position:absolute;left:0;top:0;width:360px;height:640px;overflow:hidden}
${S} .sa-svg{position:absolute;left:0;top:0;width:360px;height:640px;overflow:visible;pointer-events:none}
${S} .sa-neon{position:absolute;left:0;top:146px;width:360px;text-align:center;z-index:2;white-space:nowrap;
  font:700 46px/1 var(--font-hand);color:#ffe3ee;letter-spacing:.01em;
  text-shadow:0 0 3px #ff9fc0,0 0 9px #ff5c93,0 0 20px rgba(255,79,139,.75),0 0 38px rgba(255,79,139,.45)}
${S} .sa-dark{position:absolute;inset:0;background:#08060b;z-index:20;pointer-events:none}
${S} .sa-black{position:absolute;inset:0;background:#000;z-index:22;pointer-events:none}
${S} .sa-phone{position:absolute;inset:0;background:#000;z-index:25;overflow:hidden;color:#fff;font-family:var(--font-display)}
${S} .sa-vf{position:absolute;left:0;top:98px;width:360px;height:404px;overflow:hidden;background:#17131b}
${S} .sa-vf > svg{position:absolute;left:0;top:0;width:360px;height:404px}
${S} .sa-top{position:absolute;left:0;top:72px;width:360px;height:26px}
${S} .sa-top svg{position:absolute;top:2px;height:21px;width:auto;overflow:visible}
${S} .sa-timer{position:absolute;left:214px;top:3px;font:600 14px/20px var(--font-display);color:#ffd60a;display:flex;gap:4px;align-items:center}
${S} .sa-pad{position:absolute;left:170px;top:73px;width:20px;height:24px;overflow:visible}
${S} .sa-pill{position:absolute;left:50%;top:330px;transform:translateX(-50%);display:flex;align-items:center;gap:7px;
  background:#2fbf5b;color:#fff;font:600 17px/1 var(--font-display);padding:8px 15px 8px 9px;border-radius:999px;
  box-shadow:0 6px 18px rgba(0,0,0,.35);white-space:nowrap;z-index:8}
${S} .sa-depth{position:absolute;left:50%;top:12px;transform:translateX(-50%);background:#ffd60a;color:#1c1c1e;
  font:600 13px/1 var(--font-display);letter-spacing:.06em;padding:5px 9px;border-radius:5px;white-space:nowrap;z-index:8}
${S} .sa-count{position:absolute;left:0;top:118px;width:360px;text-align:center;font:600 130px/1 var(--font-display);
  color:#fff;text-shadow:0 4px 24px rgba(0,0,0,.45);z-index:9}
${S} .sa-bottom{position:absolute;left:0;top:502px;width:360px;height:138px}
${S} .sa-modes{position:absolute;left:0;top:2px;width:360px;height:22px;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 22%,#000 78%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 22%,#000 78%,transparent 100%)}
${S} .viewer .v-top b{visibility:hidden}
${S} .sa-strip{position:absolute;left:0;top:0;display:flex}
${S} .sa-strip span{display:block;width:88px;text-align:center;font:600 13px/22px var(--font-display);letter-spacing:.08em;color:rgba(255,255,255,.82)}
${S} .sa-strip span.on{color:#ffd60a}
${S} .sa-shutter{position:absolute;left:147px;top:27px;width:66px;height:66px;border-radius:50%;box-sizing:border-box;border:4px solid #fff}
${S} .sa-shutter i{position:absolute;left:3px;top:3px;width:52px;height:52px;border-radius:50%;background:#fff}
${S} .sa-thumb{position:absolute;left:30px;top:40px;width:40px;height:40px;border-radius:8px;background:#232326;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
${S} .sa-flipcam{position:absolute;left:290px;top:40px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center}
</style>`);

    /* ===================== THE BAR ===================== */
    const bar = ctx.html('<div class="sa-layer" style="z-index:1"></div>');

    // mural pieces
    const star4 = (x, y, r, c) => `<path d="M${x} ${y - r} Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}Z" fill="${c}"/>`;
    let muralStars = '';
    [[150, 236, 5, '#ffd27a'], [214, 222, 4, '#fff1c9'], [258, 312, 5, '#ffd27a'], [92, 160, 4, '#fff1c9'], [334, 182, 4, '#ffd27a'],
      [126, 318, 3.5, '#fff1c9'], [176, 262, 3, '#ffd27a'], [236, 266, 3, '#fff1c9'], [20, 204, 3, '#ffd27a']].forEach(a => { muralStars += star4(...a); });
    // simple drawn background people (never real faces)
    const person = (x, y, s, top, hair, back) => `
  <path d="M${x - 22 * s} ${y + 70 * s} L${x - 20 * s} ${y + 22 * s} Q${x} ${y + 12 * s} ${x + 20 * s} ${y + 22 * s} L${x + 22 * s} ${y + 70 * s} Z" fill="${top}"/>
  <circle cx="${x}" cy="${y}" r="${14 * s}" fill="#d9a888"/>
  ${back
    ? `<path d="M${x - 14.5 * s} ${y + 3 * s} Q${x - 16 * s} ${y - 17 * s} ${x} ${y - 15.5 * s} Q${x + 16 * s} ${y - 17 * s} ${x + 14.5 * s} ${y + 3 * s} Q${x + 10 * s} ${y + 12 * s} ${x} ${y + 12 * s} Q${x - 10 * s} ${y + 12 * s} ${x - 14.5 * s} ${y + 3 * s} Z" fill="${hair}"/>`
    : `<path d="M${x - 14.5 * s} ${y} Q${x - 15 * s} ${y - 17 * s} ${x} ${y - 15 * s} Q${x + 15 * s} ${y - 17 * s} ${x + 14.5 * s} ${y} Q${x + 8 * s} ${y - 8 * s} ${x - 14.5 * s} ${y} Z" fill="${hair}"/>
       <circle cx="${x - 5 * s}" cy="${y + 2 * s}" r="${1.5 * s}" fill="#2a1f28"/><circle cx="${x + 5 * s}" cy="${y + 2 * s}" r="${1.5 * s}" fill="#2a1f28"/>
       <path d="M${x - 4 * s} ${y + 7 * s} Q${x} ${y + 10 * s} ${x + 4 * s} ${y + 7 * s}" stroke="#2a1f28" stroke-width="${1.2 * s}" fill="none" stroke-linecap="round"/>`}`;
    const lamp = (x) => `
  <path d="M${x} 0 V112" stroke="#0c0a0e" stroke-width="2"/>
  <polygon points="${x - 9},134 ${x + 9},134 ${x + 74},440 ${x - 74},440" fill="url(#saCone)" opacity=".55"/>
  <path d="M${x - 6} 110 H${x + 6} L${x + 8} 116 L${x + 24} 134 H${x - 24} L${x - 8} 116 Z" fill="#1f3a33"/>
  <path d="M${x - 6} 110 H${x + 2} L${x + 1} 116 L${x - 12} 134 H${x - 24} L${x - 8} 116 Z" fill="#2c5148"/>
  <ellipse class="sa-bulb" cx="${x}" cy="134" rx="15" ry="4.5" fill="#ffe7a8"/>
  <circle class="sa-bulbglow" cx="${x}" cy="136" r="26" fill="url(#saBulb)"/>`;

    ctx.html(`<svg class="sa-svg" viewBox="0 0 360 640" style="z-index:1">
<defs>
  <linearGradient id="saCeil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121016"/><stop offset="1" stop-color="#1e1923"/></linearGradient>
  <linearGradient id="saWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262a4d"/><stop offset="1" stop-color="#1d2040"/></linearGradient>
  <linearGradient id="saCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd890" stop-opacity=".55"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></linearGradient>
  <radialGradient id="saBulb"><stop offset="0" stop-color="#fff2c4" stop-opacity=".95"/><stop offset=".4" stop-color="#ffcf73" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></radialGradient>
  <radialGradient id="saSpot"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff2cf" stop-opacity=".7"/><stop offset="1" stop-color="#fff2cf" stop-opacity="0"/></radialGradient>
  <linearGradient id="saBooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4a0"/><stop offset="1" stop-color="#5a9c7d"/></linearGradient>
  <linearGradient id="saCounter" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d2a22"/><stop offset="1" stop-color="#241812"/></linearGradient>
</defs>
<rect width="360" height="150" fill="url(#saCeil)"/>
<rect y="56" width="360" height="22" rx="11" fill="#2a2630"/><rect y="59" width="360" height="5" fill="#3b3644"/>
<g fill="#1c1920"><rect x="40" y="55" width="5" height="24"/><rect x="150" y="55" width="5" height="24"/><rect x="260" y="55" width="5" height="24"/></g>
<rect y="92" width="360" height="5" fill="#26222b"/>
<rect x="0" y="36" width="360" height="4" fill="#2e2a33"/>
<g>
  <rect x="96" y="38" width="12" height="15" rx="3" fill="#2f2b35" transform="rotate(18 102 40)"/><circle cx="98" cy="54" r="10" fill="url(#saSpot)"/>
  <rect x="200" y="38" width="12" height="15" rx="3" fill="#2f2b35" transform="rotate(-14 206 40)"/><circle cx="209" cy="54" r="10" fill="url(#saSpot)"/>
</g>
<rect y="140" width="360" height="262" fill="url(#saWall)"/>
<path d="M0 178 C30 150 70 160 84 196 C96 226 74 246 98 270 C122 296 112 336 86 352 C60 368 22 352 0 360 Z" fill="#f08a3c"/>
<path d="M0 196 C24 176 52 182 62 206 C70 228 54 248 70 270 C82 290 74 320 52 330 C34 338 12 330 0 334 Z" fill="#f7a457"/>
<circle cx="44" cy="232" r="13" fill="#fff4dd"/><circle cx="47" cy="234" r="6.5" fill="#2b2240"/><circle cx="49" cy="231" r="2" fill="#fff"/>
<path d="M66 300 Q80 296 86 286" stroke="#2b2240" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M84 198 C96 176 112 160 124 150 C130 146 136 152 132 158 C122 172 110 190 100 212 Z" fill="#f08a3c"/>
<circle cx="300" cy="258" r="34" fill="#f59e4c"/>
<path d="M268 250 Q300 242 333 252 M270 266 Q300 260 332 270" stroke="#e07d33" stroke-width="5" fill="none" opacity=".7"/>
<circle cx="290" cy="244" r="8" fill="#ffc07a" opacity=".55"/>
<ellipse cx="300" cy="260" rx="58" ry="12" fill="none" stroke="#ffd27a" stroke-width="4" transform="rotate(-14 300 260)"/>
<path d="M243 272 A58 12 -14 0 0 357 246" fill="none" stroke="#ffd27a" stroke-width="4" transform="rotate(0)" opacity="0"/>
<circle cx="212" cy="312" r="15" fill="#7fd6c2"/><circle cx="207" cy="308" r="4" fill="#a9ecdc"/>
<circle cx="132" cy="268" r="9" fill="#ff7aa2"/>
<path d="M120 400 C160 372 210 386 250 366 C290 346 330 360 360 350 L360 402 L120 402 Z" fill="#3fa3a0" opacity=".85"/>
${muralStars}
<g transform="translate(258 214) rotate(-22)">
  <rect x="-9" y="-6" width="18" height="12" rx="2.5" fill="#d9dde8"/>
  <rect x="-31" y="-4.5" width="19" height="9" fill="#4d7fd6"/><rect x="12" y="-4.5" width="19" height="9" fill="#4d7fd6"/>
  <path d="M-31 0 H-12 M12 0 H31 M-25 -4.5 V4.5 M-18 -4.5 V4.5 M18 -4.5 V4.5 M25 -4.5 V4.5" stroke="#9cc0ff" stroke-width=".9"/>
  <path d="M-12 0 H-9 M9 0 H12" stroke="#d9dde8" stroke-width="2"/>
  <path d="M0 -6 V-11" stroke="#d9dde8" stroke-width="1.6"/><path d="M-5 -15 Q0 -9 5 -15 Z" fill="#d9dde8"/>
</g>
${lamp(52)}
${lamp(308)}
<rect y="348" width="360" height="54" fill="url(#saCounter)"/>
<rect y="344" width="360" height="7" fill="#5a3a2a"/><rect y="344" width="360" height="2" fill="#7a5038"/>
<g transform="translate(180 344)">
  <rect x="-16" y="-30" width="32" height="30" rx="4" fill="#b9bcc6"/><rect x="-16" y="-30" width="32" height="5" rx="2" fill="#dfe2ea"/>
  <rect x="-12" y="-46" width="5" height="17" rx="2" fill="#ff7aa2"/><rect x="-2.5" y="-48" width="5" height="19" rx="2" fill="#ffc66e"/><rect x="7" y="-46" width="5" height="17" rx="2" fill="#7fd6c2"/>
</g>
<g opacity=".9">
  <path d="M296 344 L298 324 L310 324 L312 344 Z" fill="#f2b33c" opacity=".85"/><rect x="297" y="321" width="14" height="5" rx="2" fill="#fff6e6"/>
  <path d="M24 344 L26 326 L36 326 L38 344 Z" fill="#f2b33c" opacity=".85"/><rect x="25" y="323" width="12" height="4" rx="2" fill="#fff6e6"/>
</g>
<g opacity=".88">
  ${person(20, 300, 1, '#e9e6e2', '#3a2a22', false)}
  ${person(342, 296, 1.05, '#f07a2c', '#2b1f1a', true)}
</g>
<rect y="388" width="360" height="16" rx="8" fill="#232127"/><rect y="390" width="360" height="4" fill="#3a3740"/>
<rect y="402" width="360" height="80" fill="url(#saBooth)"/>
<g>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${-6 + i * 30}" y="406" width="26" height="72" rx="11" fill="#78c09c"/><rect x="${-2 + i * 30}" y="410" width="8" height="40" rx="4" fill="#98d6b6" opacity=".55"/>`).join('')}
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${22 + i * 30}" cy="440" r="2.4" fill="#4c8a6c"/>`).join('')}
</g>
</svg>`, bar);
    const bulbs = bar.querySelectorAll('.sa-bulb, .sa-bulbglow');

    // neon sign
    const neon = ctx.html('<div class="sa-neon">Satellite</div>', bar);

    // the friends on the green booth
    const artur = ctx.char('artur', { outfit: 'casual', h: 210, x: 112, y: 532.4, parent: bar });
    const sven = ctx.char('sven', { outfit: 'tshirt-white', h: 210, x: 248, y: 532.4, parent: bar });

    // phones: front (Artur shows it), back (Sven holds it for the selfie)
    ctx.html(`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <linearGradient id="saScreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8fb1"/><stop offset=".45" stop-color="#9b7bff"/><stop offset="1" stop-color="#3fb6e8"/></linearGradient>
  <radialGradient id="saScreenHi" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="saBack" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4a52"/><stop offset=".5" stop-color="#2f2f35"/><stop offset="1" stop-color="#1f1f24"/></linearGradient>
</defs></svg>`);
    const FRONT = `
  <rect x="0" y="0" width="28" height="56" rx="5.6" fill="#18181c"/>
  <rect x="1.5" y="1.5" width="25" height="53" rx="4.4" fill="url(#saScreen)"/>
  <rect x="1.5" y="1.5" width="25" height="53" rx="4.4" fill="url(#saScreenHi)"/>
  <path d="M8.6 1.5 H19.4 V2.6 Q19.4 4.6 17.4 4.6 H10.6 Q8.6 4.6 8.6 2.6 Z" fill="#18181c"/>
  <rect x="10.5" y="9" width="7" height="2.4" rx="1.2" fill="#fff" opacity=".85"/>
  <rect x="9.5" y="51.6" width="9" height="1.1" rx=".55" fill="#fff" opacity=".85"/>`;
    const BACK = `
  <rect x="0" y="0" width="28" height="56" rx="5.6" fill="#26262b"/>
  <rect x="0.6" y="0.6" width="26.8" height="54.8" rx="5.2" fill="none" stroke="#8a8a94" stroke-width=".9"/>
  <rect x="2" y="2" width="24" height="52" rx="4.4" fill="url(#saBack)"/>
  <rect x="3.4" y="3.4" width="8" height="16" rx="4" fill="#18181c" stroke="#5a5a62" stroke-width=".6"/>
  <circle cx="7.4" cy="7.6" r="2.6" fill="#0b0b0e" stroke="#4a4a54" stroke-width=".8"/><circle cx="7.4" cy="15.2" r="2.6" fill="#0b0b0e" stroke="#4a4a54" stroke-width=".8"/>
  <circle cx="6.8" cy="7" r=".8" fill="#6a7aa8"/><circle cx="6.8" cy="14.6" r=".8" fill="#6a7aa8"/>
  <circle cx="14" cy="11.4" r="1.3" fill="#f3e3b5"/>
  <path d="M15 3 L25 3 L25 20 Z" fill="#fff" opacity=".07"/>`;
    const aPhone = artur.hold('R', `<g><g transform="translate(-14 -54)">${FRONT}</g></g>`);
    const sPhone = sven.hold('L', `<g><g transform="translate(-14 -54)">${BACK}</g></g>`);
    gsap.set(aPhone, { svgOrigin: '0 0' });
    gsap.set(sPhone, { svgOrigin: '0 0', scaleX: 0 });

    // the table (in front of them), beers, a bowl of crisps
    ctx.html(`<svg class="sa-svg" viewBox="0 0 360 640" style="z-index:6">
<defs>
  <linearGradient id="saTable" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4e3224"/><stop offset=".5" stop-color="#6b4532"/><stop offset="1" stop-color="#83573d"/></linearGradient>
  <linearGradient id="saUnder" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140f14"/><stop offset="1" stop-color="#1a1419"/></linearGradient>
  <linearGradient id="saBeer" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e99a22"/><stop offset=".45" stop-color="#ffc24a"/><stop offset="1" stop-color="#d9861a"/></linearGradient>
</defs>
<rect y="600" width="360" height="40" fill="url(#saUnder)"/>
<path d="M-4 472 L364 472 L364 592 L-4 592 Z" fill="url(#saTable)"/>
<path d="M-4 472 H364" stroke="#3e281d" stroke-width="1.4"/>
<g stroke="#8a5e43" stroke-width="1.1" fill="none" opacity=".5">
  <path d="M-4 486 C70 481 150 491 230 485 S330 482 364 487"/>
  <path d="M-4 512 C90 505 170 518 260 510 S340 508 364 513"/>
  <path d="M-4 548 C60 540 160 556 250 546 S330 544 364 550"/>
  <path d="M-4 578 C100 572 200 584 364 574"/>
</g>
<path d="M30 492 C120 488 200 498 330 490 L330 500 C200 508 120 498 30 502 Z" fill="#fff" opacity=".05"/>
<rect x="-4" y="591" width="368" height="14" fill="#3e281d"/><path d="M-4 592 H364" stroke="#a0704f" stroke-width="2.4"/>
</svg>`, bar);
    const beerSVG = (x, y, k) => `
  <g transform="translate(${x} ${y}) scale(${k})">
  <ellipse cx="0" cy="3" rx="19" ry="5.2" fill="#1d1a2e" opacity=".9"/><ellipse cx="0" cy="2" rx="16.5" ry="4.2" fill="${x < 180 ? '#ff7aa2' : '#7fd6c2'}" opacity=".9"/>
  <path d="M-12 -45 L-9.5 0 Q0 3 9.5 0 L12 -45 Z" fill="url(#saBeer)"/>
  <path d="M-8 -35 L-6.5 -6" stroke="#fff7d6" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>
  <path d="M-13 -44 Q-14 -55 -5 -53 Q0 -59 6 -54 Q14 -55 13 -44 Q0 -40 -13 -44 Z" fill="#fff8ec"/>
  <circle cx="-4" cy="-51" r="2" fill="#ffffff"/><circle cx="5" cy="-49" r="1.6" fill="#f3e6d1"/>
  </g>`;
    const beers = ctx.html(`<svg class="sa-svg" viewBox="0 0 360 640" style="z-index:7">
<defs><radialGradient id="saCandle"><stop offset="0" stop-color="#ffd98a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>
${beerSVG(58, 556, 1.3)}${beerSVG(304, 556, 1.3)}
<ellipse cx="180" cy="566" rx="34" ry="7" fill="#120d12" opacity=".55"/>
<path d="M146 548 Q180 580 214 548 Z" fill="#e8e3da"/><path d="M146 548 Q180 556 214 548" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>
<g fill="#f2c25a"><ellipse cx="164" cy="546" rx="9" ry="4.6" transform="rotate(-12 164 546)"/><ellipse cx="181" cy="543" rx="10" ry="5" transform="rotate(10 181 543)"/><ellipse cx="197" cy="547" rx="8.5" ry="4.4" transform="rotate(-4 197 547)"/><ellipse cx="174" cy="549" rx="7.5" ry="3.8" fill="#e5ad45"/><ellipse cx="190" cy="550" rx="7" ry="3.5" fill="#e9b54c"/></g>
<circle class="sa-candleglow" cx="244" cy="500" r="30" fill="url(#saCandle)"/>
<rect x="234" y="498" width="20" height="18" rx="4" fill="#f6e7d0" opacity=".55"/><rect x="236" y="504" width="16" height="10" rx="2" fill="#fff6e8"/>
<path class="sa-candle" d="M244 492 C241 496 242 499 244 500 C246 499 247 496 244 492 Z" fill="#ffb43b"/>
<g class="sa-bubbles" fill="#fff6d8"></g>
</svg>`, bar);
    const bubbleG = beers.querySelector('.sa-bubbles');
    [58, 304].forEach((bx) => {
      for (let i = 0; i < 4; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', (bx - 8 + rand() * 16).toFixed(1)); c.setAttribute('cy', '548'); c.setAttribute('r', (0.9 + rand() * 0.8).toFixed(2));
        c.setAttribute('opacity', '0.8');
        bubbleG.appendChild(c);
        ctx.loop(gsap.fromTo(c, { y: 0, opacity: 0.8 }, { y: -46 - rand() * 4, opacity: 0.2, duration: 1.4 + rand() * 0.8, ease: 'none', repeat: -1, delay: rand() * 1.5 }));
      }
    });

    const candle = beers.querySelector('.sa-candle'), candleGlow = beers.querySelector('.sa-candleglow');
    gsap.set(candle, { svgOrigin: '244 500' });
    ctx.loop(gsap.to(candle, { scaleX: 0.85, scaleY: 1.12, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    ctx.loop(gsap.to(candleGlow, { opacity: 0.7, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    const dark = ctx.html('<div class="sa-dark"></div>', bar);

    /* ===================== THE PHONE SCREEN ===================== */
    const black = ctx.html('<div class="sa-black"></div>');
    gsap.set(black, { opacity: 0 });
    const ph = ctx.html('<div class="sa-phone"></div>');
    gsap.set(ph, { opacity: 0 });
    const vf = ctx.html('<div class="sa-vf"></div>', ph);

    // viewfinder background: the bar behind Sven (sharp, then portrait-blurred)
    ctx.html(`<svg viewBox="0 0 360 404">
<defs>
  <radialGradient id="saBk"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".5" stop-color="#ffeec8" stop-opacity=".35"/><stop offset="1" stop-color="#ffeec8" stop-opacity="0"/></radialGradient>
  <radialGradient id="saBkO"><stop offset="0" stop-color="#f39143"/><stop offset=".6" stop-color="#f39143" stop-opacity=".6"/><stop offset="1" stop-color="#f39143" stop-opacity="0"/></radialGradient>
  <radialGradient id="saBkW"><stop offset="0" stop-color="#d8d4cf"/><stop offset=".6" stop-color="#d8d4cf" stop-opacity=".5"/><stop offset="1" stop-color="#d8d4cf" stop-opacity="0"/></radialGradient>
  <radialGradient id="saBkB"><stop offset="0" stop-color="#4b5a9a" stop-opacity=".8"/><stop offset="1" stop-color="#4b5a9a" stop-opacity="0"/></radialGradient>
  <linearGradient id="saVfBooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#84c9a6"/><stop offset="1" stop-color="#5d9f80"/></linearGradient>
</defs>
<rect width="360" height="404" fill="#16121a"/>
<g class="sa-lights">
  <ellipse cx="40" cy="-2" rx="62" ry="12" fill="url(#saBk)"/>
  <circle cx="74" cy="64" r="16" fill="url(#saBk)"/><circle cx="74" cy="64" r="4" fill="#fffaf0"/>
  <circle cx="306" cy="24" r="13" fill="url(#saBk)"/><circle cx="306" cy="24" r="3" fill="#fffaf0"/>
</g>
<g class="sa-sharp">
  <rect y="104" width="360" height="12" fill="#2a2630"/>
  <rect y="150" width="360" height="160" fill="#232745"/>
  <path d="M0 196 C26 176 56 186 66 216 C74 240 58 262 76 288 L0 300 Z" fill="#f08a3c"/>
  <circle cx="34" cy="232" r="10" fill="#fff4dd"/><circle cx="36" cy="234" r="5" fill="#2b2240"/>
  <path d="M40 262 Q60 252 82 262 L86 310 L36 310 Z" fill="#e9e6e2"/><circle cx="60" cy="246" r="13" fill="#d9a888"/>
  <path d="M46.5 247 Q45 230 60 231 Q75 230 73.5 247 Q70 238 60 238.5 Q50 238 46.5 247 Z" fill="#4a3428"/>
  <path d="M286 240 Q330 222 360 236 L360 306 L282 306 Z" fill="#f07a2c"/>
  <rect y="290" width="360" height="22" rx="10" fill="#232127"/>
  <rect y="306" width="360" height="98" fill="url(#saVfBooth)"/>
  ${Array.from({ length: 13 }, (_, i) => `<rect x="${-8 + i * 30}" y="310" width="26" height="94" rx="11" fill="#8bd0ad"/>`).join('')}
</g>
<g class="sa-soft" opacity="0">
  <rect y="140" width="360" height="170" fill="#21243f"/>
  <ellipse cx="40" cy="0" rx="80" ry="24" fill="url(#saBk)"/>
  <circle cx="74" cy="64" r="30" fill="url(#saBk)"/><circle cx="306" cy="24" r="26" fill="url(#saBk)"/>
  <circle cx="200" cy="58" r="16" fill="url(#saBk)" opacity=".5"/><circle cx="250" cy="100" r="12" fill="url(#saBk)" opacity=".4"/>
  <ellipse cx="34" cy="240" rx="70" ry="80" fill="url(#saBkO)"/>
  <ellipse cx="62" cy="282" rx="40" ry="40" fill="url(#saBkW)"/>
  <ellipse cx="330" cy="272" rx="70" ry="54" fill="url(#saBkO)"/>
  <ellipse cx="200" cy="200" rx="120" ry="70" fill="url(#saBkB)"/>
  <rect y="284" width="360" height="34" fill="#1f1d24" opacity=".85"/>
  <rect y="304" width="360" height="100" fill="url(#saVfBooth)"/>
  <rect y="300" width="360" height="14" fill="#2a2a30" opacity=".5"/>
</g>
</svg>`, vf);
    const sharp = vf.querySelector('.sa-sharp'), soft = vf.querySelector('.sa-soft');

    // Sven, big, in the front camera
    const svenBig = ctx.char('sven', { outfit: 'tshirt-white', h: 560, x: 180, y: 582, parent: vf });

    // Face ID overlay
    const fid = ctx.html(`<svg viewBox="0 0 360 404" style="z-index:7">
<defs>
  <pattern id="saDots" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="5.5" cy="5.5" r="1.7" fill="#8ff2dd"/></pattern>
  <clipPath id="saFaceClip"><ellipse cx="180" cy="222" rx="80" ry="112"/></clipPath>
  <clipPath id="saRevClip"><rect class="sa-rev" x="0" y="104" width="360" height="0"/></clipPath>
  <linearGradient id="saScanG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ff2dd" stop-opacity="0"/><stop offset=".8" stop-color="#8ff2dd" stop-opacity=".35"/><stop offset="1" stop-color="#eafffa" stop-opacity=".95"/></linearGradient>
</defs>
<g clip-path="url(#saFaceClip)">
  <g class="sa-dots" clip-path="url(#saRevClip)"><rect x="96" y="104" width="168" height="236" fill="url(#saDots)"/></g>
  <rect class="sa-scan" x="90" y="76" width="180" height="30" fill="url(#saScanG)"/>
</g>
<g class="sa-brk" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,.55))">
  <path d="M98 124 V110 Q98 92 116 92 H132"/><path d="M228 92 H244 Q262 92 262 110 V124"/>
  <path d="M98 322 V336 Q98 354 116 354 H132"/><path d="M228 354 H244 Q262 354 262 336 V322"/>
</g>
</svg>`, vf);
    const rev = fid.querySelector('.sa-rev'), scanBar = fid.querySelector('.sa-scan');
    const dotsG = fid.querySelector('.sa-dots'), brk = fid.querySelector('.sa-brk');
    gsap.set(brk, { svgOrigin: '180 223' });
    const pill = ctx.html(`<div class="sa-pill"><svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M6.8 12.4 L10.4 16 L17.4 8.6" fill="none" stroke="#2fbf5b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Face ID</div>`, vf);
    const depth = ctx.html('<div class="sa-depth">EFFET DE PROFONDEUR</div>', vf);
    const counts = ['3', '2', '1'].map(n => ctx.html(`<div class="sa-count">${n}</div>`, vf));

    // padlock (lock screen) and camera top icons
    const pad = ctx.html(`<svg class="sa-pad" viewBox="0 0 20 24">
  <path class="sa-shackle" d="M5 11 V7.5 Q5 2.5 10 2.5 Q15 2.5 15 7.5 V11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="2" y="10.5" width="16" height="12.5" rx="3" fill="#fff"/>
</svg>`, ph);
    const shackle = pad.querySelector('.sa-shackle');
    gsap.set(shackle, { svgOrigin: '15 11' });
    const topBar = ctx.html(`<div class="sa-top">
  <svg viewBox="0 0 16 22" style="left:120px"><path d="M9.5 1 L2.5 12.5 H8 L6.5 21 L13.5 9.5 H8 Z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M1 2 L15 20" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>
  <svg viewBox="0 0 22 22" style="left:169px"><circle cx="11" cy="11" r="9.5" fill="none" stroke="#ffd60a" stroke-width="1.4" stroke-dasharray="1.6 1.6"/><circle cx="11" cy="11" r="6" fill="none" stroke="#ffd60a" stroke-width="1.5"/><circle cx="11" cy="11" r="2.4" fill="#ffd60a"/></svg>
  <div class="sa-timer"><svg viewBox="0 0 20 20" style="position:static;height:18px"><circle cx="10" cy="11" r="7.5" fill="none" stroke="#ffd60a" stroke-width="1.7"/><path d="M10 11 V6.5 M7.5 1.6 H12.5" stroke="#ffd60a" stroke-width="1.7" stroke-linecap="round"/></svg>3 s</div>
</div>`, ph);
    const bottom = ctx.html(`<div class="sa-bottom">
  <div class="sa-modes"><div class="sa-strip"><span>VIDÉO</span><span class="ph">PHOTO</span><span class="pt">PORTRAIT</span><span>PANO</span></div></div>
  <div class="sa-thumb"></div>
  <div class="sa-shutter"><i></i></div>
  <div class="sa-flipcam"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5 h3 l1.6-2.5 h6.8 L17 8.5 h3 v10 H4 Z"/><path d="M9 13.5 a3 3 0 0 1 5.4-1.6 M15 13.5 a3 3 0 0 1-5.4 1.6"/><path d="M14.6 10.4 v1.8 h-1.8 M9.4 16.6 v-1.8 h1.8"/></svg></div>
</div>`, ph);
    const strip = bottom.querySelector('.sa-strip'), mPhoto = bottom.querySelector('.ph'), mPortrait = bottom.querySelector('.pt');
    const shutterIn = bottom.querySelector('.sa-shutter i');
    mPhoto.classList.add('on');

    /* ======================= timeline ======================= */
    // 0 · lights on
    tl.fromTo(dark, { opacity: 0.9 }, { opacity: 0.35, duration: 0.08, ease: 'none' }, 0.12);
    tl.to(dark, { opacity: 0.75, duration: 0.06, ease: 'none' }, 0.22);
    tl.to(dark, { opacity: 0, duration: 0.45, ease: 'power2.out' }, 0.32);
    tl.fromTo(bulbs, { opacity: 0.15 }, { opacity: 1, duration: 0.06, ease: 'none' }, 0.12);
    tl.to(bulbs, { opacity: 0.3, duration: 0.05, ease: 'none' }, 0.22);
    tl.to(bulbs, { opacity: 1, duration: 0.1, ease: 'none' }, 0.3);
    ctx.sfx('clink', 0.3);
    tl.fromTo(neon, { opacity: 0.08 }, { opacity: 1, duration: 0.05, ease: 'none' }, 0.6);
    tl.to(neon, { opacity: 0.25, duration: 0.05, ease: 'none' }, 0.7);
    tl.to(neon, { opacity: 1, duration: 0.05, ease: 'none' }, 0.82);
    tl.to(neon, { opacity: 0.55, duration: 0.04, ease: 'none' }, 0.95);
    tl.to(neon, { opacity: 1, duration: 0.06, ease: 'none' }, 1.0);
    ctx.loop(gsap.to(neon, { opacity: 0.86, duration: 0.09, ease: 'steps(1)', yoyo: true, repeat: -1, repeatDelay: 2.6 }));
    ctx.caption('Le soir même, à Sat.', 0.45, { pos: 'top', dur: 3.1 });

    // 0.9 · Artur proudly shows his new phone
    artur.tilt(0.85, 7, 0.3);
    tl.fromTo(aPhone, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.95);
    tl.to(artur.armR, { rotation: -100, duration: 0.45, ease: 'back.out(1.5)' }, 0.95);
    tl.to(aPhone, { rotation: 100, duration: 0.45, ease: 'back.out(1.5)' }, 0.95);
    tl.to(aPhone, { scale: 1.08, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 1.45);
    sven.tilt(1.3, -8, 0.3);

    // 1.9 · « Fais voir ! »
    sven.say(1.9, 'Fais voir !', 1.45);
    sven.hop(1.9, 10);
    // the hand-over: both hands meet above the table
    tl.to(artur.armR, { rotation: -63.5, duration: 0.4, ease: 'power2.inOut' }, 2.45);
    tl.to(aPhone, { rotation: 63.5, duration: 0.4, ease: 'power2.inOut' }, 2.45);
    tl.to(sven.armL, { rotation: 63.4, duration: 0.4, ease: 'power2.inOut' }, 2.45);
    tl.set(sPhone, { rotation: -63.4 }, 2.85);
    tl.to(aPhone, { scaleX: 0, duration: 0.09, ease: 'power1.in' }, 2.85);
    tl.to(sPhone, { scaleX: 1, duration: 0.09, ease: 'power1.out' }, 2.94);
    ctx.sfx('swoosh', 2.85);
    tl.to(artur.armR, { rotation: 0, duration: 0.4, ease: 'power2.inOut' }, 3.1);
    // 3.1 · Sven lifts it for a selfie, Artur politely leans out of the frame
    // arm out to the side, phone held clear of his face and angled towards it (we see its back)
    tl.to(sven.armL, { rotation: 122, duration: 0.5, ease: 'back.out(1.3)' }, 3.12);
    tl.to(sPhone, { rotation: -112, scale: 1.12, duration: 0.5, ease: 'back.out(1.3)' }, 3.12);
    sven.tilt(3.2, -5, 0.3);
    tl.to(artur.el, { x: -12, rotation: -6, duration: 0.4, ease: 'power2.out' }, 3.4);
    artur.tilt(3.4, -8, 0.35);
    tl.to(sven.head, { y: -3, duration: 0.15, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 3.85);

    // 4.25 · dive into the phone (after a slow push-in)
    ctx.sfx('whoosh', 4.2);
    gsap.set(bar, { transformOrigin: '186.8px 392.5px' }); // = centre of the phone in Sven's raised hand
    tl.fromTo(bar, { scale: 1 }, { scale: 1.04, duration: 4.0, ease: 'sine.inOut' }, 0.2);
    tl.to(bar, { scale: 9, duration: 0.5, ease: 'power3.in' }, 4.25);
    tl.to(black, { opacity: 1, duration: 0.15, ease: 'none' }, 4.6);
    tl.set(bar, { visibility: 'hidden' }, 4.76);
    ctx.backdrop('#000000', '#000000', 4.6);   // the phone screen is black at its edges
    const P = 4.8;
    ctx.beat(4.15);        // tap: jump to the dive into the phone
    ctx.beat(P + 2.55);    // tap: jump to the camera UI
    tl.fromTo(ph, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, P);
    tl.set(black, { opacity: 0 }, P + 0.4);

    // Face ID
    gsap.set([topBar, bottom], { opacity: 0 });
    gsap.set(bottom, { y: 26 });
    tl.fromTo(brk, { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }, P + 0.2);
    tl.fromTo(rev, { attr: { height: 0 } }, { attr: { height: 240 }, duration: 1.2, ease: 'none' }, P + 0.45);
    tl.fromTo(scanBar, { y: 0 }, { y: 240, duration: 1.2, ease: 'none' }, P + 0.45);
    tl.set(scanBar, { opacity: 0 }, P + 1.66);
    ctx.sfx('sweep', P + 0.45); ctx.sfx('sweep', P + 1.05);
    tl.to(dotsG, { opacity: 0.25, duration: 0.12, ease: 'none', yoyo: true, repeat: 1 }, P + 1.66);
    tl.to(dotsG, { opacity: 0, duration: 0.35 }, P + 1.95);
    tl.to(brk, { stroke: '#34d06a', scale: 0.94, duration: 0.25, ease: 'power2.out' }, P + 1.72);
    tl.fromTo(pill, { opacity: 0, scale: 0.6, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }, P + 1.75);
    tl.to(shackle, { y: -3.5, rotation: 28, duration: 0.25, ease: 'back.out(2)' }, P + 1.75);
    ctx.sfx('unlock', P + 1.75);
    tl.to([brk, pill], { opacity: 0, duration: 0.3 }, P + 2.6);
    tl.to(pad, { opacity: 0, duration: 0.25 }, P + 2.6);

    // camera UI
    tl.to(topBar, { opacity: 1, duration: 0.3 }, P + 2.75);
    tl.to(bottom, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, P + 2.75);
    tl.fromTo(strip, { x: 180 - 88 * 1.5 }, { x: 180 - 88 * 2.5, duration: 0.4, ease: 'power2.inOut' }, P + 3.3);
    tl.to(mPhoto, { color: 'rgba(255,255,255,.82)', duration: 0.2 }, P + 3.45);
    tl.to(mPortrait, { color: '#ffd60a', duration: 0.2 }, P + 3.45);
    ctx.sfx('tick', P + 3.3);
    tl.fromTo(depth, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, P + 3.8);
    tl.to(soft, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }, P + 3.85);
    tl.to(sharp, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, P + 3.95);
    ctx.loop(gsap.fromTo(svenBig.face, { rotation: -1.2 }, { rotation: 1.2, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }));

    // countdown 3-2-1
    counts.forEach((c, i) => {
      const t = P + 4.5 + i * 0.8;
      tl.fromTo(c, { opacity: 0, scale: 1.5 }, { opacity: 0.95, scale: 1, duration: 0.25, ease: 'back.out(2)' }, t);
      tl.to(c, { opacity: 0, scale: 0.8, duration: 0.2, ease: 'power1.in' }, t + 0.58);
      ctx.sfx('tick', t);
    });
    svenBig.tilt(P + 4.6, -4, 0.5);
    svenBig.tilt(P + 5.6, 2, 0.6);
    tl.to(shutterIn, { scale: 0.86, duration: 0.08, ease: 'power1.out', yoyo: true, repeat: 1 }, P + 6.88);

    // the very first selfie
    const shot = ctx.photo(1, P + 6.98, { caption: 'Ton tout premier selfie… avec mon iPhone.' });
    ctx.backdrop('#0b0a0d', '#0b0a0d', P + 7.05); // photo viewer background
    // keep a short tail after the photo's hold: a hold exactly at the end of the timeline does not pause
    tl.set({}, {}, shot.end + 0.12);
  },
});
;

/* ===== js/scenes/04-lac.js ===== */
/* Scène 4 · lac — « Puis il y a eu notre année. »
 * Le Léman à l'heure dorée, sur la grève près de l'EPFL : Artur, une amie et Sven,
 * trois canettes, et cette fois c'est Artur qui tient le téléphone. → photo 2 (p3-lac).
 * Beats : 2.0 (après le tourbillon des saisons), 4.2 (téléphone), 8.6 (Tchin !), 10.7 (selfie).
 */
(function () {
  'use strict';

  const SKY_TOP = '#5a83bd';
  const SAND_BOTTOM = '#c29f76';
  const SUN = { x: 96, y: 186 };   // soleil bas, au-dessus de la pointe boisée
  const HZ = 252;                  // horizon (rive d'en face)
  const SH = 474;                  // bord de l'eau
  const SKIN = { artur: '#f0b896', sven: '#e9b38f', amie: '#f6cbb0' };
  const S = '#stage[data-scene="lac"]';
  const f1 = (n) => (Math.round(n * 10) / 10).toString();

  /* ---------------- props (hand-local coords, origin = hand centre) ---------------- */
  function canSVG(skin) {
    return `<g><g transform="translate(0 -6)">
      <rect x="-7" y="-15" width="14" height="27" rx="2.6" fill="#1e5cb8"/>
      <rect x="-7" y="-15" width="4.4" height="27" rx="2.2" fill="#4c91e6" opacity=".85"/>
      <rect x="3.4" y="-15" width="3.6" height="27" rx="1.8" fill="#123f84" opacity=".8"/>
      <rect x="-7" y="-10.6" width="14" height="1.7" fill="#eef3f9" opacity=".9"/>
      <circle cx="1" cy="-3.2" r="3.3" fill="#d8392b"/>
      <path d="M-1.1 -3.4 L1 -5.8 L3.1 -3.4 L1 -1.1Z" fill="#fff" opacity=".92"/>
      <rect x="-7" y="10" width="14" height="2.4" rx="1" fill="#aeb9c7"/>
      <ellipse cx="0" cy="-15" rx="7" ry="2.1" fill="#d7dee8"/>
      <ellipse cx=".7" cy="-15.2" rx="3.6" ry="1" fill="#97a3b3"/>
    </g>
    <rect x="-8.3" y="-3.8" width="16.6" height="8.2" rx="4.1" fill="${skin}"/>
    <path d="M-5.6 .3h11.2" stroke="rgba(120,60,40,.2)" stroke-width="1"/></g>`;
  }

  function phoneSVG(skin) {
    // iPhone X vu de dos (gris sidéral), double capteur vertical
    return `<g><g class="lac-phone-pop">
      <g transform="translate(-1 -15)">
        <rect x="-7.6" y="-14.2" width="15.2" height="29.4" rx="3.8" fill="#1d1d23"/>
        <rect x="-6.7" y="-13.3" width="13.4" height="27.6" rx="3.1" fill="#43434d"/>
        <path d="M-6.7 -4 L6.7 -12 L6.7 -10.2 C6.7 -12 5.6 -13.3 3.6 -13.3 L-3.6 -13.3 C-5.6 -13.3 -6.7 -12 -6.7 -10.2Z" fill="#fff" opacity=".1"/>
        <rect x="-5.5" y="-12" width="4.8" height="9.6" rx="2.4" fill="#18181d"/>
        <circle cx="-3.1" cy="-9.7" r="1.45" fill="#5b7bab"/><circle cx="-3.1" cy="-5" r="1.45" fill="#5b7bab"/>
        <circle cx="1" cy="-7.4" r=".95" fill="#fff1c7"/>
        <circle class="lac-led" cx="1" cy="-7.4" r="6" fill="#fffbe8" opacity="0"/>
      </g>
      <rect x="-8.6" y="-4" width="17.2" height="8.6" rx="4.3" fill="${skin}"/>
    </g></g>`;
  }

  /* ---------------- the friend (drawn, same 120×220 rig as the engine characters) ---------------- */
  function friendSVG() {
    const sk = SKIN.amie, shade = '#e7ad8f';
    const fl = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><g fill="#e4543a"><circle cx="0" cy="-4" r="3.6"/><circle cx="3.8" cy="-1.2" r="3.6"/><circle cx="2.4" cy="3.3" r="3.6"/><circle cx="-2.4" cy="3.3" r="3.6"/><circle cx="-3.8" cy="-1.2" r="3.6"/></g><circle r="2.2" fill="#f7a845"/><ellipse cx="6.5" cy="5" rx="3.2" ry="1.6" fill="#7fa564" transform="rotate(30 6.5 5)"/></g>`;
    const arm = (x, cls, extra) => `
      <g class="${cls}">
        <rect x="${x}" y="121" width="14" height="30" rx="7" fill="url(#lacDenim)"/>
        <rect x="${x - 1}" y="144.5" width="16" height="7" rx="3.5" fill="#a9c1d9"/>
        <path d="M${x} 148 h14" stroke="#89a7c6" stroke-width="1"/>
        <rect x="${x + 2}" y="150" width="10" height="18" rx="5" fill="${sk}"/>
        ${extra || ''}
        <circle cx="${x + 7}" cy="171" r="6.6" fill="${sk}"/>
        <g class="${cls}-hand" transform="translate(${x + 7} 171)"></g>
      </g>`;
    return `
<svg class="ch-svg" viewBox="0 0 120 220" overflow="visible" aria-hidden="true">
  <defs>
    <linearGradient id="lacDenim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8aaccc"/><stop offset="1" stop-color="#6e8fb2"/></linearGradient>
    <radialGradient id="lacHair" cx=".38" cy=".3" r=".75"><stop offset="0" stop-color="#c8693f"/><stop offset=".6" stop-color="#a5482a"/><stop offset="1" stop-color="#7e3520"/></radialGradient>
    <clipPath id="lacSkirtClip"><path d="M33 146 L87 146 L95 188 Q60 197 25 188 Z"/></clipPath>
    <filter id="lacSticker" x="-25%" y="-25%" width="150%" height="150%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="3.4" result="d"/>
      <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="w"/>
      <feGaussianBlur in="d" stdDeviation="2.2" result="b"/><feOffset in="b" dy="2.4" result="o"/>
      <feFlood flood-color="#000" flood-opacity=".26"/><feComposite in2="o" operator="in" result="sh"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g class="f-legL"><rect x="46" y="178" width="11" height="30" rx="5" fill="${sk}"/><rect x="46" y="178" width="4" height="30" rx="2" fill="${shade}" opacity=".5"/><ellipse cx="50" cy="209" rx="9.5" ry="5" fill="#9a6440"/><path d="M44 205.5 Q51 201.5 57 205.5" stroke="#6e4128" stroke-width="2.2" fill="none"/></g>
  <g class="f-legR"><rect x="63" y="178" width="11" height="30" rx="5" fill="${sk}"/><rect x="70" y="178" width="4" height="30" rx="2" fill="${shade}" opacity=".5"/><ellipse cx="70" cy="209" rx="9.5" ry="5" fill="#9a6440"/><path d="M63 205.5 Q70 201.5 76 205.5" stroke="#6e4128" stroke-width="2.2" fill="none"/></g>
  <g class="f-skirt">
    <path d="M33 146 L87 146 L95 188 Q60 197 25 188 Z" fill="#fbf2e6"/>
    <g clip-path="url(#lacSkirtClip)">
      ${fl(38, 160, .95)}${fl(62, 171, 1.15)}${fl(85, 158, .85)}${fl(48, 186, .95)}${fl(78, 185, 1.05)}${fl(27, 181, .75)}${fl(70, 150, .7)}${fl(94, 176, .8)}
      <path d="M25 172 Q60 182 95 172 L95 200 L25 200Z" fill="#000" opacity=".05"/>
    </g>
    <path d="M25 188 Q60 197 95 188" stroke="#e8d4bf" stroke-width="2.4" fill="none"/>
  </g>
  ${arm(22, 'f-armL')}
  <g class="f-torso">
    <path d="M34 120 Q60 110 86 120 L89 172 Q60 181 31 172 Z" fill="url(#lacDenim)"/>
    <path d="M50.5 117 Q60 114 69.5 117 L68 177 Q60 179 52 177 Z" fill="#fbf2e6"/>
    <g clip-path="url(#lacSkirtClip)"></g>
    ${fl(60, 152, .75)}${fl(55, 170, .6)}
    <path d="M50.5 117 Q60 132 69.5 117 Z" fill="${sk}"/>
    <path d="M53 121 Q60 128 67 121" stroke="${shade}" stroke-width="1.4" fill="none" opacity=".7"/>
    <path d="M50.5 117 L52 177 M69.5 117 L68 177" stroke="#5c7ea3" stroke-width="2.2" fill="none"/>
    <circle cx="48.6" cy="138" r="1.3" fill="#e9f0f7"/><circle cx="48.8" cy="154" r="1.3" fill="#e9f0f7"/>
    <path d="M43 116 L51 115 L55 128 Z" fill="#a3bdd6"/><path d="M77 116 L69 115 L65 128 Z" fill="#a3bdd6"/>
    <rect x="73.5" y="132" width="10" height="9" rx="1.6" fill="none" stroke="#5c7ea3" stroke-width="1.3"/>
    <path d="M31 172 Q60 181 89 172" stroke="#5c7ea3" stroke-width="3" fill="none"/>
  </g>
  ${arm(84, 'f-armR', '<rect x="86" y="159" width="10" height="2.4" rx="1.2" fill="#7b4a2b"/><rect x="86" y="162.6" width="10" height="1.4" rx=".7" fill="#c08a52"/>')}
  <g class="f-head">
    <g filter="url(#lacSticker)">
      <path d="M53 96 L67 96 L67 117 Q60 121 53 117 Z" fill="${shade}"/>
      <path d="M45 16 Q42 7 49 3 Q52 -3 60 -1 Q68 -4 72 3 Q79 7 76 16 Q74 26 60 28 Q46 26 45 16Z" fill="url(#lacHair)"/>
      <path d="M48 6 Q43 3 44 -1 Q47 2 51 3Z" fill="#a5482a"/>
      <path d="M71 4 Q77 1 80 4 Q76 5 74 8Z" fill="#a5482a"/>
      <path d="M58 0 Q60 -5 65 -5 Q62 -3 62 0Z" fill="#b8572f"/>
      <ellipse cx="60" cy="58" rx="39" ry="37" fill="url(#lacHair)"/>
      <path d="M24 66 Q19 86 27 100 Q22 84 29 70Z" fill="#9b4227"/>
      <path d="M96 66 Q101 86 93 100 Q98 84 91 70Z" fill="#9b4227"/>
      <ellipse cx="25.5" cy="74" rx="5" ry="7" fill="${sk}"/><ellipse cx="94.5" cy="74" rx="5" ry="7" fill="${sk}"/>
      <ellipse cx="60" cy="72" rx="34" ry="38" fill="${sk}"/>
      <path d="M27 82 Q34 108 60 110 Q86 108 93 82 Q86 102 60 104 Q34 102 27 82Z" fill="${shade}" opacity=".45"/>
      <path d="M26 66 Q24 34 58 31 Q90 30 95 62 Q88 44 70 43 Q62 50 46 46 Q32 50 26 66Z" fill="url(#lacHair)"/>
      <path d="M50 33 Q62 29 74 34" stroke="#d27a4c" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M53 15 Q58 6 66 11 Q70 19 61 22" stroke="#d07a4a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M28 60 Q22 76 29 92" stroke="#a24a2b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M92 60 Q99 74 92 90" stroke="#a24a2b" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M40 58.5 Q46.5 54 53 57.5" stroke="#8d3f24" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M67 57.5 Q73.5 54 80 58.5" stroke="#8d3f24" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M40.5 69 Q46.5 62.5 52.5 69" stroke="#3a2e3f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M67.5 69 Q73.5 62.5 79.5 69" stroke="#3a2e3f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M60.5 71 Q64 78.5 59 80.5" stroke="#d6917a" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="39" cy="81" rx="6.5" ry="4.2" fill="#ff8b80" opacity=".42"/><ellipse cx="81" cy="81" rx="6.5" ry="4.2" fill="#ff8b80" opacity=".42"/>
      <g fill="#cf8664" opacity=".75"><circle cx="44" cy="76" r=".9"/><circle cx="48" cy="78" r=".8"/><circle cx="41" cy="79" r=".7"/><circle cx="76" cy="76" r=".9"/><circle cx="72" cy="78" r=".8"/><circle cx="79" cy="79" r=".7"/></g>
      <path d="M45.5 86 Q60 105 74.5 86 Q60 91.5 45.5 86Z" fill="#8e2f3d"/>
      <path d="M47.5 87 Q60 92.6 72.5 87 L71.4 90.2 Q60 95 48.6 90.2Z" fill="#fff"/>
      <path d="M53.5 97 Q60 101.6 66.5 97 Q60 94.6 53.5 97Z" fill="#e2707b"/>
    </g>
  </g>
</svg>`;
  }

  function makeFriend(ctx, parent, o) {
    const h = o.h, w = h * 120 / 220;
    const el = ctx.html(`<div class="ch lac-amie" style="width:${w}px;height:${h}px;left:${f1(o.x - w / 2)}px;top:${f1(o.y - h)}px">${friendSVG()}</div>`, parent);
    const q = (s) => el.querySelector(s);
    const f = {
      el, w, h, head: q('.f-head'), armL: q('.f-armL'), armR: q('.f-armR'),
      handL: q('.f-armL-hand'), handR: q('.f-armR-hand'),
    };
    gsap.set(f.armL, { svgOrigin: '29 126' });
    gsap.set(f.armR, { svgOrigin: '91 126' });
    gsap.set(f.head, { svgOrigin: '60 112' });
    f.hold = (side, markup) => {
      const g = side === 'L' ? f.handL : f.handR;
      g.insertAdjacentHTML('beforeend', markup);
      return g.lastElementChild;
    };
    return f;
  }

  /* ---------------- scenery ---------------- */
  const M_FAR = 'M-6 252 L-6 224 Q20 219 44 222 Q66 225 86 220 L112 215 L132 201 L146 187 L156 191 L168 173 L178 178 L190 161 L198 169 L206 158 L214 166 L222 153 L230 161 L238 151 L248 164 L262 159 L276 171 L292 167 L308 179 L326 175 L344 185 L366 181 L366 252 Z';
  const M_MID = 'M-6 252 L-6 238 Q30 232 70 235 L104 231 Q126 227 140 215 L156 205 L170 209 L186 197 L200 205 L216 199 L232 207 L252 201 L272 211 L298 205 L322 215 L345 211 L366 217 L366 252 Z';
  const M_NEAR = 'M112 252 Q134 247 148 236 L160 226 L170 222 L182 228 L196 222 Q214 226 228 236 L250 232 L276 238 L300 234 L330 240 L366 236 L366 252 Z';

  function cloud(x, y, s, cls) {
    return `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="6" rx="46" ry="9" fill="#e7b3ad" opacity=".9"/>
      <ellipse cx="-18" cy="0" rx="20" ry="12" fill="#fbd9c6"/>
      <ellipse cx="6" cy="-6" rx="24" ry="16" fill="#fde3d0"/>
      <ellipse cx="28" cy="2" rx="17" ry="10" fill="#f9d4c2"/>
      <ellipse cx="0" cy="8" rx="44" ry="5" fill="#d9a3a6" opacity=".7"/>
      <ellipse cx="-6" cy="-12" rx="12" ry="5" fill="#fff3e6" opacity=".9"/>
    </g></g>`;
  }

  function bird(x, y, s) {
    return `<g class="lac-bird"><g transform="translate(${x} ${y}) scale(${s})"><path class="lac-wing" d="M-9 1 Q-4.5 -5 0 1 Q4.5 -5 9 1" stroke="#45405a" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
  }

  function backSVG(R) {
    let glit = '';
    const N = 30;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const y0 = HZ + 4 + Math.pow(t, 1.45) * 205;
      const spread = 3 + t * 36;
      const k = t < 0.3 ? 1 : (R() < 0.55 ? 2 : 1);   // a second, smaller glint on the nearer rows
      for (let j = 0; j < k; j++) {
        const x = SUN.x + (R() * 2 - 1) * spread * (j ? 1.15 : 0.8);
        const y = y0 + (j ? (R() * 4 - 2) : 0);
        const w = (3 + t * 15 + R() * 8) * (j ? 0.55 : 1);
        const h = 0.9 + t * 1.7;
        glit += `<rect class="lac-gl" x="${f1(x - w / 2)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" fill="${R() < 0.4 ? '#fffbe8' : '#ffd88a'}"/>`;
      }
    }
    let waves = '';
    for (let i = 0; i < 26; i++) {
      const t = R();
      const y = HZ + 10 + Math.pow(t, 1.3) * 210;
      const x = R() * 380 - 10;
      if (Math.abs(x - SUN.x) < 26 + t * 30) continue;
      const w = 8 + t * 24;
      waves += `<path d="M${f1(x)} ${f1(y)} q${f1(w / 4)} ${f1(-1 - t * 1.6)} ${f1(w / 2)} 0 t${f1(w / 2)} 0" stroke="#d2e2f2" stroke-width="${f1(0.8 + t)}" fill="none" opacity="${f1(0.22 + t * 0.25)}" stroke-linecap="round"/>`;
    }
    let lights = '';
    for (let x = 150; x < 360; x += 7 + R() * 9) lights += `<circle cx="${f1(x)}" cy="${f1(HZ + 0.6 + R() * 0.8)}" r="${f1(0.6 + R() * 0.4)}" fill="#ffe2a2"/>`;
    let pontoons = '';
    for (let x = 118; x < 176; x += 5) pontoons += `<rect x="${x}" y="252" width="4" height="2.2" rx=".6" fill="${(x / 5) % 2 ? '#a6653c' : '#87512f'}"/>`;
    let rays = '';
    for (let k = 0; k < 12; k++) rays += `<path d="M-5 0 L0 -${k % 2 ? 120 : 165} L5 0Z" transform="rotate(${k * 30 + 8})" fill="#fff1c4"/>`;

    return `<div class="lac-back"><svg viewBox="0 0 360 640" overflow="visible" aria-hidden="true">
  <defs>
    <linearGradient id="lacSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${SKY_TOP}"/><stop offset=".36" stop-color="#8ea8cc"/><stop offset=".64" stop-color="#e0b8a0"/><stop offset=".86" stop-color="#f8c690"/><stop offset="1" stop-color="#ffd59b"/>
    </linearGradient>
    <radialGradient id="lacGlow"><stop offset="0" stop-color="#fff5d6" stop-opacity="1"/><stop offset=".22" stop-color="#ffe09c" stop-opacity=".7"/><stop offset=".55" stop-color="#ffc77c" stop-opacity=".25"/><stop offset="1" stop-color="#ffbf70" stop-opacity="0"/></radialGradient>
    <radialGradient id="lacDisc" cx=".42" cy=".4"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#fff2c4"/><stop offset="1" stop-color="#ffd987"/></radialGradient>
    <linearGradient id="lacLake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6c6be"/><stop offset=".07" stop-color="#bcc2d4"/><stop offset=".32" stop-color="#83a3c8"/><stop offset=".72" stop-color="#5a87b6"/><stop offset="1" stop-color="#4677aa"/>
    </linearGradient>
    <radialGradient id="lacRefl"><stop offset="0" stop-color="#ffe7aa" stop-opacity=".85"/><stop offset=".5" stop-color="#ffd27e" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27e" stop-opacity="0"/></radialGradient>
    <linearGradient id="lacHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6cfae" stop-opacity="0"/><stop offset="1" stop-color="#f8d3b0" stop-opacity=".62"/></linearGradient>
    <linearGradient id="lacYel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4c430" stop-opacity=".7"/><stop offset="1" stop-color="#f4c430" stop-opacity="0"/></linearGradient>
    <radialGradient id="lacWarm" cx="${f1(SUN.x / 360)}" cy="${f1(SUN.y / 640)}" r=".9"><stop offset="0" stop-color="#ffd08a" stop-opacity=".28"/><stop offset=".6" stop-color="#ffb877" stop-opacity=".08"/><stop offset="1" stop-color="#ffb877" stop-opacity="0"/></radialGradient>
  </defs>

  <rect x="-20" y="-60" width="400" height="${HZ + 60}" fill="url(#lacSky)"/>
  <g transform="translate(${SUN.x} ${SUN.y})"><g class="lac-rays" opacity=".11">${rays}</g></g>
  <circle class="lac-glow" cx="${SUN.x}" cy="${SUN.y}" r="132" fill="url(#lacGlow)"/>
  ${cloud(262, 104, 1, 'lac-cloud lac-c1')}${cloud(36, 132, .55, 'lac-cloud lac-c2')}${cloud(330, 150, .5, 'lac-cloud lac-c3')}
  <g class="lac-sundisc"><circle cx="${SUN.x}" cy="${SUN.y}" r="27" fill="#fff0c0" opacity=".45"/><circle cx="${SUN.x}" cy="${SUN.y}" r="19" fill="url(#lacDisc)"/></g>
  ${bird(222, 136, 1)}${bird(244, 126, .85)}${bird(262, 142, .75)}${bird(300, 120, .65)}

  <!-- montagnes du Chablais (Dents-du-Midi) -->
  <path d="${M_FAR}" fill="#aaa7c6"/>
  <path d="M146 187 L136 205 L150 199Z M168 173 L158 192 L172 186Z M190 161 L180 182 L193 175Z M206 158 L199 172 L208 168Z M222 153 L214 170 L224 165Z M238 151 L232 165 L240 160Z" fill="#e2b9b6" opacity=".9"/>
  <path d="M190 161 L194 166 L191 167 L187 165Z M206 158 L209 162 L205 163Z M222 153 L226 158 L222 159 L219 157Z M238 151 L242 157 L238 157Z M168 173 L171 177 L167 178Z" fill="#fbeee8"/>
  <path d="${M_MID}" fill="#8793b5"/>
  <path d="M140 215 L132 232 L146 226Z M186 197 L176 214 L190 208Z M216 199 L208 214 L219 209Z M252 201 L244 215 L255 210Z" fill="#b39fb6" opacity=".75"/>
  <path d="${M_NEAR}" fill="#67769b"/>
  <path d="M160 226 L150 244 L166 236Z M196 222 L188 238 L200 232Z" fill="#8d8aa8" opacity=".7"/>
  <rect x="-10" y="222" width="380" height="32" fill="url(#lacHaze)"/>
  <rect x="-10" y="${HZ - 0.5}" width="380" height="3" fill="#56638c" opacity=".55"/>
  ${lights}

  <!-- le lac -->
  <rect x="-10" y="${HZ + 1}" width="380" height="${SH - HZ + 50}" fill="url(#lacLake)"/>
  <g opacity=".15" transform="translate(0 ${HZ}) scale(1 -0.34) translate(0 ${-HZ})"><path d="${M_MID}" fill="#2c3b66"/></g>
  <ellipse cx="${SUN.x}" cy="${HZ + 92}" rx="40" ry="104" fill="url(#lacRefl)"/>
  <rect x="-10" y="${HZ}" width="380" height="2" fill="#ffe3b8" opacity=".55"/>
  <g class="lac-waves">${waves}</g>
  <g class="lac-glit">${glit}</g>

  <!-- voilier -->
  <g class="lac-sail"><path d="M306 276 L306 258 L316 275Z" fill="#fffaf2"/><path d="M304.5 276 L306 262 L306 276Z" fill="#f1dfcf"/><path d="M300 276.5 L320 276.5 L317 279.5 L303 279.5Z" fill="#5d4f63"/><path d="M302 282 h16" stroke="#fff6e6" stroke-width="1" opacity=".55"/></g>

  <!-- la plateforme de chantier et sa grue -->
  <g class="lac-crane">
    ${pontoons}
    <rect x="176" y="257" width="30" height="12" fill="url(#lacYel)"/>
    <path d="M178 260 h26 M181 264 h20" stroke="#f4c430" stroke-width="1.2" opacity=".5"/>
    <rect x="176" y="247.5" width="30" height="5" rx="1" fill="#f4c430"/>
    <rect x="176" y="252.5" width="30" height="2.4" fill="#c58f1d"/>
    <rect x="180.5" y="241.5" width="8.5" height="6.2" fill="#f3efe6"/><rect x="180.5" y="241.5" width="8.5" height="1.4" fill="#d7d0c3"/>
    <rect x="190.5" y="243" width="5.5" height="4.6" fill="#e8ad2a"/>
    <path d="M199.5 247.5 L199.5 208 M202.3 247.5 L202.3 208" stroke="#e8a92a" stroke-width="1.1"/>
    <path d="M199.5 244 L202.3 240 L199.5 236 L202.3 232 L199.5 228 L202.3 224 L199.5 220 L202.3 216 L199.5 212" stroke="#c98a16" stroke-width=".6" fill="none"/>
    <path d="M201 210 L176 197" stroke="#e8a92a" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M201 210 L210 213" stroke="#e8a92a" stroke-width="1.5" stroke-linecap="round"/>
    <rect x="207.5" y="211.5" width="4" height="3.4" fill="#8b6a3a"/>
    <path d="M201 206 L176.5 197.5 M201 206 L210 212" stroke="#c98a16" stroke-width=".5"/>
    <path d="M177 197.5 L177 229" stroke="#4d3d2b" stroke-width=".6"/><rect x="175.8" y="229" width="2.4" height="2.6" fill="#4d3d2b"/>
    <rect x="198.5" y="206.5" width="5" height="4" rx=".8" fill="#f4c430"/>
  </g>

  <!-- la pointe boisée (à gauche) -->
  <g class="lac-trees">
    <g opacity=".3" transform="translate(0 ${2 * 262}) scale(1 -1)"><ellipse cx="22" cy="248" rx="40" ry="10" fill="#244833"/></g>
    <path d="M-8 264 Q30 257 64 258.5 Q88 259.5 104 262.5 Q72 266.5 -8 268 Z" fill="#c7aa82"/>
    <path d="M-8 266 Q50 263 104 262.5 Q70 268 -8 270 Z" fill="#8f7559" opacity=".6"/>
    <g fill="#2e5a3a"><circle cx="-2" cy="246" r="18"/><circle cx="14" cy="232" r="20"/><circle cx="36" cy="228" r="19"/><circle cx="56" cy="238" r="16"/><circle cx="72" cy="248" r="12"/><ellipse cx="46" cy="214" rx="7.5" ry="20"/><rect x="-8" y="240" width="88" height="20"/></g>
    <g fill="#3f7646"><circle cx="2" cy="242" r="13"/><circle cx="17" cy="228" r="15"/><circle cx="37" cy="224" r="14"/><circle cx="56" cy="234" r="11"/><circle cx="71" cy="245" r="8"/><ellipse cx="46" cy="212" rx="5.5" ry="16"/></g>
    <g fill="#a6c86c"><path d="M26 220 Q31 223 30 231 Q24 226 26 220Z"/><path d="M47 216 Q53 222 50 230 Q45 223 47 216Z"/><path d="M64 230 Q70 234 68 242 Q62 236 64 230Z"/><path d="M77 242 Q82 246 80 252 Q75 248 77 242Z"/><path d="M50 199 Q53 205 51 212 Q48 206 50 199Z"/></g>
    <g fill="#5d4532"><rect x="20" y="250" width="2.2" height="9"/><rect x="45" y="250" width="2.2" height="9"/><rect x="66" y="252" width="2" height="7"/></g>
  </g>

  <rect x="-20" y="-60" width="400" height="760" fill="url(#lacWarm)"/>
</svg></div>`;
  }

  function shoreSVG(R) {
    const cols = ['#a39a8f', '#8d8884', '#c7bcae', '#b5a088', '#7f7b7d', '#d6c8b3', '#9b8c7a', '#b8ada3'];
    let peb = '';
    for (let i = 0; i < 70; i++) {
      const t = Math.pow(R(), 0.8);
      const y = SH + 14 + t * 190;
      const x = R() * 376 - 8;
      const rx = 1.5 + t * 5.6 + R() * 2.2;
      const ry = rx * (0.5 + R() * 0.18);
      peb += `<ellipse cx="${f1(x)}" cy="${f1(y + ry * 0.5)}" rx="${f1(rx * 1.04)}" ry="${f1(ry * 0.9)}" fill="#7a6551" opacity=".28"/>`;
      peb += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${cols[Math.floor(R() * cols.length)]}"/>`;
      if (rx > 3.2) peb += `<ellipse cx="${f1(x - rx * 0.28)}" cy="${f1(y - ry * 0.35)}" rx="${f1(rx * 0.42)}" ry="${f1(ry * 0.32)}" fill="#fff4e2" opacity=".55"/>`;
    }
    const sh = (x, y, rx) => `<ellipse cx="${x + 16}" cy="${y + 1}" rx="${rx}" ry="7" fill="#6a4a30" opacity=".26" transform="rotate(5 ${x + 16} ${y + 1})"/><ellipse cx="${x}" cy="${y}" rx="${rx * 0.55}" ry="5" fill="#5a3e28" opacity=".22"/>`;
    return `<svg class="lac-shore" viewBox="0 0 360 700" aria-hidden="true">
  <defs>
    <linearGradient id="lacSand" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#9a8571"/><stop offset=".06" stop-color="#b59d80"/><stop offset=".14" stop-color="#d9c19c"/><stop offset=".55" stop-color="#d8bb93"/><stop offset="1" stop-color="${SAND_BOTTOM}"/>
    </linearGradient>
  </defs>
  <path d="M-10 ${SH} Q40 ${SH - 4} 90 ${SH + 1} T190 ${SH} T290 ${SH + 1} T370 ${SH - 2} L370 700 L-10 700 Z" fill="url(#lacSand)"/>
  <path class="lac-sheen" d="M-10 ${SH + 6} Q60 ${SH + 3} 130 ${SH + 7} T260 ${SH + 6} T370 ${SH + 4}" stroke="#efe2cf" stroke-width="3" fill="none" opacity=".35"/>
  <path class="lac-foam2" d="M-10 ${SH - 7} q15 -2.4 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" stroke="#e9f2fb" stroke-width="1.3" fill="none" opacity=".55"/>
  <path class="lac-foam1" d="M-10 ${SH} Q40 ${SH - 4} 90 ${SH + 1} T190 ${SH} T290 ${SH + 1} T370 ${SH - 2}" stroke="#fffaf0" stroke-width="2.6" fill="none" opacity=".9" stroke-linecap="round"/>
  ${peb}
  <g transform="translate(296 618) rotate(-9)"><rect x="-26" y="-3.5" width="52" height="7" rx="3.5" fill="#8b6c4f"/><rect x="-24" y="-3.5" width="46" height="2.4" rx="1.2" fill="#b39373"/><path d="M14 -3 l7 -6" stroke="#8b6c4f" stroke-width="2.4" stroke-linecap="round"/></g>
  ${sh(92, 598, 46)}${sh(183, 573, 36)}${sh(272, 583, 42)}
</svg>`;
  }

  /* ---------------- swirl particles ---------------- */
  const LEAF_COLS = ['#e8743b', '#d4472f', '#f2a63a', '#b9572c'];
  const LEAF = (c) => `<svg width="26" height="26" viewBox="-13 -13 26 26"><path d="M0 -11 C7 -7 8 4 0 11 C-8 4 -7 -7 0 -11Z" fill="${c}"/><path d="M0 -9 L0 10" stroke="rgba(0,0,0,.2)" stroke-width="1.2"/></svg>`;
  const FLAKE = '<svg width="22" height="22" viewBox="-11 -11 22 22"><g stroke="#fff" stroke-width="1.8" stroke-linecap="round"><path d="M0 -9V9M-7.8 -4.5L7.8 4.5M-7.8 4.5L7.8 -4.5"/><path d="M-2.5 -7 L0 -4.5 L2.5 -7 M-2.5 7 L0 4.5 L2.5 7" stroke-width="1.2"/></g></svg>';
  const BLOSSOM = `<svg width="24" height="24" viewBox="-12 -12 24 24"><g fill="#ffc2d6">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-5.4" rx="3.8" ry="5.4" transform="rotate(${a})"/>`).join('')}</g><circle r="2.7" fill="#ffd36e"/></svg>`;
  const SUN_SVG = `<svg width="190" height="190" viewBox="-95 -95 190 190"><g class="lac-srays">${Array.from({ length: 12 }, (_, k) => `<path d="M-4.5 -28 L0 -${k % 2 ? 62 : 84} L4.5 -28Z" transform="rotate(${k * 30})" fill="#ffe9a8"/>`).join('')}</g><circle r="30" fill="#ffd36e" opacity=".4"/><circle r="19" fill="#fff4cf"/></svg>`;
  const STAR = (c) => `<svg width="20" height="20" viewBox="-10 -10 20 20"><path d="M0 -9 Q1.4 -1.4 9 0 Q1.4 1.4 0 9 Q-1.4 1.4 -9 0 Q-1.4 -1.4 0 -9Z" fill="${c}"/></svg>`;

  const CSS = `
${S} .lac-season{position:absolute;inset:0;z-index:1;background:#2a1f2e}
${S} .lac-season i{position:absolute;inset:0;background:radial-gradient(circle at 50% 52%,rgba(255,255,255,.2),rgba(255,255,255,0) 62%)}
${S} .lac-world{position:absolute;inset:0;z-index:2;transform-origin:150px 470px}
${S} .lac-back,${S} .lac-front{position:absolute;left:0;top:0;width:360px;height:640px}
${S} .lac-back svg{position:absolute;left:0;top:0;width:360px;height:640px;overflow:visible}
${S} .lac-shore{position:absolute;left:0;top:0;width:360px;height:700px}
${S} .lac-fx{position:absolute;inset:0;z-index:9;pointer-events:none}
${S} .lac-swirl{position:absolute;inset:0;overflow:hidden}
${S} .lac-p,${S} .lac-pi,${S} .lac-ssun,${S} .lac-spark{position:absolute;left:0;top:0;width:0;height:0}
${S} .lac-p{left:180px;top:330px}
${S} .lac-pi svg,${S} .lac-ssun svg,${S} .lac-spark svg{position:absolute;left:0;top:0;transform:translate(-50%,-50%);overflow:visible}
${S} .lac-tchin{position:absolute;left:0;top:0;font:700 38px/1 var(--font-display);color:#fff;white-space:nowrap;letter-spacing:.5px;
  text-shadow:0 3px 0 #e2557e,0 5px 0 rgba(120,30,60,.25),0 8px 18px rgba(40,20,50,.35)}
${S} .lac-ring{position:absolute;left:0;top:0;width:40px;height:40px;margin:-20px 0 0 -20px;border:3px solid #fff3c4;border-radius:50%}
${S} .lac-face{position:absolute;border:2px solid #ffd60a;border-radius:5px;z-index:8;box-shadow:0 0 0 1px rgba(60,40,0,.15)}
${S} .v-cap{top:505px;padding:7px 14px}
${S} .v-top b{visibility:hidden}
${S} .lac-anchor{position:absolute;z-index:7;pointer-events:none}
${S} .lac-anchor .ch-bubble{left:70%;padding:8px 13px}
${S} .lac-anchor .ch-bubble::after{left:30%}
${S} .lac-corner{position:absolute;width:26px;height:26px;border:0 solid rgba(255,255,255,.95);filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
`;

  Story.register({
    id: 'lac', order: 4, title: 'Notre année',
    photos: [2], skippable: true,
    bg: '#2a1f2e', music: 'normal', darkUI: false,

    build(ctx) {
      const tl = ctx.tl, R = ctx.rand;
      ctx.html(`<style>${CSS}</style>`);
      ctx.backdrop('#2a1f2e', '#2a1f2e');
      // the backdrop follows the seasons (CSS transition smooths the steps), then the scene's edge colours
      ctx.backdrop('#7a4733', '#7a4733', 0.02);
      ctx.backdrop('#4d6c96', '#4d6c96', 0.38);
      ctx.backdrop('#eba1ba', '#eba1ba', 0.7);
      ctx.backdrop('#ffcf86', '#ffcf86', 1.0);
      ctx.backdrop('#8e9fba', '#cfaf87', 1.55);   // colours measured at the stage's top / bottom edges

      /* ---------- layers ---------- */
      const season = ctx.html('<div class="lac-season"><i></i></div>');
      const world = ctx.html('<div class="lac-world"></div>');
      const back = ctx.html(backSVG(R), world);
      const front = ctx.html('<div class="lac-front"></div>', world);
      ctx.html(shoreSVG(R), front);
      const fx = ctx.html('<div class="lac-fx"></div>');

      /* ---------- characters ---------- */
      const amie = makeFriend(ctx, front, { h: 172, x: 183, y: 573 });
      const sven = ctx.char('sven', { outfit: 'tshirt-grey', h: 190, x: 272, y: 583, parent: front });
      const artur = ctx.char('artur', { outfit: 'tshirt-white', h: 206, x: 92, y: 598, parent: front });

      const canA = artur.hold('R', canSVG(SKIN.artur));
      const phone = artur.hold('L', phoneSVG(SKIN.artur));
      const canF = amie.hold('R', canSVG(SKIN.amie));
      const canS = sven.hold('L', canSVG(SKIN.sven));
      const phonePop = phone.querySelector('.lac-phone-pop');
      const led = phone.querySelector('.lac-led');

      // keep a prop upright while its arm rotates (counter-rotation around the hand centre)
      const rotCtl = (node) => {
        const p = { a: 0 };
        const apply = () => node.setAttribute('transform', 'rotate(' + p.a.toFixed(2) + ')');
        return (at, a, dur, ease) => tl.to(p, { a, duration: dur, ease, onUpdate: apply }, at);
      };
      const rA = rotCtl(canA), rP = rotCtl(phone), rF = rotCtl(canF), rS = rotCtl(canS);
      // lean = the body's rotation at that moment (so the prop stays upright in the world),
      // tiltW = an extra world tilt of the prop (cans leaning towards each other for the clink)
      const arm = (c, side, rot, at, angle, dur, ease, lean, tiltW) => {
        tl.to(side === 'L' ? c.armL : c.armR, { rotation: angle, duration: dur, ease }, at);
        if (rot) rot(at, -angle - (lean || 0) + (tiltW || 0), dur, ease);
      };
      const body = (c, at, vars) => tl.to(c.el, Object.assign({ duration: 0.4, ease: 'power2.out' }, vars), at);
      const tilt = (c, at, deg, dur) => tl.to(c.head, { rotation: deg, duration: dur || 0.3, ease: 'sine.inOut' }, at);

      /* ---------- ambient life (real time) ---------- */
      back.querySelectorAll('.lac-gl').forEach((g) => {
        ctx.loop(gsap.fromTo(g, { opacity: 1 }, { opacity: 0.12, duration: 0.35 + R() * 0.6, delay: R() * 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      });
      ctx.loop(gsap.to(back.querySelector('.lac-waves'), { x: 9, duration: 3.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      ctx.loop(gsap.to(back.querySelector('.lac-rays'), { rotation: 360, transformOrigin: '50% 50%', duration: 80, repeat: -1, ease: 'none' }));
      ctx.loop(gsap.to(back.querySelector('.lac-glow'), { scale: 1.07, transformOrigin: '50% 50%', duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      back.querySelectorAll('.lac-cloud').forEach((c, i) => {
        ctx.loop(gsap.to(c, { x: i % 2 ? -10 : 12, duration: 7 + i * 2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      });
      back.querySelectorAll('.lac-wing').forEach((w, i) => {
        ctx.loop(gsap.to(w, { scaleY: -0.5, transformOrigin: '50% 80%', duration: 0.26 + i * 0.04, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.13 }));
      });
      const shore = front.querySelector('.lac-shore');
      ctx.loop(gsap.to(shore.querySelector('.lac-foam1'), { x: 7, opacity: 0.55, duration: 2.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      ctx.loop(gsap.to(shore.querySelector('.lac-foam2'), { x: -10, opacity: 0.2, duration: 1.9, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      ctx.loop(gsap.to(shore.querySelector('.lac-sheen'), { opacity: 0.12, duration: 2.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      [artur, sven, amie].forEach((c, i) => {
        ctx.loop(gsap.to(c.head, { y: -1.6, duration: 1.3 + i * 0.27, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: i * 0.4 }));
      });
      // birds glide and the sailboat drifts on the timeline (deterministic)
      back.querySelectorAll('.lac-bird').forEach((b, i) => {
        tl.fromTo(b, { x: 0, y: 0 }, { x: -120 - i * 14, y: 10 - i * 6, duration: 14, ease: 'none' }, 0);
      });
      tl.fromTo(back.querySelector('.lac-sail'), { x: 0 }, { x: -16, duration: 14, ease: 'none' }, 0);

      /* ---------- 0 → 2 s : the seasons swirl by, summer opens ---------- */
      tl.fromTo(season, { backgroundColor: '#2a1f2e' }, { backgroundColor: '#7a4733', duration: 0.32, ease: 'none' }, 0);
      tl.to(season, { backgroundColor: '#4d6c96', duration: 0.3, ease: 'none' }, 0.38);
      tl.to(season, { backgroundColor: '#eba1ba', duration: 0.3, ease: 'none' }, 0.7);
      tl.to(season, { backgroundColor: '#ffcf86', duration: 0.3, ease: 'none' }, 1.0);
      ctx.sfx('swoosh', 0.05);

      const swirl = ctx.html('<div class="lac-swirl"></div>', fx);
      // wind lines of the vortex
      const vort = ctx.html(`<div class="lac-pi" style="left:180px;top:330px"><svg width="460" height="460" viewBox="-230 -230 460 460">
        <g fill="none" stroke="#fff" stroke-linecap="round">
          <path d="M0 -200 A200 200 0 0 1 173 100" stroke-width="5" opacity=".22"/>
          <path d="M0 200 A200 200 0 0 1 -173 -100" stroke-width="5" opacity=".22"/>
          <path d="M-128 -60 A140 140 0 0 1 60 -126" stroke-width="3.5" opacity=".3"/>
          <path d="M128 60 A140 140 0 0 1 -60 126" stroke-width="3.5" opacity=".3"/>
          <path d="M70 -40 A80 80 0 0 1 -10 79" stroke-width="2.5" opacity=".35"/>
          <path d="M-70 40 A80 80 0 0 1 10 -79" stroke-width="2.5" opacity=".35"/>
        </g></svg></div>`, swirl);
      tl.fromTo(vort, { rotation: 0, scale: 1.25 }, { rotation: 620, scale: 0.35, duration: 1.3, ease: 'power1.in' }, 0);
      tl.fromTo(vort, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
      tl.to(vort, { opacity: 0, duration: 0.2 }, 1.1);
      const fams = [
        { make: (i) => LEAF(LEAF_COLS[i % 4]), n: 16, t0: 0.0, spread: 0.32, life: 0.78 },
        { make: () => FLAKE, n: 14, t0: 0.34, spread: 0.28, life: 0.68 },
        { make: () => BLOSSOM, n: 14, t0: 0.66, spread: 0.28, life: 0.66 },
      ];
      fams.forEach((fm, k) => {
        for (let i = 0; i < fm.n; i++) {
          const w = ctx.html(`<div class="lac-p"><div class="lac-pi">${fm.make(i)}</div></div>`, swirl);
          const pi = w.firstElementChild;
          const t0 = fm.t0 + (i / fm.n) * fm.spread;
          const a0 = (i / fm.n) * 360 + k * 47 + R() * 25;
          const r0 = 170 + R() * 120, r1 = 20 + R() * 60, sc = 1.1 + R() * 0.8;
          tl.fromTo(w, { rotation: a0 }, { rotation: a0 + 210 + R() * 70, duration: fm.life, ease: 'power1.in' }, t0);
          tl.fromTo(pi, { x: r0, scale: sc * 0.6, rotation: R() * 360 }, { x: r1, scale: sc, rotation: '+=' + Math.round(200 + R() * 160), duration: fm.life, ease: 'power2.in' }, t0);
          tl.fromTo(pi, { opacity: 0 }, { opacity: 1, duration: 0.12 }, t0);
          tl.to(pi, { opacity: 0, duration: 0.18 }, t0 + fm.life - 0.18);
        }
      });

      const ssun = ctx.html(`<div class="lac-ssun">${SUN_SVG}</div>`, fx);
      const srays = ssun.querySelector('.lac-srays');
      tl.fromTo(ssun, { x: 180, y: 330, scale: 0, rotation: -90 }, { scale: 2, rotation: 0, duration: 0.34, ease: 'back.out(2)' }, 0.96);
      tl.to(ssun, { x: SUN.x, y: SUN.y, scale: 1, duration: 0.8, ease: 'power3.inOut' }, 1.3);
      tl.fromTo(srays, { rotation: 0 }, { rotation: 150, transformOrigin: '50% 50%', duration: 1.2, ease: 'power1.out' }, 0.96);
      tl.to(srays, { opacity: 0, duration: 0.3 }, 1.78);
      tl.to(ssun, { opacity: 0, duration: 0.25 }, 2.02);
      ctx.sfx('chime', 1.0);

      const sunDisc = back.querySelector('.lac-sundisc');
      tl.fromTo(sunDisc, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.98);
      // iris: summer opens from the sun
      tl.fromTo(world, { clipPath: 'circle(0px at 180px 330px)' }, { clipPath: `circle(640px at ${SUN.x}px ${SUN.y}px)`, duration: 0.9, ease: 'power2.in' }, 1.12);
      // gentle "crane down" parallax as the scene settles
      tl.fromTo(back, { y: 12 }, { y: 0, duration: 1.9, ease: 'power2.out' }, 1.1);
      tl.fromTo(front, { y: 40 }, { y: 0, duration: 1.9, ease: 'power3.out' }, 1.1);

      /* ---------- 2 → 4.2 s : our year ---------- */
      ctx.beat(2.0);
      ctx.caption('Puis il y a eu notre année.', 2.1, { pos: 'top', variant: 'card', dur: 2.9 });
      artur.hop(2.35, 14);
      tl.to(amie.el, { y: '-=13', duration: 0.18, ease: 'power2.out' }, 2.5);
      tl.to(amie.el, { y: '+=13', duration: 0.2, ease: 'power2.in' }, 2.68);
      sven.hop(2.65, 14);
      // the friend waves
      tl.to(amie.armL, { rotation: 158, duration: 0.3, ease: 'back.out(2)' }, 3.0);
      tl.to(amie.armL, { rotation: 134, duration: 0.17, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 3.3);
      tl.to(amie.armL, { rotation: 0, duration: 0.35, ease: 'power2.inOut' }, 4.0);
      tilt(amie, 3.0, -6); tilt(amie, 4.0, 0);
      tilt(sven, 3.2, 6); tilt(sven, 3.9, 0);

      /* ---------- 4.2 → 8.6 s : this time, I hold the phone ---------- */
      ctx.beat(4.2);
      arm(artur, 'L', rP, 4.3, 62, 0.36, 'back.out(1.7)');
      // (attribute transform, scaled around the hand centre: GSAP's SVG origin maths would offset the nested group)
      const pop = { s: 0 };
      const popApply = () => phonePop.setAttribute('transform', 'scale(' + Math.max(0.001, pop.s).toFixed(3) + ')');
      popApply();
      tl.fromTo(pop, { s: 0 }, { s: 1, duration: 0.3, ease: 'back.out(2.5)', onUpdate: popApply }, 4.36);
      ctx.sfx('tick', 4.4);
      tilt(artur, 4.4, -8);
      // Sven, out of habit, reaches for it…
      body(sven, 4.72, { rotation: 3, duration: 0.15, ease: 'sine.out' });
      body(sven, 4.87, { x: -10, rotation: -7, duration: 0.38, ease: 'power3.out' });
      arm(sven, 'L', rS, 4.87, 104, 0.38, 'power3.out', -7);
      tilt(sven, 4.87, -8);
      body(amie, 4.9, { scaleY: 0.93, scaleX: 1.03, duration: 0.25 });
      tilt(amie, 4.9, -9, 0.25);
      // …but Artur whisks it up, out of reach (and leans away)
      arm(artur, 'L', rP, 5.28, 140, 0.3, 'back.out(1.8)', -7);
      body(artur, 5.22, { rotation: 2, duration: 0.08, ease: 'sine.out' });          // tiny anticipation
      body(artur, 5.3, { x: -2, rotation: -7, duration: 0.24, ease: 'power3.out' });
      body(artur, 5.75, { x: 0, rotation: 0, duration: 0.55, ease: 'sine.inOut' });
      rP(5.75, -140, 0.55, 'sine.inOut');
      tilt(artur, 5.28, 6);
      ctx.sfx('whoosh', 5.28);
      sven.emote(5.5, '!', 0.9);
      body(sven, 5.95, { x: 0, rotation: 0, duration: 0.5, ease: 'power2.inOut' });
      arm(sven, 'L', rS, 5.95, 0, 0.5, 'power2.inOut', 0);
      tilt(sven, 5.95, 0);
      // Sven shrugs, laughing
      arm(sven, 'R', null, 6.5, -32, 0.3, 'back.out(2)');
      tilt(sven, 6.5, 9);
      arm(sven, 'R', null, 7.25, 0, 0.35, 'power2.inOut');
      tilt(sven, 7.25, 0);
      // the friend laughs
      body(amie, 5.95, { scaleY: 1, scaleX: 1, duration: 0.35, ease: 'back.out(2)' });
      tilt(amie, 5.95, 0, 0.2);
      tl.to(amie.head, { rotation: 5, duration: 0.13, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 6.18);
      tilt(artur, 7.0, 0);
      arm(artur, 'L', rP, 7.9, 40, 0.45, 'power2.inOut');

      /* ---------- 8.6 → 10.7 s : Tchin ! ---------- */
      ctx.beat(8.6);
      [artur, amie, sven].forEach((c, i) => {
        tl.to(c.el, { scaleY: 0.965, duration: 0.12, ease: 'power1.out' }, 8.66 + i * 0.03);
        tl.to(c.el, { scaleY: 1, duration: 0.3, ease: 'back.out(2)' }, 8.8 + i * 0.03);
      });
      // the three cans meet in one tight cluster under the friend's chin, leaning into each other
      const CL = { a: -90, ar: -3.5, ax: 0, s: 92, sr: -6, sx: -9, f: 80, fy: -3 };
      body(artur, 8.8, { x: CL.ax, rotation: CL.ar, duration: 0.45 });
      arm(artur, 'R', rA, 8.8, CL.a, 0.45, 'power2.out', CL.ar, 12);
      body(sven, 8.8, { x: CL.sx, rotation: CL.sr, duration: 0.45 });
      arm(sven, 'L', rS, 8.8, CL.s, 0.45, 'power2.out', CL.sr, -12);
      tl.to(amie.el, { y: CL.fy, duration: 0.45, ease: 'power2.out' }, 8.8);   // on tiptoe
      arm(amie, 'R', rF, 8.8, CL.f, 0.45, 'power2.out', 0);
      tilt(artur, 8.85, 5); tilt(sven, 8.85, -5);
      // the clink: a tiny knock-back on each arm
      tl.to(artur.armR, { rotation: CL.a + 6, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, 9.25);
      tl.to(sven.armL, { rotation: CL.s - 6, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, 9.25);
      tl.to(amie.armR, { rotation: CL.f + 5, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' }, 9.25);
      ctx.sfx('clink', 9.25);

      const CX = 175, CY = 494;   // clink point (where the three cans touch)
      const ring = ctx.html('<div class="lac-ring"></div>', fx);
      tl.fromTo(ring, { x: CX, y: CY, scale: 0.2 }, { scale: 1.8, duration: 0.55, ease: 'power2.out' }, 9.25);
      tl.fromTo(ring, { opacity: 0 }, { opacity: 0.95, duration: 0.06, ease: 'none' }, 9.25);
      tl.to(ring, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 9.32);
      const sparkCols = ['#fff6c8', '#ffd36e', '#ffffff', '#ffc2d6'];
      for (let i = 0; i < 9; i++) {
        // fan out to the sides (not over the friend's face)
        const side = i % 2 ? 180 : 0, lift = -6 - (i >> 1) * 9 + (R() * 6 - 3);
        const a = (side + (side ? -lift : lift)) * Math.PI / 180;
        const d = 30 + R() * 22;
        const sp = ctx.html(`<div class="lac-spark">${STAR(sparkCols[i % 4])}</div>`, fx);
        tl.fromTo(sp, { x: CX, y: CY, scale: 0, rotation: 0, opacity: 1 },
          { x: CX + Math.cos(a) * d, y: CY + Math.sin(a) * d, scale: 0.9 + R() * 0.6, rotation: 90, duration: 0.5, ease: 'power3.out' }, 9.25);
        tl.to(sp, { opacity: 0, scale: 0, duration: 0.3, ease: 'power1.in' }, 9.65 + R() * 0.15);
      }
      const tchin = ctx.html('<div class="lac-tchin">Tchin !</div>', fx);
      tl.fromTo(tchin, { x: 180, y: 368, xPercent: -50, yPercent: -50, scale: 0.3, rotation: -14, opacity: 0 },
        { scale: 1, rotation: -6, opacity: 1, duration: 0.42, ease: 'back.out(3)' }, 9.28);
      tl.to(tchin, { y: 356, duration: 0.8, ease: 'sine.out' }, 9.7);
      tl.to(tchin, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power1.in' }, 10.45);

      // arms down
      body(artur, 10.35, { x: 0, rotation: 0, duration: 0.4, ease: 'power2.inOut' });
      arm(artur, 'R', rA, 10.35, 0, 0.4, 'power2.inOut', 0);
      body(sven, 10.35, { x: 0, rotation: 0, duration: 0.4, ease: 'power2.inOut' });
      arm(sven, 'L', rS, 10.35, 0, 0.4, 'power2.inOut', 0);
      tl.to(amie.el, { y: 0, duration: 0.4, ease: 'power2.inOut' }, 10.35);
      arm(amie, 'R', rF, 10.35, 0, 0.4, 'power2.inOut', 0);
      tilt(artur, 10.35, 0); tilt(sven, 10.35, 0);

      /* ---------- 10.7 → 12.8 s : the selfie ---------- */
      ctx.beat(10.7);
      arm(artur, 'L', rP, 10.8, 136, 0.5, 'back.out(1.5)', -3);
      body(artur, 10.8, { rotation: -3, duration: 0.5 });
      tilt(artur, 11.0, 7, 0.4);
      body(amie, 11.0, { rotation: -6, duration: 0.5 });
      tilt(amie, 11.05, -7, 0.4);
      body(sven, 11.0, { x: -14, rotation: -6, duration: 0.55 });
      tilt(sven, 11.05, -9, 0.4);
      arm(sven, 'L', rS, 11.1, 38, 0.4, 'back.out(1.6)', -6);
      arm(amie, 'R', rF, 11.1, 30, 0.4, 'back.out(1.6)', -6);
      arm(artur, 'R', rA, 11.1, -34, 0.4, 'back.out(1.6)', -3);
      tl.fromTo(world, { scale: 1 }, { scale: 1.07, duration: 2.0, ease: 'sine.inOut' }, 10.9);

      // camera UI: framing corners + face-detection squares
      [[22, 352, 'tl'], [338, 352, 'tr'], [22, 566, 'bl'], [338, 566, 'br']].forEach(([x, y, k]) => {
        const st = { tl: 'border-top-width:3px;border-left-width:3px;border-top-left-radius:6px', tr: 'border-top-width:3px;border-right-width:3px;border-top-right-radius:6px',
          bl: 'border-bottom-width:3px;border-left-width:3px;border-bottom-left-radius:6px', br: 'border-bottom-width:3px;border-right-width:3px;border-bottom-right-radius:6px' }[k];
        const n = ctx.html(`<div class="lac-corner" style="${st};left:${x - (k[1] === 'r' ? 26 : 0)}px;top:${y - (k[0] === 'b' ? 26 : 0)}px"></div>`, fx);
        const dx = k[1] === 'r' ? 14 : -14, dy = k[0] === 'b' ? 14 : -14;
        tl.fromTo(n, { opacity: 0, x: dx, y: dy }, { opacity: 1, x: 0, y: 0, duration: 0.35, ease: 'power3.out' }, 11.45);
      });
      [[96, 452, 72], [171, 458, 54], [242, 453, 66]].forEach(([x, y, s], i) => {
        const n = ctx.html(`<div class="lac-face" style="left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px"></div>`, front);
        tl.fromTo(n, { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }, 11.6 + i * 0.1);
      });
      tl.fromTo(led, { opacity: 0 }, { opacity: 0.95, duration: 0.08, yoyo: true, repeat: 3, ease: 'none' }, 12.3);

      /* ---------- 12.8 s : photo 2 ---------- */
      const ph = ctx.photo(2, 12.8, { caption: 'Un lac, trois canettes, et un soleil qui ne voulait pas se coucher.' });
      ctx.backdrop('#0b0a0d', '#0b0a0d', 12.86);   // the viewer is black: no sky/sand bands around it on tall phones
      // GSAP fires onComplete when a pause sits exactly at the end of the timeline, which would skip
      // the photo's hold: keep a short tail after it so the hold really waits for Sven's tap.
      tl.to({}, { duration: 0.35 }, ph.end);
    },
  });
})();
;

/* ===== js/scenes/05-ouay.js ===== */
/* Scène 5 — « ouay » : l’aventure Ouay.
 * Beat 1 (0 → 5.3 s) : l’écran se remplit de vert, le logo Ouay se construit en blanc (têtes, corps,
 *   poignée de main), « Ouay » apparaît, et une des deux figurines se fait pousser la mèche de Sven.
 * Beat 2 (5.3 → 14.3 s) : la caméra recule jusqu’au stand (comme sur la photo). « Pouf » : Sven apparaît
 *   et présente une bouteille d’eau façon téléachat ; Artur lit sa fiche, d’où s’échappent des bulles
 *   de jargon (touchables : elles éclatent plus tôt).
 * Puis photo 3.
 */
(function () {
  'use strict';

  const G = '#1f9d5b';          // Ouay green (flood + banner)
  const GD = '#17824a';
  const CURTAIN = '#2fae68';
  const SKIN_S = '#e9b38f', SKIN_A = '#f0b896';

  // The Ouay logo, drawn in a 200 x 165 box (heads, bodies, handshake arc)
  const LOGO = {
    headL: '<circle cx="34" cy="38" r="21"/>',
    headR: '<circle cx="166" cy="38" r="21"/>',
    bodyL: '<path d="M10 160 L10 96 Q10 70 34 70 Q58 70 58 96 L58 160 Z"/>',
    bodyR: '<path d="M142 160 L142 96 Q142 70 166 70 Q190 70 190 96 L190 160 Z"/>',
    arc: 'M44 84 Q100 150 156 84',
    armL: 'M44 84 Q72 117 100 117',
    armR: 'M156 84 Q128 117 100 117',
  };
  const STAR = 'M0 -10 C1.2 -2.4 2.4 -1.2 10 0 C2.4 1.2 1.2 2.4 0 10 C-1.2 2.4 -2.4 1.2 -10 0 C-2.4 -1.2 -1.2 -2.4 0 -10 Z';
  const f1 = (n) => Math.round(n * 10) / 10;

  // small square logo badges scattered on the backdrop
  function badge(x, y, s, rot) {
    const k = (s * 0.72) / 200;
    return `<g transform="translate(${x} ${y}) rotate(${rot || 0})" opacity=".86">
      <rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${f1(s * 0.24)}" fill="#eef8f1"/>
      <g transform="translate(${f1(-100 * k)} ${f1(-88 * k)}) scale(${k.toFixed(4)})" fill="${G}">
        ${LOGO.headL}${LOGO.headR}${LOGO.bodyL}${LOGO.bodyR}
        <path d="${LOGO.arc}" fill="none" stroke="${G}" stroke-width="18" stroke-linecap="round"/>
      </g></g>`;
  }

  // areca palm: arching fronds with leaflets on both sides
  function palm(R, bx, by) {
    const fronds = [
      { a: -163, L: 74, c: 0 }, { a: -24, L: 70, c: 0 }, { a: -142, L: 92, c: 1 }, { a: -46, L: 90, c: 1 },
      { a: -120, L: 104, c: 2 }, { a: -70, L: 104, c: 2 }, { a: -96, L: 112, c: 3 }, { a: -133, L: 66, c: 4 },
      { a: -58, L: 64, c: 4 },
    ];
    const cols = [['#1d5531', '#24633a'], ['#256a3c', '#2f7a44'], ['#2f7c45', '#3b8b4c'], ['#3a8a4b', '#4c9c55'], ['#4f9f57', '#66b061']];
    let out = '';
    fronds.forEach((f, i) => {
      const a = f.a * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a);
      const ex = bx + dx * f.L, ey = by + dy * f.L + f.L * 0.42 * Math.abs(dx);
      const cx = bx + dx * f.L * 0.45, cy = by + dy * f.L * 0.95 - 6;
      const pt = (t) => [(1 - t) * (1 - t) * bx + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) * (1 - t) * by + 2 * (1 - t) * t * cy + t * t * ey];
      const tg = (t) => [2 * (1 - t) * (cx - bx) + 2 * t * (ex - cx), 2 * (1 - t) * (cy - by) + 2 * t * (ey - cy)];
      let g = `<g class="oy-frond" data-i="${i}"><path d="M${f1(bx)} ${f1(by)} Q${f1(cx)} ${f1(cy)} ${f1(ex)} ${f1(ey)}" stroke="#3f6d33" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
      const [c0, c1] = cols[f.c];
      for (let t = 0.2; t <= 0.99; t += 0.075) {
        const [px, py] = pt(t), [tx, ty] = tg(t), tl = Math.hypot(tx, ty), ux = tx / tl, uy = ty / tl;
        const len = 5 + 15 * Math.sin(Math.PI * Math.min(1, t * 1.1)) * (f.L / 100);
        [-1, 1].forEach((side) => {
          const ang = side * 1.0;
          let lx = ux * Math.cos(ang) - uy * Math.sin(ang), ly = ux * Math.sin(ang) + uy * Math.cos(ang);
          ly += 0.55; const ll = Math.hypot(lx, ly); lx /= ll; ly /= ll;
          const qx = px + lx * len * 0.5 - ly * 1.6 * side, qy = py + ly * len * 0.5 + lx * 1.6 * side;
          g += `<path d="M${f1(px)} ${f1(py)} Q${f1(qx)} ${f1(qy)} ${f1(px + lx * len)} ${f1(py + ly * len)}" stroke="${R() < 0.5 ? c0 : c1}" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;
        });
      }
      out += g + '</g>';
    });
    return out;
  }

  Story.register({
    id: 'ouay', order: 5, title: 'L’aventure Ouay', photos: [3], skippable: true,
    bg: '#0b0a0d', music: 'normal', darkUI: false,
    build(ctx) {
      const tl = ctx.tl, R = ctx.rand, S = '#stage[data-scene="ouay"]';
      ctx.backdrop('#0b0a0d');

      ctx.html(`<style>
        ${S} .oy-layer { position:absolute; left:0; top:0; width:360px; height:640px; pointer-events:none; }
        ${S} .oy-world { position:absolute; left:0; top:0; width:360px; height:640px; transform-origin:0 0; z-index:1; }
        ${S} .oy-word { position:absolute; left:205px; top:160px; z-index:3; font:600 40px/1 var(--font-display);
          color:#fff; letter-spacing:.5px; white-space:nowrap; text-shadow:0 1px 0 rgba(0,0,0,.06); }
        ${S} .oy-word span { display:inline-block; }
        ${S} .oy-url { position:absolute; left:150px; top:206px; z-index:3; font:500 15px/1 var(--font-display);
          color:rgba(255,255,255,.92); letter-spacing:.3px; transform:translate(-50%,-50%); }
        ${S} .oy-fx { z-index:8; }
        ${S} .oy-jb { position:absolute; z-index:9; pointer-events:auto; padding:8px; cursor:pointer; }
        ${S} .oy-jb-in { position:relative; font:600 15px/1 var(--font-display); color:${GD}; white-space:nowrap;
          background:linear-gradient(#ffffff,#eaf7ef); padding:8px 13px 9px; border-radius:999px;
          box-shadow:0 4px 12px rgba(10,40,25,.25), inset 0 -2px 0 rgba(23,130,74,.14); }
        ${S} .oy-jb-in::after { content:""; position:absolute; left:9px; bottom:-7px; width:7px; height:7px; border-radius:50%;
          background:#f3fbf6; box-shadow:0 2px 4px rgba(10,40,25,.2); }
        ${S} .oy-drops i { position:absolute; left:50%; top:50%; width:6px; height:6px; margin:-3px; border-radius:50%; background:#fff; }
      </style>`);

      /* ------------------------------------------------------------------ flood (screen coords) */
      let wave = 'M0 22';
      for (let x = 0; x < 720; x += 180) wave += ` C${x + 30} 4 ${x + 60} 4 ${x + 90} 22 C${x + 120} 40 ${x + 150} 40 ${x + 180} 22`;
      wave += ' L720 820 L0 820 Z';
      const flood = ctx.html(`<svg class="oy-layer" viewBox="0 0 360 640" width="360" height="640" style="z-index:0">
        <defs><radialGradient id="oyGlow" cx="50%" cy="40%" r="62%">
          <stop offset="0" stop-color="#7fe0a8" stop-opacity=".55"/><stop offset=".55" stop-color="${G}" stop-opacity="0"/></radialGradient>
          <radialGradient id="oyVig" cx="50%" cy="45%" r="75%">
          <stop offset=".6" stop-color="#0b3d22" stop-opacity="0"/><stop offset="1" stop-color="#0b3d22" stop-opacity=".35"/></radialGradient></defs>
        <g class="oy-w1"><path d="${wave}" fill="#5fca8f"/></g>
        <g class="oy-w2"><path d="${wave}" fill="${G}"/></g>
        <rect class="oy-glow" width="360" height="640" fill="url(#oyGlow)"/>
        <rect class="oy-vig" width="360" height="640" fill="url(#oyVig)"/>
        <g class="oy-ring" transform="translate(180 292)"><circle r="40" fill="none" stroke="#fff" stroke-width="2.2"/></g>
      </svg>`);
      const w1 = flood.querySelector('.oy-w1'), w2 = flood.querySelector('.oy-w2');
      const glow = flood.querySelectorAll('.oy-glow, .oy-vig'), ring = flood.querySelector('.oy-ring circle');
      tl.fromTo(w1, { x: 0, y: 650 }, { x: -180, y: -70, duration: 0.62, ease: 'sine.inOut' }, 0.04);
      tl.fromTo(w2, { x: -90, y: 680 }, { x: -270, y: -50, duration: 0.7, ease: 'sine.inOut' }, 0.12);
      tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'sine.out' }, 0.7);
      ctx.sfx('whoosh', 0.08);
      ctx.backdrop('#1d9254', '#1a874e', 0.45);

      /* ------------------------------------------------------------------ the world (booth) */
      const world = ctx.html('<div class="oy-world"></div>');

      // backdrop: curtain, banner, badges, carpet, side table, light stand
      let folds = '', x = -4;
      while (x < 364) { const w = 20 + R() * 24; folds += `<rect x="${f1(x)}" y="0" width="${f1(w + 1)}" height="446" fill="url(#oyFold)" opacity="${(0.5 + R() * 0.45).toFixed(2)}"/>`; x += w; }
      let dots = '';
      for (let i = 0; i < 80; i++) dots += `<circle cx="${f1(R() * 360)}" cy="${f1(446 + R() * 194)}" r="${f1(0.6 + R() * 0.9)}" fill="${R() < 0.5 ? '#fff' : '#000'}" opacity="${(0.07 + R() * 0.09).toFixed(2)}"/>`;
      const back = ctx.html(`<svg class="oy-layer" viewBox="0 0 360 640" width="360" height="640" style="z-index:1">
        <defs>
          <linearGradient id="oyFold" x1="0" x2="1"><stop offset="0" stop-color="#239659"/><stop offset=".42" stop-color="#3fbd78"/><stop offset=".72" stop-color="#2eaa66"/><stop offset="1" stop-color="#1f8f55"/></linearGradient>
          <linearGradient id="oyTopLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
          <linearGradient id="oyBan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#25a865"/><stop offset=".6" stop-color="${G}"/><stop offset="1" stop-color="#1a8f51"/></linearGradient>
          <linearGradient id="oyCarpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4d53"/><stop offset="1" stop-color="#3a3d42"/></linearGradient>
          <linearGradient id="oyFloorSh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
          <linearGradient id="oyChromeS" x1="0" x2="1"><stop offset="0" stop-color="#7f868e"/><stop offset=".35" stop-color="#eef1f4"/><stop offset=".7" stop-color="#a5acb3"/><stop offset="1" stop-color="#737a82"/></linearGradient>
        </defs>
        <rect width="360" height="446" fill="${CURTAIN}"/>
        ${folds}
        <rect width="360" height="446" fill="url(#oyTopLight)"/>
        <path d="M0 0 H360 V7 Q345 12 330 7 T300 7 T270 7 T240 7 T210 7 T180 7 T150 7 T120 7 T90 7 T60 7 T30 7 T0 7 Z" fill="#1d8a50" opacity=".55"/>
        <polygon points="250,0 330,0 170,446 60,446" fill="#fff" opacity=".045"/>
        <polygon points="345,0 360,0 360,60 250,446 205,446" fill="#fff" opacity=".04"/>
        ${badge(96, 58, 17, -3)}${badge(196, 46, 17, 2)}${badge(330, 120, 17, 4)}${badge(331, 268, 17, -2)}${badge(333, 392, 16, 3)}
        <rect x="15" y="103" width="292" height="343" fill="#0d4a2b" opacity=".22"/>
        <rect x="10" y="97" width="292" height="349" fill="url(#oyBan)"/>
        <rect x="10" y="97" width="292" height="3" fill="#fff" opacity=".12"/>
        <path d="M30 330 Q120 300 230 352" stroke="#fff" stroke-opacity=".05" stroke-width="7" fill="none"/>
        ${badge(30, 236, 16, -4)}${badge(112, 266, 16, 3)}${badge(262, 238, 16, -2)}${badge(281, 121, 15, 3)}
        <rect y="440" width="360" height="200" fill="url(#oyCarpet)"/>
        <rect y="440" width="360" height="16" fill="url(#oyFloorSh)"/>
        ${dots}
        <path d="M100 470 L224 470 L232 514 L92 514 Z" fill="none" stroke="#6d7177" stroke-opacity=".45" stroke-width="1.2"/>
        <g>
          <path d="M350 150 L350 466" stroke="#232529" stroke-width="2.6"/>
          <rect x="346" y="250" width="8" height="10" rx="2" fill="#2c2f34"/>
          <path d="M350 460 L337 494 M350 460 L362 494 M350 460 L353 500" stroke="#232529" stroke-width="2.2" fill="none"/>
        </g>
        <g>
          <ellipse cx="10" cy="501" rx="34" ry="5" fill="#000" opacity=".2"/>
          <path d="M10 496 L44 502 L43 506 L10 501 Z M10 496 L-20 503 L-20 507 L10 501 Z" fill="#b9bfc5"/>
          <rect x="6" y="358" width="8" height="140" fill="url(#oyChromeS)"/>
          <ellipse cx="10" cy="357" rx="38" ry="8" fill="#356f67"/>
          <ellipse cx="10" cy="355" rx="38" ry="7" fill="#4f948a"/>
          <path d="M-12 352 L28 352 L32 349 L-8 349 Z" fill="#26282c"/>
          <path d="M-8 349 L-4 322 L30 326 L28 349 Z" fill="#1b1d21"/>
          <path d="M-4.5 346 L-1.5 325.5 L27 329 L25.5 346 Z" fill="#3a4b5e"/>
          <path d="M0 345 L2 328 L14 329.5 L6 345 Z" fill="#fff" opacity=".08"/>
        </g>
      </svg>`);

      // the logo (part of the banner) + tuft
      const logoSvg = ctx.html(`<svg class="oy-layer" viewBox="0 0 360 640" width="360" height="640" overflow="visible" style="z-index:2">
        <g class="oy-lb"><g transform="translate(47 122.8) scale(.33)" fill="#fff">
          <g class="oy-bL">${LOGO.bodyL}</g>
          <g class="oy-bR">${LOGO.bodyR}</g>
          <path class="oy-aL" d="${LOGO.armL}" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/>
          <path class="oy-aR" d="${LOGO.armR}" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/>
          <g class="oy-hL">${LOGO.headL}</g>
          <g class="oy-hRw"><g class="oy-hR">${LOGO.headR}
            <g class="oy-tuft">
              <path d="M144.6 41 C142.6 23 153 12 167 11.5 C182 11 190.5 22 188.2 37.5 C185 31 180.5 27.5 175 27.6 C171.5 31.2 165.6 32 160.6 29.8 C156.2 33.4 150.6 35.6 144.6 41 Z" fill="#3a2a23"/>
              <path d="M161 13.5 C158.5 4 166 -2 176 0.5 C170 2.1 167.6 6.5 169.4 12 Z" fill="#3a2a23"/>
              <path d="M151.5 24 C155.5 17 162.5 14.2 170 14.6" stroke="#6b4c3d" stroke-width="2.6" fill="none" stroke-linecap="round"/>
              <path d="M176.5 16.5 C181 18 184.2 21.5 185.4 25.5" stroke="#6b4c3d" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
            </g>
          </g></g>
        </g></g>
        <g class="oy-spark1" transform="translate(112 121)"><path d="${STAR}" fill="#fff"/></g>
        <g class="oy-jn" transform="translate(80 161.4)">
          ${[-124, -90, -56].map(a => `<g transform="rotate(${a})"><rect class="oy-ray" x="11" y="-1.2" width="${a === -90 ? 10 : 8}" height="2.4" rx="1.2" fill="#fff"/></g>`).join('')}
        </g>
      </svg>`);
      const q = (s) => logoSvg.querySelector(s);
      const lb = q('.oy-lb'), bL = q('.oy-bL'), bR = q('.oy-bR'), aL = q('.oy-aL'), aR = q('.oy-aR');
      const hL = q('.oy-hL'), hR = q('.oy-hR'), hRw = q('.oy-hRw'), tuft = q('.oy-tuft');
      const spark1 = q('.oy-spark1 path'), rays = logoSvg.querySelectorAll('.oy-ray');

      const word = ctx.html('<div class="oy-word"><span>O</span><span>u</span><span>a</span><span>y</span></div>', world);
      const url = ctx.html('<div class="oy-url">ouay.ch</div>', world);
      world.appendChild(back); world.appendChild(logoSvg); world.appendChild(word); world.appendChild(url);

      // props: palm, high table with items, bottles
      const props = ctx.html(`<svg class="oy-layer" viewBox="0 0 360 640" width="360" height="640" style="z-index:3">
        <defs>
          <linearGradient id="oyChrome" x1="0" x2="1"><stop offset="0" stop-color="#7f868e"/><stop offset=".35" stop-color="#f2f4f6"/><stop offset=".7" stop-color="#a5acb3"/><stop offset="1" stop-color="#737a82"/></linearGradient>
          <linearGradient id="oyPot" x1="0" x2="1"><stop offset="0" stop-color="#c8693e"/><stop offset=".45" stop-color="#b65a33"/><stop offset="1" stop-color="#8f4226"/></linearGradient>
          <linearGradient id="oyBot" x1="0" x2="1"><stop offset="0" stop-color="#b9def2"/><stop offset=".3" stop-color="#eef8fd"/><stop offset="1" stop-color="#a9d2ea"/></linearGradient>
        </defs>
        <ellipse cx="229" cy="447" rx="26" ry="4" fill="#000" opacity=".25"/>
        <g class="oy-palm">${palm(R, 229, 402)}</g>
        <path d="M210 404 L248 404 L243 446 L215 446 Z" fill="url(#oyPot)"/>
        <rect x="206.5" y="398" width="45" height="9" rx="2.5" fill="#cf7244"/>
        <rect x="206.5" y="404.5" width="45" height="2.5" fill="#000" opacity=".12"/>
        <rect x="216" y="420" width="10" height="7" rx="1" fill="#f1eee4"/>
        <ellipse cx="160" cy="507" rx="66" ry="9" fill="#000" opacity=".26"/>
        <ellipse cx="66" cy="507" rx="36" ry="5.5" fill="#000" opacity=".28"/>
        <ellipse class="oy-svenSh" cx="272" cy="519" rx="38" ry="6" fill="#000" opacity=".28"/>
        <path d="M160 497 L98 502 L99 507 L160 503 Z" fill="#c3c9ce"/>
        <path d="M160 497 L222 503 L221 508 L160 503 Z" fill="#9aa1a8"/>
        <path d="M160 498 L136 520 L131 520 L156 499 Z" fill="#d9dde1"/>
        <path d="M160 498 L190 489 L194 491 L163 501 Z" fill="#8c939a"/>
        <ellipse cx="160" cy="500" rx="9" ry="4" fill="#9ca3aa"/>
        <rect x="154" y="340" width="12" height="160" fill="url(#oyChrome)"/>
        <rect x="149" y="337" width="22" height="16" rx="4" fill="#2a2e34"/>
        <ellipse cx="160" cy="334" rx="58" ry="11.5" fill="#35706a"/>
        <ellipse cx="160" cy="331" rx="58" ry="10" fill="#5b9e94"/>
        <ellipse cx="148" cy="329" rx="36" ry="4.5" fill="#fff" opacity=".13"/>
        <path d="M110 331 L138 331 L142 327 L114 327 Z" fill="#2b3a44"/><path d="M114 327 L142 327 L142.6 326 L114.6 326 Z" fill="#8aa0ad"/>
        <ellipse cx="128" cy="330" rx="8" ry="2.2" fill="#e0e0dc"/>
        <rect x="122.5" y="290" width="11" height="40" rx="5" fill="#f4f4f1"/>
        <rect x="129.5" y="292" width="4" height="36" rx="2" fill="#dcdcd7"/>
        <rect x="125.5" y="296" width="5" height="11" rx="2.2" fill="#b9a6e3"/>
        <path d="M146 318 L156 318 L155 330 L147 330 Z" fill="#f5c22f"/><ellipse cx="151" cy="318" rx="5" ry="1.4" fill="#f9d965"/>
        <g transform="translate(173 290)">
          <rect x="-2.6" y="0" width="5.2" height="4" rx="1" fill="#f4f7fb"/>
          <path d="M-2.5 4 L2.5 4 Q6 8 6 12 L6 38 Q6 40.5 3.5 40.5 L-3.5 40.5 Q-6 40.5 -6 38 L-6 12 Q-6 8 -2.5 4 Z" fill="url(#oyBot)" opacity=".95"/>
          <rect x="-6" y="20" width="12" height="7" fill="#2f74c0"/><rect x="-6" y="22" width="12" height="1.6" fill="#fff" opacity=".7"/>
          <rect x="-4" y="9" width="1.6" height="28" rx=".8" fill="#fff" opacity=".85"/>
        </g>
        <rect x="186" y="322" width="22" height="8" rx="1.5" fill="#f5f5f3"/><rect x="186" y="322" width="22" height="2.6" rx="1" fill="#7c5fd0"/>
        ${[[136, 456], [149, 458]].map(([bx, by]) => `<g transform="translate(${bx} ${by})">
          <rect x="-3" y="0" width="6" height="4.5" rx="1" fill="#e63b3b"/>
          <path d="M-2.8 4.5 L2.8 4.5 Q7 9 7 13 L7 42 Q7 44.5 4.5 44.5 L-4.5 44.5 Q-7 44.5 -7 42 L-7 13 Q-7 9 -2.8 4.5 Z" fill="url(#oyBot)" opacity=".95"/>
          <rect x="-7" y="24" width="14" height="9" fill="#e23f3f"/><rect x="-7" y="26.5" width="14" height="3" fill="#fff"/>
          <rect x="-4.6" y="11" width="1.7" height="30" rx=".8" fill="#fff" opacity=".85"/></g>`).join('')}
      </svg>`, world);
      const fronds = props.querySelectorAll('.oy-frond'), svenSh = props.querySelector('.oy-svenSh');

      /* ------------------------------------------------------------------ characters */
      const artur = ctx.char('artur', { outfit: 'ouay-collar', h: 216, x: 66, y: 508, parent: world });
      const sven = ctx.char('sven', { outfit: 'ouay', h: 228, x: 272, y: 520, parent: world });
      const card = artur.hold('R', `<g transform="rotate(-38) scale(1.2)"><g class="oy-card">
        <g transform="translate(0 -5)">
        <rect x="-21" y="-15" width="27" height="18" rx="2" fill="#fbfbf6"/>
        <rect x="-21" y="-15" width="27" height="18" rx="2" fill="none" stroke="#d8d8d0" stroke-width=".8"/>
        <rect x="-18" y="-11.5" width="15" height="2.2" rx="1.1" fill="${G}"/>
        <rect x="-18" y="-7" width="20" height="1.8" rx=".9" fill="#b9c0c7"/>
        <rect x="-18" y="-3.5" width="13" height="1.8" rx=".9" fill="#b9c0c7"/></g>
        <circle cx="0" cy="0" r="4.6" fill="${SKIN_A}"/></g></g>`).querySelector('.oy-card');
      gsap.set(artur.armR, { rotation: 38 });
      gsap.set(artur.armL, { rotation: -6 });
      gsap.set(artur.head, { rotation: 5, y: 3 });

      const bottle = sven.hold('L', `<g transform="scale(1.25)"><g class="oy-bottle">
        <rect x="-3.2" y="-24" width="6.4" height="4.6" rx="1.2" fill="#f4f7fb"/>
        <path d="M-3 -19.6 L3 -19.6 Q7.5 -15 7.5 -10 L7.5 17 Q7.5 20 4.5 20 L-4.5 20 Q-7.5 20 -7.5 17 L-7.5 -10 Q-7.5 -15 -3 -19.6 Z" fill="#d9eef9" fill-opacity=".96"/>
        <path d="M2.5 -12 L7.5 -12 L7.5 17 Q7.5 20 4.5 20 L2.5 20 Z" fill="#9fcde8" opacity=".55"/>
        <rect x="-7.5" y="-4" width="15" height="9" fill="#2f74c0"/>
        <rect x="-7.5" y="-1.6" width="15" height="2" fill="#fff" opacity=".75"/>
        <rect x="-5" y="-13" width="2.2" height="30" rx="1.1" fill="#fff" opacity=".85"/>
        <rect x="-9" y="6" width="18" height="7" rx="3.5" fill="${SKIN_S}"/>
        <path d="M-9 9.5 H9" stroke="#c98f6c" stroke-width=".8"/>
        <g transform="translate(1 -24)"><path class="oy-gl" d="${STAR}" fill="#fff"/></g>
      </g></g>`).querySelector('.oy-bottle');
      const bottleGlint = bottle.querySelector('.oy-gl');
      gsap.set(bottleGlint, { scale: 0, transformOrigin: '50% 50%' });

      /* ------------------------------------------------------------------ fx layer */
      const puffs = [[-40, 34, 24], [40, 30, 26], [0, 58, 26], [-46, -20, 26], [46, -26, 26], [-22, -62, 28], [24, -66, 28], [0, -10, 44], [-20, 22, 30], [22, 18, 30]];
      const fx = ctx.html(`<svg class="oy-layer oy-fx" viewBox="0 0 360 640" width="360" height="640" overflow="visible">
        <g class="oy-puff" transform="translate(272 384)">
          ${puffs.map(([px, py, r]) => `<g class="oy-pc"><circle cx="${px}" cy="${py}" r="${r}" fill="#d9ebe1"/><circle cx="${f1(px - r * 0.14)}" cy="${f1(py - r * 0.18)}" r="${f1(r * 0.84)}" fill="#fff"/></g>`).join('')}
          ${[0, 60, 120, 180, 240, 300].map(a => `<g transform="rotate(${a})"><g class="oy-ps" transform="translate(0 -78)"><path d="${STAR}" fill="#fff6c9" transform="scale(.7)"/></g></g>`).join('')}
        </g>
        <g transform="translate(284 258) rotate(-9)"><g class="oy-poufT">
          <text text-anchor="middle" y="9" font-family="Fredoka, sans-serif" font-weight="700" font-size="28" fill="#fff" stroke="${GD}" stroke-width="6" stroke-linejoin="round" paint-order="stroke">Pouf !</text>
        </g></g>
        <g transform="translate(298 262) rotate(10)"><g class="oy-burst">
          <polygon points="${Array.from({ length: 24 }, (_, i) => { const r = i % 2 ? 25 : 34, a = i * Math.PI / 12; return f1(Math.cos(a) * r) + ',' + f1(Math.sin(a) * r * 0.86); }).join(' ')}" fill="#ffc66e" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
          <text text-anchor="middle" y="-2" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#3a2e3f">Prix</text>
          <text text-anchor="middle" y="13" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#3a2e3f">choc !</text>
        </g></g>
        ${[[188, 350, 1, '#fff'], [214, 334, .6, '#ffe08a'], [178, 396, .65, '#ffe08a'], [196, 428, .55, '#fff'], [232, 446, .45, '#fff']]
          .map(([sx, sy, s, c]) => `<g transform="translate(${sx} ${sy}) scale(${s})"><path class="oy-sp" d="${STAR}" fill="${c}"/></g>`).join('')}
      </svg>`, world);
      const pcs = fx.querySelectorAll('.oy-pc'), pss = fx.querySelectorAll('.oy-ps'), poufT = fx.querySelector('.oy-poufT');
      const burst = fx.querySelector('.oy-burst'), sps = fx.querySelectorAll('.oy-sp');

      /* ================================================================== BEAT 1 — the logo builds itself */
      gsap.set(hL, { svgOrigin: '34 38' }); gsap.set(hR, { svgOrigin: '166 38' });
      gsap.set(bL, { svgOrigin: '34 160' }); gsap.set(bR, { svgOrigin: '166 160' });
      gsap.set(tuft, { svgOrigin: '166 26' }); gsap.set(hRw, { svgOrigin: '166 59' });
      gsap.set(lb, { svgOrigin: '80 152' });
      gsap.set([spark1, card], { transformOrigin: '50% 50%' });
      gsap.set([poufT, burst], { transformOrigin: '50% 50%' });
      gsap.set(pcs, { transformOrigin: '50% 50%' }); gsap.set(sps, { transformOrigin: '50% 50%' });
      // world starts zoomed on the banner logo (logo centre (80,152) → screen (180,262), 3.18×)
      const Z = 3.18, TX = 180 - 80 * Z, TY = 262 - 152 * Z;
      gsap.set(world, { scale: Z, x: TX, y: TY, force3D: false });
      gsap.set([back, props, url], { opacity: 0 });
      gsap.set(word, { xPercent: -50, yPercent: -50, x: 80 - 205, y: 198 - 160, scale: 0.5, transformOrigin: '50% 50%' });

      // heads pop
      tl.fromTo(hL, { scale: 0 }, { scale: 1, duration: 0.42, ease: 'back.out(3)' }, 0.8);
      tl.fromTo(hR, { scale: 0 }, { scale: 1, duration: 0.42, ease: 'back.out(3)' }, 0.95);
      ctx.sfx('pop', 0.82); ctx.sfx('pop', 0.97);
      // bodies grow from the ground
      tl.fromTo(bL, { scaleY: 0, scaleX: 0.7 }, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'back.out(1.6)' }, 1.1);
      tl.fromTo(bR, { scaleY: 0, scaleX: 0.7 }, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'back.out(1.6)' }, 1.24);
      ctx.sfx('sweep', 1.12);
      // arms reach out and join in the handshake arc
      [aL, aR].forEach((p) => {
        const L = p.getTotalLength ? p.getTotalLength() : 66;
        p.setAttribute('stroke-dasharray', `${f1(L)} ${f1(L + 40)}`);
        gsap.set(p, { opacity: 0 });
        tl.set(p, { opacity: 1 }, 1.55);
        tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.48, ease: 'power2.inOut' }, 1.55);
      });
      ctx.sfx('swoosh', 1.55);
      ctx.sfx('clink', 2.03);
      // handshake: joined arms shake, logo squashes, burst of rays + ring
      tl.to([aL, aR], { y: 5, duration: 0.11, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 2.04);
      tl.fromTo(lb, { scale: 1 }, { scale: 1.06, duration: 0.14, yoyo: true, repeat: 1, ease: 'sine.out' }, 2.03);
      gsap.set(rays, { opacity: 0 });
      tl.fromTo(rays, { opacity: 1, x: -4 }, { opacity: 0, x: 6, duration: 0.45, ease: 'power2.out', immediateRender: false }, 2.04);
      tl.fromTo(ring, { attr: { r: 56 }, opacity: 0.7 }, { attr: { r: 170 }, opacity: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, 2.04);
      gsap.set(ring, { opacity: 0 });
      // « Ouay »
      tl.fromTo(word.children, { y: 26, scale: 0.2, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(2.6)', stagger: 0.08 }, 2.35);
      ctx.sfx('chime', 2.38);
      ctx.caption('Ensuite : l’aventure <span style="color:#1f9d5b;font-weight:600">Ouay</span>.', 2.9, { pos: 'bottom', html: true, dur: 2.35 });
      // Sven's tuft sprouts on the right figure — with a wink
      tl.fromTo(tuft, { scale: 0, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.75, ease: 'elastic.out(1, 0.45)' }, 3.4);
      ctx.sfx('boing', 3.4);
      tl.to(hRw, { rotation: -14, duration: 0.22, ease: 'power2.out' }, 3.82);
      tl.to(hRw, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }, 4.25);
      tl.fromTo(spark1, { scale: 0, rotation: 0 }, { scale: 0.75, rotation: 90, duration: 0.3, ease: 'back.out(3)' }, 3.88);
      tl.to(spark1, { scale: 0, rotation: 180, duration: 0.3, ease: 'power2.in' }, 4.35);
      ctx.sfx('tick', 3.9);
      // left figure does a little double-take
      tl.to(hL, { y: -10, duration: 0.16, ease: 'power2.out' }, 4.45);
      tl.to(hL, { y: 0, duration: 0.3, ease: 'bounce.out' }, 4.61);
      tl.to(lb, { scale: 1.025, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 4.4);

      /* ================================================================== BEAT 2 — pull back to the booth */
      ctx.beat(5.25);
      tl.to(world, { scale: 1, x: 0, y: 0, duration: 1.65, ease: 'power3.inOut', force3D: false }, 5.3);
      // « Ouay » slides out to the right first, then up next to the logo (never crosses the figures)
      // (x leads, y dips first then rises; timings checked so it stays on screen during the zoom)
      tl.to(word, { x: 0, duration: 1.6, ease: 'power3.inOut' }, 5.3);
      tl.to(word, { y: 0, duration: 1.55, ease: 'back.inOut(2.2)' }, 5.4);
      tl.to(word, { scale: 1, duration: 1.5, ease: 'power3.inOut' }, 5.45);
      tl.to(back, { opacity: 1, duration: 0.45, ease: 'sine.out' }, 5.3);
      tl.to(props, { opacity: 1, duration: 0.3 }, 5.5);
      tl.to(url, { opacity: 1, duration: 0.5 }, 6.5);
      tl.set(flood, { opacity: 0 }, 5.9);
      ctx.sfx('whoosh', 5.3);
      ctx.backdrop('#42a670', '#3a3d42', 5.6);

      // Artur reads his pitch card (little nods, card bumps as the jargon escapes)
      tl.to(artur.head, { rotation: 2, y: 4, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 6.3);

      // « Pouf » — Sven appears inside a little cloud
      gsap.set(pcs, { opacity: 0 });
      tl.fromTo(pcs, { scale: 0.1, opacity: 1 }, { scale: 1, duration: 0.24, ease: 'back.out(1.8)', stagger: 0.015, immediateRender: false }, 6.98);
      tl.to(pcs, { scale: 1.35, opacity: 0, duration: 0.5, ease: 'power1.in', stagger: 0.02 }, 7.28);
      gsap.set(pss, { opacity: 0 });
      tl.fromTo(pss, { opacity: 1, y: 30, scale: 0.4 }, { y: -8, scale: 1, duration: 0.35, ease: 'power2.out', immediateRender: false }, 7.05);
      tl.to(pss, { opacity: 0, y: -18, duration: 0.3 }, 7.4);
      tl.fromTo(poufT, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(3)' }, 7.02);
      tl.to(poufT, { scale: 1.15, opacity: 0, y: -10, duration: 0.3 }, 7.85);
      tl.fromTo(sven.el, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.42, ease: 'back.out(2)' }, 7.12);
      tl.fromTo(svenSh, { opacity: 0 }, { opacity: 0.28, duration: 0.3 }, 7.2);
      ctx.sfx('magic', 6.98); ctx.sfx('pop', 7.02);

      // TV-shopping: anticipation, bottle up next to the smile, other arm opens wide « ta-da »
      gsap.set(bottle, { transformOrigin: '50% 50%' });
      tl.to(sven.armL, { rotation: -14, duration: 0.16, ease: 'power2.out' }, 7.55);
      tl.to(bottle, { rotation: 14, duration: 0.16, ease: 'power2.out' }, 7.55);
      tl.to(sven.armL, { rotation: 142, duration: 0.46, ease: 'back.out(1.7)' }, 7.71);
      tl.to(bottle, { rotation: -135, duration: 0.46, ease: 'back.out(1.7)' }, 7.71);
      tl.to(sven.armR, { rotation: 12, duration: 0.15, ease: 'power2.out' }, 7.84);
      tl.to(sven.armR, { rotation: -88, duration: 0.28, ease: 'power3.out' }, 7.99);
      tl.to(sven.armR, { rotation: -60, duration: 0.42, ease: 'back.out(2)' }, 8.27);
      tl.to(sven.el, { rotation: -3, duration: 0.3, ease: 'sine.out' }, 7.9);
      tl.to(sven.head, { rotation: -8, duration: 0.3, ease: 'sine.out' }, 7.9);
      sven.hop(8.12, 12);
      // ding! sparkles + glint + « Prix choc ! »
      ctx.sfx('ding', 8.2);
      gsap.set(sps, { opacity: 0 });
      sps.forEach((sp, i) => {
        const t = 8.2 + i * 0.07;
        tl.fromTo(sp, { scale: 0, rotation: -45, opacity: 1 }, { scale: 1, rotation: 0, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, t);
        tl.to(sp, { scale: 0.45, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 0.6 + (i % 3) * 0.17);
        tl.to(sp, { scale: 0, opacity: 0, duration: 0.3 }, 12.9 + i * 0.05);
      });
      tl.fromTo(bottleGlint, { scale: 0, rotation: 0, opacity: 1 }, { scale: 1.3, rotation: 120, duration: 0.3, ease: 'back.out(2)' }, 8.2);
      tl.to(bottleGlint, { scale: 0, rotation: 200, duration: 0.3, ease: 'power2.in' }, 8.55);
      tl.fromTo(burst, { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.4)' }, 8.3);
      tl.to(burst, { scale: 1.08, duration: 0.35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 8.8);
      tl.to(burst, { scale: 0, rotation: 25, duration: 0.3, ease: 'back.in(2)' }, 13.4);
      ctx.sfx('pop', 8.3);

      ctx.caption('Toi, au stand : tu aurais vendu de l’eau à un poisson.', 8.75, { pos: 'bottom', dur: 5.15 });

      // Sven stays in character: bottle wiggles, a cheeky head tilt, a little hop
      tl.to(bottle, { rotation: -145, duration: 0.22, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 9.3);
      tl.to(sven.head, { rotation: 3, duration: 0.35, ease: 'sine.inOut' }, 10.6);
      tl.to(sven.head, { rotation: -7, duration: 0.4, ease: 'sine.inOut' }, 11.6);
      tl.to(sven.armR, { rotation: -76, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 10.9);
      sven.hop(12.3, 9);
      tl.to(bottle, { rotation: -125, duration: 0.2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 12.3);

      // Jargon bubbles escaping from Artur's pitch card (tap → pop early)
      const JARGON = [
        { w: 'Synergie', t: 7.8, dx: -24, dy: -62, sway: 12 },
        { w: 'Pivot', t: 8.6, dx: 78, dy: -50, sway: -10 },
        { w: 'MVP', t: 9.45, dx: -8, dy: -84, sway: 10 },
        { w: 'Scale-up', t: 10.45, dx: 66, dy: -50, sway: -12 },
      ];
      const START = { x: 78, y: 302 };
      JARGON.forEach((j, k) => {
        const wrap = ctx.html(`<div class="oy-jb" style="left:${START.x}px;top:${START.y}px"><div class="oy-jb-in">${j.w}</div>
          <div class="oy-drops">${'<i></i>'.repeat(7)}</div><div class="oy-drops oy-tapdrops">${'<i></i>'.repeat(7)}</div></div>`, world);
        const inner = wrap.querySelector('.oy-jb-in');
        const drops = wrap.querySelectorAll('.oy-drops:not(.oy-tapdrops) i'), tapDrops = wrap.querySelectorAll('.oy-tapdrops i');
        const dropsBox = wrap.querySelector('.oy-drops');
        // not tappable while hidden (it would swallow taps meant for the story)
        gsap.set(wrap, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.2, pointerEvents: 'none' });
        tl.set(wrap, { pointerEvents: 'auto' }, j.t);
        gsap.set([drops, tapDrops], { opacity: 0 });
        const life = 1.9, tp = j.t + life;
        const dirs = Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 + k; return [Math.cos(a) * 34, Math.sin(a) * 22]; });
        tl.to(wrap, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, j.t);
        tl.to(wrap, { y: j.dy, duration: life, ease: 'power1.out' }, j.t);
        tl.to(wrap, { x: j.dx, duration: life, ease: 'sine.inOut' }, j.t);
        tl.to(wrap, { rotation: j.sway * 0.35, duration: life / 3, yoyo: true, repeat: 2, ease: 'sine.inOut' }, j.t);
        tl.to(card, { scale: 1.18, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, j.t - 0.05);
        tl.to(artur.head, { y: 1, rotation: 3, duration: 0.15, yoyo: true, repeat: 1, ease: 'sine.inOut' }, j.t - 0.1);
        ctx.sfx('tick', j.t);
        // scheduled pop
        tl.to(inner, { scale: 1.5, opacity: 0, duration: 0.16, ease: 'power2.out' }, tp);
        tl.set(drops, { opacity: 1 }, tp);
        tl.to(drops, { x: (i) => dirs[i][0], y: (i) => dirs[i][1], opacity: 0, scale: 0.4, duration: 0.42, ease: 'power2.out' }, tp);
        tl.set(wrap, { pointerEvents: 'none' }, tp);
        tl.call(() => { if (!ctx.seeking && !ctx.still && !wrap._popped) Sound.play('pop'); }, null, tp);
        // tapped early
        ctx.interactive(wrap);
        ctx.on(wrap, 'pointerdown', (e) => {
          e.stopPropagation();
          if (wrap._popped) return;
          wrap._popped = true;
          dropsBox.style.visibility = 'hidden';
          gsap.to(inner, { scale: 1.5, opacity: 0, duration: 0.16, ease: 'power2.out' });
          gsap.fromTo(tapDrops, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: (i) => dirs[i][0], y: (i) => dirs[i][1], opacity: 0, scale: 0.4, duration: 0.42, ease: 'power2.out' });
          // keep it as the pointerup target (so the tap does not also skip ahead), then let taps through
          ctx.timeout(() => { wrap.style.pointerEvents = 'none'; }, 450);
          Sound.play('pop');
        });
      });

      // Artur finally looks up at Sven — impressed
      tl.to(artur.head, { rotation: 9, y: 0, duration: 0.35, ease: 'back.out(2)' }, 12.95);
      artur.emote(13.05, '!', 1.0);

      // plant breathes a little (ambient)
      if (!ctx.still) fronds.forEach((fr, i) => ctx.loop(gsap.to(fr, { rotation: (i % 2 ? 1.6 : -1.6), svgOrigin: '229 402', duration: 2.2 + (i % 3) * 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' })));

      /* ================================================================== photo 3 */
      ctx.beat(14.3);
      ctx.backdrop('#0b0a0d', '#0b0a0d', 14.35);
      const ph = ctx.photo(3, 14.35, { caption: 'L’équipe Ouay, en vert de la tête aux pieds.' });
      // keep the timeline running a hair past the hold: a pause placed exactly at the end of a GSAP
      // timeline also fires onComplete, which would skip straight to the next scene
      tl.set(ph.el, { opacity: 1 }, ph.end + 0.25);
      // the (still transparent) viewer sits on top from the start: let taps reach the jargon bubbles
      ph.el.style.pointerEvents = 'none';
    },
  });
})();
;

/* ===== js/scenes/06-curling.js ===== */
/* Scène 6 — « curling » : le team building Ouay, curling à Lausanne (photos 4 et 5)
 * Givre qui envahit l'écran → piste de curling en perspective → Sven lance (glisser vers le haut)
 * → la caméra suit la pierre → on frotte (taper vite) → la pierre s'arrête pile sur le bouton
 * → la caméra recule : Sven fête ça → photos 4 et 5.
 */
(function () {
  'use strict';

  /* ---------- perspective of the sheet: metres → world px ---------- */
  const VX = 180, YH = -260, Z0 = 14, PXM = 84.2, SPAN = 640 - YH;
  const HALF = 2.375;               // half sheet width (m)
  const ZT = 11.45;                 // tee = house centre
  const ZBACK = ZT + 1.83;          // back line
  const ZEND = ZT + 3.4;            // end boards
  const ZHOG = ZT - 6.4;            // hog line
  const NEXT = 2 * HALF + 0.24;     // centre of the neighbouring sheets
  const sOf = (z) => Z0 / (z + Z0);
  const P = (x, z) => { const s = sOf(z); return [VX + x * PXM * s, YH + SPAN * s]; };
  const f1 = (n) => Math.round(n * 10) / 10;
  const poly = (arr) => arr.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ');
  const quad = (x0, x1, z0, z1) => poly([P(x0, z0), P(x1, z0), P(x1, z1), P(x0, z1)]);
  function ringPath(cx, cz, r) {
    let d = '';
    for (let i = 0; i < 72; i++) {
      const t = i / 72 * Math.PI * 2, p = P(cx + r * Math.cos(t), cz + r * Math.sin(t));
      d += (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]);
    }
    return d + 'Z';
  }
  // Cubic Hermite 0→1 with start slope a and end slope b (normalised velocities)
  const herm = (t, a, b) => (-2 * t * t * t + 3 * t * t) + a * (t * t * t - 2 * t * t + t) + b * (t * t * t - t * t);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ---------- the stone starts right under Sven's reaching hand ---------- */
  const STONE_X0 = 161, STONE_Y0 = 572;
  const S_START = (STONE_Y0 - YH) / SPAN;
  const ZS = Z0 / S_START - Z0;
  const X0M = (STONE_X0 - VX) / (PXM * S_START);
  const TEE_Y = P(0, ZT)[1];

  /* ---------- timing ---------- */
  const T1 = 5.0;                   // wait: swipe to launch
  const A0 = T1 + 0.32, DUR_A = 2.8, P_A = 0.42, A_START = 2.2, B_END = 0.2;
  const T2 = A0 + DUR_A + 0.02;     // wait: sweep (stone mid-sheet, slowing down)
  const B0 = T2 + 0.02, DUR_B = 2.6;
  const TL = B0 + DUR_B;            // the stone stops on the button
  const ZO = TL + 0.85;             // camera pulls back to show the celebration
  const PH4 = TL + 3.0, PH5 = PH4 + 2.25;
  const V_END_A = B_END * P_A / DUR_A;   // stone speed at the end of the launch (p / s)
  const V_MIN = 0.01, V_MAX = 0.09, V_TAP = 0.012, V_DECAY = 0.03;
  const P_CAP = 0.78;                    // sweeping can push the stone this far before the final glide
  const ROT_A = 50, ROT_END = 130, ROT0 = -80;
  // brooms (runner-local coords: pad centre, handle end)
  const BL = [-15, -41, -54, -106], BR = [19, -52, 60, -116];

  /* ---------- camera ---------- */
  const CAM_Y = 258;                // screen y of the tee when zoomed in
  const cam = (z) => ({ x: VX - z * VX, y: CAM_Y - z * TEE_Y, scale: z });
  const NEAR_OUT = { x: -140, y: -70, scale: 1.8 };   // foreground (Sven) leaves the frame faster

  /* ---------- Sven's delivery pose ---------- */
  const SVX = 72, SVY = 594;
  const POSE = { rot: 10, y: 17, armR: -88, armL: 25 };

  Story.register({
    id: 'curling', order: 6, title: 'Curling', photos: [4, 5], skippable: true,
    bg: '#e4edf4', music: 'normal', darkUI: false,

    build(ctx) {
      const tl = ctx.tl, R = ctx.rand;
      const SC = '#stage[data-scene="curling"]';

      ctx.backdrop('#101827', '#101827');
      ctx.backdrop('#d9e9f3', '#d9e9f3', 0.9);
      ctx.backdrop('#2e211d', '#f6fafc', 1.9);

      ctx.html(`<style>
        ${SC} .cu-abs { position:absolute; left:0; top:0; }
        ${SC} .cu-cam { position:absolute; inset:0; z-index:1; }
        ${SC} .cu-world { position:absolute; inset:0; z-index:1; transform-origin:0 0; }
        ${SC} .cu-near { position:absolute; inset:0; z-index:5; transform-origin:0 0; pointer-events:none; }
        ${SC} .cu-hall { position:absolute; inset:0; z-index:1; }
        ${SC} .cu-skip { position:absolute; left:140px; top:112px; width:80px; height:90px; z-index:2; }
        ${SC} .cu-runner { position:absolute; left:0; top:0; width:0; height:0; z-index:4; transform-origin:0 0; }
        ${SC} .cu-runner svg { position:absolute; left:-110px; top:-180px; width:220px; height:220px; overflow:visible; }
        ${SC} .cu-fx { position:absolute; inset:0; z-index:6; pointer-events:none; }
        ${SC} .cu-shadow { position:absolute; left:-60px; top:-9px; width:120px; height:18px; border-radius:50%;
          background: radial-gradient(closest-side, rgba(48,78,110,.34), rgba(48,78,110,.16) 60%, rgba(48,78,110,0)); }
        ${SC} .cu-dark { position:absolute; inset:0; z-index:24; background:#101827; pointer-events:none; }
        ${SC} .cu-fill { position:absolute; inset:0; z-index:25; pointer-events:none; --h:100;
          background: radial-gradient(ellipse at 50% 45%, #f8fcff 0%, #e6f2fa 55%, #cbe3f2 100%);
          -webkit-mask-image: radial-gradient(ellipse farthest-corner at 50% 50%, transparent calc(var(--h) * 1%), #000 calc(var(--h) * 1% + 15%));
                  mask-image: radial-gradient(ellipse farthest-corner at 50% 50%, transparent calc(var(--h) * 1%), #000 calc(var(--h) * 1% + 15%)); }
        ${SC} .cu-frost { position:absolute; inset:0; z-index:26; pointer-events:none; overflow:visible; }
        ${SC} .cu-catch { position:absolute; inset:0; z-index:27; pointer-events:none; touch-action:none; }
        ${SC} .cu-bub { position:absolute; left:209px; top:96px; z-index:8; background:#fff; color:var(--plum);
          font:700 16px/1 var(--font-display); padding:8px 13px; border-radius:14px; box-shadow:0 4px 12px rgba(30,20,40,.22);
          transform-origin:0% 60%; white-space:nowrap; }
        ${SC} .cu-bub::after { content:""; position:absolute; left:-9px; top:50%; margin-top:-2px; border-style:solid; border-width:3px 10px 6px 0;
          border-color:transparent #fff transparent transparent; }
        ${SC} .cu-count { position:absolute; left:236px; top:520px; width:108px; z-index:9; text-align:center; pointer-events:none; transform-origin:50% 60%; }
        ${SC} .cu-count small { display:block; font:700 18px/1 var(--font-hand); color:var(--plum); margin-bottom:4px; text-shadow:0 1px 0 #fff, 0 0 6px #fff; }
        ${SC} .cu-count b { display:inline-block; font:700 28px/1 var(--font-display); color:#fff; background:var(--plum);
          padding:6px 14px 7px; border-radius:999px; box-shadow:0 5px 14px rgba(30,15,35,.3); transform:rotate(-4deg); }
      </style>`);

      /* =========================================================
         CAMERA RIG: cam (shake) > world (zoom) + near (foreground)
         ========================================================= */
      const camEl = ctx.html('<div class="cu-cam"></div>');
      const world = ctx.html('<div class="cu-world"></div>', camEl);
      const near = ctx.html('<div class="cu-near"></div>', camEl);
      gsap.set([world, near], { transformOrigin: '0 0', x: 0, y: 0, scale: 1 });

      /* =========================================================
         HALL + SHEET (one SVG)
         ========================================================= */
      // pebble dots (seeded)
      let peb = '';
      for (let i = 0; i < 14; i++) {
        peb += `<circle cx="${f1(R() * 26)}" cy="${f1(R() * 26)}" r="${f1(0.4 + R() * 0.6)}" fill="${R() < 0.45 ? '#c9d7e3' : '#ffffff'}"/>`;
      }
      // spectators behind the glass
      let crowd = '';
      [[42, 0.9], [58, 1], [156, 0.85], [214, 1], [256, 0.92], [281, 1.05], [318, 0.9]].forEach(([x, k]) => {
        crowd += `<g transform="translate(${x} 162) scale(${k})" fill="#10151f" opacity=".75"><g class="cu-fan"><circle cx="0" cy="-27" r="6.5"/><path d="M-11 2 Q-11 -18 0 -19 Q11 -18 11 2 Z"/></g></g>`;
      });
      // wooden ceiling rafters converging to the vanishing point
      let rafters = '';
      [-80, 20, 120, 240, 340, 440].forEach(xb => {
        const xt = VX + (xb - VX) * (0 - YH) / (46 - YH);
        rafters += `<path d="M${f1(xt - 5)} 0 L${f1(xt + 5)} 0 L${xb + 6} 46 L${xb - 6} 46 Z" fill="#6e4130"/>`;
      });
      // lane dividers & neighbouring houses
      const dividers = [-1, 1].map(sg => `<polygon points="${quad(sg * (HALF + 0.06), sg * (HALF + 0.18), -1.2, ZEND)}" fill="#34497a"/>
        <polygon points="${quad(sg * (HALF + 0.06), sg * (HALF + 0.1), -1.2, ZEND)}" fill="#6f86b8"/>`).join('');
      const house = (cx) => `
        <path d="${ringPath(cx, ZT, 1.83)}" fill="#2a6fd6"/>
        <path d="${ringPath(cx, ZT, 1.22)}" fill="#fbfdff"/>
        <path d="${ringPath(cx, ZT, 0.78)}" fill="#e5383b"/>
        <path d="${ringPath(cx, ZT, 0.36)}" fill="#fbfdff"/>`;
      const line = (z, w, col, op) => `<polygon points="${quad(-8, 8, z - w / 2, z + w / 2)}" fill="${col}" opacity="${op || 1}"/>`;
      const cline = (x) => `<polygon points="${quad(x - 0.012, x + 0.012, -1.2, ZBACK)}" fill="#47587a" opacity=".55"/>`;

      const hall = ctx.html(`
<svg class="cu-hall" viewBox="0 0 360 640" aria-hidden="true">
  <defs>
    <linearGradient id="cu-ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d19"/><stop offset="1" stop-color="#4a3127"/></linearGradient>
    <linearGradient id="cu-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b06a43"/><stop offset=".25" stop-color="#94573a"/><stop offset="1" stop-color="#6d3f2a"/></linearGradient>
    <linearGradient id="cu-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2ece5"/><stop offset="1" stop-color="#e2d9cf"/></linearGradient>
    <linearGradient id="cu-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34405c"/><stop offset="1" stop-color="#1c2234"/></linearGradient>
    <linearGradient id="cu-pillar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a83e2b"/><stop offset=".45" stop-color="#e06a4b"/><stop offset="1" stop-color="#b4442f"/></linearGradient>
    <linearGradient id="cu-ice" x1="0" y1="177" x2="0" y2="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#d6e3ee"/><stop offset=".35" stop-color="#e9f1f7"/><stop offset="1" stop-color="#f7fbfd"/></linearGradient>
    <linearGradient id="cu-shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="cu-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd3e6"/><stop offset="1" stop-color="#eaf1f7"/></linearGradient>
    <linearGradient id="cu-trail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6ea" stop-opacity=".7"/><stop offset=".5" stop-color="#d4e6f3" stop-opacity=".45"/><stop offset="1" stop-color="#e3eff8" stop-opacity="0"/></linearGradient>
    <pattern id="cu-peb" width="26" height="26" patternUnits="userSpaceOnUse">${peb}</pattern>
  </defs>

  <!-- ceiling + wood -->
  <rect x="0" y="0" width="360" height="48" fill="url(#cu-ceil)"/>
  ${rafters}
  <rect x="0" y="10" width="360" height="5" fill="#7c4a33"/><rect x="0" y="10" width="360" height="1.5" fill="#a5663f"/>
  <g fill="#fff6d8"><rect x="58" y="24" width="56" height="5" rx="2.5"/><rect x="152" y="24" width="56" height="5" rx="2.5"/><rect x="246" y="24" width="56" height="5" rx="2.5"/></g>
  <g fill="#ffe9b0" opacity=".22"><ellipse cx="86" cy="27" rx="40" ry="9"/><ellipse cx="180" cy="27" rx="40" ry="9"/><ellipse cx="274" cy="27" rx="40" ry="9"/></g>
  <rect x="0" y="44" width="360" height="17" fill="url(#cu-beam)"/>
  <g fill="#fbf7f2">${[40, 92, 144, 196, 248, 300].map(x => `<rect x="${x}" y="48" width="34" height="9" rx="1.5"/><rect x="${x + 5}" y="51.5" width="${12 + (x % 3) * 4}" height="2" fill="#d2453a"/>`).join('')}</g>

  <!-- back wall -->
  <rect x="0" y="61" width="360" height="116" fill="url(#cu-wall)"/>
  <!-- panorama poster: snowy Lausanne, cathedral, lake, Alps -->
  <g>
    <rect x="62" y="66" width="236" height="40" rx="2" fill="#5b5a60"/>
    <rect x="64" y="68" width="232" height="36" fill="url(#cu-sky)"/>
    <path d="M64 92 L92 80 L108 86 L128 76 L150 86 L170 79 L196 88 L222 78 L246 86 L268 80 L296 89 L296 96 L64 96 Z" fill="#dfe8f1"/>
    <path d="M92 80 L99 83 L95 84 Z M128 76 L136 80 L131 81 Z M222 78 L230 82 L225 83 Z" fill="#ffffff"/>
    <rect x="64" y="94" width="232" height="4" fill="#8fb0c9"/>
    <path d="M64 104 L64 98 L76 96 L84 99 L96 95 L110 98 L118 94 L132 97 L146 92 L160 95 L168 90 L176 92 L176 84 L180 74 L184 84 L184 92 L196 94 L206 91 L222 96 L238 93 L252 97 L266 94 L282 98 L296 96 L296 104 Z" fill="#f6f7f9"/>
    <path d="M168 104 L168 92 L176 92 L176 84 L180 74 L184 84 L184 92 L194 94 L194 104 Z" fill="#c9ccd3"/>
    <path d="M176 84 L180 74 L184 84 Z" fill="#8c93a0"/>
    <g fill="#6f7584">${[78, 92, 104, 122, 138, 152, 204, 218, 232, 248, 262, 278].map((x, i) => `<rect x="${x}" y="${99 + (i % 3)}" width="2.2" height="2.2"/>`).join('')}</g>
  </g>
  <!-- glass band with spectators -->
  <rect x="0" y="110" width="360" height="52" fill="url(#cu-glass)"/>
  <g fill="#ffd9a0" opacity=".55"><circle cx="70" cy="118" r="2"/><circle cx="132" cy="117" r="2"/><circle cx="196" cy="118" r="2"/><circle cx="252" cy="117" r="2"/><circle cx="318" cy="118" r="2"/></g>
  ${crowd}
  <g fill="#fff" opacity=".07"><path d="M40 110 L70 110 L30 162 L0 162 Z"/><path d="M210 110 L228 110 L190 162 L172 162 Z"/></g>
  <g fill="#d8d0c6">${[60, 120, 180, 240, 300].map(x => `<rect x="${x - 1.5}" y="110" width="3" height="52"/>`).join('')}<rect x="0" y="108" width="360" height="3"/></g>
  <!-- scoreboard -->
  <g>
    <rect x="66" y="116" width="78" height="34" rx="4" fill="#15161b" stroke="#3a3b42" stroke-width="1.5"/>
    <text x="76" y="138" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="13" fill="#ffc66e" letter-spacing="1">OUAY</text>
    <text x="130" y="141" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="20" fill="#2b2c33">8</text>
    <g class="cu-s0"><text x="130" y="141" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="20" fill="#ff5a4f">0</text></g>
    <g class="cu-s1"><text x="130" y="141" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-weight="600" font-size="20" fill="#ff5a4f">1</text></g>
  </g>
  <!-- red pillars -->
  <rect x="8" y="0" width="18" height="177" fill="url(#cu-pillar)"/><rect x="334" y="0" width="18" height="177" fill="url(#cu-pillar)"/>
  <!-- end boards -->
  <rect x="0" y="160" width="360" height="7" fill="#fbfcfd"/>
  <rect x="0" y="166" width="360" height="5" fill="#2b5fb3"/>
  <rect x="0" y="171" width="360" height="6" fill="#e6ecf2"/>

  <!-- ice -->
  <rect x="0" y="177" width="360" height="463" fill="url(#cu-ice)"/>
  <rect x="0" y="177" width="360" height="6" fill="#1b2a44" opacity=".08"/>
  ${house(-NEXT)}${house(NEXT)}${house(0)}
  <!-- team logo painted under the ice -->
  <image href="img/p4-ouay-logo.png" x="${f1(VX - 44)}" y="${f1(P(0, 6.6)[1] - 19)}" width="88" height="38" preserveAspectRatio="none" opacity=".42"/>
  ${line(ZHOG, 0.12, '#e0393b')}
  ${line(ZT, 0.03, '#e0393b', 0.9)}
  ${line(ZBACK, 0.03, '#3b4a6b', 0.7)}
  ${cline(0)}${cline(-NEXT)}${cline(NEXT)}
  ${dividers}
  <!-- frosted film + pebble -->
  <rect x="0" y="177" width="360" height="463" fill="#fff" opacity=".1"/>
  <rect x="0" y="177" width="360" height="463" fill="url(#cu-peb)" opacity=".45"/>
  <!-- reflections of the ceiling lights -->
  <g opacity=".55"><polygon points="${quad(-1.05, -0.65, 6, ZEND)}" fill="url(#cu-shine)"/><polygon points="${quad(0.65, 1.05, 6, ZEND)}" fill="url(#cu-shine)"/></g>
  <!-- glints on the ice -->
  <g class="cu-glints" fill="#ffffff">${[[64, 318], [296, 292], [262, 520], [112, 236], [318, 448], [40, 470]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0 -5 Q.8 -.8 5 0 Q.8 .8 0 5 Q-.8 .8 -5 0 Q-.8 -.8 0 -5 Z"/>`).join('')}</g>
  <!-- the swept trail (updated live) -->
  <polygon class="cu-trail" points="0,0 0,0 0,0 0,0" fill="url(#cu-trail)" opacity="0"/>
</svg>`, world);
      const trail = hall.querySelector('.cu-trail');
      // ambient life: glints twinkling on the ice
      hall.querySelectorAll('.cu-glints path').forEach((g, i) => {
        gsap.set(g, { transformOrigin: '50% 50%', scale: 0 });
        ctx.loop(gsap.to(g, { scale: 1, rotation: 45, duration: 0.5, yoyo: true, repeat: -1, repeatDelay: 1.4 + R() * 2.2, delay: i * 0.45, ease: 'sine.inOut' }));
      });
      const s0 = hall.querySelector('.cu-s0'), s1 = hall.querySelector('.cu-s1');
      gsap.set([s0, s1], { svgOrigin: '130 134' });
      tl.set(s1, { scaleY: 0 }, 0);

      /* =========================================================
         THE SKIP (drawn teammate behind the house)
         ========================================================= */
      const skip = ctx.html(`
<div class="cu-skip"><svg viewBox="-40 -80 80 90" width="80" height="90" overflow="visible" aria-hidden="true">
  <ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#6d86a3" opacity=".3"/>
  <g class="sk-body">
    <rect x="-9" y="-26" width="7.5" height="26" rx="3" fill="#cdb78b"/><rect x="1.5" y="-26" width="7.5" height="26" rx="3" fill="#c2ab7f"/>
    <ellipse cx="-5.5" cy="-1" rx="6" ry="3" fill="#8c2b2f"/><ellipse cx="5.5" cy="-1" rx="6" ry="3" fill="#8c2b2f"/>
    <path d="M-14 -50 Q0 -56 14 -50 L15 -24 Q0 -20 -15 -24 Z" fill="#2c2d33"/>
    <g fill="none" stroke="#3fae6a" stroke-width="1" stroke-linecap="round" opacity=".85"><path d="M4 -44 h6"/><path d="M4 -41 h4.5"/><path d="M4 -38 h6.5"/></g>
    <g class="sk-armL"><rect x="-19" y="-50" width="7" height="22" rx="3.5" fill="#2c2d33"/><circle cx="-15.5" cy="-28" r="3.6" fill="#f0c4a2"/></g>
    <g class="sk-armR">
      <line x1="16" y1="-60" x2="10" y2="6" stroke="#1d1e23" stroke-width="2.4" stroke-linecap="round"/>
      <line x1="15.2" y1="-52" x2="16" y2="-60" stroke="#e2463c" stroke-width="2.8" stroke-linecap="round"/>
      <rect x="1" y="4" width="18" height="5" rx="2" fill="#d63b35"/><rect x="1" y="7" width="18" height="2.5" rx="1" fill="#2a2b31"/>
      <rect x="12" y="-50" width="7" height="22" rx="3.5" fill="#2c2d33" transform="rotate(-8 15 -50)"/><circle cx="14" cy="-30" r="3.6" fill="#f0c4a2"/>
    </g>
    <path d="M-9 -53 Q0 -47 9 -53 L9 -49 Q0 -44 -9 -49 Z" fill="#8f957f"/>
    <g class="sk-head">
      <circle cx="0" cy="-64" r="11.5" fill="#f0c4a2"/>
      <path d="M-12 -64 Q-12 -79 0 -79 Q12 -79 12 -64 Z" fill="#26375f"/>
      <rect x="-12.5" y="-67" width="25" height="5" rx="2.5" fill="#1e2d50"/>
      <g fill="none" stroke="#2a2a30" stroke-width="1.1"><circle cx="-4.3" cy="-58.5" r="3"/><circle cx="4.3" cy="-58.5" r="3"/><path d="M-1.3 -58.5 L1.3 -58.5"/></g>
      <circle cx="-4.3" cy="-58.5" r="1" fill="#2a2a30"/><circle cx="4.3" cy="-58.5" r="1" fill="#2a2a30"/>
      <path class="sk-mouth" d="M-3.5 -53.5 Q0 -50.5 3.5 -53.5" fill="none" stroke="#7a3a2c" stroke-width="1.3" stroke-linecap="round"/>
      <ellipse class="sk-shout" cx="0" cy="-52.6" rx="2.6" ry="2.2" fill="#7a3a2c" opacity="0"/>
      <ellipse cx="-8" cy="-55" rx="2.2" ry="1.3" fill="#f39a92" opacity=".55"/><ellipse cx="8" cy="-55" rx="2.2" ry="1.3" fill="#f39a92" opacity=".55"/>
    </g>
  </g>
</svg></div>`, world);
      const skBody = skip.querySelector('.sk-body'), skArmR = skip.querySelector('.sk-armR'), skArmL = skip.querySelector('.sk-armL');
      const skMouth = skip.querySelector('.sk-mouth'), skShout = skip.querySelector('.sk-shout');
      gsap.set(skArmR, { svgOrigin: '15 -48' });
      gsap.set(skArmL, { svgOrigin: '-15 -48' });
      ctx.loop(gsap.to(skip, { y: -1.5, duration: 0.55, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      // « Frottez !! » lives in screen space (the skip is framed by the zoomed camera when he shouts)
      const skBub = ctx.html('<div class="cu-bub">Frottez !!</div>');
      tl.set(skBub, { opacity: 0 }, 0);

      /* =========================================================
         THE RUNNER (stone + brooms) — positioned by render()
         ========================================================= */
      let speck = '';
      for (let i = 0; i < 26; i++) {
        const a = R() * Math.PI * 2, r = Math.sqrt(R());
        speck += `<circle cx="${f1(Math.cos(a) * r * 27)}" cy="${f1(-14 + Math.sin(a) * r * 10)}" r="${f1(0.6 + R() * 0.9)}" fill="${['#6c7178', '#d9dde1', '#575c63', '#b9bec4'][i % 4]}"/>`;
      }
      const broom = (cls, px, py, hx, hy) => `
        <g class="${cls}"><g class="${cls}-in">
          <line x1="${px}" y1="${py - 4}" x2="${hx}" y2="${hy}" stroke="#1c1d22" stroke-width="4.4" stroke-linecap="round"/>
          <line x1="${f1(px + (hx - px) * 0.8)}" y1="${f1(py - 4 + (hy - py + 4) * 0.8)}" x2="${hx}" y2="${hy}" stroke="#e2463c" stroke-width="5.2" stroke-linecap="round"/>
          <circle cx="${hx}" cy="${hy}" r="2.8" fill="#f4f4f4"/>
          <rect x="${px - 6}" y="${py - 9}" width="12" height="6" rx="2" fill="#2a2b31"/>
          <rect x="${px - 20}" y="${py - 6}" width="40" height="7" rx="3" fill="#d63b35"/>
          <rect x="${px - 20}" y="${py}" width="40" height="5" rx="2.2" fill="#2a2b31"/>
          <rect x="${px - 16}" y="${py - 4.6}" width="18" height="1.8" rx=".9" fill="#ff8f80" opacity=".85"/>
        </g></g>`;
      const runner = ctx.html(`
<div class="cu-runner"><svg viewBox="-110 -180 220 220" aria-hidden="true">
  <defs>
    <linearGradient id="cu-gside" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a4f57"/><stop offset=".32" stop-color="#858b94"/><stop offset=".7" stop-color="#5e636b"/><stop offset="1" stop-color="#43474e"/></linearGradient>
    <radialGradient id="cu-gtop" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#c3c8ce"/><stop offset="1" stop-color="#868c94"/></radialGradient>
  </defs>
  <g class="cu-puffs"></g>
  ${broom('cu-bL', BL[0], BL[1], BL[2], BL[3])}
  ${broom('cu-bR', BR[0], BR[1], BR[2], BR[3])}
  <g class="cu-stone">
    <ellipse cx="0" cy="1" rx="34" ry="10" fill="#5f7c9b" opacity=".28"/>
    <path d="M-31 -14 L-31 -7 A31 12 0 0 0 31 -7 L31 -14 Z" fill="url(#cu-gside)"/>
    <path d="M-30.5 -10.5 A31 12 0 0 0 30.5 -10.5" fill="none" stroke="#9aa0a8" stroke-width="2.2"/>
    <ellipse cx="0" cy="-14" rx="31" ry="12" fill="url(#cu-gtop)"/>
    ${speck}
    <path d="M-27 -19.5 A31 12 0 0 1 27 -19.5" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>
    <ellipse cx="0" cy="-15" rx="12.5" ry="5" fill="#d29b00"/>
    <ellipse cx="0" cy="-16.3" rx="11.5" ry="4.4" fill="#ffd21f"/>
    <ellipse cx="-3" cy="-17.4" rx="5" ry="1.5" fill="#fff4b0" opacity=".8"/>
    <path class="cu-h cu-h1" d="M0 -17 L0 -24" fill="none" stroke="#c99500" stroke-width="7.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cu-h cu-h2" d="M0 -17 L0 -24" fill="none" stroke="#ffd21f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cu-h cu-h3" d="M0 -17 L0 -24" fill="none" stroke="#fff3a6" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(-.8 -1)"/>
  </g>
</svg></div>`, world);
      const stoneG = runner.querySelector('.cu-stone');
      const handles = runner.querySelectorAll('.cu-h');
      const puffs = runner.querySelector('.cu-puffs');
      const bL = runner.querySelector('.cu-bL'), bR = runner.querySelector('.cu-bR');
      const bLin = runner.querySelector('.cu-bL-in'), bRin = runner.querySelector('.cu-bR-in');
      gsap.set(stoneG, { svgOrigin: '0 0' });
      gsap.set(bL, { svgOrigin: BL[0] + ' ' + BL[1] });
      gsap.set(bR, { svgOrigin: BR[0] + ' ' + BR[1] });

      const S = { p: 0, rot: ROT0 };
      const curlX = (p) => X0M * (1 - p) + 0.5 * Math.sin(Math.PI * p);
      const startPt = P(curlX(0), ZS);
      function render() {
        const z = ZS + S.p * (ZT - ZS);
        const s = sOf(z), k = s / S_START;
        const X = VX + curlX(S.p) * PXM * s, Y = YH + SPAN * s;
        runner.style.transform = `translate(${X.toFixed(2)}px,${Y.toFixed(2)}px) scale(${k.toFixed(4)})`;
        const th = S.rot * Math.PI / 180;
        const hx = 15 * Math.sin(th), hy = -6.3 * Math.cos(th);
        const d = `M0 -16.5 L0 -23.5 L${f1(hx)} ${f1(-23.5 + hy)}`;
        handles.forEach(h => h.setAttribute('d', d));
        // swept trail: from the start to the stone, narrowing with perspective
        if (S.p > 0.01) {
          const w0 = 20, w1 = 22 * k;
          trail.setAttribute('points', `${f1(startPt[0] - w0)},${f1(startPt[1] + 4)} ${f1(startPt[0] + w0)},${f1(startPt[1] + 4)} ${f1(X + w1)},${f1(Y)} ${f1(X - w1)},${f1(Y)}`);
        }
      }
      const R_UPD = { onUpdate: render };
      render();
      tl.set(trail, { opacity: 0 }, 0);
      tl.set([bL, bR], { opacity: 0 }, 0);

      /* =========================================================
         SVEN (hoodie, turquoise sneakers) — foreground layer
         ========================================================= */
      const shadow = ctx.html('<div class="cu-shadow"></div>', near);
      gsap.set(shadow, { x: SVX, y: SVY, scaleX: 0.62 });
      const sven = ctx.char('sven', { outfit: 'hoodie', h: 180, x: SVX, y: SVY, parent: near });
      // the green print on his sweatshirt, like in the photo
      sven.torso.insertAdjacentHTML('beforeend', '<g fill="none" stroke="#3fae6a" stroke-width="1.7" stroke-linecap="round" opacity=".9"><path d="M68 134 h10"/><path d="M68 139 h7"/><path d="M68 144 h11"/></g>');
      // broom in the left hand: rot (around the hand) > slide (grip point along the handle) > pad (kept flat on the ice)
      const svBroom = sven.hold('L', `<g class="sv-broom"><g class="sv-slide">
        <line x1="0" y1="-30" x2="0" y2="84" stroke="#1c1d22" stroke-width="4.6" stroke-linecap="round"/>
        <line x1="0" y1="64" x2="0" y2="84" stroke="#e2463c" stroke-width="5.2" stroke-linecap="round"/>
        <g transform="translate(0 87)"><g class="sv-pad"><rect x="-17" y="-4" width="34" height="7" rx="3" fill="#d63b35"/><rect x="-17" y="1" width="34" height="4" rx="2" fill="#2a2b31"/><rect x="-13" y="-2.6" width="15" height="1.6" rx=".8" fill="#ff8f80" opacity=".85"/></g></g>
      </g></g>`);
      const svSlide = svBroom.querySelector('.sv-slide'), svPad = svBroom.querySelector('.sv-pad');
      gsap.set(svBroom, { svgOrigin: '0 0', rotation: 6 });
      gsap.set(svSlide, { y: -42 });
      gsap.set(svPad, { svgOrigin: '0 0', rotation: -6 });
      // lunge legs: back leg stretched behind, front knee bent, turquoise Nike-ish sneakers
      sven.legR.insertAdjacentHTML('afterend', `<g class="cu-lunge">
        <path d="M52 170 L23 195 L-1 201" fill="none" stroke="#34353b" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
        <g transform="translate(-9 204) rotate(-28)"><ellipse rx="11" ry="6" fill="#46d3d6"/><path d="M-10 3 Q0 7.5 10 3" stroke="#ff6a4a" stroke-width="2.5" fill="none"/></g>
        <path d="M68 170 L93 160 L95 181" fill="none" stroke="#34353b" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
        <g transform="translate(100 187)"><ellipse rx="12.5" ry="6.2" fill="#46d3d6"/><path d="M-11.5 3 Q0 7.8 11.5 3" stroke="#ff6a4a" stroke-width="2.5" fill="none"/><path d="M-6 -.5 Q1 2.6 7 -2.4" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
      </g>`);
      const lunge = sven.svg.querySelector('.cu-lunge');
      tl.set(lunge, { opacity: 0 }, 0);
      sven.idle();
      // get into the delivery crouch (anticipation: a small rise first)
      tl.to(sven.el, { y: -6, duration: 0.25, ease: 'sine.out' }, 2.55);
      tl.to(sven.el, { rotation: POSE.rot, y: POSE.y, duration: 0.5, ease: 'power2.inOut' }, 2.8);
      tl.to([sven.legL, sven.legR], { opacity: 0, duration: 0.12 }, 2.92);
      tl.to(lunge, { opacity: 1, duration: 0.12 }, 2.92);
      tl.to(sven.armR, { rotation: POSE.armR, duration: 0.55, ease: 'power2.inOut' }, 2.85);
      tl.to(sven.armL, { rotation: POSE.armL, duration: 0.55, ease: 'power2.inOut' }, 2.85);
      // broom planted upright on the ice, like in the photo
      tl.to(svBroom, { rotation: -29, duration: 0.55, ease: 'power2.inOut' }, 2.85);
      tl.to(svSlide, { y: -49, duration: 0.55, ease: 'power2.inOut' }, 2.85);
      tl.to(svPad, { rotation: -6, duration: 0.55, ease: 'power2.inOut' }, 2.85);
      tl.to(shadow, { x: SVX - 2, scaleX: 1.12, duration: 0.5, ease: 'power2.inOut' }, 2.8);
      // small breathing bob while aiming
      tl.to(sven.el, { y: POSE.y + 3, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 3.7);

      /* =========================================================
         CHEVRONS (swipe hint on the ice, just above the stone)
         ========================================================= */
      const chev = ctx.html(`<svg class="cu-abs" style="z-index:3" width="360" height="640" viewBox="0 0 360 640" aria-hidden="true">
        <g class="cu-chev" fill="none" stroke="#ff5f8f" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M152 528 L168 514 L184 528"/><path d="M155 499 L169 487 L183 499"/><path d="M158 472 L170 462 L182 472"/>
        </g></svg>`, world);
      const chevG = chev.querySelector('.cu-chev');
      tl.set(chevG, { opacity: 0 }, 0);
      tl.to(chevG, { opacity: 0.9, duration: 0.4 }, T1 - 0.45);
      tl.to(chevG, { opacity: 0, duration: 0.2 }, T1 + 0.05);
      ctx.loop(gsap.fromTo(chevG.children, { opacity: 0.25, y: 8 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.15, repeat: -1, yoyo: true, ease: 'sine.inOut' }));

      /* =========================================================
         CAPTION (on the empty ice, so the hall stays visible)
         ========================================================= */
      ctx.caption('Puis le team building <span style="color:#1f9d5b;font-weight:600">Ouay</span>.', 2.05, { pos: { x: 180, y: 290 }, variant: 'card', html: true, dur: 2.5 });

      /* =========================================================
         LAUNCH (after wait 1) + camera follows the stone
         ========================================================= */
      // anticipation: pull back
      tl.to(sven.el, { x: -6, rotation: POSE.rot - 3, duration: 0.24, ease: 'power2.out' }, T1);
      tl.to(sven.armR, { rotation: POSE.armR + 8, duration: 0.24, ease: 'power2.out' }, T1);
      tl.to(shadow, { x: SVX - 8, duration: 0.24, ease: 'power2.out' }, T1);
      tl.to(S, { p: -0.012, duration: 0.24, ease: 'power2.out', ...R_UPD }, T1);
      // push + release + slide forward, arm still pointing at the house
      tl.to(sven.el, { x: 16, y: POSE.y - 6, rotation: POSE.rot + 3, duration: 1.0, ease: 'power3.out' }, A0);
      tl.to(shadow, { x: SVX + 14, y: SVY - 6, duration: 1.0, ease: 'power3.out' }, A0);
      tl.to(sven.armR, { rotation: POSE.armR - 14, duration: 0.3, ease: 'power2.out' }, A0);
      tl.to(S, { p: P_A, duration: DUR_A, ease: (t) => herm(t, A_START, B_END), ...R_UPD }, A0);
      tl.fromTo(S, { rot: ROT0 }, { rot: ROT_A, duration: DUR_A, ease: 'sine.out', immediateRender: false, ...R_UPD }, A0);
      tl.to(trail, { opacity: 1, duration: 0.6 }, A0 + 0.1);
      ctx.sfx('swoosh', A0);
      ctx.sfx('rumble', A0 + 0.05);
      // camera: dolly up the sheet, the foreground (Sven) slides out of frame faster
      const C1 = cam(1.5), C2 = cam(1.54);
      tl.to(world, { ...C1, duration: 2.4, ease: 'power2.inOut' }, A0 + 0.25);
      tl.to(near, { ...NEAR_OUT, duration: 2.4, ease: 'power2.inOut' }, A0 + 0.25);
      ctx.backdrop('#c3d6e7', '#f6fafc', A0 + 1.2);
      // the brooms swoop in
      tl.fromTo(bL, { opacity: 0, x: -50, y: 20, rotation: -20 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'back.out(1.6)' }, T2 - 1.15);
      tl.fromTo(bR, { opacity: 0, x: 50, y: 20, rotation: 20 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'back.out(1.6)' }, T2 - 1.05);
      ctx.sfx('whoosh', T2 - 1.15);
      // the skip shouts
      tl.fromTo(skBub, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, T2 - 0.55);
      ctx.sfx('pop', T2 - 0.55);
      tl.to(skMouth, { opacity: 0, duration: 0.05 }, T2 - 0.55);
      tl.to(skShout, { opacity: 1, duration: 0.05 }, T2 - 0.55);
      tl.to(skArmL, { rotation: 150, duration: 0.25, ease: 'back.out(2)' }, T2 - 0.55);
      tl.to(skArmL, { rotation: 130, duration: 0.18, yoyo: true, repeat: 7, ease: 'sine.inOut' }, T2 - 0.3);
      tl.to(skBub, { opacity: 0, duration: 0.3 }, B0 + 1.6);
      tl.to(skShout, { opacity: 0, duration: 0.05 }, B0 + 1.6);
      tl.to(skMouth, { opacity: 1, duration: 0.05 }, B0 + 1.6);

      /* =========================================================
         SWEEPING (wait 2) — interactive part
         ========================================================= */
      const counter = ctx.html('<div class="cu-count"><small>coups de balai</small><b>× 0</b></div>');
      const counterB = counter.querySelector('b');
      tl.set(counter, { opacity: 0 }, 0);
      let mode = null, finish = null, downY = null, taps = 0, v = V_END_A, creep = null, aB = 0;
      const computeB = () => { aB = clamp(v * DUR_B / Math.max(1e-3, 1 - S.p), 0, 3); };
      computeB();

      function puff() {
        for (let i = 0; i < 6; i++) {
          const side = i < 3 ? bL : bR;
          const px = side === bL ? BL[0] : BR[0], py = side === bL ? BL[1] : BR[1];
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('r', (3.5 + R() * 3.5).toFixed(1)); c.setAttribute('fill', '#eef8ff');
          c.setAttribute('stroke', '#7fa9c9'); c.setAttribute('stroke-width', '1.4');
          puffs.appendChild(c);
          const dir = i % 2 ? 1 : -1;
          gsap.fromTo(c, { x: px + dir * 14, y: py + 2, opacity: 1, scale: 0.5 },
            { x: px + dir * (26 + R() * 20), y: py - 4 + (R() - 0.5) * 22, scale: 1.8, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => c.remove() });
        }
      }
      function sweepTap() {
        taps++;
        counterB.textContent = '× ' + taps;
        gsap.to(counter, { opacity: 1, duration: 0.15, overwrite: 'auto' });
        const grow = 1 + Math.min(taps, 30) * 0.012;   // the counter grows with every tap
        gsap.fromTo(counterB, { scale: grow * 1.3 }, { scale: grow, duration: 0.28, ease: 'back.out(3)', overwrite: true });
        v = Math.min(V_MAX, v + V_TAP);
        gsap.to(bLin, { keyframes: [{ x: -9, duration: 0.05 }, { x: 9, duration: 0.07 }, { x: -6, duration: 0.07 }, { x: 0, duration: 0.05 }], overwrite: true });
        gsap.to(bRin, { keyframes: [{ x: 9, duration: 0.05 }, { x: -9, duration: 0.07 }, { x: 6, duration: 0.07 }, { x: 0, duration: 0.05 }], overwrite: true });
        puff();
        Sound.play('sweep');
      }
      // the catcher stays armed from the launch until the stone has landed, so frantic taps never skip the payoff
      function launch() { if (mode !== 'swipe') return; mode = 'glide'; if (finish) finish(); }

      const catcher = ctx.interactive(ctx.html('<div class="cu-catch"></div>'));
      ctx.on(catcher, 'pointerdown', (e) => {
        downY = e.clientY;
        try { catcher.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
        if (mode === 'sweep' && tl.time() < TL - 0.3) sweepTap();
      });
      ctx.on(catcher, 'pointermove', (e) => {
        if (mode === 'swipe' && downY != null && (e.clientY - downY) / (Story.scale || 1) < -40) launch();
      });
      ctx.on(catcher, 'pointerup', (e) => {
        if (mode === 'swipe' && downY != null) {
          const dy = (e.clientY - downY) / (Story.scale || 1);
          if (dy < -40 || Math.abs(dy) < 14) launch();
        }
        downY = null;
      });
      ctx.on(catcher, 'pointercancel', () => { downY = null; });

      ctx.wait(T1, (done) => {
        finish = done; mode = 'swipe'; downY = null;
        catcher.style.pointerEvents = 'auto';
      }, { timeout: 4, hint: 'Glisse vers le haut pour lancer ↑' });
      tl.call(() => { mode = 'glide'; catcher.style.pointerEvents = 'auto'; }, null, T1 + 0.01);

      ctx.wait(T2, (done) => {
        finish = done; mode = 'sweep'; taps = 0; v = V_END_A;
        catcher.style.pointerEvents = 'auto';
        let last = 0, ended = false;
        const clock = { t: 0 };
        // the stone keeps creeping, slowing down; every tap gives it a little more speed
        creep = gsap.to(clock, {
          t: 60, duration: 60, ease: 'none', onUpdate() {
            const dt = Math.min(0.1, clock.t - last); last = clock.t;
            v = Math.max(V_MIN, v - V_DECAY * dt);
            S.p = Math.min(P_CAP, S.p + v * dt);
            S.rot += v * dt * 60;
            render();
            if (S.p >= P_CAP && !ended) { ended = true; ctx.timeout(done, 200); }
          },
        });
        ctx.loop(creep);
      }, { timeout: 4, hint: 'FROTTE ! Tape vite !' });
      tl.call(() => {
        mode = 'sweep'; catcher.style.pointerEvents = 'auto';
        if (creep) { creep.kill(); creep = null; }
        computeB();
      }, null, T2 + 0.01);
      tl.call(() => { mode = null; catcher.style.pointerEvents = 'none'; }, null, TL + 0.7);

      /* =========================================================
         GLIDE INTO THE HOUSE
         ========================================================= */
      tl.to(S, { p: 1, duration: DUR_B, ease: (t) => herm(t, aB, 0), ...R_UPD }, B0);
      tl.to(S, { rot: ROT_END, duration: DUR_B, ease: 'sine.out', ...R_UPD }, B0);
      tl.to(world, { ...C2, duration: DUR_B, ease: 'sine.inOut' }, B0);
      ctx.sfx('rumble', B0);
      // brooms brush (timeline version, also plays after the interactive part)
      tl.to(bL, { x: 9, duration: 0.09, yoyo: true, repeat: 13, ease: 'sine.inOut' }, B0);
      tl.to(bR, { x: -9, duration: 0.09, yoyo: true, repeat: 13, ease: 'sine.inOut' }, B0 + 0.04);
      for (let i = 0; i < 7; i++) ctx.sfx('sweep', B0 + 0.05 + i * 0.19);
      tl.to(bL, { x: -26, y: -24, rotation: -16, opacity: 0, duration: 0.45, ease: 'power2.in' }, TL - 0.85);
      tl.to(bR, { x: 26, y: -24, rotation: 16, opacity: 0, duration: 0.45, ease: 'power2.in' }, TL - 0.8);
      tl.to(counter, { opacity: 0, duration: 0.35 }, TL + 2.3);
      // skip lifts the broom as the stone arrives
      tl.to(skArmL, { rotation: 0, duration: 0.3 }, B0 + 1.0);

      /* =========================================================
         ON THE BUTTON !
         ========================================================= */
      ctx.sfx('thud', TL - 0.04);
      ctx.sfx('tada', TL + 0.08);
      ctx.sfx('confetti', TL + 0.12);
      tl.to(stoneG, { scaleY: 0.9, scaleX: 1.04, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, TL - 0.04);
      tl.to(camEl, { keyframes: [{ y: 5, duration: 0.05 }, { y: -4, duration: 0.05 }, { y: 2, duration: 0.05 }, { y: 0, duration: 0.07 }], ease: 'none' }, TL - 0.02);

      const fx = ctx.html(`<svg class="cu-fx" viewBox="0 0 360 640" aria-hidden="true"></svg>`, world);
      const cP = P(0, ZT);
      const ns = 'http://www.w3.org/2000/svg';
      const mk = (tag, attrs) => { const n = document.createElementNS(ns, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); fx.appendChild(n); return n; };
      // shock rings
      [0, 0.22].forEach((d) => {
        const e = mk('ellipse', { cx: cP[0], cy: cP[1], rx: 30, ry: 12.6, fill: 'none', stroke: '#ffffff', 'stroke-width': 3 });
        gsap.set(e, { svgOrigin: `${cP[0]} ${cP[1]}`, opacity: 0 });
        tl.fromTo(e, { scale: 0.6, opacity: 0.95 }, { scale: 3.2, opacity: 0, duration: 0.9, ease: 'power2.out', immediateRender: false }, TL + d);
      });
      // ice sparkles
      const STAR = 'M0 -7 Q1.2 -1.2 7 0 Q1.2 1.2 0 7 Q-1.2 1.2 -7 0 Q-1.2 -1.2 0 -7 Z';
      for (let i = 0; i < 30; i++) {
        const col = ['#ffffff', '#bfe6ff', '#ffffff', '#ffe08a', '#d7f1ff'][i % 5];
        const st = mk('path', { d: STAR, fill: col, stroke: '#9cc3de', 'stroke-width': 0.6 });
        const a = -Math.PI * (0.06 + 0.88 * R()) - (R() < 0.2 ? -Math.PI * 0.9 : 0);
        const dist = 45 + R() * 85;
        const tx = cP[0] + Math.cos(a) * dist * 1.15, ty = cP[1] - 12 + Math.sin(a) * dist * 0.75;
        const sc = 0.6 + R() * 0.9, d0 = TL + R() * 0.12;
        tl.fromTo(st, { x: cP[0], y: cP[1] - 12, scale: 0.2, rotation: 0, opacity: 0 },
          { x: tx, y: ty, scale: sc, rotation: 90 + R() * 180, opacity: 1, duration: 0.75, ease: 'power3.out' }, d0);
        tl.to(st, { y: ty + 26 + R() * 20, opacity: 0, scale: sc * 0.4, duration: 0.9, ease: 'power1.in' }, d0 + 0.75 + R() * 0.4);
      }
      ctx.caption('Pile dans la maison !', TL + 0.15, { pos: { x: 180, y: 334 }, variant: 'card', size: 21, dur: 2.3 });
      // the skip jumps, broom in the air
      tl.to(skArmR, { rotation: -175, duration: 0.3, ease: 'back.out(1.8)' }, TL + 0.05);
      tl.to(skArmL, { rotation: 150, duration: 0.3, ease: 'back.out(1.8)' }, TL + 0.05);
      tl.to(skShout, { opacity: 1, duration: 0.05 }, TL + 0.05);
      tl.to(skMouth, { opacity: 0, duration: 0.05 }, TL + 0.05);
      tl.to(skBody, { y: -10, duration: 0.18, yoyo: true, repeat: 3, ease: 'power1.out' }, TL + 0.1);
      // the spectators behind the glass jump too
      tl.to(hall.querySelectorAll('.cu-fan'), { y: -5, duration: 0.16, yoyo: true, repeat: 3, ease: 'power1.out', stagger: 0.05 }, TL + 0.2);

      /* ---- camera pulls back: Sven celebrates ---- */
      // (off-screen) Sven stands up, arms already in the air
      tl.to(sven.el, { rotation: 0, y: 0, duration: 0.3, ease: 'back.out(1.6)' }, TL + 0.5);
      tl.to(lunge, { opacity: 0, duration: 0.1 }, TL + 0.55);
      tl.to([sven.legL, sven.legR], { opacity: 1, duration: 0.1 }, TL + 0.55);
      tl.to(shadow, { scaleX: 0.62, x: SVX + 16, y: SVY, duration: 0.3 }, TL + 0.5);
      tl.to(sven.armR, { rotation: -150, duration: 0.35, ease: 'back.out(1.8)' }, TL + 0.55);
      tl.to(sven.armL, { rotation: 150, duration: 0.35, ease: 'back.out(1.8)' }, TL + 0.55);
      tl.to(svBroom, { rotation: 32, duration: 0.35 }, TL + 0.55);
      tl.to(svSlide, { y: -14, duration: 0.35 }, TL + 0.55);
      tl.to(svPad, { rotation: 0, duration: 0.35 }, TL + 0.55);
      tl.to(world, { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.inOut' }, ZO);
      tl.to(near, { x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.inOut' }, ZO);
      ctx.backdrop('#2e211d', '#f6fafc', ZO + 0.2);
      ctx.sfx('whoosh', ZO);
      sven.hop(ZO + 0.75, 18);
      sven.hop(ZO + 1.18, 12);
      sven.emote(ZO + 0.8, '✨', 1.3);
      tl.to(sven.armR, { rotation: -130, duration: 0.2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, ZO + 0.85);
      tl.to(sven.armL, { rotation: 130, duration: 0.2, yoyo: true, repeat: 3, ease: 'sine.inOut' }, ZO + 0.85);
      // scoreboard flips 0 → 1 once it is back in view
      tl.to(s0, { scaleY: 0, duration: 0.12, ease: 'power1.in' }, ZO + 0.8);
      tl.to(s1, { scaleY: 1, duration: 0.14, ease: 'power1.out' }, ZO + 0.92);
      ctx.sfx('tick', ZO + 0.85);

      /* =========================================================
         FROST TRANSITION (on top of everything)
         ========================================================= */
      const dark = ctx.html('<div class="cu-dark"></div>');
      const fill = ctx.html('<div class="cu-fill"></div>');
      const seeds = [
        [-4, 0, 45, 150], [364, 0, 135, 150], [-4, 640, -45, 150], [364, 640, -135, 150],
        [110, -4, 90, 110], [235, -4, 90, 120], [60, 644, -90, 115], [180, 644, -90, 95], [290, 644, -90, 120],
        [-4, 150, 0, 105], [-4, 300, 0, 120], [-4, 455, 0, 110], [364, 220, 180, 115], [364, 370, 180, 105], [364, 500, 180, 120],
      ];
      let fsvg = '';
      seeds.forEach(([sx, sy, deg, L], i) => {
        const ang = (deg + (R() - 0.5) * 30) * Math.PI / 180;
        const dx = Math.cos(ang), dy = Math.sin(ang);
        const ex = sx + dx * L, ey = sy + dy * L;
        let tw = '';
        const n = 5;
        for (let j = 0; j < n; j++) {
          const f = 0.16 + j * 0.15 + R() * 0.04;
          const bx = sx + dx * L * f, by = sy + dy * L * f;
          const len = L * (1 - f) * 0.42 + 5;
          let d = '';
          [-1, 1].forEach((sg) => {
            const a = ang + sg * Math.PI / 3;
            const tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len;
            d += `M${f1(bx)} ${f1(by)}L${f1(tx)} ${f1(ty)}`;
            if (len > 16) {
              const mx = bx + Math.cos(a) * len * 0.55, my = by + Math.sin(a) * len * 0.55;
              [-1, 1].forEach((sg2) => {
                const a2 = a + sg2 * Math.PI / 3, l2 = len * 0.28;
                d += `M${f1(mx)} ${f1(my)}L${f1(mx + Math.cos(a2) * l2)} ${f1(my + Math.sin(a2) * l2)}`;
              });
            }
          });
          tw += `<path class="fz-tw" data-f="${f.toFixed(2)}" data-o="${f1(bx)} ${f1(by)}" d="${d}" stroke-width="1.4"/>`;
        }
        fsvg += `<g class="fz-c" data-o="${sx} ${sy}">
          <path class="fz-m" d="M${sx} ${sy}L${f1(ex)} ${f1(ey)}" stroke="#a9d3ee" stroke-width="5" opacity=".45" pathLength="1"/>
          <path class="fz-m" d="M${sx} ${sy}L${f1(ex)} ${f1(ey)}" stroke-width="2.2" pathLength="1"/>
          ${tw}</g>`;
      });
      const frost = ctx.html(`<svg class="cu-frost" viewBox="0 0 360 640" aria-hidden="true">
        <g fill="none" stroke="#f4fbff" stroke-linecap="round">${fsvg}</g></svg>`);
      tl.set(dark, { opacity: 1 }, 0);
      tl.fromTo(fill, { '--h': 100 }, { '--h': -15, duration: 1.1, ease: 'power1.in' }, 0.05);
      // the last dark patch freezes over too (no dark blob in the middle)
      tl.fromTo(dark, { backgroundColor: '#101827' }, { backgroundColor: '#cfe2f0', duration: 0.55, ease: 'power1.in' }, 0.55);
      ctx.sfx('whoosh', 0.05);
      frost.querySelectorAll('.fz-c').forEach((g, i) => {
        const t0 = 0.03 + (i % 5) * 0.05 + R() * 0.06;
        gsap.set(g, { svgOrigin: g.dataset.o });
        g.querySelectorAll('.fz-m').forEach((m) => {
          tl.fromTo(m, { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.out' }, t0);
        });
        g.querySelectorAll('.fz-tw').forEach((tw) => {
          gsap.set(tw, { svgOrigin: tw.dataset.o });
          tl.fromTo(tw, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)' }, t0 + (1 - Math.sqrt(1 - parseFloat(tw.dataset.f))) - 0.03);
        });
        // recede towards the edge after the reveal
        const top = [0, 1, 4, 5, 9].includes(i);
        tl.to(g, { scale: top ? 0.3 : 0.42, opacity: top ? 0 : 0.6, duration: 0.9, ease: 'power2.inOut' }, 1.35 + (i % 4) * 0.04);
      });
      tl.set(dark, { opacity: 0 }, 1.16);
      tl.to(fill, { '--h': 78, duration: 0.95, ease: 'power2.inOut' }, 1.2);
      tl.to(fill, { opacity: 0.6, duration: 0.8 }, 1.6);
      ctx.sfx('magic', 1.3);

      /* =========================================================
         PHOTOS
         ========================================================= */
      ctx.beat(PH4);
      ctx.photo(4, PH4, { caption: 'Concentration maximale.' });
      ctx.photo(5, PH5, { caption: 'L’équipe au complet (et à genoux).' });
    },
  });
})();
;

/* ===== js/scenes/07-strasbourg.js ===== */
/* Scène 7 — « strasbourg »
 * La glace du curling se change en neige. Place Kléber, la nuit : le grand sapin s'allume
 * ampoule par ampoule, Artur tend un vin chaud à Sven, ils trinquent, selfie (photo 6),
 * puis la visionneuse recule jusqu'à la grille de la pellicule… avec une place libre.
 * La grille de fin est reprise à l'identique au début de 08-depart.js (même géométrie).
 */
(function () {
  'use strict';

  const SKIN = { artur: '#f0b896', sven: '#e9b38f' };

  // Roll-grid layout. Keep identical in js/scenes/08-depart.js.
  const GRID = { top: 146, size: 118, gap: 3 };
  const cellPos = (i) => ({
    x: (i % 3) * (GRID.size + GRID.gap),
    y: GRID.top + Math.floor(i / 3) * (GRID.size + GRID.gap),
  });

  /* ---------------- ice (curling sheet), used as the opening frame ---------------- */
  function iceSVG(rand) {
    let scratches = '';
    for (let i = 0; i < 22; i++) {
      const x = rand() * 360, y = rand() * 640, len = 40 + rand() * 130, a = (rand() - 0.5) * 0.5;
      const col = rand() < 0.55 ? '#ffffff' : '#a6c0d4';
      scratches += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(len / 2).toFixed(1)} ${(a * len / 2 + (rand() - 0.5) * 8).toFixed(1)} ${len.toFixed(1)} ${(a * len).toFixed(1)}" stroke="${col}" stroke-opacity="${(0.3 + rand() * 0.45).toFixed(2)}" stroke-width="${(0.6 + rand()).toFixed(2)}" fill="none"/>`;
    }
    let pebble = '';
    for (let i = 0; i < 90; i++) {
      pebble += `<circle cx="${(rand() * 360).toFixed(1)}" cy="${(rand() * 640).toFixed(1)}" r="${(0.5 + rand() * 0.8).toFixed(2)}" fill="#ffffff" opacity="${(0.4 + rand() * 0.5).toFixed(2)}"/>`;
    }
    let speck = '';
    for (let i = 0; i < 16; i++) {
      const a = rand() * Math.PI * 2, r = rand() * 20;
      speck += `<circle cx="${(180 + Math.cos(a) * r).toFixed(1)}" cy="${(300 + Math.sin(a) * r).toFixed(1)}" r="${(0.6 + rand() * 0.9).toFixed(2)}" fill="${rand() < 0.5 ? '#6f747e' : '#dcdfe4'}"/>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640" viewBox="0 0 360 640">
<defs>
<linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f9fd"/><stop offset="1" stop-color="#cde1ee"/></linearGradient>
<radialGradient id="b" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#cfd2d8"/><stop offset="1" stop-color="#868b95"/></radialGradient>
<radialGradient id="c" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff" stop-opacity=".0"/><stop offset="1" stop-color="#ffffff" stop-opacity=".35"/></radialGradient>
</defs>
<rect width="360" height="640" fill="url(#a)"/>
<g opacity=".88">
<circle cx="180" cy="300" r="124" fill="#3f80d4"/>
<circle cx="180" cy="300" r="85" fill="#f2f8fc"/>
<circle cx="180" cy="300" r="47" fill="#dc4b4b"/>
<circle cx="180" cy="300" r="16" fill="#f2f8fc"/>
</g>
<circle cx="180" cy="300" r="124" fill="url(#c)"/>
<path d="M180 0V640M0 300H360M0 112H360" stroke="#2c3b57" stroke-opacity=".4" stroke-width="1.2"/>
<path d="M0 566H360" stroke="#d64545" stroke-opacity=".75" stroke-width="5"/>
${scratches}${pebble}
<ellipse cx="185" cy="309" rx="28" ry="24" fill="#4f6e88" opacity=".22"/>
<circle cx="180" cy="300" r="25" fill="url(#b)"/>
<circle cx="180" cy="300" r="18" fill="none" stroke="#e6e8ec" stroke-opacity=".55" stroke-width="2"/>
${speck}
<rect x="165" y="294.5" width="30" height="11" rx="5.5" fill="#f2c12e"/>
<rect x="167" y="295.5" width="26" height="3.5" rx="1.75" fill="#ffe589"/>
<circle cx="191" cy="300" r="6.5" fill="#dcaa1c"/>
<circle cx="190" cy="298.5" r="2.4" fill="#ffe589" opacity=".8"/>
</svg>`;
  }

  /* ---------------- props (hand-local coords, origin = hand centre, char units) ---------------- */
  function cupSVG(skin) {
    const steam = (dx, cls) => `<path class="sx-steam ${cls}" d="M${dx} -24 q-3.2 -4 0 -8 q3.2 -4 0 -8.5" stroke="#ffffff" stroke-width="2.1" fill="none" stroke-linecap="round" opacity=".55"/>`;
    return `<g class="sx-cup" transform="scale(1.2)">
  <path d="M-8.6 -14.5 q-6.6 .3 -6.4 6.2 q.3 5.4 6.6 5.6" fill="none" stroke="#a9232c" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M-8.8 -19.5 L8.8 -19.5 L7.4 3 Q0 5.6 -7.4 3 Z" fill="#c92f3a"/>
  <path d="M2.6 -19.5 L8.8 -19.5 L7.4 3 Q4.4 4.6 1.6 4.8 Z" fill="#8f1d27" opacity=".45"/>
  <path d="M-8.45 -13 L8.45 -13 L8.1 -6.4 L-8.1 -6.4 Z" fill="#fbf4ee"/>
  <path d="M-6.2 -8 l2.1 -2.8 l2.1 2.8 M.2 -8 l2.1 -2.8 l2.1 2.8" stroke="#c92f3a" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
  <circle cx="-4.4" cy="-1.5" r=".9" fill="#fbf4ee"/><circle cx="4.6" cy="-2.5" r=".9" fill="#fbf4ee"/><circle cx=".2" cy="-16.2" r=".8" fill="#fbf4ee"/>
  <ellipse cx="0" cy="-19.5" rx="8.8" ry="2.5" fill="#e14753"/>
  <ellipse cx="0" cy="-19.2" rx="7.1" ry="1.7" fill="#4e0d1a"/>
  <path d="M-6.1 -16.6 L-5.4 0" stroke="#ffffff" stroke-opacity=".38" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="-9.6" y="-4.8" width="12.5" height="8" rx="3.8" fill="${skin}"/>
  <path d="M-5.6 -4.2 v6.6 M-1.8 -4.2 v6.6" stroke="#000" stroke-opacity=".13" stroke-width=".9"/>
  ${steam(-3.2, 'a')}${steam(3.4, 'b')}
</g>`;
  }
  function phoneSVG(skin) {
    return `<g transform="rotate(16) scale(1.25)">
  <rect x="-8.5" y="-31" width="17" height="32" rx="3.4" fill="#141418"/>
  <rect x="-7.4" y="-29.9" width="14.8" height="29.8" rx="2.7" fill="#2c2c34"/>
  <rect x="-6" y="-28.4" width="5.6" height="10.6" rx="2.4" fill="#111115"/>
  <circle cx="-3.2" cy="-25.6" r="1.7" fill="#3b4b6c"/><circle cx="-3.2" cy="-20.6" r="1.7" fill="#3b4b6c"/>
  <circle cx="1.4" cy="-23.1" r="1" fill="#f6e7b9"/>
  <path d="M5.4 -28 V-4" stroke="#ffffff" stroke-opacity=".14" stroke-width="1.4" stroke-linecap="round"/>
  <rect x="-10" y="-7.5" width="12.5" height="8.5" rx="3.8" fill="${skin}"/>
</g>`;
  }

  /* ---------------- the tree ---------------- */
  const CX = 180;
  // [yTop, wTop, yBot, wBot, scallops, droop] — bottom tier first (drawn first, upper tiers overlap it)
  const TIERS = [
    [392, 64, 508, 152, 8, 15],
    [324, 50, 428, 126, 7, 14],
    [262, 36, 360, 100, 6, 13],
    [204, 22, 296, 72, 5, 12],
    [150, 0, 236, 44, 4, 11],
  ];
  function halfWidth(y) {
    let w = 0;
    TIERS.forEach(([yt, wt, yb, wb]) => {
      if (y >= yt && y <= yb) w = Math.max(w, wt + (wb - wt) * (y - yt) / (yb - yt));
    });
    return w;
  }
  function tierPath(t, rand) {
    const [yt, wt, yb, wb, n, droop] = t;
    let d = `M${CX - wt} ${yt}`;
    if (wt > 0) d += ` L${CX + wt} ${yt}`;
    d += ` Q${CX + (wt + wb) / 2 + 7} ${(yt + yb) / 2} ${CX + wb} ${yb}`;
    const seg = (2 * wb) / n;
    for (let i = 0; i < n; i++) {
      const x0 = CX + wb - i * seg, x1 = x0 - seg;
      const dy = droop * (0.75 + rand() * 0.5);
      d += ` Q${(x0 - seg * 0.12).toFixed(1)} ${(yb + dy * 0.85).toFixed(1)} ${(x0 - seg * 0.5).toFixed(1)} ${(yb + dy).toFixed(1)}`;
      d += ` Q${(x0 - seg * 0.78).toFixed(1)} ${(yb + dy * 0.2).toFixed(1)} ${x1.toFixed(1)} ${(yb - (i < n - 1 ? 3 : 0)).toFixed(1)}`;
    }
    d += ` Q${CX - (wt + wb) / 2 - 7} ${(yt + yb) / 2} ${CX - wt} ${yt} Z`;
    return d;
  }
  function circlesPath(pts) {
    return pts.map(([x, y, r]) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join('');
  }
  function starPath(cx, cy, ro, ri) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
    }
    return d + 'Z';
  }

  /* ---------------- market stall ---------------- */
  function stall(x0, w, roof, sign, goods) {
    const x1 = x0 + w, cx = x0 + w / 2;
    let lights = '';
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = x0 - 6 + (w + 12) * t, y = 494 + 7 * Math.sin(t * Math.PI * 2) * (i % 2 ? 0.2 : 1) + 4;
      lights += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="url(#sxBulb)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="#fff6d8"/>`;
    }
    let planks = '';
    for (let x = x0 + 12; x < x1 - 6; x += 10) planks += `<path d="M${x} 547V577" stroke="#47291a" stroke-width="1.2"/>`;
    return `<g>
  <rect x="${x0 + 4}" y="488" width="${w - 8}" height="52" fill="url(#sxStallIn)"/>
  ${goods}
  <rect x="${x0 + 1}" y="484" width="6" height="94" fill="#4a2b1b"/>
  <rect x="${x1 - 7}" y="484" width="6" height="94" fill="#4a2b1b"/>
  <rect x="${x0 - 2}" y="535" width="${w + 4}" height="10" rx="2" fill="#8a5634"/>
  <rect x="${x0 - 2}" y="535" width="${w + 4}" height="2.5" rx="1" fill="#b77b49"/>
  <rect x="${x0 + 1}" y="545" width="${w - 2}" height="33" fill="#5b3721"/>
  ${planks}
  <path d="M${x0 - 12} 496 L${cx} 446 L${x1 + 12} 496 Z" fill="${roof}"/>
  <path d="M${x0 - 2} 491 L${cx} 455 L${x1 + 2} 491 Z" fill="#6e4429"/>
  <path d="M${cx - 18} 491 L${cx} 478 L${cx + 18} 491 Z" fill="#5c3721"/>
  <path d="M${cx} 474 c-4 -5 -11 -1 -6 5 l6 6 l6 -6 c5 -6 -2 -10 -6 -5z" fill="#d23a3f"/>
  <path d="M${x0 - 14} 497 L${cx} 445 L${x1 + 14} 497" fill="none" stroke="#eef3fb" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M${x0 - 8} 497 Q${x0 + w * 0.25} 509 ${cx} 497 Q${x0 + w * 0.75} 509 ${x1 + 8} 497" fill="none" stroke="#1d4630" stroke-width="7.5" stroke-linecap="round"/>
  <path d="M${x0 - 8} 495 Q${x0 + w * 0.25} 507 ${cx} 495 Q${x0 + w * 0.75} 507 ${x1 + 8} 495" fill="none" stroke="#2f6444" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 4"/>
  ${lights}
  <rect x="${cx - 33}" y="509" width="66" height="19" rx="4" fill="#3a2115"/>
  <rect x="${cx - 31}" y="511" width="62" height="15" rx="3" fill="none" stroke="#c9934f" stroke-opacity=".5"/>
  <text x="${cx}" y="523.5" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="16" fill="#ffe2a6">${sign}</text>
</g>`;
  }

  /* ---------------- the scene ---------------- */
  Story.register({
    id: 'strasbourg', order: 7, title: 'Strasbourg', photos: [6], skippable: true,
    bg: '#0f1630', music: 'normal', darkUI: false,
    build(ctx) {
      const tl = ctx.tl, rand = ctx.rand;
      const S = '#stage[data-scene="strasbourg"]';
      const ICE_URI = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iceSVG(rand));

      ctx.html(`<style>
${S} .sx-cam{position:absolute;inset:0;transform-origin:180px 470px}
${S} .sx-abs{position:absolute;left:0;top:0;width:360px;height:640px;overflow:visible}
${S} .sx-snow{position:absolute;inset:0;pointer-events:none}
${S} .sx-snow i{position:absolute;top:-10px;border-radius:50%;background:#fff}
${S} .sx-snow.front{z-index:8}
${S} .sx-snow.front i{box-shadow:0 0 3px rgba(255,255,255,.6)}
${S} .sx-fx{z-index:9;pointer-events:none}
${S} .sx-shadow{position:absolute;left:12%;right:12%;bottom:-7px;height:14px;border-radius:50%;background:radial-gradient(closest-side,rgba(4,7,18,.6),rgba(4,7,18,0));z-index:-1}
${S} .sx-face{position:absolute;border:2px solid #ffd60a;border-radius:7px;z-index:9;box-shadow:0 0 8px rgba(255,214,10,.35)}
${S} .sx-ice{position:absolute;inset:0;z-index:25;pointer-events:none;overflow:hidden}
${S} .sx-ice b{position:absolute;width:60px;height:64px;background-image:url("${ICE_URI}");background-size:360px 640px;will-change:transform}
${S} .sx-ice b i{position:absolute;inset:0;background:#fff;opacity:0;border-radius:inherit}
${S} .sx-sheen{position:absolute;top:-120px;left:0;width:120px;height:880px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.8),rgba(255,255,255,0))}
${S} .sx-grid{position:absolute;inset:0;background:#000;z-index:32;overflow:hidden}
${S} .sx-gin{position:absolute;inset:0;transform-origin:0 0}
${S} .sx-gtitle{position:absolute;left:16px;top:78px;color:#fff}
${S} .sx-gtitle b{display:block;font:600 30px/1.1 var(--font-display);letter-spacing:.2px}
${S} .sx-gtitle span{display:block;margin-top:3px;font:500 13px var(--font-display);color:rgba(255,255,255,.55)}
${S} .sx-cell{position:absolute;width:${GRID.size}px;height:${GRID.size}px;background-size:cover;background-position:center;background-color:#1a1a1a}
${S} .sx-slot{position:absolute;width:${GRID.size}px;height:${GRID.size}px}
${S} .sx-slot .gl{position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,122,162,.55),rgba(255,122,162,0));opacity:.45}
${S} .sx-slot .bd{position:absolute;inset:7px;border:2px dashed rgba(255,255,255,.62);border-radius:10px;background:rgba(255,255,255,.05)}
${S} .sx-slot .pl{position:absolute;left:0;top:0;width:100%;height:100%;display:grid;place-items:center;font:500 50px/1 var(--font-display);color:#fff;padding-bottom:4px;box-sizing:border-box}
${S} .cap-light{font-size:19px}
${S} .viewer .v-top b{visibility:hidden}
</style>`);

      ctx.backdrop('#e9f4fa', '#d0e3ef');
      ctx.backdrop('#0f1630', '#161c30', 0.6);

      const cam = ctx.html('<div class="sx-cam"></div>');

      /* ---------- sky, cathedral, houses ---------- */
      let stars = '';
      for (let i = 0; i < 26; i++) {
        const x = rand() * 360, y = 78 + rand() * 250, r = 0.5 + rand() * 1.1;
        stars += `<circle class="${i < 8 ? 'sx-tw' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#dfe8ff" opacity="${(0.35 + rand() * 0.5).toFixed(2)}"/>`;
      }
      const win = (x, y, w, h, lit) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${lit ? 'url(#sxWin)' : '#2a2538'}"/>` +
        `<path d="M${x + w / 2} ${y}V${y + h}M${x} ${y + h * 0.42}H${x + w}" stroke="${lit ? '#9c6a2c' : '#3d374e'}" stroke-width="1.3"/>`;
      ctx.html(`<svg class="sx-abs" viewBox="0 0 360 640" aria-hidden="true">
<defs>
  <linearGradient id="sxSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1630"/><stop offset=".82" stop-color="#1b2547"/></linearGradient>
  <radialGradient id="sxHalo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc56e" stop-opacity=".5"/><stop offset=".5" stop-color="#ffae4a" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a3a" stop-opacity="0"/></radialGradient>
  <linearGradient id="sxWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a8"/><stop offset="1" stop-color="#ffb44a"/></linearGradient>
  <linearGradient id="sxPlaster" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#94735a"/><stop offset="1" stop-color="#c99c6e"/></linearGradient>
  <linearGradient id="sxFacade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34304a"/><stop offset="1" stop-color="#57496a"/></linearGradient>
</defs>
<rect width="360" height="640" fill="url(#sxSky)"/>
${stars}
<g fill="#1f2b55">
  <path d="M286 520V318H296V266H301V236H305V216H309L316 170L323 216H327V236H331V266H336V318H362V520Z"/>
  <path d="M300 236l2 -10l2 10zM327 236l2 -10l2 10zM296 266l2 -9l2 9zM332 266l2 -9l2 9z"/>
</g>
<g fill="#ffd98a" opacity=".28"><rect x="313" y="242" width="2" height="9" rx="1"/><rect x="318" y="242" width="2" height="9" rx="1"/><rect x="306" y="276" width="2.4" height="12" rx="1.2"/><rect x="326" y="276" width="2.4" height="12" rx="1.2"/></g>
<circle cx="350" cy="312" r="8" fill="none" stroke="#2c3a6a" stroke-width="2"/>
<g>
  <path d="M290 352L298 334H362V352Z" fill="#262a3d"/>
  <path d="M296 335H362" stroke="#e8eef8" stroke-width="3" stroke-linecap="round"/>
  <rect x="320" y="338" width="14" height="13" rx="2" fill="#ffcf73" opacity=".8"/>
  <rect x="290" y="352" width="72" height="168" fill="url(#sxFacade)"/>
  <path d="M290 352H362M290 394H362M290 436H362M290 478H362" stroke="#2a2639" stroke-width="2"/>
  ${win(300, 362, 16, 24, true)}${win(334, 362, 16, 24, false)}
  ${win(300, 404, 16, 24, false)}${win(334, 404, 16, 24, true)}
  ${win(300, 446, 16, 24, true)}${win(334, 446, 16, 24, true)}
</g>
<g>
  <path d="M-24 306L36 204L96 306H84L36 222L-12 306Z" fill="#5a2a25"/>
  <path d="M-10 306L36 224L82 306Z" fill="url(#sxPlaster)"/>
  <path d="M36 226V306M8 306L36 262L64 306M-4 292H76" stroke="#4a2b1f" stroke-width="3.4" fill="none"/>
  <rect x="28" y="272" width="16" height="18" rx="2" fill="url(#sxWin)"/>
  <path d="M36 272V290M28 280H44" stroke="#9c6a2c" stroke-width="1.2"/>
  <path d="M-25 306L36 202L97 306" fill="none" stroke="#eef3fb" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 270q4 -4 8 0M52 270q4 -4 8 0" stroke="#eef3fb" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="-14" y="306" width="100" height="76" fill="url(#sxPlaster)"/>
  <rect x="-14" y="302" width="100" height="6" fill="#4a2b1f"/>
  <rect x="-14" y="378" width="100" height="6" fill="#4a2b1f"/>
  <path d="M-4 308V378M36 308V378M78 308V378" stroke="#4a2b1f" stroke-width="4"/>
  <path d="M-2 356L14 376M14 356L-2 376M18 356L34 376M34 356L18 376M40 356L56 376M56 356L40 376M58 356L74 376M74 356L58 376" stroke="#4a2b1f" stroke-width="3"/>
  <rect x="2" y="316" width="24" height="32" fill="#3a2117"/>
  <rect x="4" y="318" width="20" height="28" rx="1" fill="url(#sxWin)"/>
  <path d="M14 318V346M4 330H24" stroke="#9c6a2c" stroke-width="1.4"/>
  <rect x="-6" y="317" width="7" height="30" fill="#2f5c4d"/><rect x="27" y="317" width="7" height="30" fill="#2f5c4d"/>
  <rect x="44" y="316" width="24" height="32" fill="#3a2117"/>
  <rect x="46" y="318" width="20" height="28" rx="1" fill="url(#sxWin)"/>
  <path d="M56 318V346M46 330H66" stroke="#9c6a2c" stroke-width="1.4"/>
  <path d="${starPath(56, 338, 5, 2.1)}" fill="#fff6d6"/>
  <rect x="37" y="317" width="7" height="30" fill="#2f5c4d"/><rect x="69" y="317" width="7" height="30" fill="#2f5c4d"/>
  <rect x="0" y="348" width="28" height="3.5" rx="1.5" fill="#eef3fb"/><rect x="42" y="348" width="28" height="3.5" rx="1.5" fill="#eef3fb"/>
  <rect x="-10" y="384" width="92" height="80" fill="url(#sxPlaster)"/>
  <path d="M-4 384V464M36 384V464M78 384V464" stroke="#4a2b1f" stroke-width="4"/>
  <path d="M36 384L14 410M36 384L58 410" stroke="#4a2b1f" stroke-width="3"/>
  <rect x="2" y="412" width="22" height="30" fill="#3a2117"/><rect x="4" y="414" width="18" height="26" rx="1" fill="url(#sxWin)"/>
  <path d="M13 414V440M4 425H22" stroke="#9c6a2c" stroke-width="1.4"/>
  <rect x="48" y="412" width="22" height="30" fill="#3a2117"/><rect x="50" y="414" width="18" height="26" rx="1" fill="url(#sxWin)"/>
  <path d="M59 414V440M50 425H68" stroke="#9c6a2c" stroke-width="1.4"/>
  <path d="M-14 383Q10 393 36 383Q62 393 86 383" stroke="#1d4630" stroke-width="6" fill="none" stroke-linecap="round"/>
  <g fill="#ffe3a0"><circle cx="-4" cy="386" r="1.7"/><circle cx="10" cy="389" r="1.7"/><circle cx="24" cy="388" r="1.7"/><circle cx="48" cy="388" r="1.7"/><circle cx="62" cy="389" r="1.7"/><circle cx="76" cy="386" r="1.7"/></g>
  <g fill="#d23a3f"><circle cx="36" cy="386" r="3"/><circle cx="-12" cy="385" r="2.6"/></g>
</g>
<ellipse class="sx-halo" cx="180" cy="340" rx="240" ry="270" fill="url(#sxHalo)" opacity="0"/>
</svg>`, cam);

      /* ---------- snow (back layer) ---------- */
      const backSnow = ctx.html('<div class="sx-snow"></div>', cam);

      /* ---------- the tree, ground, stalls ---------- */
      const tierD = TIERS.map(t => tierPath(t, rand));
      // needle texture: a few darker strokes inside each tier
      const needles = TIERS.map(([yt, wt, yb, wb]) => {
        let s = '';
        for (let k = 0; k < 7; k++) {
          const y = yt + (yb - yt) * (0.45 + rand() * 0.5), hw = halfWidth(y) * 0.8;
          const x = CX + (rand() * 2 - 1) * hw;
          s += `<path d="M${(x - 7).toFixed(1)} ${(y - 4).toFixed(1)}q7 6 14 0" stroke="#0a1a15" stroke-opacity=".35" stroke-width="2" fill="none" stroke-linecap="round"/>`;
        }
        return s;
      });
      // each tier = dark shape + needles + lit shape, bottom tier first, so a still-dark upper tier
      // overlaps an already-lit lower one with its scalloped edge (no hard band while lighting up)
      const tiersSVG = tierD.map((d, i) => `<path d="${d}" fill="url(#sxTreeDk)"/>${needles[i]}<path class="sx-lt sx-lt${i}" d="${d}" fill="url(#sxTreeLt)" opacity="0"/>`).join('');

      // micro lights in 5 horizontal bands (bottom → top), each band one <path>
      const BANDS = [[512, 430], [430, 362], [362, 298], [298, 238], [238, 150]];
      const micro = BANDS.map(() => ({ core: [], halo: [] }));
      for (let y = 160; y <= 506; y += 6.8) {
        const hw = halfWidth(y) * 0.9;
        if (hw < 4) continue;
        const cnt = Math.max(1, Math.round((2 * hw) / 11.5));
        for (let k = 0; k < cnt; k++) {
          const x = CX - hw + (k + 0.15 + rand() * 0.7) * (2 * hw / cnt);
          const yy = y + (rand() - 0.5) * 5;
          // jittered band boundary: the lit area grows with a ragged edge, not a ruler line
          const yb = Math.min(511, Math.max(151, yy + (rand() - 0.5) * 34));
          const bi = BANDS.findIndex(([lo, hi]) => yb <= lo && yb > hi);
          if (bi < 0) continue;
          micro[bi].core.push([x, yy, 0.75 + rand() * 0.75]);
          if (rand() < 0.55) micro[bi].halo.push([x, yy, 2.6 + rand() * 1.2]);
        }
      }
      const unlit = [];
      micro.forEach(m => m.core.forEach(([x, y]) => { if (rand() < 0.35) unlit.push([x, y, 0.9]); }));
      const microSVG = micro.map((m, i) =>
        `<g class="sx-mb sx-mb${i}" opacity="0"><path d="${circlesPath(m.halo)}" fill="#ffc768" opacity=".28"/><path d="${circlesPath(m.core)}" fill="#fff0b8"/></g>`).join('');

      // garland swags of bigger bulbs, lit one by one (bottom swag first, left → right)
      const L0 = 1.95, L1 = 4.15;
      const tAtY = (y) => L0 + (512 - y) / (512 - 150) * (L1 - L0);
      const SWAGS = [482, 428, 372, 318, 266, 220, 182];
      const bulbs = [];
      SWAGS.forEach((y0, si) => {
        const hw = halfWidth(y0 + 10) * 0.86;
        const n = Math.max(3, Math.round((2 * hw) / 19));
        for (let i = 0; i < n; i++) {
          const t = n === 1 ? 0.5 : i / (n - 1);
          const x = CX - hw + 2 * hw * t;
          const y = y0 + 8 - 14 * t + 12 * Math.sin(Math.PI * t) + (rand() - 0.5) * 3;
          bulbs.push({ x, y, at: tAtY(y0) + t * 0.32 + si * 0.01 });
        }
      });
      const bulbSVG = bulbs.map(b => `<g transform="translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})"><g class="sx-b"><circle class="sx-bh" r="6" fill="url(#sxBulb)"/><circle r="2" fill="#fffbe9"/></g></g>`).join('');
      bulbs.forEach(b => unlit.push([b.x, b.y, 1.5]));

      // baubles
      const baubles = [];
      const kinds = [].concat(Array(12).fill('blue'), Array(6).fill('white'), Array(7).fill('red'), Array(6).fill('gold'));
      let guard = 0;
      while (baubles.length < kinds.length && guard++ < 4000) {
        const y = 185 + rand() * 312, hw = halfWidth(y) * 0.8;
        if (hw < 8) continue;
        const x = CX + (rand() * 2 - 1) * hw;
        if (baubles.some(b => Math.hypot(b.x - x, b.y - y) < 27)) continue;
        if (y > 395 && Math.abs(x - CX) < 70) continue; // hidden behind the two of them anyway
        const kind = kinds[baubles.length];
        const r = kind === 'blue' ? 6.5 + rand() * 2.2 : kind === 'white' ? 5.4 + rand() * 1.6 : 3.8 + rand() * 1.2;
        baubles.push({ x, y, r, kind });
      }
      const BAUB = {
        blue: { dk: '#1c3360', fill: 'url(#sxBallB)', glow: 'url(#sxGlowB)' },
        white: { dk: '#4b5470', fill: 'url(#sxBallW)', glow: 'url(#sxGlowW)' },
        red: { dk: '#4e1820', fill: 'url(#sxBallR)', glow: '' },
        gold: { dk: '#4f3f1e', fill: 'url(#sxBallG)', glow: '' },
      };
      const baubleSVG = baubles.map(b => {
        const k = BAUB[b.kind], r = b.r;
        return `<g transform="translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})">
<rect x="-1.6" y="${(-r - 2).toFixed(1)}" width="3.2" height="2.6" rx=".6" fill="#b9975a"/>
<circle r="${r.toFixed(1)}" fill="${k.dk}"/><circle cx="${(-r * 0.35).toFixed(1)}" cy="${(-r * 0.35).toFixed(1)}" r="${(r * 0.28).toFixed(1)}" fill="#fff" opacity=".22"/>
<g class="sx-bb" opacity="0">${k.glow ? `<circle r="${(r * 2.6).toFixed(1)}" fill="${k.glow}"/>` : ''}<circle r="${r.toFixed(1)}" fill="${k.fill}"/><circle cx="${(-r * 0.36).toFixed(1)}" cy="${(-r * 0.38).toFixed(1)}" r="${(r * 0.26).toFixed(1)}" fill="#fff" opacity=".9"/></g>
</g>`;
      }).join('');

      let rays = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, r1 = 14, r2 = i % 2 ? 21 : 27;
        rays += `<path d="M${(CX + Math.cos(a) * r1).toFixed(1)} ${(150 + Math.sin(a) * r1).toFixed(1)}L${(CX + Math.cos(a) * r2).toFixed(1)} ${(150 + Math.sin(a) * r2).toFixed(1)}" stroke="#ffe7a3" stroke-width="1.6" stroke-linecap="round"/>`;
      }

      // ground snow patches
      let patches = '';
      for (let i = 0; i < 14; i++) {
        const x = rand() * 360, y = 528 + rand() * 100;
        patches += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(14 + rand() * 30).toFixed(1)}" ry="${(2 + rand() * 3).toFixed(1)}" fill="#cfdbef" opacity="${(0.08 + rand() * 0.12).toFixed(2)}"/>`;
      }

      const goodsL = `<g><ellipse cx="22" cy="530" rx="15" ry="5" fill="#7a3d22"/><path d="M8 530q0 -16 14 -16q14 0 14 16z" fill="#b8692f"/><path d="M12 518q10 -4 20 0" stroke="#e9a35c" stroke-width="2" fill="none"/>
<path d="M18 510q-3 -5 0 -9M24 509q3 -5 0 -9" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<g fill="#c92f3a"><rect x="44" y="522" width="8" height="10" rx="1.5"/><rect x="55" y="522" width="8" height="10" rx="1.5"/><rect x="66" y="522" width="8" height="10" rx="1.5"/><rect x="77" y="522" width="8" height="10" rx="1.5"/></g>
<g fill="#fbf4ee"><rect x="44" y="525" width="8" height="2.4"/><rect x="55" y="525" width="8" height="2.4"/><rect x="66" y="525" width="8" height="2.4"/><rect x="77" y="525" width="8" height="2.4"/></g></g>`;
      const pretzel = (x, y) => `<path d="M${x} ${y}c-7 0 -8 -9 -2 -10c4 -1 5 4 2 8M${x} ${y}c7 0 8 -9 2 -10c-4 -1 -5 4 -2 8M${x - 5} ${y - 2}l10 -5" stroke="#9a5a2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      const goodsR = `<g>${pretzel(282, 500)}${pretzel(300, 503)}${pretzel(318, 500)}${pretzel(336, 503)}
<path d="M276 492V496M294 492V499M312 492V496M330 492V499" stroke="#3a2115" stroke-width="1"/>
<g><rect x="286" y="519" width="12" height="15" rx="2" fill="#e8d8b8" opacity=".9"/><rect x="302" y="517" width="12" height="17" rx="2" fill="#e8d8b8" opacity=".9"/><rect x="318" y="520" width="12" height="14" rx="2" fill="#e8d8b8" opacity=".9"/>
<rect x="286" y="519" width="12" height="3" fill="#c92f3a"/><rect x="302" y="517" width="12" height="3" fill="#2f6444"/><rect x="318" y="520" width="12" height="3" fill="#c92f3a"/></g></g>`;

      ctx.html(`<svg class="sx-abs" viewBox="0 0 360 640" aria-hidden="true">
<defs>
  <linearGradient id="sxTreeDk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1d18"/><stop offset="1" stop-color="#173a2d"/></linearGradient>
  <linearGradient id="sxTreeLt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4528"/><stop offset=".6" stop-color="#63803a"/><stop offset="1" stop-color="#a3ab4f"/></linearGradient>
  <radialGradient id="sxBulb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe6a0" stop-opacity=".95"/><stop offset=".45" stop-color="#ffc45c" stop-opacity=".45"/><stop offset="1" stop-color="#ffb040" stop-opacity="0"/></radialGradient>
  <radialGradient id="sxBallB" cx=".36" cy=".34" r=".7"><stop offset="0" stop-color="#f4fbff"/><stop offset=".38" stop-color="#8fd0ff"/><stop offset="1" stop-color="#2c74d6"/></radialGradient>
  <radialGradient id="sxGlowB" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#7cc4ff" stop-opacity=".7"/><stop offset="1" stop-color="#5aa8ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="sxBallW" cx=".36" cy=".34" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#eef3ff"/><stop offset="1" stop-color="#b7c6e6"/></radialGradient>
  <radialGradient id="sxGlowW" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6dc" stop-opacity=".6"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>
  <radialGradient id="sxBallR" cx=".36" cy=".34" r=".7"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".5" stop-color="#df3b48"/><stop offset="1" stop-color="#8c1a28"/></radialGradient>
  <radialGradient id="sxBallG" cx=".36" cy=".34" r=".7"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#f2c04e"/><stop offset="1" stop-color="#a87822"/></radialGradient>
  <radialGradient id="sxStarGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0b8" stop-opacity=".9"/><stop offset=".4" stop-color="#ffd068" stop-opacity=".35"/><stop offset="1" stop-color="#ffc050" stop-opacity="0"/></radialGradient>
  <linearGradient id="sxStarFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6cf"/><stop offset="1" stop-color="#ffc443"/></linearGradient>
  <linearGradient id="sxGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3150"/><stop offset="1" stop-color="#161c30"/></linearGradient>
  <radialGradient id="sxSpill" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".45"/><stop offset="1" stop-color="#ffb24a" stop-opacity="0"/></radialGradient>
  <linearGradient id="sxStallIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd585"/><stop offset="1" stop-color="#d9853c"/></linearGradient>
  <linearGradient id="sxBank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef3fb"/><stop offset="1" stop-color="#a9b9d3"/></linearGradient>
</defs>
<rect y="514" width="360" height="126" fill="url(#sxGround)"/>
<path d="M0 520Q90 512 180 518T360 520" stroke="#3a4468" stroke-width="2" fill="none"/>
${patches}
<ellipse class="sx-spill" cx="180" cy="552" rx="200" ry="46" fill="url(#sxSpill)" opacity="0"/>
<g transform="translate(0 12)">
<rect x="171" y="490" width="18" height="30" fill="#2e1c13"/>
${tiersSVG}
<path d="${circlesPath(unlit)}" fill="#6a5a36" opacity=".55"/>
${microSVG}
${bulbSVG}
${baubleSVG}
<g class="sx-star">
  <circle class="sx-starglow" cx="${CX}" cy="150" r="34" fill="url(#sxStarGlow)" opacity="0"/>
  <g class="sx-rays" opacity="0">${rays}</g>
  <path d="${starPath(CX, 150, 12, 5)}" fill="#5f5030"/>
  <path class="sx-starlit" d="${starPath(CX, 150, 12, 5)}" fill="url(#sxStarFill)" opacity="0"/>
</g>
</g>
${stall(-8, 104, '#4d2a1c', 'Vin chaud', goodsL)}
${stall(264, 104, '#3f2a20', 'Bretzels', goodsR)}
<path d="M-10 640V604Q20 590 54 600Q80 610 96 640Z" fill="url(#sxBank)"/>
<path d="M-10 606Q20 592 54 602" stroke="#ffffff" stroke-width="2" fill="none" opacity=".8"/>
<path d="M370 640V598Q338 588 306 600Q284 612 272 640Z" fill="url(#sxBank)"/>
<path d="M370 600Q338 590 306 602" stroke="#ffffff" stroke-width="2" fill="none" opacity=".8"/>
</svg>`, cam);

      /* ---------- characters ---------- */
      const FEET = 588;
      const artur = ctx.char('artur', { outfit: 'parka', h: 190, x: 122, y: FEET, parent: cam });
      const sven = ctx.char('sven', { outfit: 'coat', h: 190, x: 238, y: FEET, parent: cam });
      ctx.html('<div class="sx-shadow"></div>', artur.el);
      ctx.html('<div class="sx-shadow"></div>', sven.el);

      function prop(c, side, markup) {
        const g = c.hold(side, `<g class="sx-prop">${markup}</g>`);
        gsap.set(g, { svgOrigin: '0 0', rotation: 0 });
        return g;
      }
      // rotate an arm and keep whatever it holds upright
      function swing(c, side, angle, at, dur, ease) {
        const arm = side === 'L' ? c.armL : c.armR;
        const hand = side === 'L' ? c.handL : c.handR;
        ease = ease || 'power2.inOut';
        tl.to(arm, { rotation: angle, duration: dur, ease }, at);
        const props = hand.querySelectorAll('.sx-prop');
        if (props.length) tl.to(props, { rotation: -angle, duration: dur, ease }, at);
        return at + dur;
      }
      const cupMine = prop(artur, 'L', cupSVG(SKIN.artur));   // Artur's own cup, left hand
      const phone = prop(artur, 'L', phoneSVG(SKIN.artur));   // for the selfie
      const cupGift = prop(artur, 'R', cupSVG(SKIN.artur));   // the one for Sven
      const cupMineR = prop(artur, 'R', cupSVG(SKIN.artur));  // Artur's own cup, after switching hands
      const cupSven = prop(sven, 'L', cupSVG(SKIN.sven));
      gsap.set([phone, cupMineR, cupSven], { opacity: 0 });

      /* ---------- fx layer (clink sparkle) + face boxes + front snow ---------- */
      let spark = '';
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI / 2 + (i - 3.5) * 0.42, r1 = 9, r2 = i % 2 ? 17 : 22;
        spark += `<path d="M${(Math.cos(a) * r1).toFixed(1)} ${(Math.sin(a) * r1).toFixed(1)}L${(Math.cos(a) * r2).toFixed(1)} ${(Math.sin(a) * r2).toFixed(1)}" stroke="${i % 2 ? '#fff3c4' : '#ffc66e'}" stroke-width="2.4" stroke-linecap="round"/>`;
      }
      const fx = ctx.html(`<svg class="sx-abs sx-fx" viewBox="0 0 360 640" aria-hidden="true"><g transform="translate(180 455)"><g class="sx-spark" opacity="0">${spark}</g></g></svg>`, cam);
      const sparkEl = fx.querySelector('.sx-spark');
      const faceA = ctx.html('<div class="sx-face" style="left:99px;top:414px;width:64px;height:76px"></div>', cam);
      const faceS = ctx.html('<div class="sx-face" style="left:194px;top:416px;width:64px;height:78px"></div>', cam);
      gsap.set([faceA, faceS], { opacity: 0 });
      const frontSnow = ctx.html('<div class="sx-snow front"></div>', cam);

      function snow(layer, n, s0, s1, v0, v1, o0, o1) {
        for (let i = 0; i < n; i++) {
          const s = s0 + rand() * (s1 - s0), op = o0 + rand() * (o1 - o0);
          const f = ctx.html(`<i style="width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;left:${(rand() * 360).toFixed(1)}px;opacity:${op.toFixed(2)}"></i>`, layer);
          const p = rand(), sway = 8 + rand() * 16, swayDur = 1.4 + rand() * 1.8, v = v0 + rand() * (v1 - v0);
          if (ctx.still) { gsap.set(f, { y: -10 + p * 670, x: (rand() - 0.5) * sway }); continue; }
          ctx.loop(gsap.fromTo(f, { y: -10 }, { y: 660, duration: 670 / v, ease: 'none', repeat: -1 }).progress(p));
          ctx.loop(gsap.fromTo(f, { x: -sway / 2 }, { x: sway / 2, duration: swayDur, ease: 'sine.inOut', yoyo: true, repeat: -1 }).progress(rand()));
        }
      }
      snow(backSnow, 24, 1.4, 2.6, 22, 38, 0.35, 0.75);
      snow(frontSnow, 16, 3, 5.2, 45, 70, 0.75, 0.95);

      /* ---------- ice overlay → snowflakes ---------- */
      // The sheet is cut along a jittered grid: 60 irregular quads that still tile perfectly, so the
      // ice first cracks (lines spread out from the house), then the shards fall and shrink into flakes.
      const ice = ctx.html('<div class="sx-ice"></div>');
      // intact sheet under the shards: hides the hairline seams between clipped tiles until it breaks
      const iceBase = ctx.html(`<div style="position:absolute;inset:0;background-image:url(&quot;${ICE_URI}&quot;);background-size:360px 640px"></div>`, ice);
      const COLS = 6, ROWS = 10, TW = 60, TH = 64, IC = [180, 300];
      const V = [];
      for (let r = 0; r <= ROWS; r++) {
        V.push([]);
        for (let c = 0; c <= COLS; c++) {
          const ex = c === 0 || c === COLS, ey = r === 0 || r === ROWS;
          V[r].push([c * TW + (ex ? 0 : (rand() - 0.5) * 30), r * TH + (ey ? 0 : (rand() - 0.5) * 30)]);
        }
      }
      const tiles = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const q = [V[r][c], V[r][c + 1], V[r + 1][c + 1], V[r + 1][c]];
          const x0 = Math.min(...q.map(p => p[0])), y0 = Math.min(...q.map(p => p[1]));
          const x1 = Math.max(...q.map(p => p[0])), y1 = Math.max(...q.map(p => p[1]));
          const poly = q.map(([x, y]) => `${(x - x0).toFixed(1)}px ${(y - y0).toFixed(1)}px`).join(',');
          const b = ctx.html(`<b style="left:${x0.toFixed(1)}px;top:${y0.toFixed(1)}px;width:${(x1 - x0).toFixed(1)}px;height:${(y1 - y0).toFixed(1)}px;background-position:${(-x0).toFixed(1)}px ${(-y0).toFixed(1)}px;clip-path:polygon(${poly})"><i></i></b>`, ice);
          const cx = q.reduce((s, p) => s + p[0], 0) / 4, cy = q.reduce((s, p) => s + p[1], 0) / 4;
          tiles.push({ el: b, d: Math.hypot(cx - IC[0], cy - IC[1]) });
        }
      }
      // crack lines = the inner edges of the grid, grouped in rings by distance from the house
      const RINGS = 6, ringD = Array.from({ length: RINGS }, () => '');
      const edge = (a, b) => {
        const d = Math.hypot((a[0] + b[0]) / 2 - IC[0], (a[1] + b[1]) / 2 - IC[1]);
        const k = Math.min(RINGS - 1, Math.floor(d / 68));
        // a slightly kinked crack: one jittered midpoint
        const mx = (a[0] + b[0]) / 2 + (rand() - 0.5) * 7, my = (a[1] + b[1]) / 2 + (rand() - 0.5) * 7;
        ringD[k] += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${mx.toFixed(1)} ${my.toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      };
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          if (c < COLS && r > 0 && r < ROWS) edge(V[r][c], V[r][c + 1]);
          if (r < ROWS && c > 0 && c < COLS) edge(V[r][c], V[r + 1][c]);
        }
      }
      // plus a few jagged impact cracks shooting out from the stone
      let rayD = '';
      for (let i = 0; i < 7; i++) {
        let a = (i / 7) * Math.PI * 2 + (rand() - 0.5) * 0.5, r = 27;
        let d = `M${(IC[0] + Math.cos(a) * r).toFixed(1)} ${(IC[1] + Math.sin(a) * r).toFixed(1)}`;
        const len = 120 + rand() * 120;
        while (r < len) {
          r += 22 + rand() * 22; a += (rand() - 0.5) * 0.35;
          d += `L${(IC[0] + Math.cos(a) * r).toFixed(1)} ${(IC[1] + Math.sin(a) * r).toFixed(1)}`;
        }
        rayD += `<g class="sx-iray"><path d="${d}" pathLength="1" stroke="#9fc2dc" stroke-width="3.6" stroke-opacity=".55"/><path d="${d}" pathLength="1" stroke="#2f5878" stroke-width="1.5"/><path d="${d}" pathLength="1" stroke="#ffffff" stroke-width="1.1" transform="translate(1.1 1.1)"/></g>`;
      }
      const cracks = ctx.html(`<svg class="sx-abs" viewBox="0 0 360 640" aria-hidden="true"><g class="sx-irays" fill="none" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 1">${rayD}</g>${ringD.map(d =>
        `<g class="sx-crack" opacity="0" fill="none" stroke-linejoin="round" stroke-linecap="round"><path d="${d}" stroke="#9fc2dc" stroke-width="3.2" stroke-opacity=".55"/><path d="${d}" stroke="#2f5878" stroke-width="1.3"/><path d="${d}" stroke="#ffffff" stroke-width="1" transform="translate(1.1 1.1)"/></g>`).join('')}</svg>`, ice);
      const sheen = ctx.html('<div class="sx-sheen"></div>', ice);
      tl.fromTo(sheen, { x: -260, rotation: 18 }, { x: 420, rotation: 18, duration: 0.6, ease: 'power1.inOut' }, 0.08);
      ctx.sfx('sweep', 0.08);
      tl.fromTo(cracks.querySelectorAll('.sx-iray path'), { attr: { 'stroke-dashoffset': 1 } },
        { attr: { 'stroke-dashoffset': 0 }, duration: 0.3, ease: 'power2.out' }, 0.14);
      tl.to(cracks.querySelector('.sx-irays'), { opacity: 0, duration: 0.12, ease: 'none' }, 0.52);
      cracks.querySelectorAll('.sx-crack').forEach((g, k) => {
        tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.05, ease: 'none' }, 0.24 + k * 0.045);
        tl.to(g, { opacity: 0, duration: 0.12, ease: 'none' }, 0.52 + (k * 68) / 950);
      });
      tl.set(iceBase, { opacity: 0 }, 0.5);
      ctx.sfx('tick', 0.14);
      ctx.sfx('swoosh', 0.55);
      tiles.forEach(({ el, d }) => {
        const at = 0.5 + d / 950 + rand() * 0.08;
        // a textured ice shard first, then it collapses into a white flake
        tl.to(el, { scale: 0.08 + rand() * 0.05, rotation: (rand() - 0.5) * 140, duration: 0.6, ease: 'power3.in' }, at);
        tl.to(el.firstChild, { opacity: 1, duration: 0.2, ease: 'none' }, at + 0.36);
        tl.to(el, { y: 110 + rand() * 170, x: (rand() - 0.5) * 60, duration: 1.7, ease: 'sine.in' }, at + 0.12);
        tl.to(el, { opacity: 0, duration: 0.5 }, at + 1.25);
      });
      tl.set(ice, { display: 'none' }, 3.2);

      /* ---------- the tree lights up ---------- */
      ctx.sfx('magic', L0);
      ctx.sfx('magic', 3.05);
      tl.to(cam.querySelector('.sx-halo'), { opacity: 1, duration: 2.6, ease: 'sine.inOut' }, L0 + 0.1);
      tl.to(cam.querySelector('.sx-spill'), { opacity: 1, duration: 2.4, ease: 'sine.inOut' }, L0 + 0.2);
      cam.querySelectorAll('.sx-lt').forEach((p, i) => {
        tl.to(p, { opacity: 1, duration: 0.8, ease: 'sine.out' }, tAtY(TIERS[i][2] - 30) - 0.05);
      });
      cam.querySelectorAll('.sx-mb').forEach((g, i) => {
        tl.to(g, { opacity: 1, duration: 0.6, ease: 'sine.out' }, tAtY((BANDS[i][0] + BANDS[i][1]) / 2) - 0.1);
      });
      const bulbEls = cam.querySelectorAll('.sx-b');
      bulbEls.forEach((el, i) => {
        tl.fromTo(el, { opacity: 0, scale: 0, transformOrigin: '50% 50%' },
          { opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(3)' }, bulbs[i].at);
      });
      cam.querySelectorAll('.sx-bb').forEach((el, i) => {
        tl.to(el, { opacity: 1, duration: 0.45, ease: 'power2.out' }, tAtY(baubles[i].y) + 0.05);
      });
      const starLit = cam.querySelector('.sx-starlit'), starGlow = cam.querySelector('.sx-starglow'), starRays = cam.querySelector('.sx-rays');
      tl.to(starLit, { opacity: 1, duration: 0.2 }, L1 + 0.1);
      tl.fromTo(cam.querySelector('.sx-star'), { scale: 1, svgOrigin: `${CX} 150` }, { scale: 1.35, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, L1 + 0.1);
      tl.to(starGlow, { opacity: 1, duration: 0.5 }, L1 + 0.1);
      tl.to(starRays, { opacity: 1, duration: 0.5 }, L1 + 0.2);
      ctx.sfx('chime', L1 + 0.1);

      // ambient life (not in still mode)
      if (!ctx.still) {
        ctx.loop(gsap.to(starRays, { rotation: 360, svgOrigin: `${CX} 150`, duration: 28, ease: 'none', repeat: -1 }));
        ctx.loop(gsap.to(starGlow, { opacity: 0.6, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        cam.querySelectorAll('.sx-bh').forEach((h, i) => {
          if (i % 3) return;
          ctx.loop(gsap.to(h, { opacity: 0.25, duration: 0.5 + rand() * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand() * 2 }));
        });
        cam.querySelectorAll('.sx-tw').forEach(s => ctx.loop(gsap.to(s, { opacity: 0.1, duration: 0.8 + rand(), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: rand() })));
        cam.querySelectorAll('.sx-steam').forEach(st => {
          const t2 = gsap.timeline({ repeat: -1, delay: rand() * 1.2 });
          t2.fromTo(st, { y: 3, opacity: 0 }, { y: -3, opacity: 0.7, duration: 0.6, ease: 'sine.out' })
            .to(st, { y: -11, opacity: 0, duration: 0.85, ease: 'sine.in' });
          ctx.loop(t2);
        });
      }

      /* ---------- « Et puis, il y a nous. » ---------- */
      ctx.beat(4.4);
      gsap.set(artur.el, { x: -205 });
      gsap.set(sven.el, { x: 165 });
      artur.walk(4.45, 205, 1.6);
      sven.walk(4.55, -165, 1.4);
      ctx.caption('Et puis, il y a nous.', 4.75, { pos: 'top', variant: 'card', dur: 2.3 });
      sven.tilt(6.0, -7, 0.45);
      sven.tilt(6.75, 0, 0.35);

      // the hand-over
      swing(artur, 'R', -60, 6.3, 0.42, 'power2.out');
      swing(sven, 'L', 58, 6.55, 0.38, 'power2.out');
      tl.to(cupGift, { opacity: 0, duration: 0.08 }, 6.98);
      tl.to(cupSven, { opacity: 1, duration: 0.08 }, 6.98);
      ctx.sfx('pop', 6.98);
      swing(artur, 'R', 0, 7.12, 0.45);
      swing(sven, 'L', 16, 7.12, 0.45);
      sven.emote(7.2, '♥', 1.2);
      ctx.caption('Strasbourg, le grand sapin,<br>un vin chaud.', 7.45, { pos: 'top', variant: 'card', dur: 3.35, html: true });

      // Artur moves his own cup to the right hand (passing it in front of his chest)
      swing(artur, 'L', -36, 7.9, 0.32);
      swing(artur, 'R', 36, 7.9, 0.32);
      tl.to(cupMine, { opacity: 0, duration: 0.08 }, 8.2);
      tl.to(cupMineR, { opacity: 1, duration: 0.08 }, 8.2);
      swing(artur, 'L', 0, 8.3, 0.3);

      // the clink
      swing(artur, 'R', -151, 8.55, 0.5, 'power2.out');
      swing(sven, 'L', 151, 8.58, 0.5, 'power2.out');
      swing(artur, 'R', -144.5, 9.08, 0.08, 'power1.in');
      swing(sven, 'L', 144.5, 9.08, 0.08, 'power1.in');
      swing(artur, 'R', -150, 9.16, 0.16, 'power2.out');
      swing(sven, 'L', 150, 9.16, 0.16, 'power2.out');
      ctx.sfx('clink', 9.14);
      tl.fromTo(sparkEl, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1.15, duration: 0.18, ease: 'power2.out' }, 9.15);
      tl.to(sparkEl, { opacity: 0, scale: 1.4, duration: 0.35, ease: 'power1.in' }, 9.35);
      artur.tilt(9.1, 5, 0.25);
      sven.tilt(9.1, -5, 0.25);
      artur.say(9.2, 'Santé !', 1.15);
      swing(artur, 'R', 34, 9.75, 0.5);
      swing(sven, 'L', 16, 9.75, 0.5);
      artur.tilt(9.75, 0, 0.3);
      sven.tilt(9.75, 0, 0.3);

      /* ---------- the selfie ---------- */
      ctx.beat(10.0);
      tl.to(phone, { opacity: 1, duration: 0.12 }, 10.05);
      swing(artur, 'L', 128, 10.12, 0.5, 'back.out(1.5)');
      tl.to(artur.el, { x: 8, duration: 0.45, ease: 'power2.inOut' }, 10.55);
      tl.to(sven.el, { x: -8, duration: 0.45, ease: 'power2.inOut' }, 10.55);
      artur.tilt(10.6, 9, 0.4);
      sven.tilt(10.6, -9, 0.4);
      tl.to(cam, { scale: 1.07, duration: 1.4, ease: 'sine.inOut' }, 10.5);
      tl.fromTo([faceA, faceS], { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out', stagger: 0.08 }, 11.05);
      tl.to([faceA, faceS], { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 11.55);
      ctx.sfx('tick', 11.55);
      tl.to([faceA, faceS], { opacity: 0, duration: 0.05 }, 11.95);

      const shot = ctx.photo(6, 11.95, { caption: 'Le marché de Noël, à deux.' });
      ctx.backdrop('#0b0a0d', '#0b0a0d', 12.0);

      /* ---------- zoom out into the camera roll ---------- */
      const G0 = 13.62;
      const cells = ctx.ROLL.slice(0, 6).map((r, i) => {
        const p = cellPos(i);
        return `<div class="sx-cell" style="left:${p.x}px;top:${p.y}px;background-image:url(${r.src})"></div>`;
      }).join('');
      const sp = cellPos(6);
      const grid = ctx.html(`<div class="sx-grid">
  <div class="sx-gtitle"><b>Pellicule</b><span>6 photos</span></div>
  <div class="sx-gin">${cells}<div class="sx-slot" style="left:${sp.x}px;top:${sp.y}px"><i class="gl"></i><i class="bd"></i><b class="pl">+</b></div></div>
</div>`);
      const gin = grid.querySelector('.sx-gin');
      const cellEls = grid.querySelectorAll('.sx-cell');
      const slot = grid.querySelector('.sx-slot');
      const gtitle = grid.querySelector('.sx-gtitle');
      // start so that cell 6 sits exactly where the viewer shows the photo (contain-fit, 315 px wide)
      const c6 = cellPos(5), k = 315 / GRID.size;
      const tx = 180 - k * (c6.x + GRID.size / 2), ty = 292 - k * (c6.y + GRID.size / 2);
      gsap.set(grid, { opacity: 0 });
      gsap.set(gin, { x: tx, y: ty, scale: k });
      gsap.set([...cellEls].slice(0, 5), { opacity: 0 });
      gsap.set([slot, gtitle], { opacity: 0 });
      ctx.backdrop('#000000', '#000000', G0);
      tl.to(grid, { opacity: 1, duration: 0.28, ease: 'power1.out' }, G0);
      tl.to(shot.el, { opacity: 0, duration: 0.3 }, G0 + 0.1);
      tl.to(gin, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'power3.inOut' }, G0 + 0.05);
      ctx.sfx('swoosh', G0 + 0.1);
      [...cellEls].slice(0, 5).forEach((el, i) => {
        tl.fromTo(el, { opacity: 0, scale: 0.82 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, G0 + 0.3 + i * 0.13);
      });
      tl.fromTo(gtitle, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, G0 + 0.85);
      tl.fromTo(slot, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, G0 + 1.2);
      ctx.sfx('pop', G0 + 1.22);
      if (!ctx.still) {
        ctx.loop(gsap.to(slot.querySelector('.pl'), { scale: 1.18, duration: 0.75, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        ctx.loop(gsap.to(slot.querySelector('.gl'), { opacity: 1, scale: 1.12, duration: 0.75, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        ctx.loop(gsap.to(slot.querySelector('.bd'), { borderColor: 'rgba(255,255,255,.95)', duration: 0.75, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      }
      ctx.caption('Presque neuf ans de pellicule.', G0 + 1.4, { pos: 'bottom', variant: 'light', dur: 2.4, parent: grid });
      ctx.caption('Et il reste de la place.', G0 + 4.0, { pos: 'bottom', variant: 'light', parent: grid });
      ctx.hold(G0 + 4.7);
      tl.to({}, { duration: 0.25 }, G0 + 4.7);
    },
  });
})();
;

/* ===== js/scenes/08-depart.js ===== */
/* Scène 8 — « depart »
 * Continuité avec la fin de 07-strasbourg : la grille de la pellicule et sa case vide « + ».
 * La case se retourne (flip 3D) et devient un tableau des départs à palettes (split-flap) :
 * PROCHAIN DÉPART · TON CADEAU · ZÜRICH (concert à la Tonhalle) · COLMAR (dîner étoilé).
 * Pas de pause : la scène enchaîne seule sur « zurich ».
 */
(function () {
  'use strict';

  // Roll-grid layout. Keep identical in js/scenes/07-strasbourg.js.
  const GRID = { top: 146, size: 118, gap: 3 };
  const cellPos = (i) => ({
    x: (i % 3) * (GRID.size + GRID.gap),
    y: GRID.top + Math.floor(i / 3) * (GRID.size + GRID.gap),
  });

  // Board geometry (stage px)
  const BOARD = { x: 12, y: 168, w: 336, h: 252 };
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  Story.register({
    id: 'depart', order: 8, title: 'Le cadeau', photos: [], skippable: false,
    bg: '#000000', music: 'low', darkUI: false,
    build(ctx) {
      const tl = ctx.tl, rand = ctx.rand;
      const S = '#stage[data-scene="depart"]';

      ctx.html(`<style>
${S} .dp-abs{position:absolute;left:0;top:0;width:360px;height:640px}
${S} .sx-grid{position:absolute;inset:0;overflow:hidden}
${S} .sx-gin{position:absolute;inset:0}
${S} .sx-gtitle{position:absolute;left:16px;top:78px;color:#fff}
${S} .sx-gtitle b{display:block;font:600 30px/1.1 var(--font-display);letter-spacing:.2px}
${S} .sx-gtitle span{display:block;margin-top:3px;font:500 13px var(--font-display);color:rgba(255,255,255,.55)}
${S} .sx-cell{position:absolute;width:${GRID.size}px;height:${GRID.size}px;background-size:cover;background-position:center;background-color:#1a1a1a}
${S} .sx-slot{position:absolute;width:${GRID.size}px;height:${GRID.size}px}
${S} .sx-slot .gl{position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,122,162,.55),rgba(255,122,162,0));opacity:.45}
${S} .sx-slot .bd{position:absolute;inset:7px;border:2px dashed rgba(255,255,255,.62);border-radius:10px;background:rgba(255,255,255,.05)}
${S} .sx-slot .pl{position:absolute;left:0;top:0;width:100%;height:100%;display:grid;place-items:center;font:500 50px/1 var(--font-display);color:#fff;padding-bottom:4px;box-sizing:border-box}
${S} .cap-light{font-size:19px}
${S} .dp-board{position:absolute;left:${BOARD.x}px;top:${BOARD.y}px;width:${BOARD.w}px;height:${BOARD.h}px;border-radius:12px;
  background:linear-gradient(#171717,#101010);border:1px solid #2c2c2c;overflow:hidden;
  box-shadow:0 22px 46px rgba(0,0,0,.65),0 0 60px rgba(255,207,63,.07),inset 0 0 0 4px #0b0b0b,inset 0 1px 0 4px rgba(255,255,255,.03);z-index:5}
${S} .dp-screw{position:absolute;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#4a4a4a,#1c1c1c)}
${S} .dp-head{position:absolute;left:16px;top:13px;height:24px;display:flex;align-items:center;gap:8px;font:600 13px/1 var(--font-mono);letter-spacing:1.6px;color:#ffcf3f}
${S} .dp-dotw{display:block;width:8px;height:8px}
${S} .dp-dot{display:block;width:8px;height:8px;border-radius:50%;background:#ffcf3f;box-shadow:0 0 8px rgba(255,207,63,.9)}
${S} .dp-head span{display:inline-block}
${S} .dp-clock{position:absolute;left:${BOARD.w - 44}px;top:9px;width:30px;height:30px}
${S} .dp-sep{position:absolute;left:10px;right:10px;height:1px;background:#2a2a2a;box-shadow:0 1px 0 #000}
${S} .dp-t{position:absolute;border-radius:3px;overflow:hidden;display:grid;place-items:center;
  background:linear-gradient(#2b2b2b,#1e1e1e 49.5%,#141414 50.5%,#1b1b1b);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 1px 1px rgba(0,0,0,.7);
  font-family:var(--font-mono);font-weight:600;color:#f3f1ea}
${S} .dp-t b{display:block;line-height:1;position:relative;top:.5px}
${S} .dp-t i{position:absolute;left:0;right:0;top:0;height:50%;background:linear-gradient(#303030,#232323);transform-origin:50% 100%;transform:scaleY(0);border-bottom:1px solid #000}
${S} .dp-t::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;margin-top:-.5px;background:rgba(0,0,0,.85)}
${S} .dp-y{color:#ffcf3f}
${S} .dp-badge{position:absolute;height:22px;border-radius:5px;display:grid;place-items:center;font:700 13px/1 var(--font-mono);letter-spacing:.5px}
${S} .dp-ic{background:#e1251b;color:#fff;width:34px}
${S} .dp-ter{background:#2d5fa8;color:#fff;width:40px}
${S} .dp-icon{position:absolute;width:34px;height:34px}
${S} .dp-hl{position:absolute;left:8px;width:${BOARD.w - 16}px;border:1.5px solid #ffcf3f;border-radius:8px;box-shadow:0 0 14px rgba(255,207,63,.35),inset 0 0 12px rgba(255,207,63,.12)}
${S} .dp-shine{position:absolute;top:-40px;left:0;width:90px;height:${BOARD.h + 80}px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.09),rgba(255,255,255,0));transform:rotate(16deg)}
</style>`);

      ctx.backdrop('#000000', '#000000');
      ctx.backdrop('#0a0b0f', '#111318', 0.95);

      /* ---------- station hall (fades in behind the board) ---------- */
      const station = ctx.html(`<svg class="dp-abs" viewBox="0 0 360 640" aria-hidden="true">
<defs>
  <linearGradient id="dpBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0b0f"/><stop offset=".7" stop-color="#1a1d26"/><stop offset="1" stop-color="#111318"/></linearGradient>
  <radialGradient id="dpLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd98a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  <linearGradient id="dpPlat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262932"/><stop offset="1" stop-color="#121419"/></linearGradient>
  <radialGradient id="dpRefl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf3f" stop-opacity=".16"/><stop offset="1" stop-color="#ffcf3f" stop-opacity="0"/></radialGradient>
</defs>
<rect width="360" height="640" fill="url(#dpBg)"/>
<g fill="none" stroke-linecap="round">
  <path d="M-70 500Q-70 70 180 46Q430 70 430 500" stroke="#1d212b" stroke-width="12"/>
  <path d="M-70 494Q-70 64 180 40Q430 64 430 494" stroke="#2b303c" stroke-width="1.5"/>
  <path d="M-20 520Q-20 140 180 116Q380 140 380 520" stroke="#191c25" stroke-width="7"/>
  <path d="M180 46V116M60 70Q40 100 38 160M300 70Q320 100 322 160M-30 210L40 214M390 210L320 214" stroke="#1b1f28" stroke-width="3"/>
</g>
<rect x="60" y="0" width="3.5" height="${BOARD.y + 4}" fill="#2a2e38"/><rect x="296.5" y="0" width="3.5" height="${BOARD.y + 4}" fill="#2a2e38"/>
<rect x="54" y="${BOARD.y - 8}" width="16" height="9" rx="2" fill="#30343f"/><rect x="290" y="${BOARD.y - 8}" width="16" height="9" rx="2" fill="#30343f"/>
<g>
  <circle cx="16" cy="128" r="70" fill="url(#dpLamp)"/><circle cx="344" cy="128" r="70" fill="url(#dpLamp)"/>
  <path d="M16 72V112M344 72V112" stroke="#2a2e38" stroke-width="2"/>
  <path d="M4 124Q16 106 28 124Z" fill="#3a3e48"/><path d="M332 124Q344 106 356 124Z" fill="#3a3e48"/>
  <ellipse cx="16" cy="125" rx="8" ry="2.5" fill="#ffe2a0"/><ellipse cx="344" cy="125" rx="8" ry="2.5" fill="#ffe2a0"/>
</g>
<rect y="476" width="360" height="164" fill="url(#dpPlat)"/>
<rect y="476" width="360" height="2.5" fill="#363a46"/>
<ellipse cx="180" cy="486" rx="190" ry="22" fill="url(#dpRefl)"/>
<rect y="520" width="360" height="6" fill="#e3bd2c" opacity=".85"/>
<g fill="#c9a524" opacity=".5">${Array.from({ length: 24 }, (_, i) => `<circle cx="${8 + i * 15}" cy="${534}" r="1.6"/>`).join('')}</g>
<path d="M0 600H360" stroke="#0b0c10" stroke-width="3"/>
</svg>`);
      gsap.set(station, { opacity: 0 });

      /* ---------- the roll grid, exactly as strasbourg left it ---------- */
      const cells = ctx.ROLL.slice(0, 6).map((r, i) => {
        const p = cellPos(i);
        return `<div class="sx-cell" style="left:${p.x}px;top:${p.y}px;background-image:url(${r.src})"></div>`;
      }).join('');
      const sp = cellPos(6);
      const grid = ctx.html(`<div class="sx-grid">
  <div class="sx-gtitle"><b>Pellicule</b><span>6 photos</span></div>
  <div class="sx-gin">${cells}<div class="sx-slot" style="left:${sp.x}px;top:${sp.y}px"><i class="gl"></i><i class="bd"></i><b class="pl">+</b></div></div>
</div>`);
      const cellEls = [...grid.querySelectorAll('.sx-cell')];
      const slot = grid.querySelector('.sx-slot');
      const gtitle = grid.querySelector('.sx-gtitle');
      const lastCap = ctx.html('<div class="cap cap-light cap-bottom">Et il reste de la place.</div>');
      if (!ctx.still) {
        ctx.loop(gsap.to(slot.querySelector('.pl'), { scale: 1.18, duration: 0.75, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
        ctx.loop(gsap.to(slot.querySelector('.gl'), { opacity: 1, scale: 1.12, duration: 0.75, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      }

      /* ---------- the departure board ---------- */
      const board = ctx.html('<div class="dp-board"></div>');
      [[7, 7], [BOARD.w - 13, 7], [7, BOARD.h - 13], [BOARD.w - 13, BOARD.h - 13]].forEach(([x, y]) =>
        ctx.html(`<i class="dp-screw" style="left:${x}px;top:${y}px"></i>`, board));
      const head = ctx.html(`<div class="dp-head"><span class="dp-dotw"><i class="dp-dot"></i></span><div class="dp-htxt">${'PROCHAIN DÉPART'.split('').map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div></div>`, board);
      const dot = head.querySelector('.dp-dot'), dotW = head.querySelector('.dp-dotw');
      const headLetters = head.querySelectorAll('.dp-htxt span');
      let ticks = '';
      for (let i = 0; i < 12; i++) ticks += `<path d="M0 -11.2V${i % 3 ? -9.4 : -8.2}" stroke="#111" stroke-width="${i % 3 ? 1 : 1.6}" transform="rotate(${i * 30})"/>`;
      const clock = ctx.html(`<svg class="dp-clock" viewBox="-15 -15 30 30" aria-hidden="true">
  <circle r="14" fill="#2a2a2a"/><circle r="12.8" fill="#f4f3ee"/>${ticks}
  <rect x="-1.15" y="-7.2" width="2.3" height="9" rx=".6" fill="#111" transform="rotate(304)"/>
  <rect x="-.85" y="-10.6" width="1.7" height="13" rx=".5" fill="#111" transform="rotate(48)"/>
  <g class="dp-sec"><path d="M0 3V-7" stroke="#e1251b" stroke-width=".9"/><circle cy="-7.6" r="1.9" fill="#e1251b"/></g>
  <circle r="1" fill="#111"/>
</svg>`, board);
      const sec = clock.querySelector('.dp-sec');
      [42, 98, 174].forEach(y => ctx.html(`<i class="dp-sep" style="top:${y}px"></i>`, board));

      function row(text, x, y, w, h, gap, size, yellow) {
        return text.split('').map((ch, i) => {
          const el = ctx.html(`<div class="dp-t${yellow ? ' dp-y' : ''}" style="left:${(x + i * (w + gap)).toFixed(1)}px;top:${y}px;width:${w}px;height:${h}px;font-size:${size}px"><b></b><i></i></div>`, board);
          return { el, b: el.firstChild, f: el.lastChild, ch };
        });
      }
      const gift = row('TON CADEAU', 29, 51, 26, 36, 2, 23, true);
      const city1 = row('ZÜRICH', 62, 106, 23, 30, 2, 20, true);
      const det1 = row('CONCERT À LA TONHALLE', 16, 143, 13.5, 21, 1, 13, false);
      const city2 = row('COLMAR', 62, 182, 23, 30, 2, 20, true);
      const det2 = row('DÎNER ÉTOILÉ', 16, 219, 13.5, 21, 1, 13, false);
      const ic = ctx.html('<b class="dp-badge dp-ic" style="left:16px;top:110px">IC</b>', board);
      const ter = ctx.html('<b class="dp-badge dp-ter" style="left:16px;top:186px;width:40px">TER</b>', board);
      // little pictograms: a note for the concert, a star for the starred dinner
      const icon1 = ctx.html(`<svg class="dp-icon" style="left:${BOARD.w - 50}px;top:104px" viewBox="0 0 34 34" aria-hidden="true">
  <circle cx="17" cy="17" r="16" fill="#1d1d1d" stroke="#ffcf3f" stroke-opacity=".5"/>
  <path d="M14 23.5V11.5L23 9.5V21.5" stroke="#ffcf3f" stroke-width="2" fill="none" stroke-linejoin="round"/>
  <ellipse cx="11.6" cy="23.6" rx="3" ry="2.3" fill="#ffcf3f"/><ellipse cx="20.6" cy="21.6" rx="3" ry="2.3" fill="#ffcf3f"/></svg>`, board);
      const icon2 = ctx.html(`<svg class="dp-icon" style="left:${BOARD.w - 50}px;top:180px" viewBox="0 0 34 34" aria-hidden="true">
  <circle cx="17" cy="17" r="16" fill="#1d1d1d" stroke="#ffcf3f" stroke-opacity=".5"/>
  <path d="M17 7.5l2.8 6.1 6.6.7-5 4.5 1.4 6.5L17 22l-5.8 3.3 1.4-6.5-5-4.5 6.6-.7z" fill="#ffcf3f"/></svg>`, board);
      const hl = ctx.html('<i class="dp-hl" style="top:101px;height:70px"></i>', board);
      const shine = ctx.html('<i class="dp-shine"></i>', board);
      gsap.set([ic, ter, icon1, icon2, hl, dotW, clock], { opacity: 0 });
      gsap.set(headLetters, { opacity: 0 });

      // split-flap: each tile shuffles through random letters, then settles (seek-safe proxy tween)
      let flapEnd = 0;
      function flap(tiles, start, stagger, base, grow, step) {
        tiles.forEach((t, i) => {
          const n = base + Math.floor(i * grow);
          const seq = [''];
          for (let k = 0; k < n; k++) seq.push(CHARS[Math.floor(rand() * CHARS.length)]);
          seq.push(t.ch === ' ' ? '' : t.ch);
          const o = { p: 0 }, last = seq.length - 1;
          const at = start + i * stagger, dur = last * step;
          flapEnd = Math.max(flapEnd, at + dur);
          tl.to(o, {
            p: last, duration: dur, ease: 'none',
            onUpdate() {
              const k = Math.min(last, Math.floor(o.p)), f = o.p - k;
              if (t.b.textContent !== seq[k]) t.b.textContent = seq[k];
              t.f.style.transform = k < last ? `scaleY(${(1 - f).toFixed(3)})` : 'scaleY(0)';
            },
          }, at);
        });
      }
      function flapSounds(from, to) { for (let t = from; t < to; t += 0.075) ctx.sfx('flap', +t.toFixed(3)); }

      /* ---------- timeline ---------- */
      // 0 → 0.7 : the grid steps back, the empty slot flips over
      tl.to(lastCap, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' }, 0.12);
      tl.to(gtitle, { opacity: 0, duration: 0.3 }, 0.18);
      tl.to(cellEls, { opacity: 0.16, scale: 0.94, duration: 0.35, stagger: 0.03, ease: 'power2.out' }, 0.2);
      tl.to(cellEls, { opacity: 0, duration: 0.4 }, 0.72);
      tl.fromTo(slot, { rotationY: 0, transformPerspective: 600 }, { rotationY: 90, duration: 0.28, ease: 'power2.in' }, 0.42);
      tl.set(slot, { opacity: 0 }, 0.7);
      ctx.sfx('whoosh', 0.42);

      // the board unfolds from the slot
      const s0 = GRID.size / BOARD.w;
      const dx = sp.x + GRID.size / 2 - (BOARD.x + BOARD.w / 2), dy = sp.y + GRID.size / 2 - (BOARD.y + BOARD.h / 2);
      gsap.set(board, { opacity: 0 });
      tl.set(board, { opacity: 1 }, 0.7);
      tl.fromTo(board, { x: dx, y: dy, scale: s0, rotationY: -90, transformPerspective: 900 },
        { x: 0, y: 0, scale: 1, rotationY: 0, duration: 0.9, ease: 'power3.out' }, 0.7);
      tl.to(station, { opacity: 1, duration: 0.7, ease: 'sine.out' }, 0.95);

      // header + clock
      tl.to(headLetters, { opacity: 1, duration: 0.01, stagger: 0.035 }, 1.35);
      ctx.sfx('type', 1.35);
      tl.to([dotW, clock], { opacity: 1, duration: 0.3 }, 1.4);

      // rows
      flap(gift, 1.6, 0.05, 6, 0.6, 0.045);
      flap(city1, 2.4, 0.05, 5, 0.5, 0.045);
      tl.fromTo(ic, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, 2.45);
      flap(det1, 2.6, 0.022, 4, 0.25, 0.04);
      flap(city2, 3.05, 0.05, 5, 0.5, 0.045);
      tl.fromTo(ter, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, 3.1);
      flap(det2, 3.25, 0.022, 4, 0.25, 0.04);
      flapSounds(1.6, flapEnd);

      const cap = ctx.caption('Un week-end, deux destinations.<br><b>Regarde bien.</b>', 3.75, { pos: 'bottom', variant: 'light', html: true });

      tl.fromTo([icon1, icon2], { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.4)', stagger: 0.15 }, Math.max(4.25, flapEnd + 0.1));
      ctx.sfx('ding', Math.max(4.25, flapEnd + 0.1));
      tl.fromTo(shine, { x: -140, rotation: 16 }, { x: BOARD.w + 60, rotation: 16, duration: 0.9, ease: 'power1.inOut' }, 5.0);

      // « Regarde bien » : first stop, Zürich
      tl.to(hl, { opacity: 1, duration: 0.18 }, 5.8);
      tl.to(hl, { opacity: 0.25, duration: 0.18, yoyo: true, repeat: 3 }, 6.0);
      ctx.sfx('tick', 5.8);
      // anticipation (slow lean in), then a fast push into the ZÜRICH row: the next scene takes over
      const zo = { transformOrigin: '50% 54%' };
      tl.to(board, { scale: 1.03, duration: 0.8, ease: 'sine.inOut', ...zo }, 5.8);
      tl.to(board, { scale: 1.42, duration: 0.55, ease: 'power2.in', ...zo }, 6.6);
      tl.to(station, { opacity: 0.35, duration: 0.5, ease: 'power1.in' }, 6.6);
      tl.to(cap, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' }, 6.6);
      ctx.sfx('whoosh', 6.62);
      tl.to({}, { duration: 0.01 }, 7.15);

      // ambient: blinking dot, sweeping seconds hand
      if (!ctx.still) {
        ctx.loop(gsap.to(dot, { opacity: 0.15, duration: 0.5, ease: 'steps(1)', yoyo: true, repeat: -1 }));
        ctx.loop(gsap.to(sec, { rotation: 360, svgOrigin: '0 0', duration: 60, ease: 'none', repeat: -1 }));
      }
    },
  });
})();
;

/* ===== js/scenes/09-zurich.js ===== */
/* Scene 9 — « Option 1 · Zurich » : highlight reel (≈23 s, 4 beats, plays by itself).
 * Beat 1 (0–5.4)    la Limmat vue du Lindenhof (Grossmünster, Fraumünster, cygne)
 * Beat 2 (5.4–10.4) les vitraux de Chagall au Fraumünster (portes TONHALLE qui se ferment à la fin)
 * Beat 3 (10.4–17.2) la Tonhalle : cartes de concerts, Sven dirige l'orchestre
 * Beat 4 (17.2–23.2) Luxemburgerli de chez Sprüngli (Paradeplatz) puis le lac au coucher du soleil (20.45)
 */
(function () {
  'use strict';
  const NAVY = '#1f2a44', GOLD = '#d9a441';
  const T = { b2: 5.4, b3: 10.4, b4: 17.2, lake: 20.45, end: 23.2 };
  const S = '#stage[data-scene="zurich"]';

  const CSS = `<style>
${S} .zl{position:absolute;left:0;top:0;width:360px;height:640px;overflow:hidden}
${S} .zl > svg.bg{position:absolute;left:0;top:0;width:360px;height:640px}
${S} .z-chipwrap{position:absolute;left:0;right:0;top:80px;display:flex;justify-content:center;z-index:25;pointer-events:none}
${S} .z-chip{display:flex;align-items:center;gap:7px;padding:5px 13px 5px 9px;border-radius:999px;background:rgba(31,42,68,.92);color:#f6e7c4;font:600 13px/1 var(--font-display);letter-spacing:.2px;border:1px solid rgba(217,164,65,.7);box-shadow:0 4px 12px rgba(8,12,25,.3)}
${S} .z-chip i{width:16px;height:16px;border-radius:50%;background:${GOLD};color:${NAVY};display:grid;place-items:center;font:700 10px/1 var(--font-display);font-style:normal}
${S} .z-chip span{color:${GOLD}}
${S} .cap-card{background:rgba(31,42,68,.95);color:#fff8f2;border:1px solid rgba(217,164,65,.55);box-shadow:0 8px 20px rgba(8,12,25,.35)}
${S} .cap b{color:#f2c46a}
${S} .z-pin{position:absolute;transform:translate(-50%,-100%);padding:4px 9px;border-radius:999px;background:#fff8f2;color:${NAVY};font:600 13px/1.1 var(--font-display);box-shadow:0 3px 10px rgba(20,25,45,.28);white-space:nowrap;z-index:9}
${S} .z-pin::after{content:"";position:absolute;left:50%;top:100%;margin-left:-5px;border:5px solid transparent;border-top-color:#fff8f2}
${S} .z-glint{mix-blend-mode:overlay;position:absolute;inset:0;-webkit-mask:url(img/face-sven.png) center/100% 100% no-repeat;mask:url(img/face-sven.png) center/100% 100% no-repeat;background:linear-gradient(115deg,#2d5bff 0%,#1fc27a 22%,#ff3b47 44%,#ffd23f 66%,#2d5bff 88%,#1fc27a 100%);background-size:320% 100%;opacity:0;pointer-events:none}
${S} .z-card{position:absolute;width:84px;height:116px;margin:-58px 0 0 -42px;border-radius:9px;background:linear-gradient(160deg,#2b3a5e,#1a2440);box-shadow:0 8px 18px rgba(10,8,20,.45);color:#fff8f2;text-align:center;z-index:12}
${S} .z-card::before{content:"";position:absolute;inset:4px;border:1.5px solid rgba(217,164,65,.85);border-radius:6px}
${S} .z-card .n{position:absolute;left:0;right:0;top:12px;color:${GOLD};font:600 13px/1 var(--font-display)}
${S} .z-card .t{position:absolute;left:5px;right:5px;top:32px;font:600 14px/1.12 var(--font-display);letter-spacing:-.2px}
${S} .z-card .s{position:absolute;left:5px;right:5px;bottom:12px;color:#f2c46a;font:500 13px/1.12 var(--font-display)}
${S} .z-door{position:absolute;top:0;width:180px;height:640px;background:linear-gradient(90deg,#e3cb98,#f5e7c8 72%,#d6b97f);box-shadow:inset 0 0 0 10px #f2e2bf,inset 0 0 0 13px ${GOLD}}
${S} .z-door.r{background:linear-gradient(270deg,#e3cb98,#f5e7c8 72%,#d6b97f)}
${S} .z-door .p{position:absolute;left:30px;right:30px;border:3px solid ${GOLD};border-radius:8px;box-shadow:inset 0 0 0 6px rgba(255,249,234,.55),inset 0 0 0 8px rgba(217,164,65,.35)}
${S} .z-door .h{position:absolute;top:318px;width:8px;height:66px;border-radius:4px;background:linear-gradient(90deg,#94661f,#efcc76,#94661f);box-shadow:0 2px 4px rgba(60,40,10,.35)}
${S} .z-door .pl{position:absolute;top:240px;height:42px;background:linear-gradient(180deg,#f0c866,#b98a30);color:#2a1d0c;font:700 22px/42px var(--font-display);letter-spacing:3px;box-shadow:0 3px 8px rgba(60,40,10,.3)}
${S} .z-note{position:absolute;color:${NAVY};font:600 32px/1 var(--font-display);text-shadow:0 0 6px rgba(255,236,190,.95),0 0 2px #fff;z-index:11;pointer-events:none}
</style>`;

  // weekend bag, hand-local coords (char units)
  const BAG = '<g><path d="M-8 3 Q0 -9 8 3" stroke="#6b4a32" stroke-width="3" fill="none"/>' +
    '<rect x="-18" y="2" width="36" height="24" rx="10" fill="#b07a4f"/><rect x="-18" y="11" width="36" height="3.5" fill="#8a5c3a"/>' +
    '<rect x="-5" y="5" width="10" height="5" rx="2" fill="#e5b860"/><path d="M-12 6 Q-14 14 -11 22" stroke="#d29a6a" stroke-width="2" fill="none" opacity=".7"/></g>';

  function layer(ctx, z, bg) {
    return ctx.html(`<div class="zl" style="z-index:${z};background:${bg || 'transparent'}"></div>`);
  }
  function svg(ctx, parent, inner, style) {
    return ctx.html(`<svg class="bg" viewBox="0 0 360 640" width="360" height="640" style="${style || ''}" aria-hidden="true">${inner}</svg>`, parent);
  }
  function pick(rand, arr) { return arr[Math.floor(rand() * arr.length) % arr.length]; }

  /* ---------- Beat 1 : la Limmat depuis le Lindenhof ---------- */
  function rowOfHouses(rand, x0, x1, base, hMin, hMax) {
    const cols = ['#efd9b0', '#e8b996', '#f3e6cf', '#cfd8b8', '#f0cfa0', '#e6a98e', '#c9d6dc', '#f2dcc8'];
    const roofs = ['#a8573f', '#8f4a38', '#b8664a', '#7e4636'];
    let x = x0, out = '';
    while (x < x1) {
      const w = 22 + Math.round(rand() * 14), h = hMin + Math.round(rand() * (hMax - hMin)), top = base - h;
      const c = pick(rand, cols), r = pick(rand, roofs), rh = 9 + Math.round(rand() * 8);
      out += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${c}"/>`;
      out += `<rect x="${x + w - 4}" y="${top}" width="4" height="${h}" fill="#000" opacity=".07"/>`;
      out += rand() < .5
        ? `<path d="M${x - 2} ${top} L${x + w / 2} ${top - rh} L${x + w + 2} ${top} Z" fill="${r}"/>`
        : `<path d="M${x - 2} ${top} L${x + 4} ${top - rh} L${x + w - 4} ${top - rh} L${x + w + 2} ${top} Z" fill="${r}"/>`;
      const nc = w > 30 ? 3 : 2, gap = (w - nc * 4) / (nc + 1);
      for (let yy = top + 7; yy < base - 14; yy += 11)
        for (let k = 0; k < nc; k++) out += `<rect x="${(x + gap + k * (4 + gap)).toFixed(1)}" y="${yy}" width="4" height="6" fill="#55677f"/>`;
      out += `<rect x="${x + 3}" y="${base - 9}" width="${w - 6}" height="9" rx="3" fill="#6d5a4a" opacity=".55"/>`;
      x += w;
    }
    return out;
  }

  function grossTower(x, w) {
    const c = x + w / 2;
    return `<g>
      <rect x="${x}" y="172" width="${w}" height="170" fill="#ecdab6"/><rect x="${c}" y="172" width="${w / 2}" height="170" fill="#dcc79f"/>
      <rect x="${x - 1.5}" y="228" width="${w + 3}" height="3" fill="#f6ead0"/><rect x="${x - 1.5}" y="262" width="${w + 3}" height="3" fill="#f6ead0"/>
      <path d="M${x + 5} 205 v-16 a3.5 3.5 0 0 1 7 0 v16z M${x + w - 12} 205 v-16 a3.5 3.5 0 0 1 7 0 v16z" fill="#6b5a48"/>
      <circle cx="${c}" cy="246" r="7.5" fill="#f7f0e0" stroke="#c89b4a" stroke-width="2"/><path d="M${c} 246 v-5 M${c} 246 h4" stroke="#3b3326" stroke-width="1.4" stroke-linecap="round"/>
      <rect x="${x + 2}" y="158" width="${w - 4}" height="15" fill="#e3cfa8"/><rect x="${c}" y="158" width="${w / 2 - 2}" height="15" fill="#d2bc93"/>
      <path d="M${x + 6} 171 v-8 a2 2 0 0 1 4 0 v8z M${x + w - 10} 171 v-8 a2 2 0 0 1 4 0 v8z" fill="#7a6650"/>
      <path d="M${x + 1} 159 C${x + 1} 140 ${c - 3} 136 ${c} 129 C${c + 3} 136 ${x + w - 1} 140 ${x + w - 1} 159 Z" fill="#c9b48f"/>
      <path d="M${c} 129 C${c + 3} 136 ${x + w - 1} 140 ${x + w - 1} 159 L${c} 159 Z" fill="#b39d78"/>
      <rect x="${c - 1}" y="119" width="2" height="11" fill="#5d5345"/><circle cx="${c}" cy="120" r="2.2" fill="${GOLD}"/>
    </g>`;
  }

  function beatCity(ctx) {
    const L = layer(ctx, 1, '#9fc6e4');
    const rand = ctx.rand;
    // foliage of the terrace trees: dark base, mid tones, sunlit highlights, a few small autumn accents
    let canopy = '';
    const blobs = (x0, w, y0, h, n, r0, r1, cols, dx, dy) => {
      for (let i = 0; i < n; i++) canopy += `<circle cx="${(x0 + rand() * w + (dx || 0)).toFixed(1)}" cy="${(y0 + rand() * h + (dy || 0)).toFixed(1)}" r="${(r0 + rand() * (r1 - r0)).toFixed(1)}" fill="${pick(rand, cols)}"/>`;
    };
    const tree = (x0, w, y0, h, k) => {
      blobs(x0, w, y0, h, Math.round(15 * k), 22, 34, ['#3d6636', '#46733c']);
      blobs(x0, w, y0, h, Math.round(14 * k), 15, 24, ['#5a8a49', '#66964f'], -4, -6);
      blobs(x0 + 6, w - 12, y0, h * .8, Math.round(10 * k), 8, 14, ['#86b25c', '#98c066'], -7, -10);
      blobs(x0 + 6, w - 12, y0 + 10, h - 20, Math.round(9 * k), 3.5, 6.5, ['#e2ad3c', '#d98b2f', '#ebc552']);
    };
    tree(-30, 140, 34, 200, 1);
    tree(298, 90, 34, 140, .8);
    let gravel = '';
    for (let i = 0; i < 70; i++) gravel += `<circle cx="${(rand() * 360).toFixed(1)}" cy="${(486 + rand() * 154).toFixed(1)}" r="${(0.8 + rand() * 1.4).toFixed(1)}" fill="${rand() < .5 ? '#c9b48f' : '#f7eedc'}"/>`;
    let shimmer = '';
    for (let i = 0; i < 16; i++) { const x = rand() * 340, y = 402 + rand() * 46, w = 8 + rand() * 18; shimmer += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="1.6" rx=".8" fill="#e6f4ff" opacity="${(.35 + rand() * .4).toFixed(2)}"/>`; }

    const far = `
      <defs>
        <linearGradient id="zSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#78acd8"/><stop offset=".55" stop-color="#b6d6ec"/><stop offset="1" stop-color="#f1e8d6"/></linearGradient>
        <linearGradient id="zRiv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ea6c6"/><stop offset="1" stop-color="#3d7096"/></linearGradient>
        <linearGradient id="zGrav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d2b0"/><stop offset="1" stop-color="#efe3c9"/></linearGradient>
      </defs>
      <g class="z1-far">
        <rect width="360" height="420" fill="url(#zSky)"/>
        <g class="z1-clouds" fill="#fff" opacity=".9">
          <ellipse cx="150" cy="168" rx="34" ry="11"/><ellipse cx="170" cy="160" rx="20" ry="12"/>
          <ellipse cx="262" cy="214" rx="28" ry="8"/><ellipse cx="248" cy="208" rx="15" ry="9"/>
          <ellipse cx="70" cy="250" rx="30" ry="8"/>
        </g>
        <path d="M0 270 C60 244 120 256 180 246 C240 236 300 252 360 240 L360 340 L0 340Z" fill="#a7c2ab"/>
        <path d="M0 292 C70 276 150 284 220 272 C280 264 330 276 360 270 L360 340 L0 340Z" fill="#8fae95"/>
        <path d="M120 342 L120 262 L198 262 L198 342Z" fill="#e6d2ac"/>
        <path d="M114 264 L159 238 L204 264Z" fill="#9b6a52"/>
        ${grossTower(124, 26)}${grossTower(162, 26)}
        <g>
          <rect x="256" y="196" width="25" height="150" fill="#cfd5d2"/><rect x="268.5" y="196" width="12.5" height="150" fill="#bcc3c0"/>
          <circle cx="268.5" cy="222" r="8" fill="#2c4a7a" stroke="${GOLD}" stroke-width="2"/><path d="M268.5 222 v-5 M268.5 222 h4" stroke="${GOLD}" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M263 262 v-18 a5.5 5.5 0 0 1 11 0 v18z" fill="#56606b"/>
          <path d="M254 197 L268.5 128 L283 197Z" fill="#5f9e86"/><path d="M268.5 128 L283 197 L268.5 197Z" fill="#478070"/>
          <rect x="253" y="194" width="31" height="4" fill="#e5e8e4"/>
          <circle cx="268.5" cy="126" r="2.4" fill="${GOLD}"/><rect x="267.6" y="116" width="1.8" height="9" fill="${GOLD}"/>
          <path d="M281 300 L304 268 L330 300 L330 346 L281 346Z" fill="#dcd2c0"/><path d="M279 302 L304 266 L332 302Z" fill="#9a5a44"/>
        </g>
        ${rowOfHouses(rand, -6, 370, 392, 44, 74)}
        <rect y="388" width="360" height="9" fill="#bdae92"/><rect y="396" width="360" height="3" fill="#8f826b"/>
        <rect y="399" width="360" height="70" fill="url(#zRiv)"/>
        <g opacity=".18"><rect x="124" y="399" width="26" height="40" fill="#f1dfba"/><rect x="162" y="399" width="26" height="40" fill="#f1dfba"/><rect x="256" y="399" width="25" height="46" fill="#dde3e0"/></g>
        <g class="z1-shim">${shimmer}</g>
        <g class="z1-swan" transform="translate(250 432)">
          <path d="M-18 4 Q0 18 18 4" stroke="#e8f4ff" stroke-width="1.4" fill="none" opacity=".6"/>
          <path d="M-12 0 Q-14 -9 -2 -9 L8 -8 Q12 -8 13 -3 Q12 3 0 3 Q-10 3 -12 0Z" fill="#fff"/>
          <path d="M-6 -8 Q-3 -6 4 -6 Q-2 -4 -6 -8Z" fill="#e2e7ee"/>
          <path d="M9 -7 Q13 -14 10 -20 Q8 -25 12 -26" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <path d="M12 -27 L17 -25 L12 -24Z" fill="#f08a2e"/><circle cx="12.4" cy="-26" r="1" fill="#222"/>
        </g>
        <g class="z1-gulls" fill="none" stroke="#fdfdfd" stroke-width="2" stroke-linecap="round">
          <path class="g1" d="M0 0 Q5 -5 10 0 Q15 -5 20 0" transform="translate(380 150)"/>
          <path class="g2" d="M0 0 Q4 -4 8 0 Q12 -4 16 0" transform="translate(410 178)"/>
        </g>
      </g>`;
    const near = `
      <g class="z1-near">
        <rect y="450" width="360" height="14" fill="#e8dcc2"/><rect y="463" width="360" height="5" fill="#b8a684"/>
        <rect y="468" width="360" height="172" fill="url(#zGrav)"/>
        <ellipse cx="60" cy="520" rx="90" ry="20" fill="#cdbb94" opacity=".55"/><ellipse cx="320" cy="500" rx="80" ry="16" fill="#cdbb94" opacity=".5"/>
        ${gravel}
        <g transform="translate(18 594) skewX(-28)">
          ${[0, 1, 2, 3, 4, 5].map(i => [0, 1].map(j => `<rect x="${i * 22}" y="${j * 22}" width="22" height="22" fill="${(i + j) % 2 ? '#3f3a36' : '#f4ecdb'}" opacity=".85"/>`).join('')).join('')}
        </g>
        ${[[52, 606, '#2f2b28', '#4a4440'], [96, 616, '#f6efe0', '#ffffff']].map(([px, py, c1, c2]) => `<g transform="translate(${px} ${py})"><ellipse cx="0" cy="13" rx="13" ry="4" fill="#000" opacity=".18"/><path d="M-11 13 Q-11 6 -6 5 L-4 -6 L4 -6 L6 5 Q11 6 11 13Z" fill="${c1}"/><rect x="-7" y="-9" width="14" height="4" rx="2" fill="${c1}"/><circle cx="0" cy="-15" r="7" fill="${c1}"/><circle cx="-2.5" cy="-17.5" r="2.2" fill="${c2}" opacity=".6"/></g>`).join('')}
        <path d="M14 640 C20 560 22 440 30 300 L46 300 C44 440 46 560 50 640Z" fill="#b4ae93"/>
        <ellipse cx="28" cy="540" rx="6" ry="14" fill="#ddd6bb"/><ellipse cx="38" cy="460" rx="5" ry="11" fill="#8f8c71"/><ellipse cx="34" cy="380" rx="4" ry="12" fill="#e4dec6"/><ellipse cx="40" cy="600" rx="5" ry="10" fill="#8f8c71"/>
        <path d="M34 320 Q60 260 92 236" stroke="#a49e83" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M330 640 C334 540 336 420 336 190 L350 190 C352 420 352 540 352 640Z" fill="#b4ae93"/>
        <ellipse cx="342" cy="520" rx="5" ry="13" fill="#ddd6bb"/><ellipse cx="344" cy="400" rx="4" ry="12" fill="#8f8c71"/><ellipse cx="341" cy="300" rx="4" ry="10" fill="#e4dec6"/>
        <path d="M338 240 Q318 210 304 176" stroke="#a49e83" stroke-width="6" fill="none" stroke-linecap="round"/>
        <g class="z1-canopy">${canopy}</g>
      </g>`;
    svg(ctx, L, far + near);
    const q = (s) => L.querySelector(s);

    // falling leaves (timeline tweens: seekable)
    const leaves = [];
    for (let i = 0; i < 5; i++) {
      const lf = ctx.html(`<svg viewBox="-6 -6 12 12" width="12" height="12" style="position:absolute;left:0;top:0;z-index:8"><path d="M0 -5 Q5 0 0 5 Q-5 0 0 -5Z" fill="${['#e39a3b', '#d9b347', '#c9762e', '#8db560', '#e3b23b'][i]}"/></svg>`, L);
      leaves.push(lf);
    }

    const sven = ctx.char('sven', { outfit: 'coat', h: 172, x: -80, y: 516, parent: L });
    sven.hold('L', BAG);
    const artur = ctx.char('artur', { outfit: 'casual', h: 166, x: 420, y: 518, parent: L });

    const pins = [
      ['Grossmünster', 112, 124], ['Fraumünster', 290, 116], ['Lindenhof', 64, 300],
    ].map(([t, x, y]) => ctx.html(`<div class="z-pin" style="left:${x}px;top:${y}px">${t}</div>`, L));
    return { L, q, sven, artur, pins, leaves };
  }

  function animCity(ctx, B) {
    const tl = ctx.tl, q = B.q;
    tl.fromTo(q('.z1-far'), { scale: 1.07, transformOrigin: '50% 60%' }, { scale: 1, duration: T.b2, ease: 'sine.out' }, 0);
    tl.fromTo(q('.z1-clouds'), { x: 0 }, { x: 22, duration: T.b2, ease: 'none' }, 0);
    tl.fromTo(q('.z1-shim'), { x: -6 }, { x: 10, duration: T.b2, ease: 'none' }, 0);
    tl.fromTo(q('.z1-swan'), { x: 252 }, { x: 318, duration: T.b2, ease: 'none' }, 0);
    tl.fromTo(q('.z1-swan'), { y: 432 }, { y: 434, duration: .6, ease: 'sine.inOut', yoyo: true, repeat: 8 }, 0);
    tl.fromTo(q('.z1-gulls'), { x: 0, y: 0 }, { x: -330, y: -18, duration: 5, ease: 'none' }, .3);
    tl.fromTo(q('.z1-gulls .g1'), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: -.6, duration: .22, yoyo: true, repeat: 21, ease: 'sine.inOut' }, .3);
    tl.fromTo(q('.z1-gulls .g2'), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: -.6, duration: .26, yoyo: true, repeat: 17, ease: 'sine.inOut' }, .3);
    tl.fromTo(q('.z1-canopy'), { rotation: 0, svgOrigin: '180 640' }, { rotation: .6, duration: 1.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0);
    B.leaves.forEach((lf, i) => {
      const x0 = i % 2 ? 300 + i * 8 : 30 + i * 18, y0 = 120 + i * 30;
      tl.fromTo(lf, { x: x0, y: y0, rotation: 0, opacity: 1 },
        { x: x0 + (i % 2 ? -70 : 60), y: y0 + 300, rotation: 400 * (i % 2 ? -1 : 1), duration: 4.6, ease: 'sine.in' }, .2 + i * .45);
    });

    // characters
    B.sven.walk(.25, 200, 1.5);
    B.artur.walk(.45, -188, 1.4);
    // Sven points across the river at the towers
    B.sven.raise(1.62, 'R', 18, .14);
    B.sven.raise(1.76, 'R', -128, .36);
    B.sven.tilt(1.76, 7);
    B.pins.forEach((p, i) => {
      tl.fromTo(p, { opacity: 0, scale: .4, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: .35, ease: 'back.out(2.4)' }, 1.95 + i * .35);
      tl.to(p, { opacity: 0, y: -6, duration: .3 }, 4.7 + i * .08);
      ctx.sfx('tick', 1.95 + i * .35);
    });
    B.sven.lower(3.2, 'R');
    B.sven.tilt(3.2, 0);
    B.artur.say(2.9, 'Grüezi Züri !', 1.9);
    B.artur.wave(2.95, 'R', 2);
    B.sven.hop(3.7, 14);
    ctx.caption('Zurich&nbsp;: la <b>Limmat</b>, le <b>Grossmünster</b>, la vue du <b>Lindenhof</b>.', .9, { html: true, dur: 4.2 });
  }

  /* ---------- Beat 2 : les vitraux de Chagall ---------- */
  const WIN = [
    { cx: 52, top: 136, pal: ['#c4202f', '#e0393f', '#9e1726', '#f0604a', '#7c1020', '#ff8a5c'], glow: '#ff4a3a' },
    { cx: 116, top: 124, pal: ['#1d3fa8', '#2f5fd0', '#14307f', '#4b7be8', '#0f2366', '#6a9cf5'], glow: '#3f74ff' },
    { cx: 180, top: 114, pal: ['#138a52', '#22a866', '#0d6b3e', '#4cc283', '#0a5432', '#8fdc8a'], glow: '#2fd47e' },
    { cx: 244, top: 124, pal: ['#e8b51e', '#f7cf3c', '#c99312', '#ffe27a', '#a8770c', '#ff9f2e'], glow: '#ffc93a' },
    { cx: 308, top: 136, pal: ['#2340a0', '#3556c4', '#5a3fa8', '#1a2c78', '#4e7fe0', '#7aa8ff'], glow: '#5b7dff' },
  ];
  const WBOT = 418, WW = 40;
  function lancet(x0, top) {
    const x1 = x0 + WW, cx = x0 + WW / 2;
    return `M${x0} ${WBOT} V${top + 26} Q${x0} ${top + 6} ${cx} ${top} Q${x1} ${top + 6} ${x1} ${top + 26} V${WBOT} Z`;
  }
  function winSymbol(i, cx, top) {
    const c = 'stroke="#fff6d8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".45"';
    if (i === 0) return `<circle cx="${cx}" cy="${top + 60}" r="10" ${c}/><path d="M${cx - 8} ${top + 200} q4 -16 8 -4 q4 -18 8 4" ${c}/>`;
    if (i === 1) return `<path d="M${cx - 12} ${top + 250} L${cx + 6} ${top + 110} M${cx - 4} ${top + 252} L${cx + 14} ${top + 112}" ${c}/>` +
      [0, 1, 2, 3, 4, 5].map(k => `<path d="M${cx - 11 + k * 3 + 1} ${top + 238 - k * 24} h8" ${c}/>`).join('') +
      `<circle cx="${cx + 8}" cy="${top + 86}" r="4" ${c}/>`;
    if (i === 2) return `<path d="M${cx} ${top + 280} V${top + 120} M${cx - 14} ${top + 150} H${cx + 14}" ${c}/><circle cx="${cx}" cy="${top + 104}" r="12" ${c}/>`;
    if (i === 3) return `<path d="M${cx - 10} ${top + 230} Q${cx - 12} ${top + 170} ${cx + 8} ${top + 160} L${cx + 8} ${top + 232} Z" ${c}/><path d="M${cx - 5} ${top + 190} v38 M${cx + 1} ${top + 178} v52" ${c}/><path d="M${cx - 8} ${top + 70} l4 -10 l4 8 l4 -8 l4 10 z" ${c}/>`;
    return `<rect x="${cx - 13}" y="${top + 150}" width="12" height="20" rx="5" ${c}/><rect x="${cx + 1}" y="${top + 150}" width="12" height="20" rx="5" ${c}/><path d="M${cx} ${top + 70} l0 30 M${cx - 8} ${top + 84} l16 0" ${c}/>`;
  }
  function beatChagall(ctx) {
    const L = layer(ctx, 2, '#0c1020');
    const rand = ctx.rand;
    let defs = '<filter id="zBlur" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<linearGradient id="zWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d1a"/><stop offset=".6" stop-color="#151a30"/><stop offset="1" stop-color="#0e1222"/></linearGradient>';
    let wins = '', glows = '', beams = '';
    WIN.forEach((w, i) => {
      const x0 = w.cx - WW / 2;
      defs += `<clipPath id="zWin${i}"><path d="${lancet(x0, w.top)}"/></clipPath>`;
      defs += `<linearGradient id="zBeam${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${w.glow}" stop-opacity=".55"/><stop offset="1" stop-color="${w.glow}" stop-opacity="0"/></linearGradient>`;
      // mosaic: jittered grid of glass pieces
      const cols = 3, rows = Math.ceil((WBOT - w.top) / 20), cw = WW / cols;
      const P = [];
      for (let r = 0; r <= rows; r++) {
        P[r] = [];
        for (let k = 0; k <= cols; k++) {
          const edge = k === 0 || k === cols;
          P[r][k] = [x0 + k * cw + (edge ? 0 : (rand() - .5) * 9), w.top + r * 20 + (r === 0 || r === rows ? 0 : (rand() - .5) * 10)];
        }
      }
      let glass = '';
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const pts = [P[r][k], P[r][k + 1], P[r + 1][k + 1], P[r + 1][k]].map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
        const bright = r < 3 ? 3 : Math.floor(rand() * 6);
        glass += `<polygon points="${pts}" fill="${w.pal[bright]}"/>`;
      }
      let bars = '';
      for (let y = w.top + 40; y < WBOT; y += 60) bars += `<rect x="${x0}" y="${y}" width="${WW}" height="2.2" fill="#07080f"/>`;
      wins += `<g class="z2-win" clip-path="url(#zWin${i})"><g stroke="#07080f" stroke-width="1.3" stroke-linejoin="round">${glass}</g>${bars}${winSymbol(i, w.cx, w.top)}
        <rect x="${x0}" y="${w.top}" width="${WW / 2.6}" height="${WBOT - w.top}" fill="#fff" opacity=".08"/></g>
        <path d="${lancet(x0, w.top)}" fill="none" stroke="#2a3150" stroke-width="5"/><path d="${lancet(x0, w.top)}" fill="none" stroke="#3a4266" stroke-width="1.2" transform="translate(-3 0)" opacity=".7"/>`;
      glows += `<rect class="z2-glow" x="${x0 - 12}" y="${w.top - 6}" width="${WW + 24}" height="${WBOT - w.top + 14}" rx="20" fill="${w.glow}" filter="url(#zBlur)"/>`;
      const fx = w.cx + 18 + (i - 2) * 8;
      beams += `<polygon class="z2-beam" points="${x0 + 3},${w.top + 120} ${x0 + WW - 3},${w.top + 120} ${fx + 46},640 ${fx - 30},640" fill="url(#zBeam${i})"/>`;
    });
    let motes = '';
    for (let i = 0; i < 16; i++) motes += `<circle class="z2-mote" cx="${(30 + rand() * 300).toFixed(0)}" cy="${(330 + rand() * 250).toFixed(0)}" r="${(0.9 + rand() * 1.3).toFixed(1)}" fill="#fff6dc" opacity="${(.4 + rand() * .5).toFixed(2)}"/>`;
    let ribs = '';
    [84, 148, 212, 276].forEach(x => { ribs += `<rect x="${x - 3}" y="80" width="6" height="400" fill="#1d2440"/><rect x="${x - 3}" y="80" width="2" height="400" fill="#2a3355"/>`; });
    const floor = `<path d="M0 470 H360 V640 H0Z" fill="#10142a"/>` +
      [0, 1, 2, 3, 4, 5, 6].map(k => `<path d="M${180 + (k - 3) * 30} 470 L${180 + (k - 3) * 110} 640" stroke="#1b2140" stroke-width="1.5"/>`).join('') +
      [492, 522, 562, 612].map(y => `<path d="M0 ${y} H360" stroke="#1b2140" stroke-width="1.5"/>`).join('') +
      `<rect y="466" width="360" height="6" fill="#1d2442"/>`;
    const pews = [0, 1].map(k => `<g transform="translate(${k ? 268 : -20} 556)"><rect x="0" y="0" width="112" height="16" rx="5" fill="#2a1f22"/><rect x="0" y="0" width="112" height="4" rx="2" fill="#4a3530"/><rect x="${k ? 8 : 94}" y="10" width="10" height="84" fill="#221a1d"/></g>`).join('');
    // coloured pools of light where the beams land (under Sven, so he stands out from the dark floor)
    let pool = '';
    [[70, 528, 0], [128, 508, 1], [192, 516, 2], [252, 506, 3], [308, 526, 4]].forEach(([x, y, i]) => {
      defs += `<radialGradient id="zPool${i}"><stop offset="0" stop-color="${WIN[i].glow}" stop-opacity=".55"/><stop offset=".55" stop-color="${WIN[i].glow}" stop-opacity=".22"/><stop offset="1" stop-color="${WIN[i].glow}" stop-opacity="0"/></radialGradient>`;
      pool += `<ellipse cx="${x}" cy="${y}" rx="78" ry="30" fill="url(#zPool${i})"/>`;
    });
    defs += '<radialGradient id="zHalo"><stop offset="0" stop-color="#fff3d6" stop-opacity=".5"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>';
    svg(ctx, L, `<defs>${defs}</defs>
      <rect width="360" height="640" fill="url(#zWall)"/>
      <path d="M0 80 Q180 20 360 80 L360 40 L0 40Z" fill="#090b16"/>
      <path d="M0 140 Q90 70 180 64 Q270 70 360 140" fill="none" stroke="#1d2440" stroke-width="6"/>
      ${ribs}<g class="z2-glows" opacity="0">${glows}</g>${floor}<g class="z2-pool" opacity="0">${pool}<ellipse cx="196" cy="470" rx="92" ry="70" fill="url(#zHalo)"/></g><g class="z2-wins">${wins}</g>`);
    const sven = ctx.char('sven', { outfit: 'coat', h: 160, x: 420, y: 522, parent: L });
    sven.svg.style.filter = 'drop-shadow(0 0 3px rgba(255,240,205,.55)) drop-shadow(0 0 9px rgba(140,180,255,.35))';
    const glint = ctx.html('<div class="z-glint"></div>', sven.head);
    const fx = svg(ctx, L, `<g class="z2-beams" opacity="0">${beams}
      <ellipse cx="110" cy="560" rx="60" ry="16" fill="#3f74ff" opacity=".22"/><ellipse cx="210" cy="590" rx="70" ry="18" fill="#2fd47e" opacity=".18"/>
      <ellipse cx="290" cy="560" rx="60" ry="14" fill="#ffc93a" opacity=".18"/><ellipse cx="60" cy="600" rx="50" ry="14" fill="#ff4a3a" opacity=".2"/></g>
      <g class="z2-motes" opacity="0">${motes}</g>`, 'z-index:7;mix-blend-mode:screen;pointer-events:none');
    ctx.html(pews.length ? `<svg class="bg" viewBox="0 0 360 640" width="360" height="640" style="z-index:8" aria-hidden="true">${pews}</svg>` : '', L);
    return { L, q: (s) => L.querySelector(s), qa: (s) => L.querySelectorAll(s), sven, glint, fx };
  }
  function animChagall(ctx, B) {
    const tl = ctx.tl, t0 = T.b2;
    ctx.backdrop('#0a0d1a', '#10142a', t0);
    tl.fromTo(B.L, { clipPath: 'circle(0px at 268px 150px)', webkitClipPath: 'circle(0px at 268px 150px)' }, { clipPath: 'circle(760px at 268px 150px)', webkitClipPath: 'circle(760px at 268px 150px)', duration: .8, ease: 'power2.in' }, t0 - .25);
    ctx.sfx('whoosh', t0 - .2);
    const wins = B.qa('.z2-win'), glows = B.qa('.z2-glow');
    tl.set(B.q('.z2-glows'), { opacity: 1 }, t0);
    wins.forEach((w, i) => {
      const at = t0 + .45 + Math.abs(i - 2) * .22;
      tl.fromTo(w, { opacity: .14 }, { opacity: 1, duration: .6, ease: 'power2.out' }, at);
      tl.fromTo(glows[i], { opacity: 0 }, { opacity: .75, duration: .8, ease: 'power2.out' }, at);
      tl.to(glows[i], { opacity: .45, duration: .9, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at + .9);
    });
    ctx.sfx('magic', t0 + .45);
    tl.fromTo(B.q('.z2-beams'), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, t0 + .9);
    tl.fromTo(B.q('.z2-pool'), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, t0 + .8);
    tl.fromTo(B.q('.z2-motes'), { opacity: 0 }, { opacity: 1, duration: 1 }, t0 + 1.2);
    B.qa('.z2-mote').forEach((m, i) => {
      tl.fromTo(m, { x: 0, y: 0 }, { x: (i % 3 - 1) * 10, y: -26 - (i % 4) * 8, duration: 4.4, ease: 'sine.inOut' }, t0 + .6);
    });
    B.sven.walk(t0 + .3, -224, 1.5);
    B.sven.tilt(t0 + 2, -9, .6);
    B.sven.emote(t0 + 2.2, '✨', 1.6);
    B.sven.raise(t0 + 2.6, 'L', 30, .4);
    B.sven.raise(t0 + 2.6, 'R', -30, .4);
    tl.fromTo(B.glint, { opacity: 0, backgroundPosition: '0% 50%' }, { opacity: .9, duration: 1.2, ease: 'sine.out' }, t0 + 1.2);
    tl.fromTo(B.glint, { backgroundPosition: '0% 50%' }, { backgroundPosition: '100% 50%', duration: 3.8, ease: 'sine.inOut', immediateRender: false }, t0 + 1.2);
    ctx.caption('Les vitraux de <b>Chagall</b> au <b>Fraumünster</b>.', t0 + .9, { html: true, dur: 3.45 });
  }

  /* ---------- Beat 3 : la Tonhalle ---------- */
  function musician(x, y, s, inst) {
    const N = '#1f2a44', I = '#34466e';
    let g = `<g class="z3-mus" transform="translate(${x} ${y}) scale(${s})">`;
    if (inst === 'ti') g += `<ellipse cx="14" cy="-6" rx="13" ry="5" fill="${I}"/><path d="M1 -6 L4 8 L24 8 L27 -6Z" fill="#a8742e"/><ellipse cx="14" cy="-6" rx="13" ry="5" fill="#e9dcc0" opacity=".9"/>`;
    g += `<path d="M-10 10 L-8 -16 Q0 -21 8 -16 L10 10Z" fill="${N}"/><circle cx="0" cy="-26" r="7.5" fill="${N}"/>`;
    if (inst === 'vn') g += `<ellipse cx="9" cy="-15" rx="7" ry="3.6" transform="rotate(-25 9 -15)" fill="#7a4524"/><path d="M-4 -24 L22 -2" stroke="#e9dcc0" stroke-width="1.2"/>`;
    if (inst === 'vc') g += `<ellipse cx="2" cy="2" rx="8" ry="12" fill="#7a4524"/><path d="M2 -10 V-34" stroke="#5a3218" stroke-width="2"/><path d="M-12 -4 L14 4" stroke="#e9dcc0" stroke-width="1.2"/>`;
    if (inst === 'cb') g += `<ellipse cx="4" cy="0" rx="9" ry="15" fill="#6a3a1e"/><path d="M4 -14 V-46" stroke="#5a3218" stroke-width="2.4"/>`;
    if (inst === 'tp') g += `<path d="M3 -24 H22" stroke="${GOLD}" stroke-width="2.2"/><path d="M20 -28 L27 -31 L27 -17 L20 -20Z" fill="${GOLD}"/>`;
    if (inst === 'hn') g += `<circle cx="10" cy="-12" r="6" fill="none" stroke="${GOLD}" stroke-width="2.4"/><path d="M14 -16 L20 -24" stroke="${GOLD}" stroke-width="3"/>`;
    if (inst !== 'ti') g += `<path d="M${inst === 'cb' ? -18 : 16} 10 V-12" stroke="#2b2d36" stroke-width="1.6"/><rect x="${inst === 'cb' ? -27 : 7}" y="-22" width="18" height="11" rx="1" fill="#fff4d8" transform="rotate(${inst === 'cb' ? 12 : -12} ${inst === 'cb' ? -18 : 16} -16)"/>`;
    return g + '</g>';
  }
  function chandelier(x, y, s) {
    let bulbs = '';
    [-26, -15, -5, 5, 15, 26].forEach((dx, i) => {
      const yy = (i === 0 || i === 5) ? 4 : 8;
      bulbs += `<path d="M${dx} ${yy + 6} V${yy - 2}" stroke="#c8952f" stroke-width="2"/><circle class="z3-bulb" cx="${dx}" cy="${yy - 5}" r="3.4" fill="#fff4cc"/>`;
    });
    let drops = '';
    for (let k = -22; k <= 22; k += 6) drops += `<ellipse cx="${k}" cy="${22 + Math.abs(k) * -.2}" rx="1.4" ry="3" fill="#e9f3ff" opacity=".85"/>`;
    return `<g class="z3-chand" transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 -70 V-18" stroke="#8e6a2a" stroke-width="2"/>
      <circle cx="0" cy="0" r="40" fill="url(#zLamp)"/>
      <path d="M-30 10 Q0 30 30 10" stroke="${GOLD}" stroke-width="4" fill="none"/><path d="M-20 -6 Q0 6 20 -6" stroke="#e8be62" stroke-width="3" fill="none"/>
      <ellipse cx="0" cy="12" rx="9" ry="12" fill="${GOLD}"/><ellipse cx="-3" cy="8" rx="3" ry="5" fill="#f6dc95"/>
      ${drops}${bulbs}<circle cx="0" cy="-20" r="4" fill="${GOLD}"/></g>`;
  }
  function beatTonhalle(ctx) {
    const L = layer(ctx, 3, '#efdfbd');
    let ceil = '';
    for (let x = -10; x < 370; x += 40) ceil += `<rect x="${x + 4}" y="40" width="32" height="26" rx="3" fill="#e5cfa0" stroke="${GOLD}" stroke-width="2"/><circle cx="${x + 20}" cy="53" r="4" fill="${GOLD}"/>`;
    let rail = '';
    for (let x = 4; x < 360; x += 9) rail += `<rect x="${x}" y="214" width="4" height="16" rx="2" fill="${GOLD}"/>`;
    let pipes = '';
    const ph = [62, 74, 88, 100, 112, 100, 88, 74, 62];
    ph.forEach((h, i) => { const x = 128 + i * 12; pipes += `<rect x="${x}" y="${292 - h}" width="9" height="${h}" rx="1" fill="#d6dbe1"/><rect x="${x + 1}" y="${292 - h}" width="3" height="${h}" fill="#fff" opacity=".6"/><path d="M${x} ${292 - h + 10} l4.5 5 l4.5 -5" fill="#8d96a3"/>`; });
    const arch = (x0, x1, top) => `<path d="M${x0} 300 V${top + 34} Q${x0} ${top} ${(x0 + x1) / 2} ${top} Q${x1} ${top} ${x1} ${top + 34} V300" fill="#d9c49c" stroke="${GOLD}" stroke-width="4"/>`;
    const pil = (x) => `<rect x="${x - 6}" y="104" width="12" height="200" fill="#f7ecd2"/><rect x="${x - 6}" y="104" width="3" height="200" fill="#fff8ea"/><rect x="${x - 9}" y="100" width="18" height="10" rx="2" fill="${GOLD}"/><path d="M${x - 8} 112 q8 8 16 0" stroke="${GOLD}" stroke-width="2.5" fill="none"/>`;
    const garland = (x0, x1, y) => `<path d="M${x0} ${y} Q${(x0 + x1) / 2} ${y + 14} ${x1} ${y}" stroke="${GOLD}" stroke-width="3" fill="none"/><circle cx="${(x0 + x1) / 2}" cy="${y + 8}" r="3" fill="#f3d58a"/>`;
    const players = [
      [52, 318, .62, 'ti'], [96, 316, .62, 'tp'], [126, 316, .62, 'tp'], [236, 316, .62, 'hn'], [266, 316, .62, 'hn'], [306, 318, .62, 'ti'],
      [36, 360, .8, 'vc'], [80, 360, .8, 'vc'], [118, 360, .8, 'vc'], [244, 360, .8, 'vn'], [286, 360, .8, 'cb'], [328, 360, .8, 'cb'],
      [22, 404, 1, 'vn'], [66, 404, 1, 'vn'], [108, 404, 1, 'vn'], [256, 404, 1, 'vn'], [300, 404, 1, 'vn'], [344, 404, 1, 'vn'],
    ];
    const orch = players.map(p => musician(...p)).join('');
    const seatRow = (y, w, h, off) => {
      let r = '';
      for (let x = off; x < 380; x += w + 4) r += `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * .3}" fill="#a3212b"/><rect x="${x + 3}" y="${y + 2}" width="${w - 6}" height="${h * .35}" rx="${w * .22}" fill="#cf3d47"/><rect x="${x + w - 5}" y="${y + 4}" width="4" height="${h - 6}" rx="2" fill="#7e1720"/></g>`;
      return r;
    };
    svg(ctx, L, `<defs>
        <linearGradient id="zWallT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ead0"/><stop offset="1" stop-color="#e9d3a6"/></linearGradient>
        <radialGradient id="zPaint" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fbe6c8"/><stop offset=".6" stop-color="#c9dbe8"/><stop offset="1" stop-color="#a9c2d9"/></radialGradient>
        <radialGradient id="zLamp"><stop offset="0" stop-color="#fff2c0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
        <linearGradient id="zStage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99260"/><stop offset="1" stop-color="#9a6537"/></linearGradient>
        <linearGradient id="zHall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b1d24"/><stop offset="1" stop-color="#3d0f15"/></linearGradient>
      </defs>
      <rect width="360" height="640" fill="url(#zWallT)"/>
      <rect width="360" height="104" fill="#e2cb98"/>${ceil}
      <rect y="66" width="360" height="40" fill="#ead6a8"/>
      <ellipse cx="180" cy="96" rx="150" ry="30" fill="url(#zPaint)" stroke="${GOLD}" stroke-width="5"/>
      <ellipse cx="120" cy="96" rx="26" ry="7" fill="#fff" opacity=".7"/><ellipse cx="236" cy="90" rx="30" ry="7" fill="#fff" opacity=".6"/>
      <path d="M60 104 H300" stroke="#c48f2f" stroke-width="3"/>
      ${arch(18, 104, 120)}${arch(256, 342, 120)}
      <path d="M116 300 V176 Q116 140 180 136 Q244 140 244 176 V300Z" fill="#7a5233"/><path d="M116 300 V176 Q116 140 180 136 Q244 140 244 176 V300" fill="none" stroke="${GOLD}" stroke-width="4"/>
      ${pipes}
      <rect y="206" width="360" height="8" fill="#c48f2f"/>${rail}<rect y="228" width="360" height="5" fill="#c48f2f"/>
      ${pil(10)}${pil(112)}${pil(248)}${pil(350)}
      ${garland(20, 102, 144)}${garland(258, 340, 144)}
      <rect y="296" width="360" height="130" fill="url(#zStage)"/>
      <rect y="296" width="360" height="6" fill="#dcae7c"/><rect y="336" width="360" height="3" fill="#a87443"/><rect y="378" width="360" height="3" fill="#a87443"/>
      <g class="z3-orch">${orch}</g>
      <rect y="424" width="360" height="22" fill="#3b2420"/><rect y="424" width="360" height="3" fill="${GOLD}"/>
      <rect y="446" width="360" height="194" fill="url(#zHall)"/>
      ${seatRow(468, 30, 30, -8)}${seatRow(516, 38, 38, -20)}${seatRow(578, 46, 50, -4)}
      <g class="z3-chands">${chandelier(64, 182, .9)}${chandelier(296, 182, .9)}</g>`);
    // conductor's podium + desk
    const pod = svg(ctx, L, `<rect x="146" y="430" width="68" height="20" rx="3" fill="#2c1b17"/><rect x="146" y="430" width="68" height="3" fill="${GOLD}"/>
      <path d="M240 446 V404" stroke="#2b2d36" stroke-width="3"/><rect x="222" y="394" width="38" height="14" rx="2" fill="#2b2d36" transform="rotate(-8 241 401)"/>
      <rect x="225" y="388" width="32" height="12" rx="1" fill="#fff4d8" transform="rotate(-8 241 394)"/>`, 'z-index:4');
    const sven = ctx.char('sven', { outfit: 'smart', h: 160, x: 180, y: 436, parent: L });
    const held = sven.hold('R', '<g><path d="M0 0 L16 52" stroke="#fffaf0" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="4" ry="7" transform="rotate(-17)" fill="#c9a26a"/></g>');
    const loose = svg(ctx, L, '<g class="z3-loose"><path d="M226 384 L262 378" stroke="#fffaf0" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="226" cy="384" rx="5" ry="3" fill="#c9a26a"/></g>', 'z-index:6');
    const spark = ctx.html('<div class="z-note" style="left:0;top:0;font-size:22px">✦</div>', L);
    const cards = [
      ['Mahler 6', 'novembre'], ['Nouvel An', 'Wayne<br>Marshall'], ['Beethoven', 'Buchbinder<br>avril'], ['Igor Levit', 'mai'],
    ].map(([t, s2], i) => ctx.html(`<div class="z-card" style="left:${57 + i * 82}px;top:${446 + (i === 0 || i === 3 ? 6 : 0)}px"><div class="n">♪</div><div class="t">${t}</div><div class="s">${s2}</div></div>`, L));
    const notes = [];
    for (let i = 0; i < 12; i++) notes.push(ctx.html(`<div class="z-note" style="left:0;top:0">${['♪', '♫', '♬', '♩'][i % 4]}</div>`, L));
    // the gilded doors of the hall live in their own layer (above the hall, below Sprüngli):
    // they slide shut over the chapel, then swing open on the Tonhalle. The plaque reads TON|HALLE across the seam.
    const DL = layer(ctx, 3);
    DL.style.pointerEvents = 'none';
    const doors = [0, 1].map(i => ctx.html(`<div class="z-door${i ? ' r' : ''}" style="left:${i * 180}px">
      <div class="p" style="top:112px;height:104px"></div><div class="p" style="top:302px;height:250px"></div>
      <div class="h" style="${i ? 'left' : 'right'}:13px"></div>
      <div class="pl" style="${i ? 'left:0;width:118px;border-radius:0 22px 22px 0;text-align:left' : 'right:0;width:84px;border-radius:22px 0 0 22px;text-align:right'}">${i ? 'HALLE' : 'TON'}</div></div>`, DL));
    return { L, DL, q: (s) => L.querySelector(s), qa: (s) => L.querySelectorAll(s), sven, held, loose, spark, cards, notes, doors, pod };
  }

  function animTonhalle(ctx, B) {
    const tl = ctx.tl, t0 = T.b3;
    ctx.backdrop('#e2cb98', '#3d0f15', t0);
    // doors slide shut over the chapel…
    tl.fromTo(B.doors[0], { x: -196 }, { x: 0, duration: .42, ease: 'power3.in' }, t0 - .44);
    tl.fromTo(B.doors[1], { x: 196 }, { x: 0, duration: .42, ease: 'power3.in' }, t0 - .44);
    ctx.sfx('thud', t0 - .03);
    tl.fromTo(B.DL, { y: 0 }, { y: 2, duration: .06, yoyo: true, repeat: 1, ease: 'power1.out' }, t0 - .02);
    tl.fromTo(B.L, { opacity: 0 }, { opacity: 1, duration: .01, ease: 'none' }, t0 - .01);
    // …and swing open on the Tonhalle
    tl.fromTo(B.doors[0], { scaleX: 1, transformOrigin: '0% 50%' }, { scaleX: 0, duration: .75, ease: 'power2.inOut', immediateRender: false }, t0 + .2);
    tl.fromTo(B.doors[1], { scaleX: 1, transformOrigin: '100% 50%' }, { scaleX: 0, duration: .75, ease: 'power2.inOut', immediateRender: false }, t0 + .2);
    tl.set(B.DL, { visibility: 'hidden' }, t0 + 1);
    ctx.sfx('swoosh', t0 + .2);
    B.qa('.z3-chand').forEach((c, i) => {
      tl.fromTo(c, { rotation: -1.5 }, { rotation: 1.5, duration: 1.5, yoyo: true, repeat: 3, ease: 'sine.inOut', svgOrigin: `${i ? 296 : 64} ${182 - 63}` }, t0);
    });
    tl.fromTo(B.qa('.z3-bulb'), { opacity: .75 }, { opacity: 1, duration: .3, yoyo: true, repeat: 15, stagger: { each: .05, from: 'random' }, ease: 'sine.inOut' }, t0);
    ctx.caption('Le soir&nbsp;: la <b>Tonhalle</b>.<br>Le concert&nbsp;? C’est <b>toi</b> qui choisis.', t0 + .6, { html: true, dur: T.b4 - .45 - (t0 + .6) });

    // the fan of concert cards (readable for ~2.6 s)
    const rot = [-9, -3, 3, 9];
    B.cards.forEach((c, i) => {
      const fx = 57 + i * 82;
      tl.fromTo(c, { x: 180 - fx, y: 40 - (i === 0 || i === 3 ? 6 : 0), rotation: 0, scale: .7, opacity: 0 },
        { x: 0, y: 0, rotation: rot[i], scale: 1, opacity: 1, duration: .6, ease: 'back.out(1.5)' }, t0 + .95 + i * .09);
      tl.to(c, { y: -7, duration: .22, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t0 + 1.9 + i * .14);
      tl.to(c, { x: 180 - fx, y: -24, rotation: 0, scale: .35, opacity: 0, duration: .45, ease: 'power2.in' }, t0 + 3.95 + (3 - i) * .04);
    });
    ctx.sfx('flap', t0 + .95);
    ctx.sfx('swoosh', t0 + 3.95);

    // Sven grabs the baton and conducts
    const s = B.sven, t1 = t0 + 4.2;
    tl.set(B.held, { opacity: 0 }, 0);
    s.tilt(t1, 9, .25);
    tl.to(s.el, { y: 4, duration: .2, ease: 'power2.out' }, t1);
    s.raise(t1, 'R', -38, .28);
    const tg = t1 + .35;
    tl.set(B.loose, { opacity: 0 }, tg);
    tl.set(B.held, { opacity: 1 }, tg);
    tl.fromTo(B.spark, { x: 218, y: 376, scale: 0, opacity: 1, rotation: 0 }, { scale: 1.6, opacity: 0, rotation: 90, duration: .55, ease: 'power2.out' }, tg);
    ctx.sfx('chime', tg);
    tl.to(s.el, { y: -6, duration: .25, ease: 'back.out(2)' }, tg + .1);
    s.raise(tg + .1, 'R', -150, .3);
    s.raise(tg + .1, 'L', 125, .3);
    s.tilt(tg + .1, -5, .3);
    const tc = tg + .45, n = 5, d = .3;
    tl.to(s.armR, { rotation: -95, duration: d, yoyo: true, repeat: n, ease: 'sine.inOut' }, tc);
    tl.to(s.armL, { rotation: 70, duration: d, yoyo: true, repeat: n, ease: 'sine.inOut' }, tc + .08);
    tl.to(s.head, { rotation: 6, duration: d, yoyo: true, repeat: n, ease: 'sine.inOut' }, tc);
    tl.to(s.el, { y: 0, duration: d, yoyo: true, repeat: n, ease: 'sine.inOut' }, tc);
    tl.fromTo(B.q('.z3-orch'), { y: 0 }, { y: -3, duration: d, yoyo: true, repeat: n, ease: 'sine.inOut' }, tc + .1);
    ctx.sfx('chime', tc + 1.1);
    B.notes.forEach((nt, i) => {
      const sx = [70, 290, 120, 250, 40, 320, 160, 210, 90, 270, 140, 230][i], sy = 300 + (i % 3) * 28;
      const at = tc + i * .14;
      tl.fromTo(nt, { x: sx, y: sy, opacity: 0, scale: .6, rotation: -12 },
        { x: sx + (i % 2 ? 18 : -18), y: sy - 120, scale: 1.1, rotation: 12, duration: 1.5, ease: 'sine.out' }, at);
      tl.to(nt, { opacity: 1, duration: .25 }, at);
      tl.to(nt, { opacity: 0, duration: .45 }, at + 1.05);
    });
  }

  /* ---------- Beat 4a : Sprüngli, Paradeplatz ---------- */
  const MAC = ['#e8577a', '#a8cf7b', '#7a4a32', '#f3d55b', '#f4e7c6', '#f6b7c5', '#d9944a', '#8a4f8f', '#b08060'];
  function macaron(x, y, c, r) {
    r = r || 9;
    return `<g class="z4-mac" transform="translate(${x} ${y})"><ellipse cx="0" cy="${r * .45}" rx="${r}" ry="${r * .55}" fill="${c}"/><ellipse cx="0" cy="${r * .45}" rx="${r}" ry="${r * .55}" fill="#3a2010" opacity=".18"/>` +
      `<rect x="${-r}" y="${-r * .05}" width="${r * 2}" height="${r * .45}" fill="#fff6e6" opacity=".9"/>` +
      `<ellipse cx="0" cy="0" rx="${r}" ry="${r * .55}" fill="${c}"/><ellipse cx="${-r * .3}" cy="${-r * .18}" rx="${r * .38}" ry="${r * .16}" fill="#fff" opacity=".45"/></g>`;
  }
  function tram() {
    let win = '';
    for (let k = 0; k < 7; k++) win += `<rect x="${30 + k * 40}" y="14" width="30" height="22" rx="3" fill="#2b3446"/><rect x="${32 + k * 40}" y="16" width="9" height="18" rx="2" fill="#5c6a85" opacity=".6"/>`;
    return `<g class="z4-tram">
      <path d="M150 -50 L175 -16 L200 -50" stroke="#3b3f4a" stroke-width="2.5" fill="none"/><rect x="160" y="-18" width="30" height="5" rx="2" fill="#3b3f4a"/>
      <rect x="0" y="-13" width="320" height="70" rx="14" fill="#f7f8fa"/>
      <rect x="0" y="36" width="320" height="21" rx="6" fill="#1f63b8"/><rect x="0" y="34" width="320" height="4" fill="#174d92"/>
      ${win}
      <path d="M0 -1 Q0 -13 14 -13 L22 -13 L22 36 L0 36Z" fill="#1f63b8"/><rect x="4" y="-6" width="15" height="12" rx="2" fill="#151a24"/><text x="11.5" y="4" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="600" fill="#ffb02e" text-anchor="middle">8</text>
      <circle cx="9" cy="46" r="3" fill="#ffe9a8"/>
      <rect x="110" y="10" width="2" height="47" fill="#d3d8df"/><rect x="230" y="10" width="2" height="47" fill="#d3d8df"/>
      <circle cx="60" cy="60" r="7" fill="#2a2d33"/><circle cx="270" cy="60" r="7" fill="#2a2d33"/></g>`;
  }
  function beatSprungli(ctx) {
    const L = layer(ctx, 4, '#cfe3f0');
    let facade = '';
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
      const x = 138 + k * 37, y = 176 + r * 50;
      facade += `<rect x="${x - 2}" y="${y - 3}" width="22" height="36" rx="2" fill="#f8efdc"/><rect x="${x}" y="${y}" width="18" height="30" rx="1.5" fill="#71869c"/><rect x="${x}" y="${y}" width="6" height="30" fill="#9fb2c4" opacity=".6"/>`;
      if (r === 1) facade += `<rect x="${x - 4}" y="${y + 30}" width="26" height="6" fill="#2d3340"/><path d="M${x - 3} ${y + 30} v-7 M${x + 9} ${y + 30} v-7 M${x + 21} ${y + 30} v-7 M${x - 3} ${y + 23} H${x + 21}" stroke="#2d3340" stroke-width="1.5"/>`;
    }
    let dormers = '';
    for (let k = 0; k < 6; k++) dormers += `<path d="M${140 + k * 37} 148 v-12 l8 -8 l8 8 v12z" fill="#e9dcc3"/><rect x="${144 + k * 37}" y="136" width="8" height="10" fill="#5d6f85"/>`;
    let awn = '';
    for (let k = 0; k < 4; k++) {
      const x = 136 + k * 56;
      awn += `<path d="M${x} 388 H${x + 50} L${x + 54} 412 ${[0, 1, 2, 3, 4].map(j => `Q${x + 49 - j * 11} 420 ${x + 43 - j * 11} 412`).join(' ')} L${x - 4} 412Z" fill="${NAVY}"/>` +
        `<path d="M${x} 388 H${x + 50} L${x + 52} 398 H${x - 2}Z" fill="#2c3b5e"/>` +
        `<rect x="${x + 2}" y="418" width="46" height="46" rx="2" fill="#f6ead7"/><rect x="${x + 2}" y="440" width="46" height="2" fill="#d4c3a6"/>` +
        [0, 1, 2, 3].map(j => `<circle cx="${x + 10 + j * 10}" cy="434" r="4" fill="${MAC[(k * 4 + j) % MAC.length]}"/><circle cx="${x + 10 + j * 10}" cy="455" r="4" fill="${MAC[(k * 4 + j + 3) % MAC.length]}"/>`).join('');
    }
    let rust = '';
    for (let y = 352; y < 470; y += 14) rust += `<rect x="-10" y="${y}" width="136" height="2" fill="#bdb4a6"/>`;
    let left = '';
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) left += `<path d="M${8 + k * 38} ${222 + r * 44} v-18 a10 10 0 0 1 20 0 v18z" fill="#6c7b8e"/>`;
    svg(ctx, L, `<defs><linearGradient id="zSky4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc6e6"/><stop offset="1" stop-color="#eaf2f4"/></linearGradient>
        <linearGradient id="zRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9b2a6"/><stop offset="1" stop-color="#cfc8bb"/></linearGradient></defs>
      <rect width="360" height="480" fill="url(#zSky4)"/>
      <ellipse cx="60" cy="150" rx="40" ry="10" fill="#fff" opacity=".8"/><ellipse cx="80" cy="142" rx="22" ry="10" fill="#fff" opacity=".8"/>
      <path d="M-10 190 L-10 160 Q60 140 128 160 L128 190Z" fill="#7c9a8f"/>
      <rect x="-10" y="186" width="138" height="290" fill="#ddd5c8"/><rect x="-10" y="186" width="138" height="8" fill="#c9bfae"/>${left}${rust}
      <path d="M0 470 V420 a18 18 0 0 1 36 0 V470z M74 470 V420 a18 18 0 0 1 36 0 V470z" fill="#5d6a7a"/>
      <path d="M126 150 L132 120 H356 L362 150Z" fill="#7b8794"/>${dormers}
      <rect x="126" y="150" width="240" height="320" fill="#efe3cc"/><rect x="126" y="150" width="240" height="7" fill="#d8c8aa"/>
      <rect x="126" y="364" width="240" height="4" fill="#d8c8aa"/>${facade}
      <rect x="126" y="368" width="240" height="20" fill="${NAVY}"/>
      <text x="250" y="384" font-family="Caveat, cursive" font-size="20" font-weight="700" fill="${GOLD}" text-anchor="middle">Confiserie Sprüngli</text>
      ${awn}
      <path d="M0 389 H360 M0 393 H360" stroke="#3d424d" stroke-width="1.1" opacity=".8"/>
      <rect y="470" width="360" height="170" fill="url(#zRoad)"/>
      <path d="M0 500 H360 M0 508 H360 M0 532 H360 M0 540 H360" stroke="#8c867c" stroke-width="2.4"/>
      <rect y="566" width="360" height="6" fill="#e4ddd0"/><rect y="572" width="360" height="68" fill="#d9d1c2"/>`);
    const tr = svg(ctx, L, tram(), 'z-index:4');
    // the box of Luxemburgerli on a little café table
    let macs = '';
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) macs += macaron(232 + k * 19 + (r % 2) * 4, 506 + r * 14, MAC[(r * 6 + k * 2 + r) % MAC.length], 8.5);
    const box = svg(ctx, L, `<g class="z4-table"><ellipse cx="282" cy="560" rx="70" ry="13" fill="#e8e2d6"/><ellipse cx="282" cy="557" rx="70" ry="13" fill="#fbf8f2"/><rect x="278" y="566" width="8" height="70" fill="#5a5e66"/><ellipse cx="282" cy="636" rx="26" ry="5" fill="#5a5e66"/></g>
      <g class="z4-lid"><rect x="218" y="430" width="128" height="68" rx="6" fill="#f3ecdf"/><rect x="218" y="430" width="128" height="68" rx="6" fill="none" stroke="${GOLD}" stroke-width="2"/>
        <rect x="270" y="430" width="24" height="68" fill="#9cd3d0" opacity=".9"/>
        <text x="282" y="472" font-family="Caveat, cursive" font-size="22" font-weight="700" fill="${NAVY}" text-anchor="middle">Sprüngli</text></g>
      <path d="M214 498 H350 L344 552 H220Z" fill="#fbf6ec"/><path d="M214 498 H350 L348 506 H216Z" fill="#e9dfcc"/>
      <g class="z4-macs">${macs}</g>
      <path d="M220 534 H344 L344 552 H220Z" fill="#f3ecdf"/><rect x="220" y="534" width="124" height="3" fill="${GOLD}"/>`, 'z-index:6');
    const sven = ctx.char('sven', { outfit: 'coat', h: 182, x: 126, y: 600, parent: L });
    sven.hold('L', BAG);
    const bite = sven.hold('R', `<g>${macaron(0, 2, MAC[1], 13)}</g>`);
    return { L, q: (s) => L.querySelector(s), qa: (s) => L.querySelectorAll(s), tram: tr.querySelector('.z4-tram'), box, sven, bite };
  }

  function animSprungli(ctx, B) {
    const tl = ctx.tl, t0 = T.b4;
    ctx.backdrop('#9cc6e6', '#d9d1c2', t0);
    tl.fromTo(B.L, { clipPath: 'inset(0px 0px 0px 360px)', webkitClipPath: 'inset(0px 0px 0px 360px)' }, { clipPath: 'inset(0px 0px 0px 0px)', webkitClipPath: 'inset(0px 0px 0px 0px)', duration: .55, ease: 'power2.inOut' }, t0 - .2);
    ctx.sfx('whoosh', t0 - .2);
    // the tram rolls past (line 8 rings its bell)
    tl.fromTo(B.tram, { x: 380, y: 440 }, { x: -340, y: 440, duration: 1.9, ease: 'power1.inOut' }, t0 + .15);
    tl.fromTo(B.tram, { rotation: 0 }, { rotation: .25, duration: .2, yoyo: true, repeat: 8, ease: 'sine.inOut', svgOrigin: '160 60' }, t0 + .15);
    ctx.sfx('bell', t0 + .35);
    // the box opens, macarons pop in
    const lid = B.box.querySelector('.z4-lid'), macs = B.box.querySelectorAll('.z4-mac');
    tl.fromTo(lid, { scaleY: .1, svgOrigin: '282 498' }, { scaleY: 1, duration: .45, ease: 'back.out(2)' }, t0 + .75);
    ctx.sfx('pop', t0 + .75);
    tl.fromTo(macs, { scale: 0 }, { scale: 1, duration: .3, ease: 'back.out(3)', stagger: { each: .025, from: 'random' } }, t0 + .9);
    ctx.sfx('magic', t0 + .9);
    // Sven picks one and eats it
    const s = B.sven;
    tl.set(B.bite, { opacity: 0 }, 0);
    s.tilt(t0 + .9, 8, .3);
    s.emote(t0 + 1.0, '♥', 1.0);
    s.raise(t0 + 1.35, 'R', -62, .35);
    tl.set(B.bite, { opacity: 1 }, t0 + 1.7);
    tl.to(macs[macs.length - 4] || macs[0], { opacity: 0, duration: .1 }, t0 + 1.7);
    s.raise(t0 + 1.8, 'R', -168, .4);
    s.tilt(t0 + 1.8, -6, .3);
    tl.to(B.bite, { scale: .4, opacity: 0, duration: .2, transformOrigin: '50% 50%' }, t0 + 2.25);
    ctx.sfx('pop', t0 + 2.25);
    s.say(t0 + 2.25, 'Mmmh\u00a0!', .65, { side: 'right' });
    s.lower(t0 + 2.4, 'R');
    s.hop(t0 + 2.4, 10);
    ctx.caption('Et des <b>Luxemburgerli</b> de chez <b>Sprüngli</b>, au bord du <b>lac</b>.', t0 + .45, { html: true, pos: { x: 180, y: 112 } });
  }

  /* ---------- Beat 4b : le lac au coucher du soleil ---------- */
  function beatLake(ctx) {
    const L = layer(ctx, 5, '#263a6e');
    const rand = ctx.rand;
    let glit = '';
    for (let i = 0; i < 22; i++) {
      const y = 336 + i * 8 + rand() * 4, w = 10 + (i * 3) + rand() * 14, x = 240 - w / 2 + (rand() - .5) * (8 + i * 2.2);
      glit += `<rect class="z5-gl" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="2.2" rx="1.1" fill="#ffe3a0" opacity="${(.5 + rand() * .4).toFixed(2)}"/>`;
    }
    let lights = '';
    for (let i = 0; i < 14; i++) lights += `<circle cx="${(rand() * 360).toFixed(0)}" cy="${(318 + rand() * 12).toFixed(0)}" r="1.1" fill="#ffd98a"/>`;
    let paving = '';
    for (let y = 548; y < 640; y += 16) paving += `<path d="M0 ${y} H360" stroke="#5c4458" stroke-width="1" opacity=".5"/>`;
    // the lakeside railing (quai) in front of the water
    let rail = '<path d="M0 491 H360" stroke="#33263b" stroke-width="3.5" stroke-linecap="round"/><path d="M0 491.8 H360" stroke="#c98f7e" stroke-width=".8" opacity=".6"/><path d="M0 503 H360" stroke="#33263b" stroke-width="1.6"/>';
    for (let x = 6; x < 360; x += 27) rail += `<rect x="${x}" y="489" width="3.2" height="26" rx="1" fill="#33263b"/><circle cx="${x + 1.6}" cy="489" r="2.4" fill="#33263b"/>`;
    let leaves = '';
    for (let i = 0; i < 16; i++) leaves += `<circle cx="${(-20 + rand() * 100).toFixed(0)}" cy="${(40 + rand() * 170).toFixed(0)}" r="${(16 + rand() * 16).toFixed(0)}" fill="${rand() < .5 ? '#2a2440' : '#352b4c'}"/>`;
    svg(ctx, L, `<defs>
        <linearGradient id="zSun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#263a6e"/><stop offset=".38" stop-color="#6b4f8c"/><stop offset=".66" stop-color="#e0708a"/><stop offset=".86" stop-color="#f7a463"/><stop offset="1" stop-color="#ffd88a"/></linearGradient>
        <linearGradient id="zLake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2a27a"/><stop offset=".4" stop-color="#9a6390"/><stop offset="1" stop-color="#2d3a66"/></linearGradient>
        <radialGradient id="zSunGlow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd27a" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a6a" stop-opacity="0"/></radialGradient>
        <clipPath id="zHorizon"><rect width="360" height="331"/></clipPath>
      </defs>
      <rect width="360" height="332" fill="url(#zSun)"/>
      <g class="z5-sun" clip-path="url(#zHorizon)"><circle cx="240" cy="318" r="90" fill="url(#zSunGlow)"/><circle cx="240" cy="318" r="30" fill="#fff0b8"/></g>
      <g fill="#fff" opacity=".35"><ellipse cx="90" cy="230" rx="50" ry="5"/><ellipse cx="300" cy="200" rx="40" ry="4"/><ellipse cx="200" cy="250" rx="34" ry="3"/></g>
      <path d="M-10 332 L20 300 L44 312 L80 276 L104 296 L128 284 L160 310 L186 300 L214 318 L250 304 L290 290 L318 306 L350 288 L370 300 L370 332Z" fill="#8b6f9e" opacity=".85"/>
      <path d="M80 276 L92 288 L86 290 L80 284 L72 290Z M290 290 L300 297 L288 298Z M350 288 L358 294 L344 296Z M128 284 L136 291 L122 292Z" fill="#ffd1d4"/>
      <path d="M-10 334 Q60 316 130 324 Q200 330 260 322 Q320 316 370 326 V336 H-10Z" fill="#4b3c6e"/>${lights}
      <rect y="334" width="360" height="190" fill="url(#zLake)"/>
      <g class="z5-glit">${glit}</g>
      <g class="z5-boat1" transform="translate(70 372)"><path d="M-14 0 H14 L10 6 H-10Z" fill="#2b2a4a"/><path d="M0 -1 V-30 L13 -3Z" fill="#f6c08a"/><path d="M-1 -1 V-24 L-10 -3Z" fill="#e7a07a"/></g>
      <g class="z5-boat2" transform="translate(320 352)"><path d="M-9 0 H9 L6 4 H-6Z" fill="#2b2a4a"/><path d="M0 -1 V-20 L8 -2Z" fill="#f6c08a"/></g>
      <g class="z5-steamer" transform="translate(150 344)"><path d="M-30 0 H32 L26 7 H-26Z" fill="#f4e6e6"/><rect x="-20" y="-7" width="40" height="7" fill="#efe0e0"/><rect x="-4" y="-15" width="6" height="8" fill="#d9a441"/>${[-16, -10, -4, 2, 8, 14].map(x => `<rect x="${x}" y="-5" width="3" height="3" fill="#ffcf6e"/>`).join('')}</g>
      <rect y="514" width="360" height="12" fill="#6e5466"/><rect y="514" width="360" height="3" fill="#b88a7e"/>
      <rect y="526" width="360" height="114" fill="#4f3a52"/>${paving}
      <g class="z5-swan" transform="translate(40 474)"><path d="M-10 0 Q-11 -6 -1 -6 L6 -5 Q9 -5 9 -2 Q8 2 0 2 Q-8 2 -10 0Z" fill="#fff4ee"/><path d="M6 -5 Q9 -10 7 -14 Q6 -17 9 -17" stroke="#fff4ee" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M9 -18 L13 -16.5 L9 -15.5Z" fill="#f08a2e"/></g>
      ${rail}
      <path d="M34 260 Q60 200 96 178 M30 300 Q10 250 -6 236 M36 220 Q50 150 40 110" stroke="#2a2238" stroke-width="6" fill="none" stroke-linecap="round"/><g>${leaves}</g><path d="M18 520 C24 420 26 300 30 200 L40 200 C40 300 42 420 46 520Z" fill="#2a2238"/><path d="M26 520 C30 430 31 330 33 240" stroke="#3b3150" stroke-width="2" fill="none"/>
      <g transform="translate(326 0)"><rect x="-3" y="420" width="6" height="104" fill="#26323a"/><path d="M-12 420 H12 L8 404 H-8Z" fill="#26323a"/><rect x="-7" y="404" width="14" height="14" fill="#ffd27a"/><circle cx="0" cy="410" r="24" fill="#ffd27a" opacity=".18"/><path d="M-9 404 L0 394 L9 404Z" fill="#26323a"/></g>`);
    const sven = ctx.char('sven', { outfit: 'coat', h: 176, x: 132, y: 592, parent: L });
    sven.hold('L', BAG);
    const mac = sven.hold('R', `<g>${macaron(0, 2, MAC[0], 12)}</g>`);
    const artur = ctx.char('artur', { outfit: 'casual', h: 170, x: 230, y: 594, parent: L });
    const warm = ctx.html('<div style="position:absolute;inset:0;z-index:7;pointer-events:none;background:linear-gradient(180deg,rgba(255,160,90,0) 55%,rgba(255,150,100,.18) 80%,rgba(80,40,90,.25));mix-blend-mode:soft-light"></div>', L);
    const fade = ctx.html(`<div style="position:absolute;inset:0;z-index:30;background:${NAVY};pointer-events:none"></div>`);
    return { L, q: (s) => L.querySelector(s), qa: (s) => L.querySelectorAll(s), sven, artur, mac, warm, fade };
  }
  function animLake(ctx, B) {
    const tl = ctx.tl, t0 = T.lake, dur = T.end - t0;
    ctx.backdrop('#263a6e', '#4f3a52', t0);
    tl.fromTo(B.L, { opacity: 0 }, { opacity: 1, duration: .55, ease: 'sine.inOut' }, t0 - .2);
    tl.fromTo(B.q('.z5-sun'), { y: 0 }, { y: 14, duration: dur + .3, ease: 'none' }, t0 - .3);
    tl.fromTo(B.q('.z5-glit'), { opacity: .7 }, { opacity: 1, duration: .35, yoyo: true, repeat: 7, ease: 'sine.inOut' }, t0 - .3);
    B.qa('.z5-gl').forEach((g, i) => tl.fromTo(g, { x: 0 }, { x: (i % 2 ? 5 : -5), duration: .7, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t0 - .3 + (i % 5) * .08));
    tl.fromTo(B.q('.z5-boat1'), { x: 70 }, { x: 96, duration: dur + .3, ease: 'none' }, t0 - .3);
    tl.fromTo(B.q('.z5-boat2'), { x: 320 }, { x: 306, duration: dur + .3, ease: 'none' }, t0 - .3);
    tl.fromTo(B.q('.z5-steamer'), { x: 150 }, { x: 128, duration: dur + .3, ease: 'none' }, t0 - .3);
    tl.fromTo(B.q('.z5-swan'), { x: 40 }, { x: 74, duration: dur + .3, ease: 'none' }, t0 - .3);
    // the two friends enjoy the view
    const s = B.sven, a = B.artur;
    s.raise(t0 + .3, 'R', -150, .35);
    tl.to(B.mac, { scale: 0, duration: .2, transformOrigin: '50% 50%' }, t0 + .75);
    ctx.sfx('pop', t0 + .75);
    s.lower(t0 + .85, 'R');
    s.emote(t0 + .9, '♥', 1.2);
    a.wave(t0 + .5, 'R', 2);
    s.tilt(t0 + 1.4, 8, .4);
    a.tilt(t0 + 1.4, -8, .4);
    tl.to([s.el, a.el], { y: -3, duration: .35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t0 + 1.5);
    tl.fromTo(B.fade, { opacity: 0 }, { opacity: 1, duration: .45, ease: 'power1.in' }, T.end - .45);
  }

  Story.register({
    id: 'zurich', order: 9, title: 'Option 1 · Zurich', photos: [], skippable: false,
    bg: NAVY, music: 'normal', darkUI: false,
    build(ctx) {
      ctx.html(CSS);
      ctx.backdrop('#79acd8', '#efe3c9');
      const B1 = beatCity(ctx); animCity(ctx, B1);
      ctx.beat(T.b2);
      const B2 = beatChagall(ctx); animChagall(ctx, B2);
      ctx.beat(T.b3);
      const B3 = beatTonhalle(ctx); animTonhalle(ctx, B3);
      ctx.beat(T.b4);
      const B4 = beatSprungli(ctx); animSprungli(ctx, B4);
      const B5 = beatLake(ctx); animLake(ctx, B5);
      // hide layers once fully covered by the next one (less to paint on the phone)
      [[B1.L, T.b2 + .7], [B2.L, T.b3 + .2], [B3.L, T.b4 + .5], [B4.L, T.lake + .4]].forEach(([el, at]) => ctx.tl.set(el, { visibility: 'hidden' }, at));

      const chip = ctx.html('<div class="z-chipwrap"><div class="z-chip"><i><svg viewBox="0 0 10 12" width="9" height="11"><path d="M5 0C2.2 0 0 2.2 0 4.9 0 8.4 5 12 5 12S10 8.4 10 4.9C10 2.2 7.8 0 5 0Z" fill="#1f2a44"/><circle cx="5" cy="4.8" r="1.8" fill="#d9a441"/></svg></i>Option 1 <span>·</span> Zurich</div></div>').firstElementChild;
      ctx.tl.fromTo(chip, { opacity: 0, y: -12, scale: .8 }, { opacity: 1, y: 0, scale: 1, duration: .5, ease: 'back.out(2)' }, .15);
      ctx.tl.set({}, {}, T.end);
    },
  });
})();
;

/* ===== js/scenes/10-colmar.js ===== */
/* Scène 10 — « Option 2 · Colmar » (highlight reel, se joue seule, ~22.8 s, enchaîne sur le finale)
 * Beat 1 (0)     : la Petite Venise en barque (maisons à colombages, reflets, batelier)
 * Beat 2 (5.6)   : Maison Pfister (tourelle, galerie, panneaux peints) → Maison des Têtes (grimaces)
 * Beat 3 (11.2)  : route des vins — Eguisheim (le Pigeonnier), vignes, cigognes, riesling
 * Beat 4 (16.8)  : dîner étoilé chez Julien Binz (Ammerschwihr) — cloche, étoile, ramasse-miettes, « FROTTE ! »
 */
(function () {
  'use strict';

  const SC = '#stage[data-scene="colmar"]';
  const TIMBER = '#4b3025';
  const r1 = (n) => Math.round(n * 10) / 10;

  /* ================= drawing helpers (SVG strings) ================= */

  function flowerBox(R, x, y, w, pal) {
    pal = pal || ['#e2384d', '#ff6b80', '#d12a3f', '#ff8a7a'];
    const n = Math.max(3, Math.round(w / 3.1));
    let leaves = '', fl = '';
    for (let i = 0; i < n; i++) {
      const fx = x + 1 + (w - 2) * (i + 0.5) / n;
      leaves += `<circle cx="${r1(fx + (R() - 0.5) * 1.4)}" cy="${r1(y - 0.3 + R())}" r="${r1(1.6 + R() * 0.8)}"/>`;
      if (R() < 0.45) leaves += `<circle cx="${r1(fx)}" cy="${r1(y + 4.2 + R() * 2.5)}" r="${r1(1.1 + R() * 0.6)}"/>`;
      fl += `<circle cx="${r1(fx + (R() - 0.5) * 2)}" cy="${r1(y - 1.8 - R() * 2)}" r="${r1(1.2 + R() * 0.8)}" fill="${pal[Math.floor(R() * pal.length)]}"/>`;
    }
    return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="3.4" rx="1" fill="#7a4a32"/><g fill="#4f8a43">${leaves}</g>${fl}`;
  }

  function win(R, cx, y, w, h, o) {
    o = o || {};
    const x = cx - w / 2;
    let s = '';
    if (o.shutter) {
      const sw = r1(w * 0.5);
      s += `<rect x="${r1(x - sw - 1)}" y="${r1(y)}" width="${sw}" height="${r1(h)}" rx=".8" fill="${o.shutter}"/><rect x="${r1(x + w + 1)}" y="${r1(y)}" width="${sw}" height="${r1(h)}" rx=".8" fill="${o.shutter}"/>`;
      let d = '';
      for (let k = 3; k < h - 1.5; k += 3) d += `M${r1(x - sw - 0.4)} ${r1(y + k)}h${r1(sw - 1.2)}M${r1(x + w + 1.6)} ${r1(y + k)}h${r1(sw - 1.2)}`;
      s += `<path d="${d}" stroke="rgba(0,0,0,.2)" stroke-width=".8"/>`;
    }
    s += `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="#fbf6ec"/>`;
    s += `<rect x="${r1(x + 1.4)}" y="${r1(y + 1.4)}" width="${r1(w - 2.8)}" height="${r1(h - 2.8)}" fill="url(#cm-glass)"/>`;
    s += `<path d="M${r1(cx)} ${r1(y + 1)}V${r1(y + h - 1)}M${r1(x + 1)} ${r1(y + h * 0.42)}H${r1(x + w - 1)}" stroke="#fbf6ec" stroke-width="1.1"/>`;
    s += `<path d="M${r1(x + 2.6)} ${r1(y + h * 0.36)}L${r1(x + w * 0.4)} ${r1(y + 2.8)}" stroke="rgba(255,255,255,.75)" stroke-width="1.2" stroke-linecap="round"/>`;
    if (o.flowers) s += flowerBox(R, x - 2.5, y + h + 0.4, w + 5, o.pal);
    return s;
  }

  /* Alsatian half-timbered house. o: x, base, w, gh, floors, fh, wall, roof, gable, rh, shutter, jetty, door, gwin, ... */
  function house(R, o) {
    const j = o.jetty == null ? 3 : o.jetty, simple = !!o.simple, T = o.timber || TIMBER;
    let pre = '', walls = '', beams = '', braces = '', wins = '', post = '';
    let y = o.base;
    const x0 = o.x, w0 = o.w;
    if (o.gh) {
      const gt = y - o.gh;
      walls += `<rect x="${x0}" y="${gt}" width="${w0}" height="${o.gh}" fill="${o.stone || '#e4d5bb'}"/>`;
      if (!simple) {
        walls += `<path d="M${x0} ${r1(gt + o.gh / 2)}H${x0 + w0}M${r1(x0 + w0 * 0.3)} ${gt}v${r1(o.gh / 2)}M${r1(x0 + w0 * 0.72)} ${r1(gt + o.gh / 2)}v${r1(o.gh / 2)}" stroke="rgba(110,80,50,.15)" stroke-width="1"/>`;
        if (o.door != null) {
          const dx = x0 + w0 * o.door, dw = Math.min(15, w0 * 0.24), dh = Math.min(o.gh - 5, 30), ty = y - dh + dw / 2;
          walls += `<path d="M${r1(dx - dw / 2 - 2.4)} ${y}V${r1(ty)}A${r1(dw / 2 + 2.4)} ${r1(dw / 2 + 2.4)} 0 0 1 ${r1(dx + dw / 2 + 2.4)} ${r1(ty)}V${y}Z" fill="#cbb48f"/>`
            + `<path d="M${r1(dx - dw / 2)} ${y}V${r1(ty)}A${r1(dw / 2)} ${r1(dw / 2)} 0 0 1 ${r1(dx + dw / 2)} ${r1(ty)}V${y}Z" fill="${o.doorCol || '#6b4230'}"/>`
            + `<circle cx="${r1(dx + dw * 0.25)}" cy="${r1(y - dh * 0.42)}" r="1" fill="#e8c36a"/>`;
        }
        if (o.gwin != null) {
          const gx = x0 + w0 * o.gwin, wy = gt + o.gh * 0.22, wh = o.gh * 0.38;
          walls += `<rect x="${r1(gx - 6)}" y="${r1(wy)}" width="12" height="${r1(wh)}" rx="1.5" fill="#cbb48f"/><rect x="${r1(gx - 4.3)}" y="${r1(wy + 1.6)}" width="8.6" height="${r1(wh - 3.2)}" fill="#5a676d"/>`;
        }
        if (o.waterline) walls += `<rect x="${x0}" y="${y - 5}" width="${w0}" height="5" fill="rgba(50,70,60,.25)"/>`;
      }
      y = gt;
    }
    let fx = x0, fw = w0;
    for (let i = 0; i < o.floors; i++) {
      fx = x0 - j * (i + 1); fw = w0 + 2 * j * (i + 1);
      const fh = o.fh, top = y - fh;
      walls += `<rect x="${fx}" y="${top}" width="${fw}" height="${fh}" fill="${o.wall}"/>`;
      if (!simple) walls += `<rect x="${fx + fw - 6}" y="${top}" width="6" height="${fh}" fill="rgba(80,40,20,.07)"/><rect x="${fx + j}" y="${y}" width="${fw - 2 * j}" height="3" fill="rgba(40,20,10,.2)"/>`;
      beams += `<rect x="${fx - 1}" y="${r1(y - 3.6)}" width="${fw + 2}" height="3.6"/>`;
      const n = o.win || (fw > 92 ? 3 : 2);
      const bw = fw / n, ww = Math.min(o.ww || 14, bw * 0.4), wh = fh * 0.46, wy = top + fh * 0.16;
      if (!simple) {
        beams += `<rect x="${fx}" y="${top}" width="3" height="${fh}"/><rect x="${fx + fw - 3}" y="${top}" width="3" height="${fh}"/>`;
        for (let b = 1; b < n; b++) beams += `<rect x="${r1(fx + b * bw - 1.5)}" y="${top}" width="3" height="${fh}"/>`;
      }
      for (let b = 0; b < n; b++) {
        const cx = fx + bw * (b + 0.5);
        if (simple) { wins += `<rect x="${r1(cx - ww / 2)}" y="${r1(wy)}" width="${r1(ww)}" height="${r1(wh)}"/>`; continue; }
        const l = cx - ww / 2, rr = cx + ww / 2, sill = wy + wh + 3.4, bot = y - 3.6;
        beams += `<rect x="${r1(l - 3)}" y="${r1(sill)}" width="${r1(ww + 6)}" height="2.2"/>`;
        const bl = fx + bw * b + (b === 0 ? 3 : 1.5), br = fx + bw * (b + 1) - (b === n - 1 ? 3 : 1.5);
        braces += `M${r1(bl)} ${r1(bot)}L${r1(l - 2)} ${r1(top + fh * 0.2)}M${r1(br)} ${r1(bot)}L${r1(rr + 2)} ${r1(top + fh * 0.2)}`;
        if (bot - sill > 8) braces += `M${r1(l)} ${r1(sill + 2.2)}L${r1(rr)} ${r1(bot)}M${r1(rr)} ${r1(sill + 2.2)}L${r1(l)} ${r1(bot)}`;
        wins += win(R, cx, wy, ww, wh, { shutter: o.shutter, flowers: o.flowers !== false && (i === 0 || o.flowersAll), pal: o.pal });
      }
      y = top;
    }
    const top = y, cx = fx + fw / 2;
    if (o.gable) {
      const ap = top - o.rh;
      pre += `<path d="M${r1(fx - 7)} ${r1(top + 3)}L${r1(cx)} ${r1(ap - 8)}L${r1(fx + fw + 7)} ${r1(top + 3)}Z" fill="${o.roof}"/>`;
      walls += `<path d="M${fx} ${top}L${r1(cx)} ${r1(ap)}L${fx + fw} ${top}Z" fill="${o.wall}"/>`;
      if (!simple) {
        pre += `<path d="M${r1(fx - 7)} ${r1(top + 3)}L${r1(cx)} ${r1(ap - 8)}L${r1(fx + fw + 7)} ${r1(top + 3)}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.4"/>`;
        const cy = top - o.rh * 0.48, hw = fw * 0.26;
        beams += `<rect x="${r1(cx - hw)}" y="${r1(cy - 1.5)}" width="${r1(2 * hw)}" height="3"/>`
          + `<rect x="${r1(cx - 1.4)}" y="${r1(ap + 4)}" width="2.8" height="${r1(cy - ap - 4)}"/>`
          + `<rect x="${r1(cx - hw + 1)}" y="${r1(cy)}" width="2.6" height="${r1(top - cy)}"/><rect x="${r1(cx + hw - 3.6)}" y="${r1(cy)}" width="2.6" height="${r1(top - cy)}"/>`;
        braces += `M${r1(fx + 6)} ${r1(top - 3)}L${r1(cx - hw + 2)} ${r1(cy + 4)}M${r1(fx + fw - 6)} ${r1(top - 3)}L${r1(cx + hw - 2)} ${r1(cy + 4)}`;
        const aw = Math.min(11, hw * 0.75), ah = (top - cy) * 0.5;
        wins += win(R, cx, cy + (top - cy - ah) / 2 - 1, aw, ah, {});
        if (o.finial !== false) post += `<path d="M${r1(cx)} ${r1(ap - 8)}v-9" stroke="#4a4038" stroke-width="1.3"/><circle cx="${r1(cx)}" cy="${r1(ap - 18)}" r="1.8" fill="#d7ad4e"/>`;
      }
    } else {
      const rt = top - o.rh, ov = 7, ins = Math.min(12, fw * 0.15);
      if (o.chimney != null && !simple) {
        const chx = fx + fw * o.chimney;
        post += `<rect x="${r1(chx - 5)}" y="${r1(rt - 13)}" width="10" height="20" fill="#c6a28a"/><rect x="${r1(chx - 6.5)}" y="${r1(rt - 16)}" width="13" height="4" fill="#8e6b58"/>`;
      }
      post += `<path d="M${r1(fx - ov)} ${r1(top + 3)}L${r1(fx + ins)} ${r1(rt)}L${r1(fx + fw - ins)} ${r1(rt)}L${r1(fx + fw + ov)} ${r1(top + 3)}Z" fill="${o.roof}"/>`;
      if (!simple) {
        let d = '';
        for (let yy = rt + 5; yy < top + 1; yy += 5) {
          const t = (yy - rt) / (top + 3 - rt);
          d += `M${r1(fx + ins - (ins + ov) * t)} ${r1(yy)}H${r1(fx + fw - ins + (ins + ov) * t)}`;
        }
        post += `<path d="${d}" stroke="rgba(70,20,10,.22)" stroke-width="1"/>`;
        post += `<rect x="${r1(fx + ins - 1)}" y="${r1(rt - 2)}" width="${r1(fw - 2 * ins + 2)}" height="3.2" rx="1.6" fill="rgba(70,25,15,.4)"/>`;
        if (o.dormer !== false) {
          const dw = 16, dh = Math.min(14, o.rh * 0.42), dy = top - o.rh * 0.62;
          post += `<path d="M${r1(cx - dw / 2 - 3)} ${r1(dy + 1)}L${r1(cx)} ${r1(dy - 9)}L${r1(cx + dw / 2 + 3)} ${r1(dy + 1)}Z" fill="${o.roof}"/>`
            + `<rect x="${r1(cx - dw / 2)}" y="${r1(dy)}" width="${dw}" height="${r1(dh)}" fill="${o.wall}"/>`
            + `<path d="M${r1(cx - dw / 2 - 3)} ${r1(dy + 1)}L${r1(cx)} ${r1(dy - 9)}L${r1(cx + dw / 2 + 3)} ${r1(dy + 1)}" fill="none" stroke="rgba(70,25,15,.45)" stroke-width="1.6"/>`
            + win(R, cx, dy + 2.5, dw - 7, dh - 4.5, {});
        }
      }
    }
    if (simple) return `<g>${pre}${walls}<g fill="${T}">${beams}</g><g fill="#3f4d5a" opacity=".55">${wins}</g>${post}</g>`;
    return `<g>${pre}${walls}<g fill="${T}">${beams}</g><path d="${braces}" stroke="${T}" stroke-width="2.6" fill="none"/>${wins}${post}${o.extra || ''}</g>`;
  }

  /* small carved stone head (Maison des Têtes) */
  function stoneHead(R, x, y, r, col) {
    col = col || '#c99479';
    const k = Math.floor(R() * 4);
    const m = [
      `M${r1(-r * 0.4)} ${r1(r * 0.46)}q${r1(r * 0.4)} ${r1(r * 0.32)} ${r1(r * 0.8)} 0`,
      `M${r1(-r * 0.4)} ${r1(r * 0.64)}q${r1(r * 0.4)} ${r1(-r * 0.3)} ${r1(r * 0.8)} 0`,
      `M${r1(-r * 0.3)} ${r1(r * 0.54)}h${r1(r * 0.6)}`,
      `M${r1(-r * 0.22)} ${r1(r * 0.5)}q${r1(r * 0.22)} ${r1(r * 0.36)} ${r1(r * 0.44)} 0`,
    ][k];
    const beard = R() < 0.35 ? `<path d="M${r1(-r * 0.75)} ${r1(r * 0.4)}Q0 ${r1(r * 2)} ${r1(r * 0.75)} ${r1(r * 0.4)}Z" fill="#b8826a"/>` : '';
    const hat = R() < 0.3 ? `<path d="M${r1(-r * 0.95)} ${r1(-r * 0.55)}Q0 ${r1(-r * 1.7)} ${r1(r * 0.95)} ${r1(-r * 0.55)}Z" fill="#b8826a"/>` : '';
    return `<g transform="translate(${r1(x)} ${r1(y)})">${beard}<ellipse rx="${r}" ry="${r1(r * 1.1)}" fill="${col}"/>${hat}`
      + `<ellipse cx="${r1(-r * 0.3)}" cy="${r1(-r * 0.4)}" rx="${r1(r * 0.42)}" ry="${r1(r * 0.3)}" fill="#f6dccb" opacity=".45"/>`
      + `<path d="M${r1(-r * 0.62)} ${r1(-r * 0.32)}l${r1(r * 0.46)} ${r1(r * 0.14)}M${r1(r * 0.62)} ${r1(-r * 0.32)}l${r1(-r * 0.46)} ${r1(r * 0.14)}${m}" stroke="#6e4434" stroke-width="${r1(r * 0.2)}" stroke-linecap="round" fill="none"/>`
      + `<circle cx="${r1(-r * 0.32)}" cy="${r1(r * 0.04)}" r="${r1(r * 0.14)}" fill="#5a3326"/><circle cx="${r1(r * 0.32)}" cy="${r1(r * 0.04)}" r="${r1(r * 0.14)}" fill="#5a3326"/></g>`;
  }

  /* bigger head that comes to life and pulls a face (kind 0..4) */
  function activeHead(x, y, r, kind) {
    const S = '#cf9a7e', D = '#4f2c22', L = '#6e4434', k = (n) => r1(n * r);
    const ears = `<ellipse cx="${k(-1)}" cy="0" rx="${k(0.24)}" ry="${k(0.36)}" fill="#bd876c"/><ellipse cx="${k(1)}" cy="0" rx="${k(0.24)}" ry="${k(0.36)}" fill="#bd876c"/>`;
    const base = `<ellipse rx="${r}" ry="${k(1.1)}" fill="${S}"/><path d="M${k(-0.9)} ${k(-0.5)}Q0 ${k(-1.55)} ${k(0.9)} ${k(-0.5)}Q${k(0.5)} ${k(-0.85)} 0 ${k(-0.8)}Q${k(-0.5)} ${k(-0.85)} ${k(-0.9)} ${k(-0.5)}Z" fill="#b97f63"/>`
      + `<ellipse cx="${k(-0.32)}" cy="${k(-0.38)}" rx="${k(0.38)}" ry="${k(0.26)}" fill="#f7e0cf" opacity=".5"/><ellipse cx="0" cy="${k(0.2)}" rx="${k(0.14)}" ry="${k(0.2)}" fill="#b97f63"/>`;
    const neutral = `<g class="n"><path d="M${k(-0.6)} ${k(-0.3)}l${k(0.44)} ${k(0.12)}M${k(0.6)} ${k(-0.3)}l${k(-0.44)} ${k(0.12)}M${k(-0.32)} ${k(0.58)}h${k(0.64)}" stroke="${L}" stroke-width="${k(0.17)}" stroke-linecap="round" fill="none"/><circle cx="${k(-0.32)}" cy="${k(-0.02)}" r="${k(0.12)}" fill="${D}"/><circle cx="${k(0.32)}" cy="${k(-0.02)}" r="${k(0.12)}" fill="${D}"/></g>`;
    let g = '';
    const sw = `stroke="${L}" stroke-width="${k(0.16)}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    if (kind === 0) { // tongue out, eyes squeezed
      g = `<path d="M${k(-0.58)} ${k(-0.22)}L${k(-0.24)} ${k(-0.04)}L${k(-0.58)} ${k(0.12)}M${k(0.58)} ${k(-0.22)}L${k(0.24)} ${k(-0.04)}L${k(0.58)} ${k(0.12)}" ${sw}/>`
        + `<ellipse cx="0" cy="${k(0.55)}" rx="${k(0.42)}" ry="${k(0.24)}" fill="${D}"/><path d="M${k(-0.26)} ${k(0.55)}h${k(0.52)}v${k(0.5)}a${k(0.26)} ${k(0.26)} 0 0 1 ${k(-0.52)} 0Z" fill="#e45d78"/><path d="M0 ${k(0.62)}v${k(0.34)}" stroke="#b83a55" stroke-width="${k(0.07)}"/>`;
    } else if (kind === 1) { // howling O
      g = `<path d="M${k(-0.66)} ${k(-0.5)}q${k(0.26)} ${k(-0.26)} ${k(0.5)} 0M${k(0.16)} ${k(-0.5)}q${k(0.26)} ${k(-0.26)} ${k(0.5)} 0" ${sw}/>`
        + `<circle cx="${k(-0.34)}" cy="${k(-0.08)}" r="${k(0.21)}" fill="#f6eadf"/><circle cx="${k(0.34)}" cy="${k(-0.08)}" r="${k(0.21)}" fill="#f6eadf"/><circle cx="${k(-0.34)}" cy="${k(-0.06)}" r="${k(0.1)}" fill="${D}"/><circle cx="${k(0.34)}" cy="${k(-0.06)}" r="${k(0.1)}" fill="${D}"/>`
        + `<ellipse cx="0" cy="${k(0.6)}" rx="${k(0.3)}" ry="${k(0.4)}" fill="${D}"/>`;
    } else if (kind === 2) { // cross-eyed, puffed cheeks
      g = `<circle cx="${k(-0.7)}" cy="${k(0.34)}" r="${k(0.4)}" fill="${S}"/><circle cx="${k(0.7)}" cy="${k(0.34)}" r="${k(0.4)}" fill="${S}"/><circle cx="${k(-0.74)}" cy="${k(0.3)}" r="${k(0.16)}" fill="#e89a8a" opacity=".6"/><circle cx="${k(0.74)}" cy="${k(0.3)}" r="${k(0.16)}" fill="#e89a8a" opacity=".6"/>`
        + `<circle cx="${k(-0.32)}" cy="${k(-0.12)}" r="${k(0.2)}" fill="#f6eadf"/><circle cx="${k(0.32)}" cy="${k(-0.12)}" r="${k(0.2)}" fill="#f6eadf"/><circle cx="${k(-0.2)}" cy="${k(-0.1)}" r="${k(0.1)}" fill="${D}"/><circle cx="${k(0.2)}" cy="${k(-0.1)}" r="${k(0.1)}" fill="${D}"/>`
        + `<circle cx="0" cy="${k(0.62)}" r="${k(0.13)}" fill="${D}"/>`;
    } else if (kind === 3) { // angry grin, teeth
      g = `<path d="M${k(-0.68)} ${k(-0.46)}L${k(-0.16)} ${k(-0.2)}M${k(0.68)} ${k(-0.46)}L${k(0.16)} ${k(-0.2)}" ${sw}/><circle cx="${k(-0.32)}" cy="${k(0.02)}" r="${k(0.12)}" fill="${D}"/><circle cx="${k(0.32)}" cy="${k(0.02)}" r="${k(0.12)}" fill="${D}"/>`
        + `<rect x="${k(-0.52)}" y="${k(0.38)}" width="${k(1.04)}" height="${k(0.42)}" rx="${k(0.16)}" fill="${D}"/><rect x="${k(-0.44)}" y="${k(0.42)}" width="${k(0.88)}" height="${k(0.17)}" fill="#f6eadf"/><path d="M${k(-0.22)} ${k(0.42)}v${k(0.17)}M0 ${k(0.42)}v${k(0.17)}M${k(0.22)} ${k(0.42)}v${k(0.17)}" stroke="${D}" stroke-width="${k(0.05)}"/>`;
    } else { // wink + tongue to the side
      g = `<path d="M${k(-0.52)} ${k(-0.02)}q${k(0.2)} ${k(0.14)} ${k(0.38)} 0M${k(-0.62)} ${k(-0.36)}l${k(0.44)} ${k(0.06)}M${k(0.62)} ${k(-0.44)}l${k(-0.44)} ${k(0.04)}" ${sw}/><circle cx="${k(0.32)}" cy="${k(-0.04)}" r="${k(0.13)}" fill="${D}"/>`
        + `<path d="M${k(-0.42)} ${k(0.42)}q${k(0.42)} ${k(0.36)} ${k(0.84)} 0" ${sw}/><ellipse cx="${k(0.3)}" cy="${k(0.74)}" rx="${k(0.17)}" ry="${k(0.26)}" fill="#e45d78" transform="rotate(-18 ${k(0.3)} ${k(0.74)})"/>`;
    }
    return `<g transform="translate(${r1(x)} ${r1(y)})"><g class="cm-ah">${ears}${base}${neutral}<g class="g" opacity="0">${g}</g></g></g>`;
  }

  function cobbles(R, x0, y0, x1, y1, n, cols) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const y = y0 + (y1 - y0) * Math.pow(R(), 0.8), sc = 0.55 + 0.45 * (y - y0) / (y1 - y0);
      s += `<ellipse cx="${r1(x0 + (x1 - x0) * R())}" cy="${r1(y)}" rx="${r1((5 + R() * 3) * sc)}" ry="${r1((2.2 + R() * 1.2) * sc)}" fill="${cols[i % cols.length]}"/>`;
    }
    return s;
  }

  function cloud(x, y, s, op) {
    return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op || 0.9}" fill="#fff"><ellipse cx="0" cy="0" rx="34" ry="12"/><ellipse cx="-12" cy="-8" rx="15" ry="12"/><ellipse cx="9" cy="-12" rx="17" ry="14"/><ellipse cx="26" cy="-3" rx="12" ry="9"/></g>`;
  }

  // stylised 6-lobed "guide" star (Michelin-like rosette), centred on 0,0
  function rosette(r, col, hole) {
    let p = '';
    for (let i = 0; i < 6; i++) p += `<ellipse cx="0" cy="${r1(-r * 0.52)}" rx="${r1(r * 0.36)}" ry="${r1(r * 0.5)}" transform="rotate(${i * 60})"/>`;
    return `<g fill="${col}">${p}<circle r="${r1(r * 0.52)}"/></g><circle r="${r1(r * 0.17)}" fill="${hole}"/>`;
  }

  function sparkle(x, y, s, col) {
    return `<path class="cm-spk" d="M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${col || '#ffd77a'}"/>`;
  }

  /* ================= the scene ================= */
  Story.register({
    id: 'colmar', order: 10, title: 'Colmar', photos: [], skippable: false,
    bg: '#a8d5ee', music: 'normal', darkUI: true,
    build(ctx) {
      const tl = ctx.tl, R = ctx.rand;
      const B2 = 5.6, B3 = 11.2, B4 = 16.8, END = 23.5; // +0.7 s so the punchline can be read before the finale

      ctx.html(`<style>
        ${SC} .cm-layer { position:absolute; left:0; top:0; width:360px; height:640px; overflow:hidden; }
        ${SC} .cm-layer.cm-l2, ${SC} .cm-layer.cm-l3, ${SC} .cm-layer.cm-l4 { box-shadow:-14px 0 28px rgba(40,20,30,.28); }
        ${SC} .cm-abs { position:absolute; left:0; top:0; }
        ${SC} .cm-dim { position:absolute; inset:0; background:#2a1a24; opacity:0; pointer-events:none; z-index:30; }
        ${SC} .cm-chip { position:absolute; top:80px; left:180px; z-index:25; display:flex; align-items:center; gap:7px;
          padding:6px 14px 6px 10px; border-radius:999px; background:#7a1f3d; color:#fff6ec;
          font:600 14px/1 var(--font-display); letter-spacing:.02em; white-space:nowrap;
          box-shadow:0 4px 14px rgba(80,15,40,.3), inset 0 0 0 1.5px rgba(255,255,255,.14); }
        ${SC} .cm-chip svg { width:15px; height:15px; }
        ${SC} .cm-chip span { opacity:.6; font-weight:500; }
        ${SC} .cm-tongue { position:absolute; left:42.5%; top:77.5%; width:17%; height:15%; background:#e2576e;
          border-radius:0 0 50% 50% / 0 0 72% 72%; transform-origin:50% 0; box-shadow:inset 0 3px 0 rgba(150,30,50,.35); }
        ${SC} .cm-frotte { font-size:22px; font-weight:700; color:#7a1f3d; letter-spacing:.04em; padding:8px 16px; }
        ${SC} .cm-cap4 { font-size:16px; }
        ${SC} .cm-punch { display:block; max-height:0; overflow:hidden; color:#8e2448; font-weight:600; }
      </style>`);

      // shared gradients (never hidden)
      ctx.html(`<svg class="cm-abs" width="0" height="0" aria-hidden="true"><defs>
        <linearGradient id="cm-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa9bf"/><stop offset="1" stop-color="#cfe6ee"/></linearGradient>
        <linearGradient id="cm-sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd0ec"/><stop offset="1" stop-color="#e7f3f1"/></linearGradient>
        <linearGradient id="cm-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc2cf"/><stop offset="1" stop-color="#3f7f97"/></linearGradient>
        <linearGradient id="cm-veil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7db7c6" stop-opacity=".35"/><stop offset=".5" stop-color="#5a98ad" stop-opacity=".6"/><stop offset="1" stop-color="#3f7f97" stop-opacity=".92"/></linearGradient>
        <linearGradient id="cm-hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6b58"/><stop offset="1" stop-color="#22423a"/></linearGradient>
        <linearGradient id="cm-sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6ee"/><stop offset="1" stop-color="#f1f1e6"/></linearGradient>
        <linearGradient id="cm-sky3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b98f"/><stop offset=".55" stop-color="#fbd9ae"/><stop offset="1" stop-color="#fdeccc"/></linearGradient>
        <radialGradient id="cm-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6dc" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe9b8" stop-opacity=".55"/><stop offset="1" stop-color="#ffe0a6" stop-opacity="0"/></radialGradient>
        <linearGradient id="cm-wall4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ebdd"/><stop offset="1" stop-color="#ecdcc8"/></linearGradient>
        <linearGradient id="cm-fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd8e8"/><stop offset=".6" stop-color="#f2dcd6"/><stop offset="1" stop-color="#f7e6cf"/></linearGradient>
        <linearGradient id="cm-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f4"/><stop offset="1" stop-color="#efe8df"/></linearGradient>
        <linearGradient id="cm-drape" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9e1d7"/><stop offset=".5" stop-color="#fbf8f3"/><stop offset="1" stop-color="#e4dbd0"/></linearGradient>
        <linearGradient id="cm-silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d5dce3"/><stop offset="1" stop-color="#8e9aa6"/></linearGradient>
        <linearGradient id="cm-curtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e1530"/><stop offset=".5" stop-color="#8e2448"/><stop offset="1" stop-color="#5e1530"/></linearGradient>
        <radialGradient id="cm-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/></radialGradient>
        <radialGradient id="cm-redglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".75"/><stop offset=".45" stop-color="#ff8a7a" stop-opacity=".3"/><stop offset="1" stop-color="#ffb3a0" stop-opacity="0"/></radialGradient>
        <linearGradient id="cm-wine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc7c"/><stop offset="1" stop-color="#e5bd45"/></linearGradient>
      </defs></svg>`);

      const layer = (n) => ctx.html(`<div class="cm-layer cm-l${n}" style="z-index:${n}"><div class="cm-dim"></div></div>`);
      const svgIn = (parent, inner, w, h, style) => ctx.html(`<svg class="cm-abs" width="${w || 360}" height="${h || 640}" viewBox="0 0 ${w || 360} ${h || 640}" style="${style || ''}" aria-hidden="true">${inner}</svg>`, parent);
      const L1 = layer(1), L2 = layer(2), L3 = layer(3), L4 = layer(4);
      const dim = (L) => L.querySelector('.cm-dim');

      /* ------------- title chip ------------- */
      const chip = ctx.html(`<div class="cm-chip"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1.5h8c0 4-1.2 6.4-4 6.4S4 5.5 4 1.5Z" fill="#ffd7e0"/><path d="M4.6 3.6h6.8c-.3 2.6-1.5 3.6-3.4 3.6S4.9 6.2 4.6 3.6Z" fill="#e2577a"/><path d="M8 7.9v5.2M5.2 14.4h5.6" stroke="#ffd7e0" stroke-width="1.5" stroke-linecap="round"/></svg>Option 2 <span>·</span> Colmar</div>`);
      gsap.set(chip, { xPercent: -50 });
      tl.fromTo(chip, { opacity: 0, scale: 0.6, y: -6 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.1);
      ctx.sfx('chime', 0.12);

      /* ================= BEAT 1 — la Petite Venise ================= */
      ctx.backdrop('#9fd0ec', '#3f7f97');
      const WL = 392; // waterline
      const H1 = [
        { x: 28, base: WL, w: 64, gh: 36, floors: 2, fh: 60, wall: '#f4b3a6', roof: '#a8493a', gable: true, rh: 70, shutter: '#5f8f78', door: 0.68, gwin: 0.25, waterline: true },
        { x: 98, base: WL, w: 72, gh: 32, floors: 3, fh: 50, wall: '#f0c46d', roof: '#b45a3e', rh: 42, shutter: '#4f7ea8', gwin: 0.5, waterline: true, chimney: 0.78 },
        { x: 178, base: WL, w: 60, gh: 38, floors: 2, fh: 62, wall: '#a9cfe2', roof: '#9c4433', gable: true, rh: 78, shutter: '#b8505a', door: 0.35, waterline: true },
        { x: 244, base: WL, w: 68, gh: 32, floors: 3, fh: 48, wall: '#bcd2a6', roof: '#ad5039', gable: true, rh: 56, shutter: '#8a4a5e', gwin: 0.7, waterline: true },
        { x: 318, base: WL, w: 64, gh: 34, floors: 2, fh: 56, wall: '#efb9c9', roof: '#a8493a', rh: 40, shutter: '#4f7ea8', waterline: true },
      ];
      // static sky
      svgIn(L1, `<rect width="360" height="${WL + 2}" fill="url(#cm-sky1)"/><circle cx="292" cy="150" r="90" fill="url(#cm-sun)"/>`, 360, WL + 2);
      // drifting clouds (own layer: moved with CSS transforms, no SVG repaint)
      const clouds1 = ctx.html(`<svg class="cm-abs" width="420" height="110" viewBox="-30 80 420 110" style="left:-30px;top:80px" aria-hidden="true">${cloud(60, 132, 1, 0.85)}${cloud(250, 112, 0.8, 0.75)}${cloud(330, 168, 0.6, 0.6)}</svg>`, L1);
      // static town: hazy roofs + St-Martin's tower, the five houses, willow trunk, water
      let b1 = `<defs><g id="cm-refl">${H1.map(h => house(R, Object.assign({}, h, { simple: true }))).join('')}</g></defs>`;
      b1 += `<g fill="#cbd3e4"><path d="M0 330 L20 300 L46 300 L60 280 L98 280 L110 296 L160 296 L176 270 L206 270 L222 290 L270 290 L290 262 L330 262 L360 290 V392 H0Z"/>`
        + `<rect x="196" y="176" width="34" height="120"/><path d="M192 180 L213 128 L234 180Z"/><rect x="209" y="112" width="8" height="18"/><path d="M206 114 L213 98 L220 114Z"/></g>`
        + `<g fill="#b9c3d8"><rect x="204" y="196" width="6" height="14" rx="3"/><rect x="216" y="196" width="6" height="14" rx="3"/><rect x="204" y="236" width="6" height="14" rx="3"/><rect x="216" y="236" width="6" height="14" rx="3"/></g>`;
      b1 += `<g>${H1.map(h => house(R, h)).join('')}</g>`;
      b1 += `<path d="M-8 ${WL} Q14 300 6 200 L16 198 Q30 300 18 ${WL}Z" fill="#6b5040"/>`;
      b1 += `<rect y="${WL}" width="360" height="${640 - WL}" fill="url(#cm-water)"/>`;
      svgIn(L1, b1);
      // reflections: 8 horizontal bands, each its own small SVG that wobbles sideways (composited)
      const bandEls = [];
      for (let i = 0; i < 8; i++) {
        const y0 = WL + i * 31, h = 32;
        bandEls.push(ctx.html(`<svg class="cm-abs" width="380" height="${h}" viewBox="-10 ${y0} 380 ${h}" style="left:-10px;top:${y0}px" aria-hidden="true"><use href="#cm-refl" transform="matrix(1 0 0 -1 0 ${2 * WL})"/></svg>`, L1));
      }
      // water veil + shimmering ripples
      let rip = `<rect y="${WL}" width="360" height="${640 - WL}" fill="url(#cm-veil)"/><rect y="${WL}" width="360" height="3" fill="rgba(255,255,255,.35)"/>`;
      for (let i = 0; i < 16; i++) {
        const y = WL + 12 + Math.pow(R(), 1.2) * 230, w = 10 + R() * (14 + (y - WL) * 0.18);
        rip += `<path class="cm-rip" d="M${r1(R() * 340)} ${r1(y)}h${r1(w)}" stroke="#fff" stroke-opacity="${r1(0.35 + R() * 0.35)}" stroke-width="${r1(1.4 + (y - WL) / 120)}" stroke-linecap="round"/>`;
      }
      svgIn(L1, rip);
      // willow (left), in front of the first house; sways as a whole layer
      let fronds = '';
      for (let i = 0; i < 26; i++) {
        const x = -16 + i * 4.4 + R() * 4, y0 = 136 + R() * 46, len = 120 + R() * 120 - Math.max(0, x - 60) * 1.2;
        const col = ['#6f9a4e', '#86ad5f', '#9cc271', '#7fa65a'][i % 4];
        fronds += `<path d="M${r1(x)} ${r1(y0)}q${r1(5 + R() * 7)} ${r1(len * 0.5)} ${r1(2 + R() * 7)} ${r1(len)}" stroke="${col}" stroke-width="${r1(2.6 + R() * 2.2)}" stroke-dasharray="4 2.2" stroke-linecap="round" fill="none"/>`;
      }
      const willow = ctx.html(`<svg class="cm-abs" width="150" height="320" viewBox="-30 100 150 320" style="left:-30px;top:100px" aria-hidden="true"><g fill="#6f9a4e"><ellipse cx="34" cy="158" rx="60" ry="34"/><ellipse cx="-4" cy="178" rx="38" ry="26"/><ellipse cx="78" cy="176" rx="30" ry="20"/></g><g fill="#86ad5f"><ellipse cx="26" cy="146" rx="50" ry="26"/><ellipse cx="72" cy="164" rx="26" ry="14"/></g><g fill="#a5c97a"><ellipse cx="20" cy="134" rx="26" ry="12"/><ellipse cx="60" cy="148" rx="14" ry="7"/></g>${fronds}</svg>`, L1);
      // ducks
      const duck = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="2" rx="14" ry="2.4" fill="#fff" opacity=".45"/><path d="M-10 0 Q-11 -9 0 -8 L8 -8 Q12 -8 11 -3 Q10 1 0 1Z" fill="#a07a5a"/><path d="M-6 -7 Q0 -11 6 -7 Q0 -4 -6 -7Z" fill="#7a5a42"/><circle cx="-8" cy="-12" r="4.6" fill="#2f7a55"/><path d="M-12 -12 L-17 -10.5 L-12 -9.5Z" fill="#f2a83a"/><circle cx="-9" cy="-13" r=".9" fill="#111"/><rect x="-10.5" y="-8.4" width="5" height="1.4" fill="#fff"/></g>`;
      const ducks = ctx.html(`<svg class="cm-abs" width="70" height="34" viewBox="280 412 70 34" style="left:280px;top:412px" aria-hidden="true">${duck(300, 430, 1)}${duck(326, 436, 0.85)}</svg>`, L1);

      // the barque (flat-bottomed boat) with its boatman and Sven
      const boat = ctx.html(`<div class="cm-abs" style="width:240px;height:300px;top:${480 - 212}px;z-index:4"></div>`, L1);
      const bob = ctx.html(`<div class="cm-abs" style="width:240px;height:300px"></div>`, boat);
      // boatman (behind the hull), with pole
      ctx.html(`<svg class="cm-abs" width="120" height="200" viewBox="-20 60 120 200" style="left:-20px;top:60px;z-index:3;overflow:visible" aria-hidden="true">
        <g class="cm-boatman">
          <path d="M84 96 L-6 252" stroke="#8a5a3a" stroke-width="3.4" stroke-linecap="round"/>
          <path d="M18 196 L-6 252" stroke="#3f7f97" stroke-width="4" stroke-linecap="round" opacity=".55"/>
          <path d="M20 132 Q42 124 64 132 L66 200 L18 200Z" fill="#fff"/>
          <g fill="#2c3e66"><rect x="18" y="140" width="48" height="4"/><rect x="18" y="150" width="48" height="4"/><rect x="18" y="160" width="48" height="4"/><rect x="18" y="170" width="48" height="4"/><rect x="18" y="180" width="48" height="4"/><rect x="18" y="190" width="48" height="4"/></g>
          <path d="M33 128 L42 142 L51 128Z" fill="#c7354a"/>
          <rect x="37" y="114" width="10" height="14" rx="3" fill="#efc29e"/>
          <circle cx="42" cy="104" r="16" fill="#f2c7a3"/>
          <circle cx="26.5" cy="106" r="3.6" fill="#e8b590"/>
          <path d="M28 98 Q30 88 42 88 Q54 88 57 98 Q50 93 42 94 Q34 94 28 98Z" fill="#5a3b2b"/>
          <circle cx="37" cy="104" r="1.9" fill="#2a1d18"/><circle cx="49" cy="104" r="1.9" fill="#2a1d18"/>
          <path d="M34 112 Q38 109 42 111 Q46 109 50 112 Q46 115 42 113 Q38 115 34 112Z" fill="#5a3b2b"/>
          <circle cx="32" cy="109" r="3" fill="#ec9f8a" opacity=".45"/><circle cx="53" cy="109" r="3" fill="#ec9f8a" opacity=".45"/>
          <ellipse cx="42" cy="90" rx="22" ry="5" fill="#e3c06b"/><rect x="29" y="76" width="26" height="14" rx="2" fill="#efd283"/><rect x="29" y="83" width="26" height="4.5" fill="#7a1f3d"/><ellipse cx="42" cy="88.5" rx="21" ry="2" fill="#c9a44f" opacity=".6"/>
          <path d="M22 140 Q14 150 32 154" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/>
          <path d="M62 140 Q72 128 70 116" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none"/>
          <circle cx="68" cy="114" r="5" fill="#efc29e"/><circle cx="35" cy="154" r="5" fill="#efc29e"/>
        </g></svg>`, bob);
      const deck = ctx.html(`<div class="cm-abs" style="width:240px;height:${198 + 140}px;top:-140px;overflow:hidden;z-index:5"></div>`, bob);
      // sitting in the barque: feet hidden below the gunwale, torso + waving arm visible
      const sv1 = ctx.char('sven', { outfit: 'casual', h: 150, x: 150, y: 214 + 140, parent: deck });
      ctx.html(`<svg class="cm-abs" width="270" height="90" viewBox="-20 176 270 90" style="left:-20px;top:176px;z-index:6;overflow:visible" aria-hidden="true">
        <path d="M2 186 Q8 199 24 199 L204 199 Q222 197 234 174 L236 176 Q232 204 214 216 L22 216 Q4 211 2 186Z" fill="url(#cm-hull)"/>
        <path d="M3 186 Q8 198 24 198 L204 198 Q222 196 234 174" stroke="#c08a52" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <path d="M10 206 Q20 208 30 208 L206 208 Q220 206 230 196" stroke="#8e2448" stroke-width="2.4" fill="none"/>
        <path d="M30 202 L200 202" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/>
        <g opacity=".3"><path d="M22 216 L214 216 Q232 228 236 254 L234 256 Q222 236 204 234 L24 234 Q8 234 2 246 Q4 222 22 216Z" fill="#1d3a33"/></g>
        <path d="M-12 218 Q20 223 60 218 T130 218 T200 218 T246 214" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <g class="cm-wake" stroke="#fff" stroke-linecap="round" fill="none"><path d="M-6 222 Q-26 224 -44 230" stroke-width="2" stroke-opacity=".55"/><path d="M0 228 Q-16 236 -34 242" stroke-width="1.6" stroke-opacity=".4"/><path d="M240 206 Q252 212 256 222" stroke-width="2" stroke-opacity=".6"/></g>
      </svg>`, bob);

      // ambient life
      ctx.loop(gsap.to(bob, { y: 2.5, rotation: 0.9, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 70%' }));
      ctx.loop(gsap.fromTo(L1.querySelector('.cm-boatman'), { rotation: -3 }, { rotation: 4, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '42 200' }));
      ctx.loop(gsap.fromTo(willow, { rotation: -1.2 }, { rotation: 1.4, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '60px 40px' }));
      ctx.loop(gsap.fromTo(clouds1, { x: -6 }, { x: 14, duration: 7, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      bandEls.forEach((g, i) => ctx.loop(gsap.fromTo(g, { x: -2.5 - i * 0.45 }, { x: 2.5 + i * 0.45, duration: 0.9 + (i % 3) * 0.35, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: -i * 0.37 })));
      L1.querySelectorAll('.cm-rip').forEach((g, i) => ctx.loop(gsap.fromTo(g, { x: -5, opacity: 0.4 }, { x: 6, opacity: 1, duration: 1.4 + (i % 4) * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: -i * 0.29 })));
      ctx.loop(gsap.fromTo(L1.querySelector('.cm-wake'), { opacity: 0.5 }, { opacity: 1, duration: 0.7, yoyo: true, repeat: -1 }));
      sv1.idle();

      // beat 1 timeline
      tl.fromTo(boat, { x: -250 }, { x: 70, duration: 3.1, ease: 'power2.out' }, 0);
      tl.to(boat, { x: 150, duration: 3.4, ease: 'none' }, 3.1);
      tl.fromTo(ducks, { x: 20 }, { x: -70, duration: 6.4, ease: 'none' }, 0);
      sv1.wave(1.7, 'R', 2);
      sv1.emote(3.0, '♥', 1.4);
      tl.to(sv1.head, { rotation: -9, duration: 0.4, ease: 'sine.inOut' }, 3.6);
      tl.to(sv1.head, { rotation: 0, duration: 0.4, ease: 'sine.inOut' }, 4.6);
      ctx.caption('Colmar : la Petite Venise, en barque.', 0.5, { dur: 4.7 });

      /* ================= BEAT 2 — Maison Pfister → Maison des Têtes ================= */
      let sky2 = `<rect width="360" height="640" fill="url(#cm-sky2)"/><g class="cm-clouds2">${cloud(70, 150, 0.9, 0.85)}${cloud(240, 118, 1.1, 0.8)}${cloud(380, 170, 0.8, 0.7)}</g>`;
      svgIn(L2, sky2);
      const pan = ctx.html(`<div class="cm-abs" style="width:680px;height:640px"></div>`, L2);
      let p2 = '';
      // street
      p2 += `<rect y="470" width="680" height="170" fill="#d3c4ab"/><rect y="470" width="680" height="7" fill="#bba98d"/>`;
      p2 += cobbles(R, -10, 482, 690, 640, 150, ['#c4b498', '#ddd0ba', '#cbbca2', '#e2d7c4']);
      // far alley house between the buildings
      p2 += `<rect x="320" y="240" width="60" height="232" fill="#b7cfdf"/><path d="M314 244 L350 200 L386 244Z" fill="#a9604a"/><rect x="336" y="280" width="10" height="16" fill="#7d93a3"/><rect x="354" y="280" width="10" height="16" fill="#7d93a3"/><rect x="336" y="330" width="10" height="16" fill="#7d93a3"/><rect x="354" y="330" width="10" height="16" fill="#7d93a3"/><rect x="320" y="440" width="60" height="32" fill="rgba(60,40,50,.18)"/>`;
      // --- Maison Pfister ---
      p2 += `<path d="M14 214 L60 120 L212 120 L246 214Z" fill="#9a4a35"/>`;
      { let d = ''; for (let yy = 126; yy < 214; yy += 6) { const t = (yy - 120) / 94; d += `M${r1(60 - 46 * t)} ${yy}H${r1(212 + 34 * t)}`; } p2 += `<path d="${d}" stroke="rgba(60,20,10,.25)" stroke-width="1.2"/>`; }
      p2 += `<rect x="58" y="117" width="156" height="5" rx="2.5" fill="#6e3022"/>`;
      [96, 170].forEach(x => { p2 += `<path d="M${x - 14} 176 L${x} 156 L${x + 14} 176Z" fill="#8a3f2d"/><rect x="${x - 10}" y="174" width="20" height="18" fill="#f0dcb4"/><rect x="${x - 6}" y="177" width="12" height="13" fill="url(#cm-glass)"/><path d="M${x} 177v13" stroke="#f0dcb4" stroke-width="1.2"/>`; });
      // gallery (loggia)
      p2 += `<rect x="22" y="212" width="218" height="54" fill="#3c2820"/><rect x="18" y="210" width="226" height="6" fill="#6e4632"/>`;
      for (let k = 0; k < 9; k++) { const x = 22 + k * 26.6; p2 += `<rect x="${r1(x)}" y="214" width="5" height="52" fill="#76503a"/>`; if (k < 8) p2 += `<path d="M${r1(x + 5)} 226 Q${r1(x + 15.3)} 214 ${r1(x + 26.6)} 226" stroke="#76503a" stroke-width="3" fill="none"/>`; }
      p2 += `<rect x="22" y="244" width="218" height="4" fill="#8a5d40"/><rect x="22" y="262" width="218" height="4" fill="#8a5d40"/>`;
      { let d = ''; for (let x = 26; x < 240; x += 6.4) d += `M${r1(x)} 248v14`; p2 += `<path d="${d}" stroke="#9b6b4a" stroke-width="2.6"/>`; }
      // upper floors with painted panels
      p2 += `<rect x="22" y="266" width="218" height="136" fill="#f1dfb8"/><rect x="232" y="266" width="8" height="136" fill="rgba(80,40,20,.06)"/>`;
      p2 += `<rect x="22" y="266" width="218" height="7" fill="#c98d4e"/>`;
      { let d = ''; for (let x = 26; x < 238; x += 10) d += `M${x} 269.5 l3 -2 l3 2 l-3 2z`; p2 += `<path d="${d}" fill="#7a1f3d" opacity=".75"/>`; }
      p2 += `<rect x="22" y="332" width="218" height="5" fill="#d2b27a"/>`;
      const pfWin = (cx, y) => `<rect x="${cx - 13}" y="${y - 3}" width="26" height="44" fill="#d2b88e"/><rect x="${cx - 10}" y="${y}" width="20" height="38" fill="url(#cm-glass)"/><path d="M${cx} ${y}v38M${cx - 10} ${y + 15}h20" stroke="#f4ead6" stroke-width="1.6"/><path d="M${cx - 8} ${y + 12} L${cx - 3} ${y + 3}" stroke="#fff" stroke-opacity=".7" stroke-width="1.3" stroke-linecap="round"/>`;
      const panel = (x, y, w, h, i) => {
        const robe = ['#a63c48', '#3f6d8f', '#c98d4e', '#5f8f78'][i % 4], cx = x + w / 2;
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#c7dcd6"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#a5653d" stroke-width="1.8"/>`
          + `<path d="M${x + 2} ${y + h - 6} Q${cx} ${y + h - 12} ${x + w - 2} ${y + h - 6} V${y + h - 1} H${x + 2}Z" fill="#a9c49a"/>`
          + (i % 3 === 0 ? `<circle cx="${cx}" cy="${y + 10}" r="5.5" fill="#e9c46a" opacity=".85"/>` : '')
          + `<circle cx="${cx}" cy="${y + 10}" r="3.6" fill="#f0c9a5"/><path d="M${cx} ${y + 13} L${cx - 7} ${y + h - 4} L${cx + 7} ${y + h - 4}Z" fill="${robe}"/><path d="M${cx - 2} ${y + 17} L${cx - 9} ${y + 23}M${cx + 2} ${y + 17} L${cx + 8} ${y + 14}" stroke="${robe}" stroke-width="2.4" stroke-linecap="round"/>`;
      };
      [276, 344].forEach((y, fi) => {
        [52, 116, 180].forEach(cx => { p2 += pfWin(cx, y + 6); });
        p2 += panel(70, y + 4, 28, 42, fi) + panel(134, y + 4, 28, 42, fi + 1) + panel(196, y + 4, 26, 42, fi + 2);
        p2 += `<rect x="26" y="${y + 4}" width="12" height="42" fill="#c7dcd6" stroke="#a5653d" stroke-width="1.8"/><path d="M32 ${y + 8} q-4 6 0 11 q4 6 0 11 q-4 6 0 11" stroke="#5f8f78" stroke-width="1.6" fill="none"/>`;
      });
      // ground floor arcade
      p2 += `<rect x="22" y="402" width="218" height="70" fill="#d6c3a2"/><rect x="22" y="400" width="218" height="5" fill="#bfa47c"/>`;
      [[38, 92], [106, 160]].forEach(([a, b]) => {
        const m = (a + b) / 2, r = (b - a) / 2;
        p2 += `<path d="M${a - 4} 472 V${440 - r + 14} A${r + 4} ${r + 4} 0 0 1 ${b + 4} ${440 - r + 14} V472Z" fill="#c2a985"/><path d="M${a} 472 V${440 - r + 14} A${r} ${r} 0 0 1 ${b} ${440 - r + 14} V472Z" fill="#4a3530"/>`
          + `<path d="M${a + 4} 472 V${444 - r + 14} A${r - 4} ${r - 4} 0 0 1 ${b - 4} ${444 - r + 14} V472Z" fill="#f2cf86" opacity=".85"/><path d="M${m} ${426 - r + 14}V472M${a + 4} 448H${b - 4}" stroke="#4a3530" stroke-width="2.4"/>`;
      });
      p2 += `<path d="M182 472 V430 A16 16 0 0 1 214 430 V472Z" fill="#5d3a2c"/><path d="M178 472 V430 A20 20 0 0 1 218 430 V472" stroke="#c2a985" stroke-width="4" fill="none"/>`;
      // corner turret (octagonal oriel)
      p2 += `<path d="M234 400 L294 400 L276 424 L264 440 L252 424Z" fill="#cdb38b"/><path d="M240 408 L288 408M248 418 L280 418" stroke="#b39770" stroke-width="2"/>`;
      p2 += `<rect x="234" y="214" width="16" height="188" fill="#dcc79f"/><rect x="250" y="214" width="28" height="188" fill="#f4e4c3"/><rect x="278" y="214" width="16" height="188" fill="#d2bb92"/>`;
      p2 += `<rect x="234" y="270" width="60" height="6" fill="#c98d4e"/><rect x="234" y="334" width="60" height="5" fill="#d2b27a"/>`;
      [224, 284, 348].forEach(y => { p2 += `<rect x="255" y="${y}" width="18" height="34" fill="url(#cm-glass)"/><path d="M264 ${y}v34M255 ${y + 13}h18" stroke="#f4ead6" stroke-width="1.4"/><rect x="238" y="${y + 2}" width="8" height="30" fill="#7e98a8"/><rect x="282" y="${y + 2}" width="8" height="30" fill="#6f8898"/>`; });
      p2 += `<path d="M228 216 L300 216 L298 210 L230 210Z" fill="#6e4632"/>`;
      p2 += `<path d="M230 212 L264 126 L250 212Z" fill="#8b4131"/><path d="M250 212 L264 126 L278 212Z" fill="#ab5640"/><path d="M278 212 L264 126 L298 212Z" fill="#79372a"/><path d="M264 126 V108" stroke="#4a4038" stroke-width="1.6"/><circle cx="264" cy="106" r="2.6" fill="#d7ad4e"/>`;
      // side façade beyond the turret
      p2 += `<rect x="294" y="214" width="26" height="258" fill="#cfb68b"/><path d="M294 214 L294 160 L322 196 L322 214Z" fill="#7c392a"/><rect x="301" y="290" width="10" height="26" fill="#6d8595"/><rect x="301" y="356" width="10" height="26" fill="#6d8595"/><rect x="301" y="420" width="10" height="40" fill="#5d3a2c"/>`;
      // street lamp
      p2 += `<rect x="338" y="330" width="3.5" height="142" fill="#2d2a2e"/><path d="M332 330 h16 l-3 -18 h-10z" fill="#2d2a2e"/><path d="M334.5 328 h11 l-2 -13 h-7z" fill="#ffe7a6"/><path d="M331 312 h18 l-9 -8z" fill="#2d2a2e"/><rect x="334" y="466" width="12" height="6" fill="#2d2a2e"/>`;
      // --- Maison des Têtes ---
      const TF = '#e7bea4', TT = '#c99a80';
      p2 += `<path d="M372 236 V226 H390 V204 H418 V176 H446 V150 H474 V134 H526 V150 H554 V176 H582 V204 H610 V226 H628 V236Z" fill="${TF}"/>`;
      p2 += `<path d="M372 226 H390 M390 204 H418 M418 176 H446 M446 150 H474 M474 134 H526 M526 150 H554 M554 176 H582 M582 204 H610 M610 226 H628" stroke="${TT}" stroke-width="4"/>`;
      [[390, 226], [610, 226], [418, 204], [582, 204], [446, 176], [554, 176], [474, 150], [526, 150]].forEach(([x, y]) => {
        p2 += `<path d="M${x - 4} ${y - 2} L${x} ${y - 14} L${x + 4} ${y - 2}Z" fill="${TT}"/><circle cx="${x}" cy="${y - 15}" r="2" fill="${TT}"/>`;
      });
      p2 += `<path d="M482 134 Q500 118 518 134Z" fill="${TT}"/>`;
      // the cooper statue on top (small bronze figure)
      p2 += `<g fill="#9b7a3a"><rect x="497" y="118" width="6" height="12" rx="2"/><circle cx="500" cy="115" r="3.4"/><ellipse cx="507" cy="126" rx="5" ry="4.5"/></g>`;
      p2 += `<rect x="362" y="236" width="280" height="236" fill="${TF}"/>`;
      p2 += `<rect x="358" y="232" width="288" height="7" fill="${TT}"/><rect x="358" y="314" width="288" height="6" fill="${TT}"/><rect x="358" y="394" width="288" height="6" fill="${TT}"/>`;
      p2 += `<g fill="#ddb196">${[367, 410, 452, 538, 580, 623].map(x => `<rect x="${x}" y="239" width="10" height="155"/>`).join('')}</g>`;
      const tWin = (cx, y) => `<rect x="${cx - 15}" y="${y - 3}" width="30" height="54" fill="#f3dccb"/><rect x="${cx - 12}" y="${y}" width="24" height="48" fill="#4f5d66"/><rect x="${cx - 12}" y="${y}" width="24" height="48" fill="url(#cm-glass)" opacity=".55"/><path d="M${cx} ${y}v48M${cx - 12} ${y + 17}h24" stroke="#f3dccb" stroke-width="2.6"/><path d="M${cx - 9} ${y + 13} L${cx - 4} ${y + 4}" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>`;
      [394, 436, 564, 606].forEach(cx => { p2 += tWin(cx, 254) + tWin(cx, 334); });
      p2 += `<rect x="460" y="230" width="80" height="6" fill="${TT}"/><path d="M462 230 L500 214 L538 230Z" fill="#b5654c"/>`;
      // gable windows + oculus
      p2 += `<rect x="461" y="206" width="18" height="24" fill="#f3dccb"/><rect x="464" y="209" width="12" height="18" fill="#56626b"/><rect x="521" y="206" width="18" height="24" fill="#f3dccb"/><rect x="524" y="209" width="12" height="18" fill="#56626b"/><circle cx="500" cy="162" r="7" fill="#f3dccb"/><circle cx="500" cy="162" r="4.4" fill="#56626b"/>`;
      // oriel
      p2 += `<rect x="466" y="240" width="68" height="160" fill="#d7a78c"/><rect x="474" y="240" width="52" height="160" fill="#f3cfb6"/><rect x="466" y="314" width="68" height="8" fill="${TT}"/>`;
      [252, 330].forEach(y => { p2 += `<rect x="479" y="${y}" width="42" height="54" fill="#f7e4d6"/><rect x="482" y="${y + 3}" width="36" height="48" fill="#4f5d66"/><rect x="482" y="${y + 3}" width="36" height="48" fill="url(#cm-glass)" opacity=".55"/><path d="M494 ${y + 3}v48M506 ${y + 3}v48M482 ${y + 20}h36" stroke="#f7e4d6" stroke-width="2.2"/>`; });
      p2 += `<path d="M464 400 L536 400 L522 418 L500 432 L478 418Z" fill="${TT}"/><path d="M470 408 H530" stroke="#b88870" stroke-width="2"/>`;
      // ground floor + big door
      p2 += `<rect x="362" y="400" width="280" height="72" fill="#dcae94"/>`;
      p2 += `<path d="M470 472 V436 A30 30 0 0 1 530 436 V472Z" fill="#c38f74"/><path d="M477 472 V436 A23 23 0 0 1 523 436 V472Z" fill="#5d3a2c"/><path d="M500 414 V472" stroke="#4a2c21" stroke-width="2"/><g fill="#c9a24a"><circle cx="490" cy="450" r="1.6"/><circle cx="510" cy="450" r="1.6"/></g>`;
      [404, 596].forEach(cx => { p2 += `<rect x="${cx - 12}" y="420" width="24" height="30" fill="#f3dccb"/><rect x="${cx - 9}" y="423" width="18" height="24" fill="#56626b"/><path d="M${cx - 3} 423v24M${cx + 3} 423v24" stroke="#2d2a2e" stroke-width="1.4"/>`; });
      // ~45 small carved heads
      const heads = [];
      [367, 410, 452, 538, 580, 623].forEach(x => { heads.push([x + 5, 266], [x + 5, 298], [x + 5, 348], [x + 5, 378]); });
      heads.push([480, 408], [500, 424], [520, 408]);
      heads.push([480, 318], [520, 318]);
      heads.push([430, 222], [570, 222], [500, 218], [482, 166], [518, 166], [500, 144], [404, 220], [596, 220]);
      [394, 436, 564, 606].forEach(x => heads.push([x, 328]));
      heads.push([404, 412], [596, 412]);
      const skip = (x, y) => (Math.abs(x - 415) < 6 && Math.abs(y - 298) < 6) || (Math.abs(x - 585) < 6 && Math.abs(y - 298) < 6) || (Math.abs(x - 500) < 4 && Math.abs(y - 424) < 4);
      p2 += heads.filter(([x, y]) => !skip(x, y)).map(([x, y]) => stoneHead(R, x, y, y > 400 && y < 430 && x > 470 && x < 530 ? 4.6 : 5.6)).join('');
      // the five heads that come alive
      const AH = [[415, 292, 0], [500, 320, 1], [585, 292, 2], [456, 196, 3], [544, 196, 4]];
      svgIn(pan, p2, 680, 640);
      ctx.html(`<svg class="cm-abs" width="280" height="240" viewBox="360 140 280 240" style="left:360px;top:140px;overflow:visible" aria-hidden="true">${AH.map(([x, y, k]) => activeHead(x, y, 14, k)).join('')}</svg>`, pan);
      const ahs = Array.from(pan.querySelectorAll('.cm-ah'));
      // Sven ends left of the oriel (stage x ≈ 95) so the five grimacing heads stay visible above/beside him
      const sv2 = ctx.char('sven', { outfit: 'casual', h: 170, x: 110, y: 508, parent: pan });
      const tongue = ctx.html('<div class="cm-tongue"></div>', sv2.head);
      ctx.loop(gsap.fromTo(L2.querySelector('.cm-clouds2'), { x: 0 }, { x: -24, duration: 9, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

      // beat 2 timeline
      ctx.beat(B2);
      const slide = (Lnew, Lold, at) => {
        gsap.set(Lnew, { visibility: 'hidden' });
        tl.set(Lnew, { visibility: 'visible' }, at);
        tl.fromTo(Lnew, { x: 360 }, { x: 0, duration: 0.85, ease: 'power3.inOut' }, at);
        tl.to(Lold, { x: -120, duration: 0.85, ease: 'power3.inOut' }, at);
        tl.fromTo(dim(Lold), { opacity: 0 }, { opacity: 0.45, duration: 0.85, ease: 'power1.in' }, at);
        tl.set(Lold, { visibility: 'hidden' }, at + 0.9);
        ctx.sfx('whoosh', at);
      };
      slide(L2, L1, B2);
      ctx.backdrop('#a9d6ee', '#d3c4ab', B2 + 0.3);
      sv2.walk(B2 + 0.35, 275, 2.3);
      // let the Pfister sit on screen a moment before the camera pans to the Têtes
      tl.fromTo(pan, { x: 0 }, { x: -290, duration: 1.6, ease: 'power2.inOut' }, B2 + 1.1);
      tl.to(sv2.head, { rotation: -10, duration: 0.3 }, B2 + 0.7);
      tl.to(sv2.head, { rotation: 0, duration: 0.3 }, B2 + 1.6);
      ctx.caption('Maison Pfister… et une centaine de têtes qui te regardent.', B2 + 0.45, { dur: 4.7 });
      // heads come alive one after another
      const tFace = B2 + 2.8;
      ahs.forEach((h, i) => {
        const t = tFace + i * 0.24;
        tl.fromTo(h, { scale: 1, rotation: 0 }, { scale: 1.45, rotation: (i % 2 ? 10 : -10), duration: 0.18, ease: 'power2.out', transformOrigin: '50% 50%' }, t);
        tl.to(h, { scale: 1.3, rotation: (i % 2 ? -4 : 4), duration: 0.35, ease: 'elastic.out(1, 0.4)' }, t + 0.18);
        tl.to(h.querySelector('.n'), { opacity: 0, duration: 0.05 }, t + 0.08);
        tl.to(h.querySelector('.g'), { opacity: 1, duration: 0.05 }, t + 0.08);
        ctx.sfx(i % 2 ? 'tick' : 'pop', t);
      });
      sv2.emote(tFace + 0.2, '!', 0.9);
      tl.to(sv2.head, { rotation: 8, duration: 0.2 }, tFace + 0.15);
      // Sven pulls one back: anticipation, hop, moose-ears, tongue
      const tSv = B2 + 4.15;
      tl.to(sv2.el, { scaleY: 0.92, scaleX: 1.05, duration: 0.14, ease: 'power2.in' }, tSv - 0.16);
      tl.to(sv2.el, { scaleY: 1, scaleX: 1, duration: 0.25, ease: 'back.out(3)' }, tSv);
      sv2.hop(tSv, 26);
      tl.to(sv2.armL, { rotation: 138, duration: 0.22, ease: 'back.out(2)' }, tSv);
      tl.to(sv2.armR, { rotation: -138, duration: 0.22, ease: 'back.out(2)' }, tSv);
      tl.to([sv2.armL, sv2.armR], { rotation: '+=8', duration: 0.09, yoyo: true, repeat: 5, ease: 'sine.inOut' }, tSv + 0.25);
      tl.to(sv2.head, { rotation: -14, duration: 0.2, ease: 'back.out(2)' }, tSv);
      tl.fromTo(tongue, { scaleY: 0 }, { scaleY: 1, duration: 0.2, ease: 'back.out(3)' }, tSv + 0.06);
      ctx.sfx('boing', tSv);
      // heads are beaten: back to stone
      ahs.forEach((h, i) => {
        const t = tSv + 0.55 + i * 0.07;
        tl.to(h, { scale: 0.9, rotation: 0, duration: 0.18, ease: 'power2.in' }, t);
        tl.to(h, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, t + 0.18);
        tl.to(h.querySelector('.g'), { opacity: 0, duration: 0.05 }, t + 0.1);
        tl.to(h.querySelector('.n'), { opacity: 1, duration: 0.05 }, t + 0.1);
      });
      tl.to(tongue, { scaleY: 0, duration: 0.2, ease: 'power2.in' }, B2 + 5.15);
      tl.to([sv2.armL, sv2.armR], { rotation: 0, duration: 0.3, ease: 'power2.inOut' }, B2 + 5.1);
      tl.to(sv2.head, { rotation: 0, duration: 0.3 }, B2 + 5.1);

      /* ================= BEAT 3 — route des vins, Eguisheim ================= */
      let b3 = `<rect width="360" height="640" fill="url(#cm-sky3)"/>`;
      b3 += `<circle cx="74" cy="186" r="70" fill="url(#cm-sun)"/><circle cx="74" cy="186" r="20" fill="#fff4d8"/>`;
      b3 += `<path d="M0 262 Q50 232 105 240 Q170 212 230 222 Q300 204 360 226 V340 H0Z" fill="#c2a9c6"/>`;
      b3 += `<g fill="#a990b6">${[250, 266, 282].map((x, i) => `<rect x="${x}" y="${200 - i}" width="8" height="${16 + i}"/><path d="M${x - 1} ${200 - i}h10v-3h-2v2h-2v-2h-2v2h-2v-2h-2z"/>`).join('')}</g>`;
      b3 += `<path d="M0 290 Q80 252 170 266 Q260 244 360 270 V420 H0Z" fill="#b6c56c"/>`;
      { let d = ''; for (let k = 0; k < 9; k++) d += `M-10 ${300 + k * 11} Q80 ${262 + k * 12} 170 ${276 + k * 11} Q260 ${254 + k * 12} 370 ${280 + k * 11}`; b3 += `<path d="${d}" stroke="#8ea24f" stroke-width="2.4" stroke-dasharray="3 3" fill="none"/>`; }
      b3 += `<path d="M200 330 Q280 300 360 312 V420 H200Z" fill="#a3b85f"/>`;
      { let d = ''; for (let k = 0; k < 5; k++) d += `M200 ${338 + k * 12} Q280 ${308 + k * 12} 370 ${320 + k * 12}`; b3 += `<path d="${d}" stroke="#869c48" stroke-width="2.4" stroke-dasharray="3 3" fill="none"/>`; }
      // far village row
      b3 += house(R, { x: 78, base: 420, w: 40, gh: 0, floors: 2, fh: 30, jetty: 2, wall: '#f3dcb0', roof: '#a9573f', gable: true, rh: 30, flowers: false, ww: 8, finial: false });
      b3 += house(R, { x: 240, base: 420, w: 44, gh: 0, floors: 2, fh: 30, jetty: 2, wall: '#f1c2b8', roof: '#9c4a36', rh: 22, flowers: false, ww: 8, dormer: false });
      // lanes
      b3 += `<rect y="440" width="360" height="200" fill="#d9c8ad"/>`;
      b3 += `<path d="M96 452 L152 452 L152 478 L80 478Z" fill="#cbb89b"/><path d="M208 452 L264 452 L282 478 L208 478Z" fill="#cbb89b"/>`;
      // mid houses (receding lanes)
      b3 += house(R, { x: 100, base: 452, w: 50, gh: 28, floors: 2, fh: 40, jetty: 3, wall: '#bfd3a6', roof: '#a6513c', rh: 30, shutter: '#8a4a5e', ww: 10, dormer: false, flowers: true });
      b3 += house(R, { x: 212, base: 452, w: 50, gh: 28, floors: 2, fh: 40, jetty: 3, wall: '#ecc4d4', roof: '#9c4a36', rh: 30, shutter: '#5f8f78', ww: 10, dormer: false });
      // big side houses
      b3 += house(R, { x: -16, base: 476, w: 112, gh: 50, floors: 2, fh: 62, jetty: 4, wall: '#f4b6aa', roof: '#a9503a', gable: true, rh: 84, shutter: '#5f8f78', door: 0.66, gwin: 0.3 });
      // chimney with the storks' nest (behind the right house's gable)
      b3 += `<rect x="300" y="196" width="18" height="50" fill="#c49c84"/><rect x="300" y="196" width="5" height="50" fill="#d8b69e"/><rect x="297" y="192" width="24" height="6" rx="1" fill="#8e6b58"/>`;
      b3 += house(R, { x: 264, base: 476, w: 112, gh: 50, floors: 2, fh: 62, jetty: 4, wall: '#a9d0e3', roof: '#b0573e', gable: true, rh: 84, shutter: '#b8505a', door: 0.4, gwin: 0.75, finial: false });
      // the Pigeonnier (narrow house at the fork)
      b3 += house(R, { x: 152, base: 478, w: 56, gh: 48, floors: 2, fh: 58, jetty: 6, wall: '#efc06a', roof: '#a8513a', gable: true, rh: 86, shutter: '#4f7ea8', door: 0.5, flowersAll: true });
      // plaza cobbles + shadows
      b3 += `<rect y="478" width="360" height="162" fill="#dccbb0"/><rect y="476" width="360" height="5" fill="rgba(90,60,40,.16)"/>`;
      b3 += cobbles(R, -10, 486, 370, 640, 110, ['#cfbd9f', '#e6d8c1', '#d3c2a6']);
      // flower pots at the Pigeonnier
      const pot = (x) => `<path d="M${x - 9} 470 h18 l-3 12 h-12z" fill="#c4643e"/><rect x="${x - 10}" y="468" width="20" height="4" rx="1" fill="#d97c50"/><g fill="#4f8a43"><circle cx="${x - 6}" cy="465" r="4"/><circle cx="${x + 5}" cy="464" r="4.4"/><circle cx="${x}" cy="461" r="4"/></g><g fill="#e2384d"><circle cx="${x - 5}" cy="460" r="2.2"/><circle cx="${x + 4}" cy="459" r="2.4"/><circle cx="${x + 1}" cy="456" r="2"/></g>`;
      b3 += pot(144) + pot(216);
      // wrought-iron wine sign with grapes
      let b3a = `<g class="cm-clouds3">${cloud(250, 120, 0.9, 0.55)}${cloud(120, 104, 0.6, 0.45)}</g>`;
      b3a += `<g class="cm-sign"><path d="M100 300 H138 M104 300 Q112 312 124 302" stroke="#2f2a2c" stroke-width="2.4" fill="none"/><path d="M132 300 v6" stroke="#2f2a2c" stroke-width="1.6"/><g transform="translate(132 316)"><path d="M0 -8 Q-2 -12 4 -13" stroke="#5d7a32" stroke-width="1.6" fill="none"/><path d="M1 -9 l7 -3 l-2 5z" fill="#6f9a3e"/>${[[0, -4], [-4, -3], [4, -3], [-2, 1], [2, 1], [0, 5], [-5, 2], [5, 2], [-2, 9], [2, 9], [0, 13]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.9" fill="#7a2a5e"/>`).join('')}<circle cx="-1" cy="-5" r="1" fill="#fff" opacity=".5"/></g></g>`;
      // nest + storks
      b3 += `<g transform="translate(309 190)"><ellipse cx="0" cy="0" rx="25" ry="8" fill="#6e4d30"/><path d="M-24 -2 L22 4 M-20 4 L18 -5 M-14 -6 L24 1 M-25 2 L10 7 M-6 -7 L-22 5" stroke="#8a6440" stroke-width="2" stroke-linecap="round"/><path d="M-18 -4 L-26 -9 M16 -5 L24 -10 M2 -7 L4 -12" stroke="#5a3d24" stroke-width="1.6" stroke-linecap="round"/></g>`;
      // sitting stork (partner)
      b3 += `<g transform="translate(326 184) scale(-1 1)"><ellipse cx="0" cy="0" rx="11" ry="7" fill="#fbfbf7"/><path d="M2 -4 Q12 -4 13 3 L4 4Z" fill="#26262b"/><path d="M-6 -3 Q-9 -12 -6 -18" stroke="#fbfbf7" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="-6" cy="-19" r="3.6" fill="#fbfbf7"/><path d="M-8 -20 L-21 -15 L-8 -17.5Z" fill="#e0482f"/><circle cx="-6.5" cy="-20" r=".9" fill="#222"/></g>`;
      // standing stork that clatters
      b3a += `<g transform="translate(300 186)"><path d="M-2 0 V-14 M3 0 V-14" stroke="#e0482f" stroke-width="2" stroke-linecap="round"/>
          <g class="cm-stork"><ellipse cx="2" cy="-22" rx="14" ry="9.5" fill="#fbfbf7" transform="rotate(-12 2 -22)"/><path d="M-2 -28 Q14 -30 20 -16 Q12 -14 4 -18Z" fill="#26262b"/><path d="M14 -20 L24 -12 L16 -15Z" fill="#26262b"/>
          <g class="cm-neck"><path d="M-6 -26 Q-12 -36 -9 -46" stroke="#fbfbf7" stroke-width="6.5" stroke-linecap="round" fill="none"/><circle cx="-9" cy="-48" r="5" fill="#fbfbf7"/><circle cx="-10.5" cy="-49" r="1.1" fill="#222"/>
            <path d="M-12 -50.5 L-34 -46.4 L-12 -47.6Z" fill="#e0482f"/><g class="cm-beak"><path d="M-12 -47.6 L-33.5 -45.6 L-12 -45.2Z" fill="#c63a24"/></g></g></g></g>`;
      // flying stork crossing the sky
      b3a += `<g transform="translate(400 100)"><g class="cm-fly"><g transform="scale(.9)"><path d="M-22 2 Q-4 -2 14 1 Q4 6 -22 2Z" fill="#fbfbf7"/><path d="M-22 2 L-36 1" stroke="#fbfbf7" stroke-width="3" stroke-linecap="round"/><circle cx="-37" cy="1" r="2.6" fill="#fbfbf7"/><path d="M-39 0 L-50 2 L-39 2.4Z" fill="#e0482f"/><path d="M12 2 L28 4 M12 3 L28 6" stroke="#e0482f" stroke-width="1.4"/>
          <g class="cm-wing"><path d="M-10 0 Q-2 -22 10 -30 Q14 -18 6 0Z" fill="#fbfbf7"/><path d="M3 -18 Q8 -26 10 -30 Q14 -20 10 -12Z" fill="#26262b"/></g></g></g></g>`;
      svgIn(L3, b3);
      svgIn(L3, b3a);
      const stork = L3.querySelector('.cm-stork'), neck = L3.querySelector('.cm-neck'), beak = L3.querySelector('.cm-beak');
      ctx.loop(gsap.fromTo(L3.querySelector('.cm-wing'), { scaleY: 1 }, { scaleY: -0.7, duration: 0.32, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '0 0' }));
      ctx.loop(gsap.fromTo(L3.querySelector('.cm-sign'), { rotation: -3 }, { rotation: 3, duration: 1.8, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '132 302' }));
      ctx.loop(gsap.fromTo(L3.querySelector('.cm-clouds3'), { x: 0 }, { x: 18, duration: 8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));

      const glass = '<g transform="rotate(0)"><ellipse cx="0" cy="10" rx="8" ry="2.4" fill="#5f9c4a"/><rect x="-1.7" y="-20" width="3.4" height="30" rx="1.6" fill="#6aa953"/><rect x="-1" y="-18" width="1" height="26" fill="#a7d78f"/><path d="M-12 -46 Q-13 -22 0 -20 Q13 -22 12 -46Z" fill="rgba(255,255,255,.45)" stroke="rgba(255,255,255,.95)" stroke-width="1.6"/><path d="M-11.2 -36 Q-11 -22 0 -21.5 Q11 -22 11.2 -36Z" fill="url(#cm-wine)"/><ellipse cx="0" cy="-36" rx="11.2" ry="2.2" fill="#fbe9a4"/><path d="M-8 -43 Q-9 -32 -6 -27" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/></g>';
      const sv3 = ctx.char('sven', { outfit: 'casual', h: 165, x: 128, y: 522, parent: L3 });
      const ar3 = ctx.char('artur', { outfit: 'parka', h: 165, x: 236, y: 522, parent: L3, flip: true });
      const gS = sv3.hold('R', glass), gA = ar3.hold('R', glass);
      const clinkSpk = svgIn(L3, `<g class="cm-clink"><circle cx="182" cy="392" r="22" fill="url(#cm-glow)"/>${sparkle(182, 384, 10)}${sparkle(166, 372, 6, '#fff3c4')}${sparkle(200, 370, 7, '#fff3c4')}${sparkle(196, 400, 4.5, '#ffe7a0')}</g>`, 360, 640, 'z-index:7');
      gsap.set(clinkSpk, { opacity: 0 });

      // beat 3 timeline
      ctx.beat(B3);
      slide(L3, L2, B3);
      ctx.backdrop('#f3b98f', '#dccbb0', B3 + 0.3);
      ctx.caption('La route des vins : Eguisheim, ses cigognes, un riesling.', B3 + 0.45, { dur: 4.8 });
      const tUp = B3 + 0.9;
      [[sv3, gS], [ar3, gA]].forEach(([c, g], i) => {
        tl.to(c.armR, { rotation: -116, duration: 0.5, ease: 'back.out(1.6)' }, tUp + i * 0.08);
        tl.to(g, { attr: { transform: 'rotate(116)' }, duration: 0.5, ease: 'back.out(1.6)' }, tUp + i * 0.08);
      });
      tl.to(sv3.el, { x: 7, duration: 0.25, ease: 'power2.in' }, tUp + 0.6);
      tl.to(ar3.el, { x: -7, duration: 0.25, ease: 'power2.in' }, tUp + 0.6);
      tl.to(sv3.el, { x: 0, duration: 0.4, ease: 'power2.out' }, tUp + 0.88);
      tl.to(ar3.el, { x: 0, duration: 0.4, ease: 'power2.out' }, tUp + 0.88);
      ctx.sfx('clink', tUp + 0.84);
      tl.fromTo(clinkSpk, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1.15, duration: 0.25, ease: 'back.out(3)', transformOrigin: '182px 388px' }, tUp + 0.84);
      tl.to(clinkSpk, { opacity: 0, duration: 0.4 }, tUp + 1.3);
      // the stork clatters
      const tSt = B3 + 2.4;
      tl.to(neck, { rotation: 62, duration: 0.3, ease: 'back.out(1.6)', svgOrigin: '-6 -26' }, tSt);
      tl.fromTo(beak, { rotation: 0 }, { rotation: -26, duration: 0.07, yoyo: true, repeat: 11, ease: 'none', svgOrigin: '-12 -46.4' }, tSt + 0.3);
      tl.to(neck, { rotation: 0, duration: 0.35, ease: 'power2.inOut', svgOrigin: '-6 -26' }, tSt + 1.2);
      tl.fromTo(stork, { y: 0 }, { y: -2, duration: 0.07, yoyo: true, repeat: 11, ease: 'none' }, tSt + 0.3);
      [0.3, 0.45, 0.6, 0.75, 0.9].forEach(d => ctx.sfx('tick', tSt + d));
      tl.to(sv3.head, { rotation: 10, duration: 0.35, ease: 'sine.inOut' }, tSt + 0.25);
      tl.to(ar3.head, { rotation: 9, duration: 0.35, ease: 'sine.inOut' }, tSt + 0.35);
      ar3.emote(tSt + 0.45, '♥', 1.2);
      tl.to([sv3.head, ar3.head], { rotation: 0, duration: 0.4, ease: 'sine.inOut' }, tSt + 1.7);
      // high over the nest first (no overlap with the nesting storks), then gliding down past the sun
      tl.fromTo(L3.querySelector('.cm-fly'), { x: 0, y: 0 }, { x: -500, y: 70, duration: 3.9, ease: 'none' }, B3 + 0.2);
      // « santé ! » — glasses come back down, a contented nod
      tl.to([sv3.armR, ar3.armR], { rotation: -48, duration: 0.5, ease: 'power2.inOut' }, B3 + 4.0);
      tl.to([gS, gA], { attr: { transform: 'rotate(48)' }, duration: 0.5, ease: 'power2.inOut' }, B3 + 4.0);
      sv3.nod(B3 + 4.3);

      /* ================= BEAT 4 — dîner étoilé ================= */
      let b4 = `<rect width="360" height="420" fill="url(#cm-wall4)"/>`;
      b4 += `<rect y="98" width="360" height="6" fill="#e2cdb2"/><rect y="104" width="360" height="2" fill="#fff" opacity=".6"/>`;
      // the fresco (Fragonard-like garden, pastel)
      b4 += `<clipPath id="cm-fr"><rect x="22" y="118" width="316" height="258" rx="3"/></clipPath>`;
      b4 += `<g clip-path="url(#cm-fr)"><rect x="22" y="118" width="316" height="258" fill="url(#cm-fsky)"/>`;
      b4 += `${cloud(110, 168, 1.3, 0.75)}${cloud(250, 150, 1, 0.6)}`;
      b4 += `<g fill="#a9c7ad"><circle cx="40" cy="250" r="56"/><circle cx="84" cy="208" r="44"/><circle cx="20" cy="190" r="40"/><circle cx="320" cy="210" r="58"/><circle cx="276" cy="176" r="40"/><circle cx="350" cy="290" r="48"/></g>`;
      b4 += `<g fill="#8fb39a"><circle cx="58" cy="292" r="50"/><circle cx="306" cy="268" r="50"/><circle cx="240" cy="210" r="22"/></g>`;
      b4 += `<g fill="#c8dcbd" opacity=".85"><circle cx="70" cy="196" r="16"/><circle cx="36" cy="232" r="18"/><circle cx="296" cy="168" r="16"/><circle cx="318" cy="226" r="18"/></g>`;
      b4 += `<path d="M22 352 Q120 322 200 338 Q270 326 338 344 V376 H22Z" fill="#9ab98e"/><path d="M22 362 Q150 340 338 360 V376 H22Z" fill="#87a97f"/>`;
      b4 += `<g fill="#f3b7c4"><circle cx="70" cy="346" r="3"/><circle cx="96" cy="340" r="2.6"/><circle cx="268" cy="344" r="3"/><circle cx="300" cy="348" r="2.4"/><circle cx="150" cy="350" r="2.4"/></g>`;
      b4 += `<path d="M338 166 Q280 150 214 156 Q190 158 176 166" stroke="#8a6a52" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      b4 += `<g class="cm-swing"><path d="M206 157 L198 262 M226 156 L230 262" stroke="#8a6a52" stroke-width="1.4"/><rect x="194" y="260" width="40" height="4" rx="2" fill="#8a6a52"/>`
        + `<path d="M200 262 Q214 222 232 262 Q246 280 236 286 Q214 296 192 282 Q186 272 200 262Z" fill="#f2a1b5"/><path d="M198 274 Q214 286 234 276" stroke="#fbd3dc" stroke-width="3" fill="none"/>`
        + `<path d="M210 248 Q214 232 222 248Z" fill="#f2a1b5"/><circle cx="216" cy="230" r="7" fill="#f6d7c0"/><path d="M209 228 Q216 218 223 228 Q216 224 209 228Z" fill="#d8b77a"/><ellipse cx="216" cy="222" rx="11" ry="3" fill="#f1dfa7"/><path d="M220 221 Q230 216 232 224" stroke="#e97f98" stroke-width="2" fill="none"/>`
        + `<path d="M236 282 L252 274" stroke="#f6d7c0" stroke-width="3" stroke-linecap="round"/><path d="M226 286 L240 292" stroke="#f6d7c0" stroke-width="3" stroke-linecap="round"/></g>`;
      b4 += `<path d="M150 214 q-6 -4 -2 -8 q6 0 6 6z" fill="#e97f98" transform="rotate(-30 150 210)"/>`;
      b4 += `<g fill="#efe8de" opacity=".9"><rect x="40" y="300" width="18" height="40"/><circle cx="49" cy="292" r="9"/><path d="M40 300 q9 -8 18 0z"/></g>`;
      b4 += `</g>`;
      b4 += `<rect x="20" y="116" width="320" height="262" rx="4" fill="none" stroke="#d4af64" stroke-width="5"/><rect x="25" y="121" width="310" height="252" rx="2" fill="none" stroke="#f7e3a8" stroke-width="1.2" opacity=".8"/>`;
      // drapes
      b4 += `<path d="M0 0 H22 Q18 200 26 420 H0Z" fill="url(#cm-curtain)"/><path d="M360 0 H338 Q342 200 334 420 H360Z" fill="url(#cm-curtain)"/>`;
      b4 += `<path d="M6 0 Q10 210 4 420 M352 0 Q348 210 354 420" stroke="rgba(255,255,255,.12)" stroke-width="2" fill="none"/>`;
      // wainscot under table level + floor
      b4 += `<rect y="420" width="360" height="220" fill="#3b2329"/><rect y="560" width="360" height="80" fill="#5a2232"/><path d="M0 560 H360" stroke="#c9a24a" stroke-width="2" opacity=".6"/>`;
      svgIn(L4, b4);
      ctx.loop(gsap.fromTo(L4.querySelector('.cm-swing'), { rotation: -12 }, { rotation: 13, duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut', svgOrigin: '216 157' }));

      // the waiter (behind the table, enters later)
      const waiter = svgIn(L4, `<g>
          <path d="M162 282 Q190 266 218 282 L222 400 L158 400Z" fill="#1f1d24"/>
          <path d="M176 278 Q190 272 204 278 L196 322 L190 346 L184 322Z" fill="#fff"/>
          <path d="M176 278 L188 318 L178 296Z M204 278 L192 318 L202 296Z" fill="#34303a"/>
          <path d="M205 286 Q214 284 216 296" stroke="#34303a" stroke-width="2" fill="none"/>
          <g fill="#d6b45a"><circle cx="190" cy="358" r="1.8"/><circle cx="190" cy="372" r="1.8"/><circle cx="190" cy="386" r="1.8"/></g>
          <path d="M181 274 L190 279 L181 284Z M199 274 L190 279 L199 284Z" fill="#1f1d24"/><circle cx="190" cy="279" r="2.4" fill="#1f1d24"/>
          <rect x="184" y="256" width="12" height="16" rx="3" fill="#ecbf9c"/>
          <path d="M216 284 Q232 300 228 330 Q226 340 210 344" stroke="#1f1d24" stroke-width="10" stroke-linecap="round" fill="none"/>
          <path d="M206 338 h24 l-2 26 l-10 -6 l-12 4z" fill="#f4f1ea"/><path d="M210 344 h18" stroke="#ddd6ca" stroke-width="1.4"/>
          <circle cx="190" cy="238" r="20" fill="#f2c7a5"/><circle cx="170.5" cy="240" r="4.6" fill="#e8b590"/><circle cx="209.5" cy="240" r="4.6" fill="#e8b590"/>
          <path d="M170 236 Q170 214 192 214 Q212 215 211 236 Q206 223 192 223 Q182 223 178 228 Q174 230 170 236Z" fill="#2a2228"/><path d="M186 216 Q182 220 182 226" stroke="#45383f" stroke-width="1.4" fill="none"/>
          <g class="cm-wbrow"><path d="M179 231 h7 M194 231 h7" stroke="#2a2228" stroke-width="2" stroke-linecap="round"/></g>
          <circle cx="183" cy="238" r="2.1" fill="#221a1d"/><circle cx="197" cy="238" r="2.1" fill="#221a1d"/>
          <path d="M180 248 Q185 244 190 247 Q195 244 200 248 Q195 251 190 249 Q185 251 180 248Z" fill="#2a2228"/>
          <path d="M185 253 Q190 256 195 253" stroke="#9a5a4a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <circle cx="177" cy="246" r="3.4" fill="#ec9f8a" opacity=".4"/><circle cx="203" cy="246" r="3.4" fill="#ec9f8a" opacity=".4"/>
        </g>`, 360, 640, 'z-index:4');

      const sv4 = ctx.char('sven', { outfit: 'smart', h: 186, x: 76, y: 428, parent: L4 });
      const ar4 = ctx.char('artur', { outfit: 'smart', h: 186, x: 286, y: 428, parent: L4, flip: true });

      // table (in front of the diners)
      let t4 = `<path d="M-10 392 H370 V484 H-10Z" fill="url(#cm-cloth)"/><path d="M-10 392 H370" stroke="#fff" stroke-width="2"/>`;
      t4 += `<path d="M-10 484 H370 V548 Q340 556 300 548 Q260 556 220 548 Q180 556 140 548 Q100 556 60 548 Q20 556 -10 548Z" fill="url(#cm-drape)"/><path d="M-10 484 H370" stroke="#e2d9cd" stroke-width="2"/>`;
      t4 += `<path d="M60 488 V548 M140 488 V548 M220 488 V548 M300 488 V548" stroke="rgba(150,130,110,.12)" stroke-width="6"/>`;
      t4 += `<path d="M-10 548 Q20 556 60 548 Q100 556 140 548 Q180 556 220 548 Q260 556 300 548 Q340 556 370 548 V556 H-10Z" fill="rgba(0,0,0,.18)"/>`;
      // plates
      const plate = (x, y) => `<ellipse cx="${x}" cy="${y + 2}" rx="36" ry="10" fill="rgba(120,100,80,.15)"/><ellipse cx="${x}" cy="${y}" rx="35" ry="10" fill="#fff"/><ellipse cx="${x}" cy="${y}" rx="24" ry="6.4" fill="#f3efe9"/><path d="M${x - 33} ${y + 1} Q${x} ${y + 12} ${x + 33} ${y + 1}" stroke="#c9a24a" stroke-width="1" fill="none" opacity=".6"/>`;
      t4 += plate(70, 438) + plate(290, 438);
      t4 += `<path d="M28 424 v26 M31 424 v8 M25 424 v8 M332 424 v26" stroke="#b9c0c8" stroke-width="2" stroke-linecap="round"/><path d="M110 432 v20 M250 432 v20" stroke="#b9c0c8" stroke-width="2" stroke-linecap="round"/>`;
      // red wine glasses
      const wg = (x) => `<ellipse cx="${x}" cy="452" rx="7" ry="2" fill="#dfe6ea"/><rect x="${x - 1}" y="432" width="2" height="20" fill="#e8eef2"/><path d="M${x - 9} 406 Q${x - 10} 430 ${x} 432 Q${x + 10} 430 ${x + 9} 406Z" fill="rgba(255,255,255,.4)" stroke="rgba(255,255,255,.95)" stroke-width="1.3"/><path d="M${x - 9.2} 418 Q${x - 9} 430 ${x} 431 Q${x + 9} 430 ${x + 9.2} 418Z" fill="#7a1f3d"/><ellipse cx="${x}" cy="418" rx="9.2" ry="1.8" fill="#9b2d50"/>`;
      t4 += wg(122) + wg(240);
      // candles
      const candle = (x) => `<ellipse cx="${x}" cy="452" rx="11" ry="3.4" fill="#c7ccd2"/><path d="M${x - 7} 452 Q${x - 3} 444 ${x - 2.5} 420 H${x + 2.5} Q${x + 3} 444 ${x + 7} 452Z" fill="url(#cm-silver)"/><ellipse cx="${x}" cy="420" rx="6" ry="2" fill="#dfe5ea"/><rect x="${x - 3.6}" y="372" width="7.2" height="48" rx="1.5" fill="#fbf7ee"/><rect x="${x - 3.6}" y="372" width="2.4" height="48" fill="#fff"/><path d="M${x} 372 v-4" stroke="#3a2e2a" stroke-width="1.2"/>`;
      t4 += candle(146) + candle(216);
      // crumbs
      t4 += `<g class="cm-crumbs" fill="#d7b27a">${[[188, 404], [196, 410], [204, 402], [212, 408], [180, 410], [220, 404], [200, 414]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>`;
      // cloche plate + dish
      t4 += `<ellipse cx="180" cy="446" rx="42" ry="9" fill="url(#cm-silver)"/><ellipse cx="180" cy="444" rx="34" ry="6.5" fill="#fff"/><path d="M164 444 q16 -6 32 0" stroke="#a52a3c" stroke-width="2.4" fill="none" stroke-linecap="round"/><g fill="#5f9c4a"><circle cx="174" cy="440" r="2.2"/><circle cx="186" cy="441" r="1.8"/></g><ellipse cx="180" cy="440" rx="6" ry="3.2" fill="#e9c38a"/>`;
      svgIn(L4, t4, 360, 640, 'z-index:6');

      // flames (in front)
      const flames = svgIn(L4, [146, 216].map(x => `<circle cx="${x}" cy="360" r="20" fill="url(#cm-glow)" class="cm-halo"/><path class="cm-flame" d="M${x} 352 Q${x - 4.5} 361 ${x} 367 Q${x + 4.5} 361 ${x} 352Z" fill="#ffb84a"/><path d="M${x} 358 Q${x - 2} 363 ${x} 366 Q${x + 2} 363 ${x} 358Z" fill="#fff3c4"/>`).join(''), 360, 640, 'z-index:7');
      flames.querySelectorAll('.cm-flame').forEach((f, i) => ctx.loop(gsap.fromTo(f, { scaleY: 0.9, skewX: -4 }, { scaleY: 1.15, skewX: 5, duration: 0.18 + i * 0.05, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' })));
      flames.querySelectorAll('.cm-halo').forEach((f, i) => ctx.loop(gsap.fromTo(f, { opacity: 0.7 }, { opacity: 1, duration: 0.3 + i * 0.07, yoyo: true, repeat: -1, ease: 'sine.inOut' })));

      // cloche
      const cloche = svgIn(L4, `<g class="cm-cl"><path d="M144 444 Q144 404 180 402 Q216 404 216 444Z" fill="url(#cm-silver)"/><rect x="141" y="441" width="78" height="5" rx="2.5" fill="#aeb7c0"/><path d="M154 432 Q156 414 172 408" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".9"/><ellipse cx="180" cy="400" rx="7" ry="3.4" fill="#c7ced6"/><circle cx="180" cy="397" r="4" fill="url(#cm-silver)"/></g>`, 360, 640, 'z-index:8');
      // star + sparkles
      const starWrap = svgIn(L4, `<g class="cm-star"><circle class="cm-starglow" cx="0" cy="0" r="62" fill="url(#cm-redglow)"/><g class="cm-rays" stroke="#ffd27a" stroke-width="2.4" stroke-linecap="round" opacity=".9">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M0 -36 V-46" transform="rotate(${a})"/>`).join('')}</g><path d="M0.0 -30.0 L7.6 -10.5 L28.5 -9.3 L12.4 4.0 L17.6 24.3 L0.0 13.0 L-17.6 24.3 L-12.4 4.0 L-28.5 -9.3 L-7.6 -10.5 Z" fill="#ffc94a" stroke="#e0962a" stroke-width="2.5" stroke-linejoin="round"/><path d="M0.0 -30.0 L7.6 -10.5 L28.5 -9.3 L12.4 4.0 L17.6 24.3 L0.0 13.0 L-17.6 24.3 L-12.4 4.0 L-28.5 -9.3 L-7.6 -10.5 Z" fill="none" stroke="#fff3c4" stroke-width="1.2" stroke-linejoin="round" transform="scale(.72)" opacity=".7"/></g>`, 360, 640, 'z-index:9');
      const star = starWrap.querySelector('.cm-star');
      const spk4 = svgIn(L4, `<g class="cm-burst">${[[140, 396, 7], [222, 388, 8], [160, 372, 5], [204, 366, 6], [180, 356, 5], [128, 420, 4], [234, 418, 5]].map(([x, y, s]) => sparkle(x, y, s)).join('')}</g>`, 360, 640, 'z-index:9');
      const burst = spk4;
      gsap.set(star, { x: 180, y: 440, scale: 0.2, opacity: 0, transformOrigin: '50% 50%' });
      gsap.set(burst, { opacity: 0 });

      // the waiter's sweeping arm with the crumb scraper (over the cloth)
      const armSvg = svgIn(L4, `<g class="cm-warm" transform="rotate(-18 170 284)"><path d="M168 286 Q158 326 162 344 Q166 364 170 386" stroke="#1f1d24" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M172 292 Q164 326 167 344 Q171 362 174 384" stroke="#3d3844" stroke-width="2" fill="none" opacity=".9"/><rect x="163" y="381" width="14" height="7" rx="2" fill="#f4f1ea" stroke="#e0d9cd" stroke-width=".8"/><circle cx="170" cy="395" r="6" fill="#f2c7a5"/>
          <g class="cm-scr" transform="rotate(18 170 398)"><path d="M155 399 h30 q3 0 3 3 v5 q0 3 -3 3 h-30 q-3 0 -3 -3 v-5 q0 -3 3 -3Z" fill="url(#cm-silver)" stroke="#9aa5b0" stroke-width=".8"/><path d="M157 401.5 h24" stroke="#fff" stroke-width="1.2" opacity=".8"/></g></g>`, 360, 640, 'z-index:8');
      const warm = armSvg.querySelector('.cm-warm'), scr = armSvg.querySelector('.cm-scr');
      gsap.set([waiter, armSvg], { x: 210 });

      // beat 4 timeline
      ctx.beat(B4);
      slide(L4, L3, B4);
      ctx.backdrop('#f6ebdd', '#5a2232', B4 + 0.3);
      const cap4 = ctx.caption('Le soir : un dîner étoilé<br>chez Julien Binz.<br><span class="cm-punch">Rue des Cigognes. Forcément.</span>', B4 + 0.45, { html: true });
      cap4.classList.add('cm-cap4');
      const punch = cap4.querySelector('.cm-punch');
      gsap.set(punch, { opacity: 0 });
      // cloche lift + star
      const tCl = B4 + 1.0;
      tl.to(cloche, { scaleY: 0.9, scaleX: 1.05, duration: 0.16, ease: 'power2.in', transformOrigin: '180px 446px' }, tCl);
      tl.to(cloche, { y: -86, rotation: -14, scaleY: 1, scaleX: 1, duration: 0.65, ease: 'back.out(1.4)', transformOrigin: '180px 446px' }, tCl + 0.16);
      tl.to(cloche, { opacity: 0, y: -120, duration: 0.4, ease: 'power1.in' }, tCl + 1.0);
      ctx.sfx('magic', tCl + 0.16);
      tl.fromTo(burst, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1.1, duration: 0.35, ease: 'back.out(2)', transformOrigin: '180px 400px' }, tCl + 0.2);
      tl.to(burst, { opacity: 0, scale: 1.3, duration: 0.5, ease: 'power1.in', transformOrigin: '180px 400px' }, tCl + 0.65);
      tl.to(star, { opacity: 1, duration: 0.2 }, tCl + 0.3);
      tl.to(star, { y: 176, scale: 1, rotation: 360, duration: 1.1, ease: 'back.out(1.3)' }, tCl + 0.3);
      tl.fromTo(starWrap.querySelector('.cm-starglow'), { scale: 0.85, opacity: 0.7 }, { scale: 1.15, opacity: 1, duration: 0.55, yoyo: true, repeat: 7, ease: 'sine.inOut', svgOrigin: '0 0' }, tCl + 1.1);
      tl.fromTo(starWrap.querySelector('.cm-rays'), { rotation: 0, opacity: 0 }, { rotation: 92, opacity: 0.9, duration: 4.6, ease: 'none', svgOrigin: '0 0' }, tCl + 0.9);
      tl.to(sv4.head, { rotation: 8, duration: 0.3 }, tCl + 0.4);
      tl.to(ar4.head, { rotation: -8, duration: 0.3 }, tCl + 0.5);
      sv4.emote(tCl + 0.6, '✨', 1.3);
      // waiter + crumb scraper
      const tW = B4 + 2.5;
      tl.to([waiter, armSvg], { x: 0, duration: 0.6, ease: 'power2.out' }, tW);
      tl.to([sv4.head, ar4.head], { rotation: 0, duration: 0.3 }, tW);
      const sweep = (at, to, dur) => {
        tl.to(warm, { attr: { transform: `rotate(${to} 170 284)` }, duration: dur, ease: 'sine.inOut' }, at);
        tl.to(scr, { attr: { transform: `rotate(${-to} 170 398)` }, duration: dur, ease: 'sine.inOut' }, at);
      };
      sweep(tW + 0.65, 16, 0.75);
      ctx.sfx('sweep', tW + 0.7);
      tl.to(L4.querySelector('.cm-crumbs'), { x: -22, duration: 0.6, ease: 'sine.inOut' }, tW + 0.8);
      // « FROTTE ! »
      const tF = B4 + 4.0;
      const frotte = sv4.say(tF, 'FROTTE !', 1.55, { side: 'center' });
      frotte.classList.add('cm-frotte');
      tl.to(sv4.el, { scaleY: 0.94, duration: 0.1, ease: 'power2.in' }, tF - 0.1);
      tl.to(sv4.el, { scaleY: 1, duration: 0.2, ease: 'back.out(3)' }, tF);
      sv4.hop(tF, 16);
      tl.to(sv4.armR, { rotation: -110, duration: 0.18, ease: 'back.out(2)' }, tF);
      tl.to(sv4.armL, { rotation: 60, duration: 0.18, ease: 'back.out(2)' }, tF);
      tl.to(sv4.head, { rotation: 10, duration: 0.18, ease: 'back.out(2)' }, tF);
      tl.to(L4.querySelector('.cm-wbrow'), { y: -4, duration: 0.12 }, tF + 0.1);
      // the waiter obeys: curling-style frantic sweeping
      [[-14, 0.16], [14, 0.16], [-14, 0.16], [14, 0.16], [-12, 0.16], [0, 0.2]].forEach(([a, d], i) => sweep(tF + 0.3 + i * 0.16, a, d));
      ctx.sfx('sweep', tF + 0.3);
      ctx.sfx('sweep', tF + 0.65);
      tl.to(L4.querySelector('.cm-crumbs'), { x: -70, opacity: 0, duration: 0.8, ease: 'power1.in' }, tF + 0.3);
      ar4.nod(tF + 0.3);
      tl.to(ar4.head, { rotation: -12, duration: 0.15 }, tF + 0.9);
      tl.to([sv4.armR, sv4.armL], { rotation: 0, duration: 0.35, ease: 'power2.inOut' }, tF + 1.4);
      tl.to(sv4.head, { rotation: 0, duration: 0.3 }, tF + 1.4);
      tl.to(L4.querySelector('.cm-wbrow'), { y: 0, duration: 0.2 }, tF + 1.4);
      tl.to(ar4.head, { rotation: 0, duration: 0.3 }, tF + 1.5);
      // punchline
      tl.fromTo(punch, { opacity: 0, maxHeight: 0, marginTop: 0 }, { opacity: 1, maxHeight: 26, marginTop: 3, duration: 0.5, ease: 'power2.out' }, B4 + 4.8);
      ctx.sfx('ding', B4 + 4.8);
      tl.set({}, {}, END);
    },
  });
})();
;

/* ===== js/scenes/11-choix.js ===== */
/* Scène 11 — « choix » : le final interactif. Zurich ou Colmar ?
 * La timeline de la scène ne sert qu'à l'intro (~2.6 s). Tout le reste est piloté par les taps,
 * avec des timelines GSAP libres (enregistrées via ctx.loop pour être tuées à la sortie de scène).
 * Captures de test : ?scene=choix&t=3&shot&state=confirm-zurich|ticket-colmar|both|dodge[&st=1.5]
 */
(function () {
  'use strict';

  const KEY = 'sven-pellicule-choix';
  const NB = ' ';
  const DATA = {
    zurich: {
      name: 'Zurich',
      ticket: 'Un week-end à Zurich + un concert à la Tonhalle',
      share: "Artur ! J'ai choisi ZURICH 🎻 : un week-end + un concert à la Tonhalle. Prépare ton agenda !",
      acc: '#1f2a44', acc2: '#ffd88a',
    },
    colmar: {
      name: 'Colmar',
      ticket: 'Un week-end à Colmar + un dîner étoilé',
      share: "Artur ! J'ai choisi COLMAR ⭐ : un week-end + un dîner étoilé. Prépare ton agenda !",
      acc: '#8c2232', acc2: '#ffe9dc',
    },
  };
  const CY = { zurich: 214, colmar: 366 };          // card centres (stage px)
  const CONF_Y = 248;                                // chosen card centre in the confirm state
  const SH_BASE = '0px 10px 24px 0px rgba(8,4,12,0.45), 0px 0px 0px 0px rgba(255,198,110,0)';
  const SH_GLOW = '0px 16px 34px 0px rgba(8,4,12,0.55), 0px 0px 0px 4px rgba(255,198,110,0.95)';
  const CRACK = [[166, 0], [158, 17], [171, 33], [156, 51], [170, 68], [157, 86], [169, 103], [159, 120], [165, 136]];

  /* ---------------- small drawings ---------------- */
  const NOTE8 = (x, y, s, c) => `<g class="cx-nt"><g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="0" rx="4.6" ry="3.4" transform="rotate(-22)"/><rect x="3.2" y="-17" width="1.8" height="17"/><path d="M5 -17 q6 3 6.6 9.6 q-1.8 -4.4 -6.6 -5.6z"/></g></g>`;
  const NOTE16 = (x, y, s, c) => `<g class="cx-nt"><g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="0" rx="4.6" ry="3.4" transform="rotate(-22)"/><ellipse cx="13" cy="-3" rx="4.6" ry="3.4" transform="rotate(-22 13 -3)"/><rect x="3.2" y="-18" width="1.8" height="18"/><rect x="16.2" y="-21" width="1.8" height="18"/><path d="M3.2 -18 L18 -21 L18 -16.6 L3.2 -13.6z"/></g></g>`;
  const ROSETTE = (x, y, r, fill, hole) => `<g transform="translate(${x} ${y})"><g fill="${fill}">${[0, 60, 120].map(a => `<rect x="${-r}" y="${-r * 0.37}" width="${2 * r}" height="${r * 0.74}" rx="${r * 0.37}" transform="rotate(${a})"/>`).join('')}<circle r="${r * 0.58}"/></g><circle r="${r * 0.2}" fill="${hole}"/></g>`;
  const SPARK = (c) => `<svg viewBox="-10 -10 20 20" width="100%" height="100%"><path d="M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10Z" fill="${c}"/></svg>`;
  const MINI_TOWERS = `<svg viewBox="0 0 30 36" width="28" height="34" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M3 35 V15 H11 V35 M19 35 V15 H27 V35 M11 24 L15 20 L19 24"/><path d="M3.6 15 C3.6 9 5.6 6.4 7 6 C8.4 6.4 10.4 9 10.4 15 M19.6 15 C19.6 9 21.6 6.4 23 6 C24.4 6.4 26.4 9 26.4 15 M7 6 V1.5 M23 6 V1.5"/><circle cx="7" cy="20" r="1.6"/><circle cx="23" cy="20" r="1.6"/></g></svg>`;
  const MINI_STAR = `<svg viewBox="-14 -14 28 28" width="28" height="28" aria-hidden="true">${ROSETTE(0, 0, 12.5, 'currentColor', '#fff5ea')}</svg>`;
  const ICON_NOTE = `<svg viewBox="-8 -22 26 28" width="26" height="28" aria-hidden="true"><ellipse cx="0" cy="0" rx="4.6" ry="3.4" transform="rotate(-22)" fill="#1f2a44"/><ellipse cx="13" cy="-3" rx="4.6" ry="3.4" transform="rotate(-22 13 -3)" fill="#1f2a44"/><rect x="3.2" y="-18" width="1.8" height="18" fill="#1f2a44"/><rect x="16.2" y="-21" width="1.8" height="18" fill="#1f2a44"/><path d="M3.2 -18 L18 -21 L18 -16.6 L3.2 -13.6z" fill="#c8962e"/></svg>`;
  const ICON_STAR = `<svg viewBox="-14 -14 28 28" width="26" height="26" aria-hidden="true">${ROSETTE(0, 0, 12.5, '#8c2232', '#fffaf1')}</svg>`;
  const SHARE_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M8.5 11H6.5a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-2"/></svg>`;

  // Confetti shapes
  const CF = {
    note: (c) => `<svg viewBox="0 0 20 26" width="100%" height="100%"><g fill="${c}"><ellipse cx="7" cy="20" rx="6" ry="4.4" transform="rotate(-22 7 20)"/><rect x="11.2" y="2" width="2.4" height="18.5"/><path d="M13.6 2 q6 3 6.2 10 q-1.8 -4.6 -6.2 -5.6z"/></g></svg>`,
    notes: (c) => `<svg viewBox="0 0 28 26" width="100%" height="100%"><g fill="${c}"><ellipse cx="6" cy="21" rx="5.6" ry="4.2" transform="rotate(-22 6 21)"/><ellipse cx="21" cy="18" rx="5.6" ry="4.2" transform="rotate(-22 21 18)"/><rect x="9.6" y="4" width="2.2" height="17"/><rect x="24.6" y="1" width="2.2" height="17"/><path d="M9.6 4 L26.8 1 L26.8 5.6 L9.6 8.6z"/></g></svg>`,
    star: (c) => `<svg viewBox="-12 -12 24 24" width="100%" height="100%"><path d="M0 -11.5 L3.1 -4 L11 -3.6 L4.9 1.6 L6.9 9.4 L0 5.1 L-6.9 9.4 L-4.9 1.6 L-11 -3.6 L-3.1 -4Z" fill="${c}" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
    heart: (c) => `<svg viewBox="0 0 24 22" width="100%" height="100%"><path d="M12 21 C4 14.5 0 10.5 0 6.2 C0 2.7 2.7 0 6.1 0 C8.6 0 10.6 1.4 12 3.5 C13.4 1.4 15.4 0 17.9 0 C21.3 0 24 2.7 24 6.2 C24 10.5 20 14.5 12 21Z" fill="${c}"/></svg>`,
    stork: () => `<svg viewBox="0 0 50 30" width="100%" height="100%"><path d="M3 18.5 L15 16.2" stroke="#e8603c" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="21" cy="16" rx="9" ry="4.4" fill="#fff"/><path d="M13 15 L8.5 13.6 L13.5 17.5Z" fill="#2b2330"/><path d="M27.5 14.6 Q33 11.4 37.4 11.8" stroke="#fff" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="38" cy="11.8" r="2.6" fill="#fff"/><path d="M40.2 11.1 L49 13.2 L40.2 13Z" fill="#e8603c"/><circle cx="38.6" cy="11" r=".7" fill="#2b2330"/><g class="w"><path d="M16 14 Q20 2 31 1 Q26 6.5 26 14Z" fill="#fff"/><path d="M23 4.4 Q27 1.6 31 1 Q28.2 4.2 27 7.6Z" fill="#2b2330"/></g></svg>`,
  };

  /* ---------------- scoped CSS (§ = #stage[data-scene="choix"]) ---------------- */
  const CSS = `
§ .cx { position:absolute; inset:0; overflow:hidden; color:#fff; }
§ :where(.cx) button { font:inherit; color:inherit; background:none; border:0; padding:0; margin:0; cursor:pointer; -webkit-appearance:none; appearance:none; touch-action:manipulation; -webkit-tap-highlight-color:transparent; }
§ .cx-bg { position:absolute; inset:0; overflow:hidden; background:#1e1624; }
§ .cx-mos { position:absolute; inset:0; }
§ .cx-mosaic { position:absolute; left:-74px; top:-56px; width:508px; height:752px; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr 1fr; gap:18px; transform:rotate(-8deg); filter:blur(2.2px) brightness(.68) saturate(.85); }
§ .cx-mosaic i { display:block; background-size:cover; background-position:center; border-radius:3px; box-shadow:0 0 0 7px #ece2d6, 0 10px 20px rgba(0,0,0,.5); }
§ .cx-veil { position:absolute; inset:0; background:
    radial-gradient(130% 75% at 50% 42%, rgba(30,22,36,.58) 0%, rgba(30,22,36,.9) 80%),
    linear-gradient(180deg, rgba(30,22,36,.5) 0%, rgba(30,22,36,.25) 34%, rgba(27,20,32,.6) 100%); }

§ .cx-title { position:absolute; left:0; right:0; top:71px; text-align:center; z-index:10; pointer-events:none; }
§ .cx-title .t1 { display:block; font:700 35px/1 var(--font-hand); color:var(--gold); text-shadow:0 2px 10px rgba(0,0,0,.35); }
§ .cx-title .t2 { display:block; margin-top:1px; font:600 26px/1.15 var(--font-display); color:#fff; text-shadow:0 2px 12px rgba(0,0,0,.4); }
§ .cx-kick { position:absolute; left:16px; right:16px; top:84px; z-index:10; text-align:center; font:500 14px/1.2 var(--font-mono); color:var(--mint); pointer-events:none; }
§ .cx-kick .cur, § .cx-term .cur { display:inline-block; width:7px; height:14px; margin-left:2px; vertical-align:-2px; background:currentColor; animation:cxBlink 1s steps(1) infinite; }
@keyframes cxBlink { 50% { opacity:0; } }

§ .cx-card { position:absolute; left:16px; width:328px; height:136px; border-radius:22px; overflow:hidden; z-index:12; text-align:left; box-shadow:${SH_BASE}; }
§ .cx-card::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background:linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,0) 40%); }
§ .cx-z { top:146px; }
§ .cx-c { top:298px; }
§ .cx-card svg.art { position:absolute; left:0; top:0; width:328px; height:136px; }
§ .cx-card .txt { position:absolute; left:18px; top:17px; width:166px; }
§ .cx-card .txt b { display:block; font:600 29px/1 var(--font-display); letter-spacing:.005em; }
§ .cx-card .txt span { display:block; margin-top:7px; font:500 14px/1.32 var(--font-display); text-wrap:pretty; }
§ .cx-z .txt b { color:#ffd88a; }
§ .cx-z .txt span { color:rgba(241,237,252,.92); }
§ .cx-c .txt b { color:#8c2232; }
§ .cx-c .txt span { color:#5a3944; }

§ .cx-ou { position:absolute; left:154px; top:264px; width:52px; height:52px; z-index:14; pointer-events:none; }
§ .cx-ou span { display:grid; place-items:center; width:100%; height:100%; border-radius:50%; background:radial-gradient(circle at 34% 28%, #fff3cf, #ffc66e 55%, #ee9f40); color:var(--plum); font:700 18px/1 var(--font-display); letter-spacing:.02em; box-shadow:0 0 0 4px #201725, 0 6px 14px rgba(0,0,0,.45); }

§ .cx-both { position:absolute; left:33px; top:450px; width:236px; height:46px; border-radius:23px; z-index:12; border:1.5px dashed rgba(255,198,110,.75); background:rgba(255,198,110,.09); color:#ffe2ad; font:500 15px/1 var(--font-display); }

§ .cx-dock { position:absolute; left:0; right:0; top:548px; height:200px; z-index:16; border-radius:24px 24px 0 0; background:linear-gradient(180deg, #2e2335 0px, #1d1522 56px); box-shadow:inset 0 1px 0 rgba(255,255,255,.08), 0 -10px 24px rgba(0,0,0,.28); }
§ .cx-hands { position:absolute; left:262px; top:540px; width:98px; height:16px; z-index:23; pointer-events:none; }
§ .cx-links { position:absolute; left:8px; right:8px; top:552px; height:44px; z-index:18; display:flex; align-items:center; justify-content:space-between; }
§ .cx-links button { height:44px; padding:0 7px; font:500 13px/1 var(--font-display); color:rgba(255,240,230,.78); white-space:nowrap; }
§ .cx-links i { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,.28); flex:none; }

§ .cx-sheet { position:absolute; left:0; right:0; top:400px; height:260px; z-index:22; background:var(--cream); color:var(--plum); border-radius:28px 28px 0 0; box-shadow:0 -10px 30px rgba(0,0,0,.38); text-align:center; }
§ .cx-sheet .grab { display:block; width:40px; height:5px; border-radius:3px; background:rgba(58,46,63,.16); margin:10px auto 0; }
§ .cx-sheet .q { margin:16px 26px 0; font:600 23px/1.2 var(--font-display); text-wrap:balance; }
§ .cx-sheet .q em { font-style:normal; }
§ .cx-sheet .q em.zurich { color:#1f2a44; }
§ .cx-sheet .q em.colmar { color:#8c2232; }
§ .cx-sheet .row { display:flex; gap:10px; margin:20px 20px 0; }
§ .cx-sheet .yes { flex:1.25; height:54px; border-radius:27px; background:linear-gradient(180deg, #ffd889, #ffb547); color:var(--plum); font:700 20px/1 var(--font-display); box-shadow:0 5px 0 #d58c2a, 0 10px 18px rgba(213,140,42,.3); }
§ .cx-sheet .wait { flex:1; height:54px; border-radius:27px; background:#f0e4ea; color:var(--plum); font:600 17px/1 var(--font-display); box-shadow:0 5px 0 #dacbd3; }

§ .cx-printer { position:absolute; left:20px; top:70px; width:320px; height:34px; z-index:14; pointer-events:none; }
§ .cx-slot { position:absolute; left:24px; top:96px; width:312px; height:300px; overflow:hidden; z-index:13; pointer-events:none; }
§ .cx-ticket { position:absolute; left:12px; top:0; width:288px; filter:drop-shadow(0 10px 12px rgba(0,0,0,.42)); transform-origin:50% 0; }
§ .cx-ticket .paper { background:#fffaf1; color:#2b2330; font-family:var(--font-mono); }
§ .cx-ticket .paper { padding-top:9px; }
§ .cx-ticket .hd { display:flex; justify-content:space-between; align-items:center; height:30px; padding:0 18px; background:var(--acc); font:600 13px/1 var(--font-mono); letter-spacing:.2em; color:var(--acc2); }
§ .cx-ticket .hd .no { letter-spacing:.06em; opacity:.8; font-weight:500; }
§ .cx-ticket .what { padding:11px 18px 0; font:600 16px/1.32 var(--font-mono); color:#241c29; }
§ .cx-ticket .dash { margin:11px 18px 0; border-top:1.5px dashed rgba(43,35,48,.28); }
§ .cx-ticket .pax { padding:10px 18px 0; font:500 14px/1.2 var(--font-mono); color:#241c29; }
§ .cx-ticket .dl { padding:6px 18px 0; font:400 13px/1.38 var(--font-mono); color:#5a4e60; }
§ .cx-ticket .perf { position:relative; margin-top:11px; height:14px; }
§ .cx-ticket .perf::before { content:""; position:absolute; left:14px; right:14px; top:6px; border-top:2px dotted rgba(43,35,48,.3); }
§ .cx-ticket .perf i { position:absolute; top:0; width:14px; height:14px; border-radius:50%; background:#1f1726; }
§ .cx-ticket .perf i:first-child { left:-7px; }
§ .cx-ticket .perf i:last-child { right:-7px; }
§ .cx-ticket .stub { display:flex; align-items:center; justify-content:space-between; padding:5px 18px 6px; }
§ .cx-ticket .stub .ico { display:block; height:28px; }
§ .cx-ticket .zz { display:block; }

§ .cx-line .nw { white-space:nowrap; }
§ .cx-line { position:absolute; left:160px; top:356px; width:190px; z-index:12; font:700 25px/1.05 var(--font-hand); color:#ffe2ad; text-shadow:0 2px 10px rgba(0,0,0,.4); pointer-events:none; }
§ .cx-tb { position:absolute; left:0; top:0; width:0; height:0; z-index:18; }
§ .cx-share { position:absolute; left:16px; top:489px; width:328px; height:52px; border-radius:26px; display:flex; align-items:center; justify-content:center; gap:10px; background:linear-gradient(180deg, #ffd889, #ffb547); color:var(--plum); font:700 17px/1 var(--font-display); box-shadow:0 5px 0 #d58c2a, 0 12px 22px rgba(0,0,0,.3); }
§ .cx-sec { position:absolute; top:553px; width:160px; height:44px; border-radius:22px; background:rgba(255,255,255,.1); box-shadow:inset 0 0 0 1px rgba(255,255,255,.14); color:#fff; font:600 15px/1 var(--font-display); }
§ .cx-change { left:16px; }
§ .cx-replay { left:184px; }

§ .cx-glow { position:absolute; left:0; top:180px; width:360px; height:220px; z-index:13; pointer-events:none; background:radial-gradient(closest-side, rgba(255,236,170,.95), rgba(255,198,110,.4) 55%, rgba(255,198,110,0)); }
§ .cx-merged, § .cx-half { position:absolute; left:16px; top:112px; width:328px; height:136px; border-radius:22px; overflow:hidden; z-index:12; pointer-events:none; }
§ .cx-merged { box-shadow:0 14px 34px rgba(0,0,0,.5), 0 0 0 3px rgba(255,236,170,.5); }
§ .cx-gold { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--plum); background:linear-gradient(135deg, #fff1bd 0%, #ffd06a 42%, #f4a43a 100%); }
§ .cx-gold b { font:700 25px/1 var(--font-display); letter-spacing:.03em; }
§ .cx-gold small { margin-top:9px; font:500 14px/1 var(--font-display); opacity:.78; }
§ .cx-gold .ic { position:absolute; top:50%; margin-top:-17px; height:34px; }
§ .cx-gold .ic.l { left:14px; color:#1f2a44; }
§ .cx-gold .ic.r { right:14px; color:#8c2232; margin-top:-14px; }
§ .cx-gold .shine { position:absolute; top:-40px; left:-120px; width:60px; height:220px; background:linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0)); transform:rotate(20deg); }
§ .cx-half { box-shadow:0 12px 26px rgba(0,0,0,.45); border-radius:22px; }
§ .cx-hl { clip-path:polygon(0 0, ${CRACK.map(p => p[0] + 'px ' + p[1] + 'px').join(', ')}, 0 136px); }
§ .cx-hr { clip-path:polygon(${CRACK.map(p => p[0] + 'px ' + p[1] + 'px').join(', ')}, 328px 136px, 328px 0); }
§ .cx-half .ov { position:absolute; inset:0; opacity:0; }
§ .cx-half .ovz { background:linear-gradient(135deg, #2b3961, #1f2a44); color:#ffd88a; }
§ .cx-half .ovc { background:linear-gradient(180deg, #fff8f0, #fde6da); color:#8c2232; }
§ .cx-half .lab { position:absolute; top:0; bottom:0; width:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
§ .cx-half .ovz .lab { left:4px; }
§ .cx-half .ovc .lab { right:4px; }
§ .cx-half .lab b { font:600 25px/1 var(--font-display); }
§ .cx-crack { position:absolute; left:16px; top:112px; width:328px; height:136px; z-index:13; pointer-events:none; overflow:visible; }
§ .cx-term { position:absolute; left:16px; top:260px; width:328px; z-index:12; padding:8px 12px 10px; border-radius:12px; background:#140d18; box-shadow:inset 0 0 0 1px rgba(255,122,162,.32), 0 10px 22px rgba(0,0,0,.4); font:500 13px/1.45 var(--font-mono); color:#ffd6de; pointer-events:none; }
§ .cx-term .dots { display:flex; gap:5px; margin-bottom:6px; }
§ .cx-term .dots i { width:7px; height:7px; border-radius:50%; background:#ff5f57; }
§ .cx-term .dots i:nth-child(2) { background:#febc2e; }
§ .cx-term .dots i:nth-child(3) { background:#28c840; }
§ .cx-term .ex { color:#ff6f86; font-weight:600; }
§ .cx-bub { position:absolute; left:20px; width:320px; top:362px; z-index:19; padding:10px 14px; border-radius:16px; background:#fff; color:var(--plum); font:600 15px/1.3 var(--font-display); text-align:center; text-wrap:balance; box-shadow:0 8px 18px rgba(0,0,0,.32); transform-origin:152px 100%; pointer-events:none; }
§ .cx-bub::after { content:""; position:absolute; top:100%; left:143px; border:9px solid transparent; border-top-color:#fff; }
§ .cx-bub .nw { white-space:nowrap; }
§ .cx-ok { position:absolute; left:50px; top:552px; width:260px; height:46px; border-radius:23px; z-index:18; background:linear-gradient(180deg, #ffd889, #ffb547); color:var(--plum); font:700 16px/1 var(--font-display); box-shadow:0 4px 0 #d58c2a, 0 10px 18px rgba(0,0,0,.3); }

§ .cx-emo { position:absolute; left:322px; top:446px; min-width:30px; height:30px; padding:0 6px; z-index:24; display:grid; place-items:center; border-radius:15px; background:var(--gold); color:var(--plum); font:700 18px/1 var(--font-display); box-shadow:0 3px 8px rgba(0,0,0,.3); pointer-events:none; }
§ .cx-fx { position:absolute; inset:0; z-index:30; pointer-events:none; overflow:hidden; }
§ .cx-fx > div { position:absolute; left:0; top:0; }
§ .cx-toast { position:absolute; left:0; right:0; margin:0 auto; top:603px; width:max-content; max-width:330px; z-index:40; padding:8px 14px; border-radius:999px; background:rgba(255,250,245,.96); color:var(--plum); font:600 14px/1.2 var(--font-display); box-shadow:0 6px 16px rgba(0,0,0,.35); pointer-events:none; }
`;

  Story.register({
    id: 'choix', order: 11, title: 'Le choix', photos: [], skippable: false, final: true, bar: false,
    bg: '#1e1624', music: 'low', darkUI: false,
    build(ctx) {
      const P = '#stage[data-scene="choix"]';
      const params = new URLSearchParams(location.search);
      const testState = Story.DEV.scene === 'choix' ? params.get('state') : null;
      const R = ctx.rand;
      const tl = ctx.tl;

      ctx.backdrop('#1e1624', '#1d1522');
      ctx.html('<style>' + CSS.split('§').join(P) + '</style>');

      /* ---------- card art ---------- */
      const zStars = [[150, 13, 1], [176, 26, .8], [128, 10, .7], [300, 12, 1.2], [320, 38, .8], [206, 9, .9], [272, 7, .8], [190, 50, .7], [318, 70, .7]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
      const tower = `
        <path d="M222 117 V58 H246 V117Z" fill="#273560"/>
        <path d="M225 58 V42 H243 V58Z" fill="#2c3b69"/>
        <path d="M225 42 C225 31 229.5 26 234 25 C238.5 26 243 31 243 42Z" fill="#34467c"/>
        <path d="M220.5 58 H247.5 M223.5 42 H244.5"/>
        <path d="M222 77 H246 M222 101 H246" stroke-opacity=".5"/>
        <circle cx="234" cy="67.5" r="4.6" fill="#1b2440"/>
        <path d="M234 67.5 V64.2 M234 67.5 L236.4 68.8" stroke-width="1.2"/>
        <path d="M230.5 96 V86.5 a3.5 3.5 0 0 1 7 0 V96Z" fill="#ffc66e" fill-opacity=".3"/>
        <path d="M230.5 113 V108 a3.5 3.5 0 0 1 7 0 V113" stroke-opacity=".55"/>
        <path d="M231 56 V50 a3 3 0 0 1 6 0 V56"/>
        <path d="M232 25 V20.5 H236 V25"/>
        <path d="M234 20.5 V11"/>
        <circle cx="234" cy="16" r="1.4" fill="#f3c977" stroke="none"/>`;
      const zArt = `
<svg class="art" viewBox="0 0 328 136" aria-hidden="true">
  <defs>
    <linearGradient id="cxZbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c3a63"/><stop offset=".55" stop-color="#1f2a44"/><stop offset="1" stop-color="#18203a"/></linearGradient>
    <radialGradient id="cxZglow" cx="255" cy="72" r="92" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc66e" stop-opacity=".3"/><stop offset="1" stop-color="#ffc66e" stop-opacity="0"/></radialGradient>
    <clipPath id="cxZwater"><rect x="0" y="117" width="328" height="19"/></clipPath>
  </defs>
  <rect width="328" height="136" fill="url(#cxZbg)"/>
  <rect width="328" height="136" fill="url(#cxZglow)"/>
  <g fill="#ffe3a3" opacity=".75">${zStars}</g>
  <rect x="0" y="117" width="328" height="19" fill="#131a30"/>
  <g clip-path="url(#cxZwater)"><g transform="translate(0 234) scale(1 -1)" opacity=".2"><use href="#cxGM"/></g></g>
  <g stroke="#ffc66e" stroke-linecap="round" fill="none" stroke-width="1.3" opacity=".55">
    <path d="M198 123 h12 M222 127.5 h20 M256 123 h16 M286 128 h22 M208 132 h9 M266 132.5 h12 M312 122.5 h10"/>
  </g>
  <path d="M188 117 H328" stroke="#ffc66e" stroke-opacity=".55" stroke-width="1.2"/>
  <g id="cxGM" fill="none" stroke="#f3c977" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
    <path d="M200 117 V95 L222 87 V117Z" fill="#1e2a4c" stroke-opacity=".75"/>
    <path d="M288 87 L310 95 V117 H288Z" fill="#1e2a4c" stroke-opacity=".75"/>
    <path d="M206 117 v-9 a3 3 0 0 1 6 0 v9 M296 117 v-9 a3 3 0 0 1 6 0 v9" stroke-opacity=".55"/>
    <path d="M246 117 V72 L255 63.5 L264 72 V117" fill="#223056"/>
    <circle cx="255" cy="76.5" r="2.6"/>
    <path d="M251 98 V86.5 a4 4 0 0 1 8 0 V98Z" fill="#ffc66e" fill-opacity=".34"/>
    <path d="M249.5 117 V108.5 a5.5 5.5 0 0 1 11 0 V117" fill="#131a30"/>
    <g id="cxTw">${tower}</g>
    <use href="#cxTw" x="42"/>
  </g>
  ${NOTE8(196, 40, 1.05, '#ffd88a')}
  ${NOTE16(298, 50, .85, '#ffd88a')}
  ${NOTE8(316, 92, .7, '#f3c977')}
  <rect x="5.5" y="5.5" width="317" height="125" rx="17" fill="none" stroke="#ffc66e" stroke-opacity=".22"/>
</svg>`;

      const TB = '#7b4636';
      const win = (x, y, w, h, shutter, flowers) => {
        let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff4dc" stroke="${TB}" stroke-width="1.1"/>`;
        s += `<path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h * .45} H${x + w}" stroke="${TB}" stroke-width=".7"/>`;
        if (shutter) s += `<rect x="${x - 3.1}" y="${y}" width="2.6" height="${h}" rx=".6" fill="${shutter}"/><rect x="${x + w + .5}" y="${y}" width="2.6" height="${h}" rx=".6" fill="${shutter}"/>`;
        if (flowers) s += `<rect x="${x - 1.5}" y="${y + h}" width="${w + 3}" height="2.4" fill="#8a4b36"/><circle cx="${x}" cy="${y + h - .4}" r="1.5" fill="#e8506a"/><circle cx="${x + w / 2}" cy="${y + h - .9}" r="1.6" fill="#ff8fa8"/><circle cx="${x + w}" cy="${y + h - .4}" r="1.5" fill="#e8506a"/><circle cx="${x + w * .25}" cy="${y + h + .2}" r="1" fill="#5c9e5a"/><circle cx="${x + w * .75}" cy="${y + h + .2}" r="1" fill="#5c9e5a"/>`;
        return s;
      };
      const house = (x, w, top, peak, wall, roof, floors, shutter) => {
        const B = 111, cx = x + w / 2, fh = (B - top) / floors, gp = peak + 6;
        let s = `<path d="M${x - 3} ${top + 2} L${cx} ${peak} L${x + w + 3} ${top + 2}Z" fill="${roof}"/>`;
        s += `<path d="M${cx} ${peak} L${x + w + 3} ${top + 2} L${x + w - 3} ${top + 2}Z" fill="#4a1c12" opacity=".2"/>`;
        s += `<path d="M${x + 2.5} ${top + .5} L${cx} ${gp} L${x + w - 2.5} ${top + .5}Z" fill="${wall}"/>`;
        s += `<rect x="${x}" y="${top}" width="${w}" height="${B - top}" fill="${wall}"/>`;
        s += `<rect x="${x + w - 4}" y="${top}" width="4" height="${B - top}" fill="#3a1d14" opacity=".08"/>`;
        let d = `M${x + 1.2} ${top} V${B} M${x + w - 1.2} ${top} V${B} M${x} ${top + 1} H${x + w}`;
        for (let i = 1; i < floors; i++) d += ` M${x} ${top + fh * i} H${x + w}`;
        for (let i = 0; i < floors - 1; i++) {
          const y0 = top + fh * i, y1 = y0 + fh;
          d += ` M${x + 1.5} ${y1} L${x + w * .27} ${y0 + 1} M${x + w - 1.5} ${y1} L${x + w * .73} ${y0 + 1}`;
        }
        const cyy = top - (top - gp) * .48, half = (w / 2 - 2.5) * .52;
        d += ` M${cx} ${top} V${gp + 3} M${cx - half} ${cyy} H${cx + half}`;
        s += `<path d="${d}" stroke="${TB}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
        for (let i = 0; i < floors - 1; i++) {
          const y0 = top + fh * i, wh = Math.min(10, fh - 6);
          s += win(cx - 3.8, y0 + (fh - wh) / 2, 7.6, wh, shutter, i === floors - 2);
        }
        const gy = B - fh;
        s += `<path d="M${cx - 4.5} ${B} V${gy + 8} a4.5 4.5 0 0 1 9 0 V${B}Z" fill="${TB}"/>`;
        s += `<rect x="${x + 3.5}" y="${gy + 5}" width="5" height="6" fill="#fff4dc" stroke="${TB}" stroke-width=".9"/><rect x="${x + w - 8.5}" y="${gy + 5}" width="5" height="6" fill="#fff4dc" stroke="${TB}" stroke-width=".9"/>`;
        s += `<rect x="${cx - 2.6}" y="${cyy + 1.8}" width="5.2" height="5.4" fill="#fff4dc" stroke="${TB}" stroke-width=".9"/>`;
        return s;
      };
      const H = [
        [186, 34, 72, 46, '#f7bdc9', '#c65d47', 2, '#5f9e7a'],
        [220, 40, 58, 25, '#f8da8f', '#b24f3b', 3, '#4f78a8'],
        [260, 34, 68, 41, '#b2e0cd', '#c65d47', 2, '#c24f5e'],
        [294, 40, 55, 24, '#bed6f2', '#b24f3b', 3, '#5f9e7a'],
      ];
      const reflections = H.map(h => `<rect x="${h[0]}" y="112" width="${h[1]}" height="${13 + (111 - h[2]) * .12}" fill="${h[4]}" opacity=".38"/>`).join('');
      const stork = `<g transform="translate(240 24)">
        <ellipse cx="0" cy="1" rx="8.5" ry="3" fill="#8a5a3c"/>
        <path d="M-7.5 0 l3 2.4 M-3.5 -.6 l2 3 M2 -.6 l-1 3 M6.5 0 l-3 2.4" stroke="#6b4129" stroke-width=".9"/>
        <path d="M-6 -1 Q-7 -8 0 -9 Q5.5 -9 5.5 -5 Q4.5 -1 -6 -1Z" fill="#fff"/>
        <path d="M-6.5 -3.4 L-10 -1.6 L-5.6 -1Z" fill="#2b2330"/>
        <path d="M-4.6 -6.6 Q0 -9.4 4 -7 Q1 -5.6 -4.6 -4.2Z" fill="#2b2330" opacity=".85"/>
        <path d="M3.8 -7 Q5.2 -12.5 4 -16.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <circle cx="4.4" cy="-17" r="2.3" fill="#fff"/>
        <path d="M6.2 -17.6 L12.4 -15.4 L6.2 -16Z" fill="#e8603c"/>
        <circle cx="4.9" cy="-17.6" r=".55" fill="#2b2330"/>
      </g>`;
      const cArt = `
<svg class="art" viewBox="0 0 328 136" aria-hidden="true">
  <defs>
    <linearGradient id="cxCbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8f0"/><stop offset="1" stop-color="#fde4d6"/></linearGradient>
    <linearGradient id="cxCw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d6e4"/><stop offset="1" stop-color="#7fb6cd"/></linearGradient>
    <linearGradient id="cxCfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="cxCfade" maskUnits="userSpaceOnUse" x="0" y="111" width="328" height="25"><rect x="0" y="111" width="328" height="22" fill="url(#cxCfg)"/></mask>
    <radialGradient id="cxCsun" cx="262" cy="44" r="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffd9b8" stop-opacity=".9"/><stop offset="1" stop-color="#ffd9b8" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="328" height="136" fill="url(#cxCbg)"/>
  <rect width="328" height="136" fill="url(#cxCsun)"/>
  <g fill="#fff" opacity=".9"><ellipse cx="206" cy="21" rx="11" ry="3.6"/><ellipse cx="212" cy="18" rx="6" ry="3.6"/><ellipse cx="166" cy="30" rx="9" ry="3"/><ellipse cx="171" cy="27.6" rx="5" ry="3"/></g>
  ${H.map(h => house(...h)).join('')}
  ${stork}
  <rect x="0" y="111" width="328" height="25" fill="url(#cxCw)"/>
  <g mask="url(#cxCfade)">${reflections}</g>
  <rect x="180" y="109.5" width="148" height="2.6" fill="#e3c8b2"/>
  <g stroke="#fff" stroke-linecap="round" stroke-width="1.3" opacity=".75"><path d="M192 118 h10 M214 124 h16 M244 119 h12 M268 126 h18 M300 120 h14 M200 130 h8 M282 132 h10"/></g>
  <g class="cx-star">${ROSETTE(277, 19, 11.5, '#8c2232', '#fff6ee')}</g>
  <path class="cx-tw" d="M297 30 Q298 35 303 36 Q298 37 297 42 Q296 37 291 36 Q296 35 297 30Z" fill="#ffb547"/>
  <rect x="5.5" y="5.5" width="317" height="125" rx="17" fill="none" stroke="#8c2232" stroke-opacity=".16"/>
</svg>`;

      /* ---------- ticket bits ---------- */
      let bars = '', bx = 0;
      while (bx < 132) { const w = [1, 1.4, 2, 3][Math.floor(R() * 4)]; bars += `<rect x="${bx.toFixed(1)}" y="0" width="${w}" height="20" fill="#2b2330"/>`; bx += w + 1 + R() * 2; }
      let zz = 'M0 0 H288';
      for (let x = 288; x > 0; x -= 12) zz += ` L${x - 6} 7 L${x - 12} 0`;
      zz += 'Z';

      const gold = `<div class="cx-gold"><span class="ic l">${MINI_TOWERS}</span><b>ZURICH + COLMAR</b><small>2 week-ends · 1 concert · 1 dîner étoilé</small><span class="ic r">${MINI_STAR}</span><i class="shine"></i></div>`;
      const tiles = ctx.ROLL.map(p => `<i style="background-image:url(${p.src})"></i>`).join('');
      const crackPts = CRACK.map(p => p.join(',')).join(' ');

      const wrap = ctx.html(`<div class="cx">
  <div class="cx-bg"><div class="cx-mos"><div class="cx-mosaic">${tiles}</div></div><div class="cx-veil"></div></div>
  <div class="cx-title"><span class="t1">Alors, Sven…</span><span class="t2">tu choisis quoi${NB}?</span></div>
  <div class="cx-kick"><span></span><i class="cur"></i></div>
  <button type="button" class="cx-card cx-z" aria-label="Zurich : un week-end et un concert du Tonhalle-Orchester">${zArt}<div class="txt"><b>Zurich</b><span>Un week-end + un concert du Tonhalle-Orchester, au choix</span></div></button>
  <button type="button" class="cx-card cx-c" aria-label="Colmar : un week-end et un dîner étoilé">${cArt}<div class="txt"><b>Colmar</b><span>Un week-end + un dîner étoilé (chez Julien${NB}Binz)</span></div></button>
  <div class="cx-ou"><span>OU</span></div>
  <button type="button" class="cx-both">Et si je prends les deux${NB}?</button>
  <div class="cx-glow"></div>
  <div class="cx-merged">${gold}</div>
  <div class="cx-half cx-hl">${gold}<div class="ov ovz"><div class="lab">${MINI_TOWERS}<b>Zurich</b></div></div></div>
  <div class="cx-half cx-hr">${gold}<div class="ov ovc"><div class="lab">${MINI_STAR}<b>Colmar</b></div></div></div>
  <svg class="cx-crack" viewBox="0 0 328 136"><polyline points="${crackPts}" fill="none" stroke="#fffaf0" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/></svg>
  <div class="cx-term"><div class="dots"><i></i><i></i><i></i></div><span class="ex"></span><br><span class="msg"></span><i class="cur"></i></div>
  <div class="cx-printer"><svg viewBox="0 0 320 34" width="320" height="34">
    <defs><linearGradient id="cxPr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55465f"/><stop offset="1" stop-color="#2a2131"/></linearGradient></defs>
    <rect x="0" y="0" width="320" height="32" rx="13" fill="url(#cxPr)"/>
    <rect x="6" y="2" width="308" height="7" rx="3.5" fill="#fff" opacity=".08"/>
    <rect x="14" y="22.5" width="292" height="5.5" rx="2.75" fill="#0b070d"/>
    <rect x="16" y="22.5" width="288" height="1.6" rx=".8" fill="#000" opacity=".6"/>
    <g fill="#1a131e"><circle cx="20" cy="12" r="2"/><circle cx="29" cy="12" r="2"/></g>
    <g fill="none" stroke="#8d7c97" stroke-width="1.4"><rect x="134" y="7" width="52" height="10" rx="2"/></g>
    <g fill="#8d7c97"><rect x="138" y="9.5" width="3" height="5" rx=".8"/><rect x="145" y="9.5" width="3" height="5" rx=".8"/><rect x="152" y="9.5" width="3" height="5" rx=".8"/><rect x="159" y="9.5" width="3" height="5" rx=".8"/><rect x="166" y="9.5" width="3" height="5" rx=".8"/><rect x="173" y="9.5" width="3" height="5" rx=".8"/><rect x="180" y="9.5" width="3" height="5" rx=".8"/></g>
    <circle class="led" cx="299" cy="12" r="3.4" fill="#7fd6c2"/>
    <circle cx="299" cy="12" r="6" fill="#7fd6c2" opacity=".18"/>
  </svg></div>
  <div class="cx-slot"><div class="cx-ticket"><div class="paper">
    <div class="hd"><span>BON POUR</span><span class="no">N° 7</span></div>
    <div class="what"></div>
    <div class="dash"></div>
    <div class="pax">Passager${NB}: <b>Sven</b></div>
    <div class="dl">À organiser avant le 12.10.2027 — sinon${NB}: erreur 410${NB}Gone.</div>
    <div class="perf"><i></i><i></i></div>
    <div class="stub"><svg viewBox="0 0 132 20" width="132" height="20">${bars}</svg><span class="ico"></span></div>
  </div><svg class="zz" viewBox="0 0 288 8" width="288" height="8"><path d="${zz}" fill="#fffaf1"/></svg></div></div>
  <div class="cx-line">Le prochain selfie<br>de la pellicule,<br>c’est <span class="nw">là-bas.</span></div>
  <div class="cx-dock"></div>
  <div class="cx-hands"><svg viewBox="0 0 98 16" width="98" height="16"><g fill="#e9b38f"><rect x="2" y="2.5" width="22" height="12.5" rx="6.2"/><rect x="74" y="2.5" width="22" height="12.5" rx="6.2"/></g><g stroke="#c4876a" stroke-width="1.2" stroke-linecap="round"><path d="M8 4.6 V10 M13 4.2 V10 M18 4.6 V10 M80 4.6 V10 M85 4.2 V10 M90 4.6 V10"/></g></svg></div>
  <div class="cx-links"><button type="button" data-go="zurich">Revoir Zurich</button><i></i><button type="button" data-go="colmar">Revoir Colmar</button><i></i><button type="button" data-go="rewind">Revoir l’histoire</button></div>
  <div class="cx-tb"><button type="button" class="cx-share">${SHARE_ICON}<span>Envoyer mon choix à Artur</span></button><button type="button" class="cx-sec cx-change">Changer d’avis</button><button type="button" class="cx-sec cx-replay">Revoir l’histoire</button></div>
  <div class="cx-bub">Les deux options sont cumulables, bien sûr (paiement non <span class="nw">compris ;) )</span></div>
  <button type="button" class="cx-ok">D’accord, je choisis</button>
  <div class="cx-sheet"><i class="grab"></i><div class="q"></div><div class="row"><button type="button" class="yes">Oui${NB}!</button><button type="button" class="wait">Attends…</button></div></div>
  <div class="cx-emo"></div>
  <div class="cx-fx"></div>
  <div class="cx-toast"></div>
</div>`);
      ctx.interactive(wrap); // the whole finale is UI: taps never navigate

      const $ = (s) => wrap.querySelector(s);
      const el = {
        mos: $('.cx-mos'), title: $('.cx-title'), t1: $('.cx-title .t1'), t2: $('.cx-title .t2'),
        kick: $('.cx-kick'), kickTxt: $('.cx-kick span'),
        z: $('.cx-z'), c: $('.cx-c'), ou: $('.cx-ou'), ouIn: $('.cx-ou span'), both: $('.cx-both'),
        glow: $('.cx-glow'), merged: $('.cx-merged'), shine: $('.cx-merged .shine'), hl: $('.cx-hl'), hr: $('.cx-hr'),
        ovz: $('.cx-hl .ov'), ovc: $('.cx-hr .ov'), crack: $('.cx-crack'), crackLine: $('.cx-crack polyline'),
        term: $('.cx-term'), ex: $('.cx-term .ex'), msg: $('.cx-term .msg'),
        printer: $('.cx-printer'), led: $('.cx-printer .led'), ticket: $('.cx-ticket'), tWhat: $('.cx-ticket .what'), tIco: $('.cx-ticket .ico'),
        line: $('.cx-line'), dock: $('.cx-dock'), hands: $('.cx-hands'), links: $('.cx-links'),
        tb: $('.cx-tb'), share: $('.cx-share'), change: $('.cx-change'), replay: $('.cx-replay'),
        bub: $('.cx-bub'), ok: $('.cx-ok'), sheet: $('.cx-sheet'), q: $('.cx-sheet .q'), yes: $('.cx-sheet .yes'), wait: $('.cx-sheet .wait'),
        emo: $('.cx-emo'), fx: $('.cx-fx'), toast: $('.cx-toast'),
      };

      /* ---------- characters ---------- */
      const peeker = ctx.char('sven', { outfit: 'casual', h: 150, x: 314, y: 620, parent: wrap });
      const bigZ = ctx.char('sven', { outfit: 'smart', h: 180, x: 86, y: 523, parent: wrap });
      const bigC = ctx.char('sven', { outfit: 'casual', h: 180, x: 86, y: 523, parent: wrap });
      const artur = ctx.char('artur', { outfit: 'casual', h: 185, x: 172, y: 621, parent: wrap });
      [peeker, bigZ, bigC, artur].forEach(c => { c.el.style.zIndex = 15; c.el.style.pointerEvents = 'none'; });
      gsap.set(peeker.face, { transformOrigin: '50% 88%' });

      // props: bow tie + conductor's baton (Zurich), gingham napkin + fork (Colmar), closed wallet (Artur)
      bigZ.torso.insertAdjacentHTML('beforeend', `<g>
        <path d="M60 143 L46.5 136 Q43.6 143 46.5 150 Z" fill="#ffc66e"/>
        <path d="M60 143 L73.5 136 Q76.4 143 73.5 150 Z" fill="#ffc66e"/>
        <path d="M60 143 L46.5 136 Q45.2 139 45.3 141.4 Z" fill="#fff" opacity=".45"/>
        <path d="M60 143 L73.5 150 Q75.3 147 75.4 144.6 Z" fill="#c98a2a" opacity=".55"/>
        <rect x="56.3" y="139.3" width="7.4" height="7.4" rx="2.4" fill="#e9a43c"/></g>`);
      bigZ.hold('L', `<g><rect x="-1.2" y="-2" width="2.4" height="44" rx="1.2" fill="#fffaf0"/><rect x="-2.8" y="-7" width="5.6" height="12" rx="2.6" fill="#a8743f"/></g>`);
      bigC.svg.insertAdjacentHTML('afterbegin', `<defs><pattern id="cxGing" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#fff"/><rect width="3.5" height="7" fill="#e0475c" opacity=".5"/><rect width="7" height="3.5" fill="#e0475c" opacity=".5"/></pattern></defs>`);
      bigC.torso.insertAdjacentHTML('beforeend', `<g>
        <path d="M40 128 Q60 134 80 128 L66.5 168 Q60 173 53.5 168 Z" fill="url(#cxGing)"/>
        <path d="M40 128 Q60 134 80 128 L66.5 168 Q60 173 53.5 168 Z" fill="none" stroke="#c23a4f" stroke-width="1.4"/></g>`);
      bigC.hold('L', `<g fill="#dfe3e8"><rect x="-1.7" y="-6" width="3.4" height="28" rx="1.7"/><path d="M-5.4 21 H5.4 V25 Q5.4 28 2.4 28 H-2.4 Q-5.4 28 -5.4 25Z"/><rect x="-5.4" y="26" width="1.7" height="13" rx=".85"/><rect x="-1.9" y="26" width="1.7" height="14" rx=".85"/><rect x="1.6" y="26" width="1.7" height="14" rx=".85"/><rect x="3.7" y="26" width="1.7" height="13" rx=".85"/><rect x="-1" y="-5" width="1" height="26" fill="#fff" opacity=".7"/></g>`);
      artur.hold('R', `<g transform="rotate(118)"><g class="cx-wal"><g transform="translate(0 -17) scale(1.35)">
        <rect x="-15" y="-10.5" width="30" height="21" rx="4.5" fill="#7b4a2b"/>
        <rect x="-12.5" y="-8" width="25" height="16" rx="3" fill="none" stroke="#c7925f" stroke-width="1" stroke-dasharray="2 1.6"/>
        <path d="M-15 -3.6 H7 a3.6 3.6 0 0 1 0 7.2 H-15Z" fill="#5e3720"/>
        <circle cx="7" cy="0" r="2.3" fill="#ffc66e"/>
        <rect x="-15" y="-10.5" width="30" height="5" rx="2.5" fill="#fff" opacity=".1"/></g></g></g>`);
      const wallet = artur.el.querySelector('.cx-wal');

      /* ---------- initial (hidden) states ---------- */
      gsap.set(el.sheet, { y: 280, autoAlpha: 0 });
      gsap.set(el.printer, { y: -70, autoAlpha: 0 });
      gsap.set(el.ticket, { y: -420 });
      gsap.set([el.line, el.tb, el.kick, el.merged, el.hl, el.hr, el.crack, el.term, el.bub, el.ok, el.glow, el.emo, el.toast], { autoAlpha: 0 });
      gsap.set([bigZ.el, bigC.el], { y: 300 });
      gsap.set(artur.el, { y: 220 });
      gsap.set(peeker.el, { y: 175 });
      gsap.set(el.ou, { rotation: -8 });
      gsap.set(wallet, { svgOrigin: '0 0' });
      const crackLen = el.crackLine.getTotalLength ? el.crackLine.getTotalLength() : 160;

      /* ---------- helpers ---------- */
      let state = 'cards', choice = null, busy = false, dodges = 0, stateLoops = [];
      const sfx = (n) => { if (!ctx.still) Sound.play(n); };
      const T = () => ctx.loop(gsap.timeline());
      const free = (t, at) => { busy = true; t.call(() => { busy = false; }, null, at); return t; };
      const hidden = (n) => gsap.getProperty(n, 'opacity') < 0.05;
      const addLoop = (tw) => { if (ctx.still) { tw.kill(); return; } stateLoops.push(ctx.loop(tw)); };
      const killLoops = () => { stateLoops.forEach(l => l.kill()); stateLoops = []; };
      const clearFx = () => { const kids = Array.from(el.fx.children); gsap.killTweensOf(kids); el.fx.innerHTML = ''; };
      const saveChoice = (c) => { if (testState) return; try { localStorage.setItem(KEY, JSON.stringify({ choice: c })); } catch (e) { /* private mode */ } };
      const clearChoice = () => { if (testState) return; try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } };
      const loadChoice = () => {
        try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && DATA[v.choice] ? v.choice : null; } catch (e) { return null; }
      };
      function finishIntro() {
        if (tl.progress() < 1) { ctx.seeking = true; tl.progress(1); ctx.seeking = false; }
      }
      function type(t, node, text, at, cps) {
        const chars = Array.from(text), o = { n: 0 }, dur = chars.length / cps;
        t.fromTo(o, { n: 0 }, { n: chars.length, duration: dur, ease: 'none', onUpdate: () => { node.textContent = chars.slice(0, Math.round(o.n)).join(''); } }, at);
        for (let k = 0; k < chars.length; k += 3) t.call(sfx, ['type'], at + k / cps);
        return at + dur;
      }
      function birthday() {
        if (ctx.still) return;
        let d = 0;
        try { d = Sound.birthday() || 0; } catch (e) { d = 0; }
        if (d) { Sound.music.volume(0.05, 0.4); ctx.timeout(() => Sound.music.volume(0.35, 1.5), (d + 0.4) * 1000); }
      }
      function toast(msg) {
        el.toast.textContent = msg;
        gsap.killTweensOf(el.toast);
        gsap.fromTo(el.toast, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'back.out(2)' });
        gsap.to(el.toast, { autoAlpha: 0, y: 6, duration: 0.3, delay: 3.2 });
      }
      function emote(sym) {
        el.emo.textContent = sym;
        gsap.killTweensOf(el.emo);
        gsap.fromTo(el.emo, { autoAlpha: 0, scale: 0, y: 0 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(3)' });
        gsap.to(el.emo, { autoAlpha: 0, y: -10, duration: 0.25, delay: 0.95 });
      }
      function fillTicket(c) {
        const d = DATA[c];
        el.ticket.style.setProperty('--acc', d.acc);
        el.ticket.style.setProperty('--acc2', d.acc2);
        el.tWhat.textContent = d.ticket;
        el.tIco.innerHTML = c === 'zurich' ? ICON_NOTE : ICON_STAR;
      }

      /* ---------- confetti & sparkles (deterministic: ctx.rand) ---------- */
      function piece(html, size) {
        const n = document.createElement('div');
        n.style.width = size + 'px'; n.style.height = size + 'px';
        n.style.marginLeft = (-size / 2) + 'px'; n.style.marginTop = (-size / 2) + 'px';
        n.innerHTML = html;
        el.fx.appendChild(n);
        return n;
      }
      function confetti(c) {
        const t = gsap.timeline();
        const N = 34;
        for (let i = 0; i < N; i++) {
          let html, size = 15 + R() * 12;
          if (c === 'zurich') {
            const col = ['#ffc66e', '#fff1d6', '#9fc3ff', '#ffd88a', '#ff9fbd'][Math.floor(R() * 5)];
            html = R() < 0.55 ? CF.note(col) : CF.notes(col);
            size += 4;
          } else {
            const p = R();
            if (p < 0.55) html = CF.star(['#ffc66e', '#ffe08a', '#fff1d6', '#ff8fa8'][Math.floor(R() * 4)]);
            else { html = CF.heart(['#ff7aa2', '#e8506a', '#ffb3c7'][Math.floor(R() * 3)]); size -= 2; }
          }
          const n = piece(html, size);
          const side = i % 2 ? 1 : -1;                       // -1: left cannon, 1: right cannon
          const x0 = side < 0 ? 12 + R() * 24 : 348 - R() * 24, y0 = 610 + R() * 30;
          const xp = x0 - side * (50 + R() * 250), yp = 80 + R() * 300;
          const d = R() * 0.3, up = 0.55 + R() * 0.3, fall = 1.8 + R() * 1.3, rot0 = R() * 360;
          gsap.set(n, { x: x0, y: y0, rotation: rot0, scale: 0.5 });
          t.to(n, { y: yp, scale: 1, duration: up, ease: 'power2.out' }, d);
          t.to(n, { x: xp, duration: up + fall, ease: 'power1.out' }, d);
          t.to(n, { y: 700, duration: fall, ease: 'power1.in' }, d + up);
          t.to(n, { rotation: rot0 + (R() * 420 - 210), duration: up + fall, ease: 'none' }, d);
        }
        if (c === 'colmar') {
          [[394, 0.3, 2.1, 1, 72], [456, 0.55, 1.9, -1, 60]].forEach(([y, d0, dur, dir, sz]) => {
            const n = piece(CF.stork(), sz);
            n.style.filter = 'drop-shadow(0 0 1px rgba(43,35,48,.9)) drop-shadow(0 3px 4px rgba(0,0,0,.3))';
            const wing = n.querySelector('.w');
            gsap.set(n, { x: dir > 0 ? -50 : 410, y, scaleX: dir });
            gsap.set(wing, { svgOrigin: '22 14' });
            t.to(n, { x: dir > 0 ? 410 : -50, duration: dur, ease: 'none' }, d0);
            t.to(n, { y: y - 12, duration: dur / 4, ease: 'sine.inOut', yoyo: true, repeat: 3 }, d0);
            t.to(wing, { scaleY: -0.55, duration: 0.22, ease: 'sine.inOut', yoyo: true, repeat: Math.floor(dur / 0.22) }, d0);
          });
        }
        return t;
      }
      function sparkles(t, at, cy, n, spread) {
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + R() * 0.4, d1 = spread * (0.75 + R() * 0.5);
          const s = piece(SPARK(R() < 0.5 ? '#fff6d8' : '#ffc66e'), 12 + R() * 12);
          gsap.set(s, { x: 180, y: cy, scale: 0 });
          t.to(s, { x: 180 + Math.cos(a) * d1 * 1.25, y: cy + Math.sin(a) * d1 * 0.62, scale: 1, rotation: 90, duration: 0.55, ease: 'power3.out' }, at + R() * 0.08);
          t.to(s, { scale: 0, rotation: 180, duration: 0.4, ease: 'power2.in' }, at + 0.55 + R() * 0.35);
        }
      }
      function twinkles(t, at, until) {
        [[34, 116], [330, 128], [300, 244], [52, 240], [184, 104]].forEach(([x, y], i) => {
          const s = piece(SPARK(i % 2 ? '#ffc66e' : '#fffaf0'), 16 + (i % 3) * 4);
          gsap.set(s, { x, y, scale: 0 });
          const t0 = at + i * 0.22;
          if (t0 + 0.7 > until) return;
          t.to(s, { scale: 1, rotation: 45, duration: 0.35, ease: 'back.out(3)', yoyo: true, repeat: Math.max(1, Math.floor((until - t0) / 0.35) - 1 | 1) }, t0);
          t.set(s, { scale: 0 }, until);
        });
      }

      /* ---------- states ---------- */
      function enterCard(t, card, side, at) {
        if (hidden(card)) {
          t.fromTo(card, { x: side * 80, y: 0, scaleX: 1, scaleY: 1, rotation: side * 6, autoAlpha: 0, boxShadow: SH_BASE },
            { x: 0, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.3)' }, at);
        } else {
          t.to(card, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, autoAlpha: 1, boxShadow: SH_BASE, duration: 0.6, ease: 'back.out(1.3)' }, at - 0.2);
        }
      }

      function toCards() {
        killLoops();
        state = 'cards'; dodges = 0;
        const t = T();
        // Sven lets go of the sheet and sinks with it, then peeks up again over the dock
        t.to(el.hands, { autoAlpha: 0, duration: 0.12 }, 0);
        t.to(peeker.el, { y: 175, duration: 0.4, ease: 'power3.in' }, 0);
        t.set(el.hands, { y: 0 }, 0.4);
        t.to(el.sheet, { y: 280, duration: 0.4, ease: 'power3.in' }, 0);
        t.set(el.sheet, { autoAlpha: 0 }, 0.4);
        t.to(el.ticket, { y: -(el.ticket.offsetHeight + 12), rotation: 0, duration: 0.55, ease: 'power2.in' }, 0);
        t.to(el.printer, { y: -70, autoAlpha: 0, duration: 0.4, ease: 'back.in(1.6)' }, 0.45);
        t.to([el.line, el.tb, el.kick, el.term, el.bub, el.ok, el.merged, el.crack], { autoAlpha: 0, duration: 0.25 }, 0);
        t.to(el.hl, { x: -230, rotation: -16, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0);
        t.to(el.hr, { x: 230, rotation: 16, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0);
        t.to([bigZ.el, bigC.el], { y: 300, duration: 0.45, ease: 'power2.in' }, 0);
        t.to(artur.el, { y: 220, duration: 0.45, ease: 'power2.in' }, 0);
        t.set([artur.armR, artur.head], { rotation: 0 }, 0.5);
        t.to(el.dock, { y: 0, duration: 0.5, ease: 'power3.inOut' }, 0.15);
        t.to(el.title, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.3);
        enterCard(t, el.z, -1, 0.35);
        enterCard(t, el.c, 1, 0.5);
        t.fromTo(el.ou, { scale: 0, rotation: -140, autoAlpha: 1 }, { scale: 1, rotation: -8, duration: 0.55, ease: 'back.out(2.4)', immediateRender: false }, 0.8);
        t.to(el.both, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.9);
        t.to(el.links, { autoAlpha: 1, duration: 0.4 }, 0.95);
        t.fromTo(peeker.el, { x: 0, y: 175 }, { x: 0, y: 0, duration: 0.6, ease: 'back.out(1.6)', immediateRender: false }, 0.9);
        t.to(peeker.face, { rotation: 0, x: 0, duration: 0.3 }, 0.9);
        t.fromTo(el.hands, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out', immediateRender: false }, 1.35);
        t.call(sfx, ['whoosh'], 0.35);
        t.call(sfx, ['pop'], 0.85);
        return free(t, 1.3);
      }

      function toConfirm(c) {
        killLoops();
        state = 'confirm'; choice = c;
        const me = c === 'zurich' ? el.z : el.c, other = c === 'zurich' ? el.c : el.z;
        el.q.innerHTML = `<em class="${c}">${DATA[c].name}</em>, c’est ton dernier mot${NB}?`;
        const t = T();
        t.to(other, { x: c === 'zurich' ? 400 : -400, rotation: c === 'zurich' ? 12 : -12, duration: 0.55, ease: 'power2.in' }, 0);
        t.set(other, { autoAlpha: 0 }, 0.55);
        t.to(el.ou, { scale: 0, rotation: 60, duration: 0.3, ease: 'back.in(2)' }, 0);
        t.set(el.ou, { autoAlpha: 0 }, 0.3);
        t.to([el.both, el.links], { autoAlpha: 0, duration: 0.25 }, 0);
        t.to(me, { y: CONF_Y - CY[c], scale: 1.06, rotation: 0, duration: 0.65, ease: 'back.out(1.5)' }, 0.12);
        t.to(me, { boxShadow: SH_GLOW, duration: 0.4 }, 0.45);
        t.fromTo(el.sheet, { y: 280, autoAlpha: 1 }, { y: 0, duration: 0.55, ease: 'power3.out', immediateRender: false }, 0.3);
        // Sven ducks behind the dock, rises behind the sheet, then grabs its top edge
        t.to(el.hands, { autoAlpha: 0, y: 6, duration: 0.14, ease: 'power2.in' }, 0);
        t.to(peeker.el, { y: -148, x: 0, duration: 0.6, ease: 'back.out(1.4)' }, 0.5);
        t.fromTo(el.hands, { autoAlpha: 0, y: -158 }, { autoAlpha: 1, y: -148, duration: 0.22, ease: 'power2.out', immediateRender: false }, 0.98);
        t.to(peeker.face, { rotation: c === 'zurich' ? -11 : -6, x: -3, duration: 0.35, ease: 'back.out(2)' }, 0.95);
        t.call(sfx, ['swoosh'], 0.3);
        return free(t, 0.9);
      }

      function startBigLoops(c) {
        const big = c === 'zurich' ? bigZ : bigC;
        if (c === 'zurich') {
          addLoop(gsap.to(big.armL, { rotation: 112, duration: 0.42, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
          addLoop(gsap.to(big.head, { rotation: 5, duration: 0.84, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        } else {
          addLoop(gsap.to(big.armL, { rotation: 126, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
          addLoop(gsap.to(big.head, { rotation: -5, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        }
      }

      function toTicket(c, celebrate) {
        killLoops();
        state = 'ticket'; choice = c;
        const me = c === 'zurich' ? el.z : el.c, other = c === 'zurich' ? el.c : el.z;
        const big = c === 'zurich' ? bigZ : bigC, otherBig = c === 'zurich' ? bigC : bigZ;
        fillTicket(c);
        clearFx();
        const TH = el.ticket.offsetHeight;
        gsap.set(el.ticket, { y: -TH - 12, rotation: 0 });
        gsap.set(otherBig.el, { y: 300 });
        gsap.set([big.armL, big.head], { rotation: 0 });
        const t = T();
        if (celebrate) {
          t.call(() => { sfx('tada'); birthday(); }, null, 0.02);
          t.call(sfx, ['confetti'], 0.05);
          t.add(confetti(c), 0.05);
        }
        t.to(el.sheet, { y: 280, duration: 0.45, ease: 'power3.in' }, 0);
        t.set(el.sheet, { autoAlpha: 0 }, 0.45);
        t.to([el.title, el.both, el.links, el.ou, el.kick, el.term, el.bub, el.ok, el.merged, el.hl, el.hr, el.crack, el.hands], { autoAlpha: 0, duration: 0.25 }, 0);
        t.to(other, { autoAlpha: 0, duration: 0.25 }, 0);
        t.to(peeker.el, { y: 175, duration: 0.45, ease: 'power2.in' }, 0);
        t.to(artur.el, { y: 220, duration: 0.4, ease: 'power2.in' }, 0);
        t.fromTo(el.printer, { y: -70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.6)', immediateRender: false }, 0.1);
        if (!hidden(me)) {
          t.to(me, { y: 96 - CY[c], scaleX: 0.62, scaleY: 0.16, rotation: 0, boxShadow: SH_BASE, duration: 0.55, ease: 'power3.in' }, 0.35);
          t.to(me, { autoAlpha: 0, duration: 0.12 }, 0.8);
          t.call(sfx, ['swoosh'], 0.4);
        }
        t.to(el.dock, { y: -64, duration: 0.55, ease: 'power3.inOut' }, 0.3);
        const P0 = 0.95, PD = 1.5;
        t.to(el.ticket, { y: 0, duration: PD, ease: 'steps(15)' }, P0);
        t.to(el.led, { opacity: 0.15, duration: 0.1, yoyo: true, repeat: 13, ease: 'none' }, P0);
        for (let k = 0; k < 15; k += 2) t.call(sfx, ['tick'], P0 + k * PD / 15);
        t.fromTo(el.ticket, { rotation: 0 }, { rotation: -1.6, duration: 0.5, ease: 'back.out(3)', immediateRender: false }, P0 + PD);
        t.call(sfx, ['ding'], P0 + PD);
        t.fromTo(big.el, { y: 300 }, { y: 0, duration: 0.65, ease: 'back.out(1.5)', immediateRender: false }, 2.0);
        t.call(sfx, ['pop'], 2.05);
        t.to(big.armL, { rotation: 140, duration: 0.45, ease: 'back.out(2)' }, 2.45);
        t.fromTo(el.line, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: false }, 2.6);
        t.fromTo(el.tb, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, 2.85);
        t.call(() => { if (state === 'ticket') startBigLoops(c); }, null, 2.95);
        return free(t, 3.0);
      }

      function toBoth() {
        killLoops();
        state = 'both';
        clearFx();
        gsap.set(el.merged, { autoAlpha: 0, x: 0, y: 110, scale: 1, rotation: 0 });
        gsap.set(el.shine, { x: 0 });
        gsap.set([el.hl, el.hr], { autoAlpha: 0, x: 0, y: 0, rotation: 0 });
        gsap.set([el.ovz, el.ovc], { opacity: 0 });
        gsap.set(el.crack, { autoAlpha: 0 });
        gsap.set(el.crackLine, { strokeDasharray: crackLen, strokeDashoffset: crackLen });
        gsap.set([el.term, el.bub, el.ok], { autoAlpha: 0 });
        el.ex.textContent = ''; el.msg.textContent = ''; el.kickTxt.textContent = '';
        gsap.set([artur.armR, artur.head, wallet], { rotation: 0 });
        const t = T();
        // the button gives up
        t.to(el.both, { scale: 1.12, duration: 0.12, ease: 'power2.out' }, 0);
        t.to(el.both, { scale: 0.6, autoAlpha: 0, duration: 0.3, ease: 'back.in(2)' }, 0.12);
        t.call(sfx, ['magic'], 0);
        t.to([el.title, el.links, el.hands], { autoAlpha: 0, duration: 0.25 }, 0);
        t.to(peeker.el, { y: 175, duration: 0.45, ease: 'back.in(1.4)' }, 0.05);
        t.set(el.kick, { autoAlpha: 1 }, 0.15);
        type(t, el.kickTxt, '$ git merge zurich colmar', 0.2, 36);
        t.to(el.ou, { scale: 0, rotation: 200, duration: 0.35, ease: 'back.in(2)' }, 0.3);
        t.set(el.ou, { autoAlpha: 0 }, 0.65);
        // cards slide together and merge
        t.to(el.z, { y: 76, duration: 0.6, ease: 'power2.in' }, 0.4);
        t.to(el.c, { y: -76, duration: 0.6, ease: 'power2.in' }, 0.4);
        t.call(sfx, ['whoosh'], 0.45);
        t.set([el.z, el.c], { autoAlpha: 0 }, 1.0);
        t.fromTo(el.glow, { autoAlpha: 1, scale: 0.4 }, { scale: 1.7, autoAlpha: 0, duration: 0.75, ease: 'power2.out', immediateRender: false }, 0.98);
        t.fromTo(el.merged, { autoAlpha: 1, y: 110, scale: 1.2 }, { scale: 1, duration: 0.55, ease: 'back.out(2.2)', immediateRender: false }, 1.0);
        t.call(sfx, ['chime'], 1.0);
        sparkles(t, 1.0, 290, 14, 120);
        t.to(el.merged, { y: 0, duration: 0.55, ease: 'power3.inOut' }, 1.55);
        t.fromTo(el.shine, { x: 0 }, { x: 560, duration: 0.9, ease: 'power2.inOut', immediateRender: false }, 1.7);
        twinkles(t, 2.1, 4.6);
        // Artur pops up with his (closed) wallet
        t.fromTo(artur.el, { y: 220 }, { y: 0, duration: 0.6, ease: 'back.out(1.7)', immediateRender: false }, 1.9);
        t.call(sfx, ['boing'], 1.95);
        t.to(artur.armR, { rotation: -118, duration: 0.45, ease: 'back.out(2)' }, 2.3);
        // the error types under the card
        t.fromTo(el.term, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, immediateRender: false }, 2.45);
        let e = type(t, el.ex, 'MergeConflictException:', 2.6, 40);
        e = type(t, el.msg, 'Artur.wallet.pay() → une seule facture acceptée', e + 0.15, 40);
        t.to(artur.head, { keyframes: [{ rotation: -9 }, { rotation: 9 }, { rotation: -9 }, { rotation: 9 }, { rotation: 0 }], duration: 1.1, ease: 'sine.inOut' }, 3.4);
        t.to(wallet, { keyframes: [{ rotation: 14 }, { rotation: -14 }, { rotation: 14 }, { rotation: 0 }], duration: 0.8, ease: 'sine.inOut' }, 3.5);
        // shake, crack, split back into two
        const C0 = e + 0.25;
        t.to(el.merged, { keyframes: [{ x: -5 }, { x: 5 }, { x: -4 }, { x: 4 }, { x: 0 }], duration: 0.32, ease: 'none' }, C0);
        t.call(sfx, ['oops'], C0);
        t.set(el.merged, { autoAlpha: 0 }, C0 + 0.35);
        t.set([el.hl, el.hr, el.crack], { autoAlpha: 1 }, C0 + 0.35);
        t.to(el.crackLine, { strokeDashoffset: 0, duration: 0.25, ease: 'power1.in' }, C0 + 0.35);
        t.call(sfx, ['thud'], C0 + 0.58);
        t.to(el.hl, { x: -9, rotation: -3.5, duration: 0.55, ease: 'back.out(2.2)' }, C0 + 0.62);
        t.to(el.hr, { x: 9, rotation: 3.5, duration: 0.55, ease: 'back.out(2.2)' }, C0 + 0.62);
        t.to(el.crack, { autoAlpha: 0, duration: 0.2 }, C0 + 0.62);
        t.to([el.ovz, el.ovc], { opacity: 1, duration: 0.16, ease: 'none' }, C0 + 0.6);
        t.call(sfx, ['swoosh'], C0 + 0.62);
        // Artur lowers the wallet, nods, and explains
        t.to(artur.armR, { rotation: -20, duration: 0.4, ease: 'power2.inOut' }, C0 + 1.0);
        t.to(artur.head, { rotation: 7, duration: 0.16, yoyo: true, repeat: 3, ease: 'sine.inOut' }, C0 + 1.15);
        t.fromTo(el.bub, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)', immediateRender: false }, C0 + 1.1);
        t.call(sfx, ['pop'], C0 + 1.1);
        t.fromTo(el.ok, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, C0 + 1.6);
        return free(t, C0 + 1.8);
      }

      function dodge() {
        dodges++;
        const p = dodges === 1 ? { x: -17, y: 48, rotation: -7 } : { x: 34, y: -9, rotation: 6 };
        sfx('boing');
        gsap.to(el.both, Object.assign({ duration: 0.34, ease: 'back.out(2.4)', overwrite: 'auto' }, p));
        gsap.fromTo(el.both, { scaleX: 1.18, scaleY: 0.8 }, { scaleX: 1, scaleY: 1, duration: 0.55, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
        emote(dodges === 1 ? '?' : '!');
        gsap.fromTo(peeker.face, { rotation: dodges === 1 ? -14 : 12 }, { rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      }

      function share() {
        const text = DATA[choice].share;
        const fallback = () => {
          try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* ignore */ }
          toast('Message copié — colle-le à Artur 😉');
          try { location.href = 'sms:&body=' + encodeURIComponent(text); } catch (e) { /* ignore */ }
        };
        if (navigator.share) {
          let p;
          try { p = navigator.share({ text }); } catch (e) { fallback(); return; }
          Promise.resolve(p).then(() => toast('Merci !'), (e) => { if (!e || e.name !== 'AbortError') fallback(); });
        } else {
          fallback();
        }
      }

      /* ---------- input ---------- */
      ctx.on(wrap, 'pointerdown', () => { if (tl.progress() < 1) finishIntro(); }, true);
      const press = (c, on) => {
        if (state !== 'cards' || busy) return;
        const card = c === 'zurich' ? el.z : el.c;
        gsap.to(card, { scale: on ? 0.965 : 1, duration: on ? 0.12 : 0.3, ease: on ? 'power2.out' : 'back.out(3)', overwrite: 'auto' });
        gsap.to(peeker.face, { rotation: on ? (c === 'zurich' ? -17 : -8) : 0, x: on ? -4 : 0, duration: 0.3, ease: 'back.out(2)', overwrite: 'auto' });
        gsap.to(peeker.el, { x: on ? -6 : 0, y: on ? (c === 'zurich' ? -10 : -5) : 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      };
      [['zurich', el.z], ['colmar', el.c]].forEach(([c, node]) => {
        ctx.on(node, 'pointerdown', () => { if (state === 'cards' && !busy) { press(c, true); sfx('tick'); } });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => ctx.on(node, ev, () => press(c, false)));
        ctx.on(node, 'click', () => { if (state === 'cards' && !busy) { sfx('pop'); toConfirm(c); } });
      });
      const bothTap = () => {
        if (state !== 'cards' || busy) return;
        if (dodges < 2) dodge(); else toBoth();
      };
      ctx.on(el.both, 'pointerdown', bothTap);
      ctx.on(el.both, 'click', (e) => { if (e.detail === 0) bothTap(); }); // keyboard
      ctx.on(el.yes, 'click', () => { if (state !== 'confirm' || busy) return; saveChoice(choice); toTicket(choice, true); });
      ctx.on(el.wait, 'click', () => { if (state !== 'confirm' || busy) return; sfx('swoosh'); toCards(); });
      ctx.on(el.share, 'click', () => { if (state === 'ticket') { sfx('pop'); share(); } });
      ctx.on(el.change, 'click', () => { if (state !== 'ticket' || busy) return; clearChoice(); toCards(); });
      ctx.on(el.replay, 'click', () => Story.goto('rewind'));
      ctx.on(el.ok, 'click', () => { if (state !== 'both' || busy) return; toCards(); });
      el.links.querySelectorAll('button').forEach(b => ctx.on(b, 'click', () => Story.goto(b.dataset.go)));

      /* ---------- ambient life ---------- */
      if (!ctx.still) {
        ctx.loop(gsap.to(el.ouIn, { scale: 1.07, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        el.z.querySelectorAll('.cx-nt').forEach((n, i) => ctx.loop(gsap.to(n, { y: -4, rotation: i % 2 ? 6 : -6, svgOrigin: '0 0', duration: 1.1 + i * 0.3, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
        ctx.loop(gsap.to(el.c.querySelector('.cx-star'), { scale: 1.12, svgOrigin: '277 19', duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        ctx.loop(gsap.fromTo(el.c.querySelector('.cx-tw'), { scale: 0.4, opacity: 0.3 }, { scale: 1.1, opacity: 1, svgOrigin: '297 36', duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        ctx.loop(gsap.to(el.led, { opacity: 0.45, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
        peeker.idle(); bigZ.idle(); bigC.idle();
      }

      /* ---------- intro (scene timeline) ---------- */
      const saved = testState ? null : loadChoice();
      tl.fromTo(el.mos, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0);
      if (saved) {
        gsap.set([el.title, el.z, el.c, el.ou, el.both, el.links, el.hands], { autoAlpha: 0 });
        gsap.set(peeker.el, { y: 175 });
        tl.set({}, {}, 1.4);
        toTicket(saved, false);
      } else {
        tl.fromTo(el.t1, { opacity: 0, y: 14, rotation: -4 }, { opacity: 1, y: 0, rotation: 0, duration: 0.55, ease: 'back.out(2)' }, 0.15);
        tl.fromTo(el.t2, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.32);
        tl.fromTo(el.z, { opacity: 0, x: -70, rotation: -5 }, { opacity: 1, x: 0, rotation: 0, duration: 0.75, ease: 'back.out(1.3)' }, 0.55);
        tl.fromTo(el.c, { opacity: 0, x: 70, rotation: 5 }, { opacity: 1, x: 0, rotation: 0, duration: 0.75, ease: 'back.out(1.3)' }, 0.72);
        tl.fromTo(el.ou, { scale: 0, rotation: -140 }, { scale: 1, rotation: -8, duration: 0.6, ease: 'back.out(2.4)' }, 1.15);
        tl.fromTo(el.dock, { y: 100 }, { y: 0, duration: 0.55, ease: 'power3.out' }, 1.2);
        tl.fromTo(el.both, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 1.4);
        tl.fromTo(el.links, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 1.55);
        tl.fromTo(peeker.el, { y: 175 }, { y: 0, duration: 0.7, ease: 'back.out(1.5)' }, 1.65);
        tl.fromTo(el.hands, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 2.2);
        tl.fromTo(peeker.face, { rotation: 0 }, { rotation: -10, duration: 0.22, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 2.25);
        ctx.sfx('whoosh', 0.55);
        ctx.sfx('pop', 1.2);
        ctx.sfx('pop', 1.78);
        tl.set({}, {}, 2.6);
      }

      /* ---------- test states for screenshots (?state=…&st=…) ---------- */
      if (testState) {
        ctx.timeout(() => {
          finishIntro();
          let t = null;
          const m = /^(confirm|ticket)-(zurich|colmar)$/.exec(testState);
          if (m && m[1] === 'confirm') t = toConfirm(m[2]);
          else if (m) { toConfirm(m[2]).progress(1); t = toTicket(m[2], true); }
          else if (testState === 'both') t = toBoth();
          else if (testState === 'dodge') { dodge(); dodge(); }
          if (t && ctx.still) {
            const st = params.get('st');
            if (st != null) { t.seek(parseFloat(st), false); t.pause(); } else t.progress(1);
          }
        }, 0);
      }
    },
  });
})();
;

/* ===== js/gate.js ===== */
/* 404 page before midnight, 200 OK after, then the story */
(function () {
  'use strict';
  // Monday 12 October 2026, 00:00 Swiss time (CEST, UTC+2)
  const TARGET = new Date('2026-10-12T00:00:00+02:00').getTime();
  const params = new URLSearchParams(location.search);
  let target = TARGET;
  if (params.has('dans')) target = Date.now() + parseFloat(params.get('dans')) * 1000; // test: "midnight" in N seconds
  if (params.has('test')) target = Date.now() - 1000;

  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const gate = $('gate');
  const CHOICE_KEY = 'sven-pellicule-choix';

  // Developer shortcut: ?scene=<id>[&t=<sec>] opens the story directly
  if (Story.DEV.scene) {
    Story.preload().then(() => Story.start(Story.DEV.scene));
    const unlock = () => { Sound.init(); Sound.music.start(); removeEventListener('pointerdown', unlock); };
    if (!Story.DEV.still) addEventListener('pointerdown', unlock);
    return;
  }

  Story.preload();

  let opened = false;
  function tick() {
    const left = target - Date.now();
    const s = Math.max(0, Math.ceil(left / 1000));
    $('d').textContent = Math.floor(s / 86400);
    $('h').textContent = pad(Math.floor(s / 3600) % 24);
    $('m').textContent = pad(Math.floor(s / 60) % 60);
    $('s').textContent = pad(s % 60);
    if (left <= 0) { clearInterval(timer); open(); }
  }

  const excuses = [
    'Toujours introuvable. Le calendrier refuse de coopérer.',
    'Nouvelle tentative… raté. Le gâteau est encore au four.',
    'L’erreur persiste. As-tu essayé d’attendre ?',
    'Requête refusée : patience.exe introuvable.',
    'Bien essayé. Un anniversaire ne se rafraîchit pas en avance.',
    'Toujours 404. Les bougies sont en grève jusqu’à lundi.',
  ];
  let e = 0;
  $('reload').addEventListener('click', () => {
    const card = $('card');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    $('toast').textContent = excuses[e++ % excuses.length];
  });
  $('skip').addEventListener('click', () => {
    $('toast').textContent = '403 INTERDIT : sauter l’attente nécessite une machine à remonter le temps.';
  });

  function line(html) {
    const c = $('console');
    const span = document.createElement('span');
    span.className = 'new';
    span.innerHTML = html + '<br>';
    c.appendChild(span);
    return span;
  }

  function open() {
    if (opened) return;
    opened = true;
    const later = (ms, fn) => setTimeout(fn, ms);
    $('console').innerHTML = '<span class="d">// patch applied</span><br>';
    later(300, () => line('<span class="ok">✓</span> <span class="k">Calendar.today()</span> <span class="d">→ it’s the day</span>'));
    later(800, () => line('<span class="ok">✓</span> <span class="k">Friends.singLoudly()</span> <span class="d">→ ready</span>'));
    const cakeLine = later(1300, () => { gate._cake = line('<span class="d">…</span> <span class="k">Cake.lightCandles()</span> <span class="d">→ waiting for Sven</span>'); });
    later(1800, () => line('<span class="ok">status</span>: 200 OK'));
    later(1900, () => {
      gate.classList.add('ok');
      $('codenum').innerHTML = '<span class="flip">200</span>';
      $('codetxt').innerHTML = '<span class="flip">TROUVÉ</span>';
      $('url').textContent = 'https://sven.anniversaire/fete — 200 OK';
    });
    later(2300, () => {
      $('oops').textContent = 'Mise à jour : l’erreur a été résolue.';
      $('reason').innerHTML = 'Anniversaire <b>trouvé</b>.<br>Joyeux anniversaire, <b>Sven</b> !';
      document.title = 'Joyeux anniversaire, Sven !';
    });
    later(2700, () => {
      $('waiting').hidden = true;
      $('ready').hidden = false;
      $('footer').textContent = 'Statut : 200 OK · Serveur : Cœur/1.0';
      let saved = null;
      try { saved = localStorage.getItem(CHOICE_KEY); } catch (err) { /* private mode */ }
      if (saved) $('go-choice').hidden = false;
    });
    return cakeLine;
  }

  function launch(muted, sceneId) {
    Sound.init();
    if (muted) Sound.setMuted(true);
    $('mute').classList.toggle('off', !!muted);
    gate.classList.add('lit');
    Sound.play('magic');
    if (gate._cake) gate._cake.innerHTML = '<span class="ok">✓</span> <span class="k">Cake.lightCandles()</span> <span class="d">→ 🔥</span><br>';
    ['go', 'go-mute', 'go-choice'].forEach(id => { $(id).disabled = true; });
    setTimeout(() => {
      Sound.music.start();
      window.scrollTo(0, 0);
      Story.start(sceneId);
    }, 1500);
  }
  $('go').addEventListener('click', () => launch(false));
  $('go-mute').addEventListener('click', () => launch(true));
  $('go-choice').addEventListener('click', () => launch(false, 'choix'));

  const timer = setInterval(tick, 1000);
  tick();
})();
;
