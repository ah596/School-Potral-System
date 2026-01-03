import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import StudentNav from './StudentNav';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export default function Layout() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Don't show on home, dashboard, or login pages
    const showBackButton = false; // Using integrated headers in each page instead

    return (
        <div className="app-layout">
            <Navbar />
            {/* {user && <StudentNav />} */}
            <main className="main-content">
                {showBackButton && (
                    <div className="container" style={{ paddingTop: '0', paddingBottom: '0.5rem' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '42px',
                                height: '42px',
                                borderRadius: '12px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginTop: '1rem',
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
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                )}
                <Outlet />
            </main>
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 School Portal. All rights reserved. | <Link to="/#gallery" style={{ color: 'var(--primary)', textDecoration: 'none' }}>School Gallery</Link></p>
                </div>
            </footer>
        </div>
    );
}
