const express = require('express');
const router = express.Router();
const db = require('../database/database');

// GET all decks
router.get('/decks', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM flashcard_decks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create deck
router.post('/decks', async (req, res) => {
    const { id, title, subject } = req.body;
    try {
        await db.query(
            'INSERT INTO flashcard_decks (id, title, subject) VALUES ($1, $2, $3)',
            [id, title, subject || null]
        );
        res.json({ id, title, subject });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE deck
router.delete('/decks/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM flashcard_decks WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all cards in a deck
router.get('/decks/:deckId/cards', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM flashcards WHERE deck_id = $1 ORDER BY created_at DESC',
            [req.params.deckId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET cards due for review in a deck
router.get('/decks/:deckId/review', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM flashcards WHERE deck_id = $1 AND next_review <= CURRENT_DATE ORDER BY box ASC, next_review ASC',
            [req.params.deckId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create card
router.post('/decks/:deckId/cards', async (req, res) => {
    const { id, front, back } = req.body;
    try {
        await db.query(
            'INSERT INTO flashcards (id, deck_id, front, back) VALUES ($1, $2, $3, $4)',
            [id, req.params.deckId, front, back]
        );
        res.json({ id, deck_id: req.params.deckId, front, back, box: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update card (for spaced repetition box movement)
router.put('/cards/:id', async (req, res) => {
    const { box, next_review } = req.body;
    try {
        await db.query(
            'UPDATE flashcards SET box = $1, next_review = $2 WHERE id = $3',
            [box, next_review, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE card
router.delete('/cards/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM flashcards WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
