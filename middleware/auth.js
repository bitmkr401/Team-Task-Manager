const jwt = require('jsonwebtoken');
const pool = require('../db');

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, workspace_id, name, email, role, title FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!rows.length) return res.status(401).json({ error: 'User not found' });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
