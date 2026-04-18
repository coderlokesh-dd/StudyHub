import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineFolder, HiOutlineFolderOpen, HiOutlineDocumentText,
    HiOutlinePhotograph, HiOutlineUpload, HiOutlineTrash, HiOutlinePlus,
    HiOutlineChevronRight, HiOutlineDownload, HiOutlineX, HiOutlineEye,
    HiOutlineArrowLeft, HiOutlineSearch, HiOutlineDatabase,
} from 'react-icons/hi';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { compressImage, validateFile, formatFileSize } from '../utils/imageCompressor';
import Modal from '../components/Modal';
import './StudyVault.css';

const FILE_ICONS = {
    'application/pdf': <HiOutlineDocumentText size={22} />,
    'image/jpeg': <HiOutlinePhotograph size={22} />,
    'image/jpg': <HiOutlinePhotograph size={22} />,
    'image/png': <HiOutlinePhotograph size={22} />,
    'image/webp': <HiOutlinePhotograph size={22} />,
};

const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function StudyVault() {
    const { user } = useAuth();
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    // Navigation state
    const [currentSemester, setCurrentSemester] = useState(null);
    const [currentSubject, setCurrentSubject] = useState(null);

    // Modals
    const [addSemesterOpen, setAddSemesterOpen] = useState(false);
    const [addSubjectOpen, setAddSubjectOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [previewFile, setPreviewFile] = useState(null);

    // Upload
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Search
    const [searchQuery, setSearchQuery] = useState('');

    // Error
    const [error, setError] = useState('');

    // Storage usage
    const [storageUsed, setStorageUsed] = useState(0);

    // Cache: only fetch once per session
    const hasFetched = useRef(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [semRes, subRes, matRes] = await Promise.all([
                supabase.from('vault_semesters').select('*').eq('user_id', user.id).order('created_at'),
                supabase.from('vault_subjects').select('*').eq('user_id', user.id).order('created_at'),
                supabase.from('vault_materials').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            ]);

            if (semRes.data) setSemesters(semRes.data);
            if (subRes.data) setSubjects(subRes.data);
            if (matRes.data) {
                setMaterials(matRes.data);
                setStorageUsed(matRes.data.reduce((sum, m) => sum + (m.file_size || 0), 0));
            }
        } catch (err) {
            console.error('Failed to fetch vault data:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!hasFetched.current) {
            fetchData();
            hasFetched.current = true;
        }
    }, [fetchData]);

    // Breadcrumb navigation
    const breadcrumbs = useMemo(() => {
        const crumbs = [{ label: 'Study Vault', onClick: () => { setCurrentSemester(null); setCurrentSubject(null); } }];
        if (currentSemester) {
            crumbs.push({ label: currentSemester.title, onClick: () => setCurrentSubject(null) });
        }
        if (currentSubject) {
            crumbs.push({ label: currentSubject.title, onClick: null });
        }
        return crumbs;
    }, [currentSemester, currentSubject]);

    // Filtered items for current view
    const currentSubjects = useMemo(() =>
        currentSemester ? subjects.filter((s) => s.semester_id === currentSemester.id) : [],
        [subjects, currentSemester]
    );

    const currentMaterials = useMemo(() => {
        let mats = currentSubject ? materials.filter((m) => m.subject_id === currentSubject.id) : [];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            mats = mats.filter((m) => m.file_name.toLowerCase().includes(q));
        }
        return mats;
    }, [materials, currentSubject, searchQuery]);

    // --- SEMESTER CRUD ---
    const handleAddSemester = async () => {
        if (!newTitle.trim()) return;
        const { data, error: err } = await supabase.from('vault_semesters').insert({
            user_id: user.id, title: newTitle.trim(),
        }).select().single();
        if (err) { setError(err.message); return; }
        setSemesters((prev) => [...prev, data]);
        setNewTitle('');
        setAddSemesterOpen(false);
    };

    const handleDeleteSemester = async (id) => {
        const semMats = materials.filter((m) => {
            const sub = subjects.find((s) => s.id === m.subject_id);
            return sub && sub.semester_id === id;
        });
        for (const mat of semMats) {
            await supabase.storage.from('study-vault').remove([mat.storage_path]);
        }
        await supabase.from('vault_semesters').delete().eq('id', id);
        setSemesters((prev) => prev.filter((s) => s.id !== id));
        setSubjects((prev) => prev.filter((s) => s.semester_id !== id));
        setMaterials((prev) => prev.filter((m) => !semMats.find((sm) => sm.id === m.id)));
        if (currentSemester?.id === id) { setCurrentSemester(null); setCurrentSubject(null); }
    };

    // --- SUBJECT CRUD ---
    const handleAddSubject = async () => {
        if (!newTitle.trim() || !currentSemester) return;
        const { data, error: err } = await supabase.from('vault_subjects').insert({
            user_id: user.id, semester_id: currentSemester.id, title: newTitle.trim(),
        }).select().single();
        if (err) { setError(err.message); return; }
        setSubjects((prev) => [...prev, data]);
        setNewTitle('');
        setAddSubjectOpen(false);
    };

    const handleDeleteSubject = async (id) => {
        const subMats = materials.filter((m) => m.subject_id === id);
        for (const mat of subMats) {
            await supabase.storage.from('study-vault').remove([mat.storage_path]);
        }
        await supabase.from('vault_subjects').delete().eq('id', id);
        setSubjects((prev) => prev.filter((s) => s.id !== id));
        setMaterials((prev) => prev.filter((m) => m.subject_id !== id));
        if (currentSubject?.id === id) setCurrentSubject(null);
    };

    // --- FILE UPLOAD ---
    const handleFiles = async (files) => {
        if (!currentSubject || !files.length) return;
        setError('');
        setUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setUploadProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);

            const validation = validateFile(file);
            if (!validation.valid) {
                setError(validation.error);
                continue;
            }

            try {
                const compressed = await compressImage(file);
                const ext = file.name.split('.').pop();
                const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
                const semSlug = currentSemester.title.toLowerCase().replace(/\s+/g, '-');
                const subSlug = currentSubject.title.toLowerCase().replace(/\s+/g, '-');
                const storagePath = `${user.id}/${semSlug}/${subSlug}/${uniqueName}`;

                const { error: uploadErr } = await supabase.storage
                    .from('study-vault')
                    .upload(storagePath, compressed, { contentType: compressed.type, upsert: false });

                if (uploadErr) { setError(`Upload failed: ${uploadErr.message}`); continue; }

                const { data: urlData } = supabase.storage
                    .from('study-vault')
                    .getPublicUrl(storagePath);

                const { data: signedData } = await supabase.storage
                    .from('study-vault')
                    .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

                const fileUrl = signedData?.signedUrl || urlData?.publicUrl || storagePath;

                const { data: matData, error: matErr } = await supabase.from('vault_materials').insert({
                    user_id: user.id,
                    subject_id: currentSubject.id,
                    file_name: file.name,
                    file_url: fileUrl,
                    file_type: compressed.type,
                    file_size: compressed.size,
                    storage_path: storagePath,
                }).select().single();

                if (matErr) { setError(`DB error: ${matErr.message}`); continue; }

                setMaterials((prev) => [matData, ...prev]);
                setStorageUsed((prev) => prev + compressed.size);
            } catch (err) {
                setError(`Error uploading ${file.name}: ${err.message}`);
            }
        }

        setUploading(false);
        setUploadProgress('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(Array.from(e.dataTransfer.files));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    // --- FILE DELETE ---
    const handleDeleteFile = async (mat) => {
        await supabase.storage.from('study-vault').remove([mat.storage_path]);
        await supabase.from('vault_materials').delete().eq('id', mat.id);
        setMaterials((prev) => prev.filter((m) => m.id !== mat.id));
        setStorageUsed((prev) => prev - (mat.file_size || 0));
    };

    // --- FILE DOWNLOAD ---
    const handleDownload = async (mat) => {
        const { data, error: err } = await supabase.storage
            .from('study-vault')
            .createSignedUrl(mat.storage_path, 60);

        if (err || !data?.signedUrl) {
            setError('Failed to generate download link.');
            return;
        }

        const a = document.createElement('a');
        a.href = data.signedUrl;
        a.download = mat.file_name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // --- FILE PREVIEW ---
    const handlePreview = async (mat) => {
        const { data } = await supabase.storage
            .from('study-vault')
            .createSignedUrl(mat.storage_path, 3600);
        setPreviewFile({ ...mat, signedUrl: data?.signedUrl || mat.file_url });
    };

    if (loading) {
        return (
            <div className="vault-loading">
                <div className="auth-loading-spinner" />
            </div>
        );
    }

    return (
        <div className="page vault-page">
            {/* Header */}
            <div className="vault-header">
                <div className="vault-breadcrumbs">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={i} className="vault-crumb-wrap">
                            {i > 0 && <HiOutlineChevronRight className="vault-crumb-sep" />}
                            <button
                                className={`vault-crumb ${i === breadcrumbs.length - 1 ? 'active' : ''}`}
                                onClick={crumb.onClick}
                                disabled={!crumb.onClick}
                            >
                                {crumb.label}
                            </button>
                        </span>
                    ))}
                </div>

                <div className="vault-header-actions">
                    <div className="vault-storage-badge">
                        <HiOutlineDatabase size={14} />
                        <span>{formatFileSize(storageUsed)} / 1 GB</span>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="vault-error"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <span>{error}</span>
                        <button onClick={() => setError('')}><HiOutlineX size={16} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== SEMESTER VIEW ========== */}
            {!currentSemester && (
                <motion.div
                    className="vault-grid"
                    initial="initial"
                    animate="animate"
                    variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                >
                    {semesters.map((sem) => (
                        <motion.div
                            key={sem.id}
                            className="vault-folder-card"
                            variants={itemVariants}
                            whileHover={{ y: -3 }}
                            onClick={() => setCurrentSemester(sem)}
                        >
                            <HiOutlineFolderOpen className="vault-folder-icon" size={28} />
                            <span className="vault-folder-title">{sem.title}</span>
                            <span className="vault-folder-meta">
                                {subjects.filter((s) => s.semester_id === sem.id).length} subjects
                            </span>
                            <button
                                className="vault-card-delete"
                                onClick={(e) => { e.stopPropagation(); handleDeleteSemester(sem.id); }}
                                title="Delete semester"
                            >
                                <HiOutlineTrash size={14} />
                            </button>
                        </motion.div>
                    ))}

                    <motion.div
                        className="vault-folder-card vault-add-card"
                        variants={itemVariants}
                        whileHover={{ y: -3 }}
                        onClick={() => { setNewTitle(''); setAddSemesterOpen(true); }}
                    >
                        <HiOutlinePlus size={28} />
                        <span className="vault-folder-title">Add Semester</span>
                    </motion.div>
                </motion.div>
            )}

            {/* ========== SUBJECT VIEW ========== */}
            {currentSemester && !currentSubject && (
                <>
                    <button className="vault-back" onClick={() => setCurrentSemester(null)}>
                        <HiOutlineArrowLeft size={16} /> Back
                    </button>
                    <motion.div
                        className="vault-grid"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
                    >
                        {currentSubjects.map((sub) => (
                            <motion.div
                                key={sub.id}
                                className="vault-folder-card"
                                variants={itemVariants}
                                whileHover={{ y: -3 }}
                                onClick={() => setCurrentSubject(sub)}
                            >
                                <HiOutlineFolder className="vault-folder-icon" size={28} />
                                <span className="vault-folder-title">{sub.title}</span>
                                <span className="vault-folder-meta">
                                    {materials.filter((m) => m.subject_id === sub.id).length} files
                                </span>
                                <button
                                    className="vault-card-delete"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id); }}
                                    title="Delete subject"
                                >
                                    <HiOutlineTrash size={14} />
                                </button>
                            </motion.div>
                        ))}

                        <motion.div
                            className="vault-folder-card vault-add-card"
                            variants={itemVariants}
                            whileHover={{ y: -3 }}
                            onClick={() => { setNewTitle(''); setAddSubjectOpen(true); }}
                        >
                            <HiOutlinePlus size={28} />
                            <span className="vault-folder-title">Add Subject</span>
                        </motion.div>
                    </motion.div>
                </>
            )}

            {/* ========== FILE VIEW ========== */}
            {currentSubject && (
                <>
                    <button className="vault-back" onClick={() => setCurrentSubject(null)}>
                        <HiOutlineArrowLeft size={16} /> Back
                    </button>

                    {/* Search bar */}
                    <div className="vault-search">
                        <HiOutlineSearch className="vault-search-icon" />
                        <input
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Upload zone */}
                    <div
                        className={`vault-dropzone ${dragOver ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={() => setDragOver(false)}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => handleFiles(Array.from(e.target.files))}
                            hidden
                        />
                        {uploading ? (
                            <div className="vault-upload-progress">
                                <div className="landing-spinner" />
                                <span>{uploadProgress}</span>
                            </div>
                        ) : (
                            <>
                                <HiOutlineUpload size={28} />
                                <span>Drop files here or click to upload</span>
                                <span className="vault-dropzone-hint">PDF, JPG, PNG, WebP (max 10 MB)</span>
                            </>
                        )}
                    </div>

                    {/* File list */}
                    <motion.div
                        className="vault-file-list"
                        initial="initial"
                        animate="animate"
                        variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
                    >
                        <AnimatePresence>
                            {currentMaterials.length === 0 && (
                                <motion.div className="vault-empty" variants={itemVariants}>
                                    No files yet. Upload something!
                                </motion.div>
                            )}
                            {currentMaterials.map((mat) => (
                                <motion.div
                                    key={mat.id}
                                    className="vault-file-row"
                                    variants={itemVariants}
                                    layout
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <div className="vault-file-icon">
                                        {FILE_ICONS[mat.file_type] || <HiOutlineDocumentText size={22} />}
                                    </div>
                                    <div className="vault-file-info">
                                        <span className="vault-file-name">{mat.file_name}</span>
                                        <span className="vault-file-meta">
                                            {formatFileSize(mat.file_size)} &middot; {new Date(mat.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="vault-file-actions">
                                        <button onClick={() => handlePreview(mat)} title="Preview">
                                            <HiOutlineEye size={17} />
                                        </button>
                                        <button onClick={() => handleDownload(mat)} title="Download">
                                            <HiOutlineDownload size={17} />
                                        </button>
                                        <button onClick={() => handleDeleteFile(mat)} title="Delete" className="vault-delete-btn">
                                            <HiOutlineTrash size={17} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}

            {/* ========== ADD SEMESTER MODAL ========== */}
            <Modal isOpen={addSemesterOpen} onClose={() => setAddSemesterOpen(false)} title="Add Semester">
                <div className="form-group">
                    <label>Semester Name</label>
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Semester 3"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSemester()}
                        autoFocus
                    />
                </div>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setAddSemesterOpen(false)}>Cancel</button>
                    <motion.button className="btn btn-primary" onClick={handleAddSemester} whileHover={{ scale: 1.03 }}>
                        Create
                    </motion.button>
                </div>
            </Modal>

            {/* ========== ADD SUBJECT MODAL ========== */}
            <Modal isOpen={addSubjectOpen} onClose={() => setAddSubjectOpen(false)} title="Add Subject">
                <div className="form-group">
                    <label>Subject Name</label>
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Operating Systems"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                        autoFocus
                    />
                </div>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setAddSubjectOpen(false)}>Cancel</button>
                    <motion.button className="btn btn-primary" onClick={handleAddSubject} whileHover={{ scale: 1.03 }}>
                        Create
                    </motion.button>
                </div>
            </Modal>

            {/* ========== FILE PREVIEW MODAL ========== */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        className="vault-preview-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            className="vault-preview-container"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="vault-preview-header">
                                <span className="vault-preview-title">{previewFile.file_name}</span>
                                <div className="vault-preview-actions">
                                    <button onClick={() => handleDownload(previewFile)}>
                                        <HiOutlineDownload size={18} />
                                    </button>
                                    <button onClick={() => setPreviewFile(null)}>
                                        <HiOutlineX size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="vault-preview-body">
                                {previewFile.file_type === 'application/pdf' ? (
                                    <iframe
                                        src={previewFile.signedUrl}
                                        title={previewFile.file_name}
                                        className="vault-preview-pdf"
                                    />
                                ) : (
                                    <img
                                        src={previewFile.signedUrl}
                                        alt={previewFile.file_name}
                                        className="vault-preview-img"
                                        loading="lazy"
                                    />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
