const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'API request failed');
    }
    return res.json();
}

// --- Subjects ---
export const fetchSubjects = () => request('/subjects');

// --- Notes ---
export const fetchNotes = () => request('/notes');
export const createNote = (note) => request('/notes', { method: 'POST', body: JSON.stringify(note) });
export const updateNote = (id, updates) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE' });

// --- Note sharing (downloadable share links) ---
export const shareNote = (id) => request(`/notes/${id}/share`, { method: 'POST' });
export const unshareNote = (id) => request(`/notes/${id}/share`, { method: 'DELETE' });
export const buildNoteShareUrl = (token) => `${API_BASE}/notes/share/${token}/download`;

// --- Tasks ---
export const fetchTasks = () => request('/tasks');
export const createTask = (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id, updates) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

// --- Journal ---
export const fetchJournal = () => request('/journal');
export const fetchJournalEntry = (date) => request(`/journal/${date}`);
export const saveJournalEntry = (entry) => request('/journal', { method: 'POST', body: JSON.stringify(entry) });
export const deleteJournalEntry = (date) => request(`/journal/${date}`, { method: 'DELETE' });

// --- Study Sessions ---
export const fetchStudySessions = () => request('/study-sessions');
export const createStudySession = (session) => request('/study-sessions', { method: 'POST', body: JSON.stringify(session) });

// --- User Data (streak, badges, totalStudyMinutes) ---
export const fetchUserData = () => request('/user-data');
export const saveUserData = (key, value) => request(`/user-data/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });

// --- Study Log ---
export const fetchStudyLog = () => request('/user-data/study-log');
export const logStudyTime = (date, minutes) => request('/user-data/study-log', { method: 'POST', body: JSON.stringify({ date, minutes }) });

// --- Flashcards ---
export const fetchFlashcardDecks = () => request('/flashcards/decks');
export const createFlashcardDeck = (deck) => request('/flashcards/decks', { method: 'POST', body: JSON.stringify(deck) });
export const deleteFlashcardDeck = (id) => request(`/flashcards/decks/${id}`, { method: 'DELETE' });
export const fetchFlashcards = (deckId) => request(`/flashcards/decks/${deckId}/cards`);
export const fetchReviewCards = (deckId) => request(`/flashcards/decks/${deckId}/review`);
export const createFlashcard = (deckId, card) => request(`/flashcards/decks/${deckId}/cards`, { method: 'POST', body: JSON.stringify(card) });
export const updateFlashcard = (id, updates) => request(`/flashcards/cards/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteFlashcard = (id) => request(`/flashcards/cards/${id}`, { method: 'DELETE' });

// --- Exams ---
export const fetchExams = () => request('/exams');
export const createExam = (exam) => request('/exams', { method: 'POST', body: JSON.stringify(exam) });
export const updateExam = (id, updates) => request(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteExam = (id) => request(`/exams/${id}`, { method: 'DELETE' });

// --- Subtasks ---
export const fetchAllSubtasks = () => request('/tasks/all/subtasks');
export const fetchSubtasks = (taskId) => request(`/tasks/${taskId}/subtasks`);
export const createSubtask = (taskId, subtask) => request(`/tasks/${taskId}/subtasks`, { method: 'POST', body: JSON.stringify(subtask) });
export const updateSubtask = (id, updates) => request(`/tasks/subtasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteSubtask = (id) => request(`/tasks/subtasks/${id}`, { method: 'DELETE' });

// --- Timetable ---
export const fetchTimetable = () => request('/timetable');
export const createTimetableEntry = (entry) => request('/timetable', { method: 'POST', body: JSON.stringify(entry) });
export const updateTimetableEntry = (id, updates) => request(`/timetable/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteTimetableEntry = (id) => request(`/timetable/${id}`, { method: 'DELETE' });
