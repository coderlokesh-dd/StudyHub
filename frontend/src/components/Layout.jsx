import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout() {
    const location = useLocation();

    return (
        <>
            <Sidebar />
            <main>
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                    <Outlet />
                </motion.div>
            </main>
            <BottomNav />
        </>
    );
}
