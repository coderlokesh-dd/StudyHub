import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import './CustomCursor.css';

export default function CustomCursor() {
    // Check if device is touch or mobile to disable cursor
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isTextMode, setIsTextMode] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

    // Track mouse position
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth springs for the outer ring (slower trailing effect)
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const ringX = useSpring(mouseX, springConfig);
    const ringY = useSpring(mouseY, springConfig);

    // Tighter springs for the inner dot
    const dotConfig = { damping: 30, stiffness: 700, mass: 0.1 };
    const dotX = useSpring(mouseX, dotConfig);
    const dotY = useSpring(mouseY, dotConfig);

    useEffect(() => {
        // Disable natively on touch devices or small screens
        const checkMobile = () => {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            setIsMobile(isTouch || window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        if (isMobile) return;

        const handleMouseMove = (e) => {
            // Update physical coordinates
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            // Show cursor once initialized inside window
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        // Detect interactive elements globally via event delegation on document
        const handleMouseOver = (e) => {
            const target = e.target;

            // Check if hovering over text inputs
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
            if (isInput && target.type !== 'color' && target.type !== 'checkbox') {
                setIsTextMode(true);
                setIsHovering(false);
                return;
            } else {
                setIsTextMode(false);
            }

            // Check if hovering over clickable/interactive elements
            const isInteractive = target.closest('a') ||
                target.closest('button') ||
                target.closest('.card') ||
                target.closest('.setting-row') ||
                target.closest('.accent-swatch');

            setIsHovering(!!isInteractive);
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('resize', checkMobile);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, [isMobile, isVisible, mouseX, mouseY]);

    // Don't render anything on mobile/touch
    if (isMobile) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: 'none', zIndex: 99999, position: 'fixed', inset: 0 }}
        >
            {/* Outer Ring */}
            <motion.div
                className={`custom-cursor-ring ${isTextMode ? 'text-mode' : ''}`}
                style={{
                    x: ringX,
                    y: ringY,
                    // If text mode, shrink horizontal scale, expand vertical.
                    // If hover mode, expand ring globally.
                    scale: isTextMode ? 1.2 : isHovering ? 1.6 : 1,
                    opacity: isTextMode ? 0.3 : isHovering ? 0.5 : 1,
                    // Animate border color / backdrop based on hover
                }}
                transition={{ type: 'spring', ...springConfig }}
            />

            {/* Inner Dot */}
            <motion.div
                className="custom-cursor-dot"
                style={{
                    x: dotX,
                    y: dotY,
                    // Hide dot completely on text hover, shrink to almost nothing on normal hover
                    scale: isTextMode ? 0 : isHovering ? 0.5 : 1,
                    opacity: isTextMode ? 0 : 1,
                }}
                transition={{ type: 'spring', ...dotConfig }}
            />
        </motion.div>
    );
}
