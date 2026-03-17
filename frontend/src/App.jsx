import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { StudyTimerProvider } from './contexts/StudyTimerContext';
import Layout from './components/Layout';
import CustomCursor from './components/CustomCursor';
import FloatingTimer from './components/FloatingTimer';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import StudyStorage from './pages/StudyStorage';
import Journal from './pages/Journal';
import JournalList from './pages/JournalList';
import StudyZone from './pages/StudyZone';
import Timetable from './pages/Timetable';

export default function App() {
    return (
        <ThemeProvider>
            <AppProvider>
                <BrowserRouter>
                    <StudyTimerProvider>
                        <CustomCursor />
                        <FloatingTimer />
                        <Routes>
                            <Route element={<Layout />}>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/notes" element={<Notes />} />
                                <Route path="/tasks" element={<Tasks />} />
                                <Route path="/progress" element={<Progress />} />
                                <Route path="/storage" element={<StudyStorage />} />
                                <Route path="/study-zone" element={<StudyZone />} />
                                <Route path="/timetable" element={<Timetable />} />
                                <Route path="/journal" element={<JournalList />} />
                                <Route path="/journal/:date" element={<Journal />} />
                                <Route path="/settings" element={<Settings />} />
                            </Route>
                        </Routes>
                    </StudyTimerProvider>
                </BrowserRouter>
            </AppProvider>
        </ThemeProvider>
    );
}
