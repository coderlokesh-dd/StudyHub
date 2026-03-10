import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children, className = '', headerActions }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={`modal ${className}`}
                        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-40%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                        <div className="modal-header">
                            <h3>{title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {headerActions}
                                <button className="btn-icon" onClick={onClose} id="modal-close-btn">
                                    <HiX size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
