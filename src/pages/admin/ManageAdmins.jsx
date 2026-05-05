import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import {
    Users,
    UserPlus,
    Trash2,
    Search,
    ChevronLeft,
    Shield,
    Mail,
    Key,
    Edit2,
    Settings,
    Activity
} from 'lucide-react';

export default function ManageAdmins() {
    const { user, loading: authLoading } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ id: '', name: '', email: '', password: '' });
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [adminLogs, setAdminLogs] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const data = await api.getAdmins();
            setAdmins(data);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminActivity = async (adm) => {
        setSelectedAdmin(adm);
        setAdminLogs([]);
        try {
            const allLogs = await api.getLogs();
            // Filter logs related to this admin as actor or target
            const filtered = allLogs.filter(log =>
                log.userId === adm.id || log.targetId === adm.id
            ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAdminLogs(filtered);
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                await api.updateUser(newAdmin.id, newAdmin);
                alert("Administrator updated successfully!");
            } else {
                await api.addAdmin({ ...newAdmin, status: 'active' });
                alert("New Administrator created successfully!");
            }
            await fetchAdmins();
            setShowAddModal(false);
            setEditingAdmin(null);
            setNewAdmin({ id: '', name: '', email: '', password: '' });
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    const handleToggleStatus = async (adm) => {
        const newStatus = adm.status === 'disabled' ? 'active' : 'disabled';
        try {
            await api.updateUser(adm.id, { status: newStatus });
            await fetchAdmins();

            await api.addLog({
                action: 'UPDATE_ADMIN_STATUS',
                targetId: adm.id,
                targetName: adm.name,
                details: `Admin account ${newStatus} by Super Admin`,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            alert("Failed to update status: " + error.message);
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!confirm("Are you sure you want to delete this administrator? This action cannot be undone.")) return;
        try {
            await api.deleteAdmin(id);
            await fetchAdmins();
        } catch (error) {
            alert("Error: " + error.message);
        }
    };

    if (authLoading) return <div className="container"><h2>Loading...</h2></div>;
    if (!user || user.role !== 'super_admin') return <Navigate to="/login" replace />;

    const filteredAdmins = admins.filter(adm =>
        adm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adm.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link to="/super-admin/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '12px' }}>
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h2 style={{ margin: 0 }}>Administrator Control</h2>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Transparency & Accountability Panel</p>
                </div>
                <button
                    onClick={() => {
                        setEditingAdmin(null);
                        setNewAdmin({ id: '', name: '', email: '', password: '' });
                        setShowAddModal(true);
                    }}
                    className="btn btn-primary"
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', padding: '0.75rem 1.25rem' }}
                >
                    <UserPlus size={18} /> Add New Admin
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <Search className="icon-sm" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search admins by name, ID or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid var(--border)', borderRadius: '14px', background: 'var(--background)', color: 'var(--text-main)', fontSize: '1rem' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {filteredAdmins.map(adm => (
                    <div key={adm.id} className="card" style={{
                        padding: '1.5rem',
                        position: 'relative',
                        borderRadius: '20px',
                        border: '1px solid var(--border)',
                        opacity: adm.status === 'disabled' ? 0.7 : 1,
                        background: adm.status === 'disabled' ? 'var(--background)' : 'var(--surface)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: adm.status === 'disabled' ? '#94a3b8' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{adm.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{adm.id}</span>
                                        <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: adm.status === 'disabled' ? '#ef4444' : '#10b981' }}>{adm.status?.toUpperCase() || 'ACTIVE'}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button
                                    onClick={() => {
                                        setEditingAdmin(adm);
                                        setNewAdmin(adm);
                                        setShowAddModal(true);
                                    }}
                                    title="Edit Details"
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                                >
                                    <Edit2 size={18} color="var(--primary)" />
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(adm)}
                                    title={adm.status === 'disabled' ? 'Enable Account' : 'Disable Account'}
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                                >
                                    <Settings size={18} color={adm.status === 'disabled' ? '#10b981' : '#f59e0b'} />
                                </button>
                                <button
                                    onClick={() => handleDeleteAdmin(adm.id)}
                                    title="Delete Permanent"
                                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', background: 'var(--background)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Mail size={16} color="var(--text-secondary)" />
                                <span style={{ color: 'var(--text-main)' }}>{adm.email}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Key size={16} color="var(--text-secondary)" />
                                <span style={{ color: 'var(--text-main)' }}>••••••••</span>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchAdminActivity(adm)}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '14px',
                                border: '1px solid var(--primary)',
                                background: 'transparent',
                                color: 'var(--primary)',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.6rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary)';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--primary)';
                            }}
                        >
                            <Activity size={18} /> View Activity Records
                        </button>
                    </div>
                ))}
            </div>

            {/* Activity Modal */}
            {selectedAdmin && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1100, backdropFilter: 'blur(8px)' }}>
                    <div className="animate-slide-in" style={{ width: '100%', maxWidth: '500px', height: '100%', background: 'var(--surface)', padding: '2.5rem', overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Admin Oversight</h3>
                            <button onClick={() => setSelectedAdmin(null)} className="btn" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                                <ChevronLeft size={24} style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        </div>

                        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>{selectedAdmin.name}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Audit records for ID: {selectedAdmin.id}</p>
                        </div>

                        <h5 style={{ marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>Activity Trail</h5>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {adminLogs.length > 0 ? adminLogs.map((log, idx) => (
                                <div key={idx} style={{ padding: '1rem', borderLeft: '3px solid var(--primary)', background: 'var(--background)', borderRadius: '0 12px 12px 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{log.action}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.details}</p>
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                                    <Search size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>No recent activity logs found for this administrator.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingAdmin ? 'Update Administrator' : 'Add New Administrator'}</h3>
                        <form onSubmit={handleAddAdmin}>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Admin ID (Serial No.)</label>
                                <input
                                    type="text"
                                    value={newAdmin.id}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, id: e.target.value })}
                                    placeholder="e.g. ADM002"
                                    required
                                    disabled={!!editingAdmin}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '10px', background: editingAdmin ? 'var(--background-alt)' : 'var(--background)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={newAdmin.name}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={newAdmin.email}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                    placeholder="admin2@school.com"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Initial Password</label>
                                <input
                                    type="text"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    placeholder="Set a password"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn" style={{ flex: 1, border: '1px solid var(--border)' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
