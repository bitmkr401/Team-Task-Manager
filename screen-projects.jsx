/* Projects list */

function NewProjectModal({ onClose, onCreated }) {
  const [name, setName]     = React.useState('');
  const [key, setKey]       = React.useState('');
  const [desc, setDesc]     = React.useState('');
  const [color, setColor]   = React.useState('#3a4978');
  const [due, setDue]       = React.useState('');
  const [err, setErr]       = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const autoKey = (n) => n.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

  const submit = async () => {
    if (!name.trim() || !key.trim()) { setErr('Name and key are required'); return; }
    setLoading(true); setErr('');
    try {
      const proj = await API.post('/projects', { name, key, description: desc, color, due_date: due || undefined });
      onCreated(proj);
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#b5462a','#3a4978','#5c7a5a','#b48a2c','#7a5d8c','#a83a2c','#4a7a8c','#2c6b4a'];

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-h">
          <div style={{ fontWeight: 600, fontSize: 14 }}>New project</div>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}><Ico.close /></button>
        </div>
        <div className="modal-b" style={{ display: 'grid', gap: 14 }}>
          <div className="field">
            <label className="field-l">Project name</label>
            <input className="input" placeholder="Mobile App v2.0" value={name}
              onChange={e => { setName(e.target.value); if (!key || key === autoKey(name)) setKey(autoKey(e.target.value)); }} />
          </div>
          <div className="field">
            <label className="field-l">Key (short code)</label>
            <input className="input" placeholder="MOB" value={key} maxLength={6}
              onChange={e => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
            <div className="help">2–6 uppercase letters, used as task prefix</div>
          </div>
          <div className="field">
            <label className="field-l">Description</label>
            <textarea className="input" rows={2} placeholder="What is this project about?" value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div className="field">
            <label className="field-l">Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <div key={c} onClick={() => setColor(c)} style={{
                  width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
                  outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2
                }} />
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-l">Due date</label>
            <input className="input" type="date" value={due} onChange={e => setDue(e.target.value)} />
          </div>
          {err && <div style={{ color: 'var(--rust)', fontSize: 12 }}>{err}</div>}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectsList({ role, projects = [], onNavigate = () => {}, onProjectCreated = () => {} }) {
  const [showModal, setShowModal] = React.useState(false);

  const totalTasks = projects.reduce((a, p) => a + parseInt(p.task_count || 0), 0);
  const totalDone  = projects.reduce((a, p) => a + parseInt(p.done_count || 0), 0);

  return (
    <>
      <Topbar crumbs={['Workspace', 'Projects']} role={role} onCreate={role === 'Admin' ? () => setShowModal(true) : null} />
      <div style={{ overflow: 'auto', flex: 1 }}>
        <div className="ph">
          <div className="ph-row">
            <div>
              <h1 className="ph-title">Projects</h1>
              <div className="ph-meta">
                <span><b>{projects.length}</b> active</span>
                <span><b>{totalTasks}</b> total tasks</span>
                <span><b>{totalDone}</b> completed</span>
              </div>
            </div>
            <div className="ph-actions">
              {role === 'Admin' ? (
                <button className="btn btn-accent" onClick={() => setShowModal(true)}><Ico.plus /> New project</button>
              ) : (
                <button className="btn" disabled title="Admins only"><Ico.plus /> New project</button>
              )}
            </div>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Key</th>
              <th>Project</th>
              <th style={{ width: 220 }}>Progress</th>
              <th style={{ width: 140 }}>Members</th>
              <th style={{ width: 110 }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => {
              const tasks = parseInt(p.task_count || 0);
              const done  = parseInt(p.done_count || 0);
              const pct   = tasks > 0 ? Math.round((done / tasks) * 100) : 0;
              return (
                <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('PRJ-' + String(p.id).padStart(3,'0'))}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ink)', background: 'var(--bg-sunk)', padding: '2px 6px', borderRadius: 3 }}>{p.key}</span>
                  </td>
                  <td className="ttl">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      {p.name}
                    </div>
                    {p.description && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="prog" style={{ flex: 1 }}><span style={{ width: `${pct}%` }} /></div>
                      <span className="num" style={{ fontSize: 11, width: 70, textAlign: 'right' }}>{done}/{tasks} · {pct}%</span>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.member_count || 0} members</span></td>
                  <td><span className={`date ${p.due_date && isOverdue(p.due_date, '') ? 'overdue' : ''}`}>{dateLabel(p.due_date)}</span></td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--ink-3)' }}>No projects yet. {role === 'Admin' ? 'Create your first project.' : 'Ask an admin to create a project.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(proj) => { onProjectCreated(proj); }}
        />
      )}
    </>
  );
}

Object.assign(window, { ProjectsList });
