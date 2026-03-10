import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineDocumentText, HiOutlineClipboardCheck, HiOutlineChartBar, HiOutlineCog, HiOutlineFolder } from 'react-icons/hi';
import { motion } from 'framer-motion';
import './BottomNav.css';

const navItems = [
    { to: '/', icon: HiOutlineHome, label: 'Home' },
    { to: '/notes', icon: HiOutlineDocumentText, label: 'Notes' },
    { to: '/tasks', icon: HiOutlineClipboardCheck, label: 'Tasks' },
    { to: '/progress', icon: HiOutlineChartBar, label: 'Stats' },
    { to: '/storage', icon: HiOutlineFolder, label: 'Storage' },
    { to: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function BottomNav() {
    return (
        <nav className="bottom-nav" id="bottom-nav">
            {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
                    {({ isActive }) => (
                        <>
                            <div className="bottom-nav-icon-wrap">
                                <Icon size={22} />
                                {isActive && (
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
            ))}
        </nav>
    );
}
