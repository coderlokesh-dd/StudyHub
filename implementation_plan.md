# Implement 5 New Features for StudyHub

Add Pomodoro Timer, Flashcards, Exam Countdown, Task Subtasks, and Timetable to the Student Organizer app.

## Proposed Changes

### Feature 1: Pomodoro Timer

Extend the existing study timer to support a Pomodoro mode (25 min work → 5 min break → repeat, with a 15 min long break every 4 cycles).

#### [MODIFY] [StudyTimerContext.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/contexts/StudyTimerContext.jsx)
- Add Pomodoro state: `pomodoroPhase` (work/shortBreak/longBreak), `pomodoroCount` (cycle number)
- When mode is `pomodoro`, auto-switch between work (25 min) and break phases
- Play audio notification on phase change

#### [MODIFY] [FloatingTimer.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/components/FloatingTimer.jsx)
- Show current phase label (Work / Break) and cycle count (e.g. "🍅 2/4") in the timer pill
- Color-code: red-ish for work, green-ish for break

#### [MODIFY] [StudyZone.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/StudyZone.jsx)
- Add third mode card: "Pomodoro" with 🍅 icon
- Setup screen: configurable work/break/long-break durations, number of cycles, subject

---

### Feature 2: Flashcards with Spaced Repetition

#### [MODIFY] [database.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/database/database.js)
- Add `flashcard_decks` table (id, title, subject, created_at)
- Add `flashcards` table (id, deck_id FK, front, back, box INT DEFAULT 1, next_review DATE, created_at)

#### [NEW] [flashcards.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/routes/flashcards.js)
- CRUD routes for decks: GET/POST/DELETE `/api/flashcards/decks`
- CRUD routes for cards: GET/POST/PUT/DELETE `/api/flashcards/decks/:deckId/cards`
- Review route: GET `/api/flashcards/decks/:deckId/review` — returns cards due for review

#### [MODIFY] [server.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/server.js)
- Register flashcards router

#### [NEW] [Flashcards.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Flashcards.jsx)
- Deck list view with create/delete
- Card manager: add front/back cards to a deck
- Review mode: 3D flip-card animation, "Got it" / "Missed it" buttons that move card between Leitner boxes

#### [NEW] [Flashcards.css](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Flashcards.css)

#### [MODIFY] [api.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/utils/api.js)
- Add flashcard API functions

---

### Feature 3: Exam Countdown

#### [MODIFY] [database.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/database/database.js)
- Add `exams` table (id, title, subject, exam_date, color, created_at)

#### [NEW] [exams.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/routes/exams.js)
- CRUD routes: GET/POST/PUT/DELETE `/api/exams`

#### [MODIFY] [server.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/server.js)
- Register exams router

#### [MODIFY] [Dashboard.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Dashboard.jsx)
- Add "Upcoming Exams" section with countdown cards showing days/hours remaining
- Add a "+" button to create new exams via modal

#### [MODIFY] [AppContext.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/contexts/AppContext.jsx)
- Add exams state, fetch/add/delete exams functions

#### [MODIFY] [api.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/utils/api.js)
- Add exam API functions

---

### Feature 4: Task Subtasks

#### [MODIFY] [database.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/database/database.js)
- Add `subtasks` table (id, task_id FK on delete cascade, title, completed BOOLEAN DEFAULT false, created_at)

#### [NEW] [subtasks.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/routes/subtasks.js)
- CRUD routes: GET/POST/PUT/DELETE `/api/tasks/:taskId/subtasks`

#### [MODIFY] [server.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/server.js)
- Register subtasks router

#### [MODIFY] [Tasks.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Tasks.jsx)
- Expand task cards to show subtasks with checkboxes
- Add inline "add subtask" input
- Show subtask progress bar on parent task

#### [MODIFY] [Tasks.css](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Tasks.css)

#### [MODIFY] [api.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/utils/api.js)
- Add subtask API functions

---

### Feature 5: Timetable / Schedule Planner

#### [MODIFY] [database.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/database/database.js)
- Add `timetable_entries` table (id, title, subject, day_of_week INT 0-6, start_time VARCHAR, end_time VARCHAR, color, location, created_at)

#### [NEW] [timetable.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/routes/timetable.js)
- CRUD routes: GET/POST/PUT/DELETE `/api/timetable`

#### [MODIFY] [server.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/backend/server.js)
- Register timetable router

#### [NEW] [Timetable.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Timetable.jsx)
- Weekly grid view (Mon-Sun rows × time columns)
- Colored blocks for each class/study session
- Current time indicator line
- Click to add/edit entries via modal

#### [NEW] [Timetable.css](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/pages/Timetable.css)

---

### Navigation Updates

#### [MODIFY] [App.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/App.jsx)
- Add routes: `/flashcards`, `/timetable`

#### [MODIFY] [Sidebar.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/components/Sidebar.jsx)
- Add nav items: Flashcards (🃏), Timetable (📅)

#### [MODIFY] [BottomNav.jsx](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/components/BottomNav.jsx)
- Add nav items: Flashcards, Timetable

#### [MODIFY] [api.js](file:///c:/Users/Lokeshwaran%20S/OneDrive/Desktop/Student_organizer/frontend/src/utils/api.js)
- Add all new API endpoint functions

---

## Verification Plan

### Manual Verification (via browser)
1. **Start the backend**: `cd backend && npm run dev`
2. **Start the frontend**: `cd frontend && npm run dev`
3. **Pomodoro Timer**: Go to Study Zone → select Pomodoro → configure and start → verify timer shows work/break phases, cycles, and auto-transitions
4. **Flashcards**: Go to Flashcards → create a deck → add cards → enter review mode → flip cards and verify Leitner box movement
5. **Exam Countdown**: Go to Dashboard → click "+" on Upcoming Exams → create an exam → verify countdown displays correctly
6. **Task Subtasks**: Go to Tasks → expand a task → add subtasks → toggle subtask completion → verify progress bar updates
7. **Timetable**: Go to Timetable → add class entries → verify weekly grid renders correctly with current time indicator
