-- ============================================================
-- Supabase Setup Script for Student Organizer
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. PROFILES TABLE (stores extra user info from registration)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    dob DATE,
    school_type TEXT,
    school_name TEXT,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. SEMESTERS TABLE
CREATE TABLE IF NOT EXISTS vault_semesters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own semesters"
    ON vault_semesters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own semesters"
    ON vault_semesters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own semesters"
    ON vault_semesters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own semesters"
    ON vault_semesters FOR DELETE USING (auth.uid() = user_id);

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS vault_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    semester_id UUID REFERENCES vault_semesters(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subjects"
    ON vault_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects"
    ON vault_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects"
    ON vault_subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects"
    ON vault_subjects FOR DELETE USING (auth.uid() = user_id);

-- 4. MATERIALS TABLE (file metadata only)
CREATE TABLE IF NOT EXISTS vault_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES vault_subjects(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vault_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own materials"
    ON vault_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own materials"
    ON vault_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own materials"
    ON vault_materials FOR DELETE USING (auth.uid() = user_id);

-- 5. STORAGE BUCKET
-- Create a storage bucket called "study-vault"
-- Go to Storage in Supabase Dashboard and create a bucket named "study-vault"
-- Set it to PRIVATE (not public)
-- Then add these RLS policies:

-- Storage policies (run in SQL editor):
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-vault', 'study-vault', false)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to own folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'study-vault'
        AND split_part(name, '/', 1) = auth.uid()::text
    );

-- Allow users to view their own files
CREATE POLICY "Users can view own files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'study-vault'
        AND split_part(name, '/', 1) = auth.uid()::text
    );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'study-vault'
        AND split_part(name, '/', 1) = auth.uid()::text
    );

-- ============================================================
-- 6. APP DATA TABLES (migrated from Render Postgres → Supabase)
-- All RLS-on with auth.uid() = user_id scoping.
-- ============================================================

-- NOTES
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    favorite BOOLEAN DEFAULT false,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_select_own" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notes_insert_own" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update_own" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notes_delete_own" ON notes FOR DELETE USING (auth.uid() = user_id);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT DEFAULT '',
    priority TEXT DEFAULT 'low',
    due_date TEXT,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_select_own" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- SUBTASKS
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subtasks_select_own" ON subtasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subtasks_insert_own" ON subtasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subtasks_update_own" ON subtasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "subtasks_delete_own" ON subtasks FOR DELETE USING (auth.uid() = user_id);

-- JOURNAL
CREATE TABLE IF NOT EXISTS journal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL,
    title TEXT,
    content TEXT,
    mood TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, date)
);
ALTER TABLE journal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_select_own" ON journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal_insert_own" ON journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update_own" ON journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_delete_own" ON journal FOR DELETE USING (auth.uid() = user_id);

-- FLASHCARD DECKS
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flashcard_decks_select_own" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "flashcard_decks_insert_own" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "flashcard_decks_update_own" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "flashcard_decks_delete_own" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- FLASHCARDS
CREATE TABLE IF NOT EXISTS flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    box INTEGER DEFAULT 1,
    next_review DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flashcards_select_own" ON flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "flashcards_insert_own" ON flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "flashcards_update_own" ON flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "flashcards_delete_own" ON flashcards FOR DELETE USING (auth.uid() = user_id);

-- EXAMS
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT,
    exam_date TEXT NOT NULL,
    color TEXT DEFAULT '#7C5CFF',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exams_select_own" ON exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "exams_insert_own" ON exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exams_update_own" ON exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exams_delete_own" ON exams FOR DELETE USING (auth.uid() = user_id);

-- TIMETABLE ENTRIES
CREATE TABLE IF NOT EXISTS timetable_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    subject TEXT DEFAULT '',
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    color TEXT DEFAULT '#7C5CFF',
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timetable_entries_select_own" ON timetable_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timetable_entries_insert_own" ON timetable_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timetable_entries_update_own" ON timetable_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "timetable_entries_delete_own" ON timetable_entries FOR DELETE USING (auth.uid() = user_id);

-- STUDY SESSIONS (PK is session_id, not id)
CREATE TABLE IF NOT EXISTS study_sessions (
    session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mode TEXT NOT NULL,
    duration INTEGER NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_sessions_select_own" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_sessions_insert_own" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_sessions_update_own" ON study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "study_sessions_delete_own" ON study_sessions FOR DELETE USING (auth.uid() = user_id);

-- STUDY LOG
CREATE TABLE IF NOT EXISTS study_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL,
    minutes INTEGER DEFAULT 0,
    UNIQUE (user_id, date)
);
ALTER TABLE study_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_log_select_own" ON study_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_log_insert_own" ON study_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_log_update_own" ON study_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "study_log_delete_own" ON study_log FOR DELETE USING (auth.uid() = user_id);

-- USER DATA (composite PK, no surrogate id)
CREATE TABLE IF NOT EXISTS user_data (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    PRIMARY KEY (user_id, key)
);
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_data_select_own" ON user_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_data_insert_own" ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_data_update_own" ON user_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_data_delete_own" ON user_data FOR DELETE USING (auth.uid() = user_id);

-- 7. PUBLIC NOTE SHARE FUNCTION
-- SECURITY DEFINER bypasses RLS but only returns rows matching the exact token.
CREATE OR REPLACE FUNCTION get_shared_note(token TEXT)
RETURNS TABLE (title TEXT, content TEXT, category TEXT, updated_at TIMESTAMPTZ)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    SELECT title, content, category, updated_at
    FROM notes WHERE share_token = token LIMIT 1;
$$;
REVOKE ALL ON FUNCTION get_shared_note(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_shared_note(TEXT) TO anon, authenticated;

-- ============================================================
-- DONE! Your Supabase backend is ready.
-- ============================================================
