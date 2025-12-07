import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Trash2, Users, BookOpen, Save, X } from 'lucide-react';

export default function AdminClasses() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
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
        try {
            const [classesData, teachersData] = await Promise.all([
                api.getClasses(),
                api.getTeachers()
            ]);
            setClasses(classesData);
            setTeachers(teachersData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleAddClass = async () => {
        try {
            await api.addClass(formData);
            await loadData();
            setIsAdding(false);
            setFormData({
                name: '',
                section: '',
                classTeacherId: '',
                roomNumber: '',
                capacity: 40
            });
        } catch (error) {
            console.error('Failed to add class:', error);
            alert('Failed to add class');
        }
    };

    const handleDeleteClass = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.deleteClass(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete class:', error);
                alert('Failed to delete class');
            }
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Manage Classes</h2>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary">
                        <Plus size={20} /> Add New Class
                    </button>
                )}
            </div>

            {/* Add Class Form */}
            {isAdding && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Add New Class</h3>
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
                        <button onClick={handleAddClass} className="btn btn-primary">
                            <Save size={18} /> Save Class
                        </button>
                        <button onClick={() => setIsAdding(false)} className="btn btn-outline">
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Classes List */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table">
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
                                            <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
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
                                        <td>{cls.room_number || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <BookOpen size={16} color="var(--success)" />
                                                {cls.student_count || 0}
                                            </div>
                                        </td>
                                        <td>{cls.capacity}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteClass(cls.id)}
                                                className="btn btn-sm btn-outline"
                                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
