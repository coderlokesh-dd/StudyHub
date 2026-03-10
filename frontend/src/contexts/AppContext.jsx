import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadData, saveData, resetData } from '../utils/storage';
import { evaluateBadges, generateId } from '../utils/helpers';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [data, setData] = useState(() => loadData());

    // Persist whenever data changes
    useEffect(() => { saveData(data); }, [data]);

    // Re-evaluate badges after data changes
    useEffect(() => {
        const { badges, changed } = evaluateBadges(data);
        if (changed) {
            setData(prev => ({ ...prev, badges }));
        }
    }, [data.notes.length, data.tasks, data.streak.current]);

    // ---------- NOTES ----------
    const addNote = useCallback((note) => {
        const now = new Date().toISOString();
        const newNote = { ...note, id: generateId(), createdAt: now, updatedAt: now, favorite: false };
        setData(prev => ({ ...prev, notes: [newNote, ...prev.notes] }));
    }, []);

    const updateNote = useCallback((id, updates) => {
        setData(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
        }));
    }, []);

    const deleteNote = useCallback((id) => {
        setData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== id) }));
    }, []);

    const toggleFavorite = useCallback((id) => {
        setData(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n),
        }));
    }, []);

    // ---------- TASKS ----------
    const addTask = useCallback((task) => {
        const newTask = { ...task, id: generateId(), completed: false, createdAt: new Date().toISOString() };
        setData(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    }, []);

    const updateTask = useCallback((id, updates) => {
        setData(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
    }, []);

    const toggleTask = useCallback((id) => {
        setData(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => {
                if (t.id !== id) return t;
                const completed = !t.completed;
                return { ...t, completed, completedAt: completed ? new Date().toISOString() : undefined };
            }),
        }));
    }, []);

    const deleteTask = useCallback((id) => {
        setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    }, []);

    // ---------- STUDY LOG ----------
    const logStudyTime = useCallback((minutes) => {
        const today = new Date().toISOString().split('T')[0];
        setData(prev => {
            const log = [...prev.studyLog];
            const existing = log.find(e => e.date === today);
            if (existing) {
                existing.minutes += minutes;
            } else {
                log.push({ date: today, minutes });
            }

            // Update streak
            const streak = { ...prev.streak };
            if (streak.lastStudyDate !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                if (streak.lastStudyDate === yesterday) {
                    streak.current += 1;
                } else {
                    streak.current = 1;
                }
                streak.lastStudyDate = today;
                streak.longest = Math.max(streak.longest, streak.current);
            }

            return {
                ...prev,
                studyLog: log,
                streak,
                totalStudyMinutes: prev.totalStudyMinutes + minutes,
            };
        });
    }, []);

    // ---------- RESET ----------
    const resetAllData = useCallback(() => {
        const freshData = resetData();
        setData(freshData);
    }, []);

    const value = {
        notes: data.notes,
        tasks: data.tasks,
        studyLog: data.studyLog,
        streak: data.streak,
        badges: data.badges,
        totalStudyMinutes: data.totalStudyMinutes,
        addNote, updateNote, deleteNote, toggleFavorite,
        addTask, updateTask, toggleTask, deleteTask,
        logStudyTime, resetAllData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
