import { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { api } from '../utils/api';
import { ShieldCheck, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MigrateData() {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    const handleMigration = async () => {
        setStatus('loading');
        setLogs([]);
        addLog('Starting migration from local server (http://localhost:5000)...');

        try {
            const batch = writeBatch(db);
            let count = 0;

            // 1. Migrate Students
            addLog('Fetching students from local server...');
            const studentsRes = await fetch('http://localhost:5000/api/students');
            if (!studentsRes.ok) throw new Error('Failed to fetch students from local server. Ensure it is running.');
            const students = await studentsRes.json();
            addLog(`Found ${students.length} students.`);

            for (const student of students) {
                const ref = doc(db, 'users', student.id);
                // Ensure proper structure for Firestore
                const userData = {
                    id: student.id,
                    name: student.name,
                    role: 'student',
                    email: student.email || `${student.id.toLowerCase()}@school.com`, // Ensure email exists
                    photo: student.photo || '',
                    password: student.password || 'password123',
                    grade_level: student.grade_level || '',
                    attendance_percentage: student.attendance_percentage || 0
                };
                batch.set(ref, userData);
                count++;
            }

            // 2. Migrate Teachers
            addLog('Fetching teachers from local server...');
            const teachersRes = await fetch('http://localhost:5000/api/teachers');
            if (!teachersRes.ok) throw new Error('Failed to fetch teachers from local server.');
            const teachers = await teachersRes.json();
            addLog(`Found ${teachers.length} teachers.`);

            for (const teacher of teachers) {
                const ref = doc(db, 'users', teacher.id);
                const userData = {
                    id: teacher.id,
                    name: teacher.name,
                    role: 'teacher',
                    email: teacher.email || `${teacher.id.toLowerCase()}@school.com`, // Ensure email exists
                    photo: teacher.photo || '',
                    password: teacher.password || 'password123',
                    subject: teacher.subject || '',
                    classes: teacher.classes || [],
                    salary: teacher.salary || 0,
                    join_date: teacher.join_date || new Date().toISOString()
                };

                batch.set(ref, userData);
                count++;
            }

            // 3. Migrate Notices
            addLog('Fetching notices from local server...');
            const noticesRes = await fetch('http://localhost:5000/api/notices');
            if (noticesRes.ok) {
                const notices = await noticesRes.json();
                addLog(`Found ${notices.length} notices.`);
                for (const notice of notices) {
                    const ref = doc(collection(db, 'notices')); // Use new ID or preserve? Let's preserve if string
                    batch.set(ref, {
                        ...notice,
                        id: notice.id?.toString() || '',
                        timestamp: notice.date || new Date().toISOString()
                    });
                    count++;
                }
            }

            // 4. Migrate Classes
            addLog('Fetching classes from local server...');
            const classesRes = await fetch('http://localhost:5000/api/classes');
            if (classesRes.ok) {
                const classes = await classesRes.json();
                addLog(`Found ${classes.length} classes.`);
                for (const cls of classes) {
                    const ref = doc(db, 'classes', cls.id.toString());
                    batch.set(ref, {
                        ...cls,
                        id: cls.id.toString(),
                        classTeacherId: cls.class_teacher_id || ''
                    });
                    count++;
                }
            }

            // 5. Ensure Admin and Super Admin accounts exist for entry
            addLog('Ensuring Admin (ADM001) and Super Admin (SUPER001) accounts exist...');
            const adminRef = doc(db, 'users', 'ADM001');
            batch.set(adminRef, {
                id: 'ADM001',
                name: 'Principal Anderson',
                role: 'admin',
                email: 'admin@school.com',
                password: 'admin123'
            }, { merge: true });

            const superAdminRef = doc(db, 'users', 'SUPER001');
            batch.set(superAdminRef, {
                id: 'SUPER001',
                name: 'Super Administrator',
                role: 'super_admin',
                email: 'superadmin@school.com',
                password: 'superadmin123'
            }, { merge: true });
            count += 2;

            addLog(`Committing ${count} documents to Firestore...`);
            await batch.commit();

            addLog('Migration completed successfully!');
            setStatus('success');
        } catch (error) {
            console.error(error);
            addLog(`ERROR: ${error.message}`);
            addLog('TIP: Make sure your local backend (npm start in /backend) is running!');
            setStatus('error');
        }
    };

    const handleSeedAdmin = async () => {
        setStatus('loading');
        setLogs([]);
        addLog('Seeding Admin and Super Admin accounts to Firestore...');
        try {
            const adminRef = doc(db, 'users', 'ADM001');
            await setDoc(adminRef, {
                id: 'ADM001',
                name: 'Principal Anderson',
                role: 'admin',
                email: 'admin@school.com',
                password: 'admin123'
            }, { merge: true });

            const superAdminRef = doc(db, 'users', 'SUPER001');
            await setDoc(superAdminRef, {
                id: 'SUPER001',
                name: 'Super Administrator',
                role: 'super_admin',
                email: 'superadmin@school.com',
                password: 'superadmin123'
            }, { merge: true });

            addLog('Admin account (ADM001) and Super Admin (SUPER001) successfully created/updated.');
            addLog('Admin: ADM001 / admin123');
            addLog('Super Admin: SUPER001 / superadmin123');
            setStatus('success');
        } catch (error) {
            addLog(`ERROR: ${error.message}`);
            setStatus('error');
        }
    };

    const handleSyncAuth = async () => {
        setStatus('loading');
        setLogs([]);
        addLog('Connecting Firestore users to Firebase Auth accounts...');
        try {
            const result = await api.syncUsersToAuth();
            addLog(`Sync Status: ${result.created} created, ${result.errors} already existing or failed.`);
            addLog('All users can now log in using their ID and the default password (password123).');
            setStatus('success');
        } catch (error) {
            addLog(`ERROR: ${error.message}`);
            setStatus('error');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Database size={32} color="var(--primary)" />
                    <h2>Database Migration Tool</h2>
                </div>

                <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    This tool restores your School Portal by moving data from the local database (SQLite) to Firebase Firestore.
                    It also <strong>ensures the Admin account (ADM001) is set up</strong> so you can log in.
                </p>

                <div style={{ padding: '1rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <strong>Prerequisite:</strong> Make sure your local server is running. Open a new terminal and run:<br />
                    <code>cd backend && npm start</code>
                </div>

                <div style={{
                    background: '#1e293b',
                    color: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    height: '300px',
                    overflowY: 'auto',
                    border: '1px solid #334155',
                    marginBottom: '1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                }}>
                    {logs.length === 0 ? <span style={{ color: '#64748b' }}>// Ready to sync data...</span> : logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '6px', borderLeft: '2px solid #3b82f6', paddingLeft: '8px' }}>{log}</div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleMigration}
                        disabled={status === 'loading'}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        {status === 'loading' ? 'Migrating...' : 'Start Full Migration (Needs Backend)'}
                    </button>

                    <button
                        onClick={handleSyncAuth}
                        disabled={status === 'loading'}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '1rem', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}
                    >
                        {status === 'loading' ? 'Syncing...' : 'Step 2: Create Login Accounts (Auth Sync)'}
                    </button>

                    <button
                        onClick={handleSeedAdmin}
                        disabled={status === 'loading'}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '1rem', background: '#64748b', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}
                    >
                        {status === 'loading' ? 'Processing...' : 'Emergency: Reset Admin Account'}
                    </button>
                </div>

                {status === 'success' && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#dcfce7',
                        color: '#166534',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <CheckCircle size={20} />
                        Migration Complete! You can now switch api.js to use Firebase.
                    </div>
                )}
            </div>
        </div>
    );
}
