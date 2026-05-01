import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../utils/api';

export default function SharedNote() {
    const { token } = useParams();
    const [state, setState] = useState({ status: 'loading', note: null });

    useEffect(() => {
        let cancelled = false;
        api.fetchSharedNote(token)
            .then(note => {
                if (cancelled) return;
                setState({ status: note ? 'ok' : 'missing', note });
            })
            .catch(() => {
                if (cancelled) return;
                setState({ status: 'error', note: null });
            });
        return () => { cancelled = true; };
    }, [token]);

    const download = () => {
        const { note } = state;
        if (!note) return;
        const text = `${note.title}\n\n${note.content}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title || 'shared-note'}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (state.status === 'loading') {
        return <div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>;
    }
    if (state.status === 'error') {
        return <div style={{ padding: 24, textAlign: 'center' }}>Could not load shared note.</div>;
    }
    if (state.status === 'missing' || !state.note) {
        return <div style={{ padding: 24, textAlign: 'center' }}>Shared note not found. The link may have been revoked.</div>;
    }

    const { note } = state;
    return (
        <div style={{ padding: '32px 24px', maxWidth: 720, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <h1 style={{ marginTop: 0 }}>{note.title}</h1>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: 16, lineHeight: 1.6 }}>
                {note.content}
            </pre>
            <button
                onClick={download}
                style={{
                    marginTop: 24, padding: '10px 20px',
                    border: '3px solid #0B0B0F', borderRadius: 10,
                    background: '#FFE89C', color: '#0B0B0F', boxShadow: '4px 4px 0 #0B0B0F',
                    cursor: 'pointer', fontWeight: 600, fontSize: 15,
                }}
            >
                Download .txt
            </button>
        </div>
    );
}
