import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineHome, HiOutlineClipboardCheck, HiOutlineDocumentText,
    HiOutlineLightningBolt, HiOutlineDotsHorizontal,
    HiOutlineArchive, HiOutlineCalendar, HiOutlineBookOpen,
    HiOutlineChartBar, HiOutlineCog, HiOutlineX,
} from 'react-icons/hi';
import './BottomNav.css';

const primaryItems = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'HOME' },
    { to: '/tasks', icon: HiOutlineClipboardCheck, label: 'TASKS' },
    { to: '/notes', icon: HiOutlineDocumentText, label: 'NOTES' },
    { to: '/study-zone', icon: HiOutlineLightningBolt, label: 'ZONE' },
];

const moreItems = [
    { to: '/vault', icon: HiOutlineArchive, label: 'Study Vault', tone: 'lavender' },
    { to: '/timetable', icon: HiOutlineCalendar, label: 'Timetable', tone: 'sky' },
    { to: '/journal', icon: HiOutlineBookOpen, label: 'Journal', tone: 'butter' },
    { to: '/progress', icon: HiOutlineChartBar, label: 'Progress', tone: 'mint' },
    { to: '/settings', icon: HiOutlineCog, label: 'Settings', tone: 'coral' },
];

const MORE_PATHS = moreItems.map((m) => m.to);

export default function BottomNav() {
    const location = useLocation();
    const [sheetOpen, setSheetOpen] = useState(false);

    // Close sheet on route change
    useEffect(() => { setSheetOpen(false); }, [location.pathname]);

    // Lock body scroll while sheet is open
    useEffect(() => {
        if (sheetOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [sheetOpen]);

    const isMoreActive = MORE_PATHS.some((p) => location.pathname.startsWith(p));

    return (
        <>
            <nav className="bottom-nav" id="bottom-nav">
                {primaryItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
                        end={to === '/dashboard'}
                    >
                        {({ isActive }) => (
                            <>
                                <div className="bottom-nav-icon-wrap">
                                    <Icon size={22} color={isActive ? '#0B0B0F' : 'rgba(245,245,250,0.6)'} />
                                </div>
                                <span
                                    className="bottom-nav-label"
                                    style={{ color: isActive ? '#0B0B0F' : 'rgba(245,245,250,0.6)' }}
                                >
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}

                <button
                    className={`bottom-nav-item bottom-nav-more ${isMoreActive || sheetOpen ? 'active' : ''}`}
                    onClick={() => setSheetOpen(true)}
                    type="button"
                >
                    <div className="bottom-nav-icon-wrap">
                        <HiOutlineDotsHorizontal size={22} color={isMoreActive || sheetOpen ? '#0B0B0F' : 'rgba(245,245,250,0.6)'} />
                    </div>
                    <span
                        className="bottom-nav-label"
                        style={{ color: isMoreActive || sheetOpen ? '#0B0B0F' : 'rgba(245,245,250,0.6)' }}
                    >
                        MORE
                    </span>
                </button>
            </nav>

            <AnimatePresence>
                {sheetOpen && (
                    <motion.div
                        className="bottom-sheet-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSheetOpen(false)}
                    >
                        <motion.div
                            className="bottom-sheet"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bottom-sheet-handle" />

                            <div className="bottom-sheet-header">
                                <h3 className="bottom-sheet-title">More</h3>
                                <button
                                    className="bottom-sheet-close"
                                    onClick={() => setSheetOpen(false)}
                                    aria-label="Close"
                                >
                                    <HiOutlineX size={18} />
                                </button>
                            </div>

                            <div className="bottom-sheet-grid">
                                {moreItems.map(({ to, icon: Icon, label, tone }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        className={({ isActive }) => `sheet-item sheet-item--${tone} ${isActive ? 'active' : ''}`}
                                    >
                                        <span className={`sheet-item-icon sheet-item-icon--${tone}`}>
                                            <Icon size={22} />
                                        </span>
                                        <span className="sheet-item-label">{label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
