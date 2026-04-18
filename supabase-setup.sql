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
-- DONE! Your Supabase backend is ready.
-- ============================================================
