// The "AI" in this prototype is a tag lookup. Every photo carries hand-written
// tags (people, place, scenes, date); a query is parsed into tags with simple
// keyword dictionaries and matched against them.

const P = (id) => `photos/${id}.jpg`;

const PEOPLE = {
  me:       { name: 'You',         avatar: P('ananya'),   count: 1840 },
  maa:      { name: 'Maa',         avatar: P('maa'),      count: 64 },
  papa:     { name: 'Papa',        avatar: P('papa'),     count: 342 },
  aarav:    { name: 'Aarav',       avatar: P('aarav'),    count: 211 },
  riya:     { name: 'Riya',        avatar: P('riya'),     count: 8 },
  rohan:    { name: 'Rohan',       avatar: P('rohan'),    count: 96 },
  bhavya:   { name: 'Bhavya Shah', avatar: P('bhavya'),   count: 40 },
  unnamed1: { name: null,          avatar: P('unnamed1'), count: 41 },
  unnamed2: { name: null,          avatar: P('unnamed2'), count: 12 },
};

// Words people use for each named person. "mom" is deliberately missing for
// Maa: the first search with "mom" must hit the "I don't know who Mom is" path.
const DEFAULT_ALIASES = {
  maa: ['maa', 'maa ji'],
  papa: ['papa', 'dad', 'father'],
  aarav: ['aarav'],
  riya: ['riya'],
  rohan: ['rohan', 'rohans'],
  me: ['myself'],
};

// Words that clearly mean "a person", used to spot a person Lumi can't resolve.
const PERSON_WORDS = ['mom', 'mother', 'mummy', 'mumma', 'mommy', 'ma', 'amma', 'aai'];

// Words that name an event without saying which one ("that thing at Rohan's").
const VAGUE_WORDS = ['thing', 'stuff', 'something', 'whatever'];

const SCENES = {
  sunset:     ['sunset', 'sunsets', 'golden hour', 'dusk', 'sunrise', 'sunrises'],
  beach:      ['beach', 'sea', 'seaside'],
  birthday:   ['birthday', 'cake', 'candles', 'bday'],
  ticket:     ['ticket', 'tickets', 'train', 'boarding'],
  screenshot: ['screenshot', 'screenshots'],
  food:       ['food', 'dinner', 'lunch', 'pastry', 'cookies'],
  friends:    ['friends', 'gang', 'group'],
  night:      ['night', 'nights', 'lights'],
  home:       ['housewarming', 'griha pravesh'],
  cricket:    ['cricket', 'match'],
};

const SCENE_LABEL = { sunset: 'Sunset', beach: 'Beach', birthday: 'Birthday', ticket: 'Ticket', screenshot: 'Screenshot', food: 'Food', friends: 'Friends', night: 'Night', home: 'Housewarming', cricket: 'Cricket', town: 'Buildings' };

const PLACES = {
  Italy:     ['italy', 'italian'],
  Positano:  ['positano', 'amalfi'],
  Rome:      ['rome', 'roma'],
  Goa:       ['goa'],
  Agra:      ['agra', 'taj', 'taj mahal'],
  Mumbai:    ['mumbai', 'bombay'],
  Bengaluru: ['bengaluru', 'bangalore', 'cubbon'],
};

// `hidden` photos never show up in a plain search; only a refinement reaches
// them (the close-up exists so "Closer up" has something to narrow down to).
const PHOTOS = [
  { id: 'mom-daughter-sunset', people: ['maa', 'me'], place: 'Positano', country: 'Italy', scenes: ['sunset', 'beach'], date: '14 July 2024 · 7:42 pm', evening: 'positano', rank: 10 },
  { id: 'sea-sunset',          people: ['maa', 'me'], place: 'Positano', country: 'Italy', scenes: ['sunset', 'beach'], date: '14 July 2024 · 7:51 pm', evening: 'positano', rank: 8 },
  { id: 'goa-sunset',          people: ['maa', 'me'], place: 'Positano', country: 'Italy', scenes: ['sunset', 'beach'], date: '15 July 2024 · 7:30 pm', evening: 'positano', rank: 7 },
  { id: 'closeup-sunset',      people: ['maa'],       place: 'Positano', country: 'Italy', scenes: ['sunset'],          date: '14 July 2024 · 7:47 pm', evening: 'positano', rank: 9, closeup: true, hidden: true },
  { id: 'positano',            people: [],            place: 'Positano', country: 'Italy', scenes: ['town'],             date: '14 July 2024 · 6:10 pm', evening: 'positano', rank: 5 },
  { id: 'positano-night',      people: [],            place: 'Positano', country: 'Italy', scenes: ['night', 'town'],    date: '14 July 2024 · 9:20 pm', evening: 'positano', rank: 5 },
  { id: 'coast',               people: [],            place: 'Positano', country: 'Italy', scenes: ['beach'],             date: '14 July 2024 · 5:05 pm', evening: 'positano', rank: 4 },
  { id: 'old-town',            people: ['me'],        place: 'Rome',     country: 'Italy', scenes: ['town'],              date: '9 July 2024 · 6:40 pm',  evening: 'rome',     rank: 4 },
  { id: 'street-food',         people: [],            place: 'Rome',     country: 'Italy', scenes: ['food'],              date: '10 July 2024 · 1:15 pm', evening: 'rome',     rank: 3 },
  { id: 'bday-hats',           people: ['aarav', 'riya', 'rohan'], place: 'Mumbai', country: 'India', scenes: ['birthday', 'friends'], date: '12 Mar 2025 · 5:48 pm', evening: 'bday', rank: 8 },
  { id: 'bday-family',         people: ['aarav', 'maa', 'papa', 'rohan'], place: 'Mumbai', country: 'India', scenes: ['birthday'], date: '12 Mar 2025 · 6:10 pm', evening: 'bday', rank: 8 },
  { id: 'bday-crown',          people: ['aarav'],     place: 'Mumbai',   country: 'India', scenes: ['birthday'],          date: '12 Mar 2024 · 4:30 pm',  evening: 'bday24',   rank: 7 },
  { id: 'cake',                people: ['aarav', 'rohan'], place: 'Mumbai', country: 'India', scenes: ['birthday'],       date: '12 Mar 2025 · 6:02 pm',  evening: 'bday',     rank: 9 },
  { id: 'goa-selfie',          people: ['riya', 'me'], place: 'Goa',     country: 'India', scenes: ['beach', 'friends'],  date: '28 Dec 2025 · 3:12 pm',  evening: 'goa',      rank: 9 },
  { id: 'goa-jump',            people: ['riya', 'me'], place: 'Goa',     country: 'India', scenes: ['beach', 'friends', 'sunset'], date: '28 Dec 2025 · 6:05 pm', evening: 'goa', rank: 8 },
  { id: 'goa-sunset-group',    people: ['riya', 'me'], place: 'Goa',     country: 'India', scenes: ['beach', 'friends', 'sunset'], date: '28 Dec 2025 · 6:18 pm', evening: 'goa', rank: 7 },
  { id: 'goa-duo',             people: ['me'],        place: 'Goa',      country: 'India', scenes: ['beach', 'friends'],  date: '29 Dec 2025 · 11:20 am', evening: 'goa',      rank: 5 },
  { id: 'beach-family',        people: ['riya', 'aarav', 'me'], place: 'Goa', country: 'India', scenes: ['beach', 'friends'], date: '28 Dec 2025 · 4:20 pm', evening: 'goa', rank: 6 },
  { id: 'friends',             people: ['riya', 'papa', 'me', 'rohan'], place: 'Mumbai', country: 'India', scenes: ['friends', 'home'], date: '2 Aug 2024 · 8:10 pm', evening: 'mumbai', rank: 5 },
  { id: 'park',                people: ['rohan', 'me'], place: 'Bengaluru', country: 'India', scenes: ['cricket'],        date: '18 Jan 2026 · 11:30 am', evening: 'cubbon',   rank: 3 },
  { id: 'taj-golden',          people: ['papa'],      place: 'Agra',     country: 'India', scenes: ['sunset'],            date: '18 Nov 2023 · 5:24 pm',  evening: 'agra',     rank: 6 },
  { id: 'city-night',          people: [],            place: 'Mumbai',   country: 'India', scenes: ['night', 'screenshot'], date: '20 Sep 2025 · 9:44 pm', evening: 'mumbai2', rank: 2 },
  { id: 'train-ticket',        people: [],            place: 'Mumbai',   country: 'India', scenes: ['ticket', 'screenshot'], date: '4 Oct 2025 · 7:02 am', evening: 'train',   rank: 9 },
].map(p => ({ ...p, src: P(p.id) }));

const hourOf = (date) => { const m = date.match(/(\d+):(\d+)\s*(am|pm)/); return (+m[1] % 12) + (m[3] === 'pm' ? 12 : 0) + m[2] / 60; };

// Library-size illusion: how many photos the "full" library would return for a
// tag combination. Falls back to the real match count.
const LIBRARY_COUNTS = {
  'sunset|Italy': 23,
  'sunset|Italy|maa': 3,
  'Italy': 212,
  'sunset': 61,
  'birthday|aarav': 12,
  'birthday|rohan': 48,
  'home|rohan': 22,
  'cricket|rohan': 15,
  'ticket|screenshot': 1,
  'beach|friends|Goa': 64,
  'beach|Goa': 64,
  'Goa': 88,
  'Agra': 34,
  'Positano': 48,
};
// Counts once the user has switched a chip off ("6 sunset photos from your Italy trip").
const REFINED_COUNTS = { 'sunset|Italy': 6 };

// Refinements offered by "Not these?" and by "Add to this search".
// `pick` returns the narrowed photo set; `to` jumps to another view instead.
const REFINES = {
  earlier:   { label: 'Earlier that evening', icon: 'clock',  chip: 'Earlier',   note: 'Narrowed down to earlier that evening.', pick: () => PHOTOS.filter((x) => x.evening === 'positano' && hourOf(x.date) < 19).sort((a, b) => hourOf(b.date) - hourOf(a.date)), what: '', where: ' from earlier that evening in Positano' },
  buildings: { label: 'Near buildings',       icon: 'image',  chip: 'Buildings', note: 'Narrowed down to photos near buildings.', pick: () => PHOTOS.filter((x) => x.country === 'Italy' && x.scenes.includes('town')), what: '', where: ' near buildings from your Italy trip' },
  closer:    { label: 'Closer up',            icon: 'zoomIn', chip: 'Closer Up', note: 'Narrowed down to closer ups.', pick: () => PHOTOS.filter((x) => x.closeup), what: 'sunset ', where: ' from your Italy trip' },
  two:       { label: 'Just two of us',       icon: 'people', reset: true },
  family:    { label: 'With the whole family', icon: 'people', to: 'noresults' },
  trip:      { label: 'A different trip',     icon: 'map',    to: 'noresults', divider: true },
};
const POPUP_REFINES = ['earlier', 'buildings', 'closer', 'two', 'trip'];
const ADD_SUGGESTIONS = ['family', 'closer', 'two'];

// "That thing at Rohan's": the events Lumi can tell apart.
const EVENTS = [
  { img: 'bday-hats', title: 'Rohan’s birthday',        meta: '12 Mar 2025 · 48 photos', q: 'Rohan birthday',      label: 'Rohan’s birthday' },
  { img: 'friends',   title: 'Housewarming at Rohan’s', meta: 'Aug 2024 · 22 photos',    q: 'Rohan housewarming',  label: 'Housewarming at Rohan’s' },
  { img: 'park',      title: 'Cricket with Rohan',      sub: 'Cubbon Park', meta: 'Jan 2026 · 15 photos', q: 'Rohan cricket', label: 'Cricket with Rohan' },
];
const MEMORY_PROMPTS = [
  { icon: 'peopleLine', t: 'Who else was there' },
  { icon: 'calendar',   t: 'Roughly when' },
  { icon: 'map',        t: 'Where it was' },
  { icon: 'sparkle',    t: 'What was happening' },
];

// Voice prompts the presenter can "say".
const PROMPTS = [
  { say: 'Show me sunset photo with mom in Italy', label: 'Sunset photo with mom in Italy' },
  { say: 'Pic from that thing at Rohan’s',         label: 'Pic from that thing at Rohan’s' },
  { say: 'Maa ki Italy wali sunset photo',         label: 'Maa ki Italy wali sunset photo' },
  { say: 'Aarav birthday cake',                    label: 'Aarav birthday cake' },
  { say: 'Train ticket screenshot',                label: 'Train ticket screenshot' },
  { say: 'Goa beach with friends',                 label: 'Goa beach with friends' },
];

const DEFAULT_RECENTS = [
  { q: 'Italy trip', sub: '212 photos', thumbs: ['mom-daughter-sunset', 'positano'] },
  { q: 'Aarav birthday cake', sub: '12 photos', thumbs: ['cake'] },
  { q: 'train ticket screenshot', sub: '1 photo', thumbs: ['train-ticket'] },
];

const OVERVIEW = {
  people: ['maa', 'papa', 'aarav', 'unnamed2', 'riya', 'unnamed1'],
  places: [
    { q: 'Positano',   label: 'Positano', date: 'Jul ’24', img: 'positano' },
    { q: 'Goa beach',  label: 'Goa',      date: 'Dec ’25', img: 'beach-family' },
    { q: 'Agra',       label: 'Agra',     date: 'Nov ’23', img: 'taj-golden' },
    { q: 'Rome',       label: 'Rome',     date: 'Jul ’24', img: 'old-town' },
  ],
  docs: [
    { q: 'train ticket screenshot', label: 'Tickets',     img: 'train-ticket' },
    { q: 'screenshot',              label: 'Screenshots', img: 'city-night' },
    { q: 'food',                    label: 'Receipts',    img: 'street-food' },
    { q: 'beach',                   label: 'Maps',        img: 'coast' },
  ],
};

// Share sheet contacts (Figma "share" frame).
const SHARE_PEOPLE = [
  { avatar: P('maa'),        name: 'Mom',         sub: 'in all 3', hi: true },
  { avatar: P('aarav'),      name: 'Aarav Chotu', sub: '' },
  { avatar: P('bhavya'),     name: 'Bhavya Shah', sub: '' },
  { avatar: P('goa-selfie'), name: 'Friends',     sub: '5 people' },
];
