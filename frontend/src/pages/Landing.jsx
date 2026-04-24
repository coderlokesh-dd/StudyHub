import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone,
    HiOutlineCalendar, HiOutlineAcademicCap, HiOutlineLocationMarker,
    HiOutlineEye, HiOutlineEyeOff, HiOutlineX, HiOutlineShieldCheck,
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import './Landing.css';

/* ───── animation helpers ───── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const tabVariants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 60 : -60, opacity: 0 }),
};

const SCHOOL_TYPES = ['High School', 'Senior Secondary', 'Undergraduate', 'Postgraduate', 'Diploma / Polytechnic', 'Other'];

export default function Landing() {
    const [authModal, setAuthModal] = useState(null);
    const [tab, setTab] = useState('login');
    const [direction, setDirection] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [regForm, setRegForm] = useState({
        firstName: '', lastName: '', username: '', email: '', password: '',
        dob: '', schoolType: '', schoolName: '', address: '', phone: '',
    });
    const { user, loading: authLoading, signIn, signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/', { replace: true });
        }
    }, [user, authLoading, navigate]);

    if (authLoading || user) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner" />
            </div>
        );
    }

    const openAuth = (mode) => {
        setTab(mode);
        setDirection(mode === 'register' ? 1 : -1);
        setAuthModal(mode);
        setError('');
        setSuccess('');
    };

    const closeAuth = () => { setAuthModal(null); setError(''); setSuccess(''); };

    const switchTab = (t) => {
        setDirection(t === 'register' ? 1 : -1);
        setTab(t);
        setError('');
        setSuccess('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!loginForm.email || !loginForm.password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        try {
            await signIn({ email: loginForm.email, password: loginForm.password });
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Invalid credentials.');
        } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        const { firstName, lastName, username, email, password, phone } = regForm;
        if (!firstName || !lastName || !username || !email || !password) { setError('Please fill in all required fields.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (phone && !/^\+?[\d\s-]{7,15}$/.test(phone)) { setError('Please enter a valid phone number.'); return; }
        setLoading(true);
        try {
            await signUp({ email, password, metadata: regForm });
            setSuccess('Account created! Check your email to confirm, then log in.');
            switchTab('login');
        } catch (err) {
            setError(err.message || 'Registration failed.');
        } finally { setLoading(false); }
    };

    const updateLogin = (f, v) => setLoginForm((p) => ({ ...p, [f]: v }));
    const updateReg = (f, v) => setRegForm((p) => ({ ...p, [f]: v }));

    return (
        <div className="lp lp--hero-only">
            {/* BG */}
            <div className="lp-bg">
                <div className="lp-orb lp-orb--1" />
                <div className="lp-orb lp-orb--2" />
                <div className="lp-orb lp-orb--3" />
            </div>

            {/* NAV */}
            <nav className="lp-nav lp-nav--minimal">
                <span className="lp-nav-logo">Student Organizer</span>
                <div className="lp-nav-actions">
                    <button className="lp-nav-link lp-nav-login" onClick={() => openAuth('login')}>Login</button>
                    <motion.button
                        className="lp-nav-cta"
                        onClick={() => openAuth('register')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Get Started
                    </motion.button>
                </div>
            </nav>

            {/* HERO (the full landing page now) */}
            <motion.section
                className="lp-hero lp-hero--full"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                <motion.div className="lp-hero-badge" variants={fadeUp} custom={0}>
                    <HiOutlineShieldCheck size={14} />
                    <span>Free forever for students</span>
                </motion.div>
                <motion.h1 className="lp-hero-title" variants={fadeUp} custom={1}>
                    Student<br />Organizer
                </motion.h1>
                <motion.p className="lp-hero-sub" variants={fadeUp} custom={2}>
                    Your study life. Organized, focused, and smarter.
                </motion.p>
                <motion.div className="lp-hero-btns" variants={fadeUp} custom={3}>
                    <motion.button
                        className="lp-btn lp-btn--primary"
                        onClick={() => openAuth('register')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Get Started — it's free
                    </motion.button>
                    <motion.button
                        className="lp-btn lp-btn--ghost"
                        onClick={() => openAuth('login')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Login
                    </motion.button>
                </motion.div>
                <motion.div className="lp-hero-glow" variants={fadeUp} custom={4} />
            </motion.section>

            {/* AUTH MODAL */}
            <AnimatePresence>
                {authModal && (
                    <motion.div
                        className="lp-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeAuth}
                    >
                        <motion.div
                            className="lp-modal"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="lp-modal-close" onClick={closeAuth}>
                                <HiOutlineX size={20} />
                            </button>

                            <div className="landing-header">
                                <h1 className="landing-logo">Student Organizer</h1>
                                <p className="landing-tagline">
                                    {tab === 'login' ? 'Welcome back!' : 'Create your account'}
                                </p>
                            </div>

                            <div className="landing-tabs">
                                <button className={`landing-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>Login</button>
                                <button className={`landing-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>Register</button>
                                <motion.div
                                    className="landing-tab-indicator"
                                    animate={{ x: tab === 'login' ? 0 : '100%' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            </div>

                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                {error && (
                                    <motion.div className="landing-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key="error">
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {success && <div className="landing-success">{success}</div>}

                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                {tab === 'login' ? (
                                    <motion.form key="login" custom={direction} variants={tabVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="landing-form" onSubmit={handleLogin}>
                                        <div className="landing-field">
                                            <HiOutlineMail className="landing-field-icon" />
                                            <input type="email" placeholder="Email address" value={loginForm.email} onChange={(e) => updateLogin('email', e.target.value)} autoComplete="email" />
                                        </div>
                                        <div className="landing-field">
                                            <HiOutlineLockClosed className="landing-field-icon" />
                                            <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={loginForm.password} onChange={(e) => updateLogin('password', e.target.value)} autoComplete="current-password" />
                                            <button type="button" className="landing-eye" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                                            </button>
                                        </div>
                                        <motion.button type="submit" className="landing-submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            {loading ? <span className="landing-spinner" /> : 'Sign In'}
                                        </motion.button>
                                        <p className="landing-switch">Don't have an account? <button type="button" onClick={() => switchTab('register')}>Register</button></p>
                                    </motion.form>
                                ) : (
                                    <motion.form key="register" custom={direction} variants={tabVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="landing-form landing-form--register" onSubmit={handleRegister}>
                                        <div className="landing-row">
                                            <div className="landing-field"><HiOutlineUser className="landing-field-icon" /><input placeholder="First Name *" value={regForm.firstName} onChange={(e) => updateReg('firstName', e.target.value)} /></div>
                                            <div className="landing-field"><HiOutlineUser className="landing-field-icon" /><input placeholder="Last Name *" value={regForm.lastName} onChange={(e) => updateReg('lastName', e.target.value)} /></div>
                                        </div>
                                        <div className="landing-field"><HiOutlineUser className="landing-field-icon" /><input placeholder="Username *" value={regForm.username} onChange={(e) => updateReg('username', e.target.value)} autoComplete="username" /></div>
                                        <div className="landing-field"><HiOutlineMail className="landing-field-icon" /><input type="email" placeholder="Email *" value={regForm.email} onChange={(e) => updateReg('email', e.target.value)} autoComplete="email" /></div>
                                        <div className="landing-field">
                                            <HiOutlineLockClosed className="landing-field-icon" />
                                            <input type={showPassword ? 'text' : 'password'} placeholder="Password * (min 6 chars)" value={regForm.password} onChange={(e) => updateReg('password', e.target.value)} autoComplete="new-password" />
                                            <button type="button" className="landing-eye" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}</button>
                                        </div>
                                        <div className="landing-field"><HiOutlineCalendar className="landing-field-icon" /><input type="date" value={regForm.dob} onChange={(e) => updateReg('dob', e.target.value)} /></div>
                                        <div className="landing-field">
                                            <HiOutlineAcademicCap className="landing-field-icon" />
                                            <select value={regForm.schoolType} onChange={(e) => updateReg('schoolType', e.target.value)}>
                                                <option value="">School / College Type</option>
                                                {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="landing-field"><HiOutlineAcademicCap className="landing-field-icon" /><input placeholder="School / College Name" value={regForm.schoolName} onChange={(e) => updateReg('schoolName', e.target.value)} /></div>
                                        <div className="landing-field"><HiOutlineLocationMarker className="landing-field-icon" /><input placeholder="Address" value={regForm.address} onChange={(e) => updateReg('address', e.target.value)} /></div>
                                        <div className="landing-field"><HiOutlinePhone className="landing-field-icon" /><input type="tel" placeholder="Phone / WhatsApp" value={regForm.phone} onChange={(e) => updateReg('phone', e.target.value)} /></div>
                                        <motion.button type="submit" className="landing-submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            {loading ? <span className="landing-spinner" /> : 'Create Account'}
                                        </motion.button>
                                        <p className="landing-switch">Already have an account? <button type="button" onClick={() => switchTab('login')}>Login</button></p>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
