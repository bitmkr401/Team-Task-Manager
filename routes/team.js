const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const wid = req.user.workspace_id;
  const { rows: users } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.title, u.created_at FROM users u WHERE u.workspace_id = $1 ORDER BY u.name`,
    [wid]
  );
  const { rows: openTasks } = await pool.query(
    `SELECT assignee_id, COUNT(*) as open_tasks FROM tasks WHERE workspace_id=$1 AND status!='done' GROUP BY assignee_id`,
    [wid]
  );
  const otMap = Object.fromEntries(openTasks.map(r => [r.assignee_id, r.open_tasks]));
  const rows = users.map(u => ({ ...u, open_tasks: otMap[u.id] || 0 }));
  res.json(rows);
});

router.post('/invite', requireAdmin, async (req, res) => {
  const { name, email, role, title } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const tempPassword = Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(tempPassword, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO users (workspace_id, name, email, password_hash, role, title)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role, title`,
      [req.user.workspace_id, name, email, hash, role || 'Member', title || 'Team Member']
    );
    res.status(201).json({ ...rows[0], temp_password: tempPassword });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/role', requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['Admin', 'Member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot change your own role' });

  const { rows } = await pool.query(
    'UPDATE users SET role=$1 WHERE id=$2 AND workspace_id=$3 RETURNING id, name, role',
    [role, req.params.id, req.user.workspace_id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });
  await pool.query('DELETE FROM users WHERE id=$1 AND workspace_id=$2', [req.params.id, req.user.workspace_id]);
  res.json({ ok: true });
});

module.exports = router;
