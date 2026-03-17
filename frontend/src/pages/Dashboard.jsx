import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePencilAlt, HiOutlineClipboardCheck, HiOutlineTrendingUp, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getGreeting, getSmartReminders, getRecommendations, timeAgo, getCategoryLabel, getCategoryClass } from '../utils/helpers';
import Modal from '../components/Modal';
import './Dashboard.css';

const containerVariants = {
    animate: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getCountdown(dateStr) {
    const now = new Date();
    const exam = new Date(dateStr + 'T23:59:59');
    const diff = exam - now;
    if (diff <= 0) return { text: 'Today!', urgent: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days === 0) return { text: `${hours}h left`, urgent: true };
    if (days <= 3) return { text: `${days}d ${hours}h`, urgent: true };
    if (days <= 7) return { text: `${days} days`, urgent: false };
    return { text: `${days} days`, urgent: false };
}

const EXAM_COLORS = ['#7C5CFF', '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];

export default function Dashboard() {
    const { notes, tasks, streak, totalStudyMinutes, badges, exams, addExam, deleteExam } = useApp();
    const navigate = useNavigate();
    const greeting = getGreeting();
    const reminders = getSmartReminders(notes, tasks);
    const recommendations = getRecommendations(notes);
    const todayTasks = tasks.filter(t => !t.completed);
    const completedCount = tasks.filter(t => t.completed).length;
    const unlockedBadges = badges.filter(b => b.unlocked).length;

    const [examModalOpen, setExamModalOpen] = useState(false);
    const [examForm, setExamForm] = useState({ title: '', subject: '', examDate: '', color: '#7C5CFF' });

    const handleAddExam = () => {
        if (!examForm.title.trim() || !examForm.examDate) return;
        addExam(examForm);
        setExamForm({ title: '', subject: '', examDate: '', color: '#7C5CFF' });
        setExamModalOpen(false);
    };

    // Sort exams by date, filter to future/today only
    const today = new Date().toISOString().split('T')[0];
    const upcomingExams = [...(exams || [])]
        .filter(e => e.examDate >= today)
        .sort((a, b) => a.examDate.localeCompare(b.examDate))
        .slice(0, 6);

    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            {/* Hero Command Center */}
            <motion.section className="dash-hero" variants={itemVariants}>
                <div className="dash-hero-orb" />
                <div className="dash-hero-orb dash-hero-orb--secondary" />
                <div className="dash-hero-content">
                    <div className="dash-hero-top">
                        <div>
                            <h1 className="dash-hero-greeting">{greeting.text}!</h1>
                            <p className="dash-hero-sub">{greeting.sub}</p>
                        </div>
                        <motion.div
                            className="dash-hero-streak"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            onClick={() => navigate('/progress')}
                        >
                            <span className="dash-hero-flame">🔥</span>
                            <div>
                                <span className="dash-hero-streak-num">{streak.current}</span>
                                <span className="dash-hero-streak-label">day streak</span>
                            </div>
                        </motion.div>
                    </div>
                    <div className="dash-hero-cta">
                        <motion.button
                            className="btn btn-primary dash-hero-btn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/notes')}
                        >
                            Continue studying →
                        </motion.button>
                    </div>
                </div>
            </motion.section>

            {/* Stats Strip */}
            <motion.section className="dash-stats" variants={itemVariants}>
                <motion.div className="dash-stat" whileHover={{ y: -3 }} onClick={() => navigate('/notes')}>
                    <HiOutlinePencilAlt size={18} />
                    <span className="dash-stat-value">{notes.length}</span>
                    <span className="dash-stat-label">Notes</span>
                </motion.div>
                <div className="dash-stat-divider" />
                <motion.div className="dash-stat" whileHover={{ y: -3 }} onClick={() => navigate('/tasks')}>
                    <HiOutlineClipboardCheck size={18} />
                    <span className="dash-stat-value">{completedCount}</span>
                    <span className="dash-stat-label">Done</span>
                </motion.div>
                <div className="dash-stat-divider" />
                <motion.div className="dash-stat" whileHover={{ y: -3 }} onClick={() => navigate('/progress')}>
                    <HiOutlineTrendingUp size={18} />
                    <span className="dash-stat-value">{Math.round(totalStudyMinutes / 60)}h</span>
                    <span className="dash-stat-label">Studied</span>
                </motion.div>
                <div className="dash-stat-divider" />
                <motion.div className="dash-stat" whileHover={{ y: -3 }} onClick={() => navigate('/progress')}>
                    <span className="dash-stat-badge-icon">🏆</span>
                    <span className="dash-stat-value">{unlockedBadges}</span>
                    <span className="dash-stat-label">Badges</span>
                </motion.div>
            </motion.section>

            {/* Exam Countdown */}
            <motion.section variants={itemVariants}>
                <div className="dash-section-header">
                    <h3 className="section-title">📅 Upcoming Exams</h3>
                    <motion.button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setExamModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <HiOutlinePlus size={16} /> Add
                    </motion.button>
                </div>
                {upcomingExams.length > 0 ? (
                    <div className="dash-exams-grid">
                        {upcomingExams.map(exam => {
                            const countdown = getCountdown(exam.examDate);
                            return (
                                <motion.div
                                    key={exam.id}
                                    className={`dash-exam-card ${countdown.urgent ? 'urgent' : ''}`}
                                    whileHover={{ y: -3 }}
                                    style={{ '--exam-color': exam.color || '#7C5CFF' }}
                                >
                                    <div className="dash-exam-color-bar" />
                                    <div className="dash-exam-info">
                                        <span className="dash-exam-title">{exam.title}</span>
                                        {exam.subject && <span className="dash-exam-subject">{exam.subject}</span>}
                                    </div>
                                    <div className="dash-exam-countdown">
                                        <span className={`dash-exam-days ${countdown.urgent ? 'urgent' : ''}`}>
                                            {countdown.text}
                                        </span>
                                        <span className="dash-exam-date">{exam.examDate}</span>
                                    </div>
                                    <button className="btn-icon dash-exam-delete" onClick={() => deleteExam(exam.id)}>
                                        <HiOutlineTrash size={14} />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="dash-exams-empty">
                        <span>No upcoming exams. Click + Add to create one.</span>
                    </div>
                )}
            </motion.section>

            {/* Smart Reminders */}
            {reminders.length > 0 && (
                <motion.section variants={itemVariants}>
                    <h3 className="section-title">🔔 Smart Reminders</h3>
                    <div className="dash-reminders">
                        {reminders.map(r => (
                            <motion.div key={r.id} className="reminder-card" whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                                <span className="reminder-icon">{r.icon}</span>
                                <span className="reminder-text">{r.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Continue Where You Left Off */}
            {recommendations.length > 0 && (
                <motion.section variants={itemVariants}>
                    <h3 className="section-title">📂 Continue Where You Left Off</h3>
                    <div className="dash-recs">
                        {recommendations.map(note => (
                            <motion.div
                                key={note.id}
                                className="rec-card"
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/notes')}
                            >
                                <div className="rec-card-top">
                                    <span className={`badge ${getCategoryClass(note.category)}`}>{getCategoryLabel(note.category)}</span>
                                    <span className="rec-time">{timeAgo(note.updatedAt)}</span>
                                </div>
                                <h4 className="rec-title">{note.title}</h4>
                                <p className="rec-preview">{note.content.slice(0, 80)}...</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Quick Actions */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">⚡ Quick Actions</h3>
                <div className="dash-actions">
                    <motion.button className="action-card btn-primary" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/notes')} id="quick-new-note">
                        <HiOutlinePencilAlt size={20} />
                        <span>New Note</span>
                    </motion.button>
                    <motion.button className="action-card btn-secondary" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/tasks')} id="quick-new-task">
                        <HiOutlineClipboardCheck size={20} />
                        <span>New Task</span>
                    </motion.button>
                </div>
            </motion.section>

            {/* Pending Tasks */}
            {todayTasks.length > 0 && (
                <motion.section variants={itemVariants}>
                    <h3 className="section-title">📋 Pending Tasks ({todayTasks.length})</h3>
                    <div className="dash-tasks">
                        {todayTasks.slice(0, 4).map(task => (
                            <motion.div key={task.id} className="dash-task-row" onClick={() => navigate('/tasks')} whileHover={{ x: 4 }}>
                                <div className={`dash-task-priority ${task.priority}`} />
                                <div className="dash-task-info">
                                    <span className="dash-task-title">{task.title}</span>
                                    <span className="dash-task-due">Due {task.dueDate}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Badges Preview */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">🏆 Achievements ({unlockedBadges}/{badges.length})</h3>
                <div className="dash-badges">
                    {badges.slice(0, 6).map(badge => (
                        <motion.div
                            key={badge.id}
                            className={`dash-badge ${badge.unlocked ? 'unlocked' : 'locked'}`}
                            whileHover={{ scale: 1.1, rotate: badge.unlocked ? 3 : 0 }}
                            title={badge.description}
                        >
                            <span className="dash-badge-icon">{badge.icon}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Exam Modal */}
            <Modal isOpen={examModalOpen} onClose={() => setExamModalOpen(false)} title="Add Exam">
                <div className="form-group">
                    <label htmlFor="exam-title">Exam Name</label>
                    <input id="exam-title" value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} placeholder="e.g. Physics Final" />
                </div>
                <div className="form-group">
                    <label htmlFor="exam-subject">Subject <span style={{opacity:0.5}}>(optional)</span></label>
                    <input id="exam-subject" value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} placeholder="e.g. Physics" />
                </div>
                <div className="form-group">
                    <label htmlFor="exam-date">Exam Date</label>
                    <input type="date" id="exam-date" value={examForm.examDate} onChange={e => setExamForm({...examForm, examDate: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Color</label>
                    <div className="exam-color-picker">
                        {EXAM_COLORS.map(c => (
                            <button
                                key={c}
                                className={`exam-color-swatch ${examForm.color === c ? 'active' : ''}`}
                                style={{ background: c }}
                                onClick={() => setExamForm({...examForm, color: c})}
                            />
                        ))}
                    </div>
                </div>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setExamModalOpen(false)}>Cancel</button>
                    <motion.button className="btn btn-primary" onClick={handleAddExam} whileHover={{ scale: 1.03 }}>
                        Add Exam
                    </motion.button>
                </div>
            </Modal>
        </motion.div>
    );
}
