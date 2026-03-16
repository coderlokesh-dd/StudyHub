const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all semesters
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM semesters');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a specific semester
router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM semesters WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Semester not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new semester
router.post('/', async (req, res) => {
    const { id, title } = req.body;
    if (!id || !title) {
        return res.status(400).json({ error: 'Both id and title are required.' });
    }
    try {
        await db.query('INSERT INTO semesters (id, title) VALUES ($1, $2)', [id, title]);
        res.json({ id, title });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT (Rename) a semester
router.put('/:id', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }
    try {
        const result = await db.query('UPDATE semesters SET title = $1 WHERE id = $2', [title, req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Semester not found' });
        res.json({ message: 'Semester renamed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a semester
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM semesters WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Semester not found' });
        res.json({ message: 'Semester deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
