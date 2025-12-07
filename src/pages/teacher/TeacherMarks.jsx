import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function TeacherMarks() {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState(user.classes[0]);
    const [selectedExam, setSelectedExam] = useState('Final Term');
    const [students, setStudents] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setStudents(storage.getStudents());
    }, [selectedClass]);

    const handleMarkChange = (studentId, subject, marks) => {
        setStudents(students.map(s => {
            if (s.id === studentId) {
                const updatedResults = { ...s.results };
                // Initialize if not exists
                if (!updatedResults[selectedExam]) updatedResults[selectedExam] = [];

                const subjectIndex = updatedResults[selectedExam].findIndex(r => r.subject === subject);
                if (subjectIndex >= 0) {
                    updatedResults[selectedExam][subjectIndex] = { ...updatedResults[selectedExam][subjectIndex], marks: parseInt(marks) || 0 };
                } else {
                    updatedResults[selectedExam].push({ subject, marks: parseInt(marks) || 0, total: 100, grade: 'B' }); // Default grade/total
                }

                return { ...s, results: updatedResults, isModified: true };
            }
            return s;
        }));
    };

    const saveMarks = () => {
        let updatedCount = 0;
        students.forEach(student => {
            if (student.isModified) {
                const { isModified, ...studentData } = student; // Remove flag
                storage.updateStudent(studentData);
                updatedCount++;
            }
        });
        setMessage(`Marks updated for ${updatedCount} students.`);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="page container">
            <h2 className="page-title">Upload Marks</h2>

            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                >
                    {user.classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                >
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final Term">Final Term</option>
                </select>
            </div>

            {message && <div className="alert-success" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1rem', borderRadius: '0.25rem' }}>{message}</div>}

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Mathematics</th>
                        <th>Science</th>
                        <th>English</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => {
                        const getMarks = (subject) => {
                            const examResults = student.results?.[selectedExam] || [];
                            const result = examResults.find(r => r.subject === subject);
                            return result ? result.marks : '';
                        };

                        return (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.name}</td>
                                {['Mathematics', 'Science', 'English'].map(subject => (
                                    <td key={subject}>
                                        <input
                                            type="number"
                                            value={getMarks(subject)}
                                            onChange={(e) => handleMarkChange(student.id, subject, e.target.value)}
                                            style={{ width: '60px', padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '0.25rem' }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button onClick={saveMarks} className="btn btn-primary">Save Marks</button>
            </div>
        </div>
    );
}
