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
};
const STATUS = `<div class="statusbar"><span>9:41</span><svg viewBox="0 0 78 13" fill="#fff"><rect x="0" y="8" width="3.2" height="5" rx="1"/><rect x="5" y="5.5" width="3.2" height="7.5" rx="1"/><rect x="10" y="3" width="3.2" height="10" rx="1"/><rect x="15" y="0.5" width="3.2" height="12.5" rx="1"/><path d="M30.5 4.2a9.5 9.5 0 0 1 13 0l-1.4 1.5a7.5 7.5 0 0 0-10.2 0zM33.2 7a5.6 5.6 0 0 1 7.6 0l-1.4 1.5a3.6 3.6 0 0 0-4.8 0zM37 12.3l-2-2.1a2.9 2.9 0 0 1 4 0z"/><rect x="50.5" y="0.5" width="24" height="12" rx="3.6" fill="none" stroke="#fff" stroke-opacity=".4"/><rect x="52.5" y="2.5" width="20" height="8" rx="2"/><path d="M76 4.5v4a2 2 0 0 0 0-4z" fill-opacity=".4"/></svg></div>`;

// ---------------- state ----------------
const fresh = () => ({
  aliases: clone(DEFAULT_ALIASES),
  names: Object.fromEntries(Object.entries(PEOPLE).map(([k, v]) => [k, v.name])),
  recents: clone(DEFAULT_RECENTS),
  parsed: null, off: new Set(), saved: false, result: null,
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
  return { text, people, personWord, unknown, scenes, places };
}

function search(p, off = new Set()) {
  const people = p.people.filter((x) => !off.has('p:' + x));
  const scenes = p.scenes.filter((x) => !off.has('s:' + x));
  const places = p.places.filter((x) => !off.has('l:' + x)).filter((x, i, a) => !(x === 'Italy' && a.includes('Positano')));
  const ok = (ph) => people.every((x) => ph.people.includes(x)) && scenes.every((x) => ph.scenes.includes(x)) && places.every((x) => ph.place === x || ph.country === x);
  let matches = PHOTOS.filter(ok).sort((a, b) => b.rank - a.rank);
  let exact = true;
  if (!matches.length) {
    exact = false;
    const score = (ph) => people.filter((x) => ph.people.includes(x)).length * 2 + scenes.filter((x) => ph.scenes.includes(x)).length + places.filter((x) => ph.place === x || ph.country === x).length;
    matches = PHOTOS.map((ph) => [score(ph), ph]).filter(([s]) => s > 0).sort((a, b) => b[0] - a[0] || b[1].rank - a[1].rank).map(([, ph]) => ph).slice(0, 4);
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
    <div class="orb-wrap listening" id="orbWrap"><div class="orb"><i></i><i></i><i></i><i></i></div></div>
    <div class="status-line" id="statusLine"></div>
    <div class="prompts" id="prompts">
      <div class="lbl"><span>Try saying</span>${SR ? `<button data-act="realmic">${ICON.mic} Use my voice</button>` : ''}</div>
      <div class="rail">${PROMPTS.map((p, i) => `<button class="prompt tap" data-prompt="${i}">${esc(p.say)}</button>`).join('')}</div>
    </div>`;
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
    for (const el of els) { if (run !== speakRun) return; el.classList.add('on'); await wait(170 + Math.random() * 90); }
  } else tr.textContent = text;
  await wait(350); if (run !== speakRun) return;
  await think(parse(text), run);
  if (run !== speakRun) return;
  runQuery(text, label);
}
async function think(p, run) {
  const ow = $('#orbWrap'); ow.className = 'orb-wrap thinking';
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
    rec.onresult = (e) => { const t = Array.from(e.results).map((r) => r[0].transcript).join(' '); tr.classList.remove('listening'); tr.textContent = t; finalText = t; };
    rec.onerror = (e) => { toast(`Mic isn’t available here (${e.error}). Pick a prompt instead.`); resetListening(); };
    rec.onend = () => { if (finalText.trim()) speak(finalText.trim(), cap(finalText.trim()), { typed: false }); else resetListening(); };
    rec.start();
  } catch (err) { toast('Mic isn’t available here. Pick a prompt instead.'); resetListening(); }
}
function resetListening() { const tr = $('#transcript'); if (!tr) return; tr.classList.add('listening'); tr.textContent = 'Listening…'; $('#prompts').classList.remove('hide'); }

// ---------------- results ----------------
function runQuery(text, label) {
  S.parsed = parse(text); S.parsed.label = label || cap(text); S.off = new Set(); S.saved = false;
  renderResults();
  go('results');
  const r = S.result;
  if (r.matches.length && r.exact) {
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
const ph = (m, i, cls = '') => `<div class="ph ${cls}" style="animation-delay:${0.08 + i * 0.07}s" data-photo="${m.id}"><img src="${m.src}" alt=""></div>`;
function renderResults() {
  const p = S.parsed;
  const unknown = !!p.unknown;
  const r = search(p, S.off); S.result = r;
  const best = r.matches[0];
  const shown = unknown ? [best] : r.matches.slice(0, 4);
  const same = best ? Array.from(new Set([...PHOTOS.filter((x) => x.evening === best.evening), ...r.matches])).filter((x) => !shown.includes(x)).slice(0, 3) : [];
  const sameTitle = same.every((x) => x.evening === best.evening) ? 'Same evening' : 'More like this';
  const sameCount = best && best.evening === 'positano' ? 11 : Math.max(same.length, r.count - shown.length);
  const sameRow = same.length ? `
    <div class="sec-head"><h2>${sameTitle}</h2><span class="count">${sameCount}</span><span class="grow"></span><button class="pill sm blue">See All</button></div>
    <div class="row3">${same.map((m, i) => ph(m, i + 3)).join('')}</div>` : '';
  let body;
  if (unknown && best) {
    body = `
      <div class="lumi"><span class="mini-orb"></span><div>${summary(p, r)}<br><span class="sub">I don’t know who ${esc(p.unknown)} is yet.</span> <a data-act="tag">Show me</a></div></div>
      <div class="best" data-photo="${best.id}"><div class="in"><img src="${best.src}" alt=""><div class="scrim"></div>
        <span class="glass-tag tag">${ICON.sparkle} Best Guess</span>
        <div class="cap"><b>${best.place}, ${best.country}</b><span>${best.date}</span></div></div></div>
      ${sameRow}`;
  } else {
    body = `
      <div class="lumi"><span class="mini-orb"></span><div>${summary(p, r)}</div></div>
      <div class="grid">${r.matches.slice(0, 4).map((m, i) => ph(m, i)).join('')}</div>
      ${sameRow}`;
  }
  $('#results').innerHTML = `
    <div class="scroll">
      <div class="topbar"><h1>Search</h1><button class="circle" data-act="menu" aria-label="More">${ICON.more}</button><button class="pill">Select</button></div>
      ${body}
    </div>
    <div class="dock">
      <div class="chips"><div class="rail">${chipsHTML(unknown ? { ...p, people: [] } : p)}</div><button class="bookmark ${S.saved ? 'saved' : ''}" data-act="save" aria-label="Save as album">${S.saved ? ICON.bookmarkFill : ICON.bookmark}</button></div>
      <div class="querybar"><div class="qtoken"><span>${esc(p.label)} <button data-act="home" aria-label="Clear search" style="display:inline-grid">${ICON.xsmall}</button></span></div><button class="xbtn" data-act="home" aria-label="Clear">${ICON.xsmall}</button></div>
    </div>`;
  for (const k of S.off) { const c = $(`[data-chip="${k}"]`); if (c) c.classList.add('off'); }
}
function toggleChip(k) {
  S.off.has(k) ? S.off.delete(k) : S.off.add(k);
  const top = $('#results .scroll').scrollTop;
  renderResults();
  $('#results .scroll').scrollTop = top;
  document.querySelectorAll('#results .chip').forEach((c) => c.classList.remove('new'));
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
  const t = e.target.closest('[data-act],[data-q],[data-prompt],[data-chip],[data-person],[data-photo],[data-face],[data-alias],[data-cover]');
  if (!t) { if (!e.target.closest('#menu')) closeMenu(); return; }
  const d = t.dataset;
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
    case 'save': if (S.saved) toast('Already saved to Albums'); else openSave(); break;
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
  const v = $('#typeIn').value.trim();
  if (v) runQuery(v, cap(v));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSheet(); $('#viewer').classList.remove('on'); closeMenu(); }
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
