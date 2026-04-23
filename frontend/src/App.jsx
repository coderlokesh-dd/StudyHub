import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { StudyTimerProvider } from './contexts/StudyTimerContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import CustomCursor from './components/CustomCursor';
import FloatingTimer from './components/FloatingTimer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Progress from './pages/Progress';

import StudyVault from './pages/StudyVault';
import Journal from './pages/Journal';
import JournalList from './pages/JournalList';
import StudyZone from './pages/StudyZone';
import Timetable from './pages/Timetable';
import Settings from './pages/Settings';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppProvider>
                    <BrowserRouter>
                        <StudyTimerProvider>
                            <CustomCursor />
                            <FloatingTimer />
                            <Routes>
                                {/* Public route */}
                                <Route path="/landing" element={<Landing />} />

                                {/* Protected routes */}
                                <Route element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/notes" element={<Notes />} />
                                    <Route path="/tasks" element={<Tasks />} />
                                    <Route path="/progress" element={<Progress />} />
                                    <Route path="/vault" element={<StudyVault />} />
                                    <Route path="/study-zone" element={<StudyZone />} />
                                    <Route path="/timetable" element={<Timetable />} />
                                    <Route path="/journal" element={<JournalList />} />
                                    <Route path="/journal/:date" element={<Journal />} />
                                    <Route path="/settings" element={<Settings />} />
                                </Route>

                                {/* Catch-all */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </StudyTimerProvider>
                    </BrowserRouter>
                </AppProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
