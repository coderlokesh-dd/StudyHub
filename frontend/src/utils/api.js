const API_BASE = 'http://localhost:5000/api';

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

// --- Notes ---
export const fetchNotes = () => request('/notes');
export const createNote = (note) => request('/notes', { method: 'POST', body: JSON.stringify(note) });
export const updateNote = (id, updates) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const deleteNote = (id) => request(`/notes/${id}`, { method: 'DELETE' });

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
