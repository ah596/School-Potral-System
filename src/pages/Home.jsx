import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect based on user role or to login if not authenticated
        if (user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.role === 'teacher') {
                navigate('/teacher/dashboard', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'var(--background)',
            color: 'var(--text)'
        }}>
            <h2>Loading...</h2>
        </div>
    );
}
