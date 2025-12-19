import { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';
// import { auth } from '../firebase'; // Uncomment when config is ready

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for persisted session in sessionStorage
        try {
            const savedUser = sessionStorage.getItem('school_portal_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error("Auth initialization failed", e);
            sessionStorage.removeItem('school_portal_user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (id, password) => {
        try {
            const userData = await api.login(id, password);
            setUser(userData);
            sessionStorage.setItem('school_portal_user', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('school_portal_user');
        // if (auth) auth.signOut(); 
    };

    const updateUser = (input) => {
        // Handle both direct updates or functional updates
        const newUserData = typeof input === 'function' ? input(user) : input;
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        sessionStorage.setItem('school_portal_user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
