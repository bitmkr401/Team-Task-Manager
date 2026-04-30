/* Login / Signup screen */

function AuthScreen({ onSuccess = () => {} }) {
  const [tab, setTab] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [workspace, setWorkspace] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [serverErr, setServerErr] = React.useState('');

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8 && tab === 'signup') e.password = 'Min. 8 characters';
    if (tab === 'signup' && !name.trim()) e.name = 'Required';
    if (tab === 'signup' && !workspace.trim()) e.workspace = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerErr('');
    try {
      let data;
      if (tab === 'login') {
        data = await API.post('/auth/login', { email, password });
      } else {
        data = await API.post('/auth/signup', { name, email, password, workspace });
      }
      API.setToken(data.token);
      onSuccess(data.token, data.user);
    } catch (err) {
      setServerErr(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className="auth">
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sb-mark" style={{ width: 28, height: 28, fontSize: 14 }}>N</div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>Northwind</div>
        </div>

        <div className="auth-form">
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 26, margin: 0, letterSpacing: '-0.02em' }}>
              {tab === 'login' ? 'Sign in to your workspace' : 'Create your account'}
            </h1>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>
              {tab === 'login'
                ? 'Welcome back. Pick up where the team left off.'
                : 'Free for the first 5 members. No card required.'}
            </div>
          </div>

          <div className="seg" style={{ marginBottom: 18 }}>
            <div className={`seg-i ${tab === 'login' ? 'on' : ''}`} onClick={() => { setTab('login'); setErrors({}); setServerErr(''); }}>Sign in</div>
            <div className={`seg-i ${tab === 'signup' ? 'on' : ''}`} onClick={() => { setTab('signup'); setErrors({}); setServerErr(''); }}>Sign up</div>
          </div>

          {tab === 'signup' && (
            <div className="field">
              <label className="field-l">Full name</label>
              <input className="input" placeholder="Devon Reyes" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleKey} />
              {errors.name && <div className="help err">{errors.name}</div>}
            </div>
          )}

          <div className="field">
            <label className="field-l">Work email</label>
            <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey} />
            {errors.email && <div className="help err">{errors.email}</div>}
          </div>

          <div className="field">
            <label className="field-l" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Password</span>
            </label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey} />
            {errors.password && <div className="help err">{errors.password}</div>}
            {tab === 'signup' && !errors.password && <div className="help">Min. 8 characters, including one number.</div>}
          </div>

          {tab === 'signup' && (
            <div className="field">
              <label className="field-l">Workspace name</label>
              <input className="input" placeholder="Acme Corp" value={workspace} onChange={e => setWorkspace(e.target.value)} onKeyDown={handleKey} />
              {errors.workspace && <div className="help err">{errors.workspace}</div>}
            </div>
          )}

          {serverErr && (
            <div style={{ background: 'rgba(181,70,42,.12)', border: '1px solid rgba(181,70,42,.3)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--rust)', marginBottom: 8 }}>
              {serverErr}
            </div>
          )}

          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ width: '100%', height: 36, marginTop: 6, fontSize: 13, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Please wait…' : (tab === 'login' ? 'Sign in' : 'Create workspace')} {!loading && <Ico.arrowR />}
          </button>

          {tab === 'login' && (
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, textAlign: 'center' }}>
              Demo: sign up to create a workspace with pre-loaded sample tasks.
            </div>
          )}

          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 22, textAlign: 'center' }}>
            By continuing you agree to the <span style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Terms</span> and <span style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Privacy Policy</span>.
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
          v2.4.1 · status: all systems operational
        </div>
      </div>

      {/* Right rail */}
      <div className="auth-right">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(247,243,236,.5)', letterSpacing: '0.04em' }}>
          NORTHWIND · TEAM TASK MANAGEMENT
        </div>

        <div>
          <div style={{ fontSize: 28, lineHeight: 1.25, letterSpacing: '-0.02em', maxWidth: 360, fontWeight: 500, textWrap: 'pretty' }}>
            One workspace for projects, people, and the work that ties them together.
          </div>

          <div style={{ marginTop: 32, display: 'grid', gap: 14, fontSize: 13, color: 'rgba(247,243,236,.75)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--terra)', marginTop: 8, flexShrink: 0 }} />
              <span>Role-based access for admins and members, scoped per project.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--terra)', marginTop: 8, flexShrink: 0 }} />
              <span>Dashboards that surface what's overdue, what's blocked, and who's overloaded.</span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--terra)', marginTop: 8, flexShrink: 0 }} />
              <span>List, board, and timeline views — flip between them without losing context.</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(247,243,236,.6)' }}>
          <AvStack names={['Mira Okafor','Devon Reyes','Anya Krause','Sam Whitfield','Jules Tan']} max={5} />
          <span>Trusted by 4,000+ product teams</span>
        </div>

        <div aria-hidden style={{
          position: 'absolute', right: -120, top: -120, width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(181,70,42,.35), transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', left: -80, bottom: -80, width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92,122,90,.18), transparent 70%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
