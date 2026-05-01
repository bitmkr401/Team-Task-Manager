const express  = require('express');
const supabase = require('../supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const wid = req.user.workspace_id;

    const { data: projects, error: projErr } = await supabase
      .from('projects').select('*').eq('workspace_id', wid).order('created_at');
    if (projErr) return res.status(500).json({ error: projErr.message });
    if (!projects || projects.length === 0) return res.json([]);

    const projectIds = projects.map(p => p.id);
    const ownerIds = [...new Set(projects.map(p => p.owner_id).filter(Boolean))];

    const [{ data: taskRows }, { data: memRows }, { data: owners }] = await Promise.all([
      supabase.from('tasks').select('project_id, status').eq('workspace_id', wid),
      supabase.from('project_members').select('project_id, user_id').in('project_id', projectIds),
      ownerIds.length ? supabase.from('users').select('id, name').in('id', ownerIds) : { data: [] },
    ]);

    const ownerMap = Object.fromEntries((owners || []).map(u => [u.id, u.name]));
    const tasksByProject = {};
    for (const t of taskRows || []) {
      if (!tasksByProject[t.project_id]) tasksByProject[t.project_id] = [];
      tasksByProject[t.project_id].push(t);
    }
    const memCount = {};
    for (const m of memRows || []) {
      memCount[m.project_id] = (memCount[m.project_id] || 0) + 1;
    }

    const rows = projects.map(p => {
      const tasks = tasksByProject[p.id] || [];
      return {
        ...p,
        owner_name: ownerMap[p.owner_id] || null,
        task_count: tasks.length,
        done_count: tasks.filter(t => t.status === 'done').length,
        member_count: memCount[p.id] || 0,
      };
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, key, description, color, due_date } = req.body;
  if (!name || !key) return res.status(400).json({ error: 'Name and key required' });

  const { data: project, error } = await supabase.from('projects')
    .insert({ workspace_id: req.user.workspace_id, name, key: key.toUpperCase(),
      description: description || '', color: color || '#3a4978',
      owner_id: req.user.id, due_date: due_date || null })
    .select().single();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Project key already exists' });
    return res.status(500).json({ error: error.message });
  }

  await supabase.from('project_members').insert({ project_id: project.id, user_id: req.user.id });
  res.status(201).json({ ...project, task_count: 0, done_count: 0, member_count: 1 });
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*')
    .eq('id', req.params.id).eq('workspace_id', req.user.workspace_id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  let owner_name = null;
  if (data.owner_id) {
    const { data: u } = await supabase.from('users').select('name').eq('id', data.owner_id).single();
    owner_name = u?.name || null;
  }
  res.json({ ...data, owner_name });
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, description, color, status, due_date } = req.body;
  const updates = {};
  if (name !== undefined)        updates.name = name;
  if (description !== undefined) updates.description = description;
  if (color !== undefined)       updates.color = color;
  if (status !== undefined)      updates.status = status;
  if (due_date !== undefined)    updates.due_date = due_date;

  const { data, error } = await supabase.from('projects').update(updates)
    .eq('id', req.params.id).eq('workspace_id', req.user.workspace_id).select().single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await supabase.from('projects').delete().eq('id', req.params.id).eq('workspace_id', req.user.workspace_id);
  res.json({ ok: true });
});

router.get('/:id/members', async (req, res) => {
  const { data } = await supabase.from('project_members')
    .select('users(id, name, email, role, title)')
    .eq('project_id', req.params.id);
  res.json((data || []).map(r => r.users).filter(Boolean));
});

router.post('/:id/members', requireAdmin, async (req, res) => {
  await supabase.from('project_members')
    .upsert({ project_id: req.params.id, user_id: req.body.user_id }, { ignoreDuplicates: true });
  res.json({ ok: true });
});

router.delete('/:id/members/:uid', requireAdmin, async (req, res) => {
  await supabase.from('project_members')
    .delete().eq('project_id', req.params.id).eq('user_id', req.params.uid);
  res.json({ ok: true });
});

module.exports = router;
