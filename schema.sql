CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'Member' CHECK (role IN ('Admin', 'Member')),
  title VARCHAR(100) DEFAULT 'Team Member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  key VARCHAR(10) NOT NULL,
  description TEXT DEFAULT '',
  color VARCHAR(20) DEFAULT '#3a4978',
  status VARCHAR(30) DEFAULT 'active',
  owner_id INTEGER REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, key)
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(30) DEFAULT 'todo' CHECK (status IN ('todo','in_progress','review','done')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical','high','medium','low')),
  assignee_id INTEGER REFERENCES users(id),
  created_by INTEGER REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
