import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    GraduationCap,
    LayoutDashboard,
    LogIn,
    LogOut,
    User,
    Menu,
    X,
    Home,
    Sun,
    Moon,
    Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Get dashboard link based on role
    const getDashboardLink = () => {
        if (!user) return '/dashboard';
        if (user.role === 'teacher') return '/teacher/dashboard';
        if (user.role === 'admin') return '/admin/dashboard';
        return '/dashboard';
    };

    const getDashboardLabel = () => {
        if (!user) return 'Dashboard';
        if (user.role === 'teacher') return 'Teacher Dashboard';
        if (user.role === 'admin') return 'Admin Dashboard';
        return 'Dashboard';
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <a href="/#home" className="logo" style={{ background: 'none', WebkitTextFillColor: 'var(--text-main)', color: 'var(--text-main)', position: 'relative', height: '45px', display: 'flex', alignItems: 'center', minWidth: '200px', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="School Logo" style={{ width: '100px', height: '100px', objectFit: 'contain', position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <span style={{ fontSize: '1.4rem', fontWeight: '700', marginLeft: '77px' }}>School Portal</span>
                </a>

                {/* Desktop Navigation */}
                <div className="nav-links desktop-nav">
                    <a href="/#home" className="nav-link">
                        <Home className="icon-sm" />
                        <span>Home</span>
                    </a>
                    {user && (
                        <>
                            <NavLink to={getDashboardLink()} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <LayoutDashboard className="icon-sm" />
                                <span>{getDashboardLabel()}</span>
                            </NavLink>
                            <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                                <User className="icon-sm" />
                                <span>Profile</span>
                            </NavLink>
                        </>
                    )}

                    <button onClick={toggleTheme} className="btn btn-outline btn-sm" style={{ padding: '0.4rem', border: 'none' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {user ? (
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">
                            <LogOut className="icon-sm" />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            <LogIn className="icon-sm" />
                            <span>Login</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle - Only for Logged In Users */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={toggleTheme} className="hamburger-btn" style={{ marginRight: user ? 0 : '1rem' }}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {user ? (
                        <button className="hamburger-btn" onClick={toggleMenu}>
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    ) : (
                        <Link to="/login" className="btn btn-primary mobile-login-btn">
                            <LogIn size={20} />
                        </Link>
                    )}
                </div>

                {/* Mobile Navigation Overlay */}
                {isMenuOpen && user && (
                    <div className="mobile-menu">
                        <a href="/#home" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <Home size={18} /> Home
                        </a>
                        <NavLink to={getDashboardLink()} className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <LayoutDashboard size={18} /> {getDashboardLabel()}
                        </NavLink>
                        <NavLink to="/profile" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                            <User size={18} /> Profile
                        </NavLink>

                        <div className="mobile-user-actions">
                            <div className="mobile-user-info">
                                <User size={18} /> {user.name}
                            </div>
                            <button onClick={handleLogout} className="btn btn-outline btn-block">
                                <LogOut size={18} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
