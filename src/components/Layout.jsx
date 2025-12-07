import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import StudentNav from './StudentNav';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user } = useAuth();
    return (
        <div className="app-layout">
            <Navbar />
            {/* {user && <StudentNav />} */}
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 School Portal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
