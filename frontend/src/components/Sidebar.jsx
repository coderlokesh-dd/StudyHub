import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCog, HiChevronLeft, HiChevronRight, HiOutlineFolder, HiOutlineBookOpen, HiOutlineLightningBolt, HiOutlineCollection, HiOutlineCalendar, HiOutlineLogout, HiOutlineArchive } from 'react-icons/hi';
const SidebarToggleIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
);
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/notes', icon: HiOutlineDocumentText, label: 'Notes' },
    { to: '/tasks', icon: HiOutlineClipboardCheck, label: 'Tasks' },
    { to: '/progress', icon: HiOutlineChartBar, label: 'Progress' },
    { to: '/storage', icon: HiOutlineFolder, label: 'Study Storage' },
    { to: '/vault', icon: HiOutlineArchive, label: 'Study Vault' },
    { to: '/study-zone', icon: HiOutlineLightningBolt, label: 'Study Zone' },
    { to: '/timetable', icon: HiOutlineCalendar, label: 'Timetable' },
    { to: '/journal', icon: HiOutlineBookOpen, label: 'Journal' },
];

const DOCK_SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

// --- Minimized mode: icon-only with size magnification + tooltip ---
const MINI_BASE = 40;
const MINI_MAG = 56;
const MINI_DIST = 120;

function MiniNavItem({ to, icon: Icon, label, mouseY, isJournalActive }) {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);

    const mouseDistance = useTransform(mouseY, val => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return Infinity;
        return val - rect.y - rect.height / 2;
    });

    const targetSize = useTransform(mouseDistance, [-MINI_DIST, 0, MINI_DIST], [MINI_BASE, MINI_MAG, MINI_BASE]);
    const size = useSpring(targetSize, DOCK_SPRING);
    const iconScale = useTransform(size, [MINI_BASE, MINI_MAG], [1, 1.3]);

    return (
        <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-dock-item ${isActive || isJournalActive ? 'active' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {({ isActive }) => (
                <motion.div ref={ref} className="sidebar-dock-icon-wrap" style={{ width: size, height: size }}>
                    {(isActive || isJournalActive) && (
                        <motion.div className="sidebar-dock-indicator" layoutId="sidebarIndicator"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                    )}
                    <motion.div style={{ scale: iconScale }} className="sidebar-dock-icon">
                        <Icon size={20} />
                    </motion.div>
                    <AnimatePresence>
                        {hovered && (
                            <motion.div className="sidebar-dock-label"
                                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.15 }}>
                                {label}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </NavLink>
    );
}

// --- Expanded mode: full icon+text row with scale magnification ---
const EXPAND_BASE = 40;
const EXPAND_MAG = 48;
const EXPAND_DIST = 100;

function ExpandedNavItem({ to, icon: Icon, label, mouseY, isJournalActive }) {
    const ref = useRef(null);

    const mouseDistance = useTransform(mouseY, val => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return Infinity;
        return val - rect.y - rect.height / 2;
    });

    const targetHeight = useTransform(mouseDistance, [-EXPAND_DIST, 0, EXPAND_DIST], [EXPAND_BASE, EXPAND_MAG, EXPAND_BASE]);
    const height = useSpring(targetHeight, DOCK_SPRING);
    const scale = useTransform(height, [EXPAND_BASE, EXPAND_MAG], [1, 1.08]);

    return (
        <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive || isJournalActive ? 'active' : ''}`}
        >
            {({ isActive }) => (
                <motion.div ref={ref} className="sidebar-link-inner" style={{ height, scale }}>
                    {(isActive || isJournalActive) && (
                        <motion.div className="sidebar-indicator" layoutId="sidebarIndicator"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                    )}
                    <Icon size={20} />
                    <span>{label}</span>
                </motion.div>
            )}
        </NavLink>
    );
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { journal } = useApp();
    const { signOut, profile } = useAuth();
    const mouseY = useMotionValue(Infinity);
    const [collapsed, setCollapsed] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sidebar_collapsed')) || false; } catch { return false; }
    });
    const [currentDate, setCurrentDate] = useState(new Date());

    // Sync CSS variable with collapsed state
    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', collapsed ? '72px' : '260px');
    }, [collapsed]);

    const toggleCollapsed = () => {
        setCollapsed(prev => {
            localStorage.setItem('sidebar_collapsed', JSON.stringify(!prev));
            return !prev;
        });
    };

    const journalDates = new Set((journal || []).map(j => j.date));

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const days = generateCalendar();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--mini' : ''}`} id="sidebar">
            <div className="sidebar-brand">
                {!collapsed && (
                    <>
                        <div className="sidebar-logo">📖</div>
                        <span className="sidebar-title">StudyHub</span>
                    </>
                )}
                {!collapsed && (
                    <NavLink to="/settings" className="sidebar-settings-icon" title="Settings">
                        <HiOutlineCog size={20} />
                    </NavLink>
                )}
                <button className="sidebar-collapse-btn" onClick={toggleCollapsed} title={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}>
                    <SidebarToggleIcon size={18} />
                </button>
            </div>

            <nav
                className={`sidebar-nav ${collapsed ? 'sidebar-nav--mini' : ''}`}
                onMouseMove={(e) => mouseY.set(e.clientY)}
                onMouseLeave={() => mouseY.set(Infinity)}
            >
                {navItems.map(({ to, icon, label }) => {
                    const isJournalActive = to === '/journal' && location.pathname.startsWith('/journal');
                    return collapsed ? (
                        <MiniNavItem key={to} to={to} icon={icon} label={label} mouseY={mouseY} isJournalActive={isJournalActive} />
                    ) : (
                        <ExpandedNavItem key={to} to={to} icon={icon} label={label} mouseY={mouseY} isJournalActive={isJournalActive} />
                    );
                })}
            </nav>

            {collapsed ? (
                <>
                    <div className="sidebar-mini-date" title={`${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`}>
                        <span className="sidebar-mini-date-day">{dayNames[today.getDay()].slice(0, 3)}</span>
                        <span className="sidebar-mini-date-num">{today.getDate()}</span>
                        <span className="sidebar-mini-date-month">{monthNames[today.getMonth()].slice(0, 3)}</span>
                    </div>
                    <div className="sidebar-mini-settings">
                        <NavLink to="/settings" className="sidebar-dock-item" title="Settings">
                            <div className="sidebar-dock-icon-wrap" style={{ width: 36, height: 36 }}>
                                <div className="sidebar-dock-icon"><HiOutlineCog size={18} /></div>
                            </div>
                        </NavLink>
                    </div>
                </>
            ) : (
                <>
                    <div className="sidebar-calendar">
                        <div className="calendar-header">
                            <button className="btn-icon small-btn" onClick={prevMonth}><HiChevronLeft size={16} /></button>
                            <span className="calendar-month">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                            <button className="btn-icon small-btn" onClick={nextMonth}><HiChevronRight size={16} /></button>
                        </div>
                        <div className="calendar-grid-header">
                            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>
                        <div className="calendar-grid">
                            {days.map((day, index) => {
                                const dateStr = day ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                                const hasJournal = dateStr && journalDates.has(dateStr);
                                return (
                                    <div key={index}
                                        className={`calendar-day ${day ? 'active' : 'empty'} ${day && isCurrentMonth && day === today.getDate() ? 'today' : ''} ${hasJournal ? 'has-journal' : ''}`}
                                        onClick={day && dateStr ? () => navigate(`/journal/${dateStr}`) : undefined}
                                        style={day ? { cursor: 'pointer' } : undefined}>
                                        {day || ''}
                                        {hasJournal && <span className="journal-dot" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="sidebar-footer">
                        {profile && <div className="sidebar-footer-text" style={{ marginBottom: '0.35rem', fontWeight: 500 }}>Hi, {profile.first_name}</div>}
                        <button className="sidebar-signout-btn" onClick={signOut}>
                            <HiOutlineLogout size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </>
            )}
        </aside>
    );
}
