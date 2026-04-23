import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { getGreeting } from '../utils/helpers';
import Modal from '../components/Modal';
import { ComicCardDark, ComicCardPaper, CardLabel, Chip, PageHeader, PALETTE, Mascot } from '../components/ComicComponents';
import './Dashboard.css';

const containerVariants = {
    animate: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function getCountdown(dateStr) {
    const now = new Date();
    const exam = new Date(dateStr + 'T23:59:59');
    const diff = exam - now;
    if (diff <= 0) return { days: '0', text: 'Today!', urgent: true };
    const days = Math.floor(diff / 86400000);
    if (days === 0) return { days: '1', text: 'Tomorrow', urgent: true };
    return { days: String(days), text: `${days} days`, urgent: days <= 7 };
}

const EXAM_COLORS = [PALETTE.lavender, PALETTE.sky, PALETTE.coral, PALETTE.butter, PALETTE.mint];

export default function Dashboard() {
    const { notes, tasks, streak, totalStudyMinutes, badges, exams, addExam, deleteExam } = useApp();
    const { tone } = useTheme();
    const isPro = tone === 'pro';
    const navigate = useNavigate();
    const greeting = getGreeting();
    
    const todayTasks = tasks.filter(t => !t.completed);
    const completedCount = tasks.filter(t => t.completed).length;
    const unlockedBadges = badges.filter(b => b.unlocked).length;
    
    // Sort recent notes
    const recentNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);

    const [examModalOpen, setExamModalOpen] = useState(false);
    const [examForm, setExamForm] = useState({ title: '', subject: '', examDate: '', color: PALETTE.lavender });

    const handleAddExam = () => {
        if (!examForm.title.trim() || !examForm.examDate) return;
        addExam(examForm);
        setExamForm({ title: '', subject: '', examDate: '', color: PALETTE.lavender });
        setExamModalOpen(false);
    };

    const today = new Date().toISOString().split('T')[0];
    const upcomingExams = [...(exams || [])]
        .filter(e => e.examDate >= today)
        .sort((a, b) => a.examDate.localeCompare(b.examDate))
        .slice(0, 4);

    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();

    const stats = [
        { label: 'NOTES', value: String(notes.length), color: PALETTE.lavender, sub: `+${notes.filter(n => n.createdAt > new Date(Date.now() - 7*86400000).toISOString()).length} this week` },
        { label: isPro ? 'TASKS DUE' : 'TASKS RN', value: String(todayTasks.length), color: PALETTE.coral, sub: `${todayTasks.filter(t => t.dueDate === today).length} due today` },
        { label: isPro ? 'FOCUS TIME' : 'FOCUSED', value: `${Math.floor(totalStudyMinutes / 60)}h ${totalStudyMinutes % 60}m`, color: PALETTE.mint, sub: 'total time' },
        { label: 'BADGES', value: String(unlockedBadges), color: PALETTE.butter, sub: `${badges.length - unlockedBadges} locked` },
    ];

    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            <PageHeader 
                tag={`DASHBOARD · ${dateStr}`} 
                tagColor={PALETTE.mint}
                title={greeting.text} 
                subtitle={isPro ? 'Keep the momentum going.' : greeting.sub} 
            />

            {/* Hero row */}
            <motion.div className="comic-hero-grid" variants={itemVariants}>
                <ComicCardPaper color={PALETTE.lavender} style={{ padding: 24, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.1) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none' }} />
                    <div className="comic-mascot-hero" style={{ position: 'relative' }}>
                        <Mascot state="idle" size={120} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 15, letterSpacing: '0.15em', color: '#0B0B0F' }}>
                                GOOD {new Date().getHours() < 12 ? 'MORNING' : new Date().getHours() < 18 ? 'AFTERNOON' : 'EVENING'} {isPro ? '' : 'BESTIE'}
                            </div>
                            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 44, letterSpacing: '0.02em', lineHeight: 1, margin: '6px 0 8px', color: '#0B0B0F' }}>
                                {isPro ? 'ready to focus?' : 'ready to cook?'}
                            </div>
                            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'rgba(11,11,15,0.7)', marginBottom: 14, fontWeight: 500 }}>
                                {todayTasks.length > 0 ? `${isPro ? 'Next up' : 'next up'}: ${todayTasks[0].title}` : (isPro ? 'No immediate tasks, all clear.' : 'no immediate tasks, vibing rn')}
                            </div>
                            <button 
                                onClick={() => navigate('/study-zone')}
                                style={{
                                    fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: '0.06em',
                                    padding: '10px 24px', background: PALETTE.butter,
                                    border: '3px solid #0B0B0F', borderRadius: 14, boxShadow: '4px 4px 0 #0B0B0F',
                                    color: '#0B0B0F', cursor: 'pointer', transition: 'all 0.1s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #0B0B0F'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '4px 4px 0 #0B0B0F'; }}
                            >
                                {isPro ? 'continue studying →' : 'keep cooking →'}
                            </button>
                        </div>
                    </div>
                    <div style={{ position: 'absolute', top: 16, right: 20, background: PALETTE.coral, border: '3px solid #0B0B0F', boxShadow: '3px 3px 0 #0B0B0F', padding: '6px 12px', borderRadius: 10, transform: 'rotate(8deg)' }}>
                        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, color: '#0B0B0F' }}>LET'S GO!</div>
                    </div>
                </ComicCardPaper>

                <ComicCardDark style={{ padding: '20px 24px' }}>
                    <CardLabel color={PALETTE.butter}>STREAK · {streak.current} DAYS</CardLabel>
                    <div style={{ fontFamily: 'Bangers, cursive', fontSize: 56, color: PALETTE.butter, lineHeight: 1, margin: '10px 0' }}>
                        {streak.current} 🔥
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                        {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} style={{
                                flex: 1, height: 32, borderRadius: 6,
                                background: i < streak.current ? PALETTE.butter : 'rgba(255,255,255,0.1)',
                                border: '2px solid #0B0B0F',
                                boxShadow: i < streak.current ? '2px 2px 0 #0B0B0F' : 'none',
                            }} />
                        ))}
                    </div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'rgba(245,245,250,0.5)', marginTop: 12 }}>
                        {isPro ? 'Keep logging in daily to maintain your streak.' : 'keep logging in daily. stay on fire.'}
                    </div>
                </ComicCardDark>
            </motion.div>

            {/* Stats row */}
            <motion.div className="comic-stats-grid" variants={itemVariants}>
                {stats.map((s, i) => (
                    <ComicCardDark key={i} style={{ padding: 18 }} onClick={() => navigate(i === 0 ? '/notes' : i === 1 ? '/tasks' : '/progress')} whileHover={{ y: -4, cursor: 'pointer' }}>
                        <CardLabel color={s.color}>{s.label}</CardLabel>
                        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 44, color: s.color, lineHeight: 1, marginTop: 8 }}>
                            {s.value}
                        </div>
                        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'rgba(245,245,250,0.5)', marginTop: 8 }}>{s.sub}</div>
                    </ComicCardDark>
                ))}
            </motion.div>

            {/* Exams + Recent */}
            <motion.div className="comic-exams-grid" variants={itemVariants}>
                <ComicCardDark>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <CardLabel color={PALETTE.coral}>{isPro ? 'UPCOMING EXAMS' : 'EXAM SZN'}</CardLabel>
                        <button 
                            onClick={() => setExamModalOpen(true)}
                            style={{
                                fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.08em',
                                padding: '4px 12px', background: '#FFF8EA',
                                border: '2px solid #0B0B0F', borderRadius: 8, boxShadow: '2px 2px 0 #0B0B0F',
                                color: '#0B0B0F', cursor: 'pointer', transition: 'all 0.1s'
                            }}
                        >+ add</button>
                    </div>
                    {upcomingExams.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {upcomingExams.map((e, i) => {
                                const countdown = getCountdown(e.examDate);
                                return (
                                    <div key={e.id} style={{
                                        display: 'flex', gap: 14, alignItems: 'center',
                                        padding: 12, background: 'rgba(255,255,255,0.03)',
                                        border: '2px solid #0B0B0F', borderRadius: 12,
                                    }}>
                                        <div style={{
                                            width: 60, height: 60, background: e.color || PALETTE.coral,
                                            border: '2.5px solid #0B0B0F', borderRadius: 10, boxShadow: '2px 2px 0 #0B0B0F',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 26, color: '#0B0B0F', lineHeight: 1 }}>{countdown.days}</div>
                                            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 10, color: '#0B0B0F', letterSpacing: '0.1em' }}>DAYS</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 16, color: '#F5F5FA', marginBottom: 2 }}>
                                                {e.title.toUpperCase()}
                                            </div>
                                            <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: 'rgba(245,245,250,0.5)' }}>
                                                {e.subject ? `${e.subject} · ` : ''}{new Date(e.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => deleteExam(e.id)}
                                            style={{ background: 'transparent', border: 'none', color: 'rgba(245,245,250,0.3)', cursor: 'pointer', fontSize: 18, padding: 8 }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(245,245,250,0.5)', fontFamily: 'Bangers, cursive', fontSize: 20 }}>
                            {isPro ? 'Nothing scheduled. Clean.' : 'no exams rn we free 🕊️'}
                        </div>
                    )}
                </ComicCardDark>

                <ComicCardDark>
                    <CardLabel>{isPro ? 'RECENT NOTES' : 'RECENT THOUGHTS'}</CardLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                        {recentNotes.length > 0 ? recentNotes.map((n) => (
                            <div key={n.id} onClick={() => navigate('/notes')} style={{ 
                                padding: 12, border: '2px solid #0B0B0F', borderRadius: 12, 
                                background: 'rgba(255,255,255,0.03)', cursor: 'pointer' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <Chip color={PALETTE.sky}>{n.category?.toUpperCase() || 'NOTE'}</Chip>
                                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: 'rgba(245,245,250,0.4)' }}>
                                        {new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                                    </div>
                                </div>
                                <div style={{ fontFamily: 'Space Grotesk', fontSize: 15, fontWeight: 600, color: '#F5F5FA' }}>{n.title}</div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(245,245,250,0.5)', fontFamily: 'Bangers, cursive', fontSize: 18 }}>
                                {isPro ? 'No recent notes found.' : 'empty brain...'}
                            </div>
                        )}
                    </div>
                </ComicCardDark>
            </motion.div>

            {/* Quick actions */}
            <motion.div variants={itemVariants}>
                <ComicCardPaper color={PALETTE.butter} className="comic-quick-actions">
                    <div style={{ fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: '0.04em', color: '#0B0B0F', alignSelf: 'center', paddingRight: 10, borderRight: '2px dashed #0B0B0F', marginRight: 8 }}>
                        QUICK!
                    </div>
                    {[
                        { label: isPro ? 'New note' : 'new note', action: () => navigate('/notes') },
                        { label: isPro ? 'Add task' : 'add task', action: () => navigate('/tasks') },
                        { label: isPro ? 'Start timer' : 'start timer', action: () => navigate('/study-zone') },
                        { label: isPro ? 'Log mood' : 'log vibes', action: () => navigate('/journal') },
                    ].map((a, i) => (
                        <button key={i} onClick={a.action} style={{
                            flex: 1, fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 15,
                            padding: '12px 10px', background: '#FFF8EA',
                            border: '3px solid #0B0B0F', borderRadius: 14, boxShadow: '3px 3px 0 #0B0B0F',
                            color: '#0B0B0F', cursor: 'pointer', transition: 'all 0.1s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translate(-2px, -2px)'; e.currentTarget.style.boxShadow = '5px 5px 0 #0B0B0F'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '3px 3px 0 #0B0B0F'; }}
                        >
                            {a.label}
                        </button>
                    ))}
                </ComicCardPaper>
            </motion.div>

            {/* Exam Modal */}
            <Modal isOpen={examModalOpen} onClose={() => setExamModalOpen(false)} title="ADD EXAM SZN">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontFamily: 'Bangers, cursive', fontSize: 18, color: '#0B0B0F', display: 'block', marginBottom: 4 }}>Mission Title</label>
                        <input value={examForm.title} onChange={e => setExamForm({...examForm, title: e.target.value})} placeholder="e.g. Calc Final" style={{ width: '100%', border: '3px solid #0B0B0F', borderRadius: 10, padding: 10, background: '#FFF8EA', color: '#0B0B0F', fontFamily: 'Space Grotesk' }} />
                    </div>
                    <div>
                        <label style={{ fontFamily: 'Bangers, cursive', fontSize: 18, color: '#0B0B0F', display: 'block', marginBottom: 4 }}>Subject</label>
                        <input value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} placeholder="e.g. MATH 101" style={{ width: '100%', border: '3px solid #0B0B0F', borderRadius: 10, padding: 10, background: '#FFF8EA', color: '#0B0B0F', fontFamily: 'Space Grotesk' }} />
                    </div>
                    <div>
                        <label style={{ fontFamily: 'Bangers, cursive', fontSize: 18, color: '#0B0B0F', display: 'block', marginBottom: 4 }}>Doomsday</label>
                        <input type="date" value={examForm.examDate} onChange={e => setExamForm({...examForm, examDate: e.target.value})} style={{ width: '100%', border: '3px solid #0B0B0F', borderRadius: 10, padding: 10, background: '#FFF8EA', color: '#0B0B0F', fontFamily: 'Space Grotesk' }} />
                    </div>
                    <div>
                        <label style={{ fontFamily: 'Bangers, cursive', fontSize: 18, color: '#0B0B0F', display: 'block', marginBottom: 4 }}>Vibe Color</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {EXAM_COLORS.map(c => (
                                <button
                                    key={c}
                                    style={{
                                        width: 36, height: 36, borderRadius: 10, background: c,
                                        border: '3px solid #0B0B0F',
                                        boxShadow: examForm.color === c ? 'inset 0 0 0 3px rgba(0,0,0,0.3), 3px 3px 0 #0B0B0F' : 'none',
                                        transform: examForm.color === c ? 'scale(1.1)' : 'none',
                                    }}
                                    onClick={() => setExamForm({...examForm, color: c})}
                                />
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button onClick={() => setExamModalOpen(false)} style={{ flex: 1, padding: 12, fontFamily: 'Bangers, cursive', fontSize: 18, border: '3px solid #0B0B0F', borderRadius: 12, background: 'transparent', color: '#0B0B0F' }}>Nah</button>
                        <button onClick={handleAddExam} style={{ flex: 2, padding: 12, fontFamily: 'Bangers, cursive', fontSize: 18, border: '3px solid #0B0B0F', borderRadius: 12, background: PALETTE.lavender, boxShadow: '3px 3px 0 #0B0B0F', color: '#0B0B0F' }}>Lock it in</button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
