import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

export default function AdminNotices() {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'medium'
    });

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = () => {
        setNotices(storage.getNotices());
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        storage.addNotice({
            ...formData,
            createdBy: user.id
        });
        setFormData({ title: '', content: '', priority: 'medium' });
        loadNotices();
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this notice?')) {
            storage.deleteNotice(id);
            loadNotices();
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

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
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Notice Board Management</h2>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Post New Notice</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows="4"
                            style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)', fontFamily: 'inherit' }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        <Plus size={18} /> Post Notice
                    </button>
                </form>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>All Notices</h3>
                {notices.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No notices posted yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {notices.map(notice => (
                            <div key={notice.id} style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                borderLeft: `4px solid ${getPriorityColor(notice.priority)}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{notice.title}</h4>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                background: `${getPriorityColor(notice.priority)}20`,
                                                color: getPriorityColor(notice.priority)
                                            }}>
                                                {notice.priority.toUpperCase()}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>{notice.content}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Posted on {notice.date}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(notice.id)}
                                        className="btn btn-sm btn-outline"
                                        style={{ color: 'var(--danger)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
