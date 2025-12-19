import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Trash2, Users, BookOpen, Save, X, Edit2, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminClasses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        section: '',
        classTeacherId: '',
        roomNumber: '',
        capacity: 40
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [classesData, teachersData] = await Promise.all([
                api.getClasses(),
                api.getTeachers()
            ]);

            // Map teachers to classes
            const joinedClasses = classesData.map(cls => {
                const teacher = teachersData.find(t => t.id === cls.classTeacherId);
                return {
                    ...cls,
                    teacher_name: teacher ? teacher.name : null
                };
            });

            setClasses(joinedClasses);
            setTeachers(teachersData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClass = async () => {
        try {
            if (editingId) {
                await api.updateClass(editingId, formData);
            } else {
                await api.addClass(formData);
            }
            await loadData();
            setIsAdding(false);
            setEditingId(null);
            setFormData({
                name: '',
                section: '',
                classTeacherId: '',
                roomNumber: '',
                capacity: 40
            });
        } catch (error) {
            console.error('Failed to save class:', error);
            alert(`Failed to save class [ID: ${editingId}]: ${error.message}`);
        }
    };

    const handleEditClass = (cls) => {
        setEditingId(cls.id);
        setFormData({
            name: cls.name || '',
            section: cls.section || '',
            classTeacherId: cls.classTeacherId || '',
            roomNumber: cls.roomNumber || cls.room_number || '', // Handle varied naming
            capacity: cls.capacity || 40
        });
        setIsAdding(true);
    };

    const handleDeleteClass = async (id) => {
        if (!id) {
            alert('Cannot delete: Invalid Class ID');
            return;
        }

        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                // Ensure id is a string
                await api.deleteClass(String(id));
                await loadData();
            } catch (error) {
                console.error('Failed to delete class:', error);
                alert(`Failed to delete class: ${error.message}`);
            }
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    if (loading) return <LoadingScreen message="Loading Classes..." />;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 0',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1.5rem'
            }}>
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
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                        Manage Classes
                    </h2>
                </div>
                {!isAdding && (
                    <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', section: '', classTeacherId: '', roomNumber: '', capacity: 40 }); }} className="btn btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.8rem 1.5rem', borderRadius: '12px' }}>
                        <Plus size={20} /> Add New Class
                    </button>
                )}
            </div>

            {/* Add/Edit Class Form */}
            {isAdding && (
                <div className="card" style={{ marginBottom: '2rem', borderLeft: editingId ? '4px solid var(--warning)' : '4px solid var(--primary)' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Class' : 'Add New Class'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Class Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Class 10"
                            />
                        </div>
                        <div className="form-group">
                            <label>Section</label>
                            <input
                                type="text"
                                value={formData.section}
                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                placeholder="e.g. A"
                            />
                        </div>
                        <div className="form-group">
                            <label>Class Teacher</label>
                            <select
                                value={formData.classTeacherId}
                                onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                                style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Room Number</label>
                            <input
                                type="text"
                                value={formData.roomNumber}
                                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                placeholder="e.g. 101"
                            />
                        </div>
                        <div className="form-group">
                            <label>Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleSaveClass} className="btn btn-primary">
                            <Save size={18} /> {editingId ? 'Update Class' : 'Save Class'}
                        </button>
                        <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="btn btn-outline">
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Classes List */}
            <div className="card">
                <style>{`
                    @media (min-width: 768px) {
                        .classes-table-responsive { display: block !important; }
                        .classes-mobile-cards { display: none !important; }
                    }
                `}</style>

                {/* Desktop Table View */}
                <div className="classes-table-responsive table-responsive" style={{ display: 'none' }}>
                    <table className="table" style={{ minWidth: '800px' }}>
                        <thead>
                            <tr>
                                <th>Class Name</th>
                                <th>Section</th>
                                <th>Class Teacher</th>
                                <th>Room</th>
                                <th>Students</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No classes found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                classes.map(cls => (
                                    <tr key={cls.id}>
                                        <td style={{ fontWeight: '600' }}>{cls.name}</td>
                                        <td>
                                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                                {cls.section}
                                            </span>
                                        </td>
                                        <td>
                                            {cls.teacher_name ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Users size={16} color="var(--text-muted)" />
                                                    {cls.teacher_name}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                                            )}
                                        </td>
                                        <td>{cls.room_number || cls.roomNumber || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <BookOpen size={16} color="var(--success)" />
                                                {cls.student_count || cls.studentCount || 0}
                                            </div>
                                        </td>
                                        <td>{cls.capacity}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEditClass(cls)} className="btn btn-sm btn-outline">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteClass(cls.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="classes-mobile-cards" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {classes.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No classes found. Add one to get started.</p>
                    ) : (
                        classes.map(cls => (
                            <div key={cls.id} style={{
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '1rem',
                                background: 'var(--surface)'
                            }}>
                                {/* Class Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: '700' }}>{cls.name}</h4>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            Section {cls.section}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditClass(cls)} className="btn btn-sm btn-primary">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteClass(cls.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Class Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Class Teacher</strong>
                                        <div style={{ fontSize: '0.95rem' }}>
                                            {cls.teacher_name ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Users size={14} /> {cls.teacher_name}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Room</strong>
                                        <div>{cls.room_number || cls.roomNumber || '-'}</div>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Students</strong>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <BookOpen size={14} color="var(--success)" /> {cls.student_count || cls.studentCount || 0}
                                        </span>
                                    </div>
                                    <div>
                                        <strong style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Capacity</strong>
                                        <div>{cls.capacity}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
