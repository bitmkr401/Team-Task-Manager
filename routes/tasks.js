const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { project_id, assignee_id, status } = req.query;
  let q = `SELECT t.*, u.name as assignee_name, p.name as project_name, p.key as project_key, p.color as project_color
           FROM tasks t
           LEFT JOIN users u ON u.id = t.assignee_id
           LEFT JOIN projects p ON p.id = t.project_id
           WHERE t.workspace_id = $1`;
  const params = [req.user.workspace_id];
  let i = 2;
  if (project_id) { q += ` AND t.project_id = $${i++}`; params.push(project_id); }
  if (assignee_id) { q += ` AND t.assignee_id = $${i++}`; params.push(assignee_id); }
  if (status) { q += ` AND t.status = $${i++}`; params.push(status); }
  q += ' ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC';
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { project_id, title, description, status, priority, assignee_id, due_date } = req.body;
  if (!project_id || !title) return res.status(400).json({ error: 'project_id and title required' });

  const { rows } = await pool.query(
    `INSERT INTO tasks (project_id, workspace_id, title, description, status, priority, assignee_id, created_by, due_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      project_id,
      req.user.workspace_id,
      title,
      description || '',
      status || 'todo',
      priority || 'medium',
      assignee_id || null,
      req.user.id,
      due_date || null,
    ]
  );
  const task = rows[0];

  // Notify assignee if different from creator
  if (assignee_id && assignee_id !== req.user.id) {
    await pool.query(
      `INSERT INTO notifications (workspace_id, user_id, type, title, body, task_id)
       VALUES ($1,$2,'assign',$3,$4,$5)`,
      [req.user.workspace_id, assignee_id, 'Task assigned to you', `"${title}" has been assigned to you by ${req.user.name}.`, task.id]
    );
  }

  res.status(201).json(task);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.*, u.name as assignee_name, p.name as project_name, p.key as project_key
     FROM tasks t
     LEFT JOIN users u ON u.id = t.assignee_id
     LEFT JOIN projects p ON p.id = t.project_id
     WHERE t.id = $1 AND t.workspace_id = $2`,
    [req.params.id, req.user.workspace_id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { title, description, status, priority, assignee_id, due_date } = req.body;
  const { rows: old } = await pool.query('SELECT * FROM tasks WHERE id=$1 AND workspace_id=$2', [req.params.id, req.user.workspace_id]);
  if (!old.length) return res.status(404).json({ error: 'Not found' });

  const { rows } = await pool.query(
    `UPDATE tasks SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       status = COALESCE($3, status),
       priority = COALESCE($4, priority),
       assignee_id = COALESCE($5, assignee_id),
       due_date = COALESCE($6, due_date),
       updated_at = NOW()
     WHERE id = $7 AND workspace_id = $8 RETURNING *`,
    [title, description, status, priority, assignee_id, due_date, req.params.id, req.user.workspace_id]
  );

  // Notify new assignee if changed
  const prev = old[0];
  const next = rows[0];
  if (assignee_id && assignee_id !== prev.assignee_id && assignee_id !== req.user.id) {
    await pool.query(
      `INSERT INTO notifications (workspace_id, user_id, type, title, body, task_id)
       VALUES ($1,$2,'assign',$3,$4,$5)`,
      [req.user.workspace_id, assignee_id, 'Task assigned to you', `"${next.title}" has been assigned to you.`, next.id]
    );
  }

  res.json(rows[0]);
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id=$1 AND workspace_id=$2', [req.params.id, req.user.workspace_id]);
  res.json({ ok: true });
});

module.exports = router;
