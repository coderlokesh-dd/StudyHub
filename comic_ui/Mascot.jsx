// Mascot.jsx — comic-style bean mascot that reacts to state
// States: idle, focus (eyes closed, meditating), break (chilling), celebrate (arms up)

const Mascot = ({ state = 'idle', size = 140, palette = {} }) => {
  const bodyColor = palette.body || '#C7B8FF';
  const accentColor = palette.accent || '#FFB5B5';
  const ink = '#0B0B0F';

  // Eye/mouth paths vary by state
  const renderFace = () => {
    switch (state) {
      case 'focus':
        return (
          <>
            {/* Closed meditative eyes */}
            <path d="M 40 58 Q 50 54 60 58" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 80 58 Q 90 54 100 58" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Tiny smile */}
            <path d="M 60 78 Q 70 82 80 78" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Cheeks */}
            <ellipse cx="36" cy="72" rx="6" ry="4" fill={accentColor} opacity="0.8" />
            <ellipse cx="104" cy="72" rx="6" ry="4" fill={accentColor} opacity="0.8" />
            {/* Zzz floating */}
            <text x="108" y="30" fontFamily="Bangers, cursive" fontSize="22" fill={ink}>z</text>
            <text x="118" y="18" fontFamily="Bangers, cursive" fontSize="16" fill={ink}>z</text>
          </>
        );
      case 'break':
        return (
          <>
            {/* Happy squint eyes */}
            <path d="M 38 60 Q 48 66 58 60" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 82 60 Q 92 66 102 60" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Big grin */}
            <path d="M 54 78 Q 70 92 86 78" stroke={ink} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 54 78 Q 70 82 86 78" fill={accentColor} />
            <ellipse cx="36" cy="72" rx="6" ry="4" fill={accentColor} opacity="0.8" />
            <ellipse cx="104" cy="72" rx="6" ry="4" fill={accentColor} opacity="0.8" />
          </>
        );
      case 'celebrate':
        return (
          <>
            {/* Star eyes */}
            <g transform="translate(48, 60)">
              <path d="M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z" fill={ink} />
            </g>
            <g transform="translate(92, 60)">
              <path d="M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z" fill={ink} />
            </g>
            {/* Open mouth */}
            <ellipse cx="70" cy="82" rx="10" ry="7" fill={ink} />
            <ellipse cx="70" cy="84" rx="7" ry="4" fill={accentColor} />
            <ellipse cx="36" cy="74" rx="6" ry="4" fill={accentColor} opacity="0.8" />
            <ellipse cx="104" cy="74" rx="6" ry="4" fill={accentColor} opacity="0.8" />
          </>
        );
      default: // idle
        return (
          <>
            {/* Open round eyes */}
            <circle cx="48" cy="60" r="5" fill={ink} />
            <circle cx="92" cy="60" r="5" fill={ink} />
            <circle cx="50" cy="58" r="1.5" fill="#fff" />
            <circle cx="94" cy="58" r="1.5" fill="#fff" />
            {/* Small smile */}
            <path d="M 60 80 Q 70 86 80 80" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="36" cy="74" rx="6" ry="4" fill={accentColor} opacity="0.8" />
            <ellipse cx="104" cy="74" rx="6" ry="4" fill={accentColor} opacity="0.8" />
          </>
        );
    }
  };

  const renderArms = () => {
    if (state === 'celebrate') {
      return (
        <>
          <path d="M 22 78 Q 8 50 14 30" stroke={ink} strokeWidth="3" fill={bodyColor} strokeLinejoin="round" />
          <path d="M 118 78 Q 132 50 126 30" stroke={ink} strokeWidth="3" fill={bodyColor} strokeLinejoin="round" />
          <circle cx="14" cy="30" r="8" fill={bodyColor} stroke={ink} strokeWidth="3" />
          <circle cx="126" cy="30" r="8" fill={bodyColor} stroke={ink} strokeWidth="3" />
        </>
      );
    }
    return (
      <>
        <path d="M 22 88 Q 10 98 12 112" stroke={ink} strokeWidth="3" fill={bodyColor} strokeLinejoin="round" />
        <path d="M 118 88 Q 130 98 128 112" stroke={ink} strokeWidth="3" fill={bodyColor} strokeLinejoin="round" />
        <circle cx="12" cy="112" r="7" fill={bodyColor} stroke={ink} strokeWidth="3" />
        <circle cx="128" cy="112" r="7" fill={bodyColor} stroke={ink} strokeWidth="3" />
      </>
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" style={{ overflow: 'visible' }}>
      {/* Shadow */}
      <ellipse cx="70" cy="130" rx="42" ry="5" fill="rgba(0,0,0,0.25)" />
      {/* Arms behind body for celebrate, in front otherwise handled by order */}
      {renderArms()}
      {/* Body (rounded bean) */}
      <path
        d="M 70 18 C 40 18 22 40 22 70 C 22 100 40 122 70 122 C 100 122 118 100 118 70 C 118 40 100 18 70 18 Z"
        fill={bodyColor}
        stroke={ink}
        strokeWidth="3.5"
      />
      {/* Belly highlight (ben-day dot texture) */}
      <circle cx="70" cy="90" r="28" fill={accentColor} opacity="0.25" />
      {/* Face */}
      {renderFace()}
      {/* Headband for focus state */}
      {state === 'focus' && (
        <g>
          <rect x="24" y="38" width="92" height="10" fill={accentColor} stroke={ink} strokeWidth="3" rx="2" />
          <circle cx="30" cy="43" r="2" fill={ink} />
          <circle cx="110" cy="43" r="2" fill={ink} />
        </g>
      )}
    </svg>
  );
};

window.Mascot = Mascot;
