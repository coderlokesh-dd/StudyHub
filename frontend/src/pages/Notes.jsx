import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineStar, HiOutlineTrash, HiOutlinePencil, HiStar, HiOutlineTag, HiOutlineClock, HiOutlinePencilAlt } from 'react-icons/hi';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCategoryLabel, getCategoryClass, timeAgo, formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import { PageHeader, Chip, PALETTE } from '../components/ComicComponents';
import './Notes.css';

const cardVariants = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

export default function Notes() {
    const { notes, subjects, addNote, updateNote, deleteNote, toggleFavorite } = useApp();
    const { tone } = useTheme();
    const isPro = tone === 'pro';
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewingNote, setViewingNote] = useState(null);
    const [editingNote, setEditingNote] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', category: 'general' });
    const [customCategory, setCustomCategory] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const textareaRef = useRef(null);

    // Build category options: "General" + subjects from Study Vault + "Custom..."
    const subjectOptions = (subjects || []).map(s => s.title);
    // Deduplicate: unique subject titles
    const uniqueSubjects = [...new Set(subjectOptions)];

    // All categories currently in use (for filter dropdown)
    const usedCategories = [...new Set(notes.map(n => n.category).filter(Boolean))];
    // Merge subjects + used categories for filter
    const allFilterOptions = [...new Set([...uniqueSubjects.map(s => s.toLowerCase()), ...usedCategories])];

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [form.content, modalOpen]);

    const filtered = notes
        .filter(n => filterCat === 'all' || n.category === filterCat)
        .filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

    const favorites = filtered.filter(n => n.favorite);
    const others = filtered.filter(n => !n.favorite);

    const openNew = () => {
        setViewingNote(null);
        setEditingNote(null);
        setForm({ title: '', content: '', category: 'general' });
        setCustomCategory('');
        setIsCustom(false);
        setModalOpen(true);
    };

    const openView = (note) => {
        setEditingNote(null);
        setViewingNote(note);
        setModalOpen(true);
    };

    const openEdit = (note) => {
        setViewingNote(null);
        setEditingNote(note);
        const cat = note.category || 'general';
        // Check if category is a known option or custom
        const isKnown = cat === 'general' || uniqueSubjects.some(s => s.toLowerCase() === cat);
        setForm({ title: note.title, content: note.content, category: isKnown ? cat : '__custom__' });
        setCustomCategory(isKnown ? '' : cat);
        setIsCustom(!isKnown);
        setModalOpen(true);
    };

    const handleCategoryChange = (value) => {
        if (value === '__custom__') {
            setIsCustom(true);
            setForm(prev => ({ ...prev, category: '__custom__' }));
        } else {
            setIsCustom(false);
            setCustomCategory('');
            setForm(prev => ({ ...prev, category: value }));
        }
    };

    const getEffectiveCategory = () => {
        if (isCustom && customCategory.trim()) {
            return customCategory.trim().toLowerCase();
        }
        return form.category === '__custom__' ? 'general' : form.category;
    };

    const handleSave = () => {
        if (!form.title.trim()) return;
        const saveData = { title: form.title, content: form.content, category: getEffectiveCategory() };
        if (editingNote) {
            updateNote(editingNote.id, saveData);
        } else {
            addNote(saveData);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        deleteNote(id);
    };

    const NoteCard = ({ note, index }) => (
        <motion.div
            variants={cardVariants}
            layout
            whileHover={{ y: -4, boxShadow: '6px 6px 0 #0B0B0F' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openView(note)}
            style={{ 
                cursor: 'pointer', background: note.favorite ? PALETTE.butter : PALETTE.lavender,
                border: '3px solid #0B0B0F', boxShadow: '5px 5px 0 #0B0B0F',
                borderRadius: 14, padding: 16, position: 'relative',
                transform: index % 3 === 1 ? 'rotate(-0.8deg)' : index % 3 === 2 ? 'rotate(0.6deg)' : 'none',
                minHeight: 160
            }}
        >
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(11,11,15,0.08) 1px, transparent 1.5px)', backgroundSize: '10px 10px', pointerEvents: 'none', borderRadius: 10 }} />
            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Chip color="#FFF8EA">{getCategoryLabel(note.category).toUpperCase()}</Chip>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-icon" style={{ width: 28, height: 28, background: 'transparent', border: 'none', boxShadow: 'none' }} onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }}>
                            {note.favorite ? <HiStar size={22} color="#0B0B0F" /> : <HiOutlineStar size={22} color="#0B0B0F" />}
                        </button>
                    </div>
                </div>
                <h4 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#0B0B0F', marginBottom: 6, lineHeight: 1.2 }}>{note.title}</h4>
                <p style={{ fontSize: 13, color: 'rgba(11,11,15,0.75)', lineHeight: 1.45 }}>{note.content.length > 120 ? note.content.slice(0, 120) + '...' : note.content}</p>
                <div style={{ position: 'absolute', bottom: -6, right: 0, fontFamily: 'Permanent Marker, cursive', fontSize: 13, color: 'rgba(11,11,15,0.55)' }}>
                    {timeAgo(note.updatedAt)}
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="page container">
            <PageHeader 
                tag={`NOTES · ${notes.length} TOTAL`} 
                tagColor={PALETTE.lavender}
                title={isPro ? 'notes' : 'the vault of thoughts'} 
                subtitle={isPro ? 'Your thoughts, organized.' : 'ur big brain moments. all here.'} 
                right={
                    <motion.button 
                        className="btn btn-primary" 
                        onClick={openNew} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        style={{ fontFamily: isPro ? 'inherit' : 'Bangers, cursive', fontSize: 16, letterSpacing: isPro ? '0' : '0.08em', background: PALETTE.lavender }}
                    >
                        + {isPro ? 'NEW NOTE' : 'NEW DROP'}
                    </motion.button>
                }
            />

            {/* Search & Filter */}
            <div className="notes-toolbar">
                <div className="search-wrap">
                    <HiOutlineSearch size={18} className="search-icon" />
                    <input type="text" placeholder={isPro ? 'Search notes...' : 'find a thought...'} value={search} onChange={e => setSearch(e.target.value)} id="notes-search" />
                </div>
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="filter-select" id="notes-filter">
                    <option value="all">All Categories</option>
                    {allFilterOptions.map(cat => (
                        <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                </select>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
                <section>
                    <h3 className="section-title">⭐ Favorites</h3>
                    <motion.div className="notes-grid" layout>
                        <AnimatePresence>
                            {favorites.map(n => <NoteCard key={n.id} note={n} />)}
                        </AnimatePresence>
                    </motion.div>
                </section>
            )}

            {/* All Notes */}
            <section>
                <h3 className="section-title" style={{ fontFamily: 'Bangers, cursive', fontSize: 24 }}>{favorites.length > 0 ? 'OTHER NOTES' : 'ALL NOTES'}</h3>
                {others.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p>{search ? (isPro ? 'No notes match your search.' : 'nothing found bestie') : (isPro ? 'No notes yet. Create your first note!' : 'empty brain... start dropping thoughts!')}</p>
                    </div>
                ) : (
                    <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }} layout>
                        <AnimatePresence>
                            {others.map((n, i) => <NoteCard key={n.id} note={n} index={i} />)}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Create/Edit/View Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={viewingNote ? 'Note Details' : editingNote ? 'Edit Note' : 'New Note'}>
                {viewingNote ? (
                    <div className="note-view-container">
                        <div className="note-view-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h2 style={{ margin: '0', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{viewingNote.title}</h2>
                            <span className={`badge ${getCategoryClass(viewingNote.category)}`}>{getCategoryLabel(viewingNote.category)}</span>
                        </div>
                        <div className="note-view-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '2rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            {viewingNote.content}
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Close</button>
                            <motion.button className="btn btn-primary" onClick={() => openEdit(viewingNote)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <HiOutlinePencil size={18} style={{ marginRight: '8px' }} />
                                Edit Note
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="note-title">Title</label>
                            <input id="note-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Note title..." />
                        </div>
                        <div className="form-group">
                            <label htmlFor="note-category">Category</label>
                            <select id="note-category" value={isCustom ? '__custom__' : form.category} onChange={e => handleCategoryChange(e.target.value)}>
                                <option value="general">General</option>
                                {uniqueSubjects.length > 0 && (
                                    <optgroup label="Your Subjects">
                                        {uniqueSubjects.map(s => (
                                            <option key={s} value={s.toLowerCase()}>{s}</option>
                                        ))}
                                    </optgroup>
                                )}
                                <option value="__custom__">Custom...</option>
                            </select>
                        </div>
                        {isCustom && (
                            <div className="form-group">
                                <label htmlFor="note-custom-cat">Custom Category</label>
                                <input
                                    id="note-custom-cat"
                                    value={customCategory}
                                    onChange={e => setCustomCategory(e.target.value)}
                                    placeholder="e.g. Operating Systems, DBMS..."
                                    autoFocus
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="note-content">Content</label>
                            <textarea
                                id="note-content"
                                ref={textareaRef}
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                placeholder="Write your notes here..."
                                rows={6}
                                style={{ overflow: 'hidden', minHeight: '150px' }}
                            />
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                            <motion.button className="btn btn-primary" onClick={handleSave} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} id="save-note-btn">
                                {editingNote ? 'Save Changes' : 'Create Note'}
                            </motion.button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
