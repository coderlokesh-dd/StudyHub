const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite DB
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});
function initializeDatabase() {
    db.serialize(() => {
        // Create Semesters Table
        db.run(`CREATE TABLE IF NOT EXISTS semesters (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL
        )`);

        // Create Subjects Table
        db.run(`CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            semester_id TEXT NOT NULL,
            title TEXT NOT NULL,
            FOREIGN KEY(semester_id) REFERENCES semesters(id) ON DELETE CASCADE
        )`);

        // Create Materials Table
        db.run(`CREATE TABLE IF NOT EXISTS materials (
            id TEXT PRIMARY KEY,
            subject_id TEXT NOT NULL,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            docType TEXT,
            size TEXT,
            date TEXT,
            fileName TEXT,
            fileUrl TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
        )`);

        // Insert initial mock data if empty
        db.get('SELECT COUNT(*) as count FROM semesters', (err, row) => {
            if (row && row.count === 0) {
                console.log('Seeding initial database data...');
                db.run(`INSERT INTO semesters (id, title) VALUES ('sem1', 'Semester 1'), ('sem2', 'Semester 2')`);
                db.run(`INSERT INTO subjects (id, semester_id, title) VALUES ('sub1', 'sem1', 'Operating Systems'), ('sub2', 'sem1', 'Data Structures'), ('sub3', 'sem2', 'Database Management')`);
                db.run(`INSERT INTO materials (id, subject_id, title, type, docType, size, date, fileUrl) VALUES 
                    ('f1', 'sub1', 'OS Syllabus 2024.pdf', 'file', 'pdf', '1.2 MB', 'Oct 12, 2024', null),
                    ('f2', 'sub1', 'Lecture 1 - Process Management.pdf', 'file', 'pdf', '3.4 MB', 'Oct 15, 2024', null),
                    ('f3', 'sub1', 'Assignment 1 Solution.docx', 'file', 'doc', '245 KB', 'Oct 20, 2024', null),
                    ('f4', 'sub1', 'Lab Record Setup.png', 'file', 'image', '890 KB', 'Oct 22, 2024', null),
                    ('f5', 'sub2', 'DS Syllabus.pdf', 'file', 'pdf', '1.5 MB', 'Oct 10, 2024', null),
                    ('f6', 'sub2', 'Trees and Graphs Notes.pdf', 'file', 'pdf', '4.1 MB', 'Nov 05, 2024', null),
                    ('f7', 'sub3', 'ER Diagrams Cheat Sheet.png', 'file', 'image', '1.1 MB', 'Jan 15, 2025', null)
                `);
            }
        });
    });
}

module.exports = db;
