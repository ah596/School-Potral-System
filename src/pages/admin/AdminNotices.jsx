import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Trash2, ArrowLeft, Bell, AlertTriangle, Info, CheckCircle, Edit2, X, Save } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

const PRIORITY_CONFIG = {
    High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: AlertTriangle, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Bell,          gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    Low:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle,   gradient: 'linear-gradient(135deg,#10b981,#059669)' },
};

export default function AdminNotices() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', priority: 'Medium', audience: 'all' });

    useEffect(() => {
        const unsubscribe = api.subscribeToNotices((data) => { setNotices(data); setLoading(false); });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async () => {
        if (!formData.title || !formData.content) { alert('Title and content are required'); return; }
        try {
            if (editingId) {
                await api.updateNotice(editingId, { ...formData, authorId: user.id, authorName: user.name, date: new Date().toISOString().split('T')[0] });
            } else {
                await api.addNotice({ ...formData, authorId: user.id, authorName: user.name || 'School Admin', type: 'global', date: new Date().toISOString().split('T')[0] });
            }
            setFormData({ title: '', content: '', priority: 'Medium', audience: 'all' });
            setIsAdding(false); setEditingId(null);
        } catch (err) { alert('Failed to save notice'); }
    };

    const handleEdit = (notice) => {
        setEditingId(notice.id);
        setFormData({ title: notice.title, content: notice.content, priority: notice.priority || 'Medium', audience: notice.audience || 'all' });
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this notice?')) {
            try { await api.deleteNotice(id); } catch (err) { alert('Failed to delete notice'); }
        }
    };

    if (!user || user.role !== 'admin') return <Navigate to="/login" />;
    if (loading) return <LoadingScreen message="Loading Notices..." />;

    const highCount = notices.filter(n => (n.priority || '').toLowerCase() === 'high').length;
    const medCount  = notices.filter(n => (n.priority || '').toLowerCase() === 'medium').length;
    const lowCount  = notices.filter(n => (n.priority || '').toLowerCase() === 'low').length;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '3rem' }}>
            <style>{`
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                .notice-card { animation: fadeUp 0.4s ease forwards; opacity:0; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
                .notice-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.1) !important; }
                .action-btn { transition: all 0.2s; border-radius: 10px; padding: 0.45rem; border: 1px solid var(--border); background: var(--background); cursor: pointer; display:flex; align-items:center; justify-content:center; }
                .action-btn:hover { transform: scale(1.1); }
            `}</style>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)', padding: '2rem 0', marginBottom: '2rem' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => navigate(-1)} style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bell size={20} color="white" />
                                    </div>
                                    <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Notice Board</h1>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0.2rem 0 0', fontSize: '0.85rem' }}>{notices.length} notices posted</p>
                            </div>
                        </div>
                        {!isAdding && (
                            <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ title: '', content: '', priority: 'Medium', audience: 'all' }); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', borderRadius: 12, background: 'white', color: '#4f46e5', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <Plus size={18} /> Post Notice
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container">

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                        { label: 'Total Notices', value: notices.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
                        { label: 'High Priority', value: highCount, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
                        { label: 'Medium', value: medCount, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
                        { label: 'Low Priority', value: lowCount, gradient: 'linear-gradient(135deg,#10b981,#059669)' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: s.gradient, borderRadius: 16, padding: '1.25rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                            <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '0.3rem', fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Add/Edit Form */}
                {isAdding && (
                    <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', marginBottom: '2rem', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', padding: '1.25rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {editingId ? <Edit2 size={18} color="white" /> : <Bell size={18} color="white" />}
                            </div>
                            <h3 style={{ margin: 0, color: 'white', fontWeight: 700 }}>{editingId ? 'Edit Notice' : 'Post New Notice'}</h3>
                        </div>
                        <div style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title *</label>
                                    <input type="text" value={formData.title} placeholder="Notice title..." onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid var(--border)', borderRadius: 12, background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }}
                                        onFocus={e => e.target.style.borderColor = '#ef4444'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</label>
                                    <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid var(--border)', borderRadius: 12, background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }}
                                        onFocus={e => e.target.style.borderColor = '#ef4444'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                                        <option value="High">🔴 High</option>
                                        <option value="Medium">🟡 Medium</option>
                                        <option value="Low">🟢 Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audience</label>
                                    <select value={formData.audience} onChange={e => setFormData({ ...formData, audience: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid var(--border)', borderRadius: 12, background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }}
                                        onFocus={e => e.target.style.borderColor = '#ef4444'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                                        <option value="all">👥 Everyone</option>
                                        <option value="student">🎓 Students Only</option>
                                        <option value="teacher">👨‍🏫 Teachers Only</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Content *</label>
                                    <textarea value={formData.content} placeholder="Write your notice here..." rows={4} onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '2px solid var(--border)', borderRadius: 12, background: 'var(--surface)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                        onFocus={e => e.target.style.borderColor = '#ef4444'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#f97316)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <Save size={16} /> {editingId ? 'Update Notice' : 'Post Notice'}
                                </button>
                                <button onClick={() => { setIsAdding(false); setEditingId(null); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: 12, background: 'var(--background)', color: 'var(--text-main)', border: '2px solid var(--border)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notices List */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>All Notices</h3>
                    <span style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', color: 'white', fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: 50 }}>{notices.length} Total</span>
                </div>

                {notices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--surface)', borderRadius: 20, border: '2px dashed var(--border)' }}>
                        <Bell size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
                        <h3 style={{ color: 'var(--text-muted)', fontWeight: 700 }}>No Notices Yet</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Post your first notice for students and teachers.</p>
                        <button onClick={() => setIsAdding(true)} style={{ marginTop: '1rem', padding: '0.7rem 1.4rem', borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#f97316)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                            Post First Notice
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {notices.map((notice, i) => {
                            const priority = notice.priority || 'Medium';
                            const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
                            const IconComp = cfg.icon;
                            return (
                                <div key={notice.id} className="notice-card" style={{ background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', animationDelay: `${i * 0.04}s` }}>
                                    <div style={{ display: 'flex', gap: 0 }}>
                                        {/* Left accent bar */}
                                        <div style={{ width: 5, background: cfg.gradient, flexShrink: 0 }} />

                                        <div style={{ flex: 1, padding: '1.1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    {/* Title row */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>{notice.title}</h4>
                                                        <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 50, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                                                            <IconComp size={10} /> {priority}
                                                        </span>
                                                        {notice.audience && notice.audience !== 'all' && (
                                                            <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50, flexShrink: 0 }}>
                                                                {notice.audience === 'student' ? '🎓 Students' : '👨‍🏫 Teachers'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{notice.content}</p>
                                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📅 {notice.date}</span>
                                                        {notice.author_name && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✍️ {notice.author_name}</span>}
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                                    <button onClick={() => handleEdit(notice)} className="action-btn" title="Edit" style={{ color: '#6366f1' }}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(notice.id)} className="action-btn" title="Delete" style={{ color: '#ef4444' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
