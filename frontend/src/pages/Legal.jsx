import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineShieldCheck, HiOutlineDocumentText } from 'react-icons/hi';
import './Credits.css';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const LAST_UPDATED = 'April 2026';

export default function Legal() {
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
                    <span className="credits-label">Legal</span>
                    <h1 className="credits-title">privacy &amp; terms</h1>
                    <p className="credits-sub">
                        The plain-English version. Last updated {LAST_UPDATED}.
                    </p>
                </motion.div>

                {/* Quick jump */}
                <motion.div className="legal-jump" variants={fadeUp} custom={1}>
                    <a href="#privacy" className="legal-jump-btn legal-jump-btn--lavender">
                        <HiOutlineShieldCheck size={16} /> Privacy Policy
                    </a>
                    <a href="#terms" className="legal-jump-btn legal-jump-btn--butter">
                        <HiOutlineDocumentText size={16} /> Terms of Service
                    </a>
                </motion.div>

                {/* PRIVACY */}
                <motion.section id="privacy" className="credits-section" variants={fadeUp} custom={2}>
                    <h2 className="credits-section-title">privacy policy</h2>
                    <p className="legal-p">
                        Student Organizer is a free productivity app for students. This page explains
                        what data we collect and what we do with it. Spoiler: not much.
                    </p>

                    <h3 className="legal-h3">What we store</h3>
                    <ul className="legal-list">
                        <li><b>Account info</b> — your name, email, username, and (optionally) date of birth, school name, address, phone. Provided by you at signup.</li>
                        <li><b>App data</b> — your tasks, notes, journal entries, study sessions, exams, timetable, and uploaded study-vault files.</li>
                        <li><b>Auth tokens</b> — handled by Supabase Auth. Standard JWT-based sessions stored in your browser's local storage.</li>
                    </ul>

                    <h3 className="legal-h3">What we don't do</h3>
                    <ul className="legal-list">
                        <li>We don't sell your data. Ever.</li>
                        <li>We don't run ad networks or third-party trackers.</li>
                        <li>We don't read your notes, journal, or files. They're yours.</li>
                    </ul>

                    <h3 className="legal-h3">Where it lives</h3>
                    <ul className="legal-list">
                        <li>Auth and uploaded files: <b>Supabase</b> (Postgres + Storage)</li>
                        <li>App data: <b>PostgreSQL</b> hosted on Render</li>
                        <li>Frontend: <b>Netlify</b> (static hosting; no PII at rest)</li>
                    </ul>

                    <h3 className="legal-h3">Your controls</h3>
                    <ul className="legal-list">
                        <li>Edit your profile and content from inside the app.</li>
                        <li>Delete any individual entry from its page (tasks, notes, etc.).</li>
                        <li>Want everything wiped? Email <b>lokeshwaran.connect@gmail.com</b> with the subject <i>"delete my account"</i> and we'll remove your records within 7 days.</li>
                    </ul>

                    <h3 className="legal-h3">Cookies</h3>
                    <p className="legal-p">
                        We don't set tracking cookies. Supabase Auth uses a session cookie / local-storage
                        token to keep you logged in — that's it.
                    </p>
                </motion.section>

                {/* TERMS */}
                <motion.section id="terms" className="credits-section" variants={fadeUp} custom={3}>
                    <h2 className="credits-section-title">terms of service</h2>
                    <p className="legal-p">
                        By using Student Organizer, you agree to the following. They're short.
                    </p>

                    <h3 className="legal-h3">The deal</h3>
                    <ul className="legal-list">
                        <li>The app is free for students. No paid tiers, no surprise charges.</li>
                        <li>Use it for legitimate study and personal organization.</li>
                        <li>You're responsible for keeping your account credentials safe.</li>
                    </ul>

                    <h3 className="legal-h3">What you can't do</h3>
                    <ul className="legal-list">
                        <li>Don't upload illegal content, malware, or anything you don't have rights to.</li>
                        <li>Don't try to break, abuse, or scrape the service.</li>
                        <li>Don't impersonate other people.</li>
                    </ul>

                    <h3 className="legal-h3">Your content</h3>
                    <p className="legal-p">
                        You own your tasks, notes, journal entries, and uploaded files.
                        We only store and display them so the app can do its job.
                    </p>

                    <h3 className="legal-h3">No warranty</h3>
                    <p className="legal-p">
                        This is a student-built project. The app is provided "as-is" with no warranties.
                        Back up anything important. We aim for high uptime but make no SLA guarantees.
                    </p>

                    <h3 className="legal-h3">Termination</h3>
                    <p className="legal-p">
                        You can stop using the app any time. We may suspend accounts that violate these
                        terms. If we shut the project down, we'll give reasonable notice and a way to
                        export your data.
                    </p>

                    <h3 className="legal-h3">Changes</h3>
                    <p className="legal-p">
                        We may update these terms occasionally. Material changes will be flagged on this
                        page with a fresh "last updated" date.
                    </p>
                </motion.section>

                <motion.div className="credits-signoff" variants={fadeUp} custom={4}>
                    <span>Questions? Hit the </span>
                    <Link to="/credits#contact" className="legal-link">contact section</Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
