import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineLocationMarker, HiOutlineCog } from 'react-icons/hi';
import * as api from '../utils/api';
import { generateId } from '../utils/helpers';
import Modal from '../components/Modal';
import './Timetable.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#7C5CFF', '#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#EC4899', '#6366F1', '#14B8A6'];

function formatHour(h) {
    if (h === 0 || h === 24) return '12 AM';
    if (h < 12) return `${h} AM`;
    if (h === 12) return '12 PM';
    return `${h - 12} PM`;
}

function getStoredTimeRange() {
    try {
        const stored = JSON.parse(localStorage.getItem('timetable_range'));
        if (stored && stored.start >= 0 && stored.end <= 24 && stored.start < stored.end) return stored;
    } catch {}
    return null; // null means not configured yet
}

const containerVariants = {
    animate: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function timeToRow(time, startHour) {
    const [h, m] = time.split(':').map(Number);
    return (h - startHour) * 2 + (m >= 30 ? 1 : 0);
}

function getRowSpan(start, end, startHour) {
    return Math.max(timeToRow(end, startHour) - timeToRow(start, startHour), 1);
}

export default function Timetable() {
    const [entries, setEntries] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(() => getStoredTimeRange() || { start: 8, end: 17 });
    const [showSetup, setShowSetup] = useState(() => getStoredTimeRange() === null);
    const [form, setForm] = useState({
        title: '', subject: '', day_of_week: 0,
        start_time: '09:00', end_time: '10:00',
        color: '#7C5CFF', location: '',
    });

    const HOURS = Array.from({ length: timeRange.end - timeRange.start }, (_, i) => i + timeRange.start);

    useEffect(() => {
        api.fetchTimetable().then(data => {
            setEntries(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const openAdd = (day) => {
        setEditId(null);
        setForm({
            title: '', subject: '', day_of_week: day ?? 0,
            start_time: '09:00', end_time: '10:00',
            color: '#7C5CFF', location: '',
        });
        setModalOpen(true);
    };

    const openEdit = (entry) => {
        setEditId(entry.id);
        setForm({
            title: entry.title, subject: entry.subject || '',
            day_of_week: entry.day_of_week, start_time: entry.start_time,
            end_time: entry.end_time, color: entry.color || '#7C5CFF',
            location: entry.location || '',
        });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() && !form.subject.trim()) return;
        if (editId) {
            await api.updateTimetableEntry(editId, form);
            setEntries(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e));
        } else {
            const entry = { id: generateId(), ...form };
            await api.createTimetableEntry(entry);
            setEntries(prev => [...prev, entry]);
        }
        setModalOpen(false);
        setEditId(null);
    };

    const handleDelete = async (id) => {
        await api.deleteTimetableEntry(id);
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const saveTimeRange = (newRange) => {
        setTimeRange(newRange);
        localStorage.setItem('timetable_range', JSON.stringify(newRange));
    };

    // Current day and time indicator
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7; // Mon=0, Sun=6
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeRow = (currentHour - timeRange.start) * 2 + (currentMin >= 30 ? 1 : 0);
    const isInRange = currentHour >= timeRange.start && currentHour <= timeRange.end;

    const handleSetupSave = () => {
        saveTimeRange(timeRange);
        setShowSetup(false);
    };

    // First-time setup screen
    if (showSetup) {
        return (
            <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
                <motion.div className="tt-setup" variants={itemVariants}>
                    <div className="tt-setup-card">
                        <div className="tt-setup-icon">🏫</div>
                        <h2>Set Up Your Timetable</h2>
                        <p>When do classes run at your university? This will customize the timetable grid to match your schedule.</p>
                        <div className="tt-settings-row">
                            <div className="form-group">
                                <label htmlFor="tt-setup-start">College starts at</label>
                                <select id="tt-setup-start" value={timeRange.start} onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val < timeRange.end) setTimeRange(prev => ({ ...prev, start: val }));
                                }}>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <option key={i} value={i} disabled={i >= timeRange.end}>{formatHour(i)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="tt-setup-end">College ends at</label>
                                <select id="tt-setup-end" value={timeRange.end} onChange={e => {
                                    const val = Number(e.target.value);
                                    if (val > timeRange.start) setTimeRange(prev => ({ ...prev, end: val }));
                                }}>
                                    {Array.from({ length: 24 }, (_, i) => i + 1).map(i => (
                                        <option key={i} value={i} disabled={i <= timeRange.start}>{formatHour(i)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="tt-setup-preview">
                            Timetable will show <strong>{formatHour(timeRange.start)}</strong> to <strong>{formatHour(timeRange.end)}</strong> ({timeRange.end - timeRange.start} hours)
                        </div>
                        <motion.button className="btn btn-primary tt-setup-btn" onClick={handleSetupSave} whileHover={{ scale: 1.03 }}>
                            Continue
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div className="page container" variants={containerVariants} initial="initial" animate="animate">
            <motion.div className="tt-header" variants={itemVariants}>
                <h1>📅 Timetable</h1>
                <div className="tt-header-actions">
                    <span className="tt-range-label">{formatHour(timeRange.start)} – {formatHour(timeRange.end)}</span>
                    <motion.button className="btn btn-primary" onClick={() => openAdd()} whileHover={{ scale: 1.05 }}>
                        <HiOutlinePlus size={18} /> Add Class
                    </motion.button>
                </div>
            </motion.div>

            <AnimatePresence>
                {settingsOpen && (
                    <motion.div
                        className="tt-settings-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <div className="tt-settings-content">
                            <h3>Schedule Hours</h3>
                            <p className="tt-settings-desc">Set your university's class hours to customize the timetable grid.</p>
                            <div className="tt-settings-row">
                                <div className="form-group">
                                    <label htmlFor="tt-range-start">College starts at</label>
                                    <select id="tt-range-start" value={timeRange.start} onChange={e => {
                                        const val = Number(e.target.value);
                                        if (val < timeRange.end) saveTimeRange({ ...timeRange, start: val });
                                    }}>
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i} disabled={i >= timeRange.end}>{formatHour(i)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tt-range-end">College ends at</label>
                                    <select id="tt-range-end" value={timeRange.end} onChange={e => {
                                        const val = Number(e.target.value);
                                        if (val > timeRange.start) saveTimeRange({ ...timeRange, end: val });
                                    }}>
                                        {Array.from({ length: 24 }, (_, i) => i + 1).map(i => (
                                            <option key={i} value={i} disabled={i <= timeRange.start}>{formatHour(i)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="empty-state"><p>Loading...</p></div>
            ) : (
                <motion.div className="tt-grid-wrapper" variants={itemVariants}>
                    <div className="tt-grid">
                        {/* Time gutter */}
                        <div className="tt-gutter">
                            <div className="tt-gutter-header">
                                <button className="tt-gutter-settings" onClick={() => setSettingsOpen(s => !s)} title="Change schedule hours">
                                    <HiOutlineCog size={16} />
                                </button>
                            </div>
                            {HOURS.map(h => (
                                <div key={h} className="tt-gutter-hour">
                                    <span>{h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}</span>
                                </div>
                            ))}
                        </div>

                        {/* Day columns */}
                        {DAYS.map((day, di) => (
                            <div key={day} className={`tt-day-col ${di === currentDay ? 'today' : ''}`}>
                                <div className={`tt-day-header ${di === currentDay ? 'today' : ''}`} onClick={() => openAdd(di)} title="Click to add class">
                                    <span className="tt-day-short">{day.slice(0, 3)}</span>
                                    <span className="tt-day-full">{day}</span>
                                </div>
                                <div className="tt-day-body">
                                    {/* Hour grid lines */}
                                    {HOURS.map(h => (
                                        <div key={h} className="tt-hour-line" />
                                    ))}

                                    {/* Current time indicator */}
                                    {isInRange && di === currentDay && (
                                        <div
                                            className="tt-now-line"
                                            style={{ top: `${(currentTimeRow / (HOURS.length * 2)) * 100}%` }}
                                        />
                                    )}

                                    {/* Entries */}
                                    <AnimatePresence>
                                        {entries
                                            .filter(e => e.day_of_week === di)
                                            .map(entry => {
                                                const top = (timeToRow(entry.start_time, timeRange.start) / (HOURS.length * 2)) * 100;
                                                const height = (getRowSpan(entry.start_time, entry.end_time, timeRange.start) / (HOURS.length * 2)) * 100;
                                                return (
                                                    <motion.div
                                                        key={entry.id}
                                                        className="tt-entry"
                                                        style={{
                                                            top: `${top}%`,
                                                            height: `${height}%`,
                                                            '--entry-color': entry.color || '#7C5CFF',
                                                        }}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        whileHover={{ scale: 1.02, zIndex: 10 }}
                                                        onClick={() => openEdit(entry)}
                                                    >
                                                        <span className="tt-entry-title">{entry.title || entry.subject}</span>
                                                        {entry.title && entry.subject && <span className="tt-entry-subject">{entry.subject}</span>}
                                                        <span className="tt-entry-time">{entry.start_time}–{entry.end_time}</span>
                                                        {entry.location && (
                                                            <span className="tt-entry-location">
                                                                <HiOutlineLocationMarker size={10} />
                                                                {entry.location}
                                                            </span>
                                                        )}
                                                        <button className="tt-entry-delete" onClick={e => { e.stopPropagation(); handleDelete(entry.id); }}>
                                                            <HiOutlineTrash size={12} />
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); }} title={editId ? 'Edit Entry' : 'New Timetable Entry'}>
                <div className="form-group">
                    <label htmlFor="tt-title">Title {form.subject.trim() ? <span style={{opacity:0.5}}>(optional)</span> : ''}</label>
                    <input id="tt-title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Physics Lecture" />
                </div>
                <div className="form-group">
                    <label htmlFor="tt-subject">Subject {form.title.trim() ? <span style={{opacity:0.5}}>(optional)</span> : ''}</label>
                    <input id="tt-subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Physics" />
                </div>
                {!form.title.trim() && !form.subject.trim() && (
                    <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '-8px' }}>Fill in at least a title or subject</p>
                )}
                <div className="form-group">
                    <label htmlFor="tt-day">Day</label>
                    <select id="tt-day" value={form.day_of_week} onChange={e => setForm({...form, day_of_week: Number(e.target.value)})}>
                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="tt-start">Start Time</label>
                        <input type="time" id="tt-start" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tt-end">End Time</label>
                        <input type="time" id="tt-end" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="tt-location">Location <span style={{opacity:0.5}}>(optional)</span></label>
                    <input id="tt-location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. Room 201" />
                </div>
                <div className="form-group">
                    <label>Color</label>
                    <div className="exam-color-picker">
                        {COLORS.map(c => (
                            <button key={c} className={`exam-color-swatch ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setForm({...form, color: c})} />
                        ))}
                    </div>
                </div>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => { setModalOpen(false); setEditId(null); }}>Cancel</button>
                    {editId && (
                        <button className="btn btn-ghost" style={{ color: '#EF4444' }} onClick={() => { handleDelete(editId); setModalOpen(false); setEditId(null); }}>Delete</button>
                    )}
                    <motion.button className="btn btn-primary" onClick={handleSave} whileHover={{ scale: 1.03 }}>
                        {editId ? 'Save Changes' : 'Add Entry'}
                    </motion.button>
                </div>
            </Modal>
        </motion.div>
    );
}
