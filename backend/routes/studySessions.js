const express = require('express');
const router = express.Router();
const pool = require('../database/database');

// GET all sessions
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM study_sessions ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create session
router.post('/', async (req, res) => {
    const { session_id, mode, duration, start_time, end_time, subject } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO study_sessions (session_id, mode, duration, start_time, end_time, subject)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [session_id, mode, duration, start_time, end_time, subject || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
