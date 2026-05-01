import { supabase } from '../lib/supabase';

async function uid() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('Not authenticated');
    return data.user.id;
}

// --- Subjects (sourced from vault_subjects) ---
export const fetchSubjects = async () => {
    const { data, error } = await supabase
        .from('vault_subjects').select('id, title').order('title');
    if (error) throw error;
    return data || [];
};

// --- Notes ---
export const fetchNotes = async () => {
    const { data, error } = await supabase
        .from('notes').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const createNote = async (note) => {
    const user_id = await uid();
    const { data, error } = await supabase.from('notes')
        .insert({
            user_id,
            title: note.title,
            content: note.content || '',
            category: note.category || 'general',
            favorite: !!note.favorite,
        })
        .select().single();
    if (error) throw error;
    return data;
};
export const updateNote = async (id, updates) => {
    const payload = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase.from('notes')
        .update(payload).eq('id', id)
        .select().single();
    if (error) throw error;
    return data;
};
export const deleteNote = async (id) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
};

// --- Note sharing ---
export const shareNote = async (id) => {
    const { data: row } = await supabase.from('notes')
        .select('share_token').eq('id', id).single();
    if (row?.share_token) return { share_token: row.share_token };
    const token = crypto.randomUUID();
    const { data, error } = await supabase.from('notes')
        .update({ share_token: token }).eq('id', id)
        .select('share_token').single();
    if (error) throw error;
    return data;
};
export const unshareNote = async (id) => {
    const { error } = await supabase.from('notes')
        .update({ share_token: null }).eq('id', id);
    if (error) throw error;
};
export const buildNoteShareUrl = (token) => `${window.location.origin}/share/${token}`;
export const fetchSharedNote = async (token) => {
    const { data, error } = await supabase.rpc('get_shared_note', { token });
    if (error) throw error;
    return (data && data[0]) || null;
};

// --- Tasks ---
export const fetchTasks = async () => {
    const { data, error } = await supabase
        .from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const createTask = async (task) => {
    const user_id = await uid();
    const payload = {
        user_id,
        title: task.title,
        subject: task.subject || '',
        priority: task.priority || 'low',
        due_date: task.dueDate ?? task.due_date ?? null,
        completed: false,
    };
    const { data, error } = await supabase.from('tasks')
        .insert(payload).select().single();
    if (error) throw error;
    return data;
};
export const updateTask = async (id, updates) => {
    const payload = { ...updates };
    if ('completedAt' in payload) {
        payload.completed_at = payload.completedAt;
        delete payload.completedAt;
    }
    if ('dueDate' in payload) {
        payload.due_date = payload.dueDate;
        delete payload.dueDate;
    }
    const { data, error } = await supabase.from('tasks')
        .update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
export const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
};

// --- Journal ---
export const fetchJournal = async () => {
    const { data, error } = await supabase
        .from('journal').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const fetchJournalEntry = async (date) => {
    const { data, error } = await supabase
        .from('journal').select('*').eq('date', date).maybeSingle();
    if (error) throw error;
    return data;
};
export const saveJournalEntry = async (entry) => {
    const user_id = await uid();
    const payload = {
        user_id,
        date: entry.date,
        title: entry.title || '',
        content: entry.content || '',
        mood: entry.mood || null,
        updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('journal')
        .upsert(payload, { onConflict: 'user_id,date' })
        .select().single();
    if (error) throw error;
    return data;
};
export const deleteJournalEntry = async (date) => {
    const { error } = await supabase.from('journal').delete().eq('date', date);
    if (error) throw error;
};

// --- Study Sessions ---
export const fetchStudySessions = async () => {
    const { data, error } = await supabase
        .from('study_sessions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const createStudySession = async (session) => {
    const user_id = await uid();
    const payload = {
        user_id,
        mode: session.mode,
        duration: session.duration,
        start_time: session.start_time,
        end_time: session.end_time,
        subject: session.subject || null,
    };
    const { data, error } = await supabase.from('study_sessions')
        .insert(payload).select().single();
    if (error) throw error;
    return data;
};

// --- User Data (streak, badges, totalStudyMinutes) ---
export const fetchUserData = async () => {
    const { data, error } = await supabase
        .from('user_data').select('key, value');
    if (error) throw error;
    return Object.fromEntries((data || []).map(r => [r.key, r.value]));
};
export const saveUserData = async (key, value) => {
    const user_id = await uid();
    const { error } = await supabase.from('user_data')
        .upsert({ user_id, key, value }, { onConflict: 'user_id,key' });
    if (error) throw error;
};

// --- Study Log ---
export const fetchStudyLog = async () => {
    const { data, error } = await supabase
        .from('study_log').select('date, minutes').order('date', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const logStudyTime = async (date, minutes) => {
    const user_id = await uid();
    const { data: existing } = await supabase.from('study_log')
        .select('minutes').eq('user_id', user_id).eq('date', date).maybeSingle();
    const total = (existing?.minutes ?? 0) + minutes;
    const { data, error } = await supabase.from('study_log')
        .upsert({ user_id, date, minutes: total }, { onConflict: 'user_id,date' })
        .select().single();
    if (error) throw error;
    return data;
};

// --- Flashcards ---
export const fetchFlashcardDecks = async () => {
    const { data, error } = await supabase
        .from('flashcard_decks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const createFlashcardDeck = async (deck) => {
    const user_id = await uid();
    const { data, error } = await supabase.from('flashcard_decks')
        .insert({ user_id, title: deck.title, subject: deck.subject || null })
        .select().single();
    if (error) throw error;
    return data;
};
export const deleteFlashcardDeck = async (id) => {
    const { error } = await supabase.from('flashcard_decks').delete().eq('id', id);
    if (error) throw error;
};
export const fetchFlashcards = async (deckId) => {
    const { data, error } = await supabase
        .from('flashcards').select('*').eq('deck_id', deckId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const fetchReviewCards = async (deckId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
        .from('flashcards').select('*').eq('deck_id', deckId)
        .lte('next_review', today)
        .order('next_review', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const createFlashcard = async (deckId, card) => {
    const user_id = await uid();
    const { data, error } = await supabase.from('flashcards')
        .insert({ user_id, deck_id: deckId, front: card.front, back: card.back })
        .select().single();
    if (error) throw error;
    return data;
};
export const updateFlashcard = async (id, updates) => {
    const { data, error } = await supabase.from('flashcards')
        .update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
export const deleteFlashcard = async (id) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (error) throw error;
};

// --- Exams ---
export const fetchExams = async () => {
    const { data, error } = await supabase
        .from('exams').select('*').order('exam_date', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const createExam = async (exam) => {
    const user_id = await uid();
    const payload = {
        user_id,
        title: exam.title,
        subject: exam.subject || null,
        exam_date: exam.exam_date ?? exam.examDate,
        color: exam.color || '#7C5CFF',
    };
    const { data, error } = await supabase.from('exams')
        .insert(payload).select().single();
    if (error) throw error;
    return data;
};
export const updateExam = async (id, updates) => {
    const payload = { ...updates };
    if ('examDate' in payload) {
        payload.exam_date = payload.examDate;
        delete payload.examDate;
    }
    const { data, error } = await supabase.from('exams')
        .update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
export const deleteExam = async (id) => {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
};

// --- Subtasks ---
export const fetchAllSubtasks = async () => {
    const { data, error } = await supabase
        .from('subtasks').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const fetchSubtasks = async (taskId) => {
    const { data, error } = await supabase
        .from('subtasks').select('*').eq('task_id', taskId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const createSubtask = async (taskId, subtask) => {
    const user_id = await uid();
    const { data, error } = await supabase.from('subtasks')
        .insert({ user_id, task_id: taskId, title: subtask.title })
        .select().single();
    if (error) throw error;
    return data;
};
export const updateSubtask = async (id, updates) => {
    const { data, error } = await supabase.from('subtasks')
        .update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
export const deleteSubtask = async (id) => {
    const { error } = await supabase.from('subtasks').delete().eq('id', id);
    if (error) throw error;
};

// --- Timetable ---
export const fetchTimetable = async () => {
    const { data, error } = await supabase
        .from('timetable_entries').select('*').order('day_of_week', { ascending: true });
    if (error) throw error;
    return data || [];
};
export const createTimetableEntry = async (entry) => {
    const user_id = await uid();
    const payload = {
        user_id,
        title: entry.title || '',
        subject: entry.subject || '',
        day_of_week: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        color: entry.color || '#7C5CFF',
        location: entry.location || null,
    };
    const { data, error } = await supabase.from('timetable_entries')
        .insert(payload).select().single();
    if (error) throw error;
    return data;
};
export const updateTimetableEntry = async (id, updates) => {
    const payload = { ...updates };
    delete payload.id;
    delete payload.user_id;
    delete payload.created_at;
    const { data, error } = await supabase.from('timetable_entries')
        .update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
};
export const deleteTimetableEntry = async (id) => {
    const { error } = await supabase.from('timetable_entries').delete().eq('id', id);
    if (error) throw error;
};
