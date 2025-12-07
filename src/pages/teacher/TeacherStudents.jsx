import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { Link } from 'react-router-dom';

export default function TeacherStudents() {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState(user?.classes?.[0] || '');
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (selectedClass) {
            setStudents(storage.getStudentsByClass(selectedClass));
        }
    }, [selectedClass]);

    if (!user || user.role !== 'teacher') {
        return <div>Access Denied</div>;
    }

    return (
        <div className="teacher-students-page container">
            <h2 className="page-title">My Students</h2>

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
