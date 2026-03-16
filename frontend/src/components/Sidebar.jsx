import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCog, HiChevronLeft, HiChevronRight, HiOutlineFolder, HiOutlineBookOpen, HiOutlineLightningBolt } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/notes', icon: HiOutlineDocumentText, label: 'Notes' },
    { to: '/tasks', icon: HiOutlineClipboardCheck, label: 'Tasks' },
    { to: '/progress', icon: HiOutlineChartBar, label: 'Progress' },
    { to: '/storage', icon: HiOutlineFolder, label: 'Study Vault' },
    { to: '/study-zone', icon: HiOutlineLightningBolt, label: 'Study Zone' },
    { to: '/journal', icon: HiOutlineBookOpen, label: 'Journal' },
    { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { journal } = useApp();
    // Current date state for calendar
    const [currentDate, setCurrentDate] = useState(new Date());

    // Set of dates that have journal entries for dot indicators
    const journalDates = new Set((journal || []).map(j => j.date));

    // Generate calendar days
    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const days = generateCalendar();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <aside className="sidebar" id="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">📖</div>
                <span className="sidebar-title">StudyHub</span>
            </div>
            <nav className="sidebar-nav">
                {navItems.map(({ to, icon: Icon, label }) => {
                    const resolvedTo = to;
                    const isJournalActive = to === '/journal' && location.pathname.startsWith('/journal');
                    return (
                        <NavLink
                            key={to}
                            to={resolvedTo}
                            className={({ isActive }) => `sidebar-link ${isActive || isJournalActive ? 'active' : ''}`}
                            end={to === '/'}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            className="sidebar-indicator"
                                            layoutId="sidebarIndicator"
                                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                        />
                                    )}
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

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
                            <div
                                key={index}
                                className={`calendar-day ${day ? 'active' : 'empty'} ${day && isCurrentMonth && day === today.getDate() ? 'today' : ''} ${hasJournal ? 'has-journal' : ''}`}
                                onClick={day && dateStr ? () => navigate(`/journal/${dateStr}`) : undefined}
                                style={day ? { cursor: 'pointer' } : undefined}
                            >
                                {day || ''}
                                {hasJournal && <span className="journal-dot" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-footer-text">Student Organizer v1.0</div>
            </div>
        </aside>
    );
}
