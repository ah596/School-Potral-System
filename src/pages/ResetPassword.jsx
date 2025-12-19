import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password reset successfully. Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="login-page-split">
                <div className="login-form-panel">
                    <div className="login-card">
                        <div className="login-header">
                            <h2>Invalid Request</h2>
                            <p>No reset token provided. Please use the link from your email.</p>
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <Link to="/login" className="btn btn-primary btn-block">Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="login-page-split">
            <div className="notice-board-panel">
                <div className="notice-board-header">
                    <ShieldCheck className="icon" size={32} />
                    <h2>School Portal</h2>
                </div>
                <div className="notice-board-content">
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Lock size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                        <h3 style={{ marginBottom: '1rem' }}>Create New Password</h3>
                        <p className="notice-text" style={{ textAlign: 'center' }}>
                            Ensure your new password is strong and unique.
                        </p>
                    </div>
                </div>
            </div>

            <div className="login-form-panel">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Reset Password</h2>
                        <p>Enter your new password below</p>
                    </div>

                    {message && (
                        <div style={{
                            background: '#dcfce7', color: '#166534',
                            padding: '1rem', borderRadius: 'var(--radius)',
                            marginBottom: '1.5rem', textAlign: 'center',
                            border: '1px solid #bbf7d0'
                        }}>
                            <CheckCircle size={20} style={{ display: 'inline', marginRight: '5px' }} />
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

                    {!message && (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '1rem' }} disabled={loading}>
                                <Lock className="icon-sm" />
                                <span>{loading ? 'Updating...' : 'Update Password'}</span>
                            </button>
                        </form>
                    )}

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
