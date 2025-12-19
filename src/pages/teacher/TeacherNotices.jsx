import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Trash2, ArrowLeft, MessageSquare, Megaphone, Bell, Edit2, X } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function TeacherNotices() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'medium',
        targetClass: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'teacher') return;

        const loadTeacherData = async () => {
            try {
                const classesData = await api.getTeacherClasses(user.id);
                setAssignedClasses(classesData);
                if (classesData.length > 0 && !editingId) {
                    setFormData(prev => ({ ...prev, targetClass: classesData[0].name }));
                }
            } catch (error) {
                console.error("Failed to load teacher classes", error);
            }
        };

        loadTeacherData();

        // Subscribe to notices (all for now, we'll filter them in rendering)
        const unsubscribe = api.subscribeToNotices(null, (data) => {
            const teacherNotices = data.filter(n => n.authorId === user.id);
            setNotices(teacherNotices);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, editingId]);

    const handleEditInitial = (notice) => {
        setEditingId(notice.id);
        setFormData({
            title: notice.title,
            content: notice.content,
            priority: notice.priority || 'medium',
            targetClass: notice.targetClass
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        if (assignedClasses.length > 0) {
            setFormData({
                title: '',
                content: '',
                priority: 'medium',
                targetClass: assignedClasses[0].name
            });
        } else {
            setFormData({ title: '', content: '', priority: 'medium', targetClass: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsPosting(true);
        try {
            if (editingId) {
                await api.updateNotice(editingId, {
                    ...formData,
                    type: 'class', // Ensure type is preserved as class
                    updatedAt: new Date().toISOString()
                });
                alert("Update modified successfully!");
            } else {
                await api.addNotice({
                    ...formData,
                    type: 'class',
                    authorId: user.id,
                    authorName: user.name,
                    date: new Date().toISOString().split('T')[0]
                });
                alert("Update posted successfully!");
            }
            resetForm();
        } catch (error) {
            console.error("Failed to save update", error);
            alert("Failed to save update");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this update? Students will no longer see it.')) {
            try {
                await api.deleteNotice(id);
                if (editingId === id) resetForm();
            } catch (error) {
                console.error("Failed to delete notice", error);
            }
        }
    };

    if (!user || user.role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Updates..." />;

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
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '45px', height: '45px', borderRadius: '12px',
                            background: 'var(--surface)', border: '1px solid var(--border)',
                            color: 'var(--primary)', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: 'var(--text)' }}>Class Updates</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Message your assigned classes</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
                {/* Post/Edit Update */}
                <div>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {editingId ? <Edit2 color="var(--primary)" size={24} /> : <Megaphone color="var(--primary)" size={24} />}
                                <h3 style={{ margin: 0 }}>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
                            </div>
                            {editingId && (
                                <button
                                    onClick={resetForm}
                                    style={{
                                        background: 'var(--background-alt)', border: 'none', borderRadius: '50%',
                                        width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)'
                                    }}
                                    title="Cancel Edit"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Target Class</label>
                                <select
                                    value={formData.targetClass}
                                    onChange={(e) => setFormData({ ...formData, targetClass: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)' }}
                                >
                                    {assignedClasses.map((cls) => (
                                        <option key={cls.id} value={cls.name}>
                                            {cls.name} {cls.section ? `- ${cls.section}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Upcoming Test, Holiday Notice"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Update Message</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    rows="4"
                                    placeholder="Write your message here..."
                                    required
                                    style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Importance</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['low', 'medium', 'high'].map(p => (
                                        <label key={p} style={{ flex: 1, cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="priority"
                                                value={p}
                                                checked={formData.priority === p}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{
                                                padding: '0.75rem', textAlign: 'center', borderRadius: '12px',
                                                border: `2px solid ${formData.priority === p ? getPriorityColor(p) : 'var(--border)'}`,
                                                background: formData.priority === p ? `${getPriorityColor(p)}15` : 'transparent',
                                                color: formData.priority === p ? getPriorityColor(p) : 'var(--text-muted)',
                                                fontWeight: '700', textTransform: 'capitalize', transition: 'all 0.2s'
                                            }}>
                                                {p}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isPosting}>
                                {isPosting ? 'Processing...' : (editingId ? 'Update Announcement' : 'Post Update')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div>
                    <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Bell size={24} /> Sent Updates
                    </h3>
                    {notices.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>You haven't posted any updates yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notices.map(notice => (
                                <div key={notice.id} className="card" style={{
                                    background: editingId === notice.id ? `${getPriorityColor(notice.priority)}05` : 'var(--surface)',
                                    border: editingId === notice.id ? `2px solid ${getPriorityColor(notice.priority)}` : '1px solid var(--border)',
                                    transition: 'all 0.2s'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <span className="badge" style={{ background: 'var(--primary)15', color: 'var(--primary)' }}>{notice.targetClass}</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{notice.date}</span>
                                            </div>
                                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: '800' }}>{notice.title}</h4>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{notice.content}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEditInitial(notice)}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.5rem' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
