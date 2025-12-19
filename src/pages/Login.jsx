import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { LogIn, Bell, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [notices, setNotices] = useState([]);
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
            // Redirect happens in useEffect or we can check role here if login returned user object
            // But for now, let's just redirect to home or dashboard, and let the protected routes handle it
            // Actually, let's check the role from the ID prefix for a quick redirect, or just go to /dashboard and let the router handle it
            // Since we have role-specific dashboards, we should try to go there.
            // But we don't have the user object here immediately available from the hook state update in this closure.
            // Let's rely on the fact that the user is set.

            // A simple hack: check ID prefix
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
        <div className="login-page-split">
            {/* Left Panel: Campus Update Board */}
            <div className="notice-board-panel">
                <div className="notice-board-header">
                    <Bell className="icon" size={32} />
                    <h2>Campus Update Board</h2>
                </div>
                <div className="notice-board-content">
                    {notices.length === 0 ? (
                        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: '2rem' }}>
                            No updates at the moment.
                        </p>
                    ) : (
                        notices.map((notice) => (
                            <div key={notice.id} className="notice-item-board" style={{ borderLeft: `4px solid ${getPriorityColor(notice.priority)}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontWeight: '700' }}>{notice.title}</h4>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.8, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{notice.date}</span>
                                </div>
                                <p className="notice-text">{notice.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="login-form-panel">
                <div className="login-card">
                    <div className="login-header">
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
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your portal</p>
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
                        <div className="form-group">
                            <label htmlFor="id">User ID</label>
                            <input
                                type="text"
                                id="id"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder="e.g., STU001 or TCH001"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
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
                                    style={{ paddingRight: '40px', width: '100%' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem' }}>
                            <LogIn className="icon-sm" />
                            <span>Sign In</span>
                        </button>
                    </form>

                    <div className="demo-credentials">
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
                </div>
            </div>
        </div>
    );
}
