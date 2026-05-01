# Team Task Manager

A full-stack project management web app built with Express.js, Supabase, and React (via CDN). Manage projects, tasks, and team members — all in one place.

![Team Task Manager](https://img.shields.io/badge/Stack-Express%20%2B%20Supabase%20%2B%20React-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Authentication** — Signup / Login with JWT-based sessions, workspace isolation
- **Projects** — Create and manage projects with color labels, status, due dates, and member counts
- **Tasks** — Create, assign, filter, and track tasks across projects with priorities and due dates
- **Board & List views** — Kanban-style board view and sortable list view per project
- **My Tasks** — Personal task view filtered to the logged-in user
- **Team Management** — Invite members, assign roles (Admin / Member), view open task load
- **Notifications** — In-app notifications for task assignments, mark as read
- **Dashboard** — Overview of recent activity, task stats, and workload across the team
- **Demo seed data** — New workspaces are pre-populated with sample projects, tasks, and members

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (CDN + Babel Standalone), plain CSS |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Deployment | Railway |

---

## Project Structure

```
├── server.js                  # Express entry point
├── supabase.js                # Supabase client (service role)
├── middleware/
│   └── auth.js                # JWT auth middleware
├── routes/
│   ├── auth.js                # Signup, login, seed demo data
│   ├── projects.js            # CRUD for projects + members
│   ├── tasks.js               # CRUD for tasks + notifications
│   ├── team.js                # Team management + role changes
│   └── notifications.js       # Fetch + mark notifications read
├── Team Task Manager.html     # Main HTML shell (loads React via CDN)
├── shared.jsx                 # Icons, avatars, status/priority components
├── app.jsx                    # Root React app + routing
├── screen-dashboard.jsx       # Dashboard screen
├── screen-projects.jsx        # Projects list screen
├── screen-project-detail.jsx  # Project detail + task board/list
├── screen-misc.jsx            # My Tasks, Team, Notifications screens
├── screen-auth.jsx            # Login / Signup screens
├── styles.css                 # All styles
└── schema.sql                 # Database schema (run in Supabase SQL editor)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repo

```bash
git clone https://github.com/Utkarsh4305/Team-Task-Manager.git
cd Team-Task-Manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Run the contents of `schema.sql` in your Supabase project's **SQL Editor** to create all required tables.

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=your-secret-key
PORT=3000
```

### 5. Run the app

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Schema

The app uses 6 tables in Supabase:

| Table | Description |
|-------|-------------|
| `workspaces` | Tenant/workspace per signup |
| `users` | Members with role (Admin/Member) |
| `projects` | Projects with color, status, owner |
| `project_members` | Many-to-many: users ↔ projects |
| `tasks` | Tasks with status, priority, assignee, due date |
| `notifications` | In-app notifications per user |

Run `schema.sql` in your Supabase SQL Editor to initialize all tables.

---

## Deployment (Railway)

1. Push the repo to GitHub
2. Create a new project on [Railway](https://railway.app) and connect your repo
3. Add environment variables in Railway dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`
4. Railway will auto-deploy on every push to `master`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create workspace + admin account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/projects` | List all projects in workspace |
| POST | `/api/projects` | Create project (Admin only) |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin only) |
| DELETE | `/api/projects/:id` | Delete project (Admin only) |
| GET | `/api/projects/:id/members` | List project members |
| POST | `/api/projects/:id/members` | Add member to project |
| DELETE | `/api/projects/:id/members/:uid` | Remove member from project |
| GET | `/api/tasks` | List tasks (filterable by project/assignee/status) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/team` | List team members with open task counts |
| POST | `/api/team/invite` | Invite new member (Admin only) |
| PUT | `/api/team/:id/role` | Change member role (Admin only) |
| DELETE | `/api/team/:id` | Remove member (Admin only) |
| GET | `/api/notifications` | Get notifications for current user |
| PUT | `/api/notifications/read-all` | Mark all notifications read |
| PUT | `/api/notifications/:id/read` | Mark one notification read |

---

## License

MIT
