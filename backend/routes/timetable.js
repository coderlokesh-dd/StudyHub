const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all timetable entries
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM timetable_entries ORDER BY day_of_week ASC, start_time ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create entry
router.post('/', async (req, res) => {
    const { id, title, subject, day_of_week, start_time, end_time, color, location } = req.body;
    try {
        await db.query(
            'INSERT INTO timetable_entries (id, title, subject, day_of_week, start_time, end_time, color, location) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [id, title, subject || null, day_of_week, start_time, end_time, color || '#7C5CFF', location || null]
        );
        res.json({ id, title, subject, day_of_week, start_time, end_time, color, location });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update entry
router.put('/:id', async (req, res) => {
    const { title, subject, day_of_week, start_time, end_time, color, location } = req.body;
    try {
        await db.query(
            'UPDATE timetable_entries SET title = $1, subject = $2, day_of_week = $3, start_time = $4, end_time = $5, color = $6, location = $7 WHERE id = $8',
            [title, subject, day_of_week, start_time, end_time, color, location, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE entry
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM timetable_entries WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
