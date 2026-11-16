(() => {
const SIDE = document.body.dataset.side === 'client' ? 'client' : 'agency';
const KEY = 'slate.v2', UKEY = 'slate.ui.' + SIDE, DAY = 864e5, H = 36e5, CAP = 30;
const isClient = () => SIDE === 'client';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const fd = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const fdt = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const iso = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fromIso = v => v ? new Date(v + 'T12:00').getTime() : null;
const days = ms => Math.max(0, Math.round(ms / DAY));
const hrs = n => (Math.round(n * 10) / 10) + 'h';
const money = n => 'LKR ' + Math.round(n).toLocaleString('en-US');
const tc = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const lines = b => String(b || '').split('\n').map(l => l.trim()).filter(Boolean);

const ICON = { doc: 'DOC', board: 'MB', list: 'LIST', video: 'VID' };
const SHOTS = 'Shot | Type | Location | Notes\n1 | Wide drone | Beachfront | Sunrise, 05:45\n2 | Tracking, gimbal | Lobby | Guest arrival\n3 | Macro | Restaurant | Coffee pour, 120fps\n4 | Medium | Pool deck | Golden hour\n5 | Wide, locked | Rooftop | Night timelapse';
const MOOD = 'Golden hour warmth | #E8A33D\nDeep teal sea | #1F5F6B\nLinen and sand | #E9DFCB\nNight lobby | #1E2330\nBrass details | #B58A3C\nPalm green | #3F6B4A';
const SCRIPT = 'OPEN on first light over the water.\n\nA day told in five moments — arrival, morning, table, dusk, night. No voiceover; natural sound and a single piano theme.\n\nEND on the logo over the last frame, held for three seconds.';
const KITLIST = 'Item | Qty | Source\nSony FX6 | 2 | In-house\nMavic 3 Cine drone | 1 | In-house\nAputure 600d | 2 | Rental\nRonin gimbal | 1 | In-house\nSound kit (boom + 2 lavs) | 1 | In-house';
const SCHED = 'Time | What | Who\n05:00 | Crew call | All\n05:45 | Drone sunrise | DOP + pilot\n08:00 | Lobby arrival scene | Full crew\n12:30 | Lunch | All\n16:30 | Pool deck golden hour | Full crew\n19:30 | Wrap | All';
const DEFAULT = { 'Treatment / script': SCRIPT, 'Concept and script': SCRIPT, 'Script': SCRIPT, 'Mood board': MOOD, 'Storyboard': MOOD, 'Style frames': MOOD, 'Casting and locations': MOOD, 'Shot list': SHOTS, 'Equipment list': KITLIST, 'Shoot schedule': SCHED, 'Run sheet': SCHED };

// stage = [key, name, [[item, kind]...], [[task, team, hours]...]]
const BRIEF = ['brief', 'Brief', [['Client brief', 'doc']], [['Review brief and clarify', 'accounts', 2], ['Scope, budget and timeline', 'accounts', 3]]];
const DELIVER = ['deliver', 'Delivery', [['Final master', 'video']], [['Export deliverables', 'post', 2], ['Publish / hand over', 'accounts', 1]]];
const FILM = [BRIEF,
  ['creative', 'Creative', [['Treatment / script', 'doc'], ['Mood board', 'board']], [['Write treatment', 'creative', 6], ['Build mood board', 'creative', 4]]],
  ['preprod', 'Pre-production', [['Shot list', 'list'], ['Equipment list', 'list'], ['Shoot schedule', 'list']], [['Location scout', 'production', 5], ['Crew and kit booking', 'production', 3], ['Call sheet', 'production', 2]]],
  ['shoot', 'Shoot', [['Footage selects', 'video']], [['Shoot day', 'production', 10], ['Ingest and back up footage', 'post', 2]]],
  ['post', 'Edit', [['Draft cut', 'video']], [['Assembly edit', 'post', 8], ['Colour grade', 'post', 5], ['Sound mix and music', 'post', 4], ['Titles and graphics', 'post', 4]]],
  DELIVER];
const TEMPLATES = {
  'Brand film': FILM,
  'TVC': FILM.map(s => s[0] === 'preprod' ? ['preprod', 'Pre-production', [...s[2], ['Casting and locations', 'board']], [...s[3], ['Casting', 'production', 6]]] : s),
  'Social reel': [BRIEF,
    ['creative', 'Creative', [['Concept and script', 'doc'], ['Mood board', 'board']], [['Write concept', 'creative', 3], ['Build mood board', 'creative', 2]]],
    ['preprod', 'Pre-production', [['Shot list', 'list'], ['Equipment list', 'list']], [['Location scout', 'production', 3], ['Crew and kit booking', 'production', 2]]],
    ['shoot', 'Shoot', [['Footage selects', 'video']], [['Shoot day', 'production', 6], ['Ingest and back up footage', 'post', 1]]],
    ['post', 'Edit', [['Draft cut', 'video']], [['Edit', 'post', 5], ['Grade and sound', 'post', 3], ['Captions and formats', 'post', 2]]],
    ['deliver', 'Delivery', [['Final master', 'video']], [['Export deliverables', 'post', 1], ['Publish / hand over', 'accounts', 1]]]],
  'Explainer': [BRIEF,
    ['creative', 'Script', [['Script', 'doc'], ['Storyboard', 'board']], [['Write script', 'creative', 5], ['Storyboard', 'creative', 6]]],
    ['design', 'Design', [['Style frames', 'board']], [['Design style frames', 'creative', 6]]],
    ['post', 'Animation', [['Draft cut', 'video']], [['Animate', 'post', 16], ['Voiceover and sound', 'post', 4]]],
    DELIVER],
  'Event coverage': [BRIEF,
    ['preprod', 'Planning', [['Run sheet', 'list'], ['Equipment list', 'list']], [['Venue recce', 'production', 3], ['Crew and kit booking', 'production', 2]]],
    ['shoot', 'Shoot', [['Footage selects', 'video']], [['Event day', 'production', 10], ['Ingest and back up footage', 'post', 2]]],
    ['post', 'Edit', [['Highlight cut', 'video']], [['Edit', 'post', 8], ['Grade and sound', 'post', 4]]],
    DELIVER],
};
const TYPES = Object.keys(TEMPLATES);

const mkTask = (title, teamId, est, due) => ({ id: uid(), title, teamId, est: +est || 1, spent: 0, status: 'todo', assignee: null, start: null, due: due || null, timer: null, clientVisible: true });
function newProject(o) {
  const type = TEMPLATES[o.type] ? o.type : TYPES[0];
  return {
    id: uid(), clientId: o.clientId, name: o.name, type, createdAt: o.t || Date.now(), due: o.due, budget: +o.budget || 0,
    includedRounds: 2, live: null, shoot: null, changes: [], orders: [], msgs: [], extCosts: [], log: [],
    stages: TEMPLATES[type].map(s => ({
      id: uid(), key: s[0], name: s[1], doneAt: null,
      items: s[2].map(i => ({ id: uid(), name: i[0], kind: i[1], status: 'draft', rounds: 0, extra: 0, versions: [], comments: [], dur: i[1] === 'video' ? 45 : 0, waitMs: 0 })),
      tasks: s[3].map(t => mkTask(t[0], t[1], t[2])),
    })),
  };
}

/* ---------- seed ---------- */
function seed() {
  const n = Date.now();
  const S = {
    v: 2, agency: 'Northlight Studio',
    teams: [{ id: 'accounts', name: 'Accounts', color: '#6C5CE0' }, { id: 'creative', name: 'Creative', color: '#D94A72' }, { id: 'production', name: 'Production', color: '#D9822B' }, { id: 'post', name: 'Post', color: '#23957C' }],
    people: [
      { id: 'u1', name: 'Maya Fernando', teamId: 'accounts', rate: 5500 }, { id: 'u2', name: 'Ishan Perera', teamId: 'creative', rate: 7000 }, { id: 'u3', name: 'Tara Silva', teamId: 'creative', rate: 4500 },
      { id: 'u4', name: 'Dev Rajan', teamId: 'production', rate: 6500 }, { id: 'u5', name: 'Nilu Jayasuriya', teamId: 'production', rate: 4500 }, { id: 'u6', name: 'Kavi Mendis', teamId: 'post', rate: 5000 }, { id: 'u7', name: 'Sam Wijeratne', teamId: 'post', rate: 5000 },
    ],
    clients: [{ id: 'c1', name: 'Harbour Hotels', contact: 'Anya Dias' }, { id: 'c2', name: 'Ceylon Roast Coffee', contact: 'Ruwan Peiris' }, { id: 'c3', name: 'Nova Pay', contact: 'Lena Cooray' }],
    kit: ['FX6 A-cam', 'FX6 B-cam', 'Mavic 3 Cine drone', 'Aputure 600d kit', 'Ronin gimbal', 'Sound kit'],
    projects: [],
  };
  const owner = (team, i) => { const m = S.people.filter(p => p.teamId === team); return m[i % m.length].id; };
  const contact = p => S.clients.find(c => c.id === p.clientId).contact;
  const mk = (clientId, name, type, ago, dueIn, budget, brief) => {
    const p = newProject({ clientId, name, type, t: n - ago * DAY, due: n + dueIn * DAY, budget });
    p.stages[0].items[0].versions.push({ n: 1, t: p.createdAt, by: contact(p), side: 'client', note: 'Brief as submitted', body: brief, sent: true });
    p.log.push({ t: p.createdAt, side: 'client', who: contact(p), text: 'Submitted the brief', vis: 'all' });
    S.projects.push(p); return p;
  };
  const finish = (p, upto, startAgo) => {
    let t = n - startAgo * DAY; const c = contact(p);
    p.stages.slice(0, upto).forEach((s, si) => {
      s.tasks.forEach((k, i) => { k.status = 'done'; k.assignee = owner(k.teamId, i + si); k.spent = Math.round(k.est * [0.9, 1.1, 1, 1.2, 0.8][(i + si) % 5] * 10) / 10; k.start = t; k.due = t + DAY; });
      s.items.forEach(it => {
        t += DAY * 0.6;
        const vn = it.versions.length + 1;
        it.versions.push({ n: vn, t, by: 'Maya Fernando', side: 'agency', note: vn > 1 ? 'Clarified scope and deliverables' : 'First version', body: vn > 1 ? it.versions[0].body + '\n\nAgreed scope: 1 hero film (60s), 3 cut-downs (15s), 2 revision rounds per deliverable.' : (DEFAULT[it.name] || ''), sent: true });
        p.log.push({ t: t + H, side: 'agency', who: 'Maya Fernando', text: `Sent ${it.name} v${vn} for approval`, vis: 'all' });
        it.sentAt = t + H; t += DAY * 0.7; it.status = 'approved'; it.decidedAt = t; it.approvedBy = c; it.waitMs = t - it.sentAt;
        p.log.push({ t, side: 'client', who: c, text: `Approved ${it.name} v${vn}`, vis: 'all' });
      });
      t += DAY * 0.5; s.doneAt = t;
      p.log.push({ t, side: 'system', who: 'Slate', text: `${s.name} stage complete`, vis: 'all' });
    });
  };
  const T = (p, si, ti) => p.stages[si].tasks[ti], I = (p, si, ii) => p.stages[si].items[ii];

  // 1 — in edit, waiting on the client
  const a = mk('c1', 'Brand film — Mornings at the Harbour', 'Brand film', 18, 6, 850000, 'We want a 60-second brand film for the reopening of the Galle property.\n\nAudience: couples and families, 30-55, regional travellers.\nTone: calm, warm, unhurried.\nMust include: the sea-facing pool, the restaurant, the restored lobby.\nNeeded by the end of the month for the reopening campaign.');
  finish(a, 4, 16);
  Object.assign(T(a, 4, 0), { status: 'done', assignee: 'u6', spent: 9.5, start: n - 8 * DAY, due: n - 6 * DAY });
  Object.assign(T(a, 4, 1), { status: 'doing', assignee: 'u7', spent: 6.5, start: n - 2 * DAY, due: n + 2 * DAY });
  Object.assign(T(a, 4, 2), { assignee: 'u7', start: n + 2 * DAY, due: n + 3 * DAY });
  Object.assign(T(a, 5, 0), { assignee: 'u6', start: n + 4 * DAY, due: n + 5 * DAY });
  const cut = I(a, 4, 0);
  cut.versions.push({ n: 1, t: n - 6.5 * DAY, by: 'Kavi Mendis', side: 'agency', note: 'First assembly, temp music', body: '', sent: true }, { n: 2, t: n - 3.2 * DAY, by: 'Kavi Mendis', side: 'agency', note: 'Longer sunrise hold, larger end logo, new track', body: '', sent: true });
  cut.rounds = 1; cut.status = 'review'; cut.sentAt = n - 3 * DAY; cut.waitMs = DAY;
  cut.comments.push({ t: n - 5.4 * DAY, side: 'client', who: 'Anya Dias', v: 1, tc: 12, text: 'Can we hold the sunrise shot a little longer?' }, { t: n - 5.4 * DAY + 4e5, side: 'client', who: 'Anya Dias', v: 1, tc: 31, text: 'The logo feels small here.' }, { t: n - 3.1 * DAY, side: 'agency', who: 'Kavi Mendis', v: 2, tc: 12, text: 'Held for an extra 2 seconds in v2.' });
  a.log.push({ t: n - 6.4 * DAY, side: 'agency', who: 'Maya Fernando', text: 'Sent Draft cut v1 for approval', vis: 'all' }, { t: n - 5.4 * DAY, side: 'client', who: 'Anya Dias', text: 'Requested changes on Draft cut v1 (round 1): "Hold the sunrise longer, logo is small"', vis: 'all' }, { t: n - 3.2 * DAY, side: 'agency', who: 'Kavi Mendis', text: 'Uploaded Draft cut v2 — Longer sunrise hold, larger end logo, new track', vis: 'internal' }, { t: n - 3 * DAY, side: 'agency', who: 'Maya Fernando', text: 'Sent Draft cut v2 for approval', vis: 'all' }, { t: n - 2 * DAY, side: 'agency', who: 'Sam Wijeratne', text: 'Started: Colour grade', vis: 'all' });
  a.extCosts.push({ label: 'Drone permit and location fees', amount: 65000 }, { label: 'Lighting rental', amount: 48000 }, { label: 'Music licence', amount: 30000 });
  a.msgs.push({ t: n - 2.5 * DAY, side: 'client', who: 'Anya Dias', text: 'Will the three 15-second cut-downs use the same grade as the hero film?' }, { t: n - 2.4 * DAY, side: 'agency', who: 'Maya Fernando', text: 'Yes, same grade. We cut them once the hero film is approved, so your sign-off on v2 unlocks them.' }, { t: n - 2.3 * DAY, side: 'agency', who: 'Maya Fernando', text: 'Chase Anya on Friday if v2 is still open; the cut-downs need three days.', internal: true });

  // 2 — pre-production, scope creep and an overdue task
  const b = mk('c2', 'Single Origin launch reel', 'Social reel', 10, 12, 320000, 'Launch reel for our new Single Origin range. 30 seconds, vertical first.\nShow the farm, the roast and the pour. Feel: craft, not corporate.');
  finish(b, 2, 9);
  Object.assign(T(b, 2, 0), { status: 'done', assignee: 'u4', spent: 3.5, start: n - 4 * DAY, due: n - 3 * DAY });
  Object.assign(T(b, 2, 1), { status: 'doing', assignee: 'u5', spent: 1.5, start: n - 2 * DAY, due: n - 1 * DAY });
  Object.assign(T(b, 3, 0), { assignee: 'u4', start: n + 6 * DAY, due: n + 7 * DAY });
  Object.assign(T(b, 4, 0), { assignee: 'u6', start: n + 8 * DAY, due: n + 10 * DAY });
  const sl = I(b, 2, 0), s2 = SHOTS + '\n6 | Handheld | Farm | Picking at dawn';
  [[3.5, 'First pass', SHOTS], [2.6, 'Added farm sequence', s2], [1.4, 'Swapped pour for latte art', s2.replace('3 | Macro | Restaurant | Coffee pour, 120fps', '3 | Macro | Cafe | Latte art, 120fps')]].forEach((v, i) => sl.versions.push({ n: i + 1, t: n - v[0] * DAY, by: 'Dev Rajan', side: 'agency', note: v[1], body: v[2], sent: true }));
  sl.rounds = 3; sl.status = 'changes'; sl.waitMs = 1.5 * DAY; sl.decidedAt = n - 0.6 * DAY;
  sl.comments.push({ t: n - 0.6 * DAY, side: 'client', who: 'Ruwan Peiris', v: 3, text: 'Could we add two more farm shots and drop the rooftop?' });
  b.log.push({ t: n - 0.6 * DAY, side: 'client', who: 'Ruwan Peiris', text: 'Requested changes on Shot list v3 (round 3): "Add two more farm shots and drop the rooftop"', vis: 'all' });
  const eq = I(b, 2, 1); eq.versions.push({ n: 1, t: n - 1.2 * DAY, by: 'Nilu Jayasuriya', side: 'agency', note: 'First version', body: KITLIST, sent: true }); eq.status = 'review'; eq.sentAt = n - 1 * DAY;
  b.log.push({ t: n - 1 * DAY, side: 'agency', who: 'Nilu Jayasuriya', text: 'Sent Equipment list v1 for approval', vis: 'all' });
  b.orders.push({ id: uid(), t: n - 0.4 * DAY, by: 'Maya Fernando', title: 'Extra revision round — Shot list', why: 'The shot list is on its third round; two are included.', amount: 25000, days: 1, status: 'sent', iid: sl.id });
  b.log.push({ t: n - 0.4 * DAY, side: 'agency', who: 'Maya Fernando', text: 'Sent change order "Extra revision round — Shot list" (LKR 25,000, +1 day)', vis: 'all' });
  b.shoot = { date: n + 6 * DAY, kit: ['FX6 A-cam', 'Ronin gimbal', 'Sound kit'] };
  b.extCosts.push({ label: 'Farm location fee', amount: 20000 });

  // 3 — brief just landed
  const c = mk('c3', 'App launch film — 60 seconds', 'Brand film', 1, 25, 900000, 'A 60-second launch film for the Nova Pay app.\nShow sign-up, first payment and the rewards screen. Mix of live action and screen capture.\nWe have brand guidelines and app recordings to share.');
  Object.assign(T(c, 0, 0), { assignee: 'u1', start: n, due: n + 1 * DAY });
  Object.assign(T(c, 0, 1), { assignee: 'u1', start: n + 1 * DAY, due: n + 2 * DAY });
  c.shoot = { date: n + 6 * DAY, kit: ['FX6 A-cam', 'Aputure 600d kit'] };

  // 4 — live, with a change request
  const d = mk('c1', 'Festive season social cuts', 'Social reel', 32, -3, 280000, 'Three 15-second festive cuts for Instagram and TikTok using the existing property footage plus one new shoot afternoon.');
  finish(d, 6, 30);
  d.live = { t: n - 4 * DAY, url: 'https://example.com/harbour-festive' };
  d.log.push({ t: n - 4 * DAY, side: 'agency', who: 'Maya Fernando', text: 'Marked the project as live', vis: 'all' }, { t: n - 1 * DAY, side: 'client', who: 'Anya Dias', text: 'Requested a change: "Swap the end card offer to Stay 3, Pay 2 and update the dates"', vis: 'all' });
  d.changes.push({ id: uid(), t: n - 1 * DAY, who: 'Anya Dias', text: 'Swap the end card offer to "Stay 3, Pay 2" and update the dates.', status: 'open' });
  return S;
}

/* ---------- state ---------- */
const load = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
let S = load(KEY); if (!S || S.v !== 2) { S = seed(); localStorage.setItem(KEY, JSON.stringify(S)); }
let UI = load(UKEY) || { user: null, view: 'home', pid: null, tab: 'flow', open: null, detail: false, diff: false, seen: Date.now() - 2 * DAY, team: '' };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
const saveUI = () => { try { localStorage.setItem(UKEY, JSON.stringify(UI)); } catch (e) { } };
let modal = null, bell = false, stale = false; const tcs = {};
const P = id => S.projects.find(p => p.id === id);
const person = id => S.people.find(p => p.id === id);
const team = id => S.teams.find(t => t.id === id) || S.teams[0];
const client = id => S.clients.find(c => c.id === id);
const actor = () => isClient() ? { side: 'client', who: client(UI.user).contact } : { side: 'agency', who: person(UI.user).name };
const log = (p, text, vis = 'all') => p.log.push({ t: Date.now(), ...actor(), text, vis });
const findItem = (p, id) => { for (const s of p.stages) for (const it of s.items) if (it.id === id) return it; };
const findTask = (p, id) => { for (const s of p.stages) for (const k of s.tasks) if (k.id === id) return k; };
const allTasks = fn => S.projects.forEach(p => p.stages.forEach(s => s.tasks.forEach(k => fn(k, s, p))));
const spentOf = k => k.spent + (k.timer ? (Date.now() - k.timer) / H : 0);
const myProjects = () => isClient() ? S.projects.filter(p => p.clientId === UI.user) : S.projects;

/* ---------- derived ---------- */
const IW = { approved: 1, review: .75, changes: .5 };
function ratio(stages) {
  let tot = 0, done = 0;
  stages.forEach(s => {
    s.tasks.forEach(k => { tot += k.est; done += k.est * (k.status === 'done' ? 1 : k.status === 'doing' ? .5 : 0); });
    s.items.forEach(it => { tot += 4; done += 4 * (IW[it.status] ?? (it.versions.length ? .25 : 0)); });
  });
  return tot ? Math.round(done / tot * 100) : 100;
}
const pct = p => ratio(p.stages), stagePct = s => ratio([s]);
const stageDone = s => s.tasks.every(k => k.status === 'done') && s.items.every(i => i.status === 'approved');
const curStage = p => { const i = p.stages.findIndex(s => !stageDone(s)); return i < 0 ? p.stages.length : i; };
const complete = p => curStage(p) >= p.stages.length;
const over = (p, it) => it.rounds > p.includedRounds + (it.extra || 0);
const reviewItems = p => p.stages.flatMap(s => s.items.filter(i => i.status === 'review'));
const openOrders = p => p.orders.filter(o => o.status === 'sent');
function ball(p) {
  const r = reviewItems(p), o = openOrders(p);
  if (r.length || o.length) return { side: 'client', since: Math.min(...r.map(i => i.sentAt), ...o.map(x => x.t)), n: r.length + o.length };
  if (complete(p)) return { side: 'done' };
  return { side: 'agency' };
}
const clientWait = p => p.stages.reduce((a, s) => a + s.items.reduce((b, i) => b + (i.waitMs || 0) + (i.status === 'review' ? Date.now() - i.sentAt : 0), 0), 0);
function projected(p) { let rem = 0; p.stages.forEach(s => s.tasks.forEach(k => { if (k.status !== 'done') rem += Math.max(k.est - k.spent, k.est * .1); })); return Date.now() + rem / 6 * DAY; }
const rate = k => k.assignee ? person(k.assignee).rate : (() => { const m = S.people.filter(u => u.teamId === k.teamId); return m.reduce((a, u) => a + u.rate, 0) / (m.length || 1); })();
function fin(p) {
  let labour = 0, todo = 0; p.stages.forEach(s => s.tasks.forEach(k => { labour += spentOf(k) * rate(k); if (k.status !== 'done') todo += Math.max(k.est - k.spent, 0) * rate(k); }));
  const ext = p.extCosts.reduce((a, x) => a + x.amount, 0), extras = p.orders.filter(o => o.status === 'accepted').reduce((a, o) => a + o.amount, 0);
  const rev = p.budget + extras, cost = labour + ext, fcost = cost + todo;
  return { labour, ext, extras, rev, cost, fcost, margin: rev - fcost, mpct: rev ? Math.round((rev - fcost) / rev * 100) : 0 };
}
function kitConflicts() {
  const out = [], ps = S.projects.filter(p => p.shoot && !complete(p));
  for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
    const a = ps[i], b = ps[j]; if (iso(a.shoot.date) !== iso(b.shoot.date)) continue;
    const kit = a.shoot.kit.filter(k => b.shoot.kit.includes(k)); if (kit.length) out.push({ a, b, kit, date: a.shoot.date });
  }
  return out;
}
function flags(p) {
  const f = [], n = Date.now(), done = complete(p), add = (sev, text) => f.push({ sev, text, pid: p.id });
  if (!done && p.due < n) add(3, `Past the delivery date by ${days(n - p.due)} day(s)`);
  p.stages.forEach(s => {
    s.items.forEach(it => {
      if (it.status === 'review' && n - it.sentAt > 2 * DAY) add(2, `Client has not responded on ${it.name} for ${days(n - it.sentAt)} days`);
      if (it.status !== 'approved' && over(p, it)) add(2, `${it.name} is on revision round ${it.rounds}, beyond scope${p.orders.some(o => o.iid === it.id && o.status === 'sent') ? ' — change order sent, awaiting client' : ' — no change order issued'}`);
    });
    s.tasks.forEach(k => {
      if (k.status === 'done') return;
      if (k.due && k.due < n) add(3, `"${k.title}" is overdue by ${Math.max(1, days(n - k.due))} day(s)${k.assignee ? ' — ' + person(k.assignee).name : ''}`);
      if (k.spent > k.est * 1.25) add(1, `"${k.title}" is over its estimate (${hrs(k.spent)} of ${hrs(k.est)})`);
    });
  });
  const cs = p.stages[curStage(p)];
  if (cs) { const u = cs.tasks.filter(k => k.status !== 'done' && !k.assignee).length; if (u) add(1, `${u} task(s) in ${cs.name} have no owner`); }
  const oc = p.changes.filter(c => c.status === 'open').length; if (oc) add(2, `${oc} change request(s) from the client not picked up yet`);
  if (!done && p.due >= n && projected(p) > p.due + DAY) add(2, `At the current pace delivery lands about ${days(projected(p) - p.due)} day(s) late`);
  if (p.budget && fin(p).mpct < 20) add(2, `Forecast margin is down to ${fin(p).mpct}%`);
  kitConflicts().forEach(c => { if (c.a === p || c.b === p) add(2, `Kit clash on ${fd(c.date)}: ${c.kit.join(', ')} also booked for ${(c.a === p ? c.b : c.a).name}`); });
  return f.sort((x, y) => y.sev - x.sev);
}
function health(p) {
  const f = flags(p), sev = f.length ? f[0].sev : 0;
  if (complete(p) && sev < 2) return { sev: 0, label: p.live ? 'Live' : 'Delivered', cls: 'good' };
  return sev >= 3 ? { sev, label: 'Off track', cls: 'bad' } : sev === 2 ? { sev, label: 'At risk', cls: 'warn' } : { sev: 1, label: 'On track', cls: 'good' };
}
function loadOf(u) {
  const n = Date.now(); let h = 0; const list = [];
  allTasks((k, s, p) => { if (k.assignee === u.id && k.status !== 'done') { const rem = Math.max(k.est - k.spent, .5); list.push({ p, s, k, rem }); if (!k.due || k.due < n + 7 * DAY) h += rem; } });
  return { h, list };
}
function sync() {
  S.projects.forEach(p => p.stages.forEach(s => {
    const d = stageDone(s);
    if (d && !s.doneAt) { s.doneAt = Date.now(); p.log.push({ t: Date.now(), side: 'system', who: 'Slate', text: `${s.name} stage complete`, vis: 'all' }); }
    else if (!d && s.doneAt) s.doneAt = null;
  }));
}
// updates from the other side
const updates = () => myProjects().flatMap(p => p.log.filter(e => isClient() ? (e.vis === 'all' && e.side !== 'client') : e.side === 'client').map(e => ({ ...e, p }))).sort((a, b) => b.t - a.t);

/* ---------- html bits ---------- */
const ST = { draft: 'Draft', review: 'Awaiting client', changes: 'Changes requested', approved: 'Approved' };
const STC = { draft: 'With the team', review: 'Needs your approval', changes: 'Being revised', approved: 'Approved' };
const chip = (it) => `<span class="chip ${it.status}">${(isClient() ? STC : ST)[it.status]}</span>`;
const bar = (v, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></div>`;
const teamTag = id => { const t = team(id); return `<span class="team" style="--c:${t.color}">${esc(t.name)}</span>`; };
function ballChip(p) {
  const b = ball(p), c = isClient();
  if (b.side === 'done') return `<span class="chip good">${p.live ? 'Live' : 'Complete'}</span>`;
  if (b.side === 'client') return `<span class="chip review">${c ? `Waiting on you · ${b.n}` : `Waiting on client · ${days(Date.now() - b.since)}d`}</span>`;
  return `<span class="chip acc">${c ? 'With ' + esc(S.agency) : 'With us'}</span>`;
}
function dueText(p) {
  if (complete(p)) return `Delivered`;
  const pr = projected(p);
  return `Due ${fd(p.due)}` + (pr > p.due + DAY ? ` · <b class="neg">now expected ${fd(pr)}</b>` : '');
}
function stepper(p) {
  const ci = curStage(p);
  return `<div class="stepper">${p.stages.map((s, i) => `<div class="step ${i < ci ? 'done' : i === ci ? 'cur' : ''}"><i></i><span>${esc(s.name)}</span><small>${stagePct(s)}%</small></div>`).join('')}<div class="step ${p.live ? 'done' : ''}"><i></i><span>Live</span><small>${p.live ? fd(p.live.t) : '&nbsp;'}</small></div></div>`;
}
function diffHTML(a, b) {
  const A = lines(a), B = lines(b);
  return `<div class="doc">${B.map(l => A.includes(l) ? `<div>${esc(l)}</div>` : `<div class="add">+ ${esc(l)}</div>`).join('')}${A.filter(l => !B.includes(l)).map(l => `<div class="del">${esc(l)}</div>`).join('')}</div>`;
}
function bodyHTML(it, v) {
  if (it.kind === 'board') return `<div class="board">${lines(v.body).map(l => { const [cap, val = ''] = l.split('|').map(x => x.trim()); return `<figure style="${/^#[0-9a-f]{3,8}$/i.test(val) ? 'background:' + val : ''}">${/^https?:\/\//.test(val) ? `<img src="${esc(val)}" alt="">` : ''}<figcaption>${esc(cap)}</figcaption></figure>`; }).join('')}</div>`;
  if (it.kind === 'list') { const r = lines(v.body).map(l => l.split('|').map(x => x.trim())); return `<table>${r.map((c, i) => `<tr>${c.map(x => i ? `<td>${esc(x)}</td>` : `<th>${esc(x)}</th>`).join('')}</tr>`).join('')}</table>`; }
  if (it.kind === 'video') {
    const cur = tcs[it.id] || 0;
    return `<div class="player">${v.url ? `<video src="${esc(v.url)}" controls data-item="${it.id}"></video>` : `<div class="frame"><span>${esc(it.name)} v${v.n}</span><small>Placeholder preview — paste a video link when uploading a version</small></div>`}
      <div class="track"><input class="scrub" type="range" min="0" max="${it.dur}" value="${cur}" data-item="${it.id}">${it.comments.filter(c => c.tc != null).map(c => `<i class="mark" style="left:${Math.min(99, c.tc / it.dur * 100)}%"></i>`).join('')}</div>
      <div class="muted"><span class="mono" id="tc-${it.id}">${tc(cur)}</span> / <span class="mono">${tc(it.dur)}</span> · move the playhead, then comment to pin feedback to that moment</div></div>`;
  }
  return `<div class="doc">${esc(v.body)}</div>`;
}
function panelHTML(p, it) {
  const c = isClient(), vs = c ? it.versions.filter(v => v.sent) : it.versions, v = vs.at(-1);
  if (!v) return `<div class="panel"><p class="muted">${c ? 'The team is working on this. It will appear here when it is ready for you.' : 'Nothing uploaded yet.'}</p>${c ? '' : `<button class="btn primary" data-act="item-edit" data-iid="${it.id}">Create first version</button>`}</div>`;
  const last = it.versions.at(-1), prev = vs.at(-2), canDiff = prev && it.kind !== 'video', ov = over(p, it) && it.status !== 'approved';
  let actions = '';
  if (c) { if (it.status === 'review') actions = `<button class="btn ok" data-act="item-approve" data-iid="${it.id}">Approve v${v.n}</button><button class="btn" data-act="item-changes" data-iid="${it.id}">Request changes</button>`; }
  else {
    actions = `<button class="btn" data-act="item-edit" data-iid="${it.id}">${it.kind === 'video' ? 'Upload new version' : 'Edit as new version'}</button>`;
    if (!last.sent || (it.status === 'draft' && last.side === 'client')) actions += `<button class="btn acc" data-act="item-send" data-iid="${it.id}">Send v${last.n} to client for approval</button>`;
    if (it.status === 'review') actions += `<button class="btn" data-act="nudge" data-iid="${it.id}">Send reminder</button>`;
    if (ov && !p.orders.some(o => o.iid === it.id && o.status === 'sent')) actions += `<button class="btn primary" data-act="order-new" data-iid="${it.id}">Issue change order</button>`;
  }
  if (canDiff) actions += `<button class="btn ghost" data-act="toggle-diff">${UI.diff ? 'Show full version' : `What changed since v${prev.n}`}</button>`;
  return `<div class="panel">${canDiff && UI.diff ? diffHTML(prev.body, v.body) : bodyHTML(it, v)}
    <div class="vmeta"><b>v${v.n}</b> · ${esc(v.by)} · ${fdt(v.t)}${v.note ? ' · ' + esc(v.note) : ''}${!c && !v.sent ? ' · <span class="tag">not sent to client yet</span>' : ''}</div>
    ${it.status === 'approved' ? `<div class="signoff">Approved by ${esc(it.approvedBy)} · ${fdt(it.decidedAt)}</div>` : ''}
    ${!c && ov ? `<div class="chip bad" style="margin-bottom:10px">Revision round ${it.rounds} — beyond the ${p.includedRounds + (it.extra || 0)} rounds in scope</div>` : ''}
    <div class="row" style="flex-wrap:wrap">${actions}</div>
    ${vs.length > 1 ? `<ul class="vers">${vs.slice(0, -1).reverse().map(x => `<li>v${x.n} · ${esc(x.by)} · ${fdt(x.t)} · ${esc(x.note || '')}</li>`).join('')}</ul>` : ''}
    <div class="comments">${it.comments.map(m => `<div class="cm ${m.side}"><b>${esc(m.who)}</b>${m.tc != null ? `<button class="tcb mono" data-act="seek" data-iid="${it.id}" data-tc="${m.tc}">${tc(m.tc)}</button>` : ''}<span>${esc(m.text)}</span><small>v${m.v} · ${fdt(m.t)}</small></div>`).join('')}
      <form class="row" data-form="comment" data-iid="${it.id}"><input name="text" required placeholder="${it.kind === 'video' ? 'Comment at the playhead…' : 'Add a comment…'}"><button class="btn">Comment</button></form></div>
  </div>`;
}
function itemHTML(p, it) {
  const c = isClient(), v = (c ? it.versions.filter(x => x.sent) : it.versions).at(-1), open = UI.open === it.id;
  return `<div class="item ${open ? 'open' : ''}"><div class="item-row" data-act="toggle-item" data-iid="${it.id}"><span class="kind k-${it.kind}">${ICON[it.kind]}</span><b>${esc(it.name)}</b><span class="muted">${v ? 'v' + v.n : 'not started'}</span>${it.rounds ? `<span class="tag ${!c && over(p, it) ? 'bad' : ''}">round ${it.rounds}${c ? '' : ' of ' + (p.includedRounds + (it.extra || 0))}</span>` : ''}<span class="sp"></span>${chip(it)}<span class="chev">${open ? '–' : '+'}</span></div>${open ? panelHTML(p, it) : ''}</div>`;
}
const SL = { todo: 'To do', doing: 'In progress', done: 'Done' };
function tasksHTML(p, s) {
  const n = Date.now();
  return `<table class="tasks"><tr><th>Task</th><th>Team</th><th>Owner</th><th>Due</th><th>Spent / est.</th><th>Status</th><th>Client sees</th></tr>${s.tasks.map(k => `<tr class="${k.status !== 'done' && k.due && k.due < n ? 'late' : ''}"><td>${esc(k.title)}</td><td>${teamTag(k.teamId)}</td>
    <td><select data-change="task-assign" data-tid="${k.id}"><option value="">Unassigned</option>${S.people.map(u => `<option value="${u.id}" ${u.id === k.assignee ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select></td>
    <td><button class="link" data-act="task-edit" data-tid="${k.id}">${k.due ? fd(k.due) : 'set'}</button></td>
    <td><button class="link mono" data-act="task-log" data-tid="${k.id}" title="Log time">${hrs(spentOf(k))} / ${hrs(k.est)}</button></td>
    <td><button class="st st-${k.status}" data-act="task-status" data-tid="${k.id}">${SL[k.status]}</button></td>
    <td><button class="link" data-act="task-vis" data-tid="${k.id}">${k.clientVisible ? 'Shown' : 'Hidden'}</button></td></tr>`).join('')}</table>
    <button class="btn sm" data-act="task-add" data-sid="${s.id}" style="margin-top:8px">+ Add task</button>`;
}
function orderHTML(p, o) {
  const c = isClient();
  return `<div class="order"><div style="flex:1;min-width:220px"><b>${esc(o.title)}</b><br><small>${esc(o.why || '')} · raised ${fd(o.t)} by ${esc(o.by)}</small></div><b>${money(o.amount)}</b><span class="muted">${o.days ? '+' + o.days + ' day(s)' : 'no date change'}</span>
    ${o.status === 'sent' ? (c ? `<button class="btn ok" data-act="order-accept" data-pid="${p.id}" data-oid="${o.id}">Accept</button><button class="btn" data-act="order-decline" data-pid="${p.id}" data-oid="${o.id}">Decline</button>` : '<span class="chip review">Awaiting client</span>') : `<span class="chip ${o.status === 'accepted' ? 'good' : 'bad'}">${o.status === 'accepted' ? 'Accepted' : 'Declined'} · ${esc(o.decidedBy)} · ${fd(o.decidedAt)}</span>`}</div>`;
}
function digest(p) {
  const wk = Date.now() - 7 * DAY, done = p.log.filter(e => e.t > wk && e.vis === 'all' && /^(Finished|Approved|.* stage complete)/.test(e.text)).sort((a, b) => b.t - a.t).slice(0, 4);
  const cs = p.stages[curStage(p)], next = cs ? cs.tasks.filter(k => k.clientVisible && k.status !== 'done').slice(0, 3) : [], need = [...reviewItems(p).map(i => 'Approve ' + i.name), ...openOrders(p).map(o => 'Decide on: ' + o.title)];
  const li = a => a.length ? `<ul>${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="muted">Nothing here.</p>';
  return `<div class="digest"><div class="card"><h2>Done in the last 7 days</h2>${li(done.map(e => e.text))}</div><div class="card"><h2>Coming next</h2>${li(next.map(k => k.title))}</div><div class="card ${need.length ? 'need' : ''}" style="margin:0"><h2>Needs you</h2>${li(need)}</div></div>`;
}

/* ---------- project view (both sides) ---------- */
function projectView(p) {
  const c = isClient(), ci = curStage(p), h = health(p), fl = flags(p), oc = p.changes.filter(x => x.status === 'open').length + openOrders(p).length;
  const need = reviewItems(p), oo = openOrders(p);
  let body = '';
  if (UI.tab === 'flow') {
    body = (c ? digest(p) : '')
      + (c && (need.length || oo.length) ? `<div class="card need"><h2>Waiting on you</h2>${need.map(it => `<div class="row"><b>${esc(it.name)}</b><span class="muted">v${it.versions.filter(v => v.sent).at(-1).n} · sent ${fd(it.sentAt)}</span><span class="sp"></span><button class="btn sm primary" data-act="open-item" data-iid="${it.id}">Review</button></div>`).join('')}${oo.map(o => orderHTML(p, o)).join('')}</div>` : '')
      + (c ? `<div class="row" style="margin-bottom:10px"><span class="muted">Every stage, what is done, and what needs you.</span><span class="sp"></span><button class="btn sm" data-act="toggle-detail">${UI.detail ? 'Hide' : 'Show'} detailed breakdown</button></div>` : '')
      + p.stages.map((s, i) => `<section class="card stage ${i === ci ? 'cur' : i > ci ? 'future' : ''}"><header><h2>${i + 1}. ${esc(s.name)}</h2>${s.doneAt ? `<span class="chip good">Complete · ${fd(s.doneAt)}</span>` : i === ci ? '<span class="chip acc">Current stage</span>' : ''}<span class="sp"></span>${bar(stagePct(s), s.doneAt ? 'ok' : '')}<b>${stagePct(s)}%</b></header>
        <div class="sec">${s.items.length ? `<label>${c ? 'For your approval' : 'Deliverables for client approval'}</label>${s.items.map(it => itemHTML(p, it)).join('')}` : ''}
        ${c ? (UI.detail ? `<label>Work in this stage</label><ul class="left">${s.tasks.filter(k => k.clientVisible).map(k => `<li><span class="st st-${k.status}">${SL[k.status]}</span> ${esc(k.title)} · ${teamTag(k.teamId)}</li>`).join('') || '<li class="muted">Nothing listed</li>'}</ul>` : `<small>${s.tasks.filter(k => k.clientVisible && k.status === 'done').length} of ${s.tasks.filter(k => k.clientVisible).length} pieces of work done</small>`)
        : `<label>Internal tasks</label>${tasksHTML(p, s)}`}
        ${!c && s.key === 'shoot' ? `<label>Shoot booking</label><div class="row">${p.shoot ? `<span>${fd(p.shoot.date)} · ${esc(p.shoot.kit.join(', '))}</span>` : '<span class="muted">No shoot date or kit booked</span>'}<button class="btn sm" data-act="shoot-edit">Edit booking</button></div>` : ''}</div></section>`).join('')
      + (!c && complete(p) && !p.live ? `<button class="btn acc" data-act="go-live">Mark as live</button>` : '');
  } else if (UI.tab === 'msgs') {
    const ms = p.msgs.filter(m => !c || !m.internal);
    body = `<div class="card"><div class="msgs">${ms.map(m => `<div class="msg ${m.internal ? 'int' : m.side === SIDE ? 'me' : ''}"><small>${esc(m.who)} · ${fdt(m.t)}${m.internal ? ' · internal note, client cannot see this' : ''}</small><div>${esc(m.text)}</div></div>`).join('') || `<p class="empty">No messages yet. ${c ? 'Ask the team anything about this project.' : 'Messages here reach the client; tick internal for team-only notes.'}</p>`}</div>
      <form class="row" data-form="msg"><input name="text" required placeholder="${c ? 'Message the team…' : 'Message the client…'}">${c ? '' : '<label class="row" style="gap:5px"><input type="checkbox" name="internal"> Internal note</label>'}<button class="btn primary">Send</button></form></div>`;
  } else if (UI.tab === 'log') {
    const ev = p.log.filter(e => !c || e.vis === 'all').sort((x, y) => y.t - x.t);
    body = `<div class="card"><h2>Everything that happened, in order</h2><div class="log">${ev.map(e => `<div class="ev ${e.side}"><b>${esc(e.who)}</b> ${esc(e.text)} ${e.vis === 'internal' ? '<span class="tag">internal only</span>' : ''}<small>${fdt(e.t)}</small></div>`).join('')}</div></div>`;
  } else if (UI.tab === 'time') {
    const n = Date.now(), total = Math.max(1, (complete(p) ? p.stages.at(-1).doneAt : n) - p.createdAt), wait = clientWait(p);
    let prev = p.createdAt; const segs = p.stages.map((s, i) => { const end = s.doneAt || (i === ci ? n : null); const d = end ? Math.max(0, end - prev) : 0; if (end) prev = end; return { s, d }; }).filter(x => x.d > 0);
    const cols = ['#6C5CE0', '#D94A72', '#D9822B', '#B5651D', '#23957C', '#3B6FD9', '#555'];
    const byTeam = S.teams.map(t => { let e = 0, sp = 0; p.stages.forEach(s => s.tasks.forEach(k => { if (k.teamId === t.id) { e += k.est; sp += spentOf(k); } })); return { t, e, sp }; });
    const byP = S.people.map(u => { let sp = 0, cnt = 0; p.stages.forEach(s => s.tasks.forEach(k => { if (k.assignee === u.id) { cnt++; sp += spentOf(k); } })); return { u, sp, cnt }; }).filter(x => x.cnt);
    body = `<div class="card" style="margin-bottom:14px"><h2>Where the ${days(total)} days went</h2><div class="stagebar">${segs.map(x => `<div style="flex:${x.d};background:${cols[p.stages.indexOf(x.s) % cols.length]}" title="${esc(x.s.name)}">${esc(x.s.name)} ${(x.d / DAY).toFixed(1)}d</div>`).join('')}</div>
      <p><b>${(wait / DAY).toFixed(1)} days</b> of approval time sat with the client across all deliverables. The rest was with the team.</p></div>
      <div class="grid2"><div class="card"><h2>Hours by team</h2><table><tr><th>Team</th><th>Spent</th><th>Estimated</th><th></th></tr>${byTeam.map(x => `<tr><td>${teamTag(x.t.id)}</td><td class="mono">${hrs(x.sp)}</td><td class="mono">${hrs(x.e)}</td><td>${bar(x.e ? x.sp / x.e * 100 : 0, x.sp > x.e ? 'over' : 'ok')}</td></tr>`).join('')}</table></div>
      <div class="card"><h2>Who worked on it</h2><table><tr><th>Person</th><th>Tasks</th><th>Hours</th></tr>${byP.map(x => `<tr><td>${esc(x.u.name)}</td><td>${x.cnt}</td><td class="mono">${hrs(x.sp)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">No one assigned yet</td></tr>'}</table></div></div>`;
  } else if (UI.tab === 'money') {
    const f = fin(p);
    body = `<div class="tiles"><div class="card tile"><b>${money(p.budget)}</b><span>quote · <button class="link" data-act="budget-edit">edit</button></span></div><div class="card tile"><b>${money(f.extras)}</b><span>approved extras</span></div><div class="card tile"><b>${money(f.cost)}</b><span>cost so far (${money(f.labour)} time + ${money(f.ext)} external)</span></div><div class="card tile"><b class="${f.mpct < 20 ? 'neg' : 'pos'}">${f.mpct}%</b><span>forecast margin · ${money(f.margin)}</span></div></div>
      <div class="grid2"><div class="card"><div class="row"><h2 style="margin:0">Change orders</h2><span class="sp"></span><button class="btn sm primary" data-act="order-new">+ New change order</button></div>${p.orders.map(o => orderHTML(p, o)).join('') || '<p class="empty">None. Raise one when work goes beyond the agreed scope.</p>'}</div>
      <div class="card"><div class="row"><h2 style="margin:0">External costs</h2><span class="sp"></span><button class="btn sm" data-act="cost-add">+ Add</button></div><table>${p.extCosts.map(x => `<tr><td>${esc(x.label)}</td><td class="mono" style="text-align:right">${money(x.amount)}</td></tr>`).join('') || '<tr><td class="muted">None logged</td></tr>'}</table></div></div>`;
  } else if (UI.tab === 'files') {
    const ap = p.stages.flatMap(s => s.items.filter(i => i.status === 'approved').map(i => ({ s, i })));
    body = `<div class="card"><h2>Approved and signed off</h2>${ap.length ? `<table><tr><th>File</th><th>Stage</th><th>Version</th><th>Approved by</th><th></th></tr>${ap.map(({ s, i }) => `<tr><td><span class="kind k-${i.kind}" style="display:inline-grid;margin-right:8px">${ICON[i.kind]}</span><b>${esc(i.name)}</b></td><td>${esc(s.name)}</td><td>v${i.versions.at(-1).n}</td><td>${esc(i.approvedBy)} · ${fd(i.decidedAt)}</td><td><button class="btn sm" data-act="open-item" data-iid="${i.id}">Open</button></td></tr>`).join('')}</table>` : '<p class="empty">Nothing approved yet.</p>'}</div>`;
  } else {
    body = `<div class="card" style="margin-bottom:14px"><h2>Change orders</h2><p class="muted" style="margin-top:-4px">Priced extras for work beyond the agreed scope. Nothing extra is billed without ${c ? 'your' : 'the client’s'} acceptance here.</p>${p.orders.map(o => orderHTML(p, o)).join('') || '<p class="empty">No change orders.</p>'}${c ? '' : '<button class="btn sm primary" data-act="order-new">+ New change order</button>'}</div>
      <div class="card"><div class="row"><h2 style="margin:0">Change requests</h2><span class="sp"></span>${c ? `<button class="btn primary" data-act="change-req">Request a change</button>` : ''}</div>
      ${p.changes.length ? `<table style="margin-top:10px"><tr><th>Requested</th><th>Change</th><th>Status</th><th></th></tr>${p.changes.slice().reverse().map(x => `<tr><td>${fd(x.t)}<br><small>${esc(x.who)}</small></td><td>${esc(x.text)}</td><td><span class="chip ${x.status === 'open' ? 'warn' : x.status === 'done' ? 'good' : 'acc'}">${{ open: 'New', doing: 'In progress', done: 'Done' }[x.status]}</span></td><td>${!c && x.status === 'open' ? `<button class="btn sm" data-act="order-new" data-cid="${x.id}">Quote it</button> <button class="btn sm" data-act="change-task" data-cid="${x.id}">Turn into task</button>` : ''}${!c && x.status !== 'done' ? ` <button class="btn sm" data-act="change-done" data-cid="${x.id}">Mark done</button>` : ''}</td></tr>`).join('')}</table>` : `<p class="empty">${c ? 'Spotted something after approval or once it is live? Ask for a change here and it goes straight to the team.' : 'No change requests from the client.'}</p>`}</div>`;
  }
  const tabs = c ? [['flow', 'Progress'], ['msgs', 'Messages'], ['changes', 'Changes and extras' + (oc ? ` (${oc})` : '')], ['files', 'Approved files'], ['log', 'Activity log']]
    : [['flow', 'Flow'], ['msgs', 'Messages'], ['log', 'Activity log'], ['time', 'Time'], ['money', 'Money'], ['changes', 'Changes' + (oc ? ` (${oc})` : '')], ['files', 'Approved']];
  return `<button class="back" data-act="nav" data-view="home">← All projects</button>
    <div class="phead"><div><h1>${esc(p.name)}</h1><div class="row" style="margin-top:8px;flex-wrap:wrap">${c ? '' : `<span class="muted">${esc(client(p.clientId).name)}</span>`}<span class="tag">${esc(p.type)}</span><span class="muted">${dueText(p)}</span>${ballChip(p)}${c ? '' : `<span class="chip ${h.cls}">${h.label}</span>`}${p.live ? `<a href="${esc(p.live.url)}" target="_blank" rel="noopener">View live</a>` : ''}</div></div>
    <div class="pct">${pct(p)}%<small>complete</small></div></div>
    ${stepper(p)}
    ${!c && fl.length ? `<div class="card" style="margin-bottom:14px"><h2>What is holding this up</h2>${fl.map(f => `<div class="flag" style="cursor:default"><i class="dot s${f.sev}"></i><div>${esc(f.text)}</div></div>`).join('')}</div>` : ''}
    <div class="tabs">${tabs.map(t => `<button class="${UI.tab === t[0] ? 'on' : ''}" data-act="tab" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>${body}`;
}

/* ---------- agency views ---------- */
function overview() {
  const ps = S.projects, active = ps.filter(p => !complete(p)), all = ps.flatMap(p => flags(p).map(f => ({ ...f, p }))).sort((a, b) => b.sev - a.sev);
  const tot = active.reduce((a, p) => { const f = fin(p); a.rev += f.rev; a.m += f.margin; return a; }, { rev: 0, m: 0 });
  return `<div class="head"><div><h1>Overview</h1><span class="muted">${esc(S.agency)} · every project, where it is, and who has the ball</span></div><span class="sp"></span><button class="btn primary" data-act="new-brief">+ New project</button></div>
    <div class="tiles"><div class="card tile"><b>${active.length}</b><span>projects in production</span></div><div class="card tile"><b>${ps.filter(p => ball(p).side === 'client').length}</b><span>waiting on a client</span></div><div class="card tile"><b>${all.filter(f => f.sev >= 2).length}</b><span>things lagging or at risk</span></div><div class="card tile"><b>${tot.rev ? Math.round(tot.m / tot.rev * 100) : 0}%</b><span>forecast margin on ${money(tot.rev)} in production</span></div></div>
    <div class="grid2"><div class="card"><h2>Projects</h2><table><tr><th>Project</th><th>Stage</th><th>Progress</th><th>Ball</th><th>Health</th><th>Margin</th><th>Due</th></tr>${ps.map(p => { const h = health(p), ci = curStage(p), f = fin(p); return `<tr class="click" data-act="open-project" data-pid="${p.id}"><td><b>${esc(p.name)}</b><br><small>${esc(client(p.clientId).name)} · ${esc(p.type)}</small></td><td>${p.stages[ci] ? esc(p.stages[ci].name) : 'Done'}</td><td><div class="row">${bar(pct(p), complete(p) ? 'ok' : '')}<span class="mono">${pct(p)}%</span></div></td><td>${ballChip(p)}</td><td><span class="chip ${h.cls}">${h.label}</span></td><td class="mono ${f.mpct < 20 ? 'neg' : ''}">${f.mpct}%</td><td>${fd(p.due)}</td></tr>`; }).join('')}</table></div>
    <div class="card"><h2>Where it is lagging</h2>${all.length ? all.map(f => `<div class="flag" data-act="open-project" data-pid="${f.p.id}"><i class="dot s${f.sev}"></i><div>${esc(f.text)}<small>${esc(f.p.name)}</small></div></div>`).join('') : '<p class="empty">Nothing is lagging.</p>'}</div></div>`;
}
function boardView() {
  const n = Date.now(), cards = { todo: [], doing: [], done: [] };
  S.projects.forEach(p => { if (complete(p)) return; const ci = curStage(p); p.stages.forEach((s, i) => s.tasks.forEach(k => { if (UI.team && k.teamId !== UI.team) return; if (k.status === 'done' ? i === ci : i <= ci + 1) cards[k.status].push({ p, s, k }); })); });
  const col = (st, title) => `<div class="kcol"><h2>${title}<span class="muted">${cards[st].length}</span></h2>${cards[st].map(({ p, s, k }) => `<div class="kcard ${st !== 'done' && k.due && k.due < n ? 'late' : ''}"><b>${esc(k.title)}</b><br><small>${esc(p.name)} · ${esc(s.name)}</small><div class="row">${teamTag(k.teamId)}<span class="muted">${k.assignee ? esc(person(k.assignee).name.split(' ')[0]) : 'No owner'}${k.due ? ' · ' + fd(k.due) : ''}</span></div><div class="row"><span class="mono muted">${hrs(spentOf(k))} / ${hrs(k.est)}</span>${st === 'done' ? '' : `<button class="btn sm" data-act="task-status" data-pid="${p.id}" data-tid="${k.id}">${st === 'todo' ? 'Start →' : 'Done →'}</button>`}</div></div>`).join('') || '<p class="empty">Empty</p>'}</div>`;
  return `<div class="head"><div><h1>Board</h1><span class="muted">Every live task across all projects, current stage and the one after</span></div><span class="sp"></span><select data-change="set-team"><option value="">All teams</option>${S.teams.map(t => `<option value="${t.id}" ${UI.team === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
    <div class="kan">${col('todo', 'To do')}${col('doing', 'In progress')}${col('done', 'Done in current stages')}</div>`;
}
function teamView() {
  const n = Date.now(), start = new Date(n); start.setHours(0, 0, 0, 0); const t0 = start.getTime(), W = 14 * DAY;
  const rows = S.people.map(u => {
    const l = loadOf(u); let de = 0, ds = 0; allTasks(k => { if (k.assignee === u.id && k.status === 'done') { de += k.est; ds += k.spent; } });
    return { u, l, eff: de ? ds / de : null };
  });
  return `<div class="head"><div><h1>Team and schedule</h1><span class="muted">Who is on what, how loaded they are this week, and how their estimates hold up</span></div></div>
    <div class="card" style="margin-bottom:16px"><table><tr><th>Person</th><th>Team</th><th>Next 7 days (of ${CAP}h)</th><th>Open tasks</th><th>Actual vs estimate</th><th>Working on now</th></tr>${rows.map(({ u, l, eff }) => { const now = l.list.filter(x => x.k.status === 'doing'); return `<tr><td><b>${esc(u.name)}</b></td><td>${teamTag(u.teamId)}</td><td><div class="row">${bar(l.h / CAP * 100, l.h > CAP ? 'over' : 'ok')}<span class="mono">${hrs(l.h)}</span>${l.h > CAP ? '<span class="chip bad">Overbooked</span>' : l.h < 5 ? '<span class="chip">Has room</span>' : ''}</div></td><td>${l.list.length}</td><td>${eff == null ? '—' : `<span class="chip ${eff > 1.15 ? 'warn' : 'good'}">${Math.round(eff * 100)}% of estimate</span>`}</td><td>${now.map(x => `${esc(x.k.title)} <small>· ${esc(x.p.name)}</small>`).join('<br>') || '<span class="muted">—</span>'}</td></tr>`; }).join('')}</table></div>
    <div class="card sched"><h2>Next two weeks</h2><div class="days"><span></span>${Array.from({ length: 14 }, (_, i) => { const d = new Date(t0 + i * DAY); return `<span>${d.toLocaleDateString('en-GB', { weekday: 'narrow' })}<br>${d.getDate()}</span>`; }).join('')}</div>
      ${rows.map(({ u, l }) => { const bars = l.list.map(x => { const s = x.k.start || (x.k.due ? x.k.due - DAY : t0), e = Math.max(x.k.due || s + DAY, s + DAY / 2); return { x, s: Math.max(s, t0), e: Math.min(e + DAY / 2, t0 + W) }; }).filter(b => b.e > b.s);
        return `<div class="srow"><div><b>${esc(u.name.split(' ')[0])}</b><br><small>${esc(team(u.teamId).name)}</small></div><div class="lane" style="height:${Math.max(1, bars.length) * 23 + 4}px">${bars.map((b, i) => `<div class="sbar" title="${esc(b.x.k.title + ' — ' + b.x.p.name)}" style="--c:${team(b.x.k.teamId).color};top:${i * 23 + 2}px;left:${(b.s - t0) / W * 100}%;width:${Math.max(4, (b.e - b.s) / W * 100)}%">${esc(b.x.k.title)} · ${esc(b.x.p.name)}</div>`).join('')}</div></div>`; }).join('')}</div>`;
}
function myWork() {
  const me = person(UI.user), l = loadOf(me), n = Date.now(), grabs = [];
  S.projects.forEach(p => { const ci = curStage(p); p.stages.forEach((s, i) => { if (i <= ci + 1) s.tasks.forEach(k => { if (!k.assignee && k.status !== 'done' && k.teamId === me.teamId) grabs.push({ p, s, k }); }); }); });
  const row = ({ p, s, k }, mine) => `<tr class="${k.due && k.due < n ? 'late' : ''}"><td><b>${esc(k.title)}</b><br><small>${esc(p.name)} · ${esc(s.name)}</small></td><td>${k.due ? fd(k.due) : '—'}</td><td class="mono">${hrs(spentOf(k))} / ${hrs(k.est)}</td><td class="row" style="justify-content:flex-end">${mine ? `<button class="btn sm ${k.timer ? 'acc' : ''}" data-act="timer" data-pid="${p.id}" data-tid="${k.id}">${k.timer ? 'Stop timer' : 'Start timer'}</button><button class="btn sm" data-act="task-log" data-pid="${p.id}" data-tid="${k.id}">Log time</button><button class="btn sm ok" data-act="task-done" data-pid="${p.id}" data-tid="${k.id}">Done</button>` : `<button class="btn sm primary" data-act="pick" data-pid="${p.id}" data-tid="${k.id}">Pick up</button>`}</td></tr>`;
  const tbl = (list, mine, empty) => list.length ? `<table><tr><th>Task</th><th>Due</th><th>Spent / est.</th><th></th></tr>${list.map(x => row(x, mine)).join('')}</table>` : `<p class="empty">${empty}</p>`;
  return `<div class="head"><div><h1>My work</h1><span class="muted">${esc(me.name)} · ${esc(team(me.teamId).name)} · ${hrs(l.h)} booked in the next 7 days</span></div></div>
    <div class="card" style="margin-bottom:14px"><h2>In progress</h2>${tbl(l.list.filter(x => x.k.status === 'doing'), true, 'Nothing running. Start a timer on a task below.')}</div>
    <div class="card" style="margin-bottom:14px"><h2>Up next</h2>${tbl(l.list.filter(x => x.k.status === 'todo'), true, 'Nothing queued.')}</div>
    <div class="card"><h2>Up for grabs in ${esc(team(me.teamId).name)}</h2>${tbl(grabs, false, 'No unowned tasks for your team.')}</div>`;
}
function clientsView() {
  return `<div class="head"><div><h1>Clients</h1><span class="muted">How each client behaves: how fast they approve, how much they revise, and what they are worth</span></div></div>
    <div class="card"><table><tr><th>Client</th><th>Projects</th><th>Avg. time to approve</th><th>Avg. revision rounds</th><th>Open decisions</th><th>Quoted</th><th>Forecast margin</th></tr>${S.clients.map(c => {
      const ps = S.projects.filter(p => p.clientId === c.id), its = ps.flatMap(p => p.stages.flatMap(s => s.items)), dec = its.filter(i => i.decidedAt), w = dec.reduce((a, i) => a + (i.waitMs || 0), 0), sent = its.filter(i => i.versions.some(v => v.sent && v.side !== 'client'));
      const f = ps.reduce((a, p) => { const x = fin(p); a.rev += x.rev; a.m += x.margin; return a; }, { rev: 0, m: 0 }), av = dec.length ? w / dec.length / DAY : 0, rr = sent.length ? sent.reduce((a, i) => a + i.rounds, 0) / sent.length : 0;
      return `<tr><td><b>${esc(c.name)}</b><br><small>${esc(c.contact)}</small></td><td>${ps.filter(p => !complete(p)).length} active · ${ps.length} total</td><td><span class="chip ${av > 1.5 ? 'warn' : 'good'}">${dec.length ? av.toFixed(1) + ' days' : '—'}</span></td><td><span class="chip ${rr > 1 ? 'warn' : 'good'}">${rr.toFixed(1)}</span></td><td>${ps.reduce((a, p) => a + reviewItems(p).length + openOrders(p).length, 0)}</td><td class="mono">${money(f.rev)}</td><td class="mono ${f.rev && f.m / f.rev < .2 ? 'neg' : ''}">${f.rev ? Math.round(f.m / f.rev * 100) + '%' : '—'}</td></tr>`; }).join('')}</table></div>`;
}
function kitView() {
  const cf = kitConflicts(), bk = S.projects.filter(p => p.shoot).sort((a, b) => a.shoot.date - b.shoot.date);
  return `<div class="head"><div><h1>Shoots and kit</h1><span class="muted">Every shoot day and what is booked on it, with clashes flagged</span></div></div>
    ${cf.map(c => `<div class="card" style="border-color:var(--bad);margin-bottom:10px"><b>Clash on ${fd(c.date)}:</b> ${esc(c.kit.join(', '))} is booked for both ${esc(c.a.name)} and ${esc(c.b.name)}.</div>`).join('')}
    <div class="card"><table><tr><th>Date</th><th>Project</th><th>Kit</th><th></th></tr>${bk.map(p => `<tr><td><b>${fd(p.shoot.date)}</b></td><td>${esc(p.name)}<br><small>${esc(client(p.clientId).name)}</small></td><td>${p.shoot.kit.map(k => `<span class="tag ${cf.some(c => (c.a === p || c.b === p) && c.kit.includes(k)) ? 'bad' : ''}">${esc(k)}</span>`).join(' ')}</td><td><button class="btn sm" data-act="shoot-edit" data-pid="${p.id}">Edit</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">No shoots booked.</td></tr>'}</table>
    <p class="muted" style="margin:12px 0 0">Kit on the shelf: ${esc(S.kit.join(' · '))}</p></div>`;
}

/* ---------- client home ---------- */
function clientHome() {
  const c = client(UI.user), ps = myProjects(), need = ps.flatMap(p => reviewItems(p).map(it => ({ p, it }))), oo = ps.flatMap(p => openOrders(p).map(o => ({ p, o })));
  return `<div class="head"><div><h1>Hello ${esc(c.contact.split(' ')[0])}</h1><span class="muted">${esc(c.name)} · your projects with ${esc(S.agency)}</span></div><span class="sp"></span><button class="btn primary" data-act="new-brief">+ Submit a new brief</button></div>
    ${need.length || oo.length ? `<div class="card need"><h2>Waiting on you</h2>${need.map(({ p, it }) => `<div class="row"><b>${esc(it.name)}</b><span class="muted">${esc(p.name)} · sent ${fd(it.sentAt)}</span><span class="sp"></span><button class="btn sm primary" data-act="open-item" data-pid="${p.id}" data-iid="${it.id}">Review</button></div>`).join('')}${oo.map(({ p, o }) => orderHTML(p, o)).join('')}</div>` : `<div class="card" style="margin-bottom:16px"><b>You are all caught up.</b> <span class="muted">Nothing is waiting on you right now.</span></div>`}
    <div class="pcards">${ps.map(p => { const ci = curStage(p); return `<div class="card pcard" data-act="open-project" data-pid="${p.id}"><div class="ring" style="--p:${pct(p)}"><b>${pct(p)}%</b></div><div><b>${esc(p.name)}</b><br><small>${p.stages[ci] ? 'Now in ' + esc(p.stages[ci].name) : p.live ? 'Live since ' + fd(p.live.t) : 'Complete'} · ${dueText(p)}</small><div style="margin-top:8px">${ballChip(p)}</div></div></div>`; }).join('') || '<p class="empty">No projects yet. Submit a brief to start one.</p>'}</div>`;
}

/* ---------- shell ---------- */
function ask(title, fields, onOk, okLabel = 'Save') { modal = { title, fields, onOk, okLabel }; render(); const f = $('.modal [name]'); if (f) f.focus(); }
function modalHTML() {
  if (!modal) return '';
  return `<div class="scrim"><form class="modal" data-form="modal"><h3>${esc(modal.title)}</h3>${modal.fields.map(f => `<label>${esc(f.label)}${f.type === 'textarea' ? `<textarea name="${f.name}" rows="${f.rows || 7}" ${f.req ? 'required' : ''}>${esc(f.value || '')}</textarea>` : f.type === 'select' ? `<select name="${f.name}">${f.options.map(o => `<option value="${esc(o[0])}" ${o[0] == f.value ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>` : `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" ${f.req ? 'required' : ''} ${f.type === 'number' ? 'step="any" min="0"' : ''}>`}</label>`).join('')}<div class="row end"><button type="button" class="btn ghost" data-act="close-modal">Cancel</button><button class="btn primary">${esc(modal.okLabel)}</button></div></form></div>`;
}
function bellHTML() {
  const u = updates(), nw = u.filter(e => e.t > UI.seen).length;
  return `<div class="bellwrap"><button class="btn bell" data-act="bell">Updates${nw ? `<b>${nw}</b>` : ''}</button>${bell ? `<div class="drop">${u.slice(0, 14).map(e => `<button class="n ${e.t > UI.seen ? 'new' : ''}" data-act="open-project" data-pid="${e.p.id}"><b>${esc(e.who)}</b> ${esc(e.text)}<small>${esc(e.p.name)} · ${fdt(e.t)}</small></button>`).join('') || '<p class="empty">No updates yet.</p>'}</div>` : ''}</div>`;
}
function signIn() {
  const c = isClient(), accts = c ? S.clients.map(x => [x.id, x.contact, x.name]) : S.people.map(x => [x.id, x.name, team(x.teamId).name]);
  return `<div class="signin"><div class="logo dark"><i></i>Slate</div><h1>${c ? 'Client portal' : 'Agency workspace'}</h1><p class="muted">${c ? `Sign in to follow your projects with ${esc(S.agency)}.` : `${esc(S.agency)} — production, team, money and clients.`}</p>
    <div class="card">${accts.map(a => `<button class="acct" data-act="signin" data-id="${a[0]}"><b>${esc(a[1])}</b><small>${esc(a[2])}</small></button>`).join('')}</div>
    <small>Demo accounts, no password in this prototype. <a href="${c ? 'agency' : 'client'}.html">Go to the ${c ? 'agency' : 'client'} side</a> · <a href="index.html">Home</a></small></div>`;
}
function render() {
  const c = isClient();
  if (!UI.user || !(c ? client(UI.user) : person(UI.user))) { $('#app').innerHTML = signIn(); return; }
  let p = UI.pid && P(UI.pid);
  if (c && p && p.clientId !== UI.user) p = null;
  if (UI.view === 'project' && !p) UI.view = 'home';
  let main;
  if (UI.view === 'project') main = projectView(p);
  else if (c) main = clientHome();
  else main = ({ board: boardView, team: teamView, mywork: myWork, clients: clientsView, kit: kitView })[UI.view]?.() || overview();
  const who = `<span class="who">${esc(actor().who)}</span><button class="btn sm ghost" data-act="signout">Sign out</button>`;
  if (c) {
    $('#app').innerHTML = `<header class="ctop"><div class="brand"><i></i><div><b>${esc(S.agency)}</b><small>Client portal · ${esc(client(UI.user).name)}</small></div></div><button class="nav on" data-act="nav" data-view="home">My projects</button><span class="sp"></span>${bellHTML()}${who}</header><main class="cmain">${main}</main>${modalHTML()}`;
  } else {
    const nFlags = S.projects.reduce((a, x) => a + flags(x).filter(f => f.sev >= 2).length, 0), cur = UI.view === 'project' ? 'home' : UI.view;
    const nav = [['home', 'Overview', nFlags], ['board', 'Board'], ['mywork', 'My work'], ['team', 'Team and schedule'], ['clients', 'Clients'], ['kit', 'Shoots and kit', kitConflicts().length]];
    $('#app').innerHTML = `<aside class="side"><div class="logo"><i></i>Slate</div>${nav.map(n => `<button class="nav ${cur === n[0] ? 'on' : ''}" data-act="nav" data-view="${n[0]}">${n[1]}${n[2] ? `<b>${n[2]}</b>` : ''}</button>`).join('')}<div class="foot">Demo data, saved in this browser.<br><button data-act="reset">Reset demo</button> · <a href="client.html" target="_blank" style="color:#8A877F">Open client side</a></div></aside>
      <div class="top"><b>${esc(S.agency)}</b><span class="muted">Agency workspace</span><span class="sp"></span>${bellHTML()}${who}</div><main>${main}</main>${modalHTML()}`;
  }
}
const commit = () => { sync(); save(); saveUI(); render(); };

/* ---------- actions ---------- */
function act(a, d) {
  const p = P(d.pid || UI.pid), it = p && d.iid && findItem(p, d.iid), k = p && d.tid && findTask(p, d.tid);
  const go = (view, pid) => { UI.view = view; UI.pid = pid || null; UI.open = null; UI.diff = false; bell = false; window.scrollTo(0, 0); };
  switch (a) {
    case 'close-modal': modal = null; if (stale) { stale = false; S = load(KEY) || S; } break;
    case 'reset': S = seed(); UI.seen = Date.now() - 2 * DAY; go('home'); break;
    case 'signin': UI.user = d.id; go('home'); break;
    case 'signout': UI.user = null; go('home'); break;
    case 'bell': bell = !bell; if (!bell) UI.seen = Date.now(); break;
    case 'nav': go(d.view); break;
    case 'set-team': UI.team = d.value; break;
    case 'open-project': if (bell) UI.seen = Date.now(); go('project', d.pid); UI.tab = 'flow'; break;
    case 'open-item': go('project', p.id); UI.tab = 'flow'; UI.open = d.iid; break;
    case 'tab': UI.tab = d.tab; break;
    case 'toggle-item': UI.open = UI.open === d.iid ? null : d.iid; UI.diff = false; break;
    case 'toggle-detail': UI.detail = !UI.detail; break;
    case 'toggle-diff': UI.diff = !UI.diff; break;
    case 'seek': tcs[d.iid] = +d.tc; break;

    case 'item-edit': {
      const last = it.versions.at(-1), vid = it.kind === 'video';
      const hint = { board: 'One tile per line: caption | #colour or image link', list: 'One row per line, columns split with | — the first line is the header' }[it.kind];
      return ask(`${it.name} — new version`, [
        ...(vid ? [{ name: 'url', label: 'Video link (mp4 or hosted file)', value: last?.url || '' }, { name: 'dur', label: 'Length in seconds', type: 'number', value: it.dur }] : [{ name: 'body', label: hint || 'Content', type: 'textarea', rows: 10, value: last?.body ?? DEFAULT[it.name] ?? '', req: true }]),
        { name: 'note', label: 'What changed in this version', value: last ? '' : 'First version', req: true }],
        v => { const n = it.versions.length + 1; it.versions.push({ n, t: Date.now(), by: actor().who, side: 'agency', note: v.note, body: v.body || '', url: v.url || '', sent: false }); if (vid && +v.dur) it.dur = +v.dur; if (it.status === 'approved') { log(p, `Reopened ${it.name} after approval`); it.status = 'draft'; } log(p, `Uploaded ${it.name} v${n} — ${v.note}`, 'internal'); }, 'Save version');
    }
    case 'item-send': { const v = it.versions.at(-1); it.versions.forEach(x => x.sent = true); it.status = 'review'; it.sentAt = Date.now(); log(p, `Sent ${it.name} v${v.n} for approval`); break; }
    case 'nudge': log(p, `Sent a reminder: ${it.name} is waiting for your approval`); break;
    case 'item-approve': { const v = it.versions.at(-1); it.waitMs += Date.now() - it.sentAt; it.status = 'approved'; it.decidedAt = Date.now(); it.approvedBy = actor().who; log(p, `Approved ${it.name} v${v.n}`); break; }
    case 'item-changes': {
      const v = it.versions.at(-1);
      return ask(`Request changes — ${it.name} v${v.n}`, [{ name: 'text', label: 'What should change?', type: 'textarea', rows: 4, req: true }], x => { it.waitMs += Date.now() - it.sentAt; it.rounds++; it.status = 'changes'; it.decidedAt = Date.now(); it.comments.push({ t: Date.now(), ...actor(), v: v.n, text: x.text, tc: it.kind === 'video' && tcs[it.id] ? tcs[it.id] : null }); log(p, `Requested changes on ${it.name} v${v.n} (round ${it.rounds}): "${x.text}"`); }, 'Send to the team');
    }
    case 'comment': { const vs = isClient() ? it.versions.filter(v => v.sent) : it.versions; it.comments.push({ t: Date.now(), ...actor(), v: vs.at(-1).n, text: d.text, tc: it.kind === 'video' ? (tcs[it.id] || 0) : null }); log(p, `Commented on ${it.name}${it.kind === 'video' ? ' at ' + tc(tcs[it.id] || 0) : ''}: "${d.text}"`); break; }
    case 'msg': { const internal = !isClient() && d.internal === 'on'; p.msgs.push({ t: Date.now(), ...actor(), text: d.text, internal }); log(p, internal ? `Internal note: "${d.text}"` : `Message: "${d.text}"`, internal ? 'internal' : 'all'); break; }

    case 'task-add': {
      const s = p.stages.find(x => x.id === d.sid);
      return ask(`Add task — ${s.name}`, [{ name: 'title', label: 'Task', req: true }, { name: 'teamId', label: 'Team', type: 'select', options: S.teams.map(t => [t.id, t.name]), value: person(UI.user).teamId }, { name: 'est', label: 'Estimate (hours)', type: 'number', value: 2 }, { name: 'due', label: 'Due', type: 'date' }],
        v => { s.tasks.push(mkTask(v.title, v.teamId, v.est, fromIso(v.due))); log(p, `Added task "${v.title}" to ${s.name}`, 'internal'); }, 'Add task');
    }
    case 'task-edit': return ask(k.title, [{ name: 'start', label: 'Working on it from', type: 'date', value: k.start ? iso(k.start) : '' }, { name: 'due', label: 'Due', type: 'date', value: k.due ? iso(k.due) : '' }, { name: 'est', label: 'Estimate (hours)', type: 'number', value: k.est }], v => { k.start = fromIso(v.start); k.due = fromIso(v.due); k.est = +v.est || k.est; });
    case 'task-assign': k.assignee = d.value || null; log(p, d.value ? `Assigned "${k.title}" to ${person(d.value).name}` : `Unassigned "${k.title}"`, 'internal'); break;
    case 'task-status': setStatus(p, k, { todo: 'doing', doing: 'done', done: 'todo' }[k.status]); break;
    case 'task-done': setStatus(p, k, 'done'); break;
    case 'task-vis': k.clientVisible = !k.clientVisible; break;
    case 'task-log': return ask(`Log time — ${k.title}`, [{ name: 'h', label: 'Hours to add', type: 'number', value: 1, req: true }], v => { k.spent = Math.round((k.spent + (+v.h || 0)) * 100) / 100; if (k.status === 'todo') setStatus(p, k, 'doing'); log(p, `Logged ${hrs(+v.h || 0)} on "${k.title}"`, 'internal'); }, 'Log time');
    case 'timer': if (k.timer) { const h = (Date.now() - k.timer) / H; k.spent = Math.round((k.spent + h) * 100) / 100; k.timer = null; log(p, `Stopped timer on "${k.title}" (${hrs(h)})`, 'internal'); } else { k.timer = Date.now(); if (k.status !== 'doing') setStatus(p, k, 'doing'); } break;
    case 'pick': return ask(`Pick up — ${k.title}`, [{ name: 'start', label: 'I will work on it from', type: 'date', value: iso(Date.now()), req: true }, { name: 'due', label: 'I will have it done by', type: 'date', value: iso(Date.now() + 2 * DAY), req: true }], v => { k.assignee = UI.user; k.start = fromIso(v.start); k.due = fromIso(v.due); log(p, `${person(UI.user).name} picked up "${k.title}" for ${fd(k.start)}–${fd(k.due)}`, 'internal'); }, 'Pick up');

    case 'new-brief': {
      const c = isClient();
      return ask(c ? 'Submit a new brief' : 'New project', [...(c ? [] : [{ name: 'clientId', label: 'Client', type: 'select', options: S.clients.map(x => [x.id, x.name]) }]), { name: 'name', label: 'Project name', req: true }, { name: 'type', label: 'Type of production (sets the stages and tasks)', type: 'select', options: TYPES.map(t => [t, t]) }, { name: 'brief', label: 'The brief — what is needed, who it is for, tone, must-haves', type: 'textarea', req: true }, { name: 'due', label: 'Needed by', type: 'date', value: iso(Date.now() + 28 * DAY), req: true }, ...(c ? [] : [{ name: 'budget', label: 'Quote (LKR)', type: 'number', value: 500000 }])],
        v => { const np = newProject({ clientId: c ? UI.user : v.clientId, name: v.name, type: v.type, due: fromIso(v.due), budget: v.budget }); const who = actor(); np.stages[0].items[0].versions.push({ n: 1, t: Date.now(), by: who.who, side: who.side, note: 'Brief as submitted', body: v.brief, sent: true }); np.log.push({ t: Date.now(), ...who, text: c ? 'Submitted the brief' : 'Logged the brief on behalf of the client', vis: 'all' }); S.projects.unshift(np); UI.view = 'project'; UI.pid = np.id; UI.tab = 'flow'; UI.open = np.stages[0].items[0].id; }, c ? 'Submit brief' : 'Create project');
    }
    case 'budget-edit': return ask('Quote', [{ name: 'b', label: 'Quoted amount (LKR)', type: 'number', value: p.budget }], v => { p.budget = +v.b || 0; log(p, `Quote set to ${money(p.budget)}`, 'internal'); });
    case 'cost-add': return ask('External cost', [{ name: 'label', label: 'What for', req: true }, { name: 'amount', label: 'Amount (LKR)', type: 'number', req: true }], v => { p.extCosts.push({ label: v.label, amount: +v.amount || 0 }); log(p, `Logged external cost: ${v.label} ${money(+v.amount || 0)}`, 'internal'); }, 'Add cost');
    case 'order-new': {
      const ch = d.cid && p.changes.find(x => x.id === d.cid);
      return ask('Change order', [{ name: 'title', label: 'What it covers', value: it ? `Extra revision round — ${it.name}` : ch ? ch.text.slice(0, 70) : '', req: true }, { name: 'why', label: 'Why it is outside scope', value: it ? `${it.name} is on round ${it.rounds}; ${p.includedRounds + (it.extra || 0)} are included.` : ch ? 'Requested after final approval.' : '' }, { name: 'amount', label: 'Price (LKR)', type: 'number', value: 25000, req: true }, { name: 'days', label: 'Extra days on the delivery date', type: 'number', value: 1 }],
        v => { p.orders.push({ id: uid(), t: Date.now(), by: actor().who, title: v.title, why: v.why, amount: +v.amount || 0, days: Math.round(+v.days || 0), status: 'sent', iid: it ? it.id : null, cid: ch ? ch.id : null }); log(p, `Sent change order "${v.title}" (${money(+v.amount || 0)}${+v.days ? ', +' + Math.round(+v.days) + ' day(s)' : ''})`); }, 'Send to client');
    }
    case 'order-accept': case 'order-decline': {
      const o = p.orders.find(x => x.id === d.oid), ok = a === 'order-accept';
      o.status = ok ? 'accepted' : 'declined'; o.decidedBy = actor().who; o.decidedAt = Date.now();
      if (ok) { if (o.days) p.due += o.days * DAY; const oi = o.iid && findItem(p, o.iid); if (oi) oi.extra = (oi.extra || 0) + 1; }
      log(p, `${ok ? 'Accepted' : 'Declined'} change order "${o.title}" (${money(o.amount)})`); break;
    }
    case 'change-req': return ask('Request a change', [{ name: 'text', label: 'What would you like changed?', type: 'textarea', rows: 4, req: true }], v => { p.changes.push({ id: uid(), t: Date.now(), who: actor().who, text: v.text, status: 'open' }); log(p, `Requested a change: "${v.text}"`); }, 'Send request');
    case 'change-task': {
      const ch = p.changes.find(x => x.id === d.cid);
      return ask('Turn change into a task', [{ name: 'title', label: 'Task', value: ch.text.slice(0, 70), req: true }, { name: 'teamId', label: 'Team', type: 'select', options: S.teams.map(t => [t.id, t.name]), value: 'post' }, { name: 'est', label: 'Estimate (hours)', type: 'number', value: 2 }, { name: 'due', label: 'Due', type: 'date', value: iso(Date.now() + 2 * DAY) }],
        v => { let s = p.stages.find(x => x.key === 'changes'); if (!s) { s = { id: uid(), key: 'changes', name: 'Live changes', doneAt: null, items: [], tasks: [] }; p.stages.push(s); } const t = mkTask(v.title, v.teamId, v.est, fromIso(v.due)); t.changeId = ch.id; s.tasks.push(t); ch.status = 'doing'; log(p, `Picked up change request: "${v.title}"`); }, 'Create task');
    }
    case 'change-done': { const ch = p.changes.find(x => x.id === d.cid); ch.status = 'done'; log(p, `Completed change: "${ch.text.slice(0, 70)}"`); break; }
    case 'go-live': return ask('Mark as live', [{ name: 'url', label: 'Where is it live? (link)', value: 'https://' }], v => { p.live = { t: Date.now(), url: v.url }; log(p, 'Marked the project as live'); }, 'Mark live');
    case 'shoot-edit': return ask(`Shoot booking — ${p.name}`, [{ name: 'date', label: 'Shoot date', type: 'date', value: iso(p.shoot?.date || Date.now() + 7 * DAY), req: true }, { name: 'kit', label: `Kit, comma separated (${S.kit.join(', ')})`, type: 'textarea', rows: 3, value: (p.shoot?.kit || []).join(', ') }], v => { p.shoot = { date: fromIso(v.date), kit: v.kit.split(',').map(x => x.trim()).filter(Boolean) }; log(p, `Shoot booked for ${fd(p.shoot.date)}: ${p.shoot.kit.join(', ')}`, 'internal'); });
  }
  commit();
}
function setStatus(p, k, st) {
  if (k.timer && st !== 'doing') { k.spent = Math.round((k.spent + (Date.now() - k.timer) / H) * 100) / 100; k.timer = null; }
  k.status = st; if (st === 'doing' && !k.start) k.start = Date.now();
  if (st === 'done' && k.changeId) { const ch = p.changes.find(x => x.id === k.changeId); if (ch) ch.status = 'done'; }
  log(p, `${{ doing: 'Started', done: 'Finished', todo: 'Reopened' }[st]}: ${k.title}`, k.clientVisible ? 'all' : 'internal');
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  if (e.target.classList.contains('scrim')) return act('close-modal', {});
  if (e.target.closest('a')) return;
  const el = e.target.closest('[data-act]'); if (!el) return;
  act(el.dataset.act, { ...el.dataset });
});
document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el) act(el.dataset.change, { ...el.dataset, value: el.value }); });
document.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, v = Object.fromEntries(new FormData(f));
  if (f.dataset.form === 'modal') { const m = modal; modal = null; stale = false; m.onOk(v); commit(); }
  else act(f.dataset.form, { ...f.dataset, ...v });
});
document.addEventListener('input', e => {
  if (!e.target.matches('.scrub')) return; const id = e.target.dataset.item; tcs[id] = +e.target.value;
  const l = $('#tc-' + id); if (l) l.textContent = tc(tcs[id]); const v = $(`video[data-item="${id}"]`); if (v) v.currentTime = tcs[id];
});
document.addEventListener('timeupdate', e => { const v = e.target; if (!v.dataset || !v.dataset.item) return; tcs[v.dataset.item] = v.currentTime; const l = $('#tc-' + v.dataset.item); if (l) l.textContent = tc(v.currentTime); }, true);
// live sync: the other side (another tab or window) changed the shared data
window.addEventListener('storage', e => {
  if (e.key !== KEY || !e.newValue) return;
  if (modal) { stale = true; return; }
  S = load(KEY) || S;
  const a = document.activeElement; if (a && /INPUT|TEXTAREA/.test(a.tagName) && a.value) return;
  render();
});

render();
})();
