import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineX, HiOutlineTrash } from 'react-icons/hi';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { PageHeader, PALETTE, ComicCardDark } from '../components/ComicComponents';
import './Journal.css';

const MOODS = [
    { key: 'happy', emoji: '😊', label: 'Happy' },
    { key: 'neutral', emoji: '😐', label: 'Neutral' },
    { key: 'sad', emoji: '😔', label: 'Sad' },
    { key: 'tired', emoji: '😴', label: 'Tired' },
    { key: 'stressed', emoji: '😤', label: 'Stressed' },
];

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Journal() {
    const { date } = useParams();
    const navigate = useNavigate();
    const { getJournalEntry, saveJournalEntry, deleteJournalEntry } = useApp();
    const { tone } = useTheme();
    const isPro = tone === 'pro';
    const textareaRef = useRef(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('');
    const [saved, setSaved] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    // Parse date info
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = new Date(date + 'T00:00:00');
    const isFuture = date > today;
    const formattedDate = selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Load existing entry
    useEffect(() => {
        const entry = getJournalEntry(date);
        if (entry) {
            setTitle(entry.title || '');
            setContent(entry.content || '');
            setMood(entry.mood || '');
            setIsExisting(true);
        } else {
            setTitle('');
            setContent('');
            setMood('');
            setIsExisting(false);
        }
        setSaved(false);
    }, [date, getJournalEntry]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    const handleSave = () => {
        if (!content.trim() && !title.trim()) return;
        saveJournalEntry(date, { title, content, mood });
        setIsExisting(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleDelete = () => {
        if (window.confirm(isPro ? 'Delete this journal entry? This cannot be undone.' : 'delete this entry? no turning back!')) {
            deleteJournalEntry(date);
            navigate('/journal');
        }
    };

    // Future date — blocked
    if (isFuture) {
        return (
            <motion.div
                className="page container journal-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <PageHeader 
                    tagColor={PALETTE.coral}
                    title={isPro ? 'Journal' : 'diary era'} 
                    subtitle={isPro ? 'Reflect on your day.' : 'spill the tea (to urself)'} 
                />
                <div className="journal-future-block">
                    <div className="future-icon">🔮</div>
                    <h2>{isPro ? 'The future awaits!' : 'future vibes only!'}</h2>
                    <p className="future-date">{formattedDate}</p>
                    <p>{isPro ? 'Journal entries cannot be created for future dates. Come back on this day to write your entry.' : 'cant write in the future yet. wait for this day to spill!'}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="page container journal-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            {/* Header */}
            <motion.div className="journal-header" variants={itemVariants}>
                <PageHeader 
                    tagColor={PALETTE.coral}
                    title={isPro ? 'Journal' : 'diary era'} 
                    subtitle={isPro ? 'Reflect on your day.' : 'spill the tea (to urself)'} 
                />
                <motion.button
                    className={`btn btn-primary journal-save ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    id="journal-save-btn"
                    style={{ fontFamily: isPro ? 'inherit' : 'Bangers, cursive' }}
                >
                    {saved ? (isPro ? '✓ Saved' : '✓ saved!') : (isPro ? 'Save' : 'save it')}
                </motion.button>
            </motion.div>

            {/* Entry Card */}
            <motion.div className="journal-card" variants={itemVariants}>
                {/* Date & Time */}
                <div className="journal-meta">
                    <div className="journal-date-badge">
                        <span className="journal-date-icon">📅</span>
                        <span>{formattedDate}</span>
                    </div>
                    <div className="journal-time-badge">
                        <span className="journal-time-icon">🕐</span>
                        <span>{currentTime}</span>
                    </div>
                </div>

                {/* Mood Selector */}
                <motion.div className="journal-mood-section" variants={itemVariants}>
                    <label className="journal-label">How are you feeling?</label>
                    <div className="journal-moods">
                        {MOODS.map(m => (
                            <motion.button
                                key={m.key}
                                className={`mood-pill ${mood === m.key ? 'active' : ''}`}
                                onClick={() => setMood(mood === m.key ? '' : m.key)}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="mood-emoji">{m.emoji}</span>
                                <span className="mood-label">{m.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="journal-divider" />

                {/* Title */}
                <motion.div className="journal-title-section" variants={itemVariants}>
                    <input
                        type="text"
                        className="journal-title-input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Give this day a title..."
                        id="journal-title"
                    />
                </motion.div>

                {/* Main writing area */}
                <motion.div className="journal-content-section" variants={itemVariants}>
                    <textarea
                        ref={textareaRef}
                        className="journal-textarea"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Dear Diary,&#10;&#10;Write about your day..."
                        id="journal-content"
                    />
                </motion.div>

                {/* Delete button for existing entries */}
                {isExisting && (
                    <motion.div
                        className="journal-danger-zone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <button className="btn btn-ghost journal-delete" onClick={handleDelete}>
                            <HiOutlineTrash size={16} />
                            <span>Delete Entry</span>
                        </button>
                    </motion.div>
                )}
            </motion.div>

            {/* Saved toast */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        className="journal-toast"
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    >
                        ✓ Journal entry saved
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
