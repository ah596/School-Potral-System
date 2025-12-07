import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function Notices() {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        setNotices(storage.getNotices());
    }, []);

    if (!user) {
        return <Navigate to="/login" />;
    }

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
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                }}>
                    <Bell size={32} />
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Notice Board</h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>
                        {notices.length} announcements
                    </p>
                </div>
            </div>

            {notices.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Bell size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)' }}>No notices available</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Check back later for updates</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {notices.map(notice => (
                        <div key={notice.id} className="card" style={{
                            borderLeft: `4px solid ${getPriorityColor(notice.priority)}`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            }}>
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <div style={{
                                    width: '56px', height: '56px',
                                    background: `${getPriorityColor(notice.priority)}20`,
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: getPriorityColor(notice.priority),
                                    flexShrink: 0
                                }}>
                                    {getPriorityIcon(notice.priority)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>{notice.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                                                <span className="badge" style={{
                                                    background: `${getPriorityColor(notice.priority)}20`,
                                                    color: getPriorityColor(notice.priority)
                                                }}>
                                                    {notice.priority.toUpperCase()} PRIORITY
                                                </span>
                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    {notice.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                                        {notice.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
