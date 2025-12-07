import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
    CreditCard,
    Clock,
    FileText,
    BookOpen,
    Bell,
    Calendar,
    MessageSquare,
    ChevronRight,
    GraduationCap
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    const menuItems = [
        { to: '/fees', label: 'Fees Status', icon: CreditCard, color: 'linear-gradient(135deg, #f97316, #fb923c)', desc: 'Check pending dues' },
        { to: '/attendance', label: 'Attendance', icon: Clock, color: 'linear-gradient(135deg, #10b981, #34d399)', desc: 'View daily records' },
        { to: '/results', label: 'Exam Results', icon: FileText, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', desc: 'Term performance' },
        { to: '/assignments', label: 'Assignments', icon: BookOpen, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', desc: 'Homework & tasks' },
        { to: '/notices', label: 'Notice Board', icon: Bell, color: 'linear-gradient(135deg, #ef4444, #f87171)', desc: 'School updates' },
        { to: '/timetable', label: 'Class Routine', icon: Calendar, color: 'linear-gradient(135deg, #eab308, #facc15)', desc: 'Weekly schedule' },
        { to: '/messages', label: 'Messages', icon: MessageSquare, color: 'linear-gradient(135deg, #ec4899, #f472b6)', desc: 'Teacher chat' },
    ];

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Profile Header */}
                <header className="dashboard-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', zIndex: 1, position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                alt={user.name}
                                style={{
                                    width: '100px', height: '100px',
                                    borderRadius: '24px',
                                    objectFit: 'cover',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '4px solid white'
                                }}
                            />
                            <div style={{
                                position: 'absolute', bottom: -5, right: -5,
                                background: 'var(--success)', color: 'white',
                                padding: '4px 8px', borderRadius: '12px',
                                fontSize: '0.75rem', fontWeight: 'bold',
                                border: '2px solid white'
                            }}>
                                Active
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>Student</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID: {user.id}</span>
                            </div>
                            <h1 style={{
                                fontSize: '2.5rem', fontWeight: '800',
                                background: 'linear-gradient(to right, var(--text-main), var(--primary))',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>
                                {user.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.75rem', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <GraduationCap size={18} /> {user.gradeLevel}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={18} /> Academic Year 2024-25
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Quick Stats Row (Optional - can be added later) */}

                {/* Menu Grid */}
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>Quick Access</h3>
                <div className="dashboard-menu-grid">
                    {menuItems.map((item) => (
                        <Link key={item.to} to={item.to} className="menu-card">
                            <div className="menu-icon" style={{ background: item.color, boxShadow: '0 8px 16px -4px rgba(0,0,0,0.1)' }}>
                                <item.icon size={28} color="white" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span className="menu-label" style={{ display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                            </div>
                            <ChevronRight size={20} color="var(--text-light)" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
