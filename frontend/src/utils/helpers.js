export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 5) return { text: 'Still up?', emoji: '🌙', sub: 'Burning the midnight oil' };
    if (hour < 12) return { text: 'Good morning', emoji: '☀️', sub: 'Ready to conquer the day' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️', sub: 'Keep the momentum going' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌆', sub: 'Wind down with some light review' };
    return { text: 'Night mode', emoji: '🌙', sub: 'Late-night study session' };
}

export function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateFull(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function timeAgo(dateStr) {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
}

export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

const KNOWN_CATEGORIES = {
    math: 'Math', science: 'Science', english: 'English',
    history: 'History', cs: 'Computer Science', general: 'General',
};

export function getCategoryLabel(cat) {
    if (!cat) return 'General';
    if (KNOWN_CATEGORIES[cat]) return KNOWN_CATEGORIES[cat];
    // Custom or subject-based category — capitalize first letter of each word
    return cat.replace(/\b\w/g, c => c.toUpperCase());
}

export function getCategoryClass(cat) {
    if (!cat) return 'cat-general';
    if (KNOWN_CATEGORIES[cat]) return `cat-${cat}`;
    return 'cat-custom';
}

export function getPriorityClass(priority) {
    return `priority-${priority || 'low'}`;
}

export function getSmartReminders(notes, tasks) {
    const reminders = [];

    // Find notes not reviewed in a while
    const staleNotes = (notes || [])
        .filter(n => {
            const daysSince = (Date.now() - new Date(n.updatedAt).getTime()) / 86400000;
            return daysSince > 2;
        })
        .slice(0, 2);

    staleNotes.forEach(n => {
        reminders.push({
            id: `remind-${n.id}`,
            type: 'revision',
            icon: '🔄',
            text: `Time to revise your ${n.title} notes`,
            noteId: n.id,
        });
    });

    // Find overdue or due-today tasks
    const today = new Date().toISOString().split('T')[0];
    const urgentTasks = (tasks || [])
        .filter(t => !t.completed && t.dueDate <= today)
        .slice(0, 2);

    urgentTasks.forEach(t => {
        reminders.push({
            id: `urgent-${t.id}`,
            type: 'urgent',
            icon: '⚠️',
            text: `"${t.title}" is due ${t.dueDate === today ? 'today' : 'overdue'}!`,
            taskId: t.id,
        });
    });

    if (reminders.length === 0) {
        reminders.push({
            id: 'all-good',
            type: 'info',
            icon: '✨',
            text: "You're all caught up! Great job.",
        });
    }

    return reminders;
}

export function getRecommendations(notes) {
    if (!notes || notes.length === 0) return [];
    // "Continue where you left off" — most recently updated notes
    return [...notes]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);
}

export function evaluateBadges(data) {
    const badges = [...data.badges];
    const notesCount = data.notes.length;
    const completedTasks = data.tasks.filter(t => t.completed).length;
    const streak = data.streak.current;

    const checks = [
        { id: 'first-note', condition: notesCount >= 1 },
        { id: 'five-notes', condition: notesCount >= 5 },
        { id: 'first-task', condition: completedTasks >= 1 },
        { id: 'streak-3', condition: streak >= 3 },
        { id: 'streak-7', condition: streak >= 7 },
        { id: 'streak-30', condition: streak >= 30 },
        { id: 'ten-tasks', condition: completedTasks >= 10 },
        { id: 'night-owl', condition: new Date().getHours() >= 0 && new Date().getHours() < 5 },
    ];

    let changed = false;
    checks.forEach(({ id, condition }) => {
        const badge = badges.find(b => b.id === id);
        if (badge && !badge.unlocked && condition) {
            badge.unlocked = true;
            badge.unlockedAt = new Date().toISOString();
            changed = true;
        }
    });

    return { badges, changed };
}

export function getWeeklyStudyData(studyLog) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        const entry = (studyLog || []).find(e => e.date === dateStr);
        last7.push({
            day: days[d.getDay()],
            date: dateStr,
            minutes: entry ? entry.minutes : 0,
        });
    }
    return last7;
}
