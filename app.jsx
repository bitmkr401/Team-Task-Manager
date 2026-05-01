/* App — auth + stateful single-page navigation */

function MyTasksScreen({ user, role, tasks = [], team = [], onNewTask = () => {}, onTaskUpdated = () => {} }) {
  const [drawer, setDrawer] = React.useState(null);
  const myTasks = tasks.filter(t => t.assignee_id === user.id);
  const STATUS_GROUPS = [
    { key: 'todo',        label: 'To Do' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'review',      label: 'In Review' },
    { key: 'done',        label: 'Done' },
  ];

  return (
    <>
      <Topbar crumbs={[user.workspace || 'Workspace', 'My Tasks']} role={role} onCreate={onNewTask} />
      <div style={{ overflow: 'auto', flex: 1, position: 'relative' }}>
        <div className="ph">
          <div className="ph-row">
            <div>
              <h1 className="ph-title">My tasks</h1>
              <div className="ph-meta">
                <span><b>{myTasks.filter(t => t.status !== 'done').length}</b> open</span>
                <span><b>{myTasks.filter(t => isOverdue(t.due_date, t.status)).length}</b> overdue</span>
                <span><b>{myTasks.filter(t => t.status === 'done').length}</b> done</span>
              </div>
            </div>
            <div className="ph-actions">
              <button className="btn btn-accent" onClick={onNewTask}><Ico.plus /> New task</button>
            </div>
          </div>
        </div>

        <div>
          {STATUS_GROUPS.map(g => {
            const group = myTasks.filter(t => t.status === g.key);
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
                      {group.map(t => (
                        <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setDrawer(t)}>
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
                          <td style={{ width: 100 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', background: 'var(--bg-sunk)', padding: '2px 5px', borderRadius: 3 }}>{t.project_key}</span>
                          </td>
                          <td style={{ width: 100 }}><PrioBadge p={t.priority} /></td>
                          <td style={{ width: 110 }}><span className={`date ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}`}>{dateLabel(t.due_date)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
          {myTasks.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>No tasks assigned to you yet.</div>
          )}
        </div>

        {drawer && (
          <TaskDrawer
            task={drawer}
            role={role}
            team={team}
            onClose={() => setDrawer(null)}
            onTaskUpdated={(updated) => {
              setDrawer(updated);
              onTaskUpdated(updated);
            }}
          />
        )}
      </div>
    </>
  );
}

function App() {
  const [authState, setAuthState] = React.useState('checking');
  const [user,      setUser]      = React.useState(null);

  const [active,  setActive]  = React.useState('dashboard');
  const [view,    setView]    = React.useState('list');
  const [drawer,  setDrawer]  = React.useState(null);
  const [modal,   setModal]   = React.useState(false);

  const [projects,      setProjects]      = React.useState([]);
  const [tasks,         setTasks]         = React.useState([]);
  const [team,          setTeam]          = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [projectTasks,  setProjectTasks]  = React.useState([]);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthState('auth'); return; }
    API.setToken(token);
    API.get('/auth/me')
      .then(u => { setUser(u); setAuthState('app'); })
      .catch(() => { API.setToken(null); setAuthState('auth'); });
  }, []);

  React.useEffect(() => {
    if (authState !== 'app') return;
    loadAll();
  }, [authState]);

  const loadAll = async () => {
    try {
      const [p, t, tm, n] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks'),
        API.get('/team'),
        API.get('/notifications'),
      ]);
      setProjects(p);
      setTasks(t);
      setTeam(tm);
      setNotifications(n);
    } catch (e) {
      console.error('Data load error:', e);
    }
  };

  const loadProjectTasks = async (projectId) => {
    try {
      const t = await API.get(`/tasks?project_id=${projectId}`);
      setProjectTasks(t);
    } catch (e) { console.error(e); }
  };

  const navigate = (id) => {
    setDrawer(null);
    setModal(false);
    setActive(id);
    if (id.startsWith('PRJ-')) {
      setView('list');
      const numId = parseInt(id.replace('PRJ-', ''));
      if (numId) loadProjectTasks(numId);
    }
  };

  const logout = () => {
    API.setToken(null);
    setUser(null);
    setAuthState('auth');
    setActive('dashboard');
    setProjects([]); setTasks([]); setTeam([]); setNotifications([]);
  };

  const handleAuthSuccess = (token, u) => {
    setUser(u);
    setAuthState('app');
  };

  // When a task is created (from anywhere), update both global and project task lists
  const handleTaskCreated = (t) => {
    setTasks(prev => [t, ...prev]);
    if (active.startsWith('PRJ-')) {
      const numId = parseInt(active.replace('PRJ-', ''));
      if (t.project_id === numId) setProjectTasks(prev => [t, ...prev]);
    }
    setModal(false);
  };

  // When a task is updated (status, assignee, etc.)
  const handleTaskUpdated = (t) => {
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x));
    setProjectTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x));
  };

  const currentProject = React.useMemo(() => {
    if (!active.startsWith('PRJ-')) return null;
    const numId = parseInt(active.replace('PRJ-', ''));
    return projects.find(p => p.id === numId) || null;
  }, [active, projects]);

  const unreadCount  = notifications.filter(n => !n.read).length;
  const myTasksCount = tasks.filter(t => t.assignee_id === (user && user.id) && t.status !== 'done').length;

  const sidebarProjects = projects.map(p => ({
    id: 'PRJ-' + String(p.id).padStart(3, '0'),
    key: p.key,
    name: p.name,
    color: p.color,
  }));

  const projectKey = currentProject ? currentProject.key : null;

  if (authState === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  if (authState === 'auth') {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  let body = null;
  if (active === 'dashboard' || active === 'cal') {
    body = (
      <Dashboard
        user={user}
        role={user.role}
        tasks={tasks}
        team={team}
        notifications={notifications}
        onNewTask={() => setModal(true)}
        onNavigate={navigate}
      />
    );
  } else if (active === 'mytasks') {
    body = (
      <MyTasksScreen
        user={user}
        role={user.role}
        tasks={tasks}
        team={team}
        onNewTask={() => setModal(true)}
        onTaskUpdated={handleTaskUpdated}
      />
    );
  } else if (active === 'projects') {
    body = (
      <ProjectsList
        role={user.role}
        projects={projects}
        onNavigate={navigate}
        onProjectCreated={(proj) => {
          setProjects(prev => [...prev, proj]);
          navigate('PRJ-' + String(proj.id).padStart(3, '0'));
        }}
      />
    );
  } else if (active === 'inbox') {
    body = (
      <NotificationsScreen
        role={user.role}
        notifications={notifications}
        onMarkRead={async (id) => {
          await API.put(`/notifications/${id}/read`);
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
        onMarkAllRead={async () => {
          await API.put('/notifications/read-all');
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
      />
    );
  } else if (active === 'team') {
    body = <TeamScreen role={user.role} team={team} currentUser={user} />;
  } else if (active === 'settings') {
    body = <AdminSettings role={user.role} user={user} />;
  } else if (active.startsWith('PRJ-')) {
    body = (
      <ProjectDetail
        role={user.role}
        view={view}
        drawer={drawer}
        modal={modal}
        project={currentProject}
        tasks={projectTasks}
        team={team}
        user={user}
        onViewChange={setView}
        onDrawerOpen={(t) => setDrawer(t)}
        onDrawerClose={() => setDrawer(null)}
        onModalOpen={() => setModal(true)}
        onModalClose={() => setModal(false)}
        onTaskCreated={handleTaskCreated}
        onTaskUpdated={handleTaskUpdated}
      />
    );
  }

  // Global "New task" modal — rendered outside ProjectDetail so it works from Dashboard/MyTasks too
  const showGlobalModal = modal && !active.startsWith('PRJ-');

  return (
    <div className="app">
      <AppSidebar
        active={active}
        user={user}
        role={user.role}
        projectKey={projectKey}
        projects={sidebarProjects}
        counts={{ dashboard: null, inbox: unreadCount || null, mytasks: myTasksCount || null }}
        onNavigate={navigate}
        onLogout={logout}
      />
      <div className="main" style={{ position: 'relative' }}>
        {body}
        {showGlobalModal && (
          <NewTaskModal
            projects={projects}
            team={team}
            user={user}
            onClose={() => setModal(false)}
            onCreated={handleTaskCreated}
          />
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
