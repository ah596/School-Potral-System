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
        addLog('Starting migration...');

        try {
            const batch = writeBatch(db);
            let count = 0;

            // 1. Migrate Students
            addLog('Fetching students from local database...');
            const students = await api.getStudents();
            addLog(`Found ${students.length} students.`);

            for (const student of students) {
                const ref = doc(db, 'users', student.id);
                // Split base user data and student specific data
                const userData = {
                    id: student.id,
                    name: student.name,
                    role: 'student',
                    email: student.email || '',
                    photo: student.photo || '',
                    // Default password for Firebase Auth migration (handled separately ideally, but storing ref here)
                };
                const studentData = {
                    grade_level: student.grade_level,
                    attendance_percentage: student.attendance_percentage || 0
                };

                batch.set(ref, { ...userData, ...studentData });
                count++;
            }

            // 2. Migrate Teachers
            addLog('Fetching teachers from local database...');
            const teachers = await api.getTeachers();
            addLog(`Found ${teachers.length} teachers.`);

            for (const teacher of teachers) {
                const ref = doc(db, 'users', teacher.id);
                const userData = {
                    id: teacher.id,
                    name: teacher.name,
                    role: 'teacher',
                    email: teacher.email || '',
                    photo: teacher.photo || ''
                };
                const teacherData = {
                    subject: teacher.subject,
                    classes: teacher.classes || [],
                    salary: teacher.salary,
                    join_date: teacher.join_date
                };

                batch.set(ref, { ...userData, ...teacherData });
                count++;
            }

            // 3. Migrate Notices
            addLog('Fetching notices...');
            const notices = await api.getNotices();
            addLog(`Found ${notices.length} notices.`);

            for (const notice of notices) {
                // Use auto-ID for notices or preserve ID if it was a string, but local DB uses Integers. 
                // Better to let Firestore generate ID or use stringified ID.
                const ref = doc(db, 'notices', notice.id.toString());
                batch.set(ref, notice);
                count++;
            }

            // 4. Migrate Classes
            addLog('Fetching classes...');
            const classes = await api.getClasses();
            addLog(`Found ${classes.length} classes.`);

            for (const cls of classes) {
                const ref = doc(db, 'classes', cls.id.toString());
                batch.set(ref, cls);
                count++;
            }

            // 5. Migrate Admin (Hardcoded usually in seed, but let's Ensure)
            const adminRef = doc(db, 'users', 'ADM001');
            batch.set(adminRef, {
                id: 'ADM001',
                name: 'Principal Anderson',
                role: 'admin',
                email: 'admin@school.com'
            });
            count++;


            addLog(`Committing ${count} documents to Firestore...`);
            await batch.commit();

            addLog('Migration completed successfully!');
            setStatus('success');

        } catch (error) {
            console.error(error);
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
                    This tool moves data from your local SQLite database to your new Firebase Firestore database.
                    Click the button below to start.
                </p>

                <div style={{
                    background: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    height: '300px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.5rem',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                }}>
                    {logs.length === 0 ? <span style={{ color: '#94a3b8' }}>Waiting to start...</span> : logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                    ))}
                </div>

                <button
                    onClick={handleMigration}
                    disabled={status === 'loading'}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem' }}
                >
                    {status === 'loading' ? 'Migrating...' : 'Start Migration'}
                </button>

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
