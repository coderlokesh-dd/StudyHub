import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import CustomCursor from './components/CustomCursor';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import StudyStorage from './pages/StudyStorage';

export default function App() {
    return (
        <ThemeProvider>
            <AppProvider>
                <BrowserRouter>
                    <CustomCursor />
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/notes" element={<Notes />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/progress" element={<Progress />} />
                            <Route path="/storage" element={<StudyStorage />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </AppProvider>
        </ThemeProvider>
    );
}
