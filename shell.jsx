/* Sidebar + Topbar shells */

function AppSidebar({ active = 'dashboard', user, role, projectKey, projects = [], counts = {}, onNavigate = () => {}, onLogout = () => {} }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: Ico.home,  count: counts.dashboard },
    { id: 'inbox',     label: 'Inbox',     icon: Ico.inbox, count: counts.inbox },
    { id: 'mytasks',   label: 'My tasks',  icon: Ico.check, count: counts.mytasks },
    { id: 'projects',  label: 'Projects',  icon: Ico.board, count: null },
  ];
  const adminItems = [
    { id: 'team',     label: 'Team',      icon: Ico.users },
    { id: 'settings', label: 'Workspace', icon: Ico.settings },
  ];

  return (
    <aside className="sb">
      <div className="sb-brand">
        <div className="sb-mark">N</div>
        <div className="sb-name">Northwind</div>
        <div className="sb-org">{user && user.workspace ? user.workspace.toLowerCase().slice(0,10) : 'workspace'}</div>
      </div>

      <div style={{ padding: '6px 0' }}>
        {items.map(it => (
          <div key={it.id} className={`sb-row ${active === it.id ? 'active' : ''}`} onClick={() => onNavigate(it.id)}>
            <it.icon />
            <span>{it.label}</span>
            {it.count != null && <span className="sb-row-count">{it.count}</span>}
          </div>
        ))}
      </div>

      <div className="sb-sec">Projects</div>
      <div style={{ padding: '0 0 6px' }}>
        {projects.map(p => (
          <div key={p.id} className={`sb-row ${active === p.id || projectKey === p.key ? 'active' : ''}`} onClick={() => onNavigate(p.id)}>
            <span className="sb-dot" style={{ background: p.color }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            <span className="sb-row-count" style={{ fontSize: 10 }}>{p.key}</span>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--ink-4)' }}>No projects yet</div>
        )}
      </div>

      {role === 'Admin' && (
        <>
          <div className="sb-sec">Admin</div>
          <div style={{ padding: '0 0 6px' }}>
            {adminItems.map(it => (
              <div key={it.id} className={`sb-row ${active === it.id ? 'active' : ''}`} onClick={() => onNavigate(it.id)}>
                <it.icon />
                <span>{it.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sb-foot" style={{ cursor: 'pointer' }} title="Click to sign out" onClick={onLogout}>
        <Avatar name={user ? user.name : '?'} />
        <div className="sb-foot-info" style={{ flex: 1 }}>
          <div className="sb-foot-name">{user ? user.name : ''}</div>
          <div className="sb-foot-role">{role ? role.toUpperCase() : ''} · {user ? user.title : ''}</div>
        </div>
        <Ico.chevDown />
      </div>
    </aside>
  );
}

// Keep Sidebar as alias for backwards compat
const Sidebar = AppSidebar;

function Topbar({ crumbs = [], onCreate, role, notifBadge = false, search = true }) {
  return (
    <div className="topbar">
      <div className="crumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="crumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'crumb-cur' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      {search && (
        <div className="topbar-search">
          <Ico.search />
          <input placeholder="Search tasks, projects, people…" />
          <span className="kbd">⌘K</span>
        </div>
      )}
      <div className="topbar-actions">
        <span className={`role-banner ${role === 'Admin' ? 'admin' : 'member'}`}>{role ? role.toUpperCase() : ''}</span>
        <button className="icon-btn" title="Notifications">
          <Ico.bell />
          {notifBadge && <span className="icon-btn-dot" />}
        </button>
        {onCreate && (
          <button className="btn btn-accent" onClick={onCreate}>
            <Ico.plus /> New task
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AppSidebar, Sidebar, Topbar });
