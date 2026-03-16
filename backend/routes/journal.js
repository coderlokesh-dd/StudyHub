const express = require('express');
const router = express.Router();
const pool = require('../database/database');

// GET all journal entries
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM journal ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single entry by date
router.get('/:date', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM journal WHERE date = $1', [req.params.date]);
        res.json(result.rows[0] || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST/PUT upsert journal entry
router.post('/', async (req, res) => {
    const { id, date, title, content, mood } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO journal (id, date, title, content, mood)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (date) DO UPDATE SET title = $3, content = $4, mood = $5, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [id, date, title || '', content || '', mood || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE journal entry
router.delete('/:date', async (req, res) => {
    try {
        await pool.query('DELETE FROM journal WHERE date = $1', [req.params.date]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
