const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE user_id=$1 AND workspace_id=$2 ORDER BY created_at DESC LIMIT 50`,
    [req.user.id, req.user.workspace_id]
  );
  res.json(rows);
});

router.put('/:id/read', async (req, res) => {
  await pool.query(
    'UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user.id]
  );
  res.json({ ok: true });
});

router.put('/read-all', async (req, res) => {
  await pool.query(
    'UPDATE notifications SET read=true WHERE user_id=$1 AND workspace_id=$2',
    [req.user.id, req.user.workspace_id]
  );
  res.json({ ok: true });
});

module.exports = router;
