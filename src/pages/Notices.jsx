import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Bell, AlertCircle, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';

export default function Notices() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        // Support multiple naming conventions for grade level
        const studentClass = user.gradeLevel || user.grade_level || user.class || user.grade;

        const unsubscribe = api.subscribeToNotices({ targetClass: studentClass || null }, (data) => {
            setNotices(data);
            setLoading(false);
            localStorage.setItem(`last_viewed_notices_${user.id}`, new Date().toISOString());
        });
        return () => unsubscribe();
    }, [user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_notices`]) {
        return <FeatureLocked featureName="Notices" />;
    }

    if (loading) return <LoadingScreen message="Loading Updates..." />;

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return <AlertCircle size={24} />;
            case 'medium': return <Info size={24} />;
            case 'low': return <CheckCircle size={24} />;
            default: return <Bell size={24} />;
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
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem 0', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '45px',
                            height: '45px',
                            borderRadius: '12px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(-3px)';
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.background = 'var(--surface)';
                            e.currentTarget.style.color = 'var(--primary)';
                        }}
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                            Class Updates
                        </h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                            Latest messages from your teachers
                        </p>
                    </div>
                </div>
            </div>


            {
                notices.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <Bell size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                        <h3 style={{ color: 'var(--text-muted)' }}>No updates yet</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Stay tuned for announcements from your class teacher.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {notices.map(notice => (
                            <div key={notice.id} className="card" style={{
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                padding: '2rem'
                            }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        background: `${getPriorityColor(notice.priority || 'medium')}20`,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: getPriorityColor(notice.priority || 'medium'),
                                        flexShrink: 0
                                    }}>
                                        {getPriorityIcon(notice.priority || 'medium')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{notice.title}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>
                                                        By {notice.authorName || 'School Admin'}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>•</span>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {notice.date}
                                                    </span>
                                                    {notice.targetClass && (
                                                        <>
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>•</span>
                                                            <span className="badge" style={{ background: 'var(--background-alt)', color: 'var(--text-main)' }}>
                                                                {notice.targetClass}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', background: 'var(--background-alt)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            {notice.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
