const express = require('express');
const { randomUUID } = require('crypto');
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

// GET shared note as a downloadable .txt file (PUBLIC — no auth)
// Must come BEFORE /:id routes to avoid path conflicts.
router.get('/share/:token/download', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT title, content, category, updated_at FROM notes WHERE share_token = $1',
            [req.params.token]
        );
        if (result.rows.length === 0) {
            return res.status(404).type('text/plain').send('This share link is no longer active.');
        }
        const note = result.rows[0];
        const safeFilename = (note.title || 'note')
            .replace(/[^a-zA-Z0-9-_ ]/g, '')
            .trim()
            .slice(0, 80) || 'note';

        const body = [
            note.title,
            '='.repeat(Math.min(80, (note.title || '').length)),
            '',
            `Category: ${note.category || 'general'}`,
            `Updated:  ${new Date(note.updated_at).toLocaleString()}`,
            '',
            note.content || '',
            '',
            '---',
            'Shared from Student Organizer',
        ].join('\n');

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}.txt"`);
        res.send(body);
    } catch (err) {
        res.status(500).type('text/plain').send('Server error fetching shared note.');
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

// POST enable sharing (or return existing token if already shared)
router.post('/:id/share', async (req, res) => {
    try {
        const existing = await pool.query('SELECT share_token FROM notes WHERE id = $1', [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
        if (existing.rows[0].share_token) {
            return res.json({ share_token: existing.rows[0].share_token });
        }
        const token = randomUUID();
        const result = await pool.query(
            'UPDATE notes SET share_token = $1 WHERE id = $2 RETURNING share_token',
            [token, req.params.id]
        );
        res.json({ share_token: result.rows[0].share_token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE revoke sharing
router.delete('/:id/share', async (req, res) => {
    try {
        await pool.query('UPDATE notes SET share_token = NULL WHERE id = $1', [req.params.id]);
        res.json({ success: true });
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
