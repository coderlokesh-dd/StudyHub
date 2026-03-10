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
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET all materials
router.get('/', (req, res) => {
    const { subject_id } = req.query;
    let query = 'SELECT * FROM materials';
    let params = [];

    if (subject_id) {
        query += ' WHERE subject_id = ?';
        params.push(subject_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST a new material (File Upload)
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
    }

    const { id, subject_id, title } = req.body;
    const fileName = req.file.filename;
    const fileUrl = `/uploads/${fileName}`;
    const docType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';
    const size = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    db.run(
        'INSERT INTO materials (id, subject_id, title, type, docType, size, date, fileName, fileUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, subject_id, title, 'file', docType, size, date, fileName, fileUrl],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, subject_id, title, type: 'file', docType, size, date, fileName, fileUrl });
        }
    );
});

// PUT (Rename) a material
router.put('/:id', (req, res) => {
    const { title } = req.body;
    db.run('UPDATE materials SET title = ? WHERE id = ?', [title, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Material renamed successfully' });
    });
});

// DELETE a material
router.delete('/:id', (req, res) => {
    // First, find the file path to physically delete it
    db.get('SELECT fileName FROM materials WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (row && row.fileName) {
            const filePath = path.join(__dirname, '../uploads', row.fileName);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Then delete the DB record
        db.run('DELETE FROM materials WHERE id = ?', [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Material deleted successfully' });
        });
    });
});

module.exports = router;
