const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all subjects
router.get('/', async (req, res) => {
    const { semester_id } = req.query;
    let query = 'SELECT * FROM subjects';
    let params = [];

    if (semester_id) {
        query += ' WHERE semester_id = $1';
        params.push(semester_id);
    }

    try {
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new subject
router.post('/', async (req, res) => {
    const { id, semester_id, title } = req.body;
    if (!id || !semester_id || !title) {
        return res.status(400).json({ error: 'id, semester_id, and title are all required.' });
    }
    try {
        await db.query('INSERT INTO subjects (id, semester_id, title) VALUES ($1, $2, $3)', [id, semester_id, title]);
        res.json({ id, semester_id, title });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT (Rename) a subject
router.put('/:id', async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required.' });
    }
    try {
        const result = await db.query('UPDATE subjects SET title = $1 WHERE id = $2', [title, req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Subject not found' });
        res.json({ message: 'Subject renamed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a subject
router.delete('/:id', async (req, res) => {
    try {
        const result = await db.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Subject not found' });
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
