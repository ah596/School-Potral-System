/**
 * ================================================
 * FIREBASE → SQLite MIGRATION SCRIPT
 * ================================================
 * Yeh script Firebase Firestore se SARA data
 * fetch karke SQLite database mein insert karta hai.
 *
 * Run: node migrate-from-firebase.js
 * ================================================
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

// ================================================
// 1. Firebase Admin SDK Initialize
// ================================================
const serviceAccount = require('../serviceAccountKey.json');

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const firestore = getFirestore();

// ================================================
// 2. SQLite DB Connect
// ================================================
let db;

async function connectDB() {
    db = await open({
        filename: path.join(__dirname, 'school.db'),
        driver: sqlite3.Database
    });
    await db.exec('PRAGMA foreign_keys = OFF'); // Temporarily off for migration
    console.log('✅ SQLite connected');
}

// ================================================
// Helper: Safe insert (ignore if already exists)
// ================================================
const safeRun = async (sql, params) => {
    try {
        await db.run(sql, params);
    } catch (e) {
        if (!e.message.includes('UNIQUE constraint')) {
            console.warn('  ⚠️  DB Warning:', e.message.slice(0, 80));
        }
    }
};

// ================================================
// 3. MIGRATION FUNCTIONS
// ================================================

async function migrateUsers() {
    console.log('\n📦 Migrating USERS (students, teachers, admins)...');
    const snap = await firestore.collection('users').get();
    let count = 0;

    for (const docSnap of snap.docs) {
        const u = docSnap.data();
        const id = docSnap.id;
        const role = u.role || 'student';

        // Insert into users table
        await safeRun(`
            INSERT OR REPLACE INTO users (id, password, name, role, email, phone, photo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            u.password || 'password123',
            u.name || 'Unknown',
            role === 'super_admin' ? 'superadmin' : role, // normalize role
            u.email || null,
            u.phone || null,
            u.photo || null
        ]);

        // Insert role-specific details
        if (role === 'student') {
            await safeRun(`
                INSERT OR REPLACE INTO students (id, grade_level, attendance_percentage, parent_name, parent_phone, address, dob)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                u.gradeLevel || u.grade_level || null,
                u.attendancePercentage || u.attendance_percentage || 0,
                u.parentName || u.parent_name || null,
                u.parentPhone || u.parent_phone || null,
                u.address || null,
                u.dob || null
            ]);

            // Create fee_status if not exists
            await safeRun(`
                INSERT OR IGNORE INTO fee_status (student_id, total, paid, pending)
                VALUES (?, 5000, 0, 5000)
            `, [id]);
        }

        if (role === 'teacher') {
            const classes = Array.isArray(u.classes) ? JSON.stringify(u.classes) : (u.classes || '[]');
            await safeRun(`
                INSERT OR REPLACE INTO teachers (id, subject, classes, salary, join_date, qualification)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                id,
                u.subject || null,
                classes,
                u.salary || 0,
                u.joinDate || u.join_date || null,
                u.qualification || null
            ]);
        }

        count++;
        console.log(`  ✓ ${role.toUpperCase()} → ${id} (${u.name})`);
    }
    console.log(`  ✅ Total users migrated: ${count}`);
}

async function migrateNotices() {
    console.log('\n📢 Migrating NOTICES...');
    const snap = await firestore.collection('notices').get();
    let count = 0;

    for (const docSnap of snap.docs) {
        const n = docSnap.data();
        await safeRun(`
            INSERT OR IGNORE INTO notices (title, date, content, priority, audience, target_class, type, author_id, author_name, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            n.title || 'Untitled',
            n.date || new Date().toISOString().split('T')[0],
            n.content || '',
            n.priority || 'Medium',
            n.audience || n.type || 'all',
            n.targetClass || null,
            n.type || 'global',
            n.authorId || null,
            n.authorName || null,
            n.timestamp || new Date().toISOString()
        ]);
        count++;
        console.log(`  ✓ Notice → ${n.title}`);
    }
    console.log(`  ✅ Total notices: ${count}`);
}

async function migrateTests() {
    console.log('\n📝 Migrating TESTS & MARKS...');
    const snap = await firestore.collection('tests').get();
    let count = 0;

    for (const docSnap of snap.docs) {
        const t = docSnap.data();
        const result = await db.run(`
            INSERT OR IGNORE INTO tests (name, subject, date, total_marks, section, class_name, teacher_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            t.name || 'Test',
            t.subject || '',
            t.date || new Date().toISOString().split('T')[0],
            t.totalMarks || 100,
            t.section || null,
            t.className || t.class_name || null,
            t.teacherId || null
        ]);

        const testId = result?.lastID;

        // Migrate marks (if stored in test doc or separate collection)
        if (t.marks && typeof t.marks === 'object') {
            for (const [studentId, score] of Object.entries(t.marks)) {
                await safeRun(`
                    INSERT OR IGNORE INTO marks (test_id, student_id, marks_obtained)
                    VALUES (?, ?, ?)
                `, [testId, studentId, score]);
            }
        }

        count++;
        console.log(`  ✓ Test → ${t.name} (${t.subject})`);
    }

    // Also check separate marks collection
    try {
        const marksSnap = await firestore.collection('marks').get();
        for (const mDoc of marksSnap.docs) {
            const m = mDoc.data();
            await safeRun(`
                INSERT OR IGNORE INTO marks (test_id, student_id, marks_obtained)
                VALUES (?, ?, ?)
            `, [m.testId, m.studentId, m.score || m.marks_obtained]);
        }
    } catch (e) { /* marks collection might not exist */ }

    console.log(`  ✅ Total tests: ${count}`);
}

async function migrateAttendance() {
    console.log('\n📅 Migrating ATTENDANCE...');
    const snap = await firestore.collection('attendance').get();
    let count = 0;

    for (const docSnap of snap.docs) {
        const a = docSnap.data();
        await safeRun(`
            INSERT OR IGNORE INTO attendance (user_id, date, status, type)
            VALUES (?, ?, ?, ?)
        `, [
            a.userId || a.user_id,
            a.date,
            a.status,
            a.type || 'student'
        ]);
        count++;
    }
    console.log(`  ✅ Total attendance records: ${count}`);
}

async function migrateClasses() {
    console.log('\n🏫 Migrating CLASSES...');
    const snap = await firestore.collection('classes').get();
    let count = 0;

    for (const docSnap of snap.docs) {
        const c = docSnap.data();
        await safeRun(`
            INSERT OR IGNORE INTO classes (name, section, class_teacher_id, room_number, capacity)
            VALUES (?, ?, ?, ?, ?)
        `, [
            c.name || '',
            c.section || '',
            c.classTeacherId || c.class_teacher_id || null,
            c.roomNumber || c.room_number || null,
            c.capacity || 40
        ]);
        count++;
        console.log(`  ✓ Class → ${c.name} ${c.section}`);
    }
    console.log(`  ✅ Total classes: ${count}`);
}

async function migrateFees() {
    console.log('\n💰 Migrating FEES...');

    // fee_status collection
    try {
        const feeStatusSnap = await firestore.collection('fee_status').get();
        for (const docSnap of feeStatusSnap.docs) {
            const f = docSnap.data();
            await safeRun(`
                INSERT OR REPLACE INTO fee_status (student_id, total, paid, pending)
                VALUES (?, ?, ?, ?)
            `, [docSnap.id, f.total || 5000, f.paid || 0, f.pending || 5000]);
        }
        console.log(`  ✅ fee_status: ${feeStatusSnap.size} records`);
    } catch (e) { console.log('  ℹ️  fee_status collection not found'); }

    // student_fees collection
    try {
        const sfSnap = await firestore.collection('student_fees').get();
        for (const docSnap of sfSnap.docs) {
            const f = docSnap.data();
            await safeRun(`
                INSERT OR REPLACE INTO student_fees (id, student_id, month, status, amount, proof_url, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [docSnap.id, f.studentId, f.month, f.status, f.amount || 0, f.proofUrl || null, f.updatedAt || null]);
        }
        console.log(`  ✅ student_fees: ${sfSnap.size} records`);
    } catch (e) { console.log('  ℹ️  student_fees collection not found'); }

    // payments collection
    try {
        const paymentsSnap = await firestore.collection('payments').get();
        for (const docSnap of paymentsSnap.docs) {
            const p = docSnap.data();
            await safeRun(`
                INSERT OR IGNORE INTO payments (student_id, amount, date, method, description)
                VALUES (?, ?, ?, ?, ?)
            `, [p.studentId, p.amount, p.date, p.method || 'cash', p.description || null]);
        }
        console.log(`  ✅ payments: ${paymentsSnap.size} records`);
    } catch (e) { console.log('  ℹ️  payments collection not found'); }
}

async function migrateTimetables() {
    console.log('\n📋 Migrating TIMETABLES...');
    try {
        const snap = await firestore.collection('timetables').get();
        let count = 0;
        for (const docSnap of snap.docs) {
            const data = JSON.stringify(docSnap.data());
            await safeRun(`
                INSERT OR REPLACE INTO timetables (id, grade_level, data)
                VALUES (?, ?, ?)
            `, [docSnap.id, docSnap.id, data]);
            count++;
            console.log(`  ✓ Timetable → ${docSnap.id}`);
        }
        console.log(`  ✅ Total timetables: ${count}`);
    } catch (e) { console.log('  ℹ️  timetables collection not found'); }
}

async function migrateMessages() {
    console.log('\n💬 Migrating MESSAGES...');
    try {
        const snap = await firestore.collection('messages').get();
        let count = 0;
        for (const docSnap of snap.docs) {
            const m = docSnap.data();
            await safeRun(`
                INSERT OR IGNORE INTO messages (from_id, from_name, to_id, subject, message, role, date, time, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                m.fromId || null,
                m.fromName || null,
                m.toId || null,
                m.subject || null,
                m.message || '',
                m.role || null,
                m.date || null,
                m.time || null,
                m.timestamp?.toDate?.()?.toISOString() || m.timestamp || null
            ]);
            count++;
        }
        console.log(`  ✅ Total messages: ${count}`);
    } catch (e) { console.log('  ℹ️  messages collection not found'); }
}

async function migrateAssignments() {
    console.log('\n📚 Migrating ASSIGNMENTS...');
    try {
        const snap = await firestore.collection('assignments').get();
        let count = 0;
        for (const docSnap of snap.docs) {
            const a = docSnap.data();
            await safeRun(`
                INSERT OR IGNORE INTO assignments (title, subject, class_name, due_date, message, file_url, teacher_id, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                a.title || 'Assignment',
                a.subject || null,
                a.className || null,
                a.dueDate || null,
                a.message || null,
                a.fileUrl || null,
                a.teacherId || null,
                a.createdAt || null
            ]);
            count++;
            console.log(`  ✓ Assignment → ${a.title}`);
        }
        console.log(`  ✅ Total assignments: ${count}`);
    } catch (e) { console.log('  ℹ️  assignments collection not found'); }
}

async function migrateGallery() {
    console.log('\n🖼️  Migrating GALLERY...');
    try {
        const snap = await firestore.collection('gallery').get();
        let count = 0;
        for (const docSnap of snap.docs) {
            const g = docSnap.data();
            await safeRun(`
                INSERT OR IGNORE INTO gallery (title, image_url, created_at)
                VALUES (?, ?, ?)
            `, [g.title || null, g.imageUrl || '', g.createdAt || null]);
            count++;
        }
        console.log(`  ✅ Total gallery items: ${count}`);
    } catch (e) { console.log('  ℹ️  gallery collection not found'); }
}

async function migrateLogs() {
    console.log('\n📜 Migrating AUDIT LOGS...');
    try {
        const snap = await firestore.collection('logs').get();
        let count = 0;
        for (const docSnap of snap.docs) {
            const l = docSnap.data();
            await safeRun(`
                INSERT OR IGNORE INTO logs (action, target_id, target_name, details, timestamp)
                VALUES (?, ?, ?, ?, ?)
            `, [l.action, l.targetId, l.targetName, l.details, l.timestamp]);
            count++;
        }
        console.log(`  ✅ Total logs: ${count}`);
    } catch (e) { console.log('  ℹ️  logs collection not found'); }
}

// ================================================
// 4. MAIN
// ================================================
async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   🔥 Firebase → SQLite Migration Tool   ║');
    console.log('║   Project: kgs-school-portal             ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    try {
        await connectDB();

        await migrateUsers();
        await migrateNotices();
        await migrateTests();
        await migrateAttendance();
        await migrateClasses();
        await migrateFees();
        await migrateTimetables();
        await migrateMessages();
        await migrateAssignments();
        await migrateGallery();
        await migrateLogs();

        // Re-enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ✅ MIGRATION COMPLETE!                 ║');
        console.log('║   Sab data SQL mein aa gaya!             ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');

        // Show summary
        const userCount   = await db.get('SELECT count(*) as c FROM users');
        const stuCount    = await db.get('SELECT count(*) as c FROM students');
        const tchCount    = await db.get('SELECT count(*) as c FROM teachers');
        const notCount    = await db.get('SELECT count(*) as c FROM notices');
        const testCount   = await db.get('SELECT count(*) as c FROM tests');
        const attCount    = await db.get('SELECT count(*) as c FROM attendance');
        const clsCount    = await db.get('SELECT count(*) as c FROM classes');
        const msgCount    = await db.get('SELECT count(*) as c FROM messages');
        const asnCount    = await db.get('SELECT count(*) as c FROM assignments');

        console.log('📊 SUMMARY:');
        console.log(`   👥 Total Users      : ${userCount.c}`);
        console.log(`   🎓 Students         : ${stuCount.c}`);
        console.log(`   👨‍🏫 Teachers         : ${tchCount.c}`);
        console.log(`   📢 Notices          : ${notCount.c}`);
        console.log(`   📝 Tests            : ${testCount.c}`);
        console.log(`   📅 Attendance       : ${attCount.c}`);
        console.log(`   🏫 Classes          : ${clsCount.c}`);
        console.log(`   💬 Messages         : ${msgCount.c}`);
        console.log(`   📚 Assignments      : ${asnCount.c}`);

    } catch (err) {
        console.error('\n❌ Migration FAILED:', err.message);
        console.error(err);
    } finally {
        await db?.close();
        process.exit(0);
    }
}

main();
