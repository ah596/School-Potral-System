import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Bell, ShieldCheck } from 'lucide-react';

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

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

    return (
        <div className="login-page-split">
            {/* Left Panel: Notice Board */}
            <div className="notice-board-panel">
                <div className="notice-board-header">
                    <Bell className="icon" size={32} />
                    <h2>Campus Updates</h2>
                </div>
                <div className="notice-board-content">
                    <div className="notice-item-board">
                        <h4 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>Fee Deadline Approaching</h4>
                        <p className="notice-text">Please note that fee submission deadline is May 30, 2025. Late fees will apply after this date.</p>
                    </div>
                    <div className="notice-item-board">
                        <h4 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>Attendance Policy</h4>
                        <p className="notice-text">All students are required to maintain a minimum of 80% attendance to be eligible for final exams.</p>
                    </div>
                    <div className="notice-item-board">
                        <h4 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>University Ranking</h4>
                        <p className="notice-text">We are proud to announce our inclusion in the "Times Higher Education Impact Ranking 2024".</p>
                    </div>
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
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
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
