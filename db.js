const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  // Production / Supabase
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Supabase
    max: 10,
    idleTimeoutMillis: 30000,
  });
} else {
  // Local dev fallback — in-memory PostgreSQL (data resets on restart)
  console.warn('⚠  No DATABASE_URL found — using in-memory database (pg-mem). Set DATABASE_URL in .env to use Supabase.');
  const { newDb } = require('pg-mem');
  const db = newDb();
  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
}

module.exports = pool;
