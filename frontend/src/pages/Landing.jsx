import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone,
    HiOutlineCalendar, HiOutlineAcademicCap, HiOutlineLocationMarker,
    HiOutlineEye, HiOutlineEyeOff, HiOutlineX,
    HiOutlineFolder, HiOutlineBookOpen, HiOutlineLightningBolt,
    HiOutlineChartBar, HiOutlineClipboardCheck, HiOutlineDocumentText,
    HiOutlineClock, HiOutlineShieldCheck,
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import ctaHeroImg from '../assets/cta-hero.png';
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

function Section({ children, className = '', id }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.section
            ref={ref}
            id={id}
            className={`lp-section ${className}`}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={stagger}
        >
            {children}
        </motion.section>
    );
}

/* ───── data ───── */
const FEATURES = [
    { icon: HiOutlineFolder, title: 'Study Vault', desc: 'Organize notes by semester and subject. Upload, preview, and access files anywhere.' },
    { icon: HiOutlineBookOpen, title: 'Journal', desc: 'Write daily reflections and track your thoughts with mood logging.' },
    { icon: HiOutlineLightningBolt, title: 'Study Zone', desc: 'Focus with Pomodoro timer-based deep work sessions.' },
    { icon: HiOutlineChartBar, title: 'Progress Tracking', desc: 'Visualize your study performance with streaks, charts, and badges.' },
    { icon: HiOutlineClipboardCheck, title: 'Smart Tasks', desc: 'Manage assignments with priorities, due dates, and subtasks.' },
    { icon: HiOutlineDocumentText, title: 'Quick Notes', desc: 'Capture ideas instantly with categories and favorites.' },
];

const PREVIEWS = [
    { label: 'Dashboard', gradient: 'linear-gradient(135deg, #7c5cff22, #3b82f622)', items: ['Study streak tracker', 'Exam countdown', 'Quick actions', 'Achievement badges'] },
    { label: 'Study Vault', gradient: 'linear-gradient(135deg, #3b82f622, #06b6d422)', items: ['Semester folders', 'Subject organization', 'PDF & image preview', 'Drag-and-drop upload'] },
    { label: 'Journal', gradient: 'linear-gradient(135deg, #ec489922, #f59e0b22)', items: ['Daily reflections', 'Mood tracking', 'Calendar view', 'Rich text editor'] },
    { label: 'Study Zone', gradient: 'linear-gradient(135deg, #10b98122, #7c5cff22)', items: ['Pomodoro timer', 'Session logging', 'Focus mode', 'Study analytics'] },
];

const SCHOOL_TYPES = ['High School', 'Senior Secondary', 'Undergraduate', 'Postgraduate', 'Diploma / Polytechnic', 'Other'];

/* ───── nav links ───── */
const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'Study Vault', href: '#preview' },
    { label: 'Journal', href: '#preview' },
    { label: 'Study Zone', href: '#preview' },
];

/* ───── component ───── */
export default function Landing() {
    const [authModal, setAuthModal] = useState(null);
    const [tab, setTab] = useState('login');
    const [direction, setDirection] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [ctaHover, setCtaHover] = useState(null);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (href) => {
        setMobileMenuOpen(false);
        const id = href.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [regForm, setRegForm] = useState({
        firstName: '', lastName: '', username: '', email: '', password: '',
        dob: '', schoolType: '', schoolName: '', address: '', phone: '',
    });

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
        <div className="lp">
            {/* BG */}
            <div className="lp-bg">
                <div className="lp-orb lp-orb--1" />
                <div className="lp-orb lp-orb--2" />
                <div className="lp-orb lp-orb--3" />
                <div className="lp-grid-overlay" />
            </div>

            {/* ══════ NAV ══════ */}
            <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
                <span className="lp-nav-logo">Student Organizer</span>

                <div className="lp-nav-center">
                    {NAV_LINKS.map((link) => (
                        <button key={link.label} className="lp-nav-link" onClick={() => scrollTo(link.href)}>
                            {link.label}
                        </button>
                    ))}
                </div>

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

                {/* Mobile hamburger */}
                <button className="lp-nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
                    <span className={`lp-hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                    <span className={`lp-hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                    <span className={`lp-hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
                </button>

                {/* Mobile dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="lp-nav-mobile"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {NAV_LINKS.map((link) => (
                                <button key={link.label} className="lp-nav-mobile-link" onClick={() => scrollTo(link.href)}>
                                    {link.label}
                                </button>
                            ))}
                            <div className="lp-nav-mobile-divider" />
                            <button className="lp-nav-mobile-link" onClick={() => { setMobileMenuOpen(false); openAuth('login'); }}>Login</button>
                            <button className="lp-nav-mobile-link lp-nav-mobile-cta" onClick={() => { setMobileMenuOpen(false); openAuth('register'); }}>Get Started</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ══════ HERO ══════ */}
            <Section className="lp-hero">
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
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(124,92,255,0.4)' }}
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
            </Section>

            {/* ══════ FEATURES ══════ */}
            <Section className="lp-features" id="features">
                <motion.span className="lp-label" variants={fadeUp}>Features</motion.span>
                <motion.h2 className="lp-heading" variants={fadeUp} custom={1}>
                    Everything you need to ace your studies
                </motion.h2>
                <motion.p className="lp-subheading" variants={fadeUp} custom={2}>
                    Built by students, for students. Every tool you wish you had.
                </motion.p>
                <div className="lp-features-grid">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            className="lp-feature-card"
                            variants={fadeUp}
                            custom={i * 0.5}
                            whileHover={{ y: -6, borderColor: 'rgba(124,92,255,0.35)' }}
                        >
                            <div className="lp-feature-icon">
                                <f.icon size={22} />
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* ══════ WHY ══════ */}
            <Section className="lp-why">
                <motion.h2 className="lp-why-title" variants={fadeUp}>
                    Stop feeling lost<br />in your studies.
                </motion.h2>
                <motion.p className="lp-why-sub" variants={fadeUp} custom={1}>
                    Stay organized. Stay focused. Stay ahead.
                </motion.p>
                <motion.div className="lp-why-stats" variants={fadeUp} custom={2}>
                    {[
                        { icon: HiOutlineClock, val: '10x', label: 'More productive' },
                        { icon: HiOutlineChartBar, val: '100%', label: 'Free to use' },
                        { icon: HiOutlineShieldCheck, val: 'Secure', label: 'Your data, your control' },
                    ].map((s) => (
                        <div key={s.label} className="lp-why-stat">
                            <s.icon size={20} />
                            <span className="lp-why-stat-val">{s.val}</span>
                            <span className="lp-why-stat-label">{s.label}</span>
                        </div>
                    ))}
                </motion.div>
            </Section>

            {/* ══════ APP PREVIEW ══════ */}
            <Section className="lp-preview" id="preview">
                <motion.span className="lp-label" variants={fadeUp}>Preview</motion.span>
                <motion.h2 className="lp-heading" variants={fadeUp} custom={1}>
                    A glimpse of what's inside
                </motion.h2>
                <div className="lp-preview-grid">
                    {PREVIEWS.map((p, i) => (
                        <motion.div
                            key={p.label}
                            className="lp-preview-card"
                            variants={fadeUp}
                            custom={i * 0.5}
                            whileHover={{ y: -5, scale: 1.02 }}
                            style={{ background: p.gradient }}
                        >
                            <h4 className="lp-preview-label">{p.label}</h4>
                            <ul className="lp-preview-list">
                                {p.items.map((item) => (
                                    <li key={item}><span className="lp-preview-dot" />{item}</li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </Section>

            {/* ══════ CTA HERO ══════ */}
            <Section className={`lp-cta-hero ${ctaHover === 'login' ? 'lp-cta-hero--blue' : ctaHover === 'register' ? 'lp-cta-hero--red' : ''}`}>
                <div className="lp-cta-hero-glow" />
                <motion.div className="lp-cta-hero-wrapper" variants={fadeUp}>
                    <img
                        src={ctaHeroImg}
                        alt="Choose your path"
                        className="lp-cta-hero-img"
                    />
                    <div className="lp-cta-hero-buttons">
                        <motion.button
                            className="lp-cta-pill lp-cta-pill--left"
                            onClick={() => openAuth('login')}
                            onMouseEnter={() => setCtaHover('login')}
                            onMouseLeave={() => setCtaHover(null)}
                            whileHover={{ boxShadow: '0 0 35px rgba(59,130,246,0.6)' }}
                            style={{ transform: 'translate(-50%, -50%)' }}
                        >
                            Login
                        </motion.button>
                        <motion.button
                            className="lp-cta-pill lp-cta-pill--right"
                            onClick={() => openAuth('register')}
                            onMouseEnter={() => setCtaHover('register')}
                            onMouseLeave={() => setCtaHover(null)}
                            whileHover={{ boxShadow: '0 0 35px rgba(239,68,68,0.6)' }}
                            style={{ transform: 'translate(-50%, -50%)' }}
                        >
                            Create Account
                        </motion.button>
                    </div>
                </motion.div>
            </Section>

            {/* ══════ FOOTER ══════ */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <span className="lp-footer-logo">Student Organizer</span>
                        <p className="lp-footer-desc">
                            Your all-in-one study companion. Organize notes, track progress, and stay focused.
                        </p>
                    </div>

                    <div className="lp-footer-col">
                        <h4 className="lp-footer-heading">Product</h4>
                        <button onClick={() => scrollTo('#features')}>Features</button>
                        <button onClick={() => scrollTo('#preview')}>Study Vault</button>
                        <button onClick={() => scrollTo('#preview')}>Journal</button>
                        <button onClick={() => scrollTo('#preview')}>Study Zone</button>
                    </div>

                    <div className="lp-footer-col">
                        <h4 className="lp-footer-heading">Resources</h4>
                        <button onClick={() => openAuth('register')}>Get Started</button>
                        <button onClick={() => openAuth('login')}>Login</button>
                    </div>

                    <div className="lp-footer-col">
                        <h4 className="lp-footer-heading">About</h4>
                        <span className="lp-footer-text">Built for students,</span>
                        <span className="lp-footer-text">by students.</span>
                    </div>
                </div>

                <div className="lp-footer-bottom">
                    <span>&copy; 2026 Student Organizer. All rights reserved.</span>
                </div>
            </footer>

            {/* ══════ AUTH MODAL ══════ */}
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
