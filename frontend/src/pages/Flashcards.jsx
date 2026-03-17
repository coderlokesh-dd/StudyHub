import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiArrowLeft, HiOutlineRefresh, HiCheck, HiX } from 'react-icons/hi';
import * as api from '../utils/api';
import { generateId } from '../utils/helpers';
import Modal from '../components/Modal';
import './Flashcards.css';

const containerVariants = {
    animate: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Leitner intervals (days) by box number
const LEITNER_INTERVALS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

function getNextReviewDate(box) {
    const days = LEITNER_INTERVALS[box] || 1;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

export default function Flashcards() {
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [cards, setCards] = useState([]);
    const [reviewCards, setReviewCards] = useState([]);
    const [view, setView] = useState('decks'); // decks | cards | review
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('deck'); // deck | card
    const [form, setForm] = useState({ title: '', subject: '', front: '', back: '' });
    const [flipped, setFlipped] = useState(false);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.fetchFlashcardDecks().then(data => {
            setDecks(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const openDeck = async (deck) => {
        setSelectedDeck(deck);
        const data = await api.fetchFlashcards(deck.id);
        setCards(data);
        setView('cards');
    };

    const startReview = async () => {
        const data = await api.fetchReviewCards(selectedDeck.id);
        if (data.length === 0) {
            alert('No cards due for review! 🎉');
            return;
        }
        setReviewCards(data);
        setReviewIndex(0);
        setFlipped(false);
        setView('review');
    };

    const handleCreateDeck = async () => {
        if (!form.title.trim()) return;
        const deck = { id: generateId(), title: form.title, subject: form.subject };
        await api.createFlashcardDeck(deck);
        setDecks(prev => [deck, ...prev]);
        setForm({ title: '', subject: '', front: '', back: '' });
        setModalOpen(false);
    };

    const handleDeleteDeck = async (id) => {
        await api.deleteFlashcardDeck(id);
        setDecks(prev => prev.filter(d => d.id !== id));
    };

    const handleCreateCard = async () => {
        if (!form.front.trim() || !form.back.trim()) return;
        const card = { id: generateId(), front: form.front, back: form.back };
        const created = await api.createFlashcard(selectedDeck.id, card);
        setCards(prev => [created, ...prev]);
        setForm({ title: '', subject: '', front: '', back: '' });
        setModalOpen(false);
    };

    const handleDeleteCard = async (id) => {
        await api.deleteFlashcard(id);
        setCards(prev => prev.filter(c => c.id !== id));
    };

    const handleReviewAnswer = async (correct) => {
        const card = reviewCards[reviewIndex];
        let newBox = correct ? Math.min((card.box || 1) + 1, 5) : 1;
        const nextReview = getNextReviewDate(newBox);
        await api.updateFlashcard(card.id, { box: newBox, next_review: nextReview });

        setFlipped(false);
        if (reviewIndex + 1 < reviewCards.length) {
            setReviewIndex(prev => prev + 1);
        } else {
            setView('cards');
            // Refresh cards
            const data = await api.fetchFlashcards(selectedDeck.id);
            setCards(data);
        }
    };

    const goBack = () => {
        if (view === 'review') { setView('cards'); return; }
        if (view === 'cards') { setView('decks'); setSelectedDeck(null); return; }
    };

    // ─── REVIEW MODE ────────────────
    if (view === 'review') {
        const card = reviewCards[reviewIndex];
        return (
            <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
                <motion.div className="fc-header" variants={itemVariants}>
                    <motion.button className="btn btn-ghost" onClick={goBack} whileHover={{ x: -3 }}>
                        <HiArrowLeft size={20} /> Back
                    </motion.button>
                    <h1>🧠 Review</h1>
                    <span className="fc-review-progress">{reviewIndex + 1}/{reviewCards.length}</span>
                </motion.div>

                <motion.div className="fc-review-area" variants={itemVariants}>
                    <motion.div
                        className={`fc-flip-card ${flipped ? 'flipped' : ''}`}
                        onClick={() => setFlipped(!flipped)}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="fc-flip-inner">
                            <div className="fc-flip-front">
                                <span className="fc-flip-label">Question</span>
                                <p>{card.front}</p>
                                <span className="fc-flip-hint">Tap to flip</span>
                            </div>
                            <div className="fc-flip-back">
                                <span className="fc-flip-label">Answer</span>
                                <p>{card.back}</p>
                            </div>
                        </div>
                    </motion.div>

                    {flipped && (
                        <motion.div
                            className="fc-review-actions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <motion.button
                                className="btn fc-btn-wrong"
                                onClick={() => handleReviewAnswer(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <HiX size={18} /> Missed it
                            </motion.button>
                            <motion.button
                                className="btn fc-btn-correct"
                                onClick={() => handleReviewAnswer(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <HiCheck size={18} /> Got it!
                            </motion.button>
                        </motion.div>
                    )}

                    <div className="fc-box-indicator">
                        Box {card.box || 1}/5
                        <div className="fc-box-dots">
                            {[1,2,3,4,5].map(b => (
                                <span key={b} className={`fc-box-dot ${b <= (card.box || 1) ? 'filled' : ''}`} />
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    // ─── CARDS VIEW ─────────────────
    if (view === 'cards') {
        return (
            <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
                <motion.div className="fc-header" variants={itemVariants}>
                    <motion.button className="btn btn-ghost" onClick={goBack} whileHover={{ x: -3 }}>
                        <HiArrowLeft size={20} /> Back
                    </motion.button>
                    <div>
                        <h1>🃏 {selectedDeck.title}</h1>
                        {selectedDeck.subject && <p className="fc-deck-sub">{selectedDeck.subject}</p>}
                    </div>
                    <div className="fc-header-actions">
                        <motion.button className="btn btn-secondary" onClick={startReview} whileHover={{ scale: 1.05 }} disabled={cards.length === 0}>
                            <HiOutlineRefresh size={18} /> Review
                        </motion.button>
                        <motion.button className="btn btn-primary" onClick={() => { setModalType('card'); setForm({ title: '', subject: '', front: '', back: '' }); setModalOpen(true); }} whileHover={{ scale: 1.05 }}>
                            <HiOutlinePlus size={18} /> Add Card
                        </motion.button>
                    </div>
                </motion.div>

                {cards.length === 0 ? (
                    <motion.div className="empty-state" variants={itemVariants}>
                        <div className="empty-state-icon">🃏</div>
                        <p>No cards yet. Add your first flashcard!</p>
                    </motion.div>
                ) : (
                    <motion.div className="fc-cards-grid" layout>
                        <AnimatePresence>
                            {cards.map(card => (
                                <motion.div
                                    key={card.id}
                                    className="fc-card-item card"
                                    variants={itemVariants}
                                    layout
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="fc-card-front-text"><strong>Q:</strong> {card.front}</div>
                                    <div className="fc-card-back-text"><strong>A:</strong> {card.back}</div>
                                    <div className="fc-card-meta">
                                        <span className="fc-card-box">Box {card.box || 1}</span>
                                        <button className="btn-icon" onClick={() => handleDeleteCard(card.id)} title="Delete">
                                            <HiOutlineTrash size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Flashcard">
                    <div className="form-group">
                        <label htmlFor="card-front">Front (Question)</label>
                        <textarea id="card-front" value={form.front} onChange={e => setForm({...form, front: e.target.value})} placeholder="What is..." rows={3} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="card-back">Back (Answer)</label>
                        <textarea id="card-back" value={form.back} onChange={e => setForm({...form, back: e.target.value})} placeholder="The answer is..." rows={3} />
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                        <motion.button className="btn btn-primary" onClick={handleCreateCard} whileHover={{ scale: 1.03 }}>
                            Add Card
                        </motion.button>
                    </div>
                </Modal>
            </motion.div>
        );
    }

    // ─── DECKS VIEW ─────────────────
    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            <motion.div className="fc-header" variants={itemVariants}>
                <h1>🃏 Flashcards</h1>
                <motion.button className="btn btn-primary" onClick={() => { setModalType('deck'); setForm({ title: '', subject: '', front: '', back: '' }); setModalOpen(true); }} whileHover={{ scale: 1.05 }}>
                    <HiOutlinePlus size={18} /> New Deck
                </motion.button>
            </motion.div>

            {loading ? (
                <div className="empty-state"><p>Loading...</p></div>
            ) : decks.length === 0 ? (
                <motion.div className="empty-state" variants={itemVariants}>
                    <div className="empty-state-icon">🃏</div>
                    <p>No flashcard decks yet. Create one to start studying!</p>
                </motion.div>
            ) : (
                <motion.div className="fc-decks-grid" layout>
                    <AnimatePresence>
                        {decks.map(deck => (
                            <motion.div
                                key={deck.id}
                                className="fc-deck-card card"
                                variants={itemVariants}
                                layout
                                whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openDeck(deck)}
                            >
                                <div className="fc-deck-icon">🃏</div>
                                <h3>{deck.title}</h3>
                                {deck.subject && <span className="fc-deck-subject">{deck.subject}</span>}
                                <button className="btn-icon fc-deck-delete" onClick={e => { e.stopPropagation(); handleDeleteDeck(deck.id); }} title="Delete">
                                    <HiOutlineTrash size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Deck">
                <div className="form-group">
                    <label htmlFor="deck-title">Deck Name</label>
                    <input id="deck-title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Biology Chapter 3" />
                </div>
                <div className="form-group">
                    <label htmlFor="deck-subject">Subject <span style={{opacity:0.5}}>(optional)</span></label>
                    <input id="deck-subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Biology" />
                </div>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                    <motion.button className="btn btn-primary" onClick={handleCreateDeck} whileHover={{ scale: 1.03 }}>
                        Create Deck
                    </motion.button>
                </div>
            </Modal>
        </motion.div>
    );
}
