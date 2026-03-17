import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineStar, HiOutlineTrash, HiOutlinePencil, HiStar } from 'react-icons/hi';
import { useApp } from '../contexts/AppContext';
import { getCategoryLabel, getCategoryClass, timeAgo } from '../utils/helpers';
import Modal from '../components/Modal';
import './Notes.css';

const cardVariants = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

export default function Notes() {
    const { notes, subjects, addNote, updateNote, deleteNote, toggleFavorite } = useApp();
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

    const NoteCard = ({ note }) => (
        <motion.div
            className="note-card card"
            variants={cardVariants}
            layout
            whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openView(note)}
            style={{ cursor: 'pointer' }}
        >
            <div className="note-card-header">
                <span className={`badge ${getCategoryClass(note.category)}`}>{getCategoryLabel(note.category)}</span>
                <div className="note-card-actions">
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); toggleFavorite(note.id); }} title="Favorite">
                        {note.favorite ? <HiStar size={18} color="var(--accent)" /> : <HiOutlineStar size={18} />}
                    </button>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(note); }} title="Edit">
                        <HiOutlinePencil size={16} />
                    </button>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} title="Delete">
                        <HiOutlineTrash size={16} />
                    </button>
                </div>
            </div>
            <h4 className="note-card-title">{note.title}</h4>
            <p className="note-card-content">{note.content.length > 120 ? note.content.slice(0, 120) + '...' : note.content}</p>
            <div className="note-card-footer">
                <span className="note-card-time">{timeAgo(note.updatedAt)}</span>
            </div>
        </motion.div>
    );

    return (
        <div className="page container">
            {/* Header */}
            <div className="notes-header">
                <h1>📝 Notes</h1>
                <motion.button className="btn btn-primary" onClick={openNew} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="add-note-btn">
                    <HiOutlinePlus size={18} />
                    <span>New Note</span>
                </motion.button>
            </div>

            {/* Search & Filter */}
            <div className="notes-toolbar">
                <div className="search-wrap">
                    <HiOutlineSearch size={18} className="search-icon" />
                    <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} id="notes-search" />
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
                <h3 className="section-title">{favorites.length > 0 ? '📄 Other Notes' : '📄 All Notes'} ({others.length})</h3>
                {others.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <p>{search ? 'No notes match your search.' : 'No notes yet. Create your first note!'}</p>
                    </div>
                ) : (
                    <motion.div className="notes-grid" layout>
                        <AnimatePresence>
                            {others.map(n => <NoteCard key={n.id} note={n} />)}
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
