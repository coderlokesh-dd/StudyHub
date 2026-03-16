const express = require('express');
const router = express.Router();
const pool = require('../database/database');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create task
router.post('/', async (req, res) => {
    const { id, title, subject, priority, dueDate } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO tasks (id, title, subject, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, title, subject || '', priority || 'low', dueDate || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update task
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, subject, priority, dueDate, completed, completedAt } = req.body;
    try {
        const result = await pool.query(
            `UPDATE tasks SET
                title = COALESCE($1, title),
                subject = COALESCE($2, subject),
                priority = COALESCE($3, priority),
                due_date = COALESCE($4, due_date),
                completed = COALESCE($5, completed),
                completed_at = $6
            WHERE id = $7 RETURNING *`,
            [title, subject, priority, dueDate, completed, completedAt || null, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
