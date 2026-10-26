// Photos search prototype — no real AI. Queries are matched against the
// hand-written tags in data.js; timing, wording and animation do the rest.

const $ = (s, r = document) => r.querySelector(s);
const clone = (o) => JSON.parse(JSON.stringify(o));
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICON = {
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  mic: '<svg viewBox="0 0 20 24" fill="currentColor"><rect x="6" y="1" width="8" height="14" rx="4"/><path d="M2.5 11a7.5 7.5 0 0 0 15 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 18.5V22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="8" r="3.6"/><path d="M2 19.5c0-3.6 3.1-6 7-6s7 2.4 7 6v.5H2z"/><circle cx="17" cy="9" r="2.8" opacity=".7"/><path d="M15.5 14c3.6-.5 6.5 1.6 6.5 5v1h-4.6c0-2.4-.7-4.4-1.9-6z" opacity=".7"/></svg>',
  peopleLine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 13.5V19h14v-1.2l-4.2-4.6-3.3 3.4-2.3-2.3zM8.5 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
  bookmarkFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 2l1.9 5.6L17.5 9.5l-5.6 1.9L10 17l-1.9-5.6L2.5 9.5l5.6-1.9zM18.5 13l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/></svg>',
  xsmall: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg>',
  zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.5-4.5M10.5 7.5v6M7.5 10.5h6"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  shareIOS: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M8 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 6.5h16M9 6.5V4.5h6v2M6.5 6.5l1 13.5h9l1-13.5M10 10.5v6M14 10.5v6"/></svg>',
  ret: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5v6a3 3 0 0 1-3 3H5"/><path d="m9 10-4 4 4 4"/></svg>',
  msg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1 0-1.96-.13-2.86-.38L5 20.5l1.23-3.35C4.24 15.78 3 13.76 3 11.5 3 7.36 7.03 4 12 4z"/></svg>',
  msgBig: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1 0-1.96-.13-2.86-.38L5 20.5l1.23-3.35C4.24 15.78 3 13.76 3 11.5 3 7.36 7.03 4 12 4z"/></svg>',
  airdrop: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M7.5 16.5a6.4 6.4 0 1 1 9 0"/><path d="M9.3 14.3a3.6 3.6 0 1 1 5.4 0"/><path d="M12 13.5 8.5 20h7z" fill="#fff"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12.5" rx="2.2" fill="#fff" fill-opacity=".15"/><path d="m3.5 7 8.5 6.5L20.5 7"/></svg>',
  albums: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="8" width="15" height="12" rx="2.5"/><path d="M6 5h12a3 3 0 0 1 3 3v9"/></svg>',
  liveAlbum: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5" width="16" height="13" rx="2.5"/><circle cx="18.5" cy="17.5" r="3.5" fill="#000"/><path d="M18.5 15.8v3.4M16.8 17.5h3.4" stroke-linecap="round"/><path d="m3.5 15 4-4 4 4"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3.5 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 17l-5.4 3 1.2-6-4.5-4.2 6.1-.7z"/></svg>',
  glasses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6.5" cy="13" r="3.5"/><circle cx="17.5" cy="13" r="3.5"/><path d="M10 13h4M3 13l1.5-4M21 13l-1.5-4"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 6.5c-2-1.6-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6-.1-8 1.5zM12 6.5V19.5"/></svg>',
};
const STATUS = `<div class="statusbar"><span>9:41</span><svg viewBox="0 0 78 13" fill="#fff"><rect x="0" y="8" width="3.2" height="5" rx="1"/><rect x="5" y="5.5" width="3.2" height="7.5" rx="1"/><rect x="10" y="3" width="3.2" height="10" rx="1"/><rect x="15" y="0.5" width="3.2" height="12.5" rx="1"/><path d="M30.5 4.2a9.5 9.5 0 0 1 13 0l-1.4 1.5a7.5 7.5 0 0 0-10.2 0zM33.2 7a5.6 5.6 0 0 1 7.6 0l-1.4 1.5a3.6 3.6 0 0 0-4.8 0zM37 12.3l-2-2.1a2.9 2.9 0 0 1 4 0z"/><rect x="50.5" y="0.5" width="24" height="12" rx="3.6" fill="none" stroke="#fff" stroke-opacity=".4"/><rect x="52.5" y="2.5" width="20" height="8" rx="2"/><path d="M76 4.5v4a2 2 0 0 0 0-4z" fill-opacity=".4"/></svg></div>`;

// ---------------- orb ----------------
// Siri-style orb: luminous ribbons drawn additively on a canvas, clipped to a
// circle. The glass shell and halo are CSS. One rAF loop drives every orb.
const CAN_FILTER = 'filter' in CanvasRenderingContext2D.prototype;
const RIBBONS = [
  { c: '255,45,85',   off: -0.05, amp: 1.0, fq: 1.25, sp: 1.0,  th: 0.17 },
  { c: '255,149,0',   off: 0.03,  amp: 0.8, fq: 1.7,  sp: -1.3, th: 0.12 },
  { c: '94,92,230',   off: 0.07,  amp: 1.1, fq: 1.05, sp: 0.8,  th: 0.19 },
  { c: '50,173,230',  off: 0.0,   amp: 0.9, fq: 2.05, sp: 1.6,  th: 0.11 },
  { c: '191,90,242',  off: -0.07, amp: 0.7, fq: 1.5,  sp: -0.9, th: 0.15 },
];
const ORB_STATES = {
  idle:      { level: 0.32, speed: 0.55, spin: 0 },
  listening: { level: 0.62, speed: 1.1,  spin: 0.08 },
  speaking:  { level: 0.85, speed: 1.6,  spin: 0.12 },
  thinking:  { level: 0.55, speed: 2.3,  spin: 1.6 },
};
const ORBS = new Set();
class Orb {
  constructor(el, mini) {
    this.el = el; this.mini = mini; el._orb = this;
    this.c = document.createElement('canvas'); el.prepend(this.c);
    const px = Math.round((mini ? 28 : 168) * Math.max(2, devicePixelRatio || 1));
    this.c.width = this.c.height = px;
    this.ctx = this.c.getContext('2d');
    this.level = 0.4; this.kick = 0; this.rot = 0; this.phase = Math.random() * 10; this.last = 0;
    this.setState(mini ? 'idle' : 'listening');
    ORBS.add(this);
  }
  setState(s) { this.state = s; this.cfg = ORB_STATES[s]; }
  pulse(n = 1) { this.kick = Math.min(1.2, this.kick + 0.55 * n); }
  visible() { const s = this.el.closest('.screen,.sheet'); return !s || s.classList.contains('active') || s.classList.contains('on'); }
  draw(t) {
    const dt = this.last ? Math.min(0.05, t - this.last) : 0.016; this.last = t;
    const cfg = this.cfg;
    const noise = this.state === 'listening' ? (Math.sin(t * 6.3) + Math.sin(t * 10.7 + 1)) * 0.07 : 0;
    this.level += (cfg.level + this.kick * 0.45 + noise - this.level) * Math.min(1, dt * 7);
    this.kick *= Math.pow(0.04, dt);
    // Thinking spins the ribbons; otherwise they sway gently around horizontal.
    if (cfg.spin > 0.5) this.rot += cfg.spin * dt;
    else { const sway = Math.sin(t * 0.35) * 0.3; const d = Math.atan2(Math.sin(sway - this.rot), Math.cos(sway - this.rot)); this.rot += d * Math.min(1, dt * 2.5); }
    this.phase += cfg.speed * dt * (1 + this.kick * 0.6);
    if (!this.mini) { const w = this.el.closest('.orb-wrap'); if (w) w.style.setProperty('--lvl', this.level.toFixed(3)); }
    const ctx = this.ctx, W = this.c.width, R = W / 2, L = this.level;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.clearRect(0, 0, W, W);
    ctx.save();
    ctx.beginPath(); ctx.arc(R, R, R, 0, Math.PI * 2); ctx.clip();
    const base = ctx.createRadialGradient(R, R * 1.1, 0, R, R, R);
    base.addColorStop(0, '#120f22'); base.addColorStop(0.6, '#06060b'); base.addColorStop(1, '#000');
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, W);
    ctx.translate(R, R); ctx.rotate(this.rot);
    ctx.globalCompositeOperation = 'lighter';
    const steps = this.mini ? 24 : 64;
    const ribbon = (rb, i, white) => {
      const pts = [];
      for (let k = 0; k <= steps; k++) {
        const u = k / steps, x = -R + u * 2 * R;
        const env = Math.pow(Math.sin(Math.PI * u), 1.6);
        const y = R * (rb.off * 2.3 + rb.amp * L * 0.36 * env * Math.sin(rb.fq * (x / R) * Math.PI + this.phase * rb.sp * 2.2 + i * 1.7));
        const th = R * rb.th * env * (0.5 + L * 1.1);
        pts.push([x, y, th]);
      }
      ctx.beginPath();
      pts.forEach(([x, y, th], k) => (k ? ctx.lineTo(x, y - th) : ctx.moveTo(x, y - th)));
      for (let k = pts.length - 1; k >= 0; k--) { const [x, y, th] = pts[k]; ctx.lineTo(x, y + th); }
      ctx.closePath();
      const g = ctx.createLinearGradient(-R, 0, R, 0);
      const a = white ? 0.7 : 0.72;
      g.addColorStop(0, `rgba(${rb.c},0)`); g.addColorStop(0.3, `rgba(${rb.c},${a * 0.6})`); g.addColorStop(0.5, `rgba(${rb.c},${a})`); g.addColorStop(0.7, `rgba(${rb.c},${a * 0.6})`); g.addColorStop(1, `rgba(${rb.c},0)`);
      ctx.fillStyle = g; ctx.fill();
    };
    const blur = (f) => { if (CAN_FILTER) ctx.filter = `blur(${(R * f).toFixed(1)}px)`; };
    blur(0.05); RIBBONS.forEach((rb, i) => ribbon(rb, i));
    blur(0.02); ribbon({ c: '255,255,255', off: 0.005, amp: 0.85, fq: 1.4, sp: 1.2, th: 0.028 }, 9, true);
    ctx.restore();
  }
}
function mountOrbs(root = document) {
  root.querySelectorAll('.orb:not([data-on]), .mini-orb:not([data-on])').forEach((el) => { el.dataset.on = '1'; new Orb(el, el.classList.contains('mini-orb')); });
}
function setOrb(state) { const el = $('#speaking .orb'); if (el && el._orb) el._orb.setState(state); }
function pulseOrb(n) { const el = $('#speaking .orb'); if (el && el._orb) el._orb.pulse(n); }
(function loop(ts) {
  for (const o of ORBS) { if (!o.el.isConnected) { ORBS.delete(o); continue; } if (o.visible()) o.draw(ts / 1000); }
  requestAnimationFrame(loop);
})(0);

// ---------------- state ----------------
const fresh = () => ({
  aliases: clone(DEFAULT_ALIASES),
  names: Object.fromEntries(Object.entries(PEOPLE).map(([k, v]) => [k, v.name])),
  recents: clone(DEFAULT_RECENTS),
  parsed: null, off: new Set(), saved: false, result: null,
  refine: null, view: null, popup: false, adding: false, addHint: null, selecting: false, sel: new Set(), shKeep: true, shLive: false,
  tagSel: 'maa', aliasOn: {}, cover: null, keep: true, share: false,
});
let S = fresh();

// ---------------- "AI": keyword → tag parser ----------------
function parse(text) {
  const t = ' ' + text.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const has = (w) => t.includes(' ' + w + ' ');
  const people = [], personWord = {}, scenes = [], places = [];
  let unknown = null;
  for (const [id, words] of Object.entries(S.aliases)) {
    const w = words.find(has);
    if (w) { people.push(id); personWord[id] = cap(w); }
  }
  const known = Object.values(S.aliases).flat();
  for (const w of PERSON_WORDS) if (has(w) && !known.includes(w)) { unknown = cap(w === 'ma' ? 'mom' : w); break; }
  for (const [k, words] of Object.entries(SCENES)) if (words.some(has)) scenes.push(k);
  for (const [k, words] of Object.entries(PLACES)) if (words.some(has)) places.push(k);
  if (places.includes('Positano') && !places.includes('Italy')) places.push('Italy');
  const vague = people.length > 0 && !scenes.length && !places.length && VAGUE_WORDS.some(has);
  return { text, people, personWord, unknown, scenes, places, vague };
}

function search(p, off = new Set()) {
  const people = p.people.filter((x) => !off.has('p:' + x));
  const scenes = p.scenes.filter((x) => !off.has('s:' + x));
  const places = p.places.filter((x) => !off.has('l:' + x)).filter((x, i, a) => !(x === 'Italy' && a.includes('Positano')));
  const ok = (ph) => people.every((x) => ph.people.includes(x)) && scenes.every((x) => ph.scenes.includes(x)) && places.every((x) => ph.place === x || ph.country === x);
  let matches = PHOTOS.filter((ph) => !ph.hidden && ok(ph)).sort((a, b) => b.rank - a.rank);
  let exact = true;
  if (!matches.length) {
    exact = false;
    const score = (ph) => people.filter((x) => ph.people.includes(x)).length * 2 + scenes.filter((x) => ph.scenes.includes(x)).length + places.filter((x) => ph.place === x || ph.country === x).length;
    matches = PHOTOS.filter((ph) => !ph.hidden).map((ph) => [score(ph), ph]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0] || b[1].rank - a[1].rank).map(([, ph]) => ph).slice(0, 4);
  }
  const key = [...scenes, ...places, ...people].join('|');
  const count = exact ? (LIBRARY_COUNTS[key] ?? matches.length) : 0;
  return { matches, exact, count, people, scenes, places };
}

function summary(p, r, withPerson = true) {
  if (!r.exact) return `Nothing exact for that. Here’s what’s closest.`;
  const n = r.count;
  const adj = r.scenes.filter((s) => s !== 'friends');
  const what = adj.length ? adj.map((s) => SCENE_LABEL[s].toLowerCase()).join(' ') + ' ' : '';
  const noun = n === 1 ? 'photo' : 'photos';
  const names = withPerson ? r.people.map((id) => p.personWord[id] || S.names[id]) : [];
  if (r.scenes.includes('friends')) names.push('friends');
  const who = names.length ? ' with ' + names.join(' and ') : '';
  const pl = p.places.filter((x) => !S.off.has('l:' + x));
  const where = pl.includes('Italy') ? ' from your last Italy trip' : pl.length ? ' in ' + pl[0] : '';
  if (n === 1) return `Found it — your ${what.trim() || 'photo'}${who}${where} from ${r.matches[0].date.split(' · ')[0]}.`;
  return `Found ${n} ${what}${noun}${who}${where}.`;
}

// ---------------- shell ----------------
const app = $('#app');
app.innerHTML = `
  <section class="screen" id="overview"></section>
  <section class="screen speaking" id="speaking"></section>
  <section class="screen" id="results"></section>
  <div class="scrim-bg" id="scrim"></div>
  <div class="sheet" id="tagSheet"></div>
  <div class="sheet" id="saveSheet"></div>
  <div class="sheet share" id="shareSheet"></div>
  <div class="viewer" id="viewer"></div>
  <div class="menu" id="menu">
    <button data-act="restart">Restart demo <span>↺</span></button>
    <button data-act="forget">Forget who Mom is</button>
  </div>
  <div class="toast" id="toast"></div>
  ${STATUS}`;

let current = null;
function go(id) {
  if (current === id) return;
  const prev = current && $('#' + current);
  if (prev) { prev.classList.remove('active'); prev.classList.add('back'); setTimeout(() => prev.classList.remove('back'), 450); }
  $('#' + id).classList.add('active');
  current = id;
  closeMenu();
}

let toastT;
function toast(html) {
  const t = $('#toast'); t.innerHTML = html; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}

// ---------------- overview ----------------
function renderOverview() {
  const person = (id) => {
    const n = S.names[id];
    return `<button class="person tap ${n ? '' : 'unknown'}" data-person="${id}"><img class="av" src="${PEOPLE[id].avatar}" alt=""><span>${n ? esc(n) : 'Name?'}</span></button>`;
  };
  const tile = (t, kind) => `<button class="tile tap" data-q="${esc(t.q)}"><div class="im"><img src="photos/${t.img}.jpg" alt="">${t.date ? `<span class="date">${t.date}</span>` : ''}</div><span>${t.label}</span></button>`;
  $('#overview').innerHTML = `
    <div class="scroll">
      <div class="topbar"><h1>Search</h1><button class="circle" data-act="restart" aria-label="Close">${ICON.close}</button></div>
      ${S.recents.length ? `
      <div class="section" id="recents">
        <div class="sec-head" style="margin-bottom:6px"><h2>Recents</h2><span class="grow"></span><button class="pill sm blue" data-act="clear">Clear</button></div>
        ${S.recents.map((r) => `<button class="recent tap" data-q="${esc(r.q)}"><span class="ic">${ICON.clock}</span><span class="tx"><div class="q">${esc(r.q)}</div><div class="sub">${r.sub}</div></span><span class="stack">${r.thumbs.map((t) => `<img src="photos/${t}.jpg" alt="">`).join('')}</span></button>`).join('')}
      </div><div class="divider"></div>` : ''}
      <div class="section"><div class="sec-head"><h2>People</h2><span class="count">14</span><span class="grow"></span><span class="circle blue">${ICON.chevron}</span></div>
        <div class="rail">${OVERVIEW.people.map(person).join('')}</div></div>
      <div class="section"><div class="sec-head"><h2>Places &amp; trips</h2><span class="count">26</span><span class="grow"></span><span class="circle blue">${ICON.chevron}</span></div>
        <div class="rail">${OVERVIEW.places.map((t) => tile(t)).join('')}</div></div>
      <div class="section"><div class="sec-head"><h2>Documents</h2><span class="count">43</span><span class="grow"></span><span class="circle blue">${ICON.chevron}</span></div>
        <div class="rail">${OVERVIEW.docs.map((t) => tile(t)).join('')}</div></div>
    </div>
    <div class="dock">
      <form class="searchbar" id="typeForm">${ICON.search}<input id="typeIn" placeholder="Search or describe a moment…" autocomplete="off"><button type="button" class="mic hint" data-act="voice" aria-label="Voice search">${ICON.mic}</button></form>
    </div>`;
}

// ---------------- speaking ----------------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function renderSpeaking() {
  $('#speaking').innerHTML = `
    <div class="edge-glow"></div>
    <div class="top"><button class="circle" data-act="home" aria-label="Back">${ICON.back}</button><button class="circle" aria-label="More">${ICON.more}</button></div>
    <div class="transcript listening" id="transcript">Listening…</div>
    <div class="orb-wrap" id="orbWrap"><div class="orb-halo"></div><div class="orb"><div class="shell"></div><div class="rim"></div></div></div>
    <div class="status-line" id="statusLine"></div>
    <div class="prompts" id="prompts">
      <div class="lbl"><span>Try saying</span>${SR ? `<button data-act="realmic">${ICON.mic} Use my voice</button>` : ''}</div>
      <div class="rail">${PROMPTS.map((p, i) => `<button class="prompt tap" data-prompt="${i}">${esc(p.say)}</button>`).join('')}</div>
    </div>`;
  mountOrbs($('#speaking'));
}
let speakRun = 0;
function openSpeaking() {
  speakRun++;
  renderSpeaking();
  go('speaking');
}
async function speak(text, label, { typed = true } = {}) {
  const run = ++speakRun;
  $('#prompts').classList.add('hide');
  const tr = $('#transcript'); tr.classList.remove('listening');
  if (typed) {
    const words = text.split(' ');
    tr.innerHTML = words.map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
    const els = tr.querySelectorAll('.w');
    setOrb('speaking');
    for (const el of els) { if (run !== speakRun) return; el.classList.add('on'); pulseOrb(0.6 + Math.random() * 0.6); await wait(170 + Math.random() * 90); }
  } else tr.textContent = text;
  await wait(350); if (run !== speakRun) return;
  await think(parse(text), run);
  if (run !== speakRun) return;
  runQuery(text, label);
}
async function think(p, run) {
  setOrb('thinking');
  const sl = $('#statusLine');
  const terms = [...p.people.map((id) => p.personWord[id]), p.unknown, ...p.scenes.map((s) => SCENE_LABEL[s]), ...p.places.filter((x, i, a) => !(x === 'Italy' && a.includes('Positano')))].filter(Boolean);
  const steps = [terms.length ? 'Understood ' + terms.map((x) => '“' + x + '”').join(' · ') : 'Understanding…', p.people.length || p.unknown ? 'Matching faces…' : 'Reading what’s in each photo…', 'Ranking 5,000 photos…'];
  for (const s of steps) { if (run !== speakRun) return; sl.textContent = s; await wait(620); }
}
let rec = null;
function realMic() {
  try {
    rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = true; rec.continuous = false;
    const tr = $('#transcript'); $('#prompts').classList.add('hide');
    tr.classList.add('listening'); tr.textContent = 'Listening… speak now';
    let finalText = '';
    rec.onresult = (e) => { const t = Array.from(e.results).map((r) => r[0].transcript).join(' '); tr.classList.remove('listening'); tr.textContent = t; finalText = t; setOrb('speaking'); pulseOrb(1); };
    rec.onerror = (e) => { toast(`Mic isn’t available here (${e.error}). Pick a prompt instead.`); resetListening(); };
    rec.onend = () => { if (finalText.trim()) speak(finalText.trim(), cap(finalText.trim()), { typed: false }); else resetListening(); };
    rec.start();
  } catch (err) { toast('Mic isn’t available here. Pick a prompt instead.'); resetListening(); }
}
function resetListening() { const tr = $('#transcript'); if (!tr) return; setOrb('listening'); tr.classList.add('listening'); tr.textContent = 'Listening…'; $('#prompts').classList.remove('hide'); }

// ---------------- results ----------------
function runQuery(text, label) {
  S.parsed = parse(text); S.parsed.label = label || cap(text);
  Object.assign(S, { off: new Set(), saved: false, refine: null, view: null, popup: false, adding: false, selecting: false, sel: new Set(), extra: null });
  renderResults();
  go('results');
  const r = S.result;
  if (r && r.matches.length && r.exact && !S.parsed.vague) {
    const q = S.parsed.label;
    S.recents = [{ q, sub: `${r.count} ${r.count === 1 ? 'photo' : 'photos'}`, thumbs: r.matches.slice(0, 2).map((m) => m.id) }, ...S.recents.filter((x) => x.q.toLowerCase() !== q.toLowerCase())].slice(0, 3);
  }
}
function chipsHTML(p) {
  const out = [];
  for (const id of p.people) out.push(`<button class="chip new" data-chip="p:${id}">${ICON.people}${esc(p.personWord[id] || S.names[id])}</button>`);
  for (const s of p.scenes) out.push(`<button class="chip new" data-chip="s:${s}">${ICON.image}${SCENE_LABEL[s]}</button>`);
  for (const l of p.places.filter((x, i, a) => !(x === 'Italy' && a.includes('Positano')))) out.push(`<button class="chip new" data-chip="l:${l}">${ICON.pin}${l}</button>`);
  return out.join('');
}
const ph = (m, i, cls = '') => {
  const sel = S.selecting && S.sel.has(m.id);
  return `<div class="ph ${cls} ${S.selecting ? 'selecting' : ''} ${sel ? 'sel' : ''}" style="animation-delay:${0.08 + i * 0.07}s" data-photo="${m.id}"><img src="${m.src}" alt="">${S.selecting ? `<span class="selmark">${sel ? ICON.check : ''}</span>` : ''}</div>`;
};

// Result of the current query after chip toggles and any refinement.
function computeResult() {
  const p = S.parsed;
  const base = search(p, S.off);
  if (S.refine) {
    const R = REFINES[S.refine], m = R.pick(base);
    return { ...base, matches: m, count: m.length, exact: m.length > 0, refine: R };
  }
  if (S.off.size) {
    const key = [...base.scenes, ...base.places, ...base.people].join('|');
    return { ...base, count: REFINED_COUNTS[key] ?? base.count, refined: true };
  }
  return base;
}
function refinedSummary(p, r) {
  const n = r.count, noun = n === 1 ? 'photo' : 'photos';
  if (r.refine) return `${n} ${r.refine.what}${noun}${r.refine.where}.`;
  const what = r.scenes.filter((s) => s !== 'friends').map((s) => SCENE_LABEL[s].toLowerCase()).join(' ');
  const who = r.people.length ? ' with ' + r.people.map((id) => p.personWord[id] || S.names[id]).join(' and ') : '';
  const where = r.places.includes('Italy') || r.places.includes('Positano') ? ' from your Italy trip' : r.places.length ? ' in ' + r.places[0] : '';
  return `${n} ${what ? what + ' ' : ''}${noun}${who}${where}.`;
}
const personWordFor = (id) => (S.parsed && S.parsed.personWord[id]) || (S.aliases[id] || []).map(cap).find((w) => w !== S.names[id]) || S.names[id];
const secHead = (title, count, act = '') => `<div class="sec-head"><h2>${title}</h2>${count != null ? `<span class="count">${count}</span>` : ''}<span class="grow"></span><button class="pill sm blue" ${act}>See All</button></div>`;

function dockHTML(chipsP) {
  const p = S.parsed;
  const R = S.refine && REFINES[S.refine];
  const refineChip = R ? `<button class="chip refine" data-act="clearRefine">${ICON[R.icon] || ICON.image}${R.chip}</button>` : '';
  if (S.selecting) {
    return `<div class="dock"><div class="seltool"><button class="circle" data-act="shareSel" aria-label="Share">${ICON.shareIOS}</button><span>${S.sel.size} Photo${S.sel.size === 1 ? '' : 's'} Selected</span><button class="circle" data-act="noop" aria-label="Delete">${ICON.trash}</button></div></div>`;
  }
  const chips = `<div class="chips"><div class="rail ${R ? 'wrap' : ''}">${chipsHTML(chipsP)}${refineChip}</div>${S.adding ? `<button class="bookmark" data-act="closeAdd" aria-label="Done">${ICON.close}</button>` : `<button class="bookmark ${S.saved ? 'saved' : ''}" data-act="save" aria-label="Save as album">${S.saved ? ICON.bookmarkFill : ICON.bookmark}</button>`}</div>`;
  if (S.adding) {
    return `<div class="dock adding">
      <div class="suggest">${ADD_SUGGESTIONS.map((k, i) => `<button class="bubble" style="animation-delay:${i * 0.06}s" data-refine="${k}">${REFINES[k].label}</button>`).join('')}</div>
      ${chips}
      <form class="querybar addbar" id="addForm"><span class="plus">${ICON.plus}</span><input id="addIn" placeholder="${esc(S.addHint || 'Add to this Search…')}" autocomplete="off"><button type="button" class="mic" data-act="noop" aria-label="Dictate">${ICON.mic}</button></form>
      ${keyboardHTML()}
    </div>`;
  }
  const tokens = `<span>${esc(p.label)} <button data-act="home" aria-label="Clear search" style="display:inline-grid">${ICON.xsmall}</button></span>${R ? `<span class="t2">${esc(R.chip)} <button data-act="clearRefine" aria-label="Remove refinement" style="display:inline-grid">${ICON.xsmall}</button></span>` : ''}`;
  return `<div class="dock">${chips}
      <div class="querybar" data-act="addSearch"><div class="qtoken">${tokens}</div><button class="xbtn" data-act="home" aria-label="Clear">${ICON.xsmall}</button></div>
    </div>`;
}

function renderResults() {
  const p = S.parsed;
  if (S.view === 'noresults') return renderNoResults();
  if (p.vague) return renderVague();
  const unknown = !!p.unknown;
  const r = computeResult(); S.result = r;
  const best = r.matches[0];
  let shown, body;
  const not = (txt) => `<a data-act="notThese">${txt}</a>`;
  if (unknown && best) {
    shown = [best];
    body = `
      <div class="lumi"><span class="mini-orb"></span><div>${summary(p, r)}<br><span class="sub">I don’t know who ${esc(p.unknown)} is yet.</span> <a data-act="tag">Show me</a></div></div>
      <div class="best" data-photo="${best.id}"><div class="in"><img src="${best.src}" alt=""><div class="scrim"></div>
        <span class="glass-tag tag">${ICON.sparkle} Best Guess</span>
        <div class="cap"><b>${best.place}, ${best.country}</b><span>${best.date}</span></div></div></div>`;
  } else if (r.refine) {
    shown = r.matches.slice(0, 6);
    const one = shown.length === 1;
    body = `
      <div class="lumi"><span class="mini-orb"></span><div>${refinedSummary(p, r)}<br><span class="sub">${r.refine.note}</span> ${not(one ? 'Not this?' : 'Not these?')}</div></div>
      ${one ? `<div class="hero ph" data-photo="${shown[0].id}"><img src="${shown[0].src}" alt=""></div>` : `<div class="row3 wide">${shown.map((m, i) => ph(m, i)).join('')}</div>`}`;
  } else if (r.refined) {
    shown = r.matches.slice(0, 3);
    body = `
      <div class="lumi"><span class="mini-orb"></span><div>${refinedSummary(p, r)}<br>${not('Not these?')}</div></div>
      <div class="row3 wide">${shown.map((m, i) => ph(m, i)).join('')}</div>`;
  } else {
    shown = r.matches.slice(0, 4);
    body = `
      <div class="lumi"><span class="mini-orb"></span><div>${summary(p, r)}${r.exact && r.matches.length > 1 ? ' ' + not('Not these?') : ''}</div></div>
      <div class="grid">${shown.map((m, i) => ph(m, i)).join('')}</div>`;
  }
  // "Same evening" only on the plain answer; refined views jump to the trip.
  let same = [];
  if (best && !r.refine && !r.refined) {
    same = Array.from(new Set([...PHOTOS.filter((x) => x.evening === best.evening && !x.hidden), ...r.matches])).filter((x) => !shown.includes(x)).slice(0, 3);
    if (same.length) {
      const title = same.every((x) => x.evening === best.evening) ? 'Same evening' : 'More like this';
      const count = best.evening === 'positano' ? 11 : Math.max(same.length, r.count - shown.length);
      body += secHead(title, count) + `<div class="row3">${same.map((m, i) => ph(m, i + 3)).join('')}</div>`;
    }
  }
  const italy = (r.places.includes('Italy') || r.places.includes('Positano') || (best && best.country === 'Italy'));
  if (italy) {
    const trip = PHOTOS.filter((x) => x.country === 'Italy' && !x.hidden && !shown.includes(x) && !same.includes(x)).slice(0, 6);
    if (trip.length) body += `<div style="height:22px"></div>` + secHead('Italy · 9 Jul - 8 Aug', 60) + `<div class="row3">${trip.map((m, i) => ph(m, i + 6)).join('')}</div>`;
  }
  const popup = S.popup ? `<div class="pop-dim" data-act="closePop"></div><div class="popmenu" id="popmenu">${POPUP_REFINES.map((k) => `${REFINES[k].divider ? '<div class="sep"></div>' : ''}<button data-refine="${k}">${ICON[REFINES[k].icon]}${REFINES[k].label}</button>`).join('')}</div>` : '';
  $('#results').innerHTML = `
    <div class="scroll">
      <div class="topbar"><h1>Search</h1>${S.selecting ? '' : `<button class="circle" data-act="menu" aria-label="More">${ICON.more}</button>`}<button class="pill" data-act="${S.selecting ? 'cancelSelect' : 'select'}">${S.selecting ? 'Cancel' : 'Select'}</button></div>
      ${body}
    </div>
    ${popup}
    ${S.adding ? '<div class="add-blur" data-act="closeAdd"></div>' : ''}
    ${dockHTML(unknown ? { ...p, people: [] } : p)}`;
  afterResults();
}
function afterResults() {
  for (const k of S.off) { const c = $(`#results [data-chip="${k}"]`); if (c) c.classList.add('off'); }
  mountOrbs($('#results'));
  if (S.popup) {
    const lumi = $('#results .lumi'), menu = $('#popmenu'), dim = $('#results .pop-dim'), sc = $('#results .scroll');
    const top = lumi.offsetTop + lumi.offsetHeight - sc.scrollTop + 4;
    menu.style.top = top + 'px'; dim.style.top = top - 8 + 'px';
  }
  if (S.adding) setTimeout(() => { const i = $('#addIn'); if (i) i.focus({ preventScroll: true }); }, 60);
}
function rerender() {
  const sc = $('#results .scroll'), top = sc ? sc.scrollTop : 0;
  renderResults();
  const sc2 = $('#results .scroll'); if (sc2) sc2.scrollTop = top;
  document.querySelectorAll('#results .chip').forEach((c) => c.classList.remove('new'));
}
function toggleChip(k) {
  S.off.has(k) ? S.off.delete(k) : S.off.add(k);
  S.view = null;
  rerender();
}
async function applyRefine(k) {
  const R = REFINES[k];
  S.popup = false; S.adding = false; S.addHint = null;
  if (R.reset) { S.refine = null; S.view = null; for (const x of [...S.off]) if (x.startsWith('p:')) S.off.delete(x); }
  else if (R.to) { S.view = R.to; S.refine = null; }
  else { S.refine = k; S.view = null; }
  rerender();
  $('#results .scroll').scrollTop = 0;
}

// iOS-style keyboard for "Add to this search". Keys type into the real input.
function keyboardHTML() {
  const row = (keys) => `<div class="krow">${keys.split('').map((c) => `<button class="key" data-key="${c}">${c}</button>`).join('')}</div>`;
  return `<div class="keyboard">
    <div class="kpred"><span>“The”</span><span>the</span><span>to</span></div>
    ${row('qwertyuiop')}${row('asdfghjkl')}
    <div class="krow"><button class="key fn" data-act="noop">⇧</button>${'zxcvbnm'.split('').map((c) => `<button class="key" data-key="${c}">${c}</button>`).join('')}<button class="key fn" data-key="⌫">⌫</button></div>
    <div class="krow"><button class="key fn wide" data-act="noop">ABC</button><button class="key space" data-key=" ">space</button><button class="key ret" data-act="addSubmit">${ICON.ret}</button></div>
    <div class="kfoot"><span>☺</span><span>${ICON.mic}</span></div>
  </div>`;
}
// Free text typed into "Add to this search" → a refinement, or extra terms.
function submitAdd(text) {
  const t = text.toLowerCase().trim();
  if (!t) return;
  const map = [[/clos|zoom|face/, 'closer'], [/family|everyone|all of us/, 'family'], [/two|just us|only us/, 'two'], [/earl|before|evening/, 'earlier'], [/build|town|street|house/, 'buildings'], [/trip|different|another/, 'trip']];
  const hit = map.find(([re]) => re.test(t));
  if (hit) return applyRefine(hit[1]);
  const label = S.parsed.label;
  S.adding = false;
  runQuery(S.parsed.text + ' ' + text, label + ' · ' + cap(text));
}

// Select → share sheet (Figma "share").
function startSelect() {
  const r = S.result; if (!r || !r.matches.length) return;
  S.selecting = true; S.popup = false; S.adding = false;
  const pool = Array.from(new Set([...r.matches.slice(0, 3), ...PHOTOS.filter((x) => x.evening === r.matches[0].evening && !x.hidden)]));
  S.sel = new Set(pool.slice(0, 4).map((x) => x.id));
  rerender();
}
function albumName() {
  const r = S.result, p = S.parsed;
  const who = r && r.people.length ? personWordFor(r.people[0]) : null;
  const place = r && (r.places.includes('Italy') || r.places.includes('Positano')) ? 'Italy' : r && r.places[0];
  const what = r && r.scenes[0] ? SCENE_LABEL[r.scenes[0]] + 's' : 'Photos';
  return [who ? who + ' &' : null, place, what].filter(Boolean).join(' ').replace('&amp;', '&');
}
function openShare() {
  if (!S.sel.size) { toast('Select a photo first'); return; }
  S.shKeep = true; S.shLive = false;
  renderShare(); openSheet('shareSheet');
}
function renderShare() {
  const ids = [...S.sel], first = PHOTOS.find((x) => x.id === ids[0]);
  const app = (name, cls, glyph) => `<button class="sh-app" data-app="${name}"><span class="ai ${cls}">${glyph}</span><span>${name}</span></button>`;
  const act = (ic, t) => `<button class="act" data-act="shAct" data-t="${esc(t)}"><span class="ci">${ICON[ic]}</span><span>${t}</span></button>`;
  $('#shareSheet').innerHTML = `
    <div class="sh-head">
      <div class="sh-thumb"><img src="${first.src}" alt=""></div>
      <div class="sh-ttl"><b>${ids.length} item${ids.length === 1 ? '' : 's'} selected</b><small>Location included</small><button class="pill xs">Options ${ICON.chevron}</button></div>
      <button class="circle sm" data-act="closeShare" aria-label="Close">${ICON.close}</button>
    </div>
    <div class="sh-people">${SHARE_PEOPLE.map((s, i) => `<button class="sp" data-sp="${i}"><span class="av"><img src="${s.avatar}" alt=""><span class="msg">${ICON.msg}</span></span><span class="n">${s.name.replace(' ', '<br>')}</span>${s.sub ? `<span class="s ${s.hi ? 'hi' : ''}">${s.sub}</span>` : ''}</button>`).join('')}</div>
    <div class="sh-apps">${app('AirDrop', 'airdrop', ICON.airdrop)}${app('Messages', 'messages', ICON.msgBig)}${app('Mail', 'mail', ICON.mail)}${app('Notes', 'notes', '')}</div>
    <div class="sh-card">
      <div class="sh-opt"><span class="oi">${ICON.albums}</span><div class="ot"><b>Keep as an album</b><small>“${albumName()}”</small></div><button class="toggle ios ${S.shKeep ? 'on' : ''}" data-act="shKeep" aria-label="Keep as an album"></button></div>
      <div class="sh-opt"><span class="oi">${ICON.liveAlbum}</span><div class="ot"><b>Live Album</b><small>New photo matches get added</small></div><button class="toggle ios ${S.shLive ? 'on' : ''}" data-act="shLive" aria-label="Live album"></button></div>
    </div>
    <div class="sh-actions">${act('copy', 'Copy')}${act('star', 'Add to Favorites')}${act('glasses', 'Add to Reading List')}${act('book', 'Add Bookmark')}</div>
    <button class="sh-row" data-act="shAct" data-t="Add to Reading List">${ICON.glasses}<span>Add to Reading List</span></button>`;
}
function finishShare(msg) {
  const keep = S.shKeep, name = albumName();
  closeSheet();
  S.selecting = false; if (keep) S.saved = true;
  rerender();
  toast(msg || (keep ? `Saved “${esc(name)}” to Albums${S.shLive ? ' · live' : ''}` : 'Done'));
}

// Figma "no results": Mom was never on that trip.
function renderNoResults() {
  const p = S.parsed;
  const mom = (p.people[0] && personWordFor(p.people[0])) || p.unknown || 'Mom';
  S.result = { matches: [], exact: false, count: 0, people: p.people, scenes: p.scenes, places: p.places };
  $('#results').innerHTML = `
    <div class="scroll">
      <div class="topbar"><h1>Search</h1><button class="circle" data-act="menu" aria-label="More">${ICON.more}</button><button class="pill">Select</button></div>
      <div class="lumi"><span class="mini-orb"></span><div><b>No photos of you and ${esc(mom)} in Italy</b><br><span class="sub">You visited Italy once, in Nov 2023 - but ${esc(mom)} isn’t in those photos. Here’s what’s closest.</span></div></div>
      <div class="closest">
        <div class="cl-grid">
          <div class="cl-big ph" data-photo="positano"><img src="photos/positano.jpg" alt=""><span class="glass-tag tag">${ICON.sparkle} Closest Match</span></div>
          <div class="cl-col"><div class="ph" data-photo="positano-night"><img src="photos/positano-night.jpg" alt=""></div><div class="ph" data-photo="sea-sunset"><img src="photos/sea-sunset.jpg" alt=""></div></div>
        </div>
        <div class="cl-foot"><div><b>Italy Trip · Nov 2023</b><small>34 photos · without ${esc(mom)}</small></div><button class="pill sm blue" data-act="viewClosest">View</button></div>
      </div>
      <div class="sec-head"><h2>Other Albums</h2><span class="count">2</span></div>
      <div class="divider" style="margin-bottom:8px"></div>
      ${[['goa-sunset', `Sunsets with ${mom}`, '15 Mar · 8'], ['goa-jump', 'Sunsets with friends', '22 Nov · 24']].map(([img, t, s]) => `<button class="album-row" data-act="openAlbum" data-t="${esc(t)}"><img src="photos/${img}.jpg" alt=""><span><b>${esc(t)}</b><small>${s}</small></span>${ICON.chevron}</button>`).join('')}
    </div>
    ${S.adding ? '<div class="add-blur" data-act="closeAdd"></div>' : ''}
    ${dockHTML(p)}`;
  afterResults();
}

// Figma "no understando": a known person, an unknown event.
function renderVague() {
  const p = S.parsed;
  const who = p.people.map((id) => S.names[id]).join(' and ') || 'them';
  S.result = { matches: [], exact: false, count: 0, people: p.people, scenes: [], places: [] };
  $('#results').innerHTML = `
    <div class="scroll">
      <div class="topbar"><h1>Search</h1><button class="circle" data-act="menu" aria-label="More">${ICON.more}</button><button class="pill">Select</button></div>
      <div class="lumi"><span class="mini-orb"></span><div>I know ${esc(who)} but not which “thing”<br><span class="sub">Was it one of these?</span></div></div>
      <div class="events">${EVENTS.map((e, i) => `<button class="event" data-event="${i}" style="animation-delay:${0.08 + i * 0.08}s"><img src="photos/${e.img}.jpg" alt=""><span><b>${e.title}</b>${e.sub ? `<small>${e.sub}</small>` : ''}<small>${e.meta}</small></span></button>`).join('')}</div>
      <h3 class="list-title">Or tell me one thing you remember</h3>
      <div class="mem-list">${MEMORY_PROMPTS.map((m, i) => `<button data-mem="${i}">${ICON[m.icon]}<span>${m.t}</span>${ICON.chevron}</button>`).join('')}</div>
    </div>
    ${S.adding ? '<div class="add-blur" data-act="closeAdd"></div>' : ''}
    ${dockHTML(p)}`;
  afterResults();
}

// ---------------- tag person sheet ----------------
const TAG_FACES = [['maa', 64], ['unnamed1', 41], ['unnamed2', 12], ['riya', 8]];
function openTag() {
  const word = S.parsed.unknown;
  S.tagSel = 'maa';
  S.aliasOn = { [word]: true, Maa: true, Mummy: false };
  renderTag(); openSheet('tagSheet');
}
function renderTag() {
  const word = S.parsed.unknown;
  $('#tagSheet').innerHTML = `
    <div class="sheet-head"><button class="circle" data-act="closeSheet" aria-label="Cancel">${ICON.close}</button><h3>Select ${esc(word)}</h3><button class="circle blue-fill" data-act="confirmTag" aria-label="Done">${ICON.check}</button></div>
    <div class="lumi"><span class="mini-orb" style="width:36px;height:36px"></span><div>These people are in your Italy photos.<br><span class="sub">Pick ${esc(word)} once — I’ll remember next time.</span></div></div>
    <div class="faces">${TAG_FACES.map(([id, n]) => `<button class="face ${S.tagSel === id ? 'sel' : ''}" data-face="${id}"><div class="ring"><img src="${PEOPLE[id].avatar}" alt=""><span class="badge">${ICON.check}</span></div><span>${n} photos</span></button>`).join('')}</div>
    <button class="rowbtn" data-act="morePeople">${ICON.peopleLine}<span class="grow">Not here? Show more people</span>${ICON.chevron}</button>
    <div class="divider"></div>
    <div class="card"><div class="k">What do you call her? Any of these will find her</div>
      <div class="aliases">${Object.entries(S.aliasOn).map(([w, on]) => `<button class="alias ${on ? 'on' : ''}" data-alias="${esc(w)}">${on ? ICON.check : ''}${esc(w)}</button>`).join('')}<button class="alias" data-act="addAlias">${ICON.plus} Add</button></div>
    </div>`;
  mountOrbs($('#tagSheet'));
}
function confirmTag() {
  const id = S.tagSel, words = Object.entries(S.aliasOn).filter(([, on]) => on).map(([w]) => w.toLowerCase());
  S.aliases[id] = Array.from(new Set([...(S.aliases[id] || []), ...words]));
  if (!S.names[id]) S.names[id] = cap(S.parsed.unknown);
  closeSheet();
  toast(`<img src="${PEOPLE[id].avatar}" alt="">Got it — ${esc(S.names[id])} is ${esc(S.parsed.unknown)}`);
  const label = S.parsed.label;
  setTimeout(() => runQuery(S.parsed.text, label), 450);
  renderOverview();
}

// ---------------- save album sheet ----------------
function openSave() {
  const p = S.parsed, r = S.result;
  if (!r.matches.length) return;
  S.cover = r.matches[0].id; S.keep = true; S.share = false;
  renderSave(); openSheet('saveSheet');
}
function renderSave() {
  const p = S.parsed, r = S.result;
  const known = !p.unknown && r.people.length;
  const personWord = known ? (p.personWord[r.people[0]] || S.names[r.people[0]]) : null;
  const title = known ? `${personWord} and me` : [r.places.find((x) => x !== 'Italy') || r.places[0], r.scenes[0] && SCENE_LABEL[r.scenes[0]].toLowerCase() + 's'].filter(Boolean).join(' ') || cap(p.label);
  const peopleIn = Array.from(new Set(r.matches.flatMap((m) => m.people)));
  const photos = r.matches;
  const cov = PHOTOS.find((x) => x.id === S.cover);
  const tags = [...(known ? [personWord, 'You'] : []), ...r.scenes.map((s) => SCENE_LABEL[s] + 's'), ...r.places.filter((x, i, a) => !(x === 'Italy' && a.includes('Positano')))];
  $('#saveSheet').innerHTML = `
    <div class="sheet-head"><button class="circle" data-act="closeSheet" aria-label="Cancel">${ICON.close}</button><h3>New Album</h3><button class="circle blue-fill" data-act="confirmSave" aria-label="Save">${ICON.check}</button></div>
    <div class="cover"><div class="in"><img id="coverImg" src="${cov.src}" alt=""><div class="scrim"></div>
      <span class="glass-tag tag">${ICON.sparkle} Suggested Cover</span>
      <div class="title" id="albumTitle" contenteditable="true" spellcheck="false">${esc(title)}</div>
      <button class="circle edit" data-act="editTitle" aria-label="Edit title">${ICON.pencil}</button>
      <div class="meta"><span class="avs">${peopleIn.slice(0, 3).map((id) => `<img src="${PEOPLE[id].avatar}" alt="">`).join('')}</span>${peopleIn.length ? peopleIn.length + ' people · ' : ''}${r.count} photos · live album</div>
    </div></div>
    <div class="thumbs">${photos.slice(0, 4).map((m) => `<button class="${m.id === S.cover ? 'cur' : ''}" data-cover="${m.id}"><img src="${m.src}" alt=""></button>`).join('')}</div>
    <div class="card">
      <div class="opt"><span class="oi" style="color:#ff8ab0">${ICON.plus}</span><div class="ot"><b>Keep adding new photos</b><div class="tagrow">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}<em>tap to change</em></div></div><button class="toggle ${S.keep ? 'on' : ''}" data-act="keep" aria-label="Keep adding"></button></div>
      ${known ? `<div class="opt"><span class="oi">${ICON.peopleLine}</span><div class="ot"><b>Share album with ${esc(personWord)}</b><small>She can add hers too</small></div><button class="toggle ${S.share ? 'on' : ''}" data-act="share" aria-label="Share"></button></div>` : ''}
    </div>`;
}
function confirmSave() {
  const title = $('#albumTitle').textContent.trim() || 'New album';
  S.saved = true; closeSheet(); renderResults();
  document.querySelectorAll('#results .chip').forEach((c) => c.classList.remove('new'));
  const cov = PHOTOS.find((x) => x.id === S.cover);
  toast(`<img src="${cov.src}" alt="" style="border-radius:8px">Saved “${esc(title)}” to Albums${S.share ? ' · shared' : ''}`);
}

// ---------------- sheets / viewer / menu ----------------
let openId = null;
function openSheet(id) { openId = id; $('#scrim').classList.add('on'); $('#' + id).classList.add('on'); $('#' + id).scrollTop = 0; }
function closeSheet() { if (openId) $('#' + openId).classList.remove('on'); $('#scrim').classList.remove('on'); openId = null; }
function openViewer(id) {
  const m = PHOTOS.find((x) => x.id === id);
  const names = m.people.map((pid) => S.names[pid] || null).filter(Boolean);
  $('#viewer').innerHTML = `<div class="vtop"><button class="circle" data-act="closeViewer" aria-label="Close">${ICON.back}</button><div><b>${m.place}, ${m.country}</b><span>${m.date}</span></div><span style="width:44px"></span></div>
    <img src="${m.src}" alt=""><div class="who">${names.map((n) => `<span class="chip">${ICON.people}${esc(n)}</span>`).join('')}${m.scenes.map((s) => `<span class="chip">${ICON.image}${SCENE_LABEL[s]}</span>`).join('')}</div>`;
  $('#viewer').classList.add('on');
}
function closeMenu() { $('#menu').classList.remove('on'); }
function restart() { S = fresh(); speakRun++; closeSheet(); $('#viewer').classList.remove('on'); renderOverview(); go('overview'); }

// ---------------- events ----------------
app.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act],[data-q],[data-prompt],[data-chip],[data-person],[data-photo],[data-face],[data-alias],[data-cover],[data-refine],[data-key],[data-event],[data-mem],[data-sp],[data-app]');
  if (!t) { if (!e.target.closest('#menu')) closeMenu(); return; }
  const d = t.dataset;
  if (d.key != null) { e.preventDefault(); const i = $('#addIn'); if (!i) return; i.value = d.key === '⌫' ? i.value.slice(0, -1) : i.value + d.key; i.focus({ preventScroll: true }); return; }
  if (d.refine) { applyRefine(d.refine); return; }
  if (d.event != null) { const ev = EVENTS[+d.event]; runQuery(ev.q, ev.label); return; }
  if (d.mem != null) { S.adding = true; S.addHint = MEMORY_PROMPTS[+d.mem].t + '…'; rerender(); return; }
  if (d.sp != null) { const s = SHARE_PEOPLE[+d.sp]; finishShare(`Sent ${S.sel.size} photo${S.sel.size === 1 ? '' : 's'} to ${esc(s.name)}${S.shKeep ? ' · saved as album' : ''}`); return; }
  if (d.app) { toast(`Opening ${d.app}…`); return; }
  if (d.photo && S.selecting) { S.sel.has(d.photo) ? S.sel.delete(d.photo) : S.sel.add(d.photo); rerender(); return; }
  if (d.prompt != null) { const p = PROMPTS[+d.prompt]; speak(p.say, p.label); return; }
  if (d.q != null) { runQuery(d.q, cap(d.q)); return; }
  if (d.chip) { toggleChip(d.chip); return; }
  if (d.person) { const n = S.names[d.person]; if (n) runQuery(`photos of ${S.aliases[d.person]?.[0] || n.toLowerCase()}`, `Photos of ${n}`); else toast('Search for a moment with them — Lumi will ask who they are.'); return; }
  if (d.photo) { openViewer(d.photo); return; }
  if (d.face) { S.tagSel = d.face; renderTag(); return; }
  if (d.alias) { S.aliasOn[d.alias] = !S.aliasOn[d.alias]; renderTag(); return; }
  if (d.cover) { S.cover = d.cover; renderSave(); return; }
  switch (d.act) {
    case 'voice': openSpeaking(); break;
    case 'realmic': realMic(); break;
    case 'home': speakRun++; if (rec) try { rec.abort(); } catch (_) {} renderOverview(); go('overview'); break;
    case 'clear': S.recents = []; renderOverview(); break;
    case 'restart': restart(); toast('Demo restarted'); break;
    case 'forget': S.aliases = clone(DEFAULT_ALIASES); S.names = fresh().names; closeMenu(); renderOverview(); toast('Lumi forgot who Mom is'); break;
    case 'menu': $('#menu').classList.toggle('on'); break;
    case 'tag': openTag(); break;
    case 'morePeople': toast('Showing 4 people from this trip — the rest are in People.'); break;
    case 'addAlias': { const w = prompt('Another name for her?'); if (w && w.trim()) { S.aliasOn[cap(w.trim())] = true; renderTag(); } break; }
    case 'confirmTag': confirmTag(); break;
    case 'save': if (S.saved) toast('Already saved to Albums'); else if (!S.result || !S.result.matches.length) toast('Pick a result first, then save it'); else openSave(); break;
    case 'notThese': S.popup = !S.popup; rerender(); break;
    case 'closePop': S.popup = false; rerender(); break;
    case 'addSearch': S.adding = true; S.popup = false; S.addHint = null; rerender(); break;
    case 'closeAdd': S.adding = false; S.addHint = null; rerender(); break;
    case 'addSubmit': { const i = $('#addIn'); if (i) submitAdd(i.value); break; }
    case 'clearRefine': S.refine = null; rerender(); break;
    case 'select': startSelect(); break;
    case 'cancelSelect': S.selecting = false; rerender(); break;
    case 'shareSel': openShare(); break;
    case 'closeShare': finishShare(); break;
    case 'shKeep': S.shKeep = !S.shKeep; t.classList.toggle('on', S.shKeep); break;
    case 'shLive': S.shLive = !S.shLive; t.classList.toggle('on', S.shLive); break;
    case 'shAct': toast(`${esc(d.t)} — done`); break;
    case 'viewClosest': { S.view = null; S.refine = null; for (const id of S.parsed.people) S.off.add('p:' + id); rerender(); $('#results .scroll').scrollTop = 0; break; }
    case 'openAlbum': toast(`Opening “${esc(d.t)}”`); break;
    case 'noop': break;
    case 'confirmSave': confirmSave(); break;
    case 'editTitle': { const el = $('#albumTitle'); el.focus(); document.getSelection().selectAllChildren(el); break; }
    case 'keep': S.keep = !S.keep; t.classList.toggle('on', S.keep); break;
    case 'share': S.share = !S.share; t.classList.toggle('on', S.share); break;
    case 'closeSheet': closeSheet(); break;
    case 'closeViewer': $('#viewer').classList.remove('on'); break;
  }
});
$('#scrim').addEventListener('click', closeSheet);
app.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.target.id === 'addForm') { submitAdd($('#addIn').value); return; }
  const v = $('#typeIn').value.trim();
  if (v) runQuery(v, cap(v));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSheet(); $('#viewer').classList.remove('on'); closeMenu();
    if (current === 'results' && (S.popup || S.adding || S.selecting)) { S.popup = S.adding = S.selecting = false; rerender(); }
  }
  if (e.target.matches('input,[contenteditable]')) return;
  if (e.key === 'r' || e.key === 'R') restart();
});

// ---------------- fit to window ----------------
const params = new URLSearchParams(location.search);
if (params.get('frame') === '0') document.body.classList.add('bare');
function fit() {
  const bare = document.body.classList.contains('bare');
  const pad = bare ? 0 : 48;
  const s = Math.min((innerWidth - pad) / (bare ? 390 : 414), (innerHeight - pad) / (bare ? 844 : 868));
  document.documentElement.style.setProperty('--s', Math.max(0.3, s).toFixed(4));
  $('#phone').style.setProperty('--s', Math.max(0.3, s).toFixed(4));
}
addEventListener('resize', fit); fit();

PHOTOS.forEach((p) => { const i = new Image(); i.src = p.src; });
Object.values(PEOPLE).forEach((p) => { const i = new Image(); i.src = p.avatar; });
renderOverview();
go('overview');
