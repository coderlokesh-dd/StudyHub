import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCog, HiChevronLeft, HiChevronRight, HiOutlineFolder } from 'react-icons/hi';
import { motion } from 'framer-motion';
import './Sidebar.css';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/notes', icon: HiOutlineDocumentText, label: 'Notes' },
    { to: '/tasks', icon: HiOutlineClipboardCheck, label: 'Tasks' },
    { to: '/progress', icon: HiOutlineChartBar, label: 'Progress' },
    { to: '/storage', icon: HiOutlineFolder, label: 'Study Vault' },
    { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar() {
    // Current date state for calendar
    const [currentDate, setCurrentDate] = useState(new Date());

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
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
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
                ))}
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
                    {days.map((day, index) => (
                        <div
                            key={index}
                            className={`calendar-day ${day ? 'active' : 'empty'} ${day && isCurrentMonth && day === today.getDate() ? 'today' : ''}`}
                        >
                            {day || ''}
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-footer-text">Student Organizer v1.0</div>
            </div>
        </aside>
    );
}
