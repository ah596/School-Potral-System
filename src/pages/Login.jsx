import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { LogIn, Bell, ShieldCheck, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showDemo, setShowDemo] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = api.subscribeToNotices((data) => {
            setNotices(data);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await login(id, password);
        if (success) {
            if (id.startsWith('ADM')) navigate('/admin/dashboard');
            else if (id.startsWith('TCH')) navigate('/teacher/dashboard');
            else navigate('/dashboard');
        } else {
            setError('Invalid ID or Password');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    return (
        <div className="login-page">
            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--background);
                    padding: 2rem 1rem;
                }

                .cards-wrapper {
                    display: flex;
                    width: 100%;
                    max-width: 960px; /* Limit max width for better aesthetic */
                    gap: 2rem;
                }
                
                .campus-card, .login-form-card {
                    width: 100%;
                    max-width: 480px; /* Ensure they don't get too wide individually */
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    display: flex;
                    flex-direction: column;
                }
                
                .login-form-card {
                    padding: 2.5rem;
                    box-shadow: var(--shadow-lg);
                }

                /* Desktop Styles */
                @media (min-width: 969px) {
                    .cards-wrapper {
                        flex-direction: row;
                        align-items: flex-start; /* IMPORTANT: Align top, allow independent height */
                    }
                    
                    .campus-card {
                        flex: 1;
                        height: 640px; /* Increased to ensure Login card starts at same visual height */
                    }

                    .login-form-card {
                        flex: 1;
                        min-height: 640px; /* Start at same height */
                        height: auto; /* Allow growth */
                    }

                    .campus-scroll-area {
                        max-height: 640px;
                    }
                }

                /* Mobile Styles */
                @media (max-width: 968px) {
                    .cards-wrapper {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .campus-card {
                        max-height: 450px;
                    }
                    
                    .login-form-card {
                        height: auto;
                    }
                }
            `}</style>

            <div className="cards-wrapper">
                {/* Campus Update Board Card */}
                <div className="campus-card">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <div style={{
                            padding: '0.5rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '50%',
                            color: 'var(--primary)'
                        }}>
                            <Bell size={20} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Campus Updates</h3>
                    </div>

                    <div className="campus-scroll-area" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
                        {selectedNotice ? (
                            <div className="notice-detail animate-fade-in">
                                <button
                                    onClick={() => setSelectedNotice(null)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'transparent', border: 'none',
                                        color: 'var(--text-muted)', cursor: 'pointer',
                                        marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500'
                                    }}
                                >
                                    <ArrowLeft size={16} /> Back to Updates
                                </button>

                                <div style={{ borderLeft: `3px solid ${getPriorityColor(selectedNotice.priority)}`, paddingLeft: '1rem' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{selectedNotice.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>
                                        {selectedNotice.date}
                                    </span>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                                        {selectedNotice.content}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {notices.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        No updates available.
                                    </p>
                                ) : (
                                    notices.map((notice) => (
                                        <div
                                            key={notice.id}
                                            onClick={() => setSelectedNotice(notice)}
                                            style={{
                                                padding: '0.75rem',
                                                background: 'var(--background)',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                borderLeft: `3px solid ${getPriorityColor(notice.priority)}`,
                                                transition: 'all 0.2s',
                                                border: '1px solid transparent',
                                                borderLeftWidth: '3px'
                                            }}
                                            className="notice-item-hover"
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--background)'}
                                        >
                                            <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>{notice.title}</h5>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notice.date}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '500' }}>Read More</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Login Form Card */}
                <div className="login-form-card">
                    <div className="login-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div style={{
                                width: '64px', height: '64px',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                borderRadius: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', boxShadow: 'var(--shadow-lg)'
                            }}>
                                <ShieldCheck size={32} />
                            </div>
                        </div>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: '800',
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(135deg, var(--text-main), var(--primary))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Sign in to access your portal</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee2e2', color: '#ef4444',
                            padding: '1rem', borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem', textAlign: 'center',
                            border: '1px solid #fecaca'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="id" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)' }}>User ID</label>
                            <input
                                type="text"
                                id="id"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="e.g., STU001 or TCH001"
                                required
                                style={{
                                    width: '100%', padding: '0.9rem 1rem',
                                    border: '2px solid var(--border)', borderRadius: 'var(--radius)',
                                    background: 'var(--background)', color: 'var(--text-main)', fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label htmlFor="password" style={{ marginBottom: 0, fontWeight: '600', color: 'var(--text-main)' }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    style={{
                                        width: '100%', padding: '0.9rem 1rem', paddingRight: '40px',
                                        border: '2px solid var(--border)', borderRadius: 'var(--radius)',
                                        background: 'var(--background)', color: 'var(--text-main)', fontSize: '1rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', borderRadius: 'var(--radius)', color: 'white', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', fontSize: '1.05rem' }}>
                            <LogIn className="icon-sm" size={18} />
                            <span>Sign In</span>
                        </button>
                    </form>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowDemo(!showDemo)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline', padding: '0.75rem' }}
                        >
                            {showDemo ? 'Hide Login Info' : 'Show Login Info'}
                        </button>

                        {showDemo && (
                            <div className="demo-credentials animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px dashed var(--border)', width: '100%' }}>
                                <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Demo Credentials:</p>
                                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    <span>Student: <strong>STU001</strong></span>
                                    <span>Teacher: <strong>TCH001</strong></span>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Admin: <strong>ADM001</strong>
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}>Password: <strong>password123</strong> (for Student/Teacher) | <strong>admin123</strong> (for Admin)</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
