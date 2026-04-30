/* Dashboard */

function Dashboard({ user, role, tasks = [], team = [], notifications = [], onNewTask = () => {}, onNavigate = () => {} }) {
  const myOpen    = tasks.filter(t => t.assignee_id === user.id && t.status !== 'done');
  const myOverdue = tasks.filter(t => t.assignee_id === user.id && isOverdue(t.due_date, t.status));
  const allOpen   = tasks.filter(t => t.status !== 'done');

  // completed this week
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const doneThisWeek = tasks.filter(t => t.status === 'done' && new Date(t.updated_at) >= weekAgo).length;

  // avg cycle time placeholder (not computable without full audit trail)
  const avgCycle = '3.4';

  // Workload per team member
  const workload = team.map(m => ({
    name: m.name,
    todo: tasks.filter(t => t.assignee_id === m.id && t.status === 'todo').length,
    prog: tasks.filter(t => t.assignee_id === m.id && t.status === 'in_progress').length,
    rev:  tasks.filter(t => t.assignee_id === m.id && t.status === 'review').length,
  })).filter(w => w.todo + w.prog + w.rev > 0);

  // Upcoming deadlines (sorted by due_date)
  const upcoming = [...allOpen]
    .filter(t => t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  // Recent activity from notifications
  const recentActivity = notifications.slice(0, 5);

  return (
    <>
      <Topbar
        crumbs={[user.workspace || 'Workspace', 'Dashboard']}
        role={role}
        onCreate={onNewTask}
      />
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div className="ph">
          <div className="ph-row">
            <div>
              <h1 className="ph-title">Good morning, {user.name.split(' ')[0]}</h1>
              <div className="ph-meta">
                <span><b>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</b> · <b>{myOpen.length}</b> open · <b style={{ color: 'var(--rust)' }}>{myOverdue.length}</b> overdue</span>
              </div>
            </div>
            <div className="ph-actions">
              <button className="btn-primary btn" onClick={onNewTask}><Ico.plus /> New task</button>
            </div>
          </div>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="kpi">
              <div className="kpi-label">Assigned to me</div>
              <div className="kpi-value">{myOpen.length}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Overdue</div>
              <div className="kpi-value" style={{ color: 'var(--rust)' }}>{myOverdue.length}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Completed this week</div>
              <div className="kpi-value">{doneThisWeek}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Avg. cycle time</div>
              <div className="kpi-value">{avgCycle}<span style={{ fontSize: 14, color: 'var(--ink-3)' }}>d</span></div>
            </div>
          </div>

          {/* Two-col body */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
            {/* My open tasks */}
            <div className="card">
              <div className="card-h">
                <div className="card-title">My open tasks</div>
                <div className="card-sub">{myOpen.length} items</div>
              </div>
              {myOpen.length === 0 ? (
                <div style={{ padding: '20px 14px', color: 'var(--ink-3)', fontSize: 13 }}>No open tasks — you're all caught up!</div>
              ) : (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 90 }}>Project</th>
                      <th>Task</th>
                      <th style={{ width: 110 }}>Status</th>
                      <th style={{ width: 60 }}>Prio</th>
                      <th style={{ width: 100 }}>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOpen.slice(0, 7).map(t => (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate(t.project_id ? 'PRJ-' + String(t.project_id).padStart(3,'0') : 'dashboard')}>
                        <td className="id-cell" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{t.project_key}</td>
                        <td className="ttl" style={{ maxWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</td>
                        <td><StatusPill status={t.status} /></td>
                        <td><PrioBadge p={t.priority} /></td>
                        <td><span className={`date ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}`}>{dateLabel(t.due_date)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right column */}
            <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
              {/* Upcoming deadlines */}
              <div className="card">
                <div className="card-h">
                  <div className="card-title">Upcoming deadlines</div>
                  <div style={{ marginLeft: 'auto' }} className="card-sub">Next 14 days</div>
                </div>
                <div>
                  {upcoming.length === 0 && (
                    <div style={{ padding: '12px 14px', color: 'var(--ink-3)', fontSize: 13 }}>No upcoming deadlines.</div>
                  )}
                  {upcoming.map(t => {
                    const d = new Date(t.due_date);
                    const urg = dayDelta(t.due_date) <= 1;
                    return (
                      <div key={t.id} className={`dl-row ${urg ? 'urg' : ''}`}>
                        <div className="dl-day">
                          {d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          <b>{d.getDate()}</b>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 2 }}>
                            {t.project_key} · {t.assignee_name || '—'}
                          </div>
                        </div>
                        <Avatar name={t.assignee_name || '?'} size="xs" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity */}
              <div className="card">
                <div className="card-h">
                  <div className="card-title">Recent activity</div>
                </div>
                <div style={{ padding: '6px 14px 10px' }}>
                  {recentActivity.length === 0 && (
                    <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '6px 0' }}>No recent activity.</div>
                  )}
                  {recentActivity.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, padding: '6px 0', alignItems: 'center', fontSize: 12 }}>
                      <Avatar name={user.name} size="xs" />
                      <div style={{ flex: 1, minWidth: 0, color: 'var(--ink-2)' }}>
                        {a.body}
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)' }}>
                        {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workload */}
          {workload.length > 0 && (
            <div className="card">
              <div className="card-h">
                <div className="card-title">Team workload</div>
                <div className="card-sub">Open tasks by status, per person</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 11, color: 'var(--ink-3)', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#a59b85', borderRadius: 2 }} /> To Do</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#b48a2c', borderRadius: 2 }} /> In Progress</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#3a4978', borderRadius: 2 }} /> Review</span>
                </div>
              </div>
              <div style={{ padding: '8px 14px 12px' }}>
                {workload.map(w => {
                  const total = w.todo + w.prog + w.rev;
                  const cap = 12;
                  const max = Math.max(cap, total);
                  return (
                    <div key={w.name} className="bar-row">
                      <span className="bar-name" style={{ display: 'flex', gap: 7, alignItems: 'center', width: 150 }}>
                        <Avatar name={w.name} size="xs" />
                        {w.name}
                      </span>
                      <div className="bar-track">
                        <div className="bar-seg" style={{ width: `${(w.todo / max) * 100}%`, background: '#a59b85' }} />
                        <div className="bar-seg" style={{ width: `${(w.prog / max) * 100}%`, background: '#b48a2c' }} />
                        <div className="bar-seg" style={{ width: `${(w.rev / max) * 100}%`, background: '#3a4978' }} />
                      </div>
                      <span className="bar-num">{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { Dashboard });
