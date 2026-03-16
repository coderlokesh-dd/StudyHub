const express = require('express');
const router = express.Router();
const pool = require('../database/database');

// GET all notes
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create note
router.post('/', async (req, res) => {
    const { id, title, content, category, favorite } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO notes (id, title, content, category, favorite) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [id, title, content || '', category || 'general', favorite || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update note
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, category, favorite } = req.body;
    try {
        const result = await pool.query(
            `UPDATE notes SET title = COALESCE($1, title), content = COALESCE($2, content), category = COALESCE($3, category), favorite = COALESCE($4, favorite), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`,
            [title, content, category, favorite, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE note
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
