import { NavLink, useLocation } from 'react-router-dom';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCog, HiOutlineFolder, HiOutlineBookOpen, HiOutlineLightningBolt, HiOutlineCollection, HiOutlineCalendar } from 'react-icons/hi';
import { motion } from 'framer-motion';
import './BottomNav.css';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Home' },
    { to: '/notes', icon: HiOutlineDocumentText, label: 'Notes' },
    { to: '/tasks', icon: HiOutlineClipboardCheck, label: 'Tasks' },
    { to: '/progress', icon: HiOutlineChartBar, label: 'Stats' },
    { to: '/storage', icon: HiOutlineFolder, label: 'Vault' },
    { to: '/study-zone', icon: HiOutlineLightningBolt, label: 'Focus' },
    { to: '/timetable', icon: HiOutlineCalendar, label: 'Schedule' },
    { to: '/journal', icon: HiOutlineBookOpen, label: 'Journal' },
    { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function BottomNav() {
    const location = useLocation();

    return (
        <nav className="bottom-nav" id="bottom-nav">
            {navItems.map(({ to, icon: Icon, label }) => {
                const isJournalActive = to === '/journal' && location.pathname.startsWith('/journal');
                return (
                    <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive || isJournalActive ? 'active' : ''}`} end={to === '/'}>
                        {({ isActive }) => (
                            <>
                                <div className="bottom-nav-icon-wrap">
                                    <Icon size={22} />
                                    {(isActive || isJournalActive) && (
                                        <motion.div
                                            className="bottom-nav-indicator"
                                            layoutId="bottomNavIndicator"
                                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                        />
                                    )}
                                </div>
                                <span className="bottom-nav-label">{label}</span>
                            </>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}
