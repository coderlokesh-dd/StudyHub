// localStorage helper utilities

const STORAGE_KEY = 'student-organizer-data';

const DEFAULT_DATA = {
    notes: [
        {
            id: '1',
            title: 'Cloud Computing Basics',
            content: 'Cloud computing is the delivery of computing services over the internet. Key models: IaaS, PaaS, SaaS. Major providers: AWS, Azure, GCP.',
            category: 'cs',
            favorite: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
            id: '2',
            title: 'Linear Algebra — Vectors',
            content: 'Vectors are quantities with both magnitude and direction. Operations: addition, scalar multiplication, dot product, cross product. Key concepts: linear independence, span, basis.',
            category: 'math',
            favorite: false,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
            id: '3',
            title: 'Organic Chemistry — Alkanes',
            content: 'Alkanes are saturated hydrocarbons with single bonds. General formula: CnH2n+2. Nomenclature follows IUPAC rules. Properties: nonpolar, low reactivity.',
            category: 'science',
            favorite: false,
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
            id: '4',
            title: 'Shakespeare — Hamlet Analysis',
            content: '"To be or not to be" soliloquy analysis. Themes: mortality, indecision, corruption. Hamlet as a tragic hero reflecting Renaissance humanism.',
            category: 'english',
            favorite: true,
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        },
        {
            id: '5',
            title: 'Data Structures — Trees',
            content: 'Binary trees, BST, AVL trees, Red-Black trees. Traversals: inorder, preorder, postorder, level-order. Time complexities and use cases for each type.',
            category: 'cs',
            favorite: false,
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
    ],
    tasks: [
        {
            id: '1',
            title: 'Complete Math Assignment Ch. 5',
            subject: 'Math',
            priority: 'high',
            dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
            completed: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: '2',
            title: 'Read CS lecture slides on Networking',
            subject: 'Computer Science',
            priority: 'medium',
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            completed: false,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
            id: '3',
            title: 'Write History essay outline',
            subject: 'History',
            priority: 'medium',
            dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
            completed: false,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
            id: '4',
            title: 'Lab report — Chemistry experiment',
            subject: 'Science',
            priority: 'high',
            dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
            completed: false,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
            id: '5',
            title: 'Review English vocabulary list',
            subject: 'English',
            priority: 'low',
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            completed: true,
            completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
    ],
    studyLog: [
        { date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0], minutes: 45 },
        { date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], minutes: 90 },
        { date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], minutes: 60 },
        { date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], minutes: 120 },
        { date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], minutes: 30 },
        { date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], minutes: 75 },
        { date: new Date().toISOString().split('T')[0], minutes: 40 },
    ],
    streak: {
        current: 7,
        longest: 14,
        lastStudyDate: new Date().toISOString().split('T')[0],
    },
    badges: [
        { id: 'first-note', name: 'First Note', icon: '📝', description: 'Created your first note', unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
        { id: 'five-notes', name: 'Note Taker', icon: '📚', description: 'Created 5 notes', unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: 'first-task', name: 'Task Master', icon: '✅', description: 'Completed your first task', unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 8).toISOString() },
        { id: 'streak-3', name: 'On Fire', icon: '🔥', description: '3-day study streak', unlocked: true, unlockedAt: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: 'streak-7', name: 'Week Warrior', icon: '⚡', description: '7-day study streak', unlocked: true, unlockedAt: new Date().toISOString() },
        { id: 'streak-30', name: 'Monthly Master', icon: '🏆', description: '30-day study streak', unlocked: false },
        { id: 'ten-tasks', name: 'Productivity Pro', icon: '🚀', description: 'Completed 10 tasks', unlocked: false },
        { id: 'night-owl', name: 'Night Owl', icon: '🦉', description: 'Study after midnight', unlocked: false },
    ],
    totalStudyMinutes: 460,
};

export function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
        saveData(DEFAULT_DATA);
        return DEFAULT_DATA;
    } catch {
        saveData(DEFAULT_DATA);
        return DEFAULT_DATA;
    }
}

export function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_DATA;
}
