# Student Organizer — Standard Operating Procedure (SOP)

> Last updated: 2026-04-24
> Purpose: fast reference for running, extending, and deploying the app so new work does not require re-exploring the codebase.

---

## 1. What this app is

Full-stack React + Express web app bundling student productivity tools: Tasks (with subtasks), Notes, Journal, Study Zone (Deep Focus / Pomodoro / Casual timers), Flashcards (Leitner spaced repetition), Timetable, Exam Countdown, Progress charts, Study Vault (file uploads), and Settings.

- **Auth**: Supabase (email + password)
- **App data**: Express + PostgreSQL backend (`/api/*`)
- **File storage**: Supabase Storage bucket `study-vault`
- **Frontend deploy**: Netlify (auto-deploy from GitHub)
- **Backend deploy**: Render (auto-deploy from GitHub)

---

## 2. Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite 5, react-router-dom, framer-motion, recharts, @supabase/supabase-js |
| Backend | Node.js, Express 5, `pg` (PostgreSQL client), Multer (uploads), CORS |
| DB | PostgreSQL on Render (app data) + Supabase (auth + vault) |
| Deploy | Netlify (frontend) + Render (backend + Postgres), both auto-deploy from GitHub `main` |

---

## 3. Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ running locally (or a hosted DB URL)
- A Supabase project (free tier is fine) with:
  - Auth enabled (email provider)
  - Storage bucket `study-vault` (private)
  - Tables from `supabase-setup.sql` applied

---

## 4. First-time setup

```bash
# 1. Install backend deps
cd backend
npm install

# 2. Install frontend deps
cd ../frontend
npm install

# 3. Apply Supabase schema
#    Open Supabase Dashboard → SQL Editor → paste supabase-setup.sql → Run

# 4. Create local Postgres database
psql -U postgres -c "CREATE DATABASE student_organizer;"

# 5. Create env files (see section 5)
```

Tables on the Express side auto-create on first server boot (`backend/database/database.js`).

---

## 5. Environment variables

### `backend/.env`
```env
DATABASE_URL=postgres://postgres:<password>@localhost:5432/student_organizer
PORT=5000
ALLOWED_ORIGINS=http://localhost:5173,https://<your-frontend-domain>
```

### `frontend/.env`
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_URL=http://localhost:5000   # prod: set to Render backend URL in Netlify env
```

---

## 6. Running locally

Open two terminals:

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:5000` (see `frontend/vite.config.js`).

---

## 7. Directory map

```
Student_organizer/
├── backend/
│   ├── server.js              # Express app, CORS, route mounting
│   ├── database/database.js   # PG pool + table bootstrap
│   ├── routes/
│   │   ├── tasks.js, notes.js, journal.js
│   │   ├── subtasks.js, flashcards.js, exams.js
│   │   ├── timetable.js, studySessions.js, userData.js
│   │   ├── semesters.js, subjects.js, materials.js
│   │   └── studyvault.js      # hierarchical read
│   └── uploads/               # Multer destination (local only)
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Routes + providers
│   │   ├── main.jsx
│   │   ├── pages/             # Dashboard, Tasks, Notes, Flashcards, Timetable, StudyZone, etc.
│   │   ├── components/        # Sidebar, BottomNav, FloatingTimer, Layout, Modal, ProtectedRoute
│   │   ├── contexts/          # AuthContext, AppContext, StudyTimerContext, ThemeContext
│   │   ├── utils/api.js       # REST client for the Express backend
│   │   └── lib/supabase.js    # Supabase client
│   ├── vite.config.js
│   └── netlify.toml
├── supabase-setup.sql         # Auth-aware tables + RLS + storage bucket
├── vercel.json                # SPA rewrite + build config
└── SOP.md                     # this file
```

---

## 8. Database schema (local Postgres)

| Table | Key columns |
|-------|-------------|
| `tasks` | title, subject, priority, due_date, completed, completed_at |
| `subtasks` | task_id (FK), title, completed |
| `notes` | title, content, category, favorite |
| `journal` | date (UNIQUE), title, content, mood |
| `flashcard_decks` | title, subject |
| `flashcards` | deck_id, front, back, box (1–5), next_review |
| `exams` | title, subject, exam_date, color |
| `timetable_entries` | title, subject, day_of_week (0–6), start_time, end_time, color, location |
| `study_sessions` | mode, duration, start_time, end_time, subject |
| `study_log` | date (UNIQUE), minutes |
| `user_data` | key (PK), value (JSONB) — streaks, badges, totalStudyMinutes |
| `semesters`, `subjects`, `materials` | legacy local vault (now handled via Supabase) |

Supabase-side tables (auth-scoped, RLS on): `profiles`, `vault_semesters`, `vault_subjects`, `vault_materials`.

---

## 9. Common dev tasks

### Add a new feature with its own resource

1. **Backend**
   - Add table in `backend/database/database.js` (CREATE TABLE IF NOT EXISTS)
   - Create `backend/routes/<resource>.js` following the pattern in `tasks.js`
   - Register it in `backend/server.js`: `app.use('/api/<resource>', require('./routes/<resource>'))`
2. **Frontend**
   - Add API functions in `frontend/src/utils/api.js`
   - Add state + CRUD functions in `frontend/src/contexts/AppContext.jsx`
   - Create page in `frontend/src/pages/<Feature>.jsx` + sibling `.css`
   - Register route in `frontend/src/App.jsx` (inside `<ProtectedRoute>` + `<Layout>`)
   - Add nav entry in `frontend/src/components/Sidebar.jsx` and `BottomNav.jsx`

### Add a field to an existing table
- Add `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` block to `backend/database/database.js`
- Update the route's INSERT/UPDATE handler
- Update the `api.js` payload + the form / modal that writes it

### Change the theme / accent
Handled at runtime by `ThemeContext`; persisted to localStorage. No code change needed — use Settings page.

---

## 10. Deployment

Both services auto-deploy from the GitHub repo on every push to `main`. To ship a change: commit → push → both Netlify and Render pick it up.

```bash
git add .
git commit -m "…"
git push origin main
```

### Frontend → Netlify
- Config: `frontend/netlify.toml` (base dir `frontend/`, publish `dist/`, build `npm run build`)
- Netlify site is connected to the GitHub repo; builds trigger on push to `main`
- **Env vars** (Netlify → Site settings → Environment variables):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` — set to the Render backend URL (e.g. `https://student-organizer-api.onrender.com`)
- SPA fallback: all routes rewrite to `/index.html` (handled by `netlify.toml`)
- `vercel.json` is present but not used — safe to leave or delete

### Backend → Render
- Render service (Web Service) is connected to the GitHub repo
- **Build command**: `cd backend && npm install`
- **Start command**: `cd backend && npm start`
- **Env vars** (Render → Environment):
  - `DATABASE_URL` — Render Postgres internal URL
  - `PORT` — Render injects this; Express reads `process.env.PORT`
  - `ALLOWED_ORIGINS` — Netlify URL (e.g. `https://<site>.netlify.app`), comma-separated if multiple
- **Database**: Render Postgres add-on. Tables bootstrap automatically on first boot via `backend/database/database.js`
- **Free tier caveat**: Render free web services sleep after 15 min idle — first request after sleep takes ~30s to wake
- **Uploads caveat**: Render's filesystem is **ephemeral** — files written to `backend/uploads/` disappear on redeploy. Migrate Multer uploads to Supabase Storage before relying on persistence

### Deploy checklist
1. Push to `main`
2. Watch Netlify build log (Deploys tab) — confirm green
3. Watch Render build + deploy log — confirm "Live" status
4. Open the Netlify URL, log in, verify API calls hit the Render backend (Network tab)
5. If CORS errors: add the Netlify URL to Render's `ALLOWED_ORIGINS` env var and redeploy

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `CORS error` in browser | Backend `ALLOWED_ORIGINS` missing frontend URL | Add Netlify URL to Render env var `ALLOWED_ORIGINS`, redeploy |
| First API call takes ~30s | Render free tier cold start | Expected; upgrade Render plan to keep warm, or hit a warm-up endpoint on app load |
| Deploy didn't trigger on push | Branch mismatch or service paused | Check Netlify/Render settings — service connected to correct GitHub repo + `main` branch |
| 401 on Supabase calls | Anon key missing / wrong project | Re-copy from Supabase Settings → API |
| Tables missing on backend | DB connection failed before bootstrap | Check `DATABASE_URL`, that Postgres is running |
| File upload 413 / fails in prod | Backend `uploads/` not persisted on PaaS | Switch upload to Supabase Storage |
| Timer stops on refresh | Expected — `StudyTimerContext` is in-memory | Save session before reload |
| Auth works but data is blank | Express API has no per-user scoping | Known gap; see section 12 |

---

## 12. Known gaps / future work

- **Per-user scoping on Express**: routes do not filter by `user_id`. All authenticated users see the same data. Fix: add `user_id UUID` to each table, pass Supabase JWT from frontend, verify on backend, and filter queries.
- **Uploads dir is local-only**: migrate Multer handlers to Supabase Storage for durability across deploys.
- **Legacy `backend/database.sqlite`**: unused; safe to delete once confirmed not referenced.
- **Mobile polish**: BottomNav exists but some modals render off-screen on small viewports.

---

## 13. Useful commands

```bash
# Backend
cd backend && npm run dev          # start with nodemon
cd backend && npm start            # plain node

# Frontend
cd frontend && npm run dev         # Vite dev server
cd frontend && npm run build       # production build → dist/
cd frontend && npm run preview     # preview built bundle

# Git (current branch: main)
git status
git log --oneline -10
```

---

## 14. Contacts / links

- Supabase dashboard: https://app.supabase.com
- Netlify dashboard: https://app.netlify.com
- Render dashboard: https://dashboard.render.com
- GitHub repo: source of truth — pushes to `main` trigger both deploys