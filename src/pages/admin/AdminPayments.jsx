import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { storage } from '../../utils/storage';
import { DollarSign, Check } from 'lucide-react';

export default function AdminPayments() {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = () => {
        setTeachers(storage.getTeachers());
    };

    const handleMarkPaid = (teacherId) => {
        alert(`Payment marked as paid for ${selectedMonth}`);
        // In a real app, you would store payment records
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const totalSalaries = teachers.reduce((sum, t) => sum + (parseFloat(t.salary) || 0), 0);

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Teacher Payments</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Monthly Payroll</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>${totalSalaries.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Select Month</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ width: '100%', padding: '0.9rem 1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--background)' }}
                    />
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Payment Records for {selectedMonth}</h3>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Teacher ID</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Salary</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map(teacher => (
                                <tr key={teacher.id}>
                                    <td>{teacher.id}</td>
                                    <td>{teacher.name}</td>
                                    <td>{teacher.subject}</td>
                                    <td style={{ fontWeight: '700', color: 'var(--success)' }}>${teacher.salary}</td>
                                    <td>
                                        <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                                            Pending
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleMarkPaid(teacher.id)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <Check size={16} /> Mark Paid
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
