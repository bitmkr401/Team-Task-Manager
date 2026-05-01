const express  = require('express');
const supabase = require('../supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data } = await supabase.from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('workspace_id', req.user.workspace_id)
    .order('created_at', { ascending: false })
    .limit(50);
  res.json(data || []);
});

// Must come before /:id/read
router.put('/read-all', async (req, res) => {
  await supabase.from('notifications').update({ read: true })
    .eq('user_id', req.user.id).eq('workspace_id', req.user.workspace_id);
  res.json({ ok: true });
});

router.put('/:id/read', async (req, res) => {
  await supabase.from('notifications').update({ read: true })
    .eq('id', req.params.id).eq('user_id', req.user.id);
  res.json({ ok: true });
});

module.exports = router;
