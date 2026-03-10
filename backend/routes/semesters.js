const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all semesters
router.get('/', (req, res) => {
    db.all('SELECT * FROM semesters', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET a specific semester
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM semesters WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// POST a new semester
router.post('/', (req, res) => {
    const { id, title } = req.body;
    db.run('INSERT INTO semesters (id, title) VALUES (?, ?)', [id, title], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, title });
    });
});

// PUT (Rename) a semester
router.put('/:id', (req, res) => {
    const { title } = req.body;
    db.run('UPDATE semesters SET title = ? WHERE id = ?', [title, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Semester renamed successfully' });
    });
});

// DELETE a semester
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM semesters WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Semester deleted successfully' });
    });
});

module.exports = router;
