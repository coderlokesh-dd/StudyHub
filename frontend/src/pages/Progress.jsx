import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HiOutlineFire, HiOutlineDocumentText, HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';
import { useApp } from '../contexts/AppContext';
import { getWeeklyStudyData } from '../utils/helpers';
import './Progress.css';

const containerVariants = {
    animate: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip-label">{label}</p>
                <p className="chart-tooltip-value">{payload[0].value} min</p>
            </div>
        );
    }
    return null;
};

export default function Progress() {
    const { notes, tasks, streak, badges, totalStudyMinutes, studyLog, logStudyTime } = useApp();
    const weeklyData = getWeeklyStudyData(studyLog);
    const completedTasks = tasks.filter(t => t.completed).length;
    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges = badges.filter(b => !b.unlocked);

    const stats = [
        { icon: HiOutlineFire, label: 'Current Streak', value: `${streak.current} days`, accent: true },
        { icon: HiOutlineClock, label: 'Total Study Time', value: `${Math.round(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`, accent: false },
        { icon: HiOutlineDocumentText, label: 'Notes Created', value: notes.length, accent: false },
        { icon: HiOutlineCheck, label: 'Tasks Completed', value: completedTasks, accent: false },
    ];

    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            <motion.h1 variants={itemVariants} style={{ marginBottom: 'var(--space-xl)' }}>📊 Study Progress</motion.h1>

            {/* Stats Cards */}
            <motion.div className="progress-stats" variants={itemVariants}>
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        className={`progress-stat-card ${s.accent ? 'accent' : ''}`}
                        whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
                    >
                        <s.icon size={20} />
                        <div className="progress-stat-value">{s.value}</div>
                        <div className="progress-stat-label">{s.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Streak Display */}
            <motion.section className="streak-section" variants={itemVariants}>
                <div className="streak-header">
                    <motion.span
                        className="streak-flame"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    >
                        🔥
                    </motion.span>
                    <div>
                        <h3>{streak.current} Day Streak!</h3>
                        <p className="streak-sub">Longest: {streak.longest} days</p>
                    </div>
                </div>
                <div className="streak-bar-wrap">
                    <motion.div
                        className="streak-bar"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((streak.current / 30) * 100, 100)}%` }}
                        transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                    <div className="streak-bar-shimmer" />
                    <span className="streak-bar-label">Goal: 30 days</span>
                </div>
            </motion.section>

            {/* Weekly Study Chart */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">📈 This Week's Study Time</h3>
                <div className="chart-card">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyData} barCategoryGap="25%">
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                            <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="m" width={35} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--accent-rgb), 0.05)' }} />
                            <Bar dataKey="minutes" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.section>

            {/* Log Study Time */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">⏱️ Log Study Time</h3>
                <div className="log-buttons">
                    {[15, 30, 45, 60].map(mins => (
                        <motion.button
                            key={mins}
                            className="btn btn-secondary log-btn"
                            onClick={() => logStudyTime(mins)}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            +{mins} min
                        </motion.button>
                    ))}
                </div>
            </motion.section>

            {/* Badges */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">🏆 Achievements ({unlockedBadges.length}/{badges.length})</h3>
                <div className="badges-grid">
                    {unlockedBadges.map(badge => (
                        <motion.div
                            key={badge.id}
                            className="badge-card unlocked"
                            whileHover={{ scale: 1.03, y: -3 }}
                        >
                            <span className="badge-icon">{badge.icon}</span>
                            <h4 className="badge-name">{badge.name}</h4>
                            <p className="badge-desc">{badge.description}</p>
                        </motion.div>
                    ))}
                    {lockedBadges.map(badge => (
                        <div key={badge.id} className="badge-card locked">
                            <span className="badge-icon">{badge.icon}</span>
                            <h4 className="badge-name">{badge.name}</h4>
                            <p className="badge-desc">{badge.description}</p>
                            <div className="badge-lock">🔒</div>
                        </div>
                    ))}
                </div>
            </motion.section>
        </motion.div>
    );
}
