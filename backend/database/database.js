const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // ensure correct path if needed

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.connect(async (err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    } else {
        console.log('Connected to PostgreSQL database.');
        await initializeDatabase(client, release);
    }
});

async function initializeDatabase(client, release) {
    try {
        // Create Semesters Table
        await client.query(`CREATE TABLE IF NOT EXISTS semesters (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL
        )`);

        // Create Subjects Table
        await client.query(`CREATE TABLE IF NOT EXISTS subjects (
            id VARCHAR(255) PRIMARY KEY,
            semester_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            CONSTRAINT fk_semester FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE
        )`);

        // Create Materials Table
        await client.query(`CREATE TABLE IF NOT EXISTS materials (
            id VARCHAR(255) PRIMARY KEY,
            subject_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            "docType" VARCHAR(50),
            size VARCHAR(50),
            date VARCHAR(50),
            "fileName" VARCHAR(255),
            "fileUrl" VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_subject FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )`);

        // Create Notes Table
        await client.query(`CREATE TABLE IF NOT EXISTS notes (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            category VARCHAR(50) DEFAULT 'general',
            favorite BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Tasks Table
        await client.query(`CREATE TABLE IF NOT EXISTS tasks (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            priority VARCHAR(20) DEFAULT 'low',
            due_date VARCHAR(50),
            completed BOOLEAN DEFAULT false,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Journal Table
        await client.query(`CREATE TABLE IF NOT EXISTS journal (
            id VARCHAR(255) PRIMARY KEY,
            date VARCHAR(20) NOT NULL UNIQUE,
            title VARCHAR(255),
            content TEXT,
            mood VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Study Sessions Table
        await client.query(`CREATE TABLE IF NOT EXISTS study_sessions (
            session_id VARCHAR(255) PRIMARY KEY,
            mode VARCHAR(20) NOT NULL,
            duration INTEGER NOT NULL,
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            subject VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Study Log Table
        await client.query(`CREATE TABLE IF NOT EXISTS study_log (
            id SERIAL PRIMARY KEY,
            date VARCHAR(20) NOT NULL UNIQUE,
            minutes INTEGER DEFAULT 0
        )`);

        // Create User Data Table (streak, badges, totalStudyMinutes)
        await client.query(`CREATE TABLE IF NOT EXISTS user_data (
            key VARCHAR(255) PRIMARY KEY,
            value JSONB NOT NULL
        )`);

        // Create Flashcard Decks Table
        await client.query(`CREATE TABLE IF NOT EXISTS flashcard_decks (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Flashcards Table (Leitner spaced repetition)
        await client.query(`CREATE TABLE IF NOT EXISTS flashcards (
            id VARCHAR(255) PRIMARY KEY,
            deck_id VARCHAR(255) NOT NULL,
            front TEXT NOT NULL,
            back TEXT NOT NULL,
            box INTEGER DEFAULT 1,
            next_review DATE DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_deck FOREIGN KEY(deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
        )`);

        // Create Exams Table
        await client.query(`CREATE TABLE IF NOT EXISTS exams (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            exam_date VARCHAR(50) NOT NULL,
            color VARCHAR(20) DEFAULT '#7C5CFF',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create Subtasks Table
        await client.query(`CREATE TABLE IF NOT EXISTS subtasks (
            id VARCHAR(255) PRIMARY KEY,
            task_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_task FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )`);

        // Create Timetable Entries Table
        await client.query(`CREATE TABLE IF NOT EXISTS timetable_entries (
            id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subject VARCHAR(255),
            day_of_week INTEGER NOT NULL,
            start_time VARCHAR(10) NOT NULL,
            end_time VARCHAR(10) NOT NULL,
            color VARCHAR(20) DEFAULT '#7C5CFF',
            location VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert initial mock data if empty
        const res = await client.query('SELECT COUNT(*) as count FROM semesters');
        if (parseInt(res.rows[0].count) === 0) {
            console.log('Seeding initial database data...');
            await client.query(`INSERT INTO semesters (id, title) VALUES ('sem1', 'Semester 1'), ('sem2', 'Semester 2')`);
            await client.query(`INSERT INTO subjects (id, semester_id, title) VALUES ('sub1', 'sem1', 'Operating Systems'), ('sub2', 'sem1', 'Data Structures'), ('sub3', 'sem2', 'Database Management')`);
            await client.query(`INSERT INTO materials (id, subject_id, title, type, "docType", size, date, "fileUrl") VALUES 
                ('f1', 'sub1', 'OS Syllabus 2024.pdf', 'file', 'pdf', '1.2 MB', 'Oct 12, 2024', null),
                ('f2', 'sub1', 'Lecture 1 - Process Management.pdf', 'file', 'pdf', '3.4 MB', 'Oct 15, 2024', null),
                ('f3', 'sub1', 'Assignment 1 Solution.docx', 'file', 'doc', '245 KB', 'Oct 20, 2024', null),
                ('f4', 'sub1', 'Lab Record Setup.png', 'file', 'image', '890 KB', 'Oct 22, 2024', null),
                ('f5', 'sub2', 'DS Syllabus.pdf', 'file', 'pdf', '1.5 MB', 'Oct 10, 2024', null),
                ('f6', 'sub2', 'Trees and Graphs Notes.pdf', 'file', 'pdf', '4.1 MB', 'Nov 05, 2024', null),
                ('f7', 'sub3', 'ER Diagrams Cheat Sheet.png', 'file', 'image', '1.1 MB', 'Jan 15, 2025', null)
            `);
        }
    } catch (err) {
        console.error('Database initialization error:', err.stack);
    } finally {
        release();
    }
}

module.exports = pool;
