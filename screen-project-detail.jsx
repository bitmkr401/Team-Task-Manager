/* Project detail with List/Board toggle, plus Task drawer + New task modal */

function ProjectDetail({
  role, view = 'list', drawer = null, modal = false,
  project = null, tasks = [], team = [], user = {},
  onViewChange = () => {}, onDrawerOpen = () => {}, onDrawerClose = () => {},
  onModalOpen = () => {}, onModalClose = () => {}, onTaskCreated = () => {}, onTaskUpdated = () => {},
}) {
  if (!project) return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Loading project…</div>;

  const allTasks = tasks;
  const total = allTasks.length;
  const done  = allTasks.filter(t => t.status === 'done').length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  const statusCounts = {
    todo: allTasks.filter(t => t.status === 'todo').length,
    in_progress: allTasks.filter(t => t.status === 'in_progress').length,
    review: allTasks.filter(t => t.status === 'review').length,
    done: done,
  };

  return (
    <>
      <Topbar
        crumbs={['Workspace', 'Projects', project.name]}
        role={role}
        onCreate={onModalOpen}
      />
      <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
        <div className="ph">
          <div className="ph-row">
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, background: project.color || 'var(--terra)', display: 'grid', placeItems: 'center', color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13 }}>{project.key}</div>
              <div>
                <h1 className="ph-title">{project.name}</h1>
                <div className="ph-meta">
                  <span><b>{total}</b> tasks · <b>{done}</b> done · {pct}%</span>
                  {project.due_date && <span>Due <b>{dateLabel(project.due_date)}</b></span>}
                </div>
              </div>
            </div>
            <div className="ph-actions">
              <button className="btn" onClick={onModalOpen}><Ico.plus /> New task</button>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="prog" style={{ flex: 1, maxWidth: 240 }}><span style={{ width: `${pct}%`, background: 'var(--sage)' }} /></div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#a59b85', marginRight: 5 }} />{statusCounts.todo} To Do</span>
              <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#b48a2c', marginRight: 5 }} />{statusCounts.in_progress} In Prog</span>
              <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3a4978', marginRight: 5 }} />{statusCounts.review} Review</span>
              <span><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#5c7a5a', marginRight: 5 }} />{statusCounts.done} Done</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--line)', background: 'var(--bg-elev)' }}>
          <div className="seg">
            <div className={`seg-i ${view === 'list' ? 'on' : ''}`} onClick={() => onViewChange('list')}><Ico.list /> List</div>
            <div className={`seg-i ${view === 'board' ? 'on' : ''}`} onClick={() => onViewChange('board')}><Ico.board /> Board</div>
          </div>
        </div>

        {view === 'list'
          ? <ProjectListView tasks={allTasks} onDrawerOpen={onDrawerOpen} />
          : <ProjectBoardView tasks={allTasks} onDrawerOpen={onDrawerOpen} />
        }

        {drawer && (
          <TaskDrawer task={drawer} role={role} team={team} onClose={onDrawerClose} onTaskUpdated={onTaskUpdated} />
        )}
        {modal && (
          <NewTaskModal
            project={project}
            team={team}
            user={user}
            onClose={onModalClose}
            onCreated={onTaskCreated}
          />
        )}
      </div>
    </>
  );
}

function ProjectListView({ tasks = [], onDrawerOpen = () => {} }) {
  const STATUS_GROUPS = [
    { key: 'todo',        label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'review',      label: 'In Review' },
    { key: 'done',        label: 'Done' },
  ];
  return (
    <div>
      {STATUS_GROUPS.map(g => {
        const group = tasks.filter(t => t.status === g.key);
        return (
          <div key={g.key}>
            <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-elev)', borderBottom: '1px solid var(--line)' }}>
              <StatusPill status={g.key} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{group.length}</span>
            </div>
            {group.length > 0 && (
              <table className="tbl">
                <thead style={{ display: 'none' }}><tr><th></th></tr></thead>
                <tbody>
                  {group.map(t => {
                    const overdue = isOverdue(t.due_date, t.status);
                    return (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => onDrawerOpen(t)}>
                        <td className="ttl" style={{ paddingLeft: 20 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`check ${t.status === 'done' ? 'on' : ''}`}>
                              {t.status === 'done' && <Ico.check style={{ width: 9, height: 9 }} />}
                            </span>
                            <span style={{ textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--ink-3)' : 'var(--ink)' }}>
                              {t.title}
                            </span>
                          </div>
                        </td>
                        <td style={{ width: 100 }}><PrioBadge p={t.priority} /></td>
                        <td style={{ width: 110 }}><span className={`date ${overdue ? 'overdue' : ''}`}>{dateLabel(t.due_date)}</span></td>
                        <td style={{ width: 130 }}>
                          {t.assignee_name && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Avatar name={t.assignee_name} size="xs" />
                              <span style={{ fontSize: 11, color: 'var(--ink-2)' }}>{t.assignee_name.split(' ')[0]}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      {tasks.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>No tasks yet. Create the first one.</div>
      )}
    </div>
  );
}

function ProjectBoardView({ tasks = [], onDrawerOpen = () => {} }) {
  const cols = [
    { key: 'todo',        label: 'To Do',       dot: '#a59b85' },
    { key: 'in_progress', label: 'In Progress',  dot: '#b48a2c' },
    { key: 'review',      label: 'In Review',    dot: '#3a4978' },
    { key: 'done',        label: 'Done',         dot: '#5c7a5a' },
  ];
  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
      {cols.map(c => {
        const items = tasks.filter(t => t.status === c.key);
        return (
          <div key={c.key} style={{ background: 'var(--bg-elev)', borderRadius: 6, border: '1px solid var(--line)' }}>
            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid var(--line)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)' }}>{items.length}</span>
            </div>
            <div style={{ padding: 8, display: 'grid', gap: 8 }}>
              {items.map(t => (
                <div key={t.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 4, padding: 9, cursor: 'pointer' }}
                  onClick={() => onDrawerOpen(t)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <PrioBadge p={t.priority} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.35, fontWeight: 500 }}>{t.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span className={`date ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}`} style={{ fontSize: 10 }}>{dateLabel(t.due_date)}</span>
                    {t.assignee_name && <Avatar name={t.assignee_name} size="xs" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskDrawer({ task, role, team = [], onClose = () => {}, onTaskUpdated = () => {} }) {
  const [status, setStatus]   = React.useState(task.status);
  const [saving, setSaving]   = React.useState(false);

  const updateStatus = async (newStatus) => {
    setSaving(true);
    try {
      const updated = await API.put(`/tasks/${task.id}`, { status: newStatus });
      setStatus(newStatus);
      onTaskUpdated(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const t = { ...task, status };

  return (
    <div className="drawer">
      <div className="drawer-h">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>#{t.id}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="icon-btn" title="Close" onClick={onClose}><Ico.close /></button>
        </span>
      </div>
      <div className="drawer-body">
        <h2 style={{ fontSize: 17, lineHeight: 1.3, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{t.title}</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <StatusPill status={t.status} />
          <PrioBadge p={t.priority} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', rowGap: 10, columnGap: 12, fontSize: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ color: 'var(--ink-3)' }}>Assignee</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {t.assignee_name
              ? <><Avatar name={t.assignee_name} size="xs" /><span style={{ fontWeight: 500 }}>{t.assignee_name}</span></>
              : <span style={{ color: 'var(--ink-4)' }}>Unassigned</span>
            }
          </div>
          <div style={{ color: 'var(--ink-3)' }}>Due date</div>
          <div className={`date ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}`}>{dateLabel(t.due_date)}</div>
          <div style={{ color: 'var(--ink-3)' }}>Project</div>
          <div>{t.project_name || '—'}</div>
        </div>

        {t.description && (
          <>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 6 }}>Description</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)', marginBottom: 18 }}>{t.description}</div>
          </>
        )}

        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: 8 }}>Update status</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {['todo','in_progress','review','done'].map(s => (
            <button key={s} className={`btn btn-sm ${status === s ? 'btn-primary' : ''}`}
              disabled={saving}
              onClick={() => updateStatus(s)}
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              <StatusPill status={s} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NewTaskModal({ project, team = [], user = {}, onClose = () => {}, onCreated = () => {} }) {
  const [title, setTitle]     = React.useState('');
  const [desc, setDesc]       = React.useState('');
  const [status, setStatus]   = React.useState('todo');
  const [priority, setPrio]   = React.useState('medium');
  const [assignee, setAssignee] = React.useState(user.id || '');
  const [due, setDue]         = React.useState('');
  const [err, setErr]         = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const submit = async () => {
    if (!title.trim()) { setErr('Title is required'); return; }
    setLoading(true); setErr('');
    try {
      const task = await API.post('/tasks', {
        project_id: project.id,
        title,
        description: desc,
        status,
        priority,
        assignee_id: assignee || null,
        due_date: due || null,
      });
      onCreated(task);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{ fontWeight: 600, fontSize: 14 }}>New task</div>
          <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>in {project.name}</span>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}><Ico.close /></button>
        </div>
        <div className="modal-b">
          <div className="field">
            <label className="field-l">Title <span style={{ color: 'var(--rust)' }}>*</span></label>
            <input className="input" placeholder="What needs to get done?" value={title} onChange={e => setTitle(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="field">
            <label className="field-l">Description</label>
            <textarea className="textarea" placeholder="Add context, acceptance criteria, links…" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-l">Status</label>
              <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="field">
              <label className="field-l">Priority</label>
              <select className="select" value={priority} onChange={e => setPrio(e.target.value)}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label className="field-l">Assignee</label>
              <select className="select" value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-l">Due date</label>
              <input className="input" type="date" value={due} onChange={e => setDue(e.target.value)} />
            </div>
          </div>
          {err && <div style={{ color: 'var(--rust)', fontSize: 12 }}>{err}</div>}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-accent" onClick={submit} disabled={loading}>{loading ? 'Creating…' : 'Create task'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectDetail, TaskDrawer, NewTaskModal });
