const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all subjects
router.get('/', (req, res) => {
    const { semester_id } = req.query;
    let query = 'SELECT * FROM subjects';
    let params = [];

    if (semester_id) {
        query += ' WHERE semester_id = ?';
        params.push(semester_id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST a new subject
router.post('/', (req, res) => {
    const { id, semester_id, title } = req.body;
    db.run('INSERT INTO subjects (id, semester_id, title) VALUES (?, ?, ?)', [id, semester_id, title], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, semester_id, title });
    });
});

// PUT (Rename) a subject
router.put('/:id', (req, res) => {
    const { title } = req.body;
    db.run('UPDATE subjects SET title = ? WHERE id = ?', [title, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Subject renamed successfully' });
    });
});

// DELETE a subject
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM subjects WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Subject deleted successfully' });
    });
});

module.exports = router;
