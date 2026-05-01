const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workspace';
}

// ── Signup ────────────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password, workspace } = req.body;
  if (!name || !email || !password || !workspace)
    return res.status(400).json({ error: 'All fields required' });

  try {
    // Check email unique
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Create workspace (upsert by slug)
    const slug = slugify(workspace);
    const { data: ws, error: wsErr } = await supabase
      .from('workspaces').insert({ name: workspace, slug }).select().single();
    if (wsErr) return res.status(500).json({ error: wsErr.message });

    // Create admin user
    const hash = await bcrypt.hash(password, 10);
    const { data: user, error: userErr } = await supabase.from('users')
      .insert({ workspace_id: ws.id, name, email, password_hash: hash, role: 'Admin', title: 'Workspace Admin' })
      .select('id, name, email, role, title, workspace_id').single();
    if (userErr) return res.status(500).json({ error: userErr.message });

    // Seed demo data in background
    seedDemo(ws.id, user.id).catch(console.error);

    const token = makeToken(user.id);
    res.json({ token, user: { ...user, workspace: ws.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { data: user } = await supabase.from('users').select('*, workspaces(name)').eq('email', email).maybeSingle();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = makeToken(user.id);
  res.json({
    token,
    user: {
      id: user.id, name: user.name, email: user.email,
      role: user.role, title: user.title,
      workspace_id: user.workspace_id,
      workspace: user.workspaces?.name || '',
    },
  });
});

// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const { data } = await supabase.from('users').select('*, workspaces(name)').eq('id', req.user.id).single();
  res.json({ ...data, workspace: data.workspaces?.name || '' });
});

// ── Demo seed ─────────────────────────────────────────────────────────────────
async function seedDemo(workspaceId, adminId) {
  const demoHash = await bcrypt.hash('demo1234', 10);

  const memberData = [
    { name: 'Devon Reyes',  email: 'devon@acme.com',  title: 'Frontend Engineer', role: 'Member' },
    { name: 'Mira Okafor',  email: 'mira@acme.com',   title: 'Product Manager',   role: 'Member' },
    { name: 'Jake Larsson',  email: 'jake@acme.com',   title: 'Backend Engineer',  role: 'Member' },
    { name: 'Priya Menon',  email: 'priya@acme.com',  title: 'QA Lead',           role: 'Member' },
    { name: 'Sam Nguyen',   email: 'sam@acme.com',    title: 'DevOps Engineer',   role: 'Member' },
  ];

  const memberIds = [];
  for (const m of memberData) {
    const emailKey = m.email.replace('@', `_ws${workspaceId}@`); // make unique per workspace
    const { data: u } = await supabase.from('users')
      .insert({ workspace_id: workspaceId, name: m.name, email: emailKey,
        password_hash: demoHash, role: m.role, title: m.title })
      .select('id').single();
    if (u) memberIds.push(u.id);
  }

  const projectData = [
    { name: 'Mobile App v2.0',        key: 'MOB', color: '#b5462a', description: 'Redesign and rebuild the mobile app.' },
    { name: 'API Gateway Migration',  key: 'API', color: '#3a4978', description: 'Migrate to new API gateway.' },
    { name: 'Billing Refactor',       key: 'BIL', color: '#5c7a5a', description: 'Refactor billing pipeline.' },
    { name: 'Q3 Growth Experiments',  key: 'GRO', color: '#b48a2c', description: 'A/B tests and growth initiatives.' },
    { name: 'Data Warehouse Cleanup', key: 'DAT', color: '#7a5d8c', description: 'Clean up legacy data warehouse.' },
    { name: 'SOC 2 Audit Prep',       key: 'OPS', color: '#a83a2c', description: 'Prepare for SOC 2 certification.' },
  ];

  const projectIds = [];
  for (const p of projectData) {
    const { data: proj } = await supabase.from('projects')
      .insert({ workspace_id: workspaceId, owner_id: adminId, ...p })
      .select('id').single();
    if (proj) projectIds.push(proj.id);
  }

  const allMembers = [adminId, ...memberIds];
  const memberRows = projectIds.flatMap(pid => allMembers.map(uid => ({ project_id: pid, user_id: uid })));
  await supabase.from('project_members').insert(memberRows);

  const due = (d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
  };

  const taskData = [
    { pi: 0, title: 'Implement push notifications',      status: 'in_progress', priority: 'high',     ai: 0, due: due(3)  },
    { pi: 0, title: 'Fix login screen crash on iOS 17',  status: 'review',      priority: 'critical', ai: 1, due: due(-1) },
    { pi: 0, title: 'Dark mode support',                 status: 'todo',        priority: 'medium',   ai: 2, due: due(7)  },
    { pi: 0, title: 'App store screenshot refresh',      status: 'todo',        priority: 'low',      ai: 3, due: due(14) },
    { pi: 1, title: 'Set up Kong gateway routes',        status: 'in_progress', priority: 'high',     ai: 4, due: due(2)  },
    { pi: 1, title: 'Rate limiting middleware',          status: 'todo',        priority: 'medium',   ai: 0, due: due(5)  },
    { pi: 1, title: 'Auth token passthrough',            status: 'review',      priority: 'high',     ai: 1, due: due(0)  },
    { pi: 2, title: 'Migrate Stripe webhooks',           status: 'todo',        priority: 'critical', ai: 2, due: due(1)  },
    { pi: 2, title: 'Refactor invoice generation',       status: 'in_progress', priority: 'medium',   ai: 3, due: due(6)  },
    { pi: 3, title: 'Onboarding flow A/B test',          status: 'in_progress', priority: 'high',     ai: 4, due: due(4)  },
    { pi: 3, title: 'Email capture experiment',          status: 'done',        priority: 'medium',   ai: 0, due: due(-3) },
    { pi: 4, title: 'Archive tables older than 2021',    status: 'todo',        priority: 'low',      ai: 1, due: due(10) },
    { pi: 4, title: 'Index optimization pass',           status: 'in_progress', priority: 'medium',   ai: 2, due: due(8)  },
    { pi: 5, title: 'Gather access logs',                status: 'done',        priority: 'high',     ai: 3, due: due(-5) },
    { pi: 5, title: 'Draft security policy doc',         status: 'in_progress', priority: 'high',     ai: 4, due: due(3)  },
    { pi: 5, title: 'Vendor risk assessments',           status: 'todo',        priority: 'medium',   ai: 0, due: due(12) },
  ];

  const taskRows = taskData.map(t => ({
    project_id: projectIds[t.pi],
    workspace_id: workspaceId,
    title: t.title,
    status: t.status,
    priority: t.priority,
    assignee_id: allMembers[t.ai] || adminId,
    created_by: adminId,
    due_date: t.due,
  }));
  await supabase.from('tasks').insert(taskRows);

  await supabase.from('notifications').insert([
    { workspace_id: workspaceId, user_id: adminId, type: 'assign',  title: 'Task assigned to you',    body: 'Fix login screen crash on iOS 17 has been assigned to you.' },
    { workspace_id: workspaceId, user_id: adminId, type: 'comment', title: 'New comment on your task', body: 'Jake left a comment on "Set up Kong gateway routes".' },
    { workspace_id: workspaceId, user_id: adminId, type: 'due',     title: 'Task due tomorrow',        body: 'Rate limiting middleware is due tomorrow.' },
  ]);
}

module.exports = router;
