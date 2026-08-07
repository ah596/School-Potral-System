import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('A password reset link has been sent to your email. Check your inbox!');
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/user-not-found') {
                setError('No user found with this email in Firebase.');
            } else {
                setError('Failed to send reset email: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-split">
            <div className="notice-board-panel">
                <div className="notice-board-header">
                    <ShieldCheck className="icon" size={32} />
                    <h2>School Portal</h2>
                </div>
                <div className="notice-board-content">
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Secure Access</h3>
                        <p className="notice-text" style={{ textAlign: 'center' }}>
                            We verify your identity through email to ensure your account remains secure.
                        </p>
                    </div>
                </div>
            </div>

            <div className="login-form-panel">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Forgot Password</h2>
                        <p>Enter your email to reset your password</p>
                    </div>

                    {message && (
                        <div style={{
                            background: '#dcfce7', color: '#166534',
                            padding: '1rem', borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem', textAlign: 'center',
                            border: '1px solid #bbf7d0'
                        }}>
                            {message}
                        </div>
                    )}

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
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@school.com"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem' }} disabled={loading}>
                            <Mail className="icon-sm" />
                            <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
                        </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                        <Link
                            to="/login"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '50px',
                                height: '50px',
                                borderRadius: '15px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--primary)',
                                transition: 'all 0.3s',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.background = 'var(--primary)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'var(--surface)';
                                e.currentTarget.style.color = 'var(--primary)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            }}
                            title="Back to Login"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
