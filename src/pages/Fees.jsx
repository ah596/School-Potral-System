import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { DollarSign, CheckCircle, AlertCircle, CreditCard, ArrowLeft, Download } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';
import { api } from '../utils/api';

export default function Fees() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [fees, setFees] = useState({ total: 5000, paid: 0, pending: 5000 });
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) loadFees();
    }, [user]);

    const loadFees = async () => {
        try {
            const data = await api.getFees(user.id);
            if (data) {
                setFees({
                    total: data.total || 5000,
                    paid: data.paid || 0,
                    pending: (data.total || 5000) - (data.paid || 0)
                });
                setPaymentHistory(data.history || []);
            }
        } catch (error) {
            console.error("Failed to load fees", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_fees`]) {
        return <FeatureLocked featureName="Fees Status" />;
    }

    const upcomingPayments = [
        { id: 1, dueDate: '2024-12-15', amount: 1500, description: 'Term 3 Fees' },
        { id: 2, dueDate: '2025-01-15', amount: 1500, description: 'Term 4 Fees' },
    ];

    const paidPercentage = (fees.paid / fees.total) * 100;

    if (loading) return <LoadingScreen message="Loading detailed Fee Data..." />;

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
                        Fee Status
                    </h2>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Fees</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>${fees.total}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Paid</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>${fees.paid}</h3>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={28} />
                        </div>
                        <div>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Pending</p>
                            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>${fees.pending}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Payment Progress</h3>
                <div style={{ width: '100%', height: '32px', background: 'var(--background)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                        width: `${paidPercentage}% `,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #34d399)',
                        transition: 'width 0.5s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700'
                    }}>
                        {paidPercentage.toFixed(0)}%
                    </div>
                </div>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    You've paid ${fees.paid} out of ${fees.total}
                </p>
            </div>

            {/* Upcoming Payments */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Upcoming Payments</h3>
                {upcomingPayments.map(payment => (
                    <div key={payment.id} style={{
                        padding: '1rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{payment.description}</h4>
                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Due: {payment.dueDate}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--danger)' }}>
                                ${payment.amount}
                            </p>
                            <button className="btn btn-sm btn-primary" style={{ marginTop: '0.5rem' }}>
                                <CreditCard size={16} /> Pay Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment History */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Payment History</h3>
                    <button className="btn btn-outline btn-sm">
                        <Download size={16} /> Download Receipt
                    </button>
                </div>
                {paymentHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payment history found.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentHistory.map((payment, index) => (
                                    <tr key={index}>
                                        <td>{payment.date}</td>
                                        <td style={{ fontWeight: '700', color: 'var(--success)' }}>${payment.amount}</td>
                                        <td>{payment.method || 'Online'}</td>
                                        <td>
                                            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                                                {payment.status || 'Paid'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
