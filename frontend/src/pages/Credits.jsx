import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiOutlineCode, HiOutlineSparkles, HiOutlineDeviceMobile,
    HiOutlineLocationMarker, HiOutlineAcademicCap, HiOutlineHeart,
    HiOutlineArrowLeft, HiOutlineExternalLink, HiOutlineMail,
} from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import lokeshPhoto from '../assets/lokesh.jpeg';
import './Credits.css';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const INTERESTS = [
    { icon: HiOutlineCode, label: 'Full-Stack Web Development', tone: 'lavender' },
    { icon: HiOutlineSparkles, label: 'AI / Machine Learning', tone: 'coral' },
    { icon: HiOutlineDeviceMobile, label: 'Native App Development', tone: 'sky' },
];

const STACK = [
    { name: 'React', tone: 'sky' },
    { name: 'Vite', tone: 'butter' },
    { name: 'Express', tone: 'mint' },
    { name: 'PostgreSQL', tone: 'lavender' },
    { name: 'Supabase', tone: 'mint' },
    { name: 'Framer Motion', tone: 'coral' },
    { name: 'Recharts', tone: 'sky' },
    { name: 'Netlify', tone: 'butter' },
    { name: 'Render', tone: 'lavender' },
];

const ACKNOWLEDGMENTS = [
    { name: 'react-icons', desc: 'Icon library used everywhere' },
    { name: 'framer-motion', desc: 'Page transitions and micro-interactions' },
    { name: 'recharts', desc: 'Progress charts on the dashboard' },
    { name: 'Bangers · Space Grotesk · Inter', desc: 'Typography from Google Fonts' },
    { name: 'Supabase', desc: 'Auth, database, and storage' },
];

export default function Credits() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            // Wait a tick so the section has mounted before scrolling
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
            {/* ambient orbs */}
            <div className="credits-bg">
                <div className="credits-orb credits-orb--1" />
                <div className="credits-orb credits-orb--2" />
                <div className="credits-orb credits-orb--3" />
            </div>

            {/* back to landing */}
            <Link to="/" className="credits-back">
                <HiOutlineArrowLeft size={18} />
                <span>Back home</span>
            </Link>

            <motion.div
                className="credits-container"
                initial="hidden"
                animate="visible"
                variants={stagger}
            >
                {/* page header */}
                <motion.div className="credits-header" variants={fadeUp}>
                    <span className="credits-label">Made by</span>
                    <h1 className="credits-title">credits</h1>
                    <p className="credits-sub">
                        Every pixel, line of code, and pastel color chosen by one student trying to ace it.
                    </p>
                </motion.div>

                {/* profile card */}
                <motion.section className="credits-profile" variants={fadeUp} custom={1}>
                    <div className="credits-photo-wrap">
                        <img src={lokeshPhoto} alt="Lokeshwaran S" className="credits-photo" />
                        <span className="credits-photo-tag">that's me</span>
                    </div>

                    <div className="credits-info">
                        <span className="credits-info-tag">creator</span>
                        <h2 className="credits-name">Lokeshwaran .S</h2>
                        <p className="credits-role">
                            <HiOutlineAcademicCap size={18} />
                            <span>CSE (AI &amp; ML) Undergraduate · Sona College of Technology</span>
                        </p>
                        <p className="credits-location">
                            <HiOutlineLocationMarker size={18} />
                            <span>Salem, Tamil Nadu, India</span>
                        </p>

                        <div className="credits-actions">
                            <a className="credits-btn credits-btn--github" href="https://github.com/coderlokesh-dd" target="_blank" rel="noreferrer">
                                <FaGithub size={18} />
                                <span>GitHub</span>
                                <HiOutlineExternalLink size={14} />
                            </a>
                            <a className="credits-btn credits-btn--linkedin" href="https://www.linkedin.com/in/lokeshwaran-s-1a946b2a7" target="_blank" rel="noreferrer">
                                <FaLinkedin size={18} />
                                <span>LinkedIn</span>
                                <HiOutlineExternalLink size={14} />
                            </a>
                            <a className="credits-btn credits-btn--email" href="mailto:lokeshwaran.connect@gmail.com">
                                <HiOutlineMail size={18} />
                                <span>Email</span>
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* why card */}
                <motion.section className="credits-why" variants={fadeUp} custom={2}>
                    <span className="credits-quote-mark">“</span>
                    <p className="credits-quote">
                        Got tired of juggling six tabs every study session, so I built one.
                    </p>
                    <span className="credits-quote-author">— Lokeshwaran, on why this exists</span>
                </motion.section>

                {/* interests */}
                <motion.section className="credits-section" variants={fadeUp} custom={3}>
                    <h3 className="credits-section-title">interests</h3>
                    <div className="credits-chips">
                        {INTERESTS.map((i) => (
                            <span key={i.label} className={`credits-chip credits-chip--${i.tone}`}>
                                <i.icon size={16} />
                                <span>{i.label}</span>
                            </span>
                        ))}
                    </div>
                </motion.section>

                {/* tech stack */}
                <motion.section className="credits-section" variants={fadeUp} custom={4}>
                    <h3 className="credits-section-title">built with</h3>
                    <div className="credits-stack">
                        {STACK.map((s) => (
                            <span key={s.name} className={`credits-stack-chip credits-stack-chip--${s.tone}`}>
                                {s.name}
                            </span>
                        ))}
                    </div>
                </motion.section>

                {/* acknowledgments */}
                <motion.section className="credits-section" variants={fadeUp} custom={5}>
                    <h3 className="credits-section-title">thanks to</h3>
                    <ul className="credits-thanks">
                        {ACKNOWLEDGMENTS.map((a) => (
                            <li key={a.name}>
                                <span className="credits-thanks-name">{a.name}</span>
                                <span className="credits-thanks-desc">— {a.desc}</span>
                            </li>
                        ))}
                    </ul>
                </motion.section>

                {/* contact */}
                <motion.section id="contact" className="credits-contact" variants={fadeUp} custom={6}>
                    <h3 className="credits-section-title" style={{ textAlign: 'center' }}>get in touch</h3>
                    <p className="credits-contact-sub">
                        Open to feedback, collabs, or a quick hello.
                    </p>
                    <div className="credits-contact-btns">
                        <a className="credits-btn credits-btn--github" href="https://github.com/coderlokesh-dd" target="_blank" rel="noreferrer">
                            <FaGithub size={18} />
                            <span>github.com/coderlokesh-dd</span>
                        </a>
                        <a className="credits-btn credits-btn--linkedin" href="https://www.linkedin.com/in/lokeshwaran-s-1a946b2a7" target="_blank" rel="noreferrer">
                            <FaLinkedin size={18} />
                            <span>linkedin.com/in/lokeshwaran-s</span>
                        </a>
                        <a className="credits-btn credits-btn--email" href="mailto:lokeshwaran.connect@gmail.com">
                            <HiOutlineMail size={18} />
                            <span>lokeshwaran.connect@gmail.com</span>
                        </a>
                    </div>
                </motion.section>

                {/* sign-off */}
                <motion.div className="credits-signoff" variants={fadeUp} custom={7}>
                    <span>Made with</span>
                    <HiOutlineHeart size={16} />
                    <span>in Salem, India · {new Date().getFullYear()}</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
