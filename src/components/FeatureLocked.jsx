import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureLocked = ({ featureName }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--text)',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '2rem',
                borderRadius: '50%',
                marginBottom: '1.5rem',
                color: '#ef4444',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
            }}>
                <Lock size={64} strokeWidth={1.5} />
            </div>
            <h2 style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #ef4444, #f87171)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '800'
            }}>
                Access Locked
            </h2>
            <p style={{
                fontSize: '1.1rem',
                color: 'var(--text-light)',
                maxWidth: '500px',
                marginBottom: '2rem',
                lineHeight: '1.6'
            }}>
                Access to <strong>{featureName}</strong> is currently restricted by the administrator.
                <br />
                Please contact the school office if you need access.
            </p>
            <button
                onClick={() => navigate(-1)}
                style={{
                    padding: '0.8rem 2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
            >
                Return Previous Page
            </button>
        </div>
    );
};

export default FeatureLocked;
