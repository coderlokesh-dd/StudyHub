# Student Organizer — Standard Operating Procedure (SOP)

> Last updated: 2026-05-01
> Purpose: fast reference for running, extending, and deploying the app so new work does not require re-exploring the codebase.

---

## 1. What this app is

React + Vite SPA bundling student productivity tools: Tasks (with subtasks), Notes (shareable), Journal, Study Zone (Deep Focus / Pomodoro / Casual timers), Timetable, Exam Countdown, Progress charts, Study Vault (file uploads), and Settings. Flashcards (Leitner spaced repetition) is scaffolded — the page exists but is not routed and not yet shipped.

- **Auth**: Supabase (email + password)
- **App data**: Supabase Postgres, RLS-scoped per user (`auth.uid() = user_id`)
- **File storage**: Supabase Storage bucket `study-vault`
- **Frontend deploy**: Netlify (auto-deploy from GitHub `main`)
- **Backend**: none — the frontend talks to Supabase directly via `@supabase/supabase-js`

---

## 2. Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite 5, react-router-dom, framer-motion, recharts, @supabase/supabase-js |
| Data + Auth + Storage | Supabase (single project) |
| Deploy | Netlify (auto-deploy from GitHub `main`) |

---

## 3. Prerequisites

- Node.js 18+ and npm
- A Supabase project (free tier is fine) with:
  - Auth enabled (email provider)
  - Storage bucket `study-vault` (private)
  - Tables + RLS policies from `supabase-setup.sql` applied

---

## 4. First-time setup

```bash
# 1. Install frontend deps
cd frontend
npm install

# 2. Apply Supabase schema
#    Open Supabase Dashboard → SQL Editor → paste supabase-setup.sql → Run

# 3. Create env file (see section 5)
```

Step 2 creates every app table (`notes`, `tasks`, `subtasks`, `journal`, `flashcard_decks`, `flashcards`, `exams`, `timetable_entries`, `study_sessions`, `study_log`, `user_data`) plus the vault tables and the `get_shared_note` RPC. RLS is on for everything.

---

## 5. Environment variables

### `frontend/.env`
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Optional dev-only auto-login (`frontend/.env.development.local`):
```env
VITE_DEV_AUTO_LOGIN=true
VITE_DEV_EMAIL=<your-test-account>
VITE_DEV_PASSWORD=<your-test-password>
```

---

## 6. Running locally

```bash
cd frontend && npm run dev   # http://localhost:5173
```

That's it — no backend process. The frontend hits Supabase's hosted API directly.

---

## 7. Directory map

```
Student_organizer/
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Routes + providers
│   │   ├── main.jsx
│   │   ├── pages/             # Dashboard, Tasks, Notes, Flashcards, Timetable, StudyZone, SharedNote, etc.
│   │   ├── components/        # Sidebar, BottomNav, FloatingTimer, Layout, Modal, ProtectedRoute
│   │   ├── contexts/          # AuthContext, AppContext, StudyTimerContext, ThemeContext
│   │   ├── utils/api.js       # Supabase client wrappers (CRUD per resource)
│   │   └── lib/supabase.js    # Supabase client
│   ├── vite.config.js
│   └── netlify.toml
├── supabase-setup.sql         # Tables + RLS + storage bucket + share RPC
└── SOP.md                     # this file
```

---

## 8. Database schema (Supabase Postgres)

Every table has `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL` plus 4 RLS policies (`select` / `insert` / `update` / `delete`) gating on `auth.uid() = user_id`. Inserts must include `user_id` from the JWT; updates and deletes auto-scope via RLS.

| Table | Key columns |
|-------|-------------|
| `profiles` | `id` (= `auth.users.id`), first_name, last_name, username, email, dob, school_type, school_name, address, phone |
| `notes` | title, content, category, favorite, share_token (UNIQUE) |
| `tasks` | title, subject, priority, due_date, completed, completed_at |
| `subtasks` | task_id (FK→tasks ON DELETE CASCADE), title, completed |
| `journal` | date, title, content, mood — UNIQUE (user_id, date) |
| `flashcard_decks` | title, subject |
| `flashcards` | deck_id (FK→flashcard_decks ON DELETE CASCADE), front, back, box (1–5), next_review |
| `exams` | title, subject, exam_date, color |
| `timetable_entries` | title, subject, day_of_week (0–6), start_time, end_time, color, location |
| `study_sessions` | session_id (PK), mode, duration, start_time, end_time, subject |
| `study_log` | date, minutes — UNIQUE (user_id, date) |
| `user_data` | (user_id, key) composite PK, value (JSONB) — streak, badges, totalStudyMinutes |
| `vault_semesters` | title |
| `vault_subjects` | semester_id (FK→vault_semesters ON DELETE CASCADE), title |
| `vault_materials` | subject_id (FK→vault_subjects ON DELETE CASCADE), file_name, file_url, file_type, file_size, storage_path |

**Public RPC**: `get_shared_note(token TEXT)` — `SECURITY DEFINER` Postgres function callable from the anon role via `supabase.rpc('get_shared_note', { token })`. Returns the note matching `share_token`. Bypasses RLS only for that single lookup; nothing else is exposed to anon.

**Storage bucket** `study-vault` (private): RLS policies require the path prefix `<auth.uid()>/...`. See section 5 of `supabase-setup.sql`.

---

## 9. Routes

| Path | Type | Renders |
|------|------|---------|
| `/` | Public | Landing page. If a Supabase session exists, redirects to `/dashboard` |
| `/landing` | Public | Redirects to `/` (alias for old links / bookmarks) |
| `/credits` | Public | Credits page (creator profile, interests, tech stack, contact) |
| `/legal` | Public | Privacy + Terms (anchors `#privacy` and `#terms`) |
| `/roadmap` | Public | Upcoming + Changelog (anchors `#upcoming` and `#changelog`) |
| `/privacy` | Public | Redirects → `/legal#privacy` |
| `/terms` | Public | Redirects → `/legal#terms` |
| `/changelog` | Public | Redirects → `/roadmap#changelog` |
| `/contact` | Public | Redirects → `/credits#contact` |
| `/share/:token` | Public | Read-only shared note + .txt download (uses `get_shared_note` RPC) |
| `/dashboard` | Protected | Dashboard (streak, tasks, exams, badges) |
| `/notes` | Protected | Notes |
| `/tasks` | Protected | Tasks |
| `/journal` | Protected | Journal list |
| `/journal/:date` | Protected | Single-day journal entry |
| `/study-zone` | Protected | Study Zone (timers) |
| `/timetable` | Protected | Timetable |
| `/progress` | Protected | Progress charts |
| `/vault` | Protected | Study Vault |
| `/settings` | Protected | Settings (footer links to Credits / Legal / Roadmap / Contact) |
| `*` | — | Catch-all → `/` |

Auth gate (`frontend/src/components/ProtectedRoute.jsx`): unauthenticated users hitting any protected route are redirected to `/`. Landing.jsx handles the inverse — if a session is found, it pushes the user to `/dashboard`.

**Scaffolded but not routed**: `frontend/src/pages/Flashcards.jsx` + `Flashcards.css` exist on disk; the page is not registered in `App.jsx` and not linked from Sidebar/BottomNav. To ship: add the route, add the nav entries, then move the upcoming roadmap item to the changelog.

Dev-only auto-login (`AuthContext.jsx`) reads `VITE_DEV_AUTO_LOGIN` from `frontend/.env.development.local`. Set to `true` to skip the form on `npm run dev`; set to `false` to land on `/` like a fresh visitor would.

---

## 10. Common dev tasks

### Add a new feature with its own resource

1. **Database (Supabase SQL Editor)** — append to `supabase-setup.sql` and run only the new block:
   ```sql
   CREATE TABLE IF NOT EXISTS <name> (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     -- table-specific columns
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ALTER TABLE <name> ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "<name>_select_own" ON <name> FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "<name>_insert_own" ON <name> FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "<name>_update_own" ON <name> FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "<name>_delete_own" ON <name> FOR DELETE USING (auth.uid() = user_id);
   ```
2. **Frontend**
   - Add Supabase wrappers in `frontend/src/utils/api.js`. Every `insert` must include `user_id: await uid()`; updates/deletes rely on RLS.
   - Add state + CRUD functions in `frontend/src/contexts/AppContext.jsx`. Consume the row returned by `.select().single()` (don't pre-generate IDs — Postgres assigns UUIDs).
   - Create page in `frontend/src/pages/<Feature>.jsx` + sibling `.css`.
   - Register route in `frontend/src/App.jsx` inside the `<ProtectedRoute><Layout /></ProtectedRoute>` block.
   - Add nav entry in `frontend/src/components/Sidebar.jsx` and `BottomNav.jsx`.

### Add a field to an existing table
- Run `ALTER TABLE <name> ADD COLUMN IF NOT EXISTS <col> <type>;` in the Supabase SQL Editor.
- Update the `api.js` payload + the form / modal that writes it.

### Change the theme / accent
Handled at runtime by `ThemeContext`; persisted to localStorage. No code change needed — use Settings page.

---

## 11. Deployment

Frontend auto-deploys to Netlify on every push to `main`.

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
- SPA fallback: all routes rewrite to `/index.html` (handled by `netlify.toml`)
- `vercel.json` is present but not used — safe to leave or delete

### Deploy checklist
1. Push to `main`
2. Watch Netlify build log (Deploys tab) — confirm green
3. Open the Netlify URL, sign in, smoke-test core pages

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Pages render but data is empty | Not signed in, or RLS not seeing JWT | Confirm Supabase session exists; check Network tab — Supabase requests should carry `Authorization: Bearer …` |
| 401 on Supabase calls | Anon key missing / wrong project | Re-copy from Supabase Settings → API |
| Insert fails with `row-level security` error | `user_id` missing from payload or doesn't match `auth.uid()` | Check `api.js` — every insert must include `user_id: await uid()` |
| Storage upload fails with permission error | Object path missing `<user_id>/` prefix | Storage RLS uses `split_part(name, '/', 1) = auth.uid()::text`; build the path as `${user.id}/${file.name}` |
| Timer stops on refresh | Expected — `StudyTimerContext` is in-memory | Save session before reload |
| Supabase project paused | Free tier auto-pauses after ~1 week of inactivity | Open the Supabase dashboard and click "Restore project" |

---

## 13. Known gaps / future work

- **Mobile polish**: BottomNav exists but some modals render off-screen on small viewports.
- **Flashcards not routed**: `pages/Flashcards.jsx` is scaffolded but not linked from `App.jsx` / nav.

Closed by the 2026-05-01 migration: per-user scoping (now enforced by RLS), Render Postgres 30-day expiry, ephemeral Multer uploads, legacy local Postgres + sqlite.

---

## 14. Useful commands

```bash
# Frontend
cd frontend && npm run dev         # Vite dev server
cd frontend && npm run build       # production build → dist/
cd frontend && npm run preview     # preview built bundle

# Git (current branch: main)
git status
git log --oneline -10
```

---

## 15. Contacts / links

- Supabase dashboard: https://app.supabase.com
- Netlify dashboard: https://app.netlify.com
- GitHub repo: source of truth — pushes to `main` trigger Netlify deploy
