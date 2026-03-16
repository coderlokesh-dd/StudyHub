import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { evaluateBadges, generateId } from '../utils/helpers';
import * as api from '../utils/api';

const AppContext = createContext();

const DEFAULT_STREAK = { current: 0, longest: 0, lastStudyDate: null };
const DEFAULT_BADGES = [
    { id: 'first-note', name: 'First Note', icon: '📝', description: 'Created your first note', unlocked: false },
    { id: 'five-notes', name: 'Note Taker', icon: '📚', description: 'Created 5 notes', unlocked: false },
    { id: 'first-task', name: 'Task Master', icon: '✅', description: 'Completed your first task', unlocked: false },
    { id: 'streak-3', name: 'On Fire', icon: '🔥', description: '3-day study streak', unlocked: false },
    { id: 'streak-7', name: 'Week Warrior', icon: '⚡', description: '7-day study streak', unlocked: false },
    { id: 'streak-30', name: 'Monthly Master', icon: '🏆', description: '30-day study streak', unlocked: false },
    { id: 'ten-tasks', name: 'Productivity Pro', icon: '🚀', description: 'Completed 10 tasks', unlocked: false },
    { id: 'night-owl', name: 'Night Owl', icon: '🦉', description: 'Study after midnight', unlocked: false },
];

export function AppProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [journal, setJournal] = useState([]);
    const [studySessions, setStudySessions] = useState([]);
    const [studyLog, setStudyLog] = useState([]);
    const [streak, setStreak] = useState(DEFAULT_STREAK);
    const [badges, setBadges] = useState(DEFAULT_BADGES);
    const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
    const [loading, setLoading] = useState(true);

    // Load all data from backend on mount
    useEffect(() => {
        async function loadAll() {
            try {
                const [notesData, tasksData, journalData, sessionsData, logData, userData] = await Promise.all([
                    api.fetchNotes(),
                    api.fetchTasks(),
                    api.fetchJournal(),
                    api.fetchStudySessions(),
                    api.fetchStudyLog(),
                    api.fetchUserData(),
                ]);

                // Map DB column names to frontend camelCase
                setNotes(notesData.map(n => ({
                    id: n.id, title: n.title, content: n.content, category: n.category,
                    favorite: n.favorite, createdAt: n.created_at, updatedAt: n.updated_at,
                })));
                setTasks(tasksData.map(t => ({
                    id: t.id, title: t.title, subject: t.subject, priority: t.priority,
                    dueDate: t.due_date, completed: t.completed, completedAt: t.completed_at,
                    createdAt: t.created_at,
                })));
                setJournal(journalData.map(j => ({
                    id: j.id, date: j.date, title: j.title, content: j.content,
                    mood: j.mood, createdAt: j.created_at, updatedAt: j.updated_at,
                })));
                setStudySessions(sessionsData.map(s => ({
                    session_id: s.session_id, mode: s.mode, duration: s.duration,
                    start_time: s.start_time, end_time: s.end_time, subject: s.subject,
                    created_at: s.created_at,
                })));
                setStudyLog(logData.map(l => ({ date: l.date, minutes: l.minutes })));

                if (userData.streak) setStreak(userData.streak);
                if (userData.badges) setBadges(userData.badges);
                if (userData.totalStudyMinutes != null) setTotalStudyMinutes(userData.totalStudyMinutes);
            } catch (err) {
                console.error('Failed to load data from backend:', err);
            } finally {
                setLoading(false);
            }
        }
        loadAll();
    }, []);

    // Re-evaluate badges
    useEffect(() => {
        if (loading) return;
        const data = { notes, tasks, streak, badges };
        const { badges: newBadges, changed } = evaluateBadges(data);
        if (changed) {
            setBadges(newBadges);
            api.saveUserData('badges', newBadges).catch(console.error);
        }
    }, [notes.length, tasks, streak.current, loading]);

    // ---------- NOTES ----------
    const addNote = useCallback(async (note) => {
        const now = new Date().toISOString();
        const newNote = { id: generateId(), ...note, favorite: false };
        await api.createNote(newNote);
        setNotes(prev => [{ ...newNote, createdAt: now, updatedAt: now }, ...prev]);
    }, []);

    const updateNote = useCallback(async (id, updates) => {
        await api.updateNote(id, updates);
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
    }, []);

    const deleteNote = useCallback(async (id) => {
        await api.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
    }, []);

    const toggleFavorite = useCallback(async (id) => {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        const newFav = !note.favorite;
        await api.updateNote(id, { favorite: newFav });
        setNotes(prev => prev.map(n => n.id === id ? { ...n, favorite: newFav } : n));
    }, [notes]);

    // ---------- TASKS ----------
    const addTask = useCallback(async (task) => {
        const newTask = { id: generateId(), ...task };
        await api.createTask(newTask);
        setTasks(prev => [{ ...newTask, completed: false, createdAt: new Date().toISOString() }, ...prev]);
    }, []);

    const updateTaskFn = useCallback(async (id, updates) => {
        await api.updateTask(id, updates);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }, []);

    const toggleTask = useCallback(async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const completed = !task.completed;
        const completedAt = completed ? new Date().toISOString() : null;
        await api.updateTask(id, { completed, completedAt });
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed, completedAt } : t));
    }, [tasks]);

    const deleteTaskFn = useCallback(async (id) => {
        await api.deleteTask(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    // ---------- STUDY LOG ----------
    const logStudyTimeFn = useCallback(async (minutes) => {
        const today = new Date().toISOString().split('T')[0];
        await api.logStudyTime(today, minutes);

        setStudyLog(prev => {
            const log = [...prev];
            const existing = log.find(e => e.date === today);
            if (existing) { existing.minutes += minutes; }
            else { log.push({ date: today, minutes }); }
            return log;
        });

        // Update streak
        setStreak(prev => {
            const s = { ...prev };
            if (s.lastStudyDate !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                s.current = s.lastStudyDate === yesterday ? s.current + 1 : 1;
                s.lastStudyDate = today;
                s.longest = Math.max(s.longest, s.current);
            }
            api.saveUserData('streak', s).catch(console.error);
            return s;
        });

        setTotalStudyMinutes(prev => {
            const newTotal = prev + minutes;
            api.saveUserData('totalStudyMinutes', newTotal).catch(console.error);
            return newTotal;
        });
    }, []);

    // ---------- STUDY SESSIONS ----------
    const addStudySession = useCallback(async (session) => {
        await api.createStudySession(session);
        setStudySessions(prev => [session, ...prev]);
    }, []);

    // ---------- JOURNAL ----------
    const getJournalEntry = useCallback((date) => {
        return journal.find(j => j.date === date) || null;
    }, [journal]);

    const saveJournalEntryFn = useCallback(async (date, { title, content, mood }) => {
        const existing = journal.find(j => j.date === date);
        const id = existing ? existing.id : 'j-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        await api.saveJournalEntry({ id, date, title, content, mood });

        const now = new Date().toISOString();
        if (existing) {
            setJournal(prev => prev.map(j => j.date === date ? { ...j, title, content, mood, updatedAt: now } : j));
        } else {
            setJournal(prev => [{ id, date, title, content, mood, createdAt: now, updatedAt: now }, ...prev]);
        }
    }, [journal]);

    const deleteJournalEntryFn = useCallback(async (date) => {
        await api.deleteJournalEntry(date);
        setJournal(prev => prev.filter(j => j.date !== date));
    }, []);

    // ---------- RESET ----------
    const resetAllData = useCallback(() => {
        // For now, just clear local state. A full reset endpoint could be added later.
        setNotes([]);
        setTasks([]);
        setJournal([]);
        setStudySessions([]);
        setStudyLog([]);
        setStreak(DEFAULT_STREAK);
        setBadges(DEFAULT_BADGES);
        setTotalStudyMinutes(0);
    }, []);

    const value = {
        notes,
        tasks,
        studyLog,
        streak,
        badges,
        totalStudyMinutes,
        journal,
        studySessions,
        loading,
        addNote, updateNote, deleteNote, toggleFavorite,
        addTask, updateTask: updateTaskFn, toggleTask, deleteTask: deleteTaskFn,
        logStudyTime: logStudyTimeFn, addStudySession, resetAllData,
        getJournalEntry, saveJournalEntry: saveJournalEntryFn, deleteJournalEntry: deleteJournalEntryFn,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
