/* Shared icons, data, and small primitives. Loads BEFORE other component files. */

/* ───────── Icons (16px stroke) ───────── */
const Ico = {
  search:    (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><circle cx="7" cy="7" r="5"/><path d="m11 11 3.5 3.5"/></svg>,
  bell:      (p={}) => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3.5 11h9l-1-1.5V6.5a3.5 3.5 0 0 0-7 0V9.5L3.5 11z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>,
  plus:      (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M8 3v10M3 8h10"/></svg>,
  filter:    (p={}) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M2 4h12M4 8h8M6 12h4"/></svg>,
  sort:      (p={}) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 3v10M2 11l2 2 2-2M12 13V3M10 5l2-2 2 2"/></svg>,
  chevDown:  (p={}) => <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M3 5l3 3 3-3"/></svg>,
  chevRight: (p={}) => <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M5 3l3 3-3 3"/></svg>,
  list:      (p={}) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M2 4h12M2 8h12M2 12h12"/></svg>,
  board:     (p={}) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...p}><rect x="2" y="2" width="4" height="12" rx="0.5"/><rect x="10" y="2" width="4" height="8" rx="0.5"/></svg>,
  home:      (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><path d="M2.5 7.5 8 3l5.5 4.5V13a.5.5 0 0 1-.5.5h-3v-4h-4v4h-3a.5.5 0 0 1-.5-.5V7.5z"/></svg>,
  folder:    (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><path d="M2 4.5A.5.5 0 0 1 2.5 4H6l1.5 1.5h6a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V4.5z"/></svg>,
  check:     (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 8l3 3 7-7"/></svg>,
  users:     (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" {...p}><circle cx="6" cy="6" r="2.5"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4M11 4a2.5 2.5 0 0 1 0 5M14 13c0-1.6-1-3-2.5-3.6"/></svg>,
  settings:  (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M3 3l1.5 1.5M11.5 11.5 13 13M1 8h2M13 8h2M3 13l1.5-1.5M11.5 4.5 13 3"/></svg>,
  inbox:     (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><path d="M2 9.5V13a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V9.5M2 9.5l1.5-6A.5.5 0 0 1 4 3h8a.5.5 0 0 1 .5.4L14 9.5M2 9.5h3.5l1 1.5h3l1-1.5H14"/></svg>,
  cal:       (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><rect x="2" y="3.5" width="12" height="10.5" rx="1"/><path d="M2 6.5h12M5 2v3M11 2v3"/></svg>,
  close:     (p={}) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M3 3l10 10M13 3 3 13"/></svg>,
  more:      (p={}) => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" {...p}><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>,
  arrowR:    (p={}) => <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2.5 6h7M6.5 3l3 3-3 3"/></svg>,
  flag:      (p={}) => <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...p}><path d="M3.5 14V3M3.5 3l8 1.5L10 7l1.5 2.5-8 1.5"/></svg>,
  trend:     (p={}) => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12l4-4 3 3 5-6M9 5h4v4"/></svg>,
  shield:    (p={}) => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" {...p}><path d="M8 1.5 13 3v5.5c0 3-2.2 5-5 6-2.8-1-5-3-5-6V3l5-1.5z"/></svg>,
};

/* ───────── Avatars ───────── */
const AVATAR_COLORS = ['#b5462a','#5c7a5a','#3a4978','#a83a2c','#b48a2c','#7a5d8c','#2f6066','#9a4760'];
function avColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}
function Avatar({ name, size }) {
  const cls = size === 'xs' ? 'av av-xs' : size === 'lg' ? 'av av-lg' : size === 'xl' ? 'av av-xl' : 'av';
  return <div className={cls} style={{ background: avColor(name) }} title={name}>{initials(name)}</div>;
}
function AvStack({ names, size, max = 4 }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="av-stack">
      {shown.map((n, i) => <Avatar key={n+i} name={n} size={size} />)}
      {rest > 0 && (
        <div className={size === 'xs' ? 'av av-xs' : 'av'} style={{ background: 'var(--bg-sunk)', color: 'var(--ink-2)' }}>+{rest}</div>
      )}
    </div>
  );
}

/* ───────── Status & priority pills ───────── */
const STATUS_META = {
  todo:        { label: 'To Do',       cls: 'pill-todo',  dot: '#a59b85' },
  prog:        { label: 'In Progress', cls: 'pill-prog',  dot: '#b48a2c' },
  in_progress: { label: 'In Progress', cls: 'pill-prog',  dot: '#b48a2c' },
  rev:         { label: 'In Review',   cls: 'pill-rev',   dot: '#3a4978' },
  review:      { label: 'In Review',   cls: 'pill-rev',   dot: '#3a4978' },
  done:        { label: 'Done',        cls: 'pill-done',  dot: '#5c7a5a' },
  block:       { label: 'Blocked',     cls: 'pill-block', dot: '#a83a2c' },
};
function StatusPill({ status }) {
  const m = STATUS_META[status] || { label: status || '—', cls: 'pill-todo', dot: '#a59b85' };
  return (
    <span className={`pill ${m.cls}`}>
      <span className="pill-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}
const PRIO_LABEL = { p0: 'P0 · Urgent', p1: 'P1 · High', p2: 'P2 · Medium', p3: 'P3 · Low' };
function PrioBadge({ p }) {
  return <span className={`prio prio-${p}`}>{p.toUpperCase()}</span>;
}

/* ───────── Date helpers ───────── */
const TODAY = new Date(2026, 3, 30); // April 30, 2026
function dateLabel(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const ms = d - TODAY;
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0 && days > -7) return `${-days}d overdue`;
  if (days > 0 && days < 7) return `In ${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(iso, status) {
  if (!iso || status === 'done') return false;
  return new Date(iso) < TODAY;
}
function dayDelta(iso) {
  return Math.round((new Date(iso) - TODAY) / (1000 * 60 * 60 * 24));
}

/* ───────── Sample data ───────── */
const TEAM = [
  { name: 'Mira Okafor',   role: 'Admin',  title: 'PM',         email: 'mira@northwind.co' },
  { name: 'Devon Reyes',   role: 'Member', title: 'Backend',    email: 'devon@northwind.co' },
  { name: 'Anya Krause',   role: 'Member', title: 'Design',     email: 'anya@northwind.co' },
  { name: 'Jules Tan',     role: 'Member', title: 'Frontend',   email: 'jules@northwind.co' },
  { name: 'Sam Whitfield', role: 'Admin',  title: 'Eng Lead',   email: 'sam@northwind.co' },
  { name: 'Priya Bhatia',  role: 'Member', title: 'QA',         email: 'priya@northwind.co' },
  { name: 'Otis Marsh',    role: 'Member', title: 'iOS',        email: 'otis@northwind.co' },
  { name: 'Hana Lindqvist',role: 'Member', title: 'Data',       email: 'hana@northwind.co' },
];

const PROJECTS = [
  { id: 'PRJ-101', key: 'MOB',  name: 'Mobile App v2.0',           tasks: 47, done: 28, members: ['Mira Okafor','Otis Marsh','Anya Krause','Jules Tan','Priya Bhatia'], due: '2026-06-15', status: 'On track' },
  { id: 'PRJ-102', key: 'API',  name: 'API Gateway Migration',     tasks: 32, done: 19, members: ['Sam Whitfield','Devon Reyes','Hana Lindqvist'], due: '2026-05-28', status: 'At risk' },
  { id: 'PRJ-103', key: 'BIL',  name: 'Billing Refactor',          tasks: 24, done: 11, members: ['Devon Reyes','Mira Okafor','Sam Whitfield'], due: '2026-07-04', status: 'On track' },
  { id: 'PRJ-104', key: 'GRO',  name: 'Q3 Growth Experiments',     tasks: 18, done: 4,  members: ['Mira Okafor','Anya Krause','Jules Tan'], due: '2026-08-01', status: 'On track' },
  { id: 'PRJ-105', key: 'DAT',  name: 'Data Warehouse Cleanup',    tasks: 15, done: 12, members: ['Hana Lindqvist','Devon Reyes'], due: '2026-05-10', status: 'Wrapping up' },
  { id: 'PRJ-106', key: 'OPS',  name: 'SOC 2 Audit Prep',          tasks: 21, done: 6,  members: ['Sam Whitfield','Mira Okafor'], due: '2026-06-30', status: 'Blocked' },
];

/* Tasks for the active "Mobile App v2.0" project */
const TASKS = [
  { id: 'MOB-241', title: 'Onboarding: regional SMS verification fallback',     status: 'prog',  prio: 'p0', assignee: 'Devon Reyes',   due: '2026-04-29', sub: 4, doneSub: 2, comments: 12, project: 'Mobile App v2.0' },
  { id: 'MOB-238', title: 'Settings → Notifications: granular per-channel toggles', status: 'rev',   prio: 'p1', assignee: 'Jules Tan',     due: '2026-05-04', sub: 6, doneSub: 6, comments: 8,  project: 'Mobile App v2.0' },
  { id: 'MOB-236', title: 'Push permission primer screen (iOS)',                status: 'prog',  prio: 'p1', assignee: 'Otis Marsh',    due: '2026-05-06', sub: 3, doneSub: 1, comments: 4,  project: 'Mobile App v2.0' },
  { id: 'MOB-233', title: 'Empty state illustrations for inbox + calendar',     status: 'todo',  prio: 'p2', assignee: 'Anya Krause',   due: '2026-05-12', sub: 2, doneSub: 0, comments: 1,  project: 'Mobile App v2.0' },
  { id: 'MOB-229', title: 'Crash on rapid tab-switch when offline',             status: 'block', prio: 'p0', assignee: 'Otis Marsh',    due: '2026-04-27', sub: 0, doneSub: 0, comments: 22, project: 'Mobile App v2.0' },
  { id: 'MOB-227', title: 'Replace deprecated AsyncStorage in profile module',  status: 'todo',  prio: 'p2', assignee: 'Jules Tan',     due: '2026-05-15', sub: 5, doneSub: 0, comments: 0,  project: 'Mobile App v2.0' },
  { id: 'MOB-225', title: 'Telemetry: add session_replay opt-in flag',          status: 'prog',  prio: 'p1', assignee: 'Hana Lindqvist',due: '2026-05-08', sub: 3, doneSub: 2, comments: 6,  project: 'Mobile App v2.0' },
  { id: 'MOB-220', title: 'Login screen: error copy review pass',               status: 'rev',   prio: 'p3', assignee: 'Mira Okafor',   due: '2026-05-02', sub: 0, doneSub: 0, comments: 3,  project: 'Mobile App v2.0' },
  { id: 'MOB-218', title: 'QA: regression sweep on Pixel 7 + iPhone 13',        status: 'todo',  prio: 'p1', assignee: 'Priya Bhatia',  due: '2026-05-09', sub: 8, doneSub: 0, comments: 2,  project: 'Mobile App v2.0' },
  { id: 'MOB-215', title: 'Animations: stagger feed cards on cold start',       status: 'done',  prio: 'p3', assignee: 'Anya Krause',   due: '2026-04-22', sub: 0, doneSub: 0, comments: 5,  project: 'Mobile App v2.0' },
  { id: 'MOB-212', title: 'Localize date formats for fr-CA, pt-BR',             status: 'done',  prio: 'p2', assignee: 'Hana Lindqvist',due: '2026-04-20', sub: 4, doneSub: 4, comments: 1,  project: 'Mobile App v2.0' },
  { id: 'MOB-208', title: 'Spec: anonymous-mode session boundaries',            status: 'rev',   prio: 'p1', assignee: 'Mira Okafor',   due: '2026-05-11', sub: 0, doneSub: 0, comments: 17, project: 'Mobile App v2.0' },
  { id: 'MOB-205', title: 'Add CI step: bundle-size budget check',              status: 'prog',  prio: 'p2', assignee: 'Devon Reyes',   due: '2026-05-13', sub: 2, doneSub: 1, comments: 0,  project: 'Mobile App v2.0' },
  { id: 'MOB-201', title: 'Refactor: lift theme provider above NavigationContainer', status: 'todo', prio: 'p3', assignee: 'Jules Tan',  due: '2026-05-20', sub: 0, doneSub: 0, comments: 0,  project: 'Mobile App v2.0' },
];

/* "My tasks" for Devon (the Member view) */
const MY_TASKS_DEVON = TASKS.filter(t => t.assignee === 'Devon Reyes');

/* Notifications */
const NOTIFICATIONS = [
  { who: 'Mira Okafor',   what: 'assigned you to', tgt: 'MOB-241 · Onboarding: regional SMS verification fallback', when: '12 min ago', read: false, kind: 'assigned' },
  { who: 'Anya Krause',   what: 'mentioned you in', tgt: 'MOB-208 · Spec: anonymous-mode session boundaries',        when: '1 hr ago', read: false, kind: 'mention' },
  { who: 'Sam Whitfield', what: 'requested review on', tgt: 'API-094 · Move auth to gateway',                       when: '3 hr ago', read: false, kind: 'review' },
  { who: 'Otis Marsh',    what: 'commented on', tgt: 'MOB-229 · Crash on rapid tab-switch',                          when: 'Yesterday', read: true,  kind: 'comment' },
  { who: 'Jules Tan',     what: 'closed', tgt: 'MOB-215 · Animations: stagger feed cards',                          when: 'Yesterday', read: true,  kind: 'closed' },
  { who: 'Hana Lindqvist',what: 'changed status of', tgt: 'MOB-212 · Localize date formats',                         when: '2d ago', read: true, kind: 'status' },
];

/* Activity feed */
const ACTIVITY = [
  { who: 'Devon Reyes',   what: 'moved MOB-225 to In Progress',  when: '2m' },
  { who: 'Anya Krause',   what: 'attached 3 files to MOB-233',   when: '14m' },
  { who: 'Jules Tan',     what: 'opened PR #841 on MOB-238',     when: '38m' },
  { who: 'Mira Okafor',   what: 'created milestone Beta-2',      when: '1h' },
  { who: 'Priya Bhatia',  what: 'logged 2 bugs on MOB-218',      when: '2h' },
];

/* Workload (open tasks per person) */
const WORKLOAD = [
  { name: 'Devon Reyes',    todo: 4, prog: 3, rev: 1 },
  { name: 'Jules Tan',      todo: 3, prog: 1, rev: 2 },
  { name: 'Otis Marsh',     todo: 2, prog: 2, rev: 0 },
  { name: 'Anya Krause',    todo: 5, prog: 0, rev: 1 },
  { name: 'Hana Lindqvist', todo: 1, prog: 2, rev: 0 },
  { name: 'Priya Bhatia',   todo: 6, prog: 0, rev: 0 },
  { name: 'Mira Okafor',    todo: 2, prog: 0, rev: 3 },
];

Object.assign(window, {
  Ico, Avatar, AvStack, StatusPill, PrioBadge,
  STATUS_META, PRIO_LABEL,
  TODAY, dateLabel, isOverdue, dayDelta, avColor, initials,
  TEAM, PROJECTS, TASKS, MY_TASKS_DEVON, NOTIFICATIONS, ACTIVITY, WORKLOAD,
});
