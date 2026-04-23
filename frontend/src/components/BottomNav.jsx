import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './BottomNav.css';

const navItems = [
    { to: '/', icon: '◉', label: 'HOME' },
    { to: '/study-zone', icon: '◆', label: 'ZONE' },
    { to: '/vault', icon: '▣', label: 'VAULT' },
    { to: '/progress', icon: '≈', label: 'STATS' },
    { to: '/settings', icon: '◯', label: 'YOU' },
];

export default function BottomNav() {
    const location = useLocation();

    return (
        <nav className="bottom-nav" id="bottom-nav">
            {navItems.map(({ to, icon, label }) => {
                return (
                    <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
                        {({ isActive }) => (
                            <>
                                <div className="bottom-nav-icon-wrap">
                                    <span style={{ fontSize: 22, color: isActive ? '#0B0B0F' : 'rgba(245,245,250,0.55)' }}>
                                        {icon}
                                    </span>
                                </div>
                                <span className="bottom-nav-label" style={{ color: isActive ? '#0B0B0F' : 'rgba(245,245,250,0.55)' }}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}
