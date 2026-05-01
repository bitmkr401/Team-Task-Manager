const express  = require('express');
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Helper: enrich tasks with assignee_name and project info
async function enrichTasks(tasks, wid) {
  if (!tasks || tasks.length === 0) return [];

  const [{ data: users }, { data: projects }] = await Promise.all([
    supabase.from('users').select('id, name').eq('workspace_id', wid),
    supabase.from('projects').select('id, name, key, color').eq('workspace_id', wid),
  ]);

  const userMap    = Object.fromEntries((users    || []).map(u => [u.id, u]));
  const projectMap = Object.fromEntries((projects || []).map(p => [p.id, p]));

  return tasks.map(t => ({
    ...t,
    assignee_name:  userMap[t.assignee_id]?.name    || null,
    project_name:   projectMap[t.project_id]?.name  || null,
    project_key:    projectMap[t.project_id]?.key   || null,
    project_color:  projectMap[t.project_id]?.color || null,
  }));
}

router.get('/', async (req, res) => {
  const { project_id, assignee_id, status } = req.query;
  const wid = req.user.workspace_id;

  let q = supabase.from('tasks').select('*').eq('workspace_id', wid);
  if (project_id)  q = q.eq('project_id', project_id);
  if (assignee_id) q = q.eq('assignee_id', assignee_id);
  if (status)      q = q.eq('status', status);
  q = q.order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(await enrichTasks(data, wid));
});

router.post('/', async (req, res) => {
  const { project_id, title, description, status, priority, assignee_id, due_date } = req.body;
  if (!project_id || !title) return res.status(400).json({ error: 'project_id and title required' });

  const { data: task, error } = await supabase.from('tasks')
    .insert({
      project_id, workspace_id: req.user.workspace_id,
      title, description: description || '',
      status: status || 'todo', priority: priority || 'medium',
      assignee_id: assignee_id || null, created_by: req.user.id,
      due_date: due_date || null,
    })
    .select().single();

  if (error) return res.status(500).json({ error: error.message });

  if (assignee_id && parseInt(assignee_id) !== req.user.id) {
    await supabase.from('notifications').insert({
      workspace_id: req.user.workspace_id, user_id: assignee_id,
      type: 'assign', title: 'Task assigned to you',
      body: `"${title}" has been assigned to you by ${req.user.name}.`,
      task_id: task.id,
    });
  }

  const [enriched] = await enrichTasks([task], req.user.workspace_id);
  res.status(201).json(enriched);
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('tasks').select('*')
    .eq('id', req.params.id).eq('workspace_id', req.user.workspace_id).single();
  if (error) return res.status(404).json({ error: 'Not found' });
  const [enriched] = await enrichTasks([data], req.user.workspace_id);
  res.json(enriched);
});

router.put('/:id', async (req, res) => {
  const { title, description, status, priority, assignee_id, due_date } = req.body;
  const updates = { updated_at: new Date().toISOString() };
  if (title       !== undefined) updates.title       = title;
  if (description !== undefined) updates.description = description;
  if (status      !== undefined) updates.status      = status;
  if (priority    !== undefined) updates.priority    = priority;
  if (assignee_id !== undefined) updates.assignee_id = assignee_id || null;
  if (due_date    !== undefined) updates.due_date    = due_date || null;

  const { data: old } = await supabase.from('tasks').select('assignee_id, title').eq('id', req.params.id).single();
  const { data, error } = await supabase.from('tasks').update(updates)
    .eq('id', req.params.id).eq('workspace_id', req.user.workspace_id).select().single();
  if (error) return res.status(404).json({ error: error.message });

  if (assignee_id && assignee_id !== old?.assignee_id && parseInt(assignee_id) !== req.user.id) {
    await supabase.from('notifications').insert({
      workspace_id: req.user.workspace_id, user_id: assignee_id,
      type: 'assign', title: 'Task assigned to you',
      body: `"${data.title}" has been assigned to you.`, task_id: data.id,
    });
  }

  const [enriched] = await enrichTasks([data], req.user.workspace_id);
  res.json(enriched);
});

router.delete('/:id', async (req, res) => {
  await supabase.from('tasks').delete().eq('id', req.params.id).eq('workspace_id', req.user.workspace_id);
  res.json({ ok: true });
});

module.exports = router;
