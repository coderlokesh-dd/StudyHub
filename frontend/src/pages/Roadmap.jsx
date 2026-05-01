import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiOutlineArrowLeft, HiOutlineLightBulb, HiOutlineClipboardList,
    HiOutlineCheck, HiOutlineSparkles,
} from 'react-icons/hi';
import './Credits.css';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const UPCOMING = [
    {
        title: 'Flashcards with spaced repetition',
        desc: 'Decks for any subject. Cards you get right come back less often; ones you miss come back sooner.',
        status: 'in progress',
        tone: 'butter',
    },
    {
        title: 'Per-user data scoping',
        desc: 'Tasks, notes, and journal entries scoped to each user account on the backend.',
        status: 'in progress',
        tone: 'lavender',
    },
    {
        title: 'Persistent Study Vault storage',
        desc: 'Permanent cloud storage for uploaded files.',
        status: 'planned',
        tone: 'mint',
    },
    {
        title: 'Rich text in Notes & Journal',
        desc: 'Bold, italic, checklists, and image embeds.',
        status: 'planned',
        tone: 'butter',
    },
    {
        title: 'Light theme + accent picker',
        desc: 'Light theme and accent color picker.',
        status: 'planned',
        tone: 'coral',
    },
    {
        title: 'Mobile fixes',
        desc: 'Mobile layout fixes (off-screen modals, viewport edge cases).',
        status: 'planned',
        tone: 'sky',
    },
    {
        title: 'Data export',
        desc: 'Export tasks, journal entries, and study sessions as a file.',
        status: 'idea',
        tone: 'lavender',
    },
];

const CHANGELOG = [
    {
        version: 'v1.2',
        date: 'April 25, 2026',
        title: 'New landing page, mobile nav, and Credits',
        items: [
            'Brand-new multi-section landing page',
            'Mobile nav now covers every feature — tap More for the full list',
            'Added Credits, Privacy, Terms, and Roadmap pages',
        ],
    },
    {
        version: 'v1.1',
        date: 'April 24, 2026',
        title: 'Stability fixes',
        items: [
            'Journal and Tasks pages no longer go blank on saved data',
            'Tasks checkboxes are now clearly visible with a proper strikethrough',
        ],
    },
    {
        version: 'v1.0',
        date: 'March 2026',
        title: 'Initial launch',
        items: [
            'First public launch — all core tools live (Tasks, Notes, Journal, Study Zone, Timetable, Exams, Progress, Vault)',
            'Email + password sign-up with personal profiles',
            'Pastel comic theme with bold type',
        ],
    },
];

const STATUS_TONE = {
    'in progress': 'lavender',
    'planned': 'sky',
    'idea': 'coral',
};

export default function Roadmap() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            setTimeout(() => {
                const el = document.getElementById(location.hash.replace('#', ''));
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [location.hash]);

    return (
        <div className="credits">
            <div className="credits-bg">
                <div className="credits-orb credits-orb--1" />
                <div className="credits-orb credits-orb--2" />
                <div className="credits-orb credits-orb--3" />
            </div>

            <Link to="/" className="credits-back">
                <HiOutlineArrowLeft size={18} />
                <span>Back home</span>
            </Link>

            <motion.div className="credits-container" initial="hidden" animate="visible" variants={stagger}>
                <motion.div className="credits-header" variants={fadeUp}>
                    <span className="credits-label">What's next</span>
                    <h1 className="credits-title">roadmap</h1>
                    <p className="credits-sub">
                        What's coming and what shipped.
                    </p>
                </motion.div>

                <motion.div className="legal-jump" variants={fadeUp} custom={1}>
                    <a href="#upcoming" className="legal-jump-btn legal-jump-btn--lavender">
                        <HiOutlineLightBulb size={16} /> Upcoming
                    </a>
                    <a href="#changelog" className="legal-jump-btn legal-jump-btn--butter">
                        <HiOutlineClipboardList size={16} /> Changelog
                    </a>
                </motion.div>

                {/* UPCOMING */}
                <motion.section id="upcoming" className="credits-section" variants={fadeUp} custom={2}>
                    <h2 className="credits-section-title">upcoming</h2>
                    <p className="legal-p">
                        Rough priority order. No promised dates.
                    </p>

                    <div className="roadmap-list">
                        {UPCOMING.map((u) => (
                            <div key={u.title} className={`roadmap-item roadmap-item--${u.tone}`}>
                                <div className="roadmap-item-head">
                                    <h3 className="roadmap-item-title">{u.title}</h3>
                                    <span className={`roadmap-status roadmap-status--${STATUS_TONE[u.status]}`}>
                                        {u.status}
                                    </span>
                                </div>
                                <p className="roadmap-item-desc">{u.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* CHANGELOG */}
                <motion.section id="changelog" className="credits-section" variants={fadeUp} custom={3}>
                    <h2 className="credits-section-title">changelog</h2>

                    <div className="changelog-list">
                        {CHANGELOG.map((c, i) => (
                            <div key={c.version} className="changelog-entry">
                                <div className="changelog-entry-head">
                                    <span className={`changelog-version ${i === 0 ? 'changelog-version--latest' : ''}`}>
                                        {i === 0 && <HiOutlineSparkles size={14} />}
                                        {c.version}
                                    </span>
                                    <span className="changelog-date">{c.date}</span>
                                </div>
                                <h3 className="changelog-title">{c.title}</h3>
                                <ul className="changelog-items">
                                    {c.items.map((it) => (
                                        <li key={it}>
                                            <span className="changelog-bullet"><HiOutlineCheck size={12} /></span>
                                            <span>{it}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </motion.section>

                <motion.div className="credits-signoff" variants={fadeUp} custom={4}>
                    <span>Have a feature idea? </span>
                    <Link to="/credits#contact" className="legal-link">Email me</Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
