import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: '#0f172a', // Dark slate background matching the image
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: 'white' // White text
        }}>
            <Loader size={64} className="spin" style={{ marginBottom: '1.5rem', opacity: 0.9 }} />
            <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-sans)'
            }}>
                {message}
            </h2>
        </div>
    );
}
