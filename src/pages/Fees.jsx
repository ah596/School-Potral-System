import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { DollarSign, CheckCircle, AlertCircle, Download, CreditCard } from 'lucide-react';

export default function Fees() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    const fees = user.fees || { total: 5000, paid: 2000, pending: 3000 };
    const paymentHistory = [
        { id: 1, date: '2024-09-15', amount: 1000, method: 'Bank Transfer', status: 'Paid' },
        { id: 2, date: '2024-10-15', amount: 1000, method: 'Cash', status: 'Paid' },
    ];

    const upcomingPayments = [
        { id: 1, dueDate: '2024-12-15', amount: 1500, description: 'Term 3 Fees' },
        { id: 2, dueDate: '2025-01-15', amount: 1500, description: 'Term 4 Fees' },
    ];

    const paidPercentage = (fees.paid / fees.total) * 100;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>Fee Status</h2>

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
                        width: `${paidPercentage}%`,
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
                            {paymentHistory.map(payment => (
                                <tr key={payment.id}>
                                    <td>{payment.date}</td>
                                    <td style={{ fontWeight: '700', color: 'var(--success)' }}>${payment.amount}</td>
                                    <td>{payment.method}</td>
                                    <td>
                                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                                            {payment.status}
                                        </span>
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
