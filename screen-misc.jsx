/* Team & Admin & Notifications screens */

function InviteMemberModal({ onClose, onInvited }) {
  const [name, setName]   = React.useState('');
  const [email, setEmail] = React.useState('');
  const [role, setRole]   = React.useState('Member');
  const [title, setTitle] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [err, setErr]     = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim()) { setErr('Name and email required'); return; }
    setLoading(true); setErr('');
    try {
      const data = await API.post('/team/invite', { name, email, role, title });
      setResult(data);
      onInvited(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{ fontWeight: 600, fontSize: 14 }}>Invite member</div>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}><Ico.close /></button>
        </div>
        {result ? (
          <div className="modal-b">
            <div style={{ background: 'rgba(92,122,90,.12)', border: '1px solid rgba(92,122,90,.3)', borderRadius: 6, padding: 14, fontSize: 13 }}>
              <b>{result.name}</b> invited!<br />
              <span style={{ color: 'var(--ink-3)' }}>Temporary password: </span>
              <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-sunk)', padding: '1px 6px', borderRadius: 3 }}>{result.temp_password}</code>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6 }}>Share this securely — it won't be shown again.</div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="modal-b" style={{ display: 'grid', gap: 12 }}>
              <div className="field">
                <label className="field-l">Full name</label>
                <input className="input" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-l">Work email</label>
                <input className="input" type="email" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-l">Role</label>
                  <select className="select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-l">Title</label>
                  <input className="input" placeholder="Engineer" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
              </div>
              {err && <div style={{ color: 'var(--rust)', fontSize: 12 }}>{err}</div>}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Inviting…' : 'Invite'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TeamScreen({ role, team = [], currentUser = {} }) {
  const [showInvite, setShowInvite] = React.useState(false);
  const [members, setMembers]       = React.useState(team);

  React.useEffect(() => { setMembers(team); }, [team]);

  const admins  = members.filter(m => m.role === 'Admin').length;

  const changeRole = async (memberId, newRole) => {
    try {
      const updated = await API.put(`/team/${memberId}/role`, { role: newRole });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: updated.role } : m));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <Topbar crumbs={['Workspace', 'Team']} role={role} />
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div className="ph">
          <div className="ph-row">
            <div>
              <h1 className="ph-title">Team & members</h1>
              <div className="ph-meta">
                <span><b>{members.length}</b> members</span>
                <span><b>{admins}</b> admins</span>
              </div>
            </div>
            <div className="ph-actions">
              {role === 'Admin'
                ? <button className="btn btn-accent" onClick={() => setShowInvite(true)}><Ico.plus /> Invite members</button>
                : <button className="btn" disabled><Ico.plus /> Invite members</button>}
            </div>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 280 }}>Name</th>
              <th>Email</th>
              <th style={{ width: 110 }}>Role</th>
              <th style={{ width: 130 }}>Title</th>
              <th style={{ width: 100 }}>Open tasks</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Avatar name={m.name} />
                    <div>
                      <div className="ttl">{m.name} {m.id === currentUser.id ? <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>(you)</span> : ''}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{m.email}</td>
                <td>
                  {role === 'Admin' && m.id !== currentUser.id ? (
                    <select className="select" style={{ fontSize: 11, padding: '2px 6px', height: 24 }}
                      value={m.role} onChange={e => changeRole(m.id, e.target.value)}>
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`role-banner ${m.role === 'Admin' ? 'admin' : 'member'}`}>{m.role.toUpperCase()}</span>
                  )}
                </td>
                <td style={{ fontSize: 12, color: 'var(--ink-2)' }}>{m.title}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{m.open_tasks || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showInvite && (
        <InviteMemberModal
          onClose={() => setShowInvite(false)}
          onInvited={(m) => setMembers(prev => [...prev, m])}
        />
      )}
    </>
  );
}

function AdminSettings({ role, user = {} }) {
  return (
    <>
      <Topbar crumbs={[user.workspace || 'Workspace', 'Settings']} role={role} />
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div className="ph">
          <div className="ph-row">
            <div>
              <h1 className="ph-title">Workspace settings</h1>
              <div className="ph-meta"><span>{user.workspace} · Admins only</span></div>
            </div>
          </div>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, maxWidth: 980 }}>
          <div style={{ display: 'grid', gap: 2, alignContent: 'start', fontSize: 12 }}>
            {['General','Members & roles','Permissions','Billing','Integrations','Audit log','Danger zone'].map((s, i) => (
              <div key={s} style={{
                padding: '6px 10px', borderRadius: 4, cursor: 'pointer',
                background: i === 2 ? 'var(--bg-sunk)' : 'transparent',
                fontWeight: i === 2 ? 600 : 400,
                color: i === 6 ? 'var(--rust)' : 'var(--ink-2)',
              }}>{s}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <div className="card">
              <div className="card-h">
                <div className="card-title">Role-based permissions</div>
                <div className="card-sub">What each role can do across the workspace</div>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th style={{ width: 90, textAlign: 'center' }}>Admin</th>
                    <th style={{ width: 90, textAlign: 'center' }}>Member</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Create projects',           'y','n'],
                    ['Delete projects',            'y','n'],
                    ['Invite members',             'y','n'],
                    ['Change member roles',        'y','n'],
                    ['Create / edit tasks',        'y','y'],
                    ['Reassign others\' tasks',    'y','n'],
                    ['View all projects',          'y','y'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td className="ttl">{r[0]}</td>
                      {[1,2].map(j => (
                        <td key={j} style={{ textAlign: 'center' }}>
                          {r[j] === 'y'
                            ? <Ico.check style={{ color: 'var(--sage)' }} />
                            : <span style={{ color: 'var(--ink-4)' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NotificationsScreen({ role, notifications = [], onMarkRead = () => {}, onMarkAllRead = () => {} }) {
  const unread = notifications.filter(n => !n.read).length;

  return (
    <>
      <Topbar crumbs={['Workspace', 'Inbox']} role={role} />
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div className="ph">
          <div className="ph-row">
            <div>
              <h1 className="ph-title">Inbox</h1>
              <div className="ph-meta"><span><b>{unread}</b> unread · <b>{notifications.length}</b> total</span></div>
            </div>
            <div className="ph-actions">
              <button className="btn btn-sm" onClick={onMarkAllRead}>Mark all as read</button>
            </div>
          </div>
        </div>
        <div style={{ background: 'var(--surface)' }}>
          {notifications.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>You're all caught up!</div>
          )}
          {notifications.map((n, i) => (
            <div key={n.id || i} className="notif-item" style={{ opacity: n.read ? 0.6 : 1 }}>
              <div className={`notif-dot ${n.read ? 'read' : ''}`} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.45 }}>{n.body}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', marginTop: 3 }}>
                  {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {!n.read && (
                <button className="btn-ghost btn btn-sm" style={{ alignSelf: 'flex-start' }}
                  onClick={() => onMarkRead(n.id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { TeamScreen, AdminSettings, NotificationsScreen });
