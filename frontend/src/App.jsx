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
import Credits from './pages/Credits';
import Legal from './pages/Legal';
import Roadmap from './pages/Roadmap';
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
                                {/* Public routes */}
                                <Route path="/" element={<Landing />} />
                                <Route path="/landing" element={<Navigate to="/" replace />} />
                                <Route path="/credits" element={<Credits />} />
                                <Route path="/legal" element={<Legal />} />
                                <Route path="/privacy" element={<Navigate to="/legal#privacy" replace />} />
                                <Route path="/terms" element={<Navigate to="/legal#terms" replace />} />
                                <Route path="/roadmap" element={<Roadmap />} />
                                <Route path="/changelog" element={<Navigate to="/roadmap#changelog" replace />} />
                                <Route path="/contact" element={<Navigate to="/credits#contact" replace />} />

                                {/* Protected routes */}
                                <Route element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }>
                                    <Route path="/dashboard" element={<Dashboard />} />
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
