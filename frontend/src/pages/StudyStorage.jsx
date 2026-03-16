import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFolder, HiOutlineDocumentSearch, HiOutlineDocumentText, HiOutlinePhotograph, HiChevronRight, HiOutlinePlus, HiOutlineCloudUpload, HiOutlineDotsVertical, HiOutlineDownload, HiOutlineArrowsExpand } from 'react-icons/hi';
import Modal from '../components/Modal';
import './StudyStorage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StudyStorage() {
    const fileInputRef = useRef(null);
    const [storage, setStorage] = useState([]);
    const [path, setPath] = useState([{ id: 'root', title: 'Study Vault', children: [] }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [viewingFile, setViewingFile] = useState(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // States for custom modals
    const [renameModal, setRenameModal] = useState({ isOpen: false, itemId: null, currentTitle: '', newTitle: '' });
    const [newFolderModal, setNewFolderModal] = useState({ isOpen: false, title: '' });
    const [fetchError, setFetchError] = useState(null);

    const currentFolder = path[path.length - 1];

    // Fetch data from backend
    const fetchStorage = async () => {
        try {
            setFetchError(null);
            const res = await fetch(`${API_BASE}/api/studyvault`);
            if (!res.ok) {
                setFetchError('Failed to load Study Vault. Server returned an error.');
                return;
            }
            const data = await res.json();

            // Prevent crashes if server doesn't return an Array
            if (!Array.isArray(data)) {
                setFetchError('Unexpected data format from server.');
                return;
            }

            setStorage(data);

            // Re-sync path with new data references so UI updates properly
            setPath(prevPath => {
                let updatedPath = [{ id: 'root', title: 'Study Vault', children: data }];
                let currentItems = data;

                // Re-traverse the path to find updated children
                for (let i = 1; i < prevPath.length; i++) {
                    const found = currentItems.find(item => item.id === prevPath[i].id);
                    if (found) {
                        updatedPath.push(found);
                        currentItems = found.children || [];
                    } else {
                        break; // Stop if node was deleted
                    }
                }
                return updatedPath;
            });
        } catch (err) {
            console.error('Failed to fetch study vault', err);
            setFetchError('Could not connect to the server. Make sure the backend is running.');
        }
    };

    useEffect(() => {
        fetchStorage();
    }, []);

    // Check if we are inside a subject (Root -> Semester -> Subject means path > 2)
    const isInsideSubject = path.length > 2;

    // Get contents to display based on current folder and search query
    const getDisplayItems = () => {
        if (searchQuery) {
            const results = [];
            const searchRecursive = (nodes, currentPath) => {
                for (const node of nodes) {
                    const nodePath = [...currentPath, node];
                    // Search by title (case-insensitive)
                    if (node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push({ ...node, fullPath: nodePath });
                    }
                    if (node.children) {
                        searchRecursive(node.children, nodePath);
                    }
                }
            };
            // Start recursive search from the root storage
            searchRecursive(storage, [{ id: 'root', title: 'Study Vault', children: storage }]);
            return results;
        }
        return currentFolder.children || [];
    };

    const displayItems = getDisplayItems();

    const handleNavigate = (folder) => {
        if (folder.type === 'folder') {
            if (folder.fullPath) {
                setPath(folder.fullPath);
            } else {
                setPath([...path, folder]);
            }
            setSearchQuery('');
        }
    };

    const handleBreadcrumbClick = (index) => {
        setPath(path.slice(0, index + 1));
        setSearchQuery('');
        setMenuOpenId(null);
    };

    const handleNewFolderClick = () => {
        setNewFolderModal({ isOpen: true, title: '' });
    };

    const confirmNewFolder = async () => {
        const title = newFolderModal.title;
        if (!title || title.trim() === '') return;

        try {
            if (path.length === 1) {
                // Post Semester
                await fetch(`${API_BASE}/api/semesters`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'sem' + Date.now(), title: title.trim() })
                });
            } else if (path.length === 2) {
                // Post Subject
                await fetch(`${API_BASE}/api/subjects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'sub' + Date.now(), semester_id: currentFolder.id, title: title.trim() })
                });
            }
            await fetchStorage();
            setNewFolderModal({ isOpen: false, title: '' });
        } catch (err) {
            console.error('Failed to create folder', err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', 'file-' + Date.now());
        formData.append('subject_id', currentFolder.id);
        formData.append('title', file.name);

        try {
            await fetch(`${API_BASE}/api/materials/upload`, {
                method: 'POST',
                body: formData
            });
            await fetchStorage();
        } catch (err) {
            console.error('Failed to upload file', err);
        }

        // Reset input
        e.target.value = '';
    };

    const handleDeleteItem = async (e, itemId) => {
        e.stopPropagation();
        try {
            // Determine level implicitly checking where we are. Materials are only inside subjects (path len > 2).
            const isMaterial = isInsideSubject;
            const endpoint = isMaterial ? `/api/materials/${itemId}` :
                path.length === 2 ? `/api/subjects/${itemId}` : `/api/semesters/${itemId}`;

            await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
            await fetchStorage();
        } catch (err) {
            console.error('Failed to delete item', err);
        }
        setMenuOpenId(null);
    };

    const handleRenameClick = (e, itemId, currentTitle) => {
        e.stopPropagation();
        setRenameModal({ isOpen: true, itemId, currentTitle, newTitle: currentTitle });
        setMenuOpenId(null);
    };

    const confirmRename = async (e) => {
        if (e) e.preventDefault();
        const { itemId, newTitle } = renameModal;

        if (newTitle && newTitle.trim() !== "") {
            try {
                const isMaterial = isInsideSubject;
                const endpoint = isMaterial ? `/api/materials/${itemId}` :
                    path.length === 2 ? `/api/subjects/${itemId}` : `/api/semesters/${itemId}`;

                await fetch(`${API_BASE}${endpoint}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: newTitle.trim() })
                });
                await fetchStorage();
            } catch (err) {
                console.error('Failed to rename item', err);
            }
        }
        setRenameModal({ isOpen: false, itemId: null, currentTitle: '', newTitle: '' });
    };

    const toggleMenu = (e, itemId) => {
        e.stopPropagation();
        setMenuOpenId(menuOpenId === itemId ? null : itemId);
    };

    const getFileIcon = (docType) => {
        switch (docType) {
            case 'pdf': return <HiOutlineDocumentText className="item-icon file-pdf" />;
            case 'image': return <HiOutlinePhotograph className="item-icon file-image" />;
            default: return <HiOutlineDocumentText className="item-icon file-doc" />;
        }
    };

    return (
        <div className="page container study-storage">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Study Vault</h1>
                    <p className="page-subtitle">Organize your academic resources</p>
                </div>
                <div className="header-actions">
                    {/* Can create new folder at root (Semester) or in Semester (Subject). Cannot inside Subject according to schema. */}
                    {!isInsideSubject && (
                        <button className="btn btn-primary primary-button" onClick={handleNewFolderClick}>
                            <HiOutlinePlus size={20} />
                            <span>{path.length === 1 ? 'New Semester' : 'New Subject'}</span>
                        </button>
                    )}

                    {/* Upload is ONLY available inside a Subject (Materials) */}
                    {isInsideSubject && (
                        <>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                                accept="image/png, image/jpeg, image/jpg, application/pdf"
                            />
                            <button
                                className="btn btn-secondary secondary-button"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <HiOutlineCloudUpload size={20} />
                                <span>Upload File</span>
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="storage-toolbar">
                <nav className="breadcrumbs">
                    {path.map((crumb, index) => (
                        <div key={crumb.id} className="breadcrumb-item">
                            <button
                                className={`breadcrumb-btn ${index === path.length - 1 ? 'active' : ''}`}
                                onClick={() => handleBreadcrumbClick(index)}
                            >
                                {crumb.title}
                            </button>
                            {index < path.length - 1 && <HiChevronRight className="breadcrumb-separator" size={16} />}
                        </div>
                    ))}
                </nav>

                <div className="search-bar">
                    <HiOutlineDocumentSearch className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search in this folder..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {fetchError && (
                <div className="storage-error" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md) var(--space-lg)', marginBottom: 'var(--space-md)', color: '#EF4444', fontSize: 'var(--text-sm)' }}>
                    {fetchError}
                </div>
            )}

            <div className="storage-content">
                <div className="list-header">
                    <div className="col-name">Name</div>
                    <div className="col-date">Date Modified</div>
                    <div className="col-size">Size</div>
                    <div className="col-actions"></div>
                </div>

                <div className="list-body">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentFolder.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="items-container"
                        >
                            {displayItems.length === 0 ? (
                                <div className="empty-state">
                                    <HiOutlineFolder size={48} className="empty-icon" />
                                    <h3>This folder is empty</h3>
                                    <p>Drop files here or click upload to add materials</p>
                                </div>
                            ) : (
                                displayItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        className={`list-item ${item.type}`}
                                        style={{ position: 'relative', zIndex: menuOpenId === item.id ? 10 : 1 }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => {
                                            if (item.type === 'folder') {
                                                handleNavigate(item);
                                            } else {
                                                setViewingFile(item);
                                            }
                                        }}
                                    >
                                        <div className="col-name">
                                            {item.type === 'folder' ? (
                                                <HiOutlineFolder className="item-icon folder-icon" />
                                            ) : (
                                                getFileIcon(item.docType)
                                            )}
                                            <div>
                                                <span className="item-title">{item.title}</span>
                                                {searchQuery && item.fullPath && (
                                                    <span className="item-path-hint" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
                                                        {item.fullPath.slice(0, -1).map(p => p.title).join(' / ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-date">{item.date || '--'}</div>
                                        <div className="col-size">{item.size || '--'}</div>
                                        <div className="col-actions">
                                            <div className="storage-menu-wrapper" style={{ position: 'relative' }}>
                                                <button className="btn-icon small-btn" onClick={(e) => toggleMenu(e, item.id)}>
                                                    <HiOutlineDotsVertical size={16} />
                                                </button>

                                                <AnimatePresence>
                                                    {menuOpenId === item.id && (
                                                        <motion.div
                                                            className="storage-dropdown-menu"
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            transition={{ duration: 0.15 }}
                                                        >
                                                            <button className="dropdown-item" onClick={(e) => handleRenameClick(e, item.id, item.title)}>Rename</button>
                                                            <button className="dropdown-item text-danger" onClick={(e) => handleDeleteItem(e, item.id)}>Delete</button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* File Viewer Modal */}
            <Modal
                isOpen={!!viewingFile}
                onClose={() => { setViewingFile(null); setIsFullScreen(false); }}
                title={viewingFile?.title || 'Preview'}
                className={`file-viewer-modal ${isFullScreen ? 'is-full-screen' : ''}`}
                headerActions={
                    viewingFile && (viewingFile.docType === 'pdf' || viewingFile.docType === 'image') && (
                        <button
                            className="btn-icon"
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                        >
                            <HiOutlineArrowsExpand size={20} />
                        </button>
                    )
                }
            >
                {viewingFile && (
                    <div className="file-preview-container">
                        {/* Only PDF and Images can be natively previewed securely in an iframe */}
                        {viewingFile.fileUrl && (viewingFile.docType === 'pdf' || viewingFile.docType === 'image') ? (
                            <iframe
                                src={viewingFile.fileUrl.startsWith('http') ? viewingFile.fileUrl : `${API_BASE}${viewingFile.fileUrl}`}
                                className="file-preview-iframe"
                                title="File Preview"
                            />
                        ) : (
                            <div className="no-preview-state">
                                <HiOutlineDocumentText size={64} className="no-preview-icon" />
                                <h3>Preview Not Available</h3>
                                <p>This file type (.docx) cannot be previewed in the browser directly.</p>
                                {viewingFile.fileUrl ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(viewingFile.fileUrl.startsWith('http') ? viewingFile.fileUrl : `${API_BASE}${viewingFile.fileUrl}`, '_blank');
                                        }}
                                    >
                                        <HiOutlineDownload size={18} style={{ marginRight: '8px' }} />
                                        Download File
                                    </button>
                                ) : (
                                    <p className="mock-note">This is a mock file and does not exist locally.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
            {/* Rename Modal */}
            <Modal
                isOpen={renameModal.isOpen}
                onClose={() => setRenameModal({ ...renameModal, isOpen: false })}
                title="Rename Item"
            >
                <form
                    onSubmit={confirmRename}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}
                >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                            type="text"
                            value={renameModal.newTitle}
                            onChange={(e) => setRenameModal({ ...renameModal, newTitle: e.target.value })}
                            className="form-input"
                            autoFocus
                            placeholder="Enter new name"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary secondary-button" onClick={() => setRenameModal({ ...renameModal, isOpen: false })}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary primary-button">
                            Rename
                        </button>
                    </div>
                </form>
            </Modal>

            {/* New Folder Modal */}
            <Modal
                isOpen={newFolderModal.isOpen}
                onClose={() => setNewFolderModal({ ...newFolderModal, isOpen: false })}
                title="New Folder"
            >
                <form
                    onSubmit={(e) => { e.preventDefault(); confirmNewFolder(); }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}
                >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                            type="text"
                            value={newFolderModal.title}
                            onChange={(e) => setNewFolderModal({ ...newFolderModal, title: e.target.value })}
                            className="form-input"
                            autoFocus
                            placeholder="Enter folder name"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary secondary-button" onClick={() => setNewFolderModal({ ...newFolderModal, isOpen: false })}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary primary-button">
                            Create Folder
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
