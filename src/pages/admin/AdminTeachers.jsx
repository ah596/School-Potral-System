import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function AdminTeachers() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        subject: '',
        classes: [],
        email: '',
        phone: '',
        salary: '',
        password: 'password123'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [teachersData, classesData] = await Promise.all([
                api.getTeachers(),
                api.getClasses()
            ]);
            setTeachers(teachersData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormData({
            id: `TCH${String(teachers.length + 1).padStart(3, '0')}`,
            name: '',
            subject: '',
            classes: [],
            email: '',
            phone: '',
            salary: '',
            password: 'password123'
        });
    };

    const handleEdit = (teacher) => {
        setEditingId(teacher.id);
        setFormData({ ...teacher, classes: teacher.classes || [] });
    };

    const handleSave = async () => {
        try {
            if (isAdding) {
                await api.addTeacher(formData);
            } else {
                await api.updateTeacher(editingId, formData);
            }
            setIsAdding(false);
            setEditingId(null);
            await loadData();
        } catch (error) {
            console.error('Failed to save teacher:', error);
            alert('Failed to save teacher');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                await api.deleteTeacher(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete teacher:', error);
                alert('Failed to delete teacher');
            }
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const handleClassToggle = (className) => {
        const currentClasses = formData.classes || [];
        if (currentClasses.includes(className)) {
            setFormData({ ...formData, classes: currentClasses.filter(c => c !== className) });
        } else {
            setFormData({ ...formData, classes: [...currentClasses, className] });
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    // Format classes for display: "Class 10 - A"
    const availableClasses = classes.map(cls => `${cls.name} - ${cls.section}`);

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Manage Teachers</h2>
                {!isAdding && (
                    <button onClick={handleAdd} className="btn btn-primary">
                        <Plus size={20} /> Add Teacher
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{isAdding ? 'Add New Teacher' : 'Edit Teacher'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Teacher ID</label>
                            <input
                                type="text"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                disabled={!isAdding}
                            />
                        </div>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Salary ($)</label>
                            <input
                                type="number"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Assign Classes</label>
                        {availableClasses.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                                No classes available. Please create classes first in "Manage Classes".
                            </p>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                {availableClasses.map(className => (
                                    <label key={className} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={(formData.classes || []).includes(className)}
                                            onChange={() => handleClassToggle(className)}
                                        />
                                        {className}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={handleSave} className="btn btn-primary">
                            <Save size={18} /> Save
                        </button>
                        <button onClick={handleCancel} className="btn btn-outline">
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Classes</th>
                                <th>Email</th>
                                <th>Salary</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No teachers found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                teachers.map(teacher => (
                                    <tr key={teacher.id}>
                                        <td>{teacher.id}</td>
                                        <td>{teacher.name}</td>
                                        <td>{teacher.subject}</td>
                                        <td>{(teacher.classes || []).join(', ')}</td>
                                        <td>{teacher.email}</td>
                                        <td>${teacher.salary}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEdit(teacher)} className="btn btn-sm btn-outline">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(teacher.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
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
            </div>
        </div>
    );
}
