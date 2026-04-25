import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineX, HiOutlineClipboardCopy, HiOutlineCheck,
    HiOutlineLink, HiOutlineDownload, HiOutlineExclamation,
} from 'react-icons/hi';
import './ShareModal.css';

/**
 * Reusable share modal.
 *
 * Props:
 *  - open (bool)
 *  - onClose ()
 *  - title (string) - heading e.g. "Share this note"
 *  - subtitle (string) - small description
 *  - url (string|null) - the share URL to display. null/'' = loading.
 *  - loading (bool) - show spinner while generating
 *  - error (string|null)
 *  - meta (string) - small bottom note like "Link expires in 30 days"
 *  - onRevoke () - optional. If provided, shows a revoke button.
 *  - revoking (bool)
 */
export default function ShareModal({
    open,
    onClose,
    title = 'Share',
    subtitle = '',
    url,
    loading = false,
    error = null,
    meta = '',
    onRevoke = null,
    revoking = false,
}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) setCopied(false);
    }, [open]);

    const handleCopy = async () => {
        if (!url) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Fallback: select the input so the user can copy manually
            const el = document.getElementById('share-modal-url');
            if (el) {
                el.select();
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
            }
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="share-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="share-modal"
                        initial={{ opacity: 0, y: 24, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="share-modal-close" onClick={onClose} aria-label="Close">
                            <HiOutlineX size={18} />
                        </button>

                        <div className="share-modal-icon">
                            <HiOutlineLink size={26} />
                        </div>

                        <h2 className="share-modal-title">{title}</h2>
                        {subtitle && <p className="share-modal-sub">{subtitle}</p>}

                        {error ? (
                            <div className="share-modal-error">
                                <HiOutlineExclamation size={18} />
                                <span>{error}</span>
                            </div>
                        ) : loading ? (
                            <div className="share-modal-loading">
                                <span className="share-modal-spinner" />
                                <span>Preparing your link...</span>
                            </div>
                        ) : (
                            <>
                                <div className="share-modal-url-row">
                                    <input
                                        id="share-modal-url"
                                        className="share-modal-url"
                                        type="text"
                                        value={url || ''}
                                        readOnly
                                        onClick={(e) => e.target.select()}
                                    />
                                    <motion.button
                                        className={`share-modal-copy ${copied ? 'is-copied' : ''}`}
                                        onClick={handleCopy}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                    >
                                        {copied ? (
                                            <>
                                                <HiOutlineCheck size={16} />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineClipboardCopy size={16} />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                <div className="share-modal-hint">
                                    <HiOutlineDownload size={14} />
                                    <span>Anyone with this link can download — no login needed.</span>
                                </div>

                                {meta && <div className="share-modal-meta">{meta}</div>}
                            </>
                        )}

                        {onRevoke && !loading && !error && url && (
                            <button
                                className="share-modal-revoke"
                                onClick={onRevoke}
                                disabled={revoking}
                                type="button"
                            >
                                {revoking ? 'Revoking...' : 'Revoke this link'}
                            </button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
