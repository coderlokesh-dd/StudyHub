const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./database/database'); // Initialize DB
const semestersRouter = require('./routes/semesters');
const subjectsRouter = require('./routes/subjects');
const materialsRouter = require('./routes/materials');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/semesters', semestersRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/materials', materialsRouter);

// Compound endpoint to fetch the entire Study Vault hierarchy
app.get('/api/studyvault', (req, res) => {
    const query = `
        SELECT 
            s.id as sem_id, s.title as sem_title,
            sub.id as sub_id, sub.title as sub_title,
            m.id as mat_id, m.title as mat_title, m.type as mat_type, 
            m.docType as mat_docType, m.size as mat_size, m.date as mat_date,
            m.fileName as mat_fileName, m.fileUrl as mat_fileUrl, m.created_at as mat_created_at
        FROM semesters s
        LEFT JOIN subjects sub ON s.id = sub.semester_id
        LEFT JOIN materials m ON sub.id = m.subject_id
    `;

    database.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

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
                    type: row.mat_type || 'file', // Default to file if not set
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
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
