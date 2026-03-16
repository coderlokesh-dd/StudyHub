const express = require('express');
const router = express.Router();
const db = require('../database/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // Restrict to PDF, PNG, JPG, JPEG
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET all materials
router.get('/', async (req, res) => {
    const { subject_id } = req.query;
    let query = 'SELECT * FROM materials';
    let params = [];

    if (subject_id) {
        query += ' WHERE subject_id = $1';
        params.push(subject_id);
    }

    try {
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new material (File Upload)
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
    }

    const { id, subject_id, title } = req.body;
    if (!id || !subject_id || !title) {
        return res.status(400).json({ error: 'id, subject_id, and title are all required.' });
    }
    const fileName = req.file.filename;
    const fileUrl = `/uploads/${fileName}`;
    const docType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
    const size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    try {
        await db.query(
            'INSERT INTO materials (id, subject_id, title, type, "docType", size, date, "fileName", "fileUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [id, subject_id, title, 'file', docType, size, date, fileName, fileUrl]
        );
        res.json({ id, subject_id, title, type: 'file', docType, size, date, fileName, fileUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT (Rename) a material
router.put('/:id', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }
    try {
        const result = await db.query('UPDATE materials SET title = $1 WHERE id = $2', [title, req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Material not found' });
        res.json({ message: 'Material renamed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a material
router.delete('/:id', async (req, res) => {
    try {
        // First, find the file path to physically delete it
        const result = await db.query('SELECT "fileName" FROM materials WHERE id = $1', [req.params.id]);

        if (result.rows.length > 0 && result.rows[0].fileName) {
            const filePath = path.join(__dirname, '../uploads', result.rows[0].fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Then delete the DB record
        const deleteResult = await db.query('DELETE FROM materials WHERE id = $1', [req.params.id]);
        if (deleteResult.rowCount === 0) return res.status(404).json({ error: 'Material not found' });

        res.json({ message: 'Material deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
