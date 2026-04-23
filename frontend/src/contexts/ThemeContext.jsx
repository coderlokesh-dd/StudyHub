import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ACCENT_COLORS = ['purple', 'blue', 'green', 'orange', 'pink'];
const FONT_SIZES = [80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('so-theme') || 'dark');
    const [accent, setAccent] = useState(() => localStorage.getItem('so-accent') || 'purple');
    const [fontSize, setFontSize] = useState(() => localStorage.getItem('so-font-size') || '100');
    const [tone, setTone] = useState(() => localStorage.getItem('so-tone') || 'gen-z');

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.setProperty('--font-scale', (parseInt(fontSize) / 100).toString());

        // Handle custom hex colors vs predefined class colors
        if (accent.startsWith('#')) {
            root.setAttribute('data-accent', 'custom');

            // Convert Hex to RGB for glow effects
            let hex = accent.replace('#', '');
            if (hex.length === 3) {
                hex = hex.split('').map(char => char + char).join('');
            }
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const rgbStr = `${r}, ${g}, ${b}`;

            // Assign custom CSS variables directly
            root.style.setProperty('--accent', accent);
            root.style.setProperty('--accent-hover', accent);
            root.style.setProperty('--accent-rgb', rgbStr);
            root.style.setProperty('--accent-bg', `rgba(${rgbStr}, 0.08)`);
            root.style.setProperty('--accent-bg-hover', `rgba(${rgbStr}, 0.14)`);
            root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${accent}, rgba(${rgbStr}, 0.6))`);
            root.style.setProperty('--accent-glow', `0 0 20px rgba(${rgbStr}, 0.3)`);
            root.style.setProperty('--accent-glow-lg', `0 0 40px rgba(${rgbStr}, 0.2), 0 0 80px rgba(${rgbStr}, 0.1)`);
        } else {
            // Remove custom inline styles to let index.css take over
            root.style.removeProperty('--accent');
            root.style.removeProperty('--accent-hover');
            root.style.removeProperty('--accent-rgb');
            root.style.removeProperty('--accent-bg');
            root.style.removeProperty('--accent-bg-hover');
            root.style.removeProperty('--gradient-accent');
            root.style.removeProperty('--accent-glow');
            root.style.removeProperty('--accent-glow-lg');
            root.setAttribute('data-accent', accent);
        }

        localStorage.setItem('so-theme', theme);
        localStorage.setItem('so-accent', accent);
        localStorage.setItem('so-font-size', fontSize);
        localStorage.setItem('so-tone', tone);
    }, [theme, accent, fontSize, tone]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme, setTheme,
            accent, setAccent,
            fontSize, setFontSize,
            tone, setTone,
            ACCENT_COLORS,
            FONT_SIZES
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
