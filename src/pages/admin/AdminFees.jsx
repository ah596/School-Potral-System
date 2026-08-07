import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { DollarSign, CheckCircle, FileText, Upload, AlertCircle, Image as ImageIcon, X, ArrowLeft, BarChart3, Settings, Users, Calendar, PlusCircle } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';

export default function AdminFees() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    const [reports, setReports] = useState({ summary: {}, classWise: [] });
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    
    // Setup Tab State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedBalanceClass, setSelectedBalanceClass] = useState('All');
    const [feeStructure, setFeeStructure] = useState({
        monthlyFee: 0,
        annualDues: 0,
        overtimeCharges: 0,
        otherCharges: 0,
        admissionFee: 0,
        admissionFeeEnabled: true,
        annualFeeEnabled: true,
        tuitionFeeEnabled: true,
        overtimeFeeEnabled: false,
        labFee: 0,
        labFeeEnabled: true,
        securityCharges: 0,
        securityChargesEnabled: true,
        sportsFee: 0,
        sportsFeeEnabled: false,
        otherChargesEnabled: true
    });

    // Generate Tab State
    const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0, 7));
    const [genDueDate, setGenDueDate] = useState('');
    const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
    const [forceIncludeAdmission, setForceIncludeAdmission] = useState(false);
    const [forceIncludeAnnual, setForceIncludeAnnual] = useState(false);

    // Student balance inspect modal state
    const [inspectingStudent, setInspectingStudent] = useState(null);
    const [studentInvoices, setStudentInvoices] = useState([]);
    const [studentPayments, setStudentPayments] = useState([]);
    const [inspectLoading, setInspectLoading] = useState(false);

    // Challan Print State (within Admin dashboard)
    const [activeChallan, setActiveChallan] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            const cls = classes.find(c => c.name === selectedClass);
            if (cls) {
                setFeeStructure({
                    monthlyFee: cls.monthly_fee || 0,
                    annualDues: cls.annual_dues || 0,
                    overtimeCharges: cls.overtime_charges || 0,
                    otherCharges: cls.other_charges || 0,
                    admissionFee: cls.admission_fee || 0,
                    admissionFeeEnabled: cls.admission_fee_enabled !== 0,
                    annualFeeEnabled: cls.annual_fee_enabled !== 0,
                    tuitionFeeEnabled: cls.tuition_fee_enabled !== 0,
                    overtimeFeeEnabled: cls.overtime_fee_enabled === 1,
                    labFee: cls.lab_fee || 0,
                    labFeeEnabled: cls.lab_fee_enabled !== 0,
                    securityCharges: cls.security_charges || 0,
                    securityChargesEnabled: cls.security_charges_enabled !== 0,
                    sportsFee: cls.sports_fee || 0,
                    sportsFeeEnabled: cls.sports_fee_enabled === 1,
                    otherChargesEnabled: cls.other_charges_enabled !== 0
                });
            }
        }
    }, [selectedClass, classes]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reportData, classData, studentData] = await Promise.all([
                api.getFeeReports(),
                api.getClasses(),
                api.getAllFees()
            ]);
            setReports(reportData);
            setClasses(classData);
            setStudents(studentData);
            if (classData.length > 0 && !selectedClass) setSelectedClass(classData[0].name);
        } catch (error) {
            console.error("Failed to load fee data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFeeStructure = async () => {
        if (!selectedClass) return;
        try {
            const cls = classes.find(c => c.name === selectedClass);
            if (cls) {
                await api.updateClass(cls.id, { 
                    ...cls, 
                    monthlyFee: feeStructure.monthlyFee,
                    annualDues: feeStructure.annualDues,
                    overtimeCharges: feeStructure.overtimeCharges,
                    otherCharges: feeStructure.otherCharges,
                    admissionFee: feeStructure.admissionFee,
                    admissionFeeEnabled: feeStructure.admissionFeeEnabled,
                    annualFeeEnabled: feeStructure.annualFeeEnabled,
                    tuitionFeeEnabled: feeStructure.tuitionFeeEnabled,
                    overtimeFeeEnabled: feeStructure.overtimeFeeEnabled,
                    labFee: feeStructure.labFee,
                    labFeeEnabled: feeStructure.labFeeEnabled,
                    securityCharges: feeStructure.securityCharges,
                    securityChargesEnabled: feeStructure.securityChargesEnabled,
                    sportsFee: feeStructure.sportsFee,
                    sportsFeeEnabled: feeStructure.sportsFeeEnabled,
                    otherChargesEnabled: feeStructure.otherChargesEnabled
                });
                alert(`Fee structure updated for ${selectedClass}`);
                loadData();
            }
        } catch (error) {
            console.error("Failed to save fee structure", error);
            alert("Failed to update class fee structure");
        }
    };

    const handleGenerateMonthly = async () => {
        if (!genMonth || !genDueDate) return alert("Please select a month and due date.");
        if (window.confirm(`Generate Monthly Fees for all students for ${genMonth}?`)) {
            try {
                setLoading(true);
                await api.generateMonthlyFees(genMonth, genDueDate, forceIncludeAdmission, forceIncludeAnnual);
                alert("Monthly fees generated successfully.");
                loadData();
            } catch (error) {
                console.error("Failed to generate", error);
                alert("Failed to generate fees");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleGenerateAnnual = async () => {
        if (!genYear || !genDueDate) return alert("Please select a year and due date.");
        if (window.confirm(`Generate Annual Dues for all students for ${genYear}?`)) {
            try {
                setLoading(true);
                await api.generateAnnualDues(genYear, genDueDate);
                alert("Annual dues generated successfully.");
                loadData();
            } catch (error) {
                console.error("Failed to generate", error);
                alert("Failed to generate dues");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleInspectStudent = async (student) => {
        setInspectingStudent(student);
        setInspectLoading(true);
        try {
            const data = await api.getFees(student.id);
            setStudentInvoices(data.invoices || []);
            setStudentPayments(data.history || []);
        } catch (error) {
            console.error("Failed to load student invoices", error);
            alert("Failed to load student invoices");
        } finally {
            setInspectLoading(false);
        }
    };

    if (!user || user.role !== 'admin') return <Navigate to="/login" />;
    if (loading) return <LoadingScreen message="Loading Fee System..." />;

    return (
        <div className="container" style={{ padding: '0 clamp(1rem, 5vw, 2.5rem) clamp(1rem, 3vw, 2.5rem)', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ padding: '1.5rem 0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-icon"
                        title="Go Back"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                            Fee Management System
                        </h2>
                        <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-muted)' }}>Control fee structures, generate dues, and track payments.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', overflowX: 'auto' }}>
                <button 
                    className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <BarChart3 size={18} /> Dashboard Overview
                </button>
                <button 
                    className={`btn ${activeTab === 'setup' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('setup')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <Settings size={18} /> Fee Structure Setup
                </button>
                <button 
                    className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('generate')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <Calendar size={18} /> Generate Dues
                </button>
                <button 
                    className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('students')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                >
                    <Users size={18} /> Student Balances
                </button>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DollarSign size={28} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Receivables</p>
                                    <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>Rs {reports.summary?.grandTotal || 0}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckCircle size={28} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Received (Paid)</p>
                                    <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>Rs {reports.summary?.grandPaid || 0}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', color: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <AlertCircle size={28} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>Total Pending (Due)</p>
                                    <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '2rem', fontWeight: '800' }}>Rs {reports.summary?.grandPending || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem' }}>Class-wise Collection Report</h3>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Class Name</th>
                                        <th>Total Expected</th>
                                        <th>Total Collected</th>
                                        <th>Total Pending</th>
                                        <th>Collection Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.classWise.length === 0 ? (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No data available</td></tr>
                                    ) : (
                                        reports.classWise.map((row, idx) => {
                                            const rate = row.total > 0 ? ((row.paid / row.total) * 100).toFixed(1) : 0;
                                            return (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 'bold' }}>{row.className}</td>
                                                    <td>Rs {row.total}</td>
                                                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>Rs {row.paid}</td>
                                                    <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Rs {row.pending}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${rate}%`, height: '100%', background: 'var(--success)' }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{rate}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Setup Tab */}
            {activeTab === 'setup' && (
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Class-wise Fee Structure Setup</h3>
                    
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontWeight: 'bold' }}>Select Class to Configure</label>
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)' }}
                        >
                            {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                        
                        {/* Admission Fee */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="admissionFeeEnabled" 
                                    checked={feeStructure.admissionFeeEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, admissionFeeEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="admissionFeeEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Admission Fee</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.admissionFee} 
                                onChange={(e) => setFeeStructure({...feeStructure, admissionFee: Number(e.target.value)})}
                                disabled={!feeStructure.admissionFeeEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Annual Fee */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="annualFeeEnabled" 
                                    checked={feeStructure.annualFeeEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, annualFeeEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="annualFeeEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Annual Fee</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.annualDues} 
                                onChange={(e) => setFeeStructure({...feeStructure, annualDues: Number(e.target.value)})}
                                disabled={!feeStructure.annualFeeEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Tuition Fee */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="tuitionFeeEnabled" 
                                    checked={feeStructure.tuitionFeeEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, tuitionFeeEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="tuitionFeeEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Tuition Fee (Monthly)</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.monthlyFee} 
                                onChange={(e) => setFeeStructure({...feeStructure, monthlyFee: Number(e.target.value)})}
                                disabled={!feeStructure.tuitionFeeEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Overtime Fee */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="overtimeFeeEnabled" 
                                    checked={feeStructure.overtimeFeeEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, overtimeFeeEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="overtimeFeeEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Overtime Fee (if applicable)</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.overtimeCharges} 
                                onChange={(e) => setFeeStructure({...feeStructure, overtimeCharges: Number(e.target.value)})}
                                disabled={!feeStructure.overtimeFeeEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Lab Fee */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="labFeeEnabled" 
                                    checked={feeStructure.labFeeEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, labFeeEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="labFeeEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Lab Fee</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.labFee} 
                                onChange={(e) => setFeeStructure({...feeStructure, labFee: Number(e.target.value)})}
                                disabled={!feeStructure.labFeeEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Security Charges */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="securityChargesEnabled" 
                                    checked={feeStructure.securityChargesEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, securityChargesEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="securityChargesEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Security Charges</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.securityCharges} 
                                onChange={(e) => setFeeStructure({...feeStructure, securityCharges: Number(e.target.value)})}
                                disabled={!feeStructure.securityChargesEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Sports Fee */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="sportsFeeEnabled" 
                                    checked={feeStructure.sportsFeeEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, sportsFeeEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="sportsFeeEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Sports Fee</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.sportsFee} 
                                onChange={(e) => setFeeStructure({...feeStructure, sportsFee: Number(e.target.value)})}
                                disabled={!feeStructure.sportsFeeEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* Other Charges */}
                        <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="otherChargesEnabled" 
                                    checked={feeStructure.otherChargesEnabled} 
                                    onChange={(e) => setFeeStructure({...feeStructure, otherChargesEnabled: e.target.checked})}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="otherChargesEnabled" style={{ margin: 0, fontWeight: '700', cursor: 'pointer', color: 'var(--text-main)' }}>Any Other Charges</label>
                            </div>
                            <input 
                                type="number" 
                                value={feeStructure.otherCharges} 
                                onChange={(e) => setFeeStructure({...feeStructure, otherCharges: Number(e.target.value)})}
                                disabled={!feeStructure.otherChargesEnabled}
                                placeholder="Amount ($)"
                                style={{ width: '100%' }}
                            />
                        </div>

                    </div>

                    <button onClick={handleSaveFeeStructure} className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} /> Save Structure for {selectedClass}
                    </button>
                </div>
            )}

            {/* Generate Tab */}
            {activeTab === 'generate' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} color="var(--primary)" /> Generate Monthly Fees
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            This will generate invoices for all active students based on their class's monthly fee structure (including overtime if applicable).
                        </p>
                        <div className="form-group">
                            <label>Fee Month</label>
                            <input
                                type="month"
                                value={genMonth}
                                onChange={(e) => setGenMonth(e.target.value)}
                                style={{ width: '100%', marginBottom: '1rem' }}
                            />
                        </div>
                        
                        {/* Overrides */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.50rem', marginBottom: '1rem', background: 'var(--background-alt)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="forceIncludeAdmission" 
                                    checked={forceIncludeAdmission} 
                                    onChange={(e) => setForceIncludeAdmission(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="forceIncludeAdmission" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Force Include Admission Fee (all students)</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input 
                                    type="checkbox" 
                                    id="forceIncludeAnnual" 
                                    checked={forceIncludeAnnual} 
                                    onChange={(e) => setForceIncludeAnnual(e.target.checked)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <label htmlFor="forceIncludeAnnual" style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}>Force Include Annual Fee (all students)</label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={genDueDate}
                                onChange={(e) => setGenDueDate(e.target.value)}
                                style={{ width: '100%', marginBottom: '1.5rem' }}
                            />
                        </div>
                        <button onClick={handleGenerateMonthly} className="btn btn-primary" style={{ width: '100%' }}>
                            Generate Monthly Invoices
                        </button>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FileText size={20} color="var(--danger)" /> Generate Annual Dues
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            This will generate annual admission/due invoices for all active students based on their class's annual dues structure. Usually done in January.
                        </p>
                        <div className="form-group">
                            <label>Fee Year</label>
                            <select
                                value={genYear}
                                onChange={(e) => setGenYear(e.target.value)}
                                style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)', marginBottom: '1rem' }}
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={genDueDate}
                                onChange={(e) => setGenDueDate(e.target.value)}
                                style={{ width: '100%', marginBottom: '1.5rem' }}
                            />
                        </div>
                        <button onClick={handleGenerateAnnual} className="btn" style={{ width: '100%', background: 'var(--danger)', color: 'white' }}>
                            Generate Annual Invoices
                        </button>
                    </div>
                </div>
            )}

            {/* Students Balances Tab */}
            {activeTab === 'students' && (() => {
                const filteredStudents = selectedBalanceClass === 'All' 
                    ? students 
                    : students.filter(s => s.grade_level === selectedBalanceClass || s.grade_level?.includes(selectedBalanceClass));

                return (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Student Account Balances</h3>
                            <div className="form-group" style={{ margin: 0, minWidth: '200px' }}>
                                <select 
                                    value={selectedBalanceClass}
                                    onChange={(e) => setSelectedBalanceClass(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--background)' }}
                                >
                                    <option value="All">All Classes</option>
                                    {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="table-responsive no-print">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Total Expected</th>
                                        <th>Paid</th>
                                        <th>Pending (Due)</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No student records found.</td></tr>
                                    ) : (
                                        filteredStudents.map(s => {
                                            const isPaid = s.pending <= 0 && s.total > 0;
                                            return (
                                                <tr key={s.id}>
                                                    <td>{s.id}</td>
                                                    <td>{s.name}</td>
                                                    <td>{s.grade_level}</td>
                                                    <td>Rs {s.total || 0}</td>
                                                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>Rs {s.paid || 0}</td>
                                                    <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Rs {s.pending || 0}</td>
                                                    <td>
                                                        {isPaid ? (
                                                            <span className="badge badge-success">Cleared</span>
                                                        ) : s.pending > 0 ? (
                                                            <span className="badge badge-danger">Due</span>
                                                        ) : (
                                                            <span className="badge" style={{ background: 'var(--border)' }}>N/A</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-outline btn-sm"
                                                            onClick={() => handleInspectStudent(s)}
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                                        >
                                                            Inspect Invoices
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}

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

            {/* Inspect Invoices Modal */}
            {inspectingStudent && (
                <div className="no-print" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
                    padding: '1rem'
                }}>
                    <div className="card" style={{ maxWidth: '750px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => setInspectingStudent(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <X size={24} />
                        </button>
                        
                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                            Invoices for {inspectingStudent.name} ({inspectingStudent.id})
                        </h3>
                        
                        {inspectLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</div>
                        ) : (
                            <>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>Generated Invoices</h4>
                                {studentInvoices.length === 0 ? (
                                    <div style={{ padding: '1rem', color: 'var(--text-muted)', background: 'var(--background-alt)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                                        No invoices generated yet.
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Month</th>
                                                    <th>Type</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentInvoices.map(invoice => (
                                                    <tr key={invoice.id}>
                                                        <td style={{ fontWeight: '600' }}>{invoice.month}</td>
                                                        <td style={{ textTransform: 'capitalize' }}>{invoice.fee_type}</td>
                                                        <td style={{ fontWeight: 'bold' }}>Rs {invoice.amount}</td>
                                                        <td>
                                                            <span className={`badge ${invoice.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => setActiveChallan(invoice)}
                                                            >
                                                                View Challan
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>Payment History</h4>
                                {studentPayments.length === 0 ? (
                                    <div style={{ padding: '1rem', color: 'var(--text-muted)', background: 'var(--background-alt)', borderRadius: '8px', textAlign: 'center' }}>
                                        No payments recorded yet.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Description</th>
                                                    <th>Method</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentPayments.map((pay, idx) => (
                                                    <tr key={idx}>
                                                        <td>{new Date(pay.date).toLocaleDateString()}</td>
                                                        <td>{pay.description}</td>
                                                        <td>{pay.method}</td>
                                                        <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>Rs {pay.amount}</td>
                                                        <td>
                                                            <span className={`badge ${pay.status === 'success' ? 'badge-success' : (pay.status === 'failed' ? 'badge-danger' : 'badge-warning')}`}>
                                                                {pay.status ? pay.status.toUpperCase() : 'SUCCESS'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Active Challan View / Print Modal */}
            {activeChallan && inspectingStudent && (
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
                            Fee Challan Preview - {inspectingStudent.name}
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
                            const student = inspectingStudent;
                            
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

                            // Fallback if legacy invoice has no breakdown
                            if (categories.length === 0 && invoice.amount > 0) {
                                categories.push({ label: 'Tuition Fee', val: invoice.amount });
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
