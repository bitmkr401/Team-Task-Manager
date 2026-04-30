require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(__dirname));

// API routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/team',          require('./routes/team'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Team Task Manager.html'));
});

async function initSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Schema ready');
}

const PORT = process.env.PORT || 3000;

initSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Schema init failed:', err);
    process.exit(1);
  });
