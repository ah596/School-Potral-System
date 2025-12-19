import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { DollarSign, CheckCircle, FileText, Upload, AlertCircle, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminFees() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [feeAmount, setFeeAmount] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [proofModal, setProofModal] = useState(null); // { studentName, proofUrl }
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            loadClassData();
        }
    }, [selectedClass, selectedMonth]);

    const loadClasses = async () => {
        setLoading(true);
        try {
            const data = await api.getClasses();
            setClasses(data);
            if (data.length > 0) setSelectedClass(data[0].name);
        } catch (error) {
            console.error("Failed to load classes", error);
        } finally {
            setLoading(false);
        }
    };

    const loadClassData = async () => {
        try {
            // Get current fee setting for class
            const cls = classes.find(c => c.name === selectedClass);
            if (cls && cls.monthlyFee) {
                setFeeAmount(cls.monthlyFee);
            } else {
                setFeeAmount('');
            }

            // Get students
            const allStudents = await api.getStudents();
            const classStudents = allStudents.filter(s => s.gradeLevel === selectedClass || s.grade_level === selectedClass);

            // Mock Fee Data (In real app, fetch from 'fees' collection)
            // We will attach a mock 'feeStatus' to each student based on the selected month
            // For demo: Randomly assign statuses if not present locally
            // data structure: { status: 'paid' | 'pending' | 'generated' | 'submitted', proof: 'url' }

            const studentsWithFees = await Promise.all(classStudents.map(async (student) => {
                const feeRecord = await api.getFeeRecord(student.id, selectedMonth);
                return { ...student, feeStatus: feeRecord || { status: 'pending', amount: cls?.monthlyFee || 0 } };
            }));

            setStudents(studentsWithFees);

        } catch (error) {
            console.error("Failed to load class data", error);
        }
    };

    const handleSaveFee = async () => {
        if (!selectedClass || !feeAmount) return;
        try {
            const cls = classes.find(c => c.name === selectedClass);
            if (cls) {
                await api.updateClass(cls.id, { ...cls, monthlyFee: feeAmount });
                alert(`Fee for ${selectedClass} updated to $${feeAmount}/month`);
                loadClassData(); // Refresh to ensure consistency
            }
        } catch (error) {
            console.error("Failed to save fee", error);
            alert("Failed to update class fee");
        }
    };

    const handleGenerateChallan = async () => {
        if (!feeAmount) return alert("Please set a monthly fee first.");
        if (window.confirm(`Generate Fee Challans for ${students.length} students in ${selectedClass}?`)) {
            try {
                // In real app: create batch fee records
                await Promise.all(students.map(s =>
                    api.updateFeeStatus(s.id, selectedMonth, { status: 'generated', amount: feeAmount })
                ));
                loadClassData();
                alert("Challans generated successfully.");
            } catch (error) {
                console.error("Failed", error);
            }
        }
    };

    const handleVerifyStats = async (student, isApproved) => {
        const newStatus = isApproved ? 'verified' : 'generated'; // Revert to generated if rejected
        try {
            await api.updateFeeStatus(student.id, selectedMonth, { ...student.feeStatus, status: newStatus });
            loadClassData();
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (!user || user.role !== 'admin') return <Navigate to="/login" />;

    if (loading) return <LoadingScreen message="Loading Fee Data..." />;

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
                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                        Student Fees Management
                    </h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Control Panel */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Fee Settings</h3>
                    <div className="form-group">
                        <label>Select Class</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem', marginBottom: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)' }}
                        >
                            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Monthly Fee ($)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="number"
                                value={feeAmount}
                                onChange={(e) => setFeeAmount(e.target.value)}
                                placeholder="Enter Amount"
                                style={{ flex: 1 }}
                            />
                            <button onClick={handleSaveFee} className="btn btn-primary">Save Fee</button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Actions</label>
                        <button
                            onClick={handleGenerateChallan}
                            className="btn btn-outline"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <FileText size={18} /> Generate Monthly Challan
                        </button>
                    </div>
                </div>

                {/* Status Summary */}
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Status ({selectedMonth})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
                            <span style={{ fontWeight: '600' }}>Verified Paid</span>
                            <span style={{ fontWeight: '800' }}>{students.filter(s => s.feeStatus.status === 'verified').length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}>
                            <span style={{ fontWeight: '600' }}>Submitted (Needs Review)</span>
                            <span style={{ fontWeight: '800' }}>{students.filter(s => s.feeStatus.status === 'submitted').length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}>
                            <span style={{ fontWeight: '600' }}>Pending / Unpaid</span>
                            <span style={{ fontWeight: '800' }}>{students.filter(s => ['pending', 'generated'].includes(s.feeStatus.status)).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Fee Records: {selectedClass}</h3>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Challan Status</th>
                                <th>Proof of Payment</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No students in this class.</td></tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <span className={`badge badge-${student.feeStatus.status === 'verified' ? 'success' :
                                                student.feeStatus.status === 'submitted' ? 'warning' :
                                                    'danger'
                                                }`}>
                                                {student.feeStatus.status.toUpperCase()}
                                            </span>
                                            {student.feeStatus.status !== 'pending' && (
                                                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>
                                                    ${student.feeStatus.amount}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {student.feeStatus.status === 'submitted' || student.feeStatus.status === 'verified' ? (
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => setProofModal({
                                                        studentName: student.name,
                                                        proofUrl: student.feeStatus.proofUrl || 'https://via.placeholder.com/300?text=Bank+Receipt+Proof'
                                                    })}
                                                >
                                                    <ImageIcon size={16} /> View Proof
                                                </button>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Not Uploaded</span>
                                            )}
                                        </td>
                                        <td>
                                            {student.feeStatus.status === 'submitted' && (
                                                <button
                                                    onClick={() => handleVerifyStats(student, true)}
                                                    className="btn btn-sm btn-primary"
                                                    style={{ background: '#10b981', borderColor: '#10b981' }}
                                                >
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                            )}
                                            {student.feeStatus.status === 'verified' && (
                                                <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <CheckCircle size={16} /> Verified
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Proof Modal */}
            {proofModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }} onClick={() => setProofModal(null)}>
                    <div style={{
                        background: 'white', padding: '1rem', borderRadius: '12px',
                        maxWidth: '500px', width: '90%', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setProofModal(null)}
                            style={{ position: 'absolute', top: '-1rem', right: '-1rem', background: 'white', borderRadius: '50%', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={24} color="black" />
                        </button>
                        <h4 style={{ marginTop: 0, color: 'black' }}>Payment Proof: {proofModal.studentName}</h4>
                        <img
                            src={proofModal.proofUrl}
                            alt="Payment Proof"
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setProofModal(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
