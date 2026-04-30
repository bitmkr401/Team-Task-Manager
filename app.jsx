/* App — auth + stateful single-page navigation */

function App() {
  // Auth state: 'checking' | 'auth' | 'app'
  const [authState, setAuthState] = React.useState('checking');
  const [user,      setUser]      = React.useState(null);

  // Nav & UI state
  const [active,  setActive]  = React.useState('dashboard');
  const [view,    setView]    = React.useState('list');
  const [drawer,  setDrawer]  = React.useState(null);
  const [modal,   setModal]   = React.useState(false);

  // Data state
  const [projects,      setProjects]      = React.useState([]);
  const [tasks,         setTasks]         = React.useState([]);
  const [team,          setTeam]          = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [projectTasks,  setProjectTasks]  = React.useState([]);  // tasks for current project

  // Check stored token on mount
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthState('auth'); return; }
    API.setToken(token);
    API.get('/auth/me')
      .then(u => { setUser(u); setAuthState('app'); })
      .catch(() => { API.setToken(null); setAuthState('auth'); });
  }, []);

  // Load workspace data when authenticated
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

  // Load project-specific tasks when navigating to a project
  const loadProjectTasks = async (projectId) => {
    try {
      const t = await API.get(`/tasks?project_id=${projectId}`);
      setProjectTasks(t);
    } catch (e) {
      console.error(e);
    }
  };

  const navigate = (id) => {
    setDrawer(null);
    setModal(false);
    setActive(id);
    if (id.startsWith('PRJ-')) {
      setView('list');
      // Find numeric project id from active key
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

  // Resolve current project
  const currentProject = React.useMemo(() => {
    if (!active.startsWith('PRJ-')) return null;
    const numId = parseInt(active.replace('PRJ-', ''));
    return projects.find(p => p.id === numId) || null;
  }, [active, projects]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const myTasksCount = tasks.filter(t => t.assignee_id === (user && user.id) && t.status !== 'done').length;

  // Build sidebar projects list from real projects
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
  if (active === 'dashboard' || active === 'mytasks' || active === 'cal') {
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
        onTaskCreated={(t) => {
          setProjectTasks(prev => [t, ...prev]);
          setTasks(prev => [t, ...prev]);
          setModal(false);
        }}
        onTaskUpdated={(t) => {
          setProjectTasks(prev => prev.map(x => x.id === t.id ? t : x));
          setTasks(prev => prev.map(x => x.id === t.id ? t : x));
        }}
      />
    );
  }

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
      <div className="main">{body}</div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
