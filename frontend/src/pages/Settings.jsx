import { motion } from 'framer-motion';
import { HiOutlineMoon, HiOutlineSun, HiOutlineTrash, HiOutlineLogout } from 'react-icons/hi';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
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
    const { signOut } = useAuth();

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            resetAllData();
        }
    };

    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            <motion.h1 variants={itemVariants} style={{ marginBottom: 'var(--space-lg)' }}>⚙️ Settings</motion.h1>

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
                
                <div className="setting-row" onClick={signOut} id="signout-btn" style={{ marginBottom: 'var(--space-md)' }}>
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

                <div className="setting-row" onClick={handleReset} id="reset-data-btn">
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

            {/* App Info */}
            <motion.div className="settings-footer" variants={itemVariants}>
                <p>Student Organizer v1.0</p>
                <p>Built with ❤️ for Gen Z students</p>
            </motion.div>
        </motion.div>
    );
}
