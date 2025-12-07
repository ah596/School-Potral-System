import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';

export default function TeacherAttendance() {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState(user.classes[0]);
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // In a real app, we'd filter by class. For mock, we just get all students
        // and pretend they belong to the selected class for simplicity, 
        // or filter if we added class data to students.
        const allStudents = storage.getStudents();
        // Mock filter: assuming all students are in the selected class for this demo
        setStudents(allStudents);
    }, [selectedClass]);

    const handleAttendanceChange = (studentId, status) => {
        setStudents(students.map(s => {
            if (s.id === studentId) {
                // We are just storing the temporary status in the state for now
                return { ...s, tempStatus: status };
            }
            return s;
        }));
    };

    const saveAttendance = () => {
        let updatedCount = 0;
        students.forEach(student => {
            if (student.tempStatus) {
                // Update student's attendance record
                const newRecord = {
                    date: attendanceDate,
                    status: student.tempStatus
                };

                // Update summary counters
                const newSummary = { ...student.attendance.summary };
                if (student.tempStatus === 'Present') newSummary.present++;
                if (student.tempStatus === 'Absent') newSummary.absent++;
                if (student.tempStatus === 'Leave') newSummary.leave++;

                const updatedStudent = {
                    ...student,
                    attendance: {
                        ...student.attendance,
                        summary: newSummary,
                        history: [newRecord, ...student.attendance.history]
                    }
                };

                storage.updateStudent(updatedStudent);
                updatedCount++;
            }
        });
        setMessage(`Attendance saved for ${updatedCount} students.`);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="page container">
            <h2 className="page-title">Mark Attendance</h2>

            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                >
                    {user.classes.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
                <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}
                />
            </div>

            {message && <div className="alert-success" style={{ padding: '1rem', background: '#dcfce7', color: '#166534', marginBottom: '1rem', borderRadius: '0.25rem' }}>{message}</div>}

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(student => (
                        <tr key={student.id}>
                            <td>{student.id}</td>
                            <td>{student.name}</td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['Present', 'Absent', 'Leave'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleAttendanceChange(student.id, status)}
                                            className={`btn btn-sm ${student.tempStatus === status ? 'btn-primary' : 'btn-outline'}`}
                                            style={{
                                                opacity: student.tempStatus && student.tempStatus !== status ? 0.5 : 1,
                                                backgroundColor: student.tempStatus === status ?
                                                    (status === 'Present' ? '#10b981' : status === 'Absent' ? '#ef4444' : '#eab308') : 'transparent',
                                                borderColor: 'transparent',
                                                color: student.tempStatus === status ? 'white' : 'inherit'
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <button onClick={saveAttendance} className="btn btn-primary">Save Attendance</button>
            </div>
        </div>
    );
}
