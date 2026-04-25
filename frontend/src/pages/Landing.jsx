import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone,
    HiOutlineCalendar, HiOutlineAcademicCap, HiOutlineLocationMarker,
    HiOutlineEye, HiOutlineEyeOff, HiOutlineX, HiOutlineShieldCheck,
    HiOutlineClipboardCheck, HiOutlineDocumentText, HiOutlineBookOpen,
    HiOutlineLightningBolt, HiOutlineFolder,
    HiOutlineChartBar, HiOutlineClock, HiOutlineSparkles, HiOutlineCheck,
    HiOutlineArrowRight, HiOutlineChevronDown, HiOutlineLightBulb,
    HiOutlineMenu, HiOutlineHeart, HiOutlineGlobe,
} from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import './Landing.css';

/* ───── animation helpers ───── */
const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const tabVariants = {
    enter: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 60 : -60, opacity: 0 }),
};

/* ───── data ───── */
const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how' },
    { label: 'Highlights', href: '#highlights' },
    { label: 'FAQ', href: '#faq' },
];

const FEATURES = [
    {
        icon: HiOutlineClipboardCheck,
        title: 'Smart Tasks',
        desc: 'Plan assignments with priorities, due dates, and nested subtasks. Track progress with a live completion bar.',
        tone: 'lavender',
    },
    {
        icon: HiOutlineDocumentText,
        title: 'Quick Notes',
        desc: 'Capture ideas instantly with categories, favorites, and full-text search across your entire library.',
        tone: 'coral',
    },
    {
        icon: HiOutlineBookOpen,
        title: 'Daily Journal',
        desc: 'Reflect on your day with mood tracking. One entry per date, calendar view, and rich formatting.',
        tone: 'butter',
    },
    {
        icon: HiOutlineLightningBolt,
        title: 'Study Zone',
        desc: 'Three timer modes — Deep Focus, Pomodoro, and Casual. Sessions persist across pages so you stay locked in.',
        tone: 'mint',
    },
    {
        icon: HiOutlineCalendar,
        title: 'Timetable',
        desc: 'Build your weekly schedule with color-coded blocks. See your full week at a glance with location and time details.',
        tone: 'sky',
    },
    {
        icon: HiOutlineFolder,
        title: 'Study Vault',
        desc: 'Upload PDFs and images organized by semester and subject. Preview anywhere, never lose a file again.',
        tone: 'butter',
    },
];

const STEPS = [
    { num: '01', title: 'Create your account', desc: 'Sign up free in seconds. No credit card, no trials, no catches.' },
    { num: '02', title: 'Set up your study life', desc: 'Add tasks, drop in your timetable and exam dates, then upload your study materials to the vault.' },
    { num: '03', title: 'Stay focused & track wins', desc: 'Run focus sessions, hit your streaks, and watch your progress grow on the dashboard.' },
];

const HIGHLIGHTS = [
    {
        label: 'Study Vault',
        title: 'every file, exactly where you need it',
        desc: 'Organize materials by semester and subject. Drag-and-drop uploads, instant PDF preview, and a clean folder hierarchy mean you stop wasting time hunting for last week\'s lecture notes.',
        bullets: ['Semester → subject hierarchy', 'PDF & image preview', 'Drag-and-drop uploads', 'Cloud-synced via Supabase'],
        tone: 'lavender',
        icon: HiOutlineFolder,
    },
    {
        label: 'Study Zone',
        title: 'deep focus, on demand',
        desc: 'Three timer modes designed for how you actually study. Switch between fullscreen Deep Focus, classic Pomodoro cycles, or a Casual stopwatch — your active session keeps running while you browse.',
        bullets: ['Deep Focus (fullscreen)', 'Pomodoro (configurable)', 'Casual stopwatch', 'Floating timer pill'],
        tone: 'mint',
        icon: HiOutlineLightningBolt,
    },
    {
        label: 'Progress & Streaks',
        title: 'see yourself getting better',
        desc: 'Beautiful charts of your weekly hours and subject breakdown. Streak tracking and achievement badges turn consistency into something you can actually feel.',
        bullets: ['Weekly hour breakdown', 'Subject-level analytics', 'Streak tracking', 'Achievement badges'],
        tone: 'butter',
        icon: HiOutlineChartBar,
    },
];

const FAQS = [
    {
        q: 'Is it really free?',
        a: 'Yes. Student Organizer is free forever for students — no credit card, no trial period, no hidden tiers. We built this for ourselves first.',
    },
    {
        q: 'Will my data stay private?',
        a: 'Your account is secured with Supabase Auth, files live in your private vault, and we never share or sell anything. You can export or delete your data at any time.',
    },
    {
        q: 'Does it work on my phone?',
        a: 'Yep. The full app works in any modern mobile browser, with a bottom nav bar, mobile-friendly modals, and a floating timer that follows you between pages.',
    },
    {
        q: 'What happens to my study sessions if I close the tab?',
        a: 'Save your session before closing. Active timers are tracked in memory while the app is open, but completed sessions are persisted to your account so streaks and totals stick.',
    },
    {
        q: 'Can I use it for any subject?',
        a: 'Absolutely. Tasks, notes, timetable, and the vault are all subject-tagged so it scales whether you\'re in high school, college, or grad school.',
    },
];

const FOOTER_LINKS = {
    Product: ['Features', 'How it works', 'Highlights', 'FAQ'],
    Resources: ['Get started', 'Login', 'Roadmap', 'Changelog'],
    Company: ['Credits', 'Privacy', 'Terms', 'Contact'],
};

const SCHOOL_TYPES = ['High School', 'Senior Secondary', 'Undergraduate', 'Postgraduate', 'Diploma / Polytechnic', 'Other'];

/* ───── reveal-on-scroll wrapper ───── */
function Reveal({ children, className = '', id, delay = 0 }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.section
            ref={ref}
            id={id}
            className={className}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={stagger}
            transition={{ delay }}
        >
            {children}
        </motion.section>
    );
}

/* ───── component ───── */
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
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);
    const { user, loading: authLoading, signIn, signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    if (authLoading || user) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner" />
            </div>
        );
    }

    const scrollTo = (href) => {
        setMobileMenuOpen(false);
        const el = document.getElementById(href.replace('#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const openAuth = (mode) => {
        setMobileMenuOpen(false);
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
            navigate('/dashboard', { replace: true });
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
            {/* ambient background */}
            <div className="lp-bg">
                <div className="lp-orb lp-orb--1" />
                <div className="lp-orb lp-orb--2" />
                <div className="lp-orb lp-orb--3" />
            </div>

            {/* ══════ NAV ══════ */}
            <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
                <button className="lp-nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    Student Organizer
                </button>

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

                <button className="lp-nav-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
                    {mobileMenuOpen ? <HiOutlineX size={24} /> : <HiOutlineMenu size={24} />}
                </button>

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
                            <button className="lp-nav-mobile-link" onClick={() => openAuth('login')}>Login</button>
                            <button className="lp-nav-mobile-link lp-nav-mobile-cta" onClick={() => openAuth('register')}>Get Started</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ══════ HERO ══════ */}
            <Reveal id="hero" className="lp-section lp-hero">
                <motion.div className="lp-hero-badge" variants={fadeUp} custom={0}>
                    <HiOutlineShieldCheck size={14} />
                    <span>Free forever for students</span>
                </motion.div>

                <motion.h1 className="lp-hero-title" variants={fadeUp} custom={1}>
                    your study life,<br />finally <span className="lp-hero-accent">organized</span>.
                </motion.h1>

                <motion.p className="lp-hero-sub" variants={fadeUp} custom={2}>
                    Tasks, notes, journal, focus timers, timetable, and a study vault — every tool you wish you had,
                    built into one beautifully simple workspace.
                </motion.p>

                <motion.div className="lp-hero-btns" variants={fadeUp} custom={3}>
                    <motion.button
                        className="lp-btn lp-btn--primary"
                        onClick={() => openAuth('register')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Get Started — it's free
                        <HiOutlineArrowRight size={18} style={{ marginLeft: 6 }} />
                    </motion.button>
                    <motion.button
                        className="lp-btn lp-btn--ghost"
                        onClick={() => scrollTo('#features')}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        See features
                    </motion.button>
                </motion.div>

                <motion.div className="lp-hero-trust" variants={fadeUp} custom={4}>
                    {[
                        { icon: HiOutlineSparkles, val: '9+', label: 'productivity tools' },
                        { icon: HiOutlineHeart, val: '100%', label: 'free, forever' },
                        { icon: HiOutlineGlobe, val: 'Web', label: 'anywhere, any device' },
                    ].map((s, i) => (
                        <div key={s.label} className={`lp-trust-card lp-trust-card--${i}`}>
                            <s.icon size={22} />
                            <div>
                                <div className="lp-trust-val">{s.val}</div>
                                <div className="lp-trust-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </Reveal>

            {/* ══════ FEATURES ══════ */}
            <Reveal id="features" className="lp-section lp-features">
                <motion.span className="lp-label" variants={fadeUp}>Features</motion.span>
                <motion.h2 className="lp-heading" variants={fadeUp} custom={1}>
                    everything you need to <span className="lp-heading-accent">ace it</span>.
                </motion.h2>
                <motion.p className="lp-subheading" variants={fadeUp} custom={2}>
                    Built by students, for students. Every tool you actually use, none of the ones you don't.
                </motion.p>

                <div className="lp-features-grid">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            className={`lp-feature-card lp-feature-card--${f.tone}`}
                            variants={fadeUp}
                            custom={i * 0.5}
                            whileHover={{ y: -4 }}
                        >
                            <div className={`lp-feature-icon lp-feature-icon--${f.tone}`}>
                                <f.icon size={24} />
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Reveal>

            {/* ══════ HOW IT WORKS ══════ */}
            <Reveal id="how" className="lp-section lp-how">
                <motion.span className="lp-label" variants={fadeUp}>How it works</motion.span>
                <motion.h2 className="lp-heading" variants={fadeUp} custom={1}>
                    three steps. that's it.
                </motion.h2>
                <motion.p className="lp-subheading" variants={fadeUp} custom={2}>
                    No onboarding tour, no setup wizard. Just sign up and start.
                </motion.p>

                <div className="lp-steps">
                    {STEPS.map((s, i) => (
                        <motion.div key={s.num} className="lp-step" variants={fadeUp} custom={i * 0.5}>
                            <div className="lp-step-num">{s.num}</div>
                            <h3 className="lp-step-title">{s.title}</h3>
                            <p className="lp-step-desc">{s.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Reveal>

            {/* ══════ HIGHLIGHTS (alternating rows) ══════ */}
            <Reveal id="highlights" className="lp-section lp-highlights">
                <motion.span className="lp-label" variants={fadeUp}>Highlights</motion.span>
                <motion.h2 className="lp-heading" variants={fadeUp} custom={1}>
                    a closer look.
                </motion.h2>

                <div className="lp-highlights-list">
                    {HIGHLIGHTS.map((h, i) => (
                        <motion.div
                            key={h.label}
                            className={`lp-highlight ${i % 2 === 1 ? 'lp-highlight--reverse' : ''}`}
                            variants={fadeUp}
                            custom={i * 0.5}
                        >
                            <div className="lp-highlight-text">
                                <span className={`lp-highlight-tag lp-highlight-tag--${h.tone}`}>{h.label}</span>
                                <h3 className="lp-highlight-title">{h.title}</h3>
                                <p className="lp-highlight-desc">{h.desc}</p>
                                <ul className="lp-highlight-list">
                                    {h.bullets.map((b) => (
                                        <li key={b}>
                                            <span className={`lp-highlight-check lp-highlight-check--${h.tone}`}>
                                                <HiOutlineCheck size={14} />
                                            </span>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={`lp-highlight-visual lp-highlight-visual--${h.tone}`}>
                                <div className="lp-highlight-icon">
                                    <h.icon size={64} />
                                </div>
                                <div className="lp-highlight-deco lp-highlight-deco--1" />
                                <div className="lp-highlight-deco lp-highlight-deco--2" />
                                <div className="lp-highlight-deco lp-highlight-deco--3" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Reveal>

            {/* ══════ FAQ ══════ */}
            <Reveal id="faq" className="lp-section lp-faq">
                <motion.span className="lp-label" variants={fadeUp}>FAQ</motion.span>
                <motion.h2 className="lp-heading" variants={fadeUp} custom={1}>
                    questions, answered.
                </motion.h2>

                <div className="lp-faq-list">
                    {FAQS.map((item, i) => {
                        const isOpen = openFaq === i;
                        return (
                            <motion.div
                                key={item.q}
                                className={`lp-faq-item ${isOpen ? 'lp-faq-item--open' : ''}`}
                                variants={fadeUp}
                                custom={i * 0.3}
                            >
                                <button className="lp-faq-q" onClick={() => setOpenFaq(isOpen ? -1 : i)}>
                                    <span className="lp-faq-q-icon"><HiOutlineLightBulb size={18} /></span>
                                    <span className="lp-faq-q-text">{item.q}</span>
                                    <motion.span
                                        className="lp-faq-q-chevron"
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <HiOutlineChevronDown size={20} />
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            className="lp-faq-a"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <p>{item.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </Reveal>

            {/* ══════ FINAL CTA ══════ */}
            <Reveal className="lp-section lp-cta">
                <motion.div className="lp-cta-card" variants={fadeUp}>
                    <div className="lp-cta-shapes">
                        <span className="lp-cta-shape lp-cta-shape--1" />
                        <span className="lp-cta-shape lp-cta-shape--2" />
                        <span className="lp-cta-shape lp-cta-shape--3" />
                    </div>
                    <h2 className="lp-cta-title">ready to get organized?</h2>
                    <p className="lp-cta-sub">
                        Sign up in seconds. Start studying smarter today.
                    </p>
                    <div className="lp-cta-btns">
                        <motion.button
                            className="lp-btn lp-btn--primary"
                            onClick={() => openAuth('register')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Create your account
                            <HiOutlineArrowRight size={18} style={{ marginLeft: 6 }} />
                        </motion.button>
                        <motion.button
                            className="lp-btn lp-btn--ghost"
                            onClick={() => openAuth('login')}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            I already have one
                        </motion.button>
                    </div>
                </motion.div>
            </Reveal>

            {/* ══════ FOOTER ══════ */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <span className="lp-footer-logo">Student Organizer</span>
                        <p className="lp-footer-desc">
                            Your all-in-one study companion. Organize notes, track progress, and stay focused — free forever.
                        </p>
                        <span className="lp-footer-badge">
                            <HiOutlineHeart size={14} /> Built for students, by students
                        </span>
                    </div>

                    {Object.entries(FOOTER_LINKS).map(([col, items]) => (
                        <div key={col} className="lp-footer-col">
                            <h4 className="lp-footer-heading">{col}</h4>
                            {items.map((label) => {
                                const navMatch = NAV_LINKS.find((l) => l.label === label);
                                if (navMatch) {
                                    return <button key={label} onClick={() => scrollTo(navMatch.href)}>{label}</button>;
                                }
                                if (label === 'Login') return <button key={label} onClick={() => openAuth('login')}>{label}</button>;
                                if (label === 'Get started') return <button key={label} onClick={() => openAuth('register')}>{label}</button>;
                                const FOOTER_ROUTES = {
                                    'Credits': '/credits',
                                    'Privacy': '/legal#privacy',
                                    'Terms': '/legal#terms',
                                    'Contact': '/credits#contact',
                                    'Roadmap': '/roadmap#upcoming',
                                    'Changelog': '/roadmap#changelog',
                                };
                                if (FOOTER_ROUTES[label]) {
                                    return <Link key={label} to={FOOTER_ROUTES[label]} className="lp-footer-link">{label}</Link>;
                                }
                                return <button key={label} type="button">{label}</button>;
                            })}
                        </div>
                    ))}
                </div>

                <div className="lp-footer-bottom">
                    <span>© {new Date().getFullYear()} Student Organizer. All rights reserved.</span>
                    <span className="lp-footer-bottom-mid">
                        Designed &amp; built by{' '}
                        <Link to="/credits" className="lp-footer-author">Lokeshwaran S</Link>
                    </span>
                    <span className="lp-footer-bottom-links">
                        <Link to="/legal#privacy">Privacy</Link>
                        <span>·</span>
                        <Link to="/legal#terms">Terms</Link>
                    </span>
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
