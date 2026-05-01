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
const PRIO_META = {
  critical: { label: 'Critical', cls: 'prio-p0' },
  high:     { label: 'High',     cls: 'prio-p1' },
  medium:   { label: 'Medium',   cls: 'prio-p2' },
  low:      { label: 'Low',      cls: 'prio-p3' },
  // legacy keys
  p0: { label: 'Critical', cls: 'prio-p0' },
  p1: { label: 'High',     cls: 'prio-p1' },
  p2: { label: 'Medium',   cls: 'prio-p2' },
  p3: { label: 'Low',      cls: 'prio-p3' },
};
function PrioBadge({ p }) {
  const m = PRIO_META[p] || { label: p || '—', cls: 'prio-p2' };
  return <span className={`prio ${m.cls}`}>{m.label}</span>;
}

/* ───────── Date helpers ───────── */
function dateLabel(iso) {
  if (!iso) return '—';
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso); d.setHours(0,0,0,0);
  const days = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0 && days > -7) return `${-days}d overdue`;
  if (days > 0 && days < 7) return `In ${days}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function isOverdue(iso, status) {
  if (!iso || status === 'done') return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(iso) < today;
}
function dayDelta(iso) {
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.round((new Date(iso) - today) / (1000 * 60 * 60 * 24));
}

Object.assign(window, {
  Ico, Avatar, AvStack, StatusPill, PrioBadge,
  STATUS_META, PRIO_LABEL,
  dateLabel, isOverdue, dayDelta, avColor, initials,
});
