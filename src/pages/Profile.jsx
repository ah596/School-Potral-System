import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Award, Edit, Briefcase, GraduationCap } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>My Profile</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Profile Card */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                        {user.role === 'student' ? (
                            <img
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=200`}
                                alt={user.name}
                                style={{
                                    width: '150px', height: '150px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '4px solid var(--primary)',
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '150px', height: '150px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem',
                                fontWeight: '700',
                                color: 'white',
                                boxShadow: 'var(--shadow-lg)',
                                border: '4px solid white'
                            }}>
                                {user.name.charAt(0)}
                            </div>
                        )}
                        <div style={{
                            position: 'absolute', bottom: 5, right: 5,
                            width: '40px', height: '40px',
                            background: 'var(--primary)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-md)',
                            border: '3px solid white'
                        }}>
                            <Edit size={18} color="white" />
                        </div>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '800' }}>{user.name}</h3>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {user.role === 'student' ? user.gradeLevel : user.role === 'teacher' ? user.subject : 'Administrator'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                            {user.role === 'student' ? 'Student' : user.role === 'teacher' ? 'Teacher' : 'Admin'}
                        </span>
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                            Active
                        </span>
                    </div>
                    <button className="btn btn-primary btn-block">
                        <Edit size={18} /> Edit Profile
                    </button>
                </div>

                {/* Personal Information */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={24} color="var(--primary)" />
                        Personal Information
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                {user.role === 'student' ? 'Student ID' : user.role === 'teacher' ? 'Teacher ID' : 'Admin ID'}
                            </label>
                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>{user.id}</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                Full Name
                            </label>
                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>{user.name}</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                <Mail size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Email
                            </label>
                            <p style={{ margin: 0, fontSize: '1.05rem' }}>{user.email || `${user.id.toLowerCase()}@school.com`}</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                <Phone size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Phone
                            </label>
                            <p style={{ margin: 0, fontSize: '1.05rem' }}>{user.phone || '+1 234 567 8900'}</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                Address
                            </label>
                            <p style={{ margin: 0, fontSize: '1.05rem' }}>123 School Street, City, State</p>
                        </div>
                    </div>
                </div>

                {/* Role-Specific Information */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user.role === 'student' ? (
                            <><Award size={24} color="var(--primary)" /> Academic Information</>
                        ) : user.role === 'teacher' ? (
                            <><Briefcase size={24} color="var(--primary)" /> Professional Information</>
                        ) : (
                            <><GraduationCap size={24} color="var(--primary)" /> Administrative Information</>
                        )}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {user.role === 'student' ? (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Grade Level
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>{user.gradeLevel}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        Academic Year
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem' }}>2024-2025</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Attendance
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--success)' }}>
                                        {user.attendance?.percentage || 85}%
                                    </p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Overall Performance
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--primary)' }}>
                                        Grade A
                                    </p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Class Rank
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>
                                        #5 of 45
                                    </p>
                                </div>
                            </>
                        ) : user.role === 'teacher' ? (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Subject
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>{user.subject}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Classes Assigned
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem' }}>{(user.classes || []).join(', ')}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        Join Date
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem' }}>{user.joinDate || '2020-01-15'}</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Salary
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--success)' }}>
                                        ${user.salary || '5000'}/month
                                    </p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Employment Status
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--success)' }}>
                                        Full-Time
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Role
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600' }}>School Administrator</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Department
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem' }}>Administration</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                        Join Date
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem' }}>2018-06-01</p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Access Level
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--primary)' }}>
                                        Full Access
                                    </p>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: '600' }}>
                                        Responsibilities
                                    </label>
                                    <p style={{ margin: 0, fontSize: '1.05rem' }}>
                                        School Management & Operations
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
