import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

export default function AdminStudents() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        gradeLevel: '',
        email: '',
        phone: '',
        password: 'password123'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsData, classesData] = await Promise.all([
                api.getStudents(),
                api.getClasses()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleAdd = () => {
        setIsAdding(true);
        setFormData({
            id: `STU${String(students.length + 1).padStart(3, '0')}`,
            name: '',
            gradeLevel: '',
            email: '',
            phone: '',
            password: 'password123'
        });
    };

    const handleEdit = (student) => {
        setEditingId(student.id);
        setFormData(student);
    };

    const handleSave = async () => {
        try {
            if (isAdding) {
                await api.addStudent(formData);
            } else {
                await api.updateStudent(editingId, formData);
            }
            setIsAdding(false);
            setEditingId(null);
            await loadData();
        } catch (error) {
            console.error('Failed to save student:', error);
            alert('Failed to save student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.deleteStudent(id);
                await loadData();
            } catch (error) {
                console.error('Failed to delete student:', error);
                alert('Failed to delete student');
            }
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    // Get unique class names from the classes (without section)
    const gradeOptions = [...new Set(classes.map(cls => cls.name))];

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Manage Students</h2>
                {!isAdding && (
                    <button onClick={handleAdd} className="btn btn-primary">
                        <Plus size={20} /> Add Student
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{isAdding ? 'Add New Student' : 'Edit Student'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Student ID</label>
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
                            <label>Grade Level / Class</label>
                            <select
                                value={formData.gradeLevel}
                                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                                style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}
                            >
                                <option value="">Select Class</option>
                                {gradeOptions.length === 0 ? (
                                    <option disabled>No classes available - Create classes first</option>
                                ) : (
                                    gradeOptions.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))
                                )}
                            </select>
                            {gradeOptions.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                    Please create classes in "Manage Classes" first
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
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
                                <th>Class</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No students found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                                {student.gradeLevel || student.grade_level || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{student.email || 'N/A'}</td>
                                        <td>{student.phone || 'N/A'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleEdit(student)} className="btn btn-sm btn-outline">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(student.id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }}>
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
