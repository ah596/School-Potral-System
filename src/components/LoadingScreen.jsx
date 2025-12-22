import React from 'react';
import { Loader } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--background)', // Adaptive background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: 'var(--text-main)',
            backdropFilter: 'blur(10px)', // Add glass effect if partly transparent
            transition: 'background-color 0.3s, color 0.3s'
        }}>
            <Loader size={64} className="spin" style={{ marginBottom: '1.5rem', color: 'var(--primary)', opacity: 0.9 }} />
            <h2 style={{
                fontSize: '2rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-sans)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>
                {message}
            </h2>
        </div>
    );
}
