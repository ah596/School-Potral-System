import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import FeatureLocked from '../../components/FeatureLocked';

export default function TeacherStudents() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedClass, setSelectedClass] = useState(user?.classes?.[0] || '');
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (selectedClass) {
            setStudents(storage.getStudentsByClass(selectedClass));
        }
    }, [selectedClass]);

    if (!user || user.role !== 'teacher') {
        return <Navigate to="/login" />;
    }

    const teacherLocks = JSON.parse(localStorage.getItem('admin_teacher_locks') || '{}');
    if (teacherLocks[`${user.id}_students`]) {
        return <FeatureLocked featureName="View Students" />;
    }

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
                    <h2 className="page-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                        My Students
                    </h2>
                </div>
            </div>

            <div className="class-selector" style={{ marginBottom: '20px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Class:</label>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="form-select"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    {user.classes.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
            </div>

            {students.length === 0 ? (
                <p>No students found for {selectedClass}.</p>
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{s.name}</td>
                                        <td>
                                            <Link to={`/profile/${s.id}`} className="btn btn-sm btn-outline">
                                                View Profile
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
