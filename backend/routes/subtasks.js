const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET subtasks for a task
router.get('/:taskId/subtasks', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
            [req.params.taskId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all subtasks (for bulk loading)
router.get('/all/subtasks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subtasks ORDER BY created_at ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create subtask
router.post('/:taskId/subtasks', async (req, res) => {
    const { id, title } = req.body;
    try {
        await db.query(
            'INSERT INTO subtasks (id, task_id, title) VALUES ($1, $2, $3)',
            [id, req.params.taskId, title]
        );
        res.json({ id, task_id: req.params.taskId, title, completed: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update subtask (toggle completion)
router.put('/subtasks/:id', async (req, res) => {
    const { completed, title } = req.body;
    try {
        const sets = [];
        const vals = [];
        let idx = 1;
        if (completed !== undefined) { sets.push(`completed = $${idx++}`); vals.push(completed); }
        if (title !== undefined) { sets.push(`title = $${idx++}`); vals.push(title); }
        vals.push(req.params.id);
        await db.query(
            `UPDATE subtasks SET ${sets.join(', ')} WHERE id = $${idx}`,
            vals
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE subtask
router.delete('/subtasks/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM subtasks WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
