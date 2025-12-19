import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen message="Initializing session..." />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        // Redirct to their own dashboard if they try to access a role they don't have
        const target = user.role === 'admin' ? '/admin/dashboard' :
            user.role === 'teacher' ? '/teacher/dashboard' : '/dashboard';
        return <Navigate to={target} replace />;
    }

    return children;
}
