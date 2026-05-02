import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineMoon, HiOutlineSun, HiOutlineTrash, HiOutlineLogout, HiOutlineHeart, HiOutlineUserCircle, HiOutlineMail } from 'react-icons/hi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Modal from '../components/Modal';
import './Settings.css';

const containerVariants = {
    animate: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const accentNames = {
    purple: 'Purple',
    blue: 'Ocean Blue',
    green: 'Emerald',
    orange: 'Sunset',
    pink: 'Rose Pink',
};

export default function Settings() {
    const { theme, toggleTheme, accent, setAccent, fontSize, setFontSize, tone, setTone, ACCENT_COLORS, FONT_SIZES } = useTheme();
    const { resetAllData } = useApp();
    const { signOut, user, profile } = useAuth();

    // confirm: null | { title, message, confirmLabel, onConfirm }
    const [confirm, setConfirm] = useState(null);

    const username = profile?.username
        || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
        || user?.user_metadata?.username
        || '—';
    const email = profile?.email || user?.email || '—';

    const askSignOut = () => setConfirm({
        title: 'Sign out?',
        message: 'You\'ll need to log in again to access your notes, tasks, and study vault on this device.',
        confirmLabel: 'Sign Out',
        onConfirm: signOut,
    });

    const askReset = () => setConfirm({
        title: 'Erase all data?',
        message: 'This will clear all your notes, tasks, journal entries, and study progress on this device. This action cannot be undone.',
        confirmLabel: 'Erase Data',
        onConfirm: resetAllData,
    });

    const runConfirm = async () => {
        const fn = confirm?.onConfirm;
        setConfirm(null);
        if (fn) await fn();
    };

    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            <motion.h1 variants={itemVariants} style={{ marginBottom: 'var(--space-lg)' }}>⚙️ Settings</motion.h1>

            {/* Account Info */}
            <motion.section className="settings-section card" variants={itemVariants}>
                <h3 className="settings-section-title">Account</h3>
                <div className="settings-account">
                    <div className="settings-account-avatar" aria-hidden="true">
                        {(username && username !== '—' ? username : email).charAt(0).toUpperCase()}
                    </div>
                    <div className="settings-account-info">
                        <div className="settings-account-row">
                            <HiOutlineUserCircle size={16} />
                            <span className="settings-account-label">Username</span>
                            <span className="settings-account-value">{username}</span>
                        </div>
                        <div className="settings-account-row">
                            <HiOutlineMail size={16} />
                            <span className="settings-account-label">Email</span>
                            <span className="settings-account-value">{email}</span>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Theme Toggle */}
            <motion.section className="settings-section card" variants={itemVariants}>
                <h3 className="settings-section-title">Appearance</h3>
                <div className="setting-row" onClick={toggleTheme} id="theme-toggle">
                    <div className="setting-info">
                        {theme === 'dark' ? <HiOutlineMoon size={20} /> : <HiOutlineSun size={20} />}
                        <div>
                            <span className="setting-label">Theme</span>
                            <span className="setting-desc">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
                        </div>
                    </div>
                    <div className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}>
                        <motion.div className="toggle-knob" layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                </div>
            </motion.section>

            {/* Tone Toggle */}
            <motion.section className="settings-section card" variants={itemVariants}>
                <h3 className="settings-section-title">Communication</h3>
                <div className="setting-row">
                    <div className="setting-info">
                        <div>
                            <span className="setting-label">Tone</span>
                            <span className="setting-desc">Choose how the app talks to you</span>
                        </div>
                    </div>
                    
                    <div className="tone-toggle-wrap">
                        <span className="tone-label">TONE <span style={{opacity:0.3, margin: '0 8px'}}>|</span></span>
                        <div className="tone-options">
                            <button 
                                className={`tone-btn ${tone === 'pro' ? 'active' : ''}`}
                                onClick={() => setTone('pro')}
                            >
                                PRO
                            </button>
                            <button 
                                className={`tone-btn ${tone === 'gen-z' ? 'active' : ''}`}
                                onClick={() => setTone('gen-z')}
                            >
                                GEN-Z
                            </button>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Accent Colors */}
            <motion.section className="settings-section card" variants={itemVariants}>
                <h3 className="settings-section-title">Accent Color</h3>
                <div className="accent-grid">
                    {/* Predefined Colors */}
                    {ACCENT_COLORS.map(color => (
                        <motion.button
                            key={color}
                            className={`accent-swatch ${color} ${accent === color ? 'active' : ''}`}
                            onClick={() => setAccent(color)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title={accentNames[color]}
                            id={`accent-${color}`}
                        >
                            {accent === color && (
                                <motion.div className="accent-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
                            )}
                            <span className="accent-name">{accentNames[color]}</span>
                        </motion.button>
                    ))}

                    {/* Custom Color Picker */}
                    <motion.div
                        className={`accent-swatch custom-color-wrap ${accent.startsWith('#') ? 'active' : ''}`}
                        title="Custom Color"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={accent.startsWith('#') ? {
                            background: `rgba(var(--accent-rgb), 0.15)`,
                            color: accent,
                            borderColor: accent
                        } : {
                            background: `var(--bg-input)`,
                            border: `1px dashed var(--border-color)`
                        }}
                    >
                        <input
                            type="color"
                            id="custom-accent"
                            value={accent.startsWith('#') ? accent : '#7C5CFF'}
                            onChange={(e) => setAccent(e.target.value)}
                            className="color-picker-input"
                        />
                        {accent.startsWith('#') ? (
                            <motion.div className="accent-check" initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.div>
                        ) : (
                            <div className="custom-color-icon">+</div>
                        )}
                        <span className="accent-name">Custom</span>
                    </motion.div>
                </div>
            </motion.section>

            {/* Font Size */}
            <motion.section className="settings-section card" variants={itemVariants}>
                <h3 className="settings-section-title">Font Size Scale</h3>
                <div className="font-size-slider-wrap">
                    <span className="font-icon small">Aa</span>
                    <input
                        type="range"
                        min="80"
                        max="150"
                        step="5"
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="font-size-slider"
                        id="font-size-scale-slider"
                    />
                    <span className="font-icon large">Aa</span>
                    <span className="font-size-percentage">{fontSize}%</span>
                </div>
            </motion.section>

            {/* Danger Zone */}
            <motion.section className="settings-section card" variants={itemVariants}>
                <h3 className="settings-section-title">Account & Data</h3>
                
                <div className="setting-row" onClick={askSignOut} id="signout-btn" style={{ marginBottom: 'var(--space-md)' }}>
                    <div className="setting-info">
                        <HiOutlineLogout size={20} style={{ color: '#ef4444' }} />
                        <div>
                            <span className="setting-label" style={{ color: '#ef4444' }}>Sign Out</span>
                            <span className="setting-desc">Log out of your account on this device</span>
                        </div>
                    </div>
                    <span className="reset-arrow" style={{ color: '#ef4444' }}>→</span>
                </div>

                <div className="setting-divider" style={{ margin: 'var(--space-md) 0', height: '1px', background: 'var(--border-subtle)' }} />

                <div className="setting-row" onClick={askReset} id="reset-data-btn">
                    <div className="setting-info">
                        <HiOutlineTrash size={20} />
                        <div>
                            <span className="setting-label">Reset All Data</span>
                            <span className="setting-desc">Clear all notes, tasks, and progress data</span>
                        </div>
                    </div>
                    <span className="reset-arrow">→</span>
                </div>
            </motion.section>

            {/* Confirm Dialog */}
            <Modal
                isOpen={!!confirm}
                onClose={() => setConfirm(null)}
                title={confirm?.title || ''}
            >
                <p className="settings-confirm-message">{confirm?.message}</p>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
                    <motion.button
                        className="btn btn-danger"
                        onClick={runConfirm}
                        whileHover={{ scale: 1.03 }}
                    >
                        {confirm?.confirmLabel}
                    </motion.button>
                </div>
            </Modal>

            {/* App Info */}
            <motion.div className="settings-footer" variants={itemVariants}>
                <p>Student Organizer v1.0</p>
                <p>Built with ❤️ for Gen Z students</p>

                <nav className="settings-footer-links" aria-label="Footer links">
                    <Link to="/credits">Credits</Link>
                    <span aria-hidden="true">·</span>
                    <Link to="/legal#privacy">Privacy</Link>
                    <span aria-hidden="true">·</span>
                    <Link to="/legal#terms">Terms</Link>
                    <span aria-hidden="true">·</span>
                    <Link to="/roadmap">Roadmap</Link>
                    <span aria-hidden="true">·</span>
                    <Link to="/credits#contact">Contact</Link>
                </nav>

                <p className="settings-footer-credit">
                    <span>Designed &amp; built by</span>
                    <Link to="/credits">Lokeshwaran S</Link>
                    <HiOutlineHeart size={12} aria-hidden="true" />
                </p>
            </motion.div>
        </motion.div>
    );
}
