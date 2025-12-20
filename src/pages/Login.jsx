import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showDemo, setShowDemo] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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

    return (
        <div className="login-container">
            <style>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--background);
                    padding: 1rem;
                }
                
                .login-form-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 2.5rem;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border);
                    background: var(--surface);
                    display: flex;
                    flex-direction: column;
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 480px) {
                    .login-form-card {
                        padding: 1.5rem;
                    }
                }
            `}</style>

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
                    <button type="submit" className="btn btn-primary btn-block" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', borderRadius: 'var(--radius)', color: 'white', fontWeight: 'bold', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                        <LogIn className="icon-sm" size={18} />
                        <span>Sign In</span>
                    </button>
                </form>

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'underline' }}
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
    );
}
