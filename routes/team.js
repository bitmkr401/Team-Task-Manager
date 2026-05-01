const express  = require('express');
const bcrypt   = require('bcryptjs');
const supabase = require('../supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const wid = req.user.workspace_id;
  const [{ data: users }, { data: openTasks }] = await Promise.all([
    supabase.from('users').select('id, name, email, role, title, created_at').eq('workspace_id', wid).order('name'),
    supabase.from('tasks').select('assignee_id').eq('workspace_id', wid).neq('status', 'done'),
  ]);

  const openMap = {};
  for (const t of openTasks || []) {
    if (t.assignee_id) openMap[t.assignee_id] = (openMap[t.assignee_id] || 0) + 1;
  }

  res.json((users || []).map(u => ({ ...u, open_tasks: openMap[u.id] || 0 })));
});

router.post('/invite', requireAdmin, async (req, res) => {
  const { name, email, role, title } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const tempPassword = Math.random().toString(36).slice(-8);
  const hash = await bcrypt.hash(tempPassword, 10);

  const { data, error } = await supabase.from('users')
    .insert({ workspace_id: req.user.workspace_id, name, email, password_hash: hash,
      role: role || 'Member', title: title || 'Team Member' })
    .select('id, name, email, role, title').single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ ...data, temp_password: tempPassword });
});

router.put('/:id/role', requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!['Admin', 'Member'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot change your own role' });

  const { data, error } = await supabase.from('users').update({ role })
    .eq('id', req.params.id).eq('workspace_id', req.user.workspace_id)
    .select('id, name, role').single();
  if (error) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' });
  await supabase.from('users').delete().eq('id', req.params.id).eq('workspace_id', req.user.workspace_id);
  res.json({ ok: true });
});

module.exports = router;
