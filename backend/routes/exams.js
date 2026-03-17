const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all exams
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM exams ORDER BY exam_date ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create exam
router.post('/', async (req, res) => {
    const { id, title, subject, exam_date, color } = req.body;
    try {
        await db.query(
            'INSERT INTO exams (id, title, subject, exam_date, color) VALUES ($1, $2, $3, $4, $5)',
            [id, title, subject || null, exam_date, color || '#7C5CFF']
        );
        res.json({ id, title, subject, exam_date, color });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update exam
router.put('/:id', async (req, res) => {
    const { title, subject, exam_date, color } = req.body;
    try {
        await db.query(
            'UPDATE exams SET title = $1, subject = $2, exam_date = $3, color = $4 WHERE id = $5',
            [title, subject, exam_date, color, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE exam
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM exams WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
