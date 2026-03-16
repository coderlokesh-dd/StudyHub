const express = require('express');
const router = express.Router();
const pool = require('../database/database');

// GET all user data (streak, badges, totalStudyMinutes)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_data');
        const data = {};
        result.rows.forEach(row => { data[row.key] = row.value; });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT upsert a key
router.put('/:key', async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    try {
        await pool.query(
            `INSERT INTO user_data (key, value) VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = $2`,
            [key, JSON.stringify(value)]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Study Log ---

// GET study log
router.get('/study-log', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM study_log ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST upsert study log entry
router.post('/study-log', async (req, res) => {
    const { date, minutes } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO study_log (date, minutes) VALUES ($1, $2)
             ON CONFLICT (date) DO UPDATE SET minutes = study_log.minutes + $2
             RETURNING *`,
            [date, minutes]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
