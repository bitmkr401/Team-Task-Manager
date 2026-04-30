const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.name as owner_name,
       (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
       (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as done_count,
       (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) as member_count
     FROM projects p
     LEFT JOIN users u ON u.id = p.owner_id
     WHERE p.workspace_id = $1
     ORDER BY p.created_at ASC`,
    [req.user.workspace_id]
  );
  res.json(rows);
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, key, description, color, due_date } = req.body;
  if (!name || !key) return res.status(400).json({ error: 'Name and key required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO projects (workspace_id, name, key, description, color, owner_id, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.workspace_id, name, key.toUpperCase(), description || '', color || '#3a4978', req.user.id, due_date || null]
    );
    const project = rows[0];
    // Add creator as member
    await client.query('INSERT INTO project_members VALUES ($1,$2)', [project.id, req.user.id]);
    await client.query('COMMIT');
    res.status(201).json(project);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Project key already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.name as owner_name FROM projects p
     LEFT JOIN users u ON u.id = p.owner_id
     WHERE p.id = $1 AND p.workspace_id = $2`,
    [req.params.id, req.user.workspace_id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, description, color, status, due_date } = req.body;
  const { rows } = await pool.query(
    `UPDATE projects SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       color = COALESCE($3, color),
       status = COALESCE($4, status),
       due_date = COALESCE($5, due_date)
     WHERE id = $6 AND workspace_id = $7 RETURNING *`,
    [name, description, color, status, due_date, req.params.id, req.user.workspace_id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id = $1 AND workspace_id = $2', [req.params.id, req.user.workspace_id]);
  res.json({ ok: true });
});

router.get('/:id/members', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.title FROM users u
     JOIN project_members pm ON pm.user_id = u.id
     WHERE pm.project_id = $1 AND u.workspace_id = $2`,
    [req.params.id, req.user.workspace_id]
  );
  res.json(rows);
});

router.post('/:id/members', requireAdmin, async (req, res) => {
  const { user_id } = req.body;
  await pool.query('INSERT INTO project_members VALUES ($1,$2) ON CONFLICT DO NOTHING', [req.params.id, user_id]);
  res.json({ ok: true });
});

router.delete('/:id/members/:uid', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM project_members WHERE project_id=$1 AND user_id=$2', [req.params.id, req.params.uid]);
  res.json({ ok: true });
});

module.exports = router;
