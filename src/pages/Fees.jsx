import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { DollarSign, CheckCircle, AlertCircle, CreditCard, ArrowLeft, Download, X, TrendingUp } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import FeatureLocked from '../components/FeatureLocked';
import { api } from '../utils/api';

export default function Fees() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [fees, setFees] = useState({ total: 0, paid: 0, pending: 0 });
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Payment Modal State
    const [isPaying, setIsPaying] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentData, setPaymentData] = useState({
        mobileNumber: '',
        mpin: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        transactionId: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('jazzcash');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeChallan, setActiveChallan] = useState(null);

    useEffect(() => {
        if (user) loadFees();
    }, [user]);

    const loadFees = async () => {
        setLoading(true);
        try {
            const data = await api.getFees(user.id);
            if (data) {
                setFees({
                    total: data.total || 0,
                    paid: data.paid || 0,
                    pending: data.pending || 0
                });
                setPaymentHistory(data.history || []);
                setInvoices(data.invoices || []);
            }
        } catch (error) {
            console.error("Failed to load fees", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = (invoice) => {
        setSelectedInvoice(invoice);
        setIsPaying(true);
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate Network Delay for Payment Gateway
        setTimeout(async () => {
            try {
                const transactionId = `TXN-${Date.now()}`;
                await api.addPayment({
                    studentId: user.id,
                    amount: selectedInvoice.amount,
                    date: new Date().toISOString().split('T')[0],
                    method: paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'card' ? 'Bank Card' : 'Bank Transfer',
                    description: `Payment for ${selectedInvoice.fee_type} (${selectedInvoice.month})`,
                    receiptNo: `REC-${Math.floor(Math.random() * 10000)}`,
                    transactionId: paymentMethod === 'bank_transfer' ? paymentData.transactionId : transactionId,
                    status: 'success',
                    studentFeeId: selectedInvoice.id === 'arrears' ? null : selectedInvoice.id
                });

                alert(`Payment Successful! Transaction ID: ${transactionId}`);
                setIsPaying(false);
                setSelectedInvoice(null);
                setPaymentData({ mobileNumber: '', mpin: '', cardNumber: '', expiry: '', cvv: '', transactionId: '' });
                loadFees(); // Refresh Data
            } catch (error) {
                console.error("Payment failed", error);
                alert("Payment processing failed.");
            } finally {
                setIsProcessing(false);
            }
        }, 2000);
    };

    if (!user) return <Navigate to="/login" />;

    const studentLocks = JSON.parse(localStorage.getItem('admin_student_locks') || '{}');
    if (studentLocks[`${user.id}_fees`]) {
        return <FeatureLocked featureName="Fees Status" />;
    }

    const paidPercentage = fees.total > 0 ? (fees.paid / fees.total) * 100 : 0;

    if (loading) return <LoadingScreen message="Loading Fee Data..." />;

    const pendingInvoices = invoices.filter(i => i.status !== 'paid');
    const sumOfPendingInvoices = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);
    const arrears = fees.pending - sumOfPendingInvoices;

    const displayInvoices = [...pendingInvoices];
    if (arrears > 0) {
        displayInvoices.push({ id: 'arrears', fee_type: 'Previous Arrears', month: 'Brought Forward', amount: arrears, status: 'pending' });
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: '3rem' }}>
            <style>{`
                @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
                .fee-stat { animation: fadeInUp 0.5s ease forwards; opacity:0; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s; }
                .fee-stat:nth-child(1){animation-delay:0.1s} .fee-stat:nth-child(2){animation-delay:0.15s} .fee-stat:nth-child(3){animation-delay:0.2s}
                .fee-stat:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
                .fee-inv-row { transition: background 0.15s; }
                .fee-inv-row:hover { background: rgba(99,102,241,0.04); }
                .inv-card { transition: all 0.2s; }
                .inv-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }
            `}</style>

            {/* Hero Banner */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)', padding: '1.25rem 0 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: -50, left: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', pointerEvents: 'none' }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Back arrow row */}
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '0 0 0.75rem 0', fontSize: '0.82rem', fontWeight: 600 }}>
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                    {/* Title row: text left, icon right */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                        <div>
                            <h1 style={{ color: 'white', fontSize: 'clamp(1.3rem,5vw,1.9rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>My Fee Details</h1>
                            <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0.3rem 0 0', fontSize: '0.8rem' }}>View invoices & pay securely</p>
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CreditCard size={24} color="white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {/* Total Billed */}
                    <div className="fee-stat" style={{ borderRadius: 20, padding: '1rem', position: 'relative', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Billed</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, wordBreak: 'break-word' }}>Rs {fees.total}</p>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)', flexShrink: 0 }}>
                                <DollarSign size={17} color="white" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <TrendingUp size={11} color="#10b981" />
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>Annual fees</span>
                        </div>
                    </div>

                    {/* Paid */}
                    <div className="fee-stat" style={{ borderRadius: 20, padding: '1rem', position: 'relative', overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount Paid</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, wordBreak: 'break-word' }}>Rs {fees.paid}</p>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.35)', flexShrink: 0 }}>
                                <CheckCircle size={17} color="white" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <TrendingUp size={11} color="#10b981" />
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>{paidPercentage.toFixed(0)}% cleared</span>
                        </div>
                    </div>

                    {/* Pending - full width */}
                    <div className="fee-stat" style={{ gridColumn: '1 / -1', borderRadius: 20, padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1, wordBreak: 'break-word' }}>Rs {fees.pending}</p>
                            </div>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(239,68,68,0.35)', flexShrink: 0 }}>
                                <AlertCircle size={17} color="white" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <TrendingUp size={11} color="#10b981" />
                            <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700 }}>{displayInvoices.length > 0 ? `${displayInvoices.length} invoices pending` : 'All clear'}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="card" style={{ marginBottom: '1.25rem', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Payment Progress</h3>
                        <span style={{ background: paidPercentage >= 100 ? 'linear-gradient(135deg,#10b981,#34d399)' : 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: 50 }}>{paidPercentage.toFixed(0)}% Paid</span>
                    </div>
                    <div style={{ width: '100%', height: 10, background: 'var(--background)', borderRadius: 50, overflow: 'hidden' }}>
                        <div style={{ width: `${paidPercentage}%`, height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 50, transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ margin: '0.4rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Rs {fees.paid} paid out of Rs {fees.total}</p>
                </div>

                {/* Pending Invoices */}
                <div className="card no-print" style={{ marginBottom: '1.25rem', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Pending Invoices</h3>
                        <span style={{ background: displayInvoices.length > 0 ? 'linear-gradient(135deg,#ef4444,#f87171)' : 'linear-gradient(135deg,#10b981,#34d399)', color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: 50 }}>
                            {displayInvoices.length > 0 ? `${displayInvoices.length} Pending` : 'All Clear ✓'}
                        </span>
                    </div>
                    {displayInvoices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                            <CheckCircle size={36} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                            <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>No pending invoices. All caught up!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {displayInvoices.map(invoice => (
                                <div key={invoice.id} className="inv-card" style={{ padding: '1.1rem 1.25rem', border: '1px solid var(--border)', borderRadius: 12, borderLeft: '3px solid #ef4444' }}>
                                    {/* Top row: info left, icon right */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, textTransform: 'capitalize' }}>{invoice.fee_type} Fee</h4>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>Period: <strong style={{ color: 'var(--text-main)' }}>{invoice.month}</strong></p>
                                                {invoice.due_date && <p style={{ margin: 0, color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>}
                                            </div>
                                        </div>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <AlertCircle size={17} color="white" />
                                        </div>
                                    </div>
                                    {/* Bottom row: amount left, buttons right */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ef4444' }}>Rs {invoice.amount}</span>
                                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                            <button className="btn btn-outline btn-sm" onClick={() => setActiveChallan(invoice)} style={{ borderRadius: 8, fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>Challan</button>
                                            <button className="btn btn-primary btn-sm" onClick={() => handlePayClick(invoice)} style={{ borderRadius: 8, fontSize: '0.72rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CreditCard size={12} /> Pay</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Invoices Table */}
                <div className="card no-print" style={{ marginBottom: '1.25rem', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.85rem', fontWeight: 800 }}>All Billed Invoices</h3>
                    {invoices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No billed invoices.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['Month', 'Type', 'Amount', 'Due Date', 'Status', 'Action'].map(h => (
                                            <th key={h} style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(invoice => (
                                        <tr key={invoice.id} className="fee-inv-row">
                                            <td style={{ fontWeight: 600 }}>{invoice.month}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{invoice.fee_type}</td>
                                            <td style={{ fontWeight: 700 }}>Rs {invoice.amount}</td>
                                            <td>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</td>
                                            <td>
                                                <span style={{ background: invoice.status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: invoice.status === 'paid' ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50, textTransform: 'capitalize' }}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <button className="btn btn-outline btn-sm" onClick={() => setActiveChallan(invoice)} style={{ borderRadius: 8 }}>Challan</button>
                                                    {invoice.status !== 'paid' && <button className="btn btn-primary btn-sm" onClick={() => handlePayClick(invoice)} style={{ borderRadius: 8 }}>Pay</button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Payment History */}
                <div className="card no-print" style={{ marginBottom: '1.25rem', borderRadius: 14, boxShadow: 'var(--shadow-sm)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Payment History</h3>
                        <button className="btn btn-outline btn-sm" onClick={() => window.print()} style={{ borderRadius: 8, fontSize: '0.75rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Download size={13} /> Save
                        </button>
                    </div>
                    {paymentHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payment history found.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['Date', 'Description', 'Transaction ID', 'Amount', 'Method', 'Status'].map(h => (
                                            <th key={h} style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentHistory.map((payment, index) => (
                                        <tr key={index} className="fee-inv-row">
                                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                                            <td>{payment.description}</td>
                                            <td><code style={{ background: 'var(--background)', padding: '2px 8px', borderRadius: 6, fontSize: '0.82rem' }}>{payment.transaction_id || payment.receipt_no}</code></td>
                                            <td style={{ fontWeight: 700, color: '#10b981' }}>Rs {payment.amount}</td>
                                            <td>{payment.method || 'Online'}</td>
                                            <td><span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>{payment.status || 'Paid'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* Custom Print Style overrides */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    .print-area, .print-area * {
                        visibility: visible !important;
                    }
                    .print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: #1e293b !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Payment Modal */}
            {isPaying && selectedInvoice && (
                <div className="no-print" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
                    padding: '1rem'
                }}>
                    <div className="card" style={{
                        maxWidth: '450px',
                        width: '100%',
                        position: 'relative',
                        animation: 'slideUp 0.3s ease-out',
                        borderTop: `4px solid ${paymentMethod === 'jazzcash' ? '#e11d48' : 'var(--primary)'}`,
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <button
                            onClick={() => setIsPaying(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                            disabled={isProcessing}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ background: paymentMethod === 'jazzcash' ? '#e11d48' : 'var(--primary)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                {paymentMethod === 'jazzcash' ? (
                                    <span style={{ fontWeight: '900', fontSize: '1.5rem', fontStyle: 'italic' }}>JC</span>
                                ) : paymentMethod === 'card' ? (
                                    <CreditCard size={28} />
                                ) : (
                                    <span style={{ fontWeight: '900', fontSize: '1.5rem' }}>Rs </span>
                                )}
                            </div>
                            <h3 style={{ margin: 0 }}>Secure Checkout</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Merchant: KGS School Portal</p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--background-alt)', padding: '0.25rem', borderRadius: '8px' }}>
                            <button
                                type="button"
                                className={`btn ${paymentMethod === 'jazzcash' ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: paymentMethod === 'jazzcash' ? '#e11d48' : 'transparent', color: paymentMethod === 'jazzcash' ? 'white' : 'var(--text)' }}
                                onClick={() => setPaymentMethod('jazzcash')}
                            >
                                JazzCash
                            </button>
                            <button
                                type="button"
                                className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: paymentMethod === 'card' ? 'var(--primary)' : 'transparent', color: paymentMethod === 'card' ? 'white' : 'var(--text)' }}
                                onClick={() => setPaymentMethod('card')}
                            >
                                Bank Card
                            </button>
                            <button
                                type="button"
                                className={`btn ${paymentMethod === 'bank_transfer' ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: paymentMethod === 'bank_transfer' ? 'var(--primary)' : 'transparent', color: paymentMethod === 'bank_transfer' ? 'white' : 'var(--text)' }}
                                onClick={() => setPaymentMethod('bank_transfer')}
                            >
                                Bank Transfer
                            </button>
                        </div>

                        <div style={{ background: 'var(--background-alt)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px dashed var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Paying For</span>
                                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{selectedInvoice.fee_type} ({selectedInvoice.month})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                <span style={{ fontWeight: '600' }}>Total Amount</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: paymentMethod === 'jazzcash' ? '#e11d48' : 'var(--primary)' }}>Rs {selectedInvoice.amount}</span>
                            </div>
                        </div>

                        <form onSubmit={handleProcessPayment}>
                            {paymentMethod === 'jazzcash' && (
                                <>
                                    <div className="form-group">
                                        <label>JazzCash Mobile Number</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="03XX XXXXXXX"
                                            pattern="[0-9]{11}"
                                            value={paymentData.mobileNumber}
                                            onChange={(e) => setPaymentData({ ...paymentData, mobileNumber: e.target.value })}
                                            disabled={isProcessing}
                                            style={{ fontSize: '1.1rem', letterSpacing: '2px' }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginTop: '1rem' }}>
                                        <label>MPIN</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="****"
                                            maxLength="4"
                                            pattern="[0-9]{4}"
                                            value={paymentData.mpin}
                                            onChange={(e) => setPaymentData({ ...paymentData, mpin: e.target.value })}
                                            disabled={isProcessing}
                                            style={{ fontSize: '1.5rem', letterSpacing: '8px', textAlign: 'center' }}
                                        />
                                    </div>
                                </>
                            )}

                            {paymentMethod === 'card' && (
                                <>
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="0000 0000 0000 0000"
                                            maxLength="19"
                                            value={paymentData.cardNumber}
                                            onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                                            disabled={isProcessing}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                value={paymentData.expiry}
                                                onChange={(e) => setPaymentData({ ...paymentData, expiry: e.target.value })}
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                required
                                                placeholder="123"
                                                maxLength="4"
                                                value={paymentData.cvv}
                                                onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                                                disabled={isProcessing}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {paymentMethod === 'bank_transfer' && (
                                <>
                                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Send payment to the following fixed account from any bank app:</p>
                                        <div style={{ fontSize: '0.95rem' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Bank:</span> <strong>Bank Al Habib</strong></div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span>Account Title:</span> <strong>SSPL-BHL</strong></div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}><span>Account Number:</span> <strong style={{ color: 'var(--primary)' }}>1041-4455989746-971</strong></div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Transaction ID / Reference Number</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter Transaction ID after sending"
                                            value={paymentData.transactionId}
                                            onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                                            disabled={isProcessing}
                                        />
                                        <small style={{ color: 'var(--text-muted)' }}>We will verify this transaction ID against our bank statement.</small>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className="btn"
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    background: paymentMethod === 'jazzcash' ? '#e11d48' : 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '700'
                                }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>Pay Rs {selectedInvoice.amount}</>
                                )}
                            </button>
                        </form>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <small style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={14} color="#10b981" /> Secured by JazzCash
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Challan View / Print Modal */}
            {activeChallan && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex', flexDirection: 'column', zIndex: 1200,
                    padding: '1rem', overflowY: 'auto'
                }}>
                    {/* Header Controls (Hidden during print) */}
                    <div className="no-print" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        maxWidth: '1200px', width: '100%', margin: '0 auto 1rem auto',
                        background: 'var(--surface)', padding: '1rem', borderRadius: '12px',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <h4 style={{ margin: 0, color: 'var(--text)' }}>
                            Fee Challan Preview
                        </h4>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                Print Challan
                            </button>
                            <button className="btn btn-outline" onClick={() => setActiveChallan(null)}>
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Challan Copy Area */}
                    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', background: 'white', borderRadius: '12px', padding: '0.5rem' }}>
                        {(() => {
                            const invoice = activeChallan;
                            const student = user;

                            const categories = [
                                { label: 'Admission Fee', val: invoice.admission_fee || 0 },
                                { label: 'Annual Fee', val: invoice.annual_fee || 0 },
                                { label: 'Tuition Fee', val: invoice.tuition_fee || 0 },
                                { label: 'Overtime Fee', val: invoice.overtime_fee || 0 },
                                { label: 'Lab Fee', val: invoice.lab_fee || 0 },
                                { label: 'Security Charges', val: invoice.security_charges || 0 },
                                { label: 'Sports Fee', val: invoice.sports_fee || 0 },
                                { label: 'Other Charges', val: invoice.other_charges || 0 }
                            ].filter(item => item.val > 0);

                            // Fallback if legacy invoice has no breakdown or for arrears item
                            if (categories.length === 0 && invoice.amount > 0) {
                                categories.push({ label: invoice.fee_type === 'Previous Arrears' ? 'Arrears Balance' : 'Tuition Fee', val: invoice.amount });
                            }

                            const currentDues = categories.reduce((sum, item) => sum + item.val, 0);
                            const discount = 0;
                            const tax = Math.round(currentDues * 0.015);
                            const arrears = invoice.arrears || 0;
                            const totalByDueDate = currentDues + arrears + tax - discount;
                            const lateFee = 200;
                            const totalAfterDueDate = totalByDueDate + lateFee;

                            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`Receipt:${invoice.id}|Student:${student.id}|Month:${invoice.month}|Amount:${invoice.amount}|Status:${invoice.status}`)}`;

                            const copies = ['Bank Copy', 'School Copy', 'Student Copy'];

                            const formatMonth = (mStr) => {
                                if (!mStr) return '';
                                const parts = mStr.split('-');
                                if (parts.length !== 2) return mStr;
                                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                const idx = parseInt(parts[1], 10) - 1;
                                return `${months[idx] || parts[1]}, ${parts[0]}`;
                            };

                            return (
                                <div className="print-area" style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between', background: 'white', color: '#1e293b', padding: '1rem', boxSizing: 'border-box', fontFamily: 'sans-serif' }}>
                                    {copies.map((copyName, idx) => (
                                        <div key={idx} style={{ flex: 1, border: '1px solid #cbd5e1', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', fontSize: '0.75rem', minHeight: '640px', background: 'white', boxSizing: 'border-box' }}>
                                            {/* Cut line */}
                                            {idx < 2 && (
                                                <div style={{ position: 'absolute', right: '-0.4rem', top: 0, bottom: 0, width: '1px', borderRight: '1px dashed #94a3b8', height: '100%' }}></div>
                                            )}

                                            {/* Header */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>🏫</span>
                                                        <div>
                                                            <div style={{ fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', color: '#0f172a' }}>KGS School Portal</div>
                                                            <div style={{ fontSize: '0.55rem', color: '#64748b' }}>Karachi Branch</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 'bold', fontSize: '0.6rem', background: '#3b82f6', color: 'white', padding: '1px 5px', borderRadius: '3px', display: 'inline-block' }}>{copyName}</div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0.4rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Receipt Number</div>
                                                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>REC-{invoice.id ? invoice.id.substring(0, 10).toUpperCase() : 'N/A'}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Billing Period</div>
                                                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatMonth(invoice.month)}</div>
                                                    </div>
                                                </div>

                                                {/* Student Details */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginBottom: '0.5rem', background: '#f8fafc', padding: '0.4rem', borderRadius: '6px', fontSize: '0.7rem' }}>
                                                    <div>
                                                        <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Name:</span> <strong style={{ color: '#0f172a' }}>{student.name}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Class:</span> <strong style={{ color: '#0f172a' }}>{student.grade_level || student.gradeLevel}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b', fontSize: '0.6rem' }}>G.R. No:</span> <strong style={{ color: '#0f172a' }}>{student.id}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Reg. No:</span> <strong style={{ color: '#0f172a' }}>REG-{student.id}</strong>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Issue Date:</span> <span>{invoice.updated_at ? new Date(invoice.updated_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b', fontSize: '0.6rem' }}>Due Date:</span> <strong style={{ color: '#ef4444' }}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</strong>
                                                    </div>
                                                </div>

                                                {/* Fee Breakdown Table */}
                                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                                                            <th style={{ textAlign: 'left', padding: '3px 0', color: '#475569' }}>Description</th>
                                                            <th style={{ textAlign: 'right', padding: '3px 0', color: '#475569' }}>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {categories.map((item, cIdx) => (
                                                            <tr key={cIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                <td style={{ padding: '3px 0', color: '#334155' }}>- {item.label}</td>
                                                                <td style={{ padding: '3px 0', textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>Rs {item.val}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Summary & QR */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                                                        <div style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                            <span>Current Dues:</span>
                                                            <strong>Rs {currentDues}</strong>
                                                        </div>
                                                        <div style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                            <span>Discount:</span>
                                                            <strong>Rs {discount}</strong>
                                                        </div>
                                                        <div style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                                                            <span>Tax (1.5%):</span>
                                                            <strong>Rs {tax}</strong>
                                                        </div>
                                                        <div style={{ fontSize: '0.65rem', display: 'flex', justifyContent: 'space-between', color: '#ef4444', fontWeight: 'bold' }}>
                                                            <span>Arrears:</span>
                                                            <strong>Rs {arrears}</strong>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <img src={qrUrl} alt="QR Code" style={{ width: '60px', height: '60px', border: '1px solid #cbd5e1', padding: '2px', borderRadius: '4px' }} />
                                                    </div>
                                                </div>

                                                <div style={{ background: '#f1f5f9', padding: '0.4rem', borderRadius: '6px', marginBottom: '0.4rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', fontWeight: '800', color: '#0f172a' }}>
                                                        <span>Total by Due Date:</span>
                                                        <span>Rs {totalByDueDate}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6rem', color: '#475569', marginTop: '2px' }}>
                                                        <span>After Due Date:</span>
                                                        <span>Rs {totalAfterDueDate}</span>
                                                    </div>
                                                </div>

                                                {/* Bank Details */}
                                                <div style={{ fontSize: '0.55rem', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '0.3rem', lineHeight: '1.2' }}>
                                                    <div><strong>Bank Details:</strong> Bank Al Habib</div>
                                                    <div><strong>Acc No:</strong> 1041-4455989746-971</div>
                                                    <div><strong>Title:</strong> SSPL-BHL | <strong>Branch:</strong> Gulshan-e-Hadeed Phase II</div>
                                                </div>

                                                {/* Stamps */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', borderTop: '1px dotted #cbd5e1', paddingTop: '0.3rem' }}>
                                                    <div style={{ borderBottom: '1px solid #94a3b8', width: '40%', height: '14px', textAlign: 'center', fontSize: '0.5rem', color: '#64748b' }}>Bank Stamp</div>
                                                    <div style={{ borderBottom: '1px solid #94a3b8', width: '40%', height: '14px', textAlign: 'center', fontSize: '0.5rem', color: '#64748b' }}>School Stamp</div>
                                                </div>

                                                {/* Stamp Overlay for PAID/UNPAID */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '45%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%) rotate(-25deg)',
                                                    border: `3px solid ${invoice.status === 'paid' ? '#10b981' : '#f59e0b'}`,
                                                    color: invoice.status === 'paid' ? '#10b981' : '#f59e0b',
                                                    fontSize: '1.3rem',
                                                    fontWeight: '900',
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '6px',
                                                    opacity: 0.16,
                                                    textTransform: 'uppercase',
                                                    pointerEvents: 'none',
                                                    letterSpacing: '2px'
                                                }}>
                                                    {invoice.status === 'paid' ? 'PAID' : 'UNPAID'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
