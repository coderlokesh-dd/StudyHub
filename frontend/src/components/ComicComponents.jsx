import React from 'react';
import { motion } from 'framer-motion';

export const PALETTE = {
    lavender: '#C7B8FF',
    lavenderDeep: '#9B85F5',
    mint: '#B8F2D8',
    mintDeep: '#6BDBA8',
    butter: '#FFE89C',
    butterDeep: '#FFD456',
    coral: '#FFB5B5',
    coralDeep: '#FF7A7A',
    sky: '#B8D9FF',
    ink: '#0B0B0F',
    paper: '#FFF8EA',
};

export const ComicCardDark = ({ children, style, ...rest }) => (
    <motion.div
        style={{
            background: 'rgba(24, 24, 34, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '3px solid #0B0B0F',
            boxShadow: '4px 4px 0 #0B0B0F',
            borderRadius: 16,
            padding: 16,
            position: 'relative',
            ...style,
        }}
        {...rest}
    >
        {children}
    </motion.div>
);

export const ComicCardPaper = ({ children, style, color = '#FFF8EA', ...rest }) => (
    <motion.div
        style={{
            background: color,
            border: '4px solid #0B0B0F',
            boxShadow: '5px 5px 0 #0B0B0F',
            borderRadius: 18,
            padding: 18,
            color: '#0B0B0F',
            position: 'relative',
            ...style,
        }}
        {...rest}
    >
        {children}
    </motion.div>
);

export const CardLabel = ({ children, color = '#C7B8FF' }) => (
    <div style={{ fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: '0.15em', color }}>
        {children}
    </div>
);

export const Chip = ({ children, color = '#FFE89C' }) => (
    <div style={{
        fontFamily: 'Bangers, cursive',
        fontSize: 12,
        letterSpacing: '0.1em',
        padding: '3px 9px',
        background: color,
        border: '2px solid #0B0B0F',
        borderRadius: 6,
        color: '#0B0B0F',
        display: 'inline-block',
    }}>
        {children}
    </div>
);

export const PageHeader = ({ tag, tagColor = '#B8F2D8', title, subtitle, right }) => (
    <header className="comic-page-header">
        <div>
            {tag && (
                <div style={{
                    display: 'inline-flex', gap: 6, alignItems: 'center',
                    fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: '0.15em',
                    color: tagColor, background: `${tagColor}22`,
                    border: '2px solid #0B0B0F', boxShadow: '2px 2px 0 #0B0B0F',
                    padding: '4px 10px', borderRadius: 8,
                }}>
                    <span style={{ fontSize: 10 }}>●</span><span>{tag}</span>
                </div>
            )}
            <h1 className="comic-page-title">
                {title}
            </h1>
            {subtitle && <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, color: 'rgba(245,245,250,0.6)', margin: 0 }}>{subtitle}</p>}
        </div>
        {right && <div className="comic-page-header-right">{right}</div>}
    </header>
);

export const Mascot = ({ state = 'idle', size = 120 }) => {
    // A placeholder mascot
    const getFace = () => {
        if (state === 'celebrate') return '(≧◡≦)';
        if (state === 'focus') return '(ಠ_ಠ)';
        return '(◕‿◕)';
    };
    return (
        <div style={{
            width: size, height: size,
            background: PALETTE.paper,
            border: '4px solid #0B0B0F',
            borderRadius: '50%',
            boxShadow: '4px 4px 0 #0B0B0F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Grotesk', fontSize: size / 3, fontWeight: 'bold',
            color: '#0B0B0F'
        }}>
            {getFace()}
        </div>
    );
};
