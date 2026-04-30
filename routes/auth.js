const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

router.post('/signup', async (req, res) => {
  const { name, email, password, workspace } = req.body;
  if (!name || !email || !password || !workspace) {
    return res.status(400).json({ error: 'All fields required' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create workspace
    const slug = slugify(workspace) || 'workspace';
    const wsResult = await client.query(
      'INSERT INTO workspaces (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET name = $1 RETURNING *',
      [workspace, slug]
    );
    const ws = wsResult.rows[0];

    // Check email not taken
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (workspace_id, name, email, password_hash, role, title)
       VALUES ($1, $2, $3, $4, 'Admin', 'Workspace Admin') RETURNING id, name, email, role, title, workspace_id`,
      [ws.id, name, email, hash]
    );
    const user = userResult.rows[0];

    // Seed demo data
    await seedDemo(client, ws.id, user.id);

    await client.query('COMMIT');
    const token = makeToken(user.id);
    res.json({ token, user: { ...user, workspace: ws.name } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const { rows } = await pool.query(
    `SELECT u.*, w.name as workspace_name FROM users u
     JOIN workspaces w ON w.id = u.workspace_id
     WHERE u.email = $1`,
    [email]
  );
  if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = makeToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.title,
      workspace_id: user.workspace_id,
      workspace: user.workspace_name,
    },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.title, u.workspace_id, w.name as workspace
     FROM users u JOIN workspaces w ON w.id = u.workspace_id WHERE u.id = $1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

async function seedDemo(client, workspaceId, adminId) {
  const memberData = [
    { name: 'Devon Reyes',   email: 'devon@acme.com',   title: 'Frontend Engineer',     role: 'Member' },
    { name: 'Mira Okafor',   email: 'mira@acme.com',    title: 'Product Manager',        role: 'Member' },
    { name: 'Jake Larsson',  email: 'jake@acme.com',    title: 'Backend Engineer',       role: 'Member' },
    { name: 'Priya Menon',   email: 'priya@acme.com',   title: 'QA Lead',               role: 'Member' },
    { name: 'Sam Nguyen',    email: 'sam@acme.com',     title: 'DevOps Engineer',        role: 'Member' },
  ];

  const hash = await bcrypt.hash('demo1234', 10);
  const memberIds = [];
  for (const m of memberData) {
    const r = await client.query(
      `INSERT INTO users (workspace_id, name, email, password_hash, role, title)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [workspaceId, m.name, m.email, hash, m.role, m.title]
    );
    memberIds.push(r.rows[0].id);
  }

  const projectData = [
    { name: 'Mobile App v2.0',        key: 'MOB', color: '#b5462a', desc: 'Redesign and rebuild the mobile app.' },
    { name: 'API Gateway Migration',  key: 'API', color: '#3a4978', desc: 'Migrate to new API gateway.' },
    { name: 'Billing Refactor',       key: 'BIL', color: '#5c7a5a', desc: 'Refactor billing pipeline.' },
    { name: 'Q3 Growth Experiments',  key: 'GRO', color: '#b48a2c', desc: 'A/B tests and growth initiatives.' },
    { name: 'Data Warehouse Cleanup', key: 'DAT', color: '#7a5d8c', desc: 'Clean up legacy data warehouse.' },
    { name: 'SOC 2 Audit Prep',       key: 'OPS', color: '#a83a2c', desc: 'Prepare for SOC 2 certification.' },
  ];

  const projectIds = [];
  for (const p of projectData) {
    const r = await client.query(
      `INSERT INTO projects (workspace_id, name, key, color, description, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (workspace_id, key) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [workspaceId, p.name, p.key, p.color, p.desc, adminId]
    );
    projectIds.push(r.rows[0].id);
  }

  // Add all members to all projects
  const allMembers = [adminId, ...memberIds];
  for (const pid of projectIds) {
    for (const uid of allMembers) {
      await client.query(
        'INSERT INTO project_members VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [pid, uid]
      );
    }
  }

  // Seed tasks
  const now = new Date();
  const due = (d) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
  };

  const taskData = [
    { proj: 0, title: 'Implement push notifications', status: 'in_progress', prio: 'high',     assignee: 0, due: due(3)  },
    { proj: 0, title: 'Fix login screen crash on iOS 17', status: 'review',      prio: 'critical', assignee: 1, due: due(-1) },
    { proj: 0, title: 'Dark mode support',             status: 'todo',        prio: 'medium',   assignee: 2, due: due(7)  },
    { proj: 0, title: 'App store screenshot refresh',  status: 'todo',        prio: 'low',      assignee: 3, due: due(14) },
    { proj: 1, title: 'Set up Kong gateway routes',    status: 'in_progress', prio: 'high',     assignee: 4, due: due(2)  },
    { proj: 1, title: 'Rate limiting middleware',      status: 'todo',        prio: 'medium',   assignee: 0, due: due(5)  },
    { proj: 1, title: 'Auth token passthrough',        status: 'review',      prio: 'high',     assignee: 1, due: due(0)  },
    { proj: 2, title: 'Migrate Stripe webhooks',       status: 'todo',        prio: 'critical', assignee: 2, due: due(1)  },
    { proj: 2, title: 'Refactor invoice generation',   status: 'in_progress', prio: 'medium',   assignee: 3, due: due(6)  },
    { proj: 3, title: 'Onboarding flow A/B test',      status: 'in_progress', prio: 'high',     assignee: 4, due: due(4)  },
    { proj: 3, title: 'Email capture experiment',      status: 'done',        prio: 'medium',   assignee: 0, due: due(-3) },
    { proj: 4, title: 'Archive tables older than 2021',status: 'todo',        prio: 'low',      assignee: 1, due: due(10) },
    { proj: 4, title: 'Index optimization pass',       status: 'in_progress', prio: 'medium',   assignee: 2, due: due(8)  },
    { proj: 5, title: 'Gather access logs',            status: 'done',        prio: 'high',     assignee: 3, due: due(-5) },
    { proj: 5, title: 'Draft security policy doc',     status: 'in_progress', prio: 'high',     assignee: 4, due: due(3)  },
    { proj: 5, title: 'Vendor risk assessments',       status: 'todo',        prio: 'medium',   assignee: 0, due: due(12) },
  ];

  for (const t of taskData) {
    await client.query(
      `INSERT INTO tasks (project_id, workspace_id, title, status, priority, assignee_id, created_by, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        projectIds[t.proj],
        workspaceId,
        t.title,
        t.status,
        t.prio,
        allMembers[t.assignee],
        adminId,
        t.due,
      ]
    );
  }

  // Seed notifications for admin
  const notifData = [
    { type: 'assign',   title: 'Task assigned to you',       body: 'Fix login screen crash on iOS 17 has been assigned to you.' },
    { type: 'comment',  title: 'New comment on your task',   body: 'Jake left a comment on "Set up Kong gateway routes".' },
    { type: 'due',      title: 'Task due tomorrow',           body: 'Rate limiting middleware is due tomorrow.' },
  ];
  for (const n of notifData) {
    await client.query(
      `INSERT INTO notifications (workspace_id, user_id, type, title, body)
       VALUES ($1,$2,$3,$4,$5)`,
      [workspaceId, adminId, n.type, n.title, n.body]
    );
  }
}

module.exports = router;
