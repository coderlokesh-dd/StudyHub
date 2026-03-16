import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { useApp } from '../contexts/AppContext';
import './JournalList.css';

const MOOD_MAP = {
    happy: '😊',
    neutral: '😐',
    sad: '😔',
    tired: '😴',
    stressed: '😤',
};

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function JournalList() {
    const navigate = useNavigate();
    const { journal, deleteJournalEntry } = useApp();

    const today = new Date().toISOString().split('T')[0];

    const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleDelete = (e, date) => {
        e.stopPropagation();
        if (window.confirm('Delete this journal entry? This cannot be undone.')) {
            deleteJournalEntry(date);
        }
    };

    return (
        <motion.div
            className="page container journal-list-page"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
            <motion.div className="journal-list-header" variants={itemVariants}>
                <h1 className="journal-list-title">📔 My Journal</h1>
                <motion.button
                    className="btn btn-primary journal-new-btn"
                    onClick={() => navigate(`/journal/${today}`)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <HiOutlinePlus size={18} />
                    <span>Today</span>
                </motion.button>
            </motion.div>

            {sorted.length === 0 ? (
                <motion.div className="journal-list-empty" variants={itemVariants}>
                    <div className="empty-icon">📝</div>
                    <h2>No entries yet</h2>
                    <p>Start writing your first journal entry today!</p>
                    <motion.button
                        className="btn btn-primary"
                        onClick={() => navigate(`/journal/${today}`)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Write Today's Entry
                    </motion.button>
                </motion.div>
            ) : (
                <div className="journal-list-entries">
                    {sorted.map((entry) => (
                        <motion.div
                            key={entry.date}
                            className="journal-list-card"
                            variants={itemVariants}
                            onClick={() => navigate(`/journal/${entry.date}`)}
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className="journal-list-card-left">
                                {entry.mood && (
                                    <span className="journal-list-mood">
                                        {MOOD_MAP[entry.mood] || ''}
                                    </span>
                                )}
                                <div className="journal-list-card-text">
                                    <h3 className="journal-list-card-title">
                                        {entry.title || 'Untitled'}
                                    </h3>
                                    <p className="journal-list-card-date">
                                        {formatDate(entry.date)}
                                    </p>
                                    {entry.content && (
                                        <p className="journal-list-card-preview">
                                            {entry.content.length > 120
                                                ? entry.content.slice(0, 120) + '...'
                                                : entry.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                className="btn btn-ghost journal-list-delete"
                                onClick={(e) => handleDelete(e, entry.date)}
                            >
                                <HiOutlineTrash size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
