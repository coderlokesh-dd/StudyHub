import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCalendar, HiOutlineCheck } from 'react-icons/hi';
import { useApp } from '../contexts/AppContext';
import { formatDate } from '../utils/helpers';
import Modal from '../components/Modal';
import './Tasks.css';

const FILTERS = ['all', 'active', 'completed'];

export default function Tasks() {
    const { tasks, addTask, toggleTask, deleteTask } = useApp();
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', subject: '', priority: 'medium', dueDate: '' });

    const filtered = tasks.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    const handleAdd = () => {
        if (!form.title.trim()) return;
        addTask({
            ...form,
            dueDate: form.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        });
        setForm({ title: '', subject: '', priority: 'medium', dueDate: '' });
        setModalOpen(false);
    };

    const activeCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;

    return (
        <div className="page container">
            {/* Header */}
            <div className="tasks-header">
                <div>
                    <h1>📋 Tasks</h1>
                    <p className="tasks-subtitle">{activeCount} active · {completedCount} completed</p>
                </div>
                <motion.button className="btn btn-primary" onClick={() => setModalOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} id="add-task-btn">
                    <HiOutlinePlus size={18} />
                    <span>New Task</span>
                </motion.button>
            </div>

            {/* Filter tabs */}
            <div className="tasks-filters">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        className={`filter-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="tasks-list">
                <AnimatePresence>
                    {filtered.length === 0 ? (
                        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="empty-state-icon">✅</div>
                            <p>{filter === 'completed' ? 'No completed tasks yet.' : filter === 'active' ? 'All tasks done! 🎉' : 'No tasks yet. Add your first task!'}</p>
                        </motion.div>
                    ) : (
                        filtered.map((task, i) => (
                            <motion.div
                                key={task.id}
                                className={`task-item card ${task.completed ? 'completed' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0, transition: { duration: 0.25 } }}
                                layout
                                whileHover={{ x: 4 }}
                            >
                                <motion.button
                                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                    whileTap={{ scale: 0.8 }}
                                    id={`task-check-${task.id}`}
                                >
                                    {task.completed && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                                            <HiOutlineCheck size={14} />
                                        </motion.div>
                                    )}
                                </motion.button>

                                <div className="task-info">
                                    <span className={`task-title ${task.completed ? 'done' : ''}`}>{task.title}</span>
                                    <div className="task-meta">
                                        {task.subject && <span className="task-subject">{task.subject}</span>}
                                        <span className="task-due">
                                            <HiOutlineCalendar size={12} />
                                            {formatDate(task.dueDate)}
                                        </span>
                                    </div>
                                </div>

                                <span className={`badge ${task.priority === 'high' ? 'priority-high' : task.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                                    {task.priority}
                                </span>

                                <button className="btn-icon task-delete" onClick={() => deleteTask(task.id)} title="Delete">
                                    <HiOutlineTrash size={16} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Task">
                <div className="form-group">
                    <label htmlFor="task-title">Task</label>
                    <input id="task-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What do you need to do?" />
                </div>
                <div className="form-group">
                    <label htmlFor="task-subject">Subject</label>
                    <input id="task-subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Math, Science..." />
                </div>
                <div className="form-group">
                    <label htmlFor="task-priority">Priority</label>
                    <select id="task-priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="task-due">Due Date</label>
                    <input type="date" id="task-due" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-actions">
                    <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                    <motion.button className="btn btn-primary" onClick={handleAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} id="save-task-btn">
                        Add Task
                    </motion.button>
                </div>
            </Modal>
        </div>
    );
}
