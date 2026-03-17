import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
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

const SUBJECT_COLORS = ['#7C5CFF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#8B5CF6'];

function getSubjectStudyData(sessions) {
    const map = {};
    (sessions || []).forEach(s => {
        const subject = s.subject || 'Unspecified';
        map[subject] = (map[subject] || 0) + (s.duration || 0);
    });
    return Object.entries(map)
        .map(([name, minutes]) => ({ name, minutes: Math.round(minutes) }))
        .sort((a, b) => b.minutes - a.minutes);
}

const SubjectTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip-label">{d.name}</p>
                <p className="chart-tooltip-value">{d.minutes} min</p>
            </div>
        );
    }
    return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

function getMonthlyStudyData(studyLog) {
    const data = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const entry = (studyLog || []).find(e => e.date === dateStr);
        data.push({ day: String(i), date: dateStr, minutes: entry ? entry.minutes : 0 });
    }
    return data;
}

function getYearlyStudyData(studyLog) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const year = now.getFullYear();
    const data = months.map((name, i) => {
        const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
        const total = (studyLog || [])
            .filter(e => e.date.startsWith(prefix))
            .reduce((sum, e) => sum + e.minutes, 0);
        return { day: name, minutes: Math.round(total) };
    });
    return data;
}

function LogStudyInput({ onLog }) {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [logged, setLogged] = useState(false);

    const handleLog = () => {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const total = h * 60 + m;
        if (total <= 0) return;
        onLog(total);
        setHours('');
        setMinutes('');
        setLogged(true);
        setTimeout(() => setLogged(false), 2000);
    };

    return (
        <div className="log-custom-card">
            <div className="log-custom-inputs">
                <div className="log-input-group">
                    <input
                        type="number"
                        min="0"
                        max="24"
                        value={hours}
                        onChange={e => setHours(e.target.value)}
                        placeholder="0"
                        className="log-input"
                    />
                    <span className="log-input-label">hours</span>
                </div>
                <span className="log-input-sep">:</span>
                <div className="log-input-group">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={minutes}
                        onChange={e => setMinutes(e.target.value)}
                        placeholder="0"
                        className="log-input"
                    />
                    <span className="log-input-label">minutes</span>
                </div>
                <motion.button
                    className="btn btn-primary log-submit-btn"
                    onClick={handleLog}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!(parseInt(hours) || parseInt(minutes))}
                >
                    {logged ? '✓ Logged!' : 'Log Time'}
                </motion.button>
            </div>
        </div>
    );
}

export default function Progress() {
    const { notes, tasks, streak, badges, totalStudyMinutes, studyLog, studySessions, logStudyTime } = useApp();
    const [timeFilter, setTimeFilter] = useState('week');
    const weeklyData = getWeeklyStudyData(studyLog);
    const monthlyData = getMonthlyStudyData(studyLog);
    const yearlyData = getYearlyStudyData(studyLog);
    const completedTasks = tasks.filter(t => t.completed).length;
    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges = badges.filter(b => !b.unlocked);
    const subjectData = getSubjectStudyData(studySessions);
    const totalSubjectMinutes = subjectData.reduce((sum, d) => sum + d.minutes, 0);

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

            {/* Study Time Chart */}
            <motion.section variants={itemVariants}>
                <div className="chart-header">
                    <h3 className="section-title" style={{ marginBottom: 0 }}>
                        📈 {timeFilter === 'week' ? "This Week's" : timeFilter === 'month' ? "This Month's" : "This Year's"} Study Time
                    </h3>
                    <div className="chart-filter">
                        {['week', 'month', 'year'].map(f => (
                            <button
                                key={f}
                                className={`chart-filter-btn ${timeFilter === f ? 'active' : ''}`}
                                onClick={() => setTimeFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-card">
                    <ResponsiveContainer width="100%" height={240}>
                        {timeFilter === 'week' ? (
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
                        ) : (
                            <AreaChart data={timeFilter === 'month' ? monthlyData : yearlyData}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="var(--text-tertiary)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    interval={timeFilter === 'month' ? 4 : 0}
                                />
                                <YAxis stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} unit="m" width={40} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="minutes"
                                    stroke="var(--accent)"
                                    strokeWidth={2.5}
                                    fill="url(#areaGradient)"
                                    dot={{ r: timeFilter === 'year' ? 4 : 2, fill: 'var(--accent)', strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </motion.section>

            {/* Subject-wise Analytics */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">📚 Study Time by Subject</h3>
                {subjectData.length === 0 ? (
                    <div className="chart-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                        <p style={{ color: 'var(--text-tertiary)' }}>No study sessions recorded yet. Start a session in Study Zone to see subject analytics.</p>
                    </div>
                ) : (
                    <div className="subject-analytics">
                        <div className="chart-card subject-pie-card">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={subjectData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={100}
                                        dataKey="minutes"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        strokeWidth={2}
                                        stroke="var(--bg-primary)"
                                    >
                                        {subjectData.map((_, i) => (
                                            <Cell key={i} fill={SUBJECT_COLORS[i % SUBJECT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<SubjectTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="subject-breakdown">
                            {subjectData.map((d, i) => {
                                const pct = totalSubjectMinutes > 0 ? ((d.minutes / totalSubjectMinutes) * 100).toFixed(1) : 0;
                                const hours = Math.floor(d.minutes / 60);
                                const mins = d.minutes % 60;
                                return (
                                    <div key={d.name} className="subject-row">
                                        <div className="subject-row-left">
                                            <span className="subject-dot" style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                                            <span className="subject-name">{d.name}</span>
                                        </div>
                                        <div className="subject-row-right">
                                            <span className="subject-time">{hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}</span>
                                            <span className="subject-pct">{pct}%</span>
                                        </div>
                                        <div className="subject-bar-wrap">
                                            <motion.div
                                                className="subject-bar"
                                                style={{ background: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.section>

            {/* Log Study Time */}
            <motion.section variants={itemVariants}>
                <h3 className="section-title">⏱️ How much did you study today?</h3>
                <LogStudyInput onLog={logStudyTime} />
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
