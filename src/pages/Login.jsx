import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Bell, Eye, EyeOff, ArrowLeft, ArrowRight, User, Lock, GraduationCap, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showAllNotices, setShowAllNotices] = useState(false);
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
        try {
            const userData = await api.login(id, password);
            if (userData) {
                await login(id, password);
                toast.success('Successfully logged in!');
                const role = userData.role;
                if (role === 'super_admin') navigate('/super-admin/dashboard');
                else if (role === 'admin') navigate('/admin/dashboard');
                else if (role === 'teacher') navigate('/teacher/dashboard');
                else navigate('/dashboard');
            }
        } catch (err) {
            const errorMsg = err.message || 'Invalid ID or Password';
            setError(errorMsg);
            toast.error(errorMsg);
        }
    };

    return (
        <div className="split-layout">
            <style>{`
                :root {
                    --brand-dark: #1e293b;
                    --brand-blue: #1e1b4b; /* Deep blue from mockup */
                    --brand-blue-hover: #312e81;
                }
                .split-layout {
                    display: flex;
                    height: 100vh;
                    max-height: 100vh;
                    overflow: hidden;
                    font-family: 'Inter', system-ui, sans-serif;
                    background: #f8fafc;
                }
                
                /* Left Side - Visuals */
                .split-left {
                    flex: 1.1;
                    position: relative;
                    background-image: url('/campus-bg.png');
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    flex-direction: column;
                    color: white;
                    overflow: hidden;
                }
                .left-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(30, 27, 75, 0.4) 100%);
                    z-index: 1;
                }
                .left-content {
                    position: relative;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 3rem 2.5rem;
                    height: 100%;
                    justify-content: space-between;
                    overflow: hidden;
                }

                .welcome-section {
                    margin-bottom: 1.5rem;
                    max-width: 600px;
                }
                .welcome-title {
                    font-size: 2.8rem;
                    font-weight: 800;
                    line-height: 1.1;
                    margin: 0 0 0.75rem 0;
                    letter-spacing: -0.02em;
                }
                .welcome-subtitle {
                    font-size: 1.125rem;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.6;
                    margin: 0;
                }

                /* Glass Notice Board */
                .glass-board {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: none;
                    border-radius: 16px;
                    padding: 1.25rem 1.5rem;
                    max-width: 600px;
                }
                .glass-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }
                .glass-header h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .new-badge {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
                .notice-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.85rem;
                    max-height: 160px;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }
                /* Custom scrollbar for notice-list */
                .notice-list::-webkit-scrollbar { width: 4px; }
                .notice-list::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
                .notice-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
                .notice-row {
                    display: flex;
                    gap: 1.5rem;
                    align-items: flex-start;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .notice-row:hover {
                    transform: translateX(4px);
                }
                .notice-date-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 45px;
                }
                .notice-day {
                    font-size: 1.5rem;
                    font-weight: 700;
                    line-height: 1;
                }
                .notice-month {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: rgba(255, 255, 255, 0.7);
                    margin-top: 2px;
                }
                .notice-content {
                    flex: 1;
                }
                .notice-tag {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 4px;
                    display: block;
                }
                .notice-title {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 500;
                    color: white;
                }
                .view-all {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 2rem;
                    color: rgba(255, 255, 255, 0.9);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                    transition: color 0.2s;
                    cursor: pointer;
                }
                .view-all:hover {
                    color: white;
                }

                /* Right Side - Form */
                .split-right {
                    flex: 0.9;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }
                .form-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    overflow-y: auto;
                }
                .login-card {
                    width: 100%;
                    max-width: 420px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
                    border: 1px solid rgba(0,0,0,0.05);
                    padding: 2rem 2.5rem;
                }
                .login-icon-wrap {
                    width: 56px;
                    height: 56px;
                    background: #eef2ff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1rem;
                }
                .login-title {
                    text-align: center;
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--brand-dark);
                    margin: 0 0 0.5rem 0;
                }
                .login-subtitle {
                    text-align: center;
                    color: #64748b;
                    font-size: 0.95rem;
                    margin: 0 0 1.5rem 0;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .form-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--brand-dark);
                }
                .input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 0.875rem;
                    color: #94a3b8;
                    pointer-events: none;
                    z-index: 1;
                    flex-shrink: 0;
                }
                .login-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: var(--brand-dark);
                    transition: all 0.2s;
                    background: #f8fafc;
                    box-sizing: border-box;
                }
                .login-input:-webkit-autofill,
                .login-input:-webkit-autofill:hover,
                .login-input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0px 1000px #f8fafc inset;
                    box-shadow: 0 0 0px 1000px #f8fafc inset;
                    border: 1px solid #e2e8f0;
                }
                .login-input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }
                .input-action {
                    position: absolute;
                    right: 1rem;
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                }
                .remember-wrap {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                }
                .remember-wrap input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--brand-blue);
                    cursor: pointer;
                }
                .remember-wrap label {
                    font-size: 0.875rem;
                    color: #64748b;
                    cursor: pointer;
                }
                .submit-btn {
                    width: 100%;
                    padding: 1rem;
                    background: var(--brand-blue);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .submit-btn:hover {
                    background: var(--brand-blue-hover);
                }
                .help-link {
                    text-align: center;
                    margin-top: 1rem;
                    font-size: 0.875rem;
                    color: #64748b;
                }
                .help-link a {
                    color: #4f46e5;
                    text-decoration: none;
                    font-weight: 500;
                }
                .help-link a:hover {
                    text-decoration: underline;
                }

/* Mobile Responsiveness */
                @media (max-width: 992px) {
                    .split-layout {
                        flex-direction: column;
                        height: auto;
                        max-height: none;
                        overflow: auto;
                    }
                    .split-left {
                        flex: none;
                        min-height: 60vh;
                    }
                    .split-right {
                        flex: none;
                    }
                }
                @media (max-width: 480px) {
                    .left-content { padding: 1.5rem; }
                    .welcome-title { font-size: 2.5rem; }
                    .glass-board { padding: 1.5rem; }
                    .login-card { padding: 2rem 1.5rem; border-radius: 0; border: none; box-shadow: none; }
                }
            `}</style>

            <div className="split-left">
                <div className="left-overlay"></div>
                <div className="left-content">
                    
                    <div className="welcome-section">
                        <h1 className="welcome-title">Welcome to your Digital Campus.</h1>
                        <p className="welcome-subtitle">
                            Access your courses, connect with peers, and manage your academic journey from one central hub.
                        </p>
                    </div>

                    <div className="glass-board">
                        {selectedNotice ? (
                            <div className="notice-detail animate-fade-in">
                                <button
                                    onClick={() => setSelectedNotice(null)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        background: 'transparent', border: 'none',
                                        color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
                                        marginBottom: '1rem', fontSize: '0.9rem', padding: 0
                                    }}
                                >
                                    <ArrowLeft size={16} /> Back to Updates
                                </button>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{selectedNotice.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '1rem' }}>
                                        {selectedNotice.date}
                                    </span>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'rgba(255,255,255,0.9)' }}>
                                        {selectedNotice.content}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="glass-header">
                                    <h3><Bell size={20} /> Notice Board</h3>
                                    <span className="new-badge">{notices.length} New</span>
                                </div>
                                
                                <div className="notice-list">
                                    {notices.length === 0 ? (
                                        <p style={{ color: 'rgba(255,255,255,0.7)' }}>No notices available.</p>
                                    ) : (
                                        notices.slice(0, showAllNotices ? notices.length : 3).map((notice, idx) => {
                                            // Mock parsing date to Day/Month for UI
                                            const d = new Date(notice.date || notice.timestamp || Date.now());
                                            const day = d.getDate();
                                            const month = d.toLocaleString('en-US', { month: 'short' });
                                            // Extract tag based on title or random for aesthetic
                                            let tag = "ACADEMIC";
                                            if (notice.title.toLowerCase().includes('fee') || notice.title.toLowerCase().includes('admin')) tag = "ADMIN";
                                            else if (notice.title.toLowerCase().includes('event') || notice.title.toLowerCase().includes('party')) tag = "SOCIAL";
                                            else if (notice.priority === 'high') tag = "URGENT";

                                            return (
                                                <div key={idx} className="notice-row" onClick={() => setSelectedNotice(notice)}>
                                                    <div className="notice-date-block">
                                                        <span className="notice-day">{day}</span>
                                                        <span className="notice-month">{month}</span>
                                                    </div>
                                                    <div className="notice-content">
                                                        <span className="notice-tag">{tag}</span>
                                                        <h4 className="notice-title">{notice.title}</h4>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                                {notices.length > 3 && (
                                    <div className="view-all" onClick={() => setShowAllNotices(!showAllNotices)}>
                                        {showAllNotices ? 'Show Less' : 'View All Notices'} <ArrowRight size={16} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="split-right">
                <div className="form-container">
                    <div className="login-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <img src="/logo.png" alt="School Logo" style={{ width: '4rem', height: '4rem', objectFit: 'contain' }} />
                            <h2 className="login-title" style={{ margin: 0 }}>Sign In</h2>
                        </div>
                        <p className="login-subtitle">Enter your credentials to access the portal</p>
                        
                        {error && (
                            <div style={{
                                background: '#fee2e2', color: '#ef4444',
                                padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem',
                                marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">User ID or Email</label>
                                <div className="input-wrap">
                                    <User size={18} className="input-icon" />
                                    <input 
                                        type="text" 
                                        className="login-input" 
                                        placeholder="e.g. student@school.edu" 
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div className="form-label">
                                    <span>Password</span>
                                    <a href="#" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.8rem' }} onClick={(e) => { e.preventDefault(); toast('Password reset link sent to your admin.'); }}>Forgot Password?</a>
                                </div>
                                <div className="input-wrap">
                                    <Lock size={18} className="input-icon" />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="login-input" 
                                        placeholder="••••••••" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="input-action"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="remember-wrap">
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Remember me on this device</label>
                            </div>

                            <button type="submit" className="submit-btn">
                                Sign In
                            </button>
                        </form>

                        <div className="help-link">
                            Need help accessing your account?<br />
                            <a href="#" onClick={(e) => { e.preventDefault(); toast('Please contact support@school.edu'); }}>Contact IT Support</a>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
