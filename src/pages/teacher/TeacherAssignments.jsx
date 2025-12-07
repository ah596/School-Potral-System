import { useState } from 'react';
import { storage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function TeacherAssignments() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState(user.subject || 'Mathematics');
    const [dueDate, setDueDate] = useState('');
    const [selectedClass, setSelectedClass] = useState(user.classes[0]);
    const [message, setMessage] = useState('');

    const handleAssign = (e) => {
        e.preventDefault();

        const newAssignment = {
            id: Date.now(),
            title,
            subject,
            dueDate,
            status: 'Pending',
            downloadUrl: '#'
        };

        const students = storage.getStudents();
        let count = 0;

        // Add assignment to all students (mocking class filter)
        students.forEach(student => {
            const updatedStudent = {
                ...student,
                assignments: [newAssignment, ...student.assignments]
            };
            storage.updateStudent(updatedStudent);
            count++;
        });

        setMessage(`Assignment "${title}" assigned to ${count} students.`);
        setTitle('');
        setDueDate('');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="page container">
            <h2 className="page-title">Create Assignment</h2>

            <div className="profile-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {message && <div className="alert-success" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1rem', borderRadius: '0.25rem' }}>{message}</div>}

                <form onSubmit={handleAssign} className="profile-form">
                    <div className="form-group">
                        <label>Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
                        >
                            {user.classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Assignment Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Algebra Chapter 5 Exercises"
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', marginBottom: '1rem' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">Assign to Class</button>
                </form>
            </div>
        </div>
    );
}
