const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/database'); // Initialize DB
const semestersRouter = require('./routes/semesters');
const subjectsRouter = require('./routes/subjects');
const materialsRouter = require('./routes/materials');
const notesRouter = require('./routes/notes');
const tasksRouter = require('./routes/tasks');
const journalRouter = require('./routes/journal');
const studySessionsRouter = require('./routes/studySessions');
const userDataRouter = require('./routes/userData');
const flashcardsRouter = require('./routes/flashcards');
const examsRouter = require('./routes/exams');
const subtasksRouter = require('./routes/subtasks');
const timetableRouter = require('./routes/timetable');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

app.use(cors({
    origin: allowedOrigins.length > 0
        ? (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
        : true, // Allow all origins in development
    credentials: true,
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/semesters', semestersRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/materials', materialsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/journal', journalRouter);
app.use('/api/study-sessions', studySessionsRouter);
app.use('/api/user-data', userDataRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/exams', examsRouter);
app.use('/api/tasks', subtasksRouter);
app.use('/api/timetable', timetableRouter);

// Compound endpoint to fetch the entire Study Vault hierarchy
app.get('/api/studyvault', async (req, res) => {
    const query = `
        SELECT
            s.id as sem_id, s.title as sem_title,
            sub.id as sub_id, sub.title as sub_title,
            m.id as mat_id, m.title as mat_title, m.type as mat_type,
            m."docType" as "mat_docType", m.size as mat_size, m.date as mat_date,
            m."fileName" as "mat_fileName", m."fileUrl" as "mat_fileUrl", m.created_at as mat_created_at
        FROM semesters s
        LEFT JOIN subjects sub ON s.id = sub.semester_id
        LEFT JOIN materials m ON sub.id = m.subject_id
    `;

    try {
        const result = await database.query(query);
        const rows = result.rows;

        const hierarchy = [];
        const semesterMap = new Map();
        const subjectMap = new Map();

        rows.forEach(row => {
            // Process Semester
            if (!semesterMap.has(row.sem_id)) {
                const semester = {
                    id: row.sem_id,
                    title: row.sem_title,
                    type: 'folder',
                    children: []
                };
                semesterMap.set(row.sem_id, semester);
                hierarchy.push(semester);
            }

            // Process Subject
            if (row.sub_id && !subjectMap.has(row.sub_id)) {
                const subject = {
                    id: row.sub_id,
                    title: row.sub_title,
                    type: 'folder',
                    children: []
                };
                subjectMap.set(row.sub_id, subject);
                semesterMap.get(row.sem_id).children.push(subject);
            }

            // Process Material (File or Folder inside Subject)
            if (row.mat_id) {
                const material = {
                    id: row.mat_id,
                    title: row.mat_title,
                    type: row.mat_type || 'file',
                    docType: row.mat_docType,
                    size: row.mat_size,
                    date: row.mat_date,
                    fileName: row.mat_fileName,
                    fileUrl: row.mat_fileUrl,
                    created_at: row.mat_created_at
                };
                subjectMap.get(row.sub_id).children.push(material);
            }
        });

        res.json(hierarchy);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Multer error handling middleware
app.use((err, req, res, next) => {
    if (err.message === 'Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.') {
        return res.status(400).json({ error: err.message });
    }
    if (err.name === 'MulterError') {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
