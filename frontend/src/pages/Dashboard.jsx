import { motion } from 'framer-motion';
import { HiOutlinePencilAlt, HiOutlineClipboardCheck, HiOutlineFire, HiOutlineTrendingUp } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getGreeting, getSmartReminders, getRecommendations, timeAgo, getCategoryLabel, getCategoryClass } from '../utils/helpers';
import './Dashboard.css';

const containerVariants = {
    animate: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Dashboard() {
    const { notes, tasks, streak, totalStudyMinutes, badges } = useApp();
    const navigate = useNavigate();
    const greeting = getGreeting();
    const reminders = getSmartReminders(notes, tasks);
    const recommendations = getRecommendations(notes);
    const todayTasks = tasks.filter(t => !t.completed);
    const completedCount = tasks.filter(t => t.completed).length;
    const unlockedBadges = badges.filter(b => b.unlocked).length;

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
        </motion.div>
    );
}
