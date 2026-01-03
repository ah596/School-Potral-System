import { db, auth, storage, firebaseConfig } from '../firebase';
import {
    collection, getDocs, getDoc, doc,
    addDoc, setDoc, updateDoc, deleteDoc,
    query, where, orderBy, writeBatch, onSnapshot
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';


// Helper to convert snap to data with ID
// Helper to convert snap to data with ID
const docsData = (snap) => snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Helper to create Auth User without logging out Admin
const createAuthUser = async (email, password) => {
    // 1. Initialize a secondary app instance with a UNIQUE name to prevent conflicts
    const appName = `Secondary_${Date.now()}_${Math.random()}`;
    const secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    try {
        // 2. Create the user
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        return userCredential.user.uid;
    } catch (error) {
        throw error;
    } finally {
        // 3. Clean up
        try {
            await deleteApp(secondaryApp);
        } catch (e) {
            console.error("Failed to cleanup temp app:", e);
        }
    }
};

export const api = {
    // Auth (Login with Firebase Auth or fallback to ID lookup)
    login: async (idOrEmail, password) => {
        // ... (existing login logic)
        try {
            // 1. Try to find user by ID in Firestore first
            const userRef = doc(db, 'users', idOrEmail);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                if (userData.email) {
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);

                        // Sync password if it changed (e.g. via Forgot Password link)
                        if (userData.password !== password) {
                            await updateDoc(userRef, { password: password });
                            userData.password = password;
                        }

                        return { ...userData, uid: userCredential.user.uid };
                    } catch (e) {
                        // Demo Fallback / Lazy Registration: 
                        // If the user exists in Firestore but NOT in Firebase Auth yet,
                        // and they are using the default password, create their account.
                        if (e.code === 'auth/user-not-found' && (password === 'password123' || password === 'admin123')) {
                            try {
                                const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
                                return { ...userData, uid: userCredential.user.uid };
                            } catch (regError) {
                                console.warn("Lazy setup failed", regError);
                            }
                        }

                        // Otherwise real error (e.g. auth/wrong-password or auth/invalid-credential)
                        throw new Error('Invalid credentials');
                    }
                }
            } else {
                // Try Login as Email directly (if using a different ID than Firestore ID)

                try {
                    const userCredential = await signInWithEmailAndPassword(auth, idOrEmail, password);
                    // Find the user document by email
                    const q = query(collection(db, 'users'), where('email', '==', idOrEmail));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const docId = querySnapshot.docs[0].id;
                        const userData = querySnapshot.docs[0].data();

                        // Sync password if it changed (e.g. via Forgot Password link)
                        if (userData.password !== password) {
                            const userRef = doc(db, 'users', docId);
                            await updateDoc(userRef, { password: password });
                            userData.password = password;
                        }

                        return { id: docId, ...userData, uid: userCredential.user.uid };
                    }
                } catch (e) {
                    // ignore
                }
            }
            throw new Error('User not found or invalid credentials');
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    updateUserProfile: async (id, data) => {
        const ref = doc(db, 'users', id);
        await updateDoc(ref, data);
        return { id, ...data };
    },

    checkEmailExists: async (email, excludeId = null) => {
        if (!email) return false;
        const q = query(collection(db, 'users'), where('email', '==', email));
        const snap = await getDocs(q);

        if (snap.empty) return false;

        // If specific user to exclude (for updates)
        if (excludeId) {
            // Check if any doc ID is NOT the excludeId
            const otherUser = snap.docs.find(doc => doc.id !== excludeId);
            return !!otherUser;
        }

        return true;
    },

    uploadFile: async (file, path) => {
        if (!file) return null;
        try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Upload failed. Verify firebase storage rules contain: allow read, write: if request.auth != null; OR allow read, write: if true;", error);
            // Return null or throw? Throwing is better so UI knows.
            throw error;
        }
    },



    logout: async () => {
        await signOut(auth);
    },

    // Students
    getStudents: async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'student'));
        const snap = await getDocs(q);
        return docsData(snap);
    },

    getStudent: async (id) => {
        const docRef = doc(db, 'users', id);
        const snap = await getDoc(docRef);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    addStudent: async (studentData) => {
        // 1. Create Login Account
        const defaultPassword = 'password123';
        if (studentData.email) {
            try {
                await createAuthUser(studentData.email, defaultPassword);
            } catch (e) {
                console.warn("Auth user creation failed (maybe already exists):", e);
                // Proceed to update Firestore anyway
            }
        }

        // 2. Create Database Entry
        // Use ID as doc key
        const ref = doc(db, 'users', studentData.id);
        const data = { ...studentData, role: 'student', password: defaultPassword };
        await setDoc(ref, data);

        // 3. Log event
        await api.addLog({
            action: 'ADD_STUDENT',
            targetId: studentData.id,
            targetName: studentData.name,
            details: `Student ${studentData.name} (ID: ${studentData.id}) enrolled in ${studentData.gradeLevel}`,
            timestamp: new Date().toISOString()
        });

        return data;
    },

    updateStudent: async (id, studentData) => {
        const ref = doc(db, 'users', id);
        await updateDoc(ref, studentData);
        return { id, ...studentData };
    },

    migrateStudentId: async (oldId, newId, data) => {
        // 1. Check if new ID exists? assuming migration logic handles uniqueness
        const newRef = doc(db, 'users', newId);
        // 2. Set new doc
        await setDoc(newRef, { ...data, id: newId });
        // 3. Delete old doc
        const oldRef = doc(db, 'users', oldId);
        await deleteDoc(oldRef);
        return newId;
    },

    deleteStudent: async (id) => {
        const student = await api.getStudent(id);
        await deleteDoc(doc(db, 'users', id));

        // Log event
        await api.addLog({
            action: 'DELETE_STUDENT',
            targetId: id,
            targetName: student?.name || 'Unknown',
            details: `Student ${student?.name} (ID: ${id}) removed from portal`,
            timestamp: new Date().toISOString()
        });

        return { message: 'Deleted' };
    },

    // Teachers
    getTeachers: async () => {
        const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
        const snap = await getDocs(q);
        return docsData(snap);
    },

    addTeacher: async (teacherData) => {
        // 1. Create Login Account
        const defaultPassword = 'password123';
        if (teacherData.email) {
            try {
                await createAuthUser(teacherData.email, defaultPassword);
            } catch (e) {
                console.warn("Auth user creation failed (maybe already exists):", e);
            }
        }

        const ref = doc(db, 'users', teacherData.id);
        const data = { ...teacherData, role: 'teacher', password: defaultPassword };
        await setDoc(ref, data);

        // Log event
        await api.addLog({
            action: 'ADD_TEACHER',
            targetId: teacherData.id,
            targetName: teacherData.name,
            details: `Teacher ${teacherData.name} (ID: ${teacherData.id}) joined for ${teacherData.subject}`,
            timestamp: new Date().toISOString()
        });

        return data;
    },

    updateTeacher: async (id, teacherData) => {
        const ref = doc(db, 'users', id);
        await updateDoc(ref, teacherData);
        return { id, ...teacherData };
    },

    deleteTeacher: async (id) => {
        // Get teacher data before deletion for logging
        const q = doc(db, 'users', id);
        const snap = await getDoc(q);
        const teacher = snap.exists() ? snap.data() : null;

        await deleteDoc(doc(db, 'users', id));

        // Log event
        await api.addLog({
            action: 'DELETE_TEACHER',
            targetId: id,
            targetName: teacher?.name || 'Unknown',
            details: `Teacher ${teacher?.name} (ID: ${id}) removed from portal`,
            timestamp: new Date().toISOString()
        });

        return { message: 'Deleted' };
    },

    // Notices
    getNotices: async () => {
        // Order by date if possible, but requires index. For now just fetch.
        const snap = await getDocs(collection(db, 'notices'));
        return docsData(snap);
    },

    addNotice: async (notice) => {
        // notice: { title, content, date, authorId, authorName, type, targetClass }
        const ref = await addDoc(collection(db, 'notices'), {
            type: 'global', // Default
            ...notice,
            timestamp: new Date().toISOString()
        });
        return { id: ref.id, ...notice };
    },

    deleteNotice: async (id) => {
        await deleteDoc(doc(db, 'notices', id));
        return { message: 'Deleted' };
    },

    updateNotice: async (id, data) => {
        const ref = doc(db, 'notices', id);
        await updateDoc(ref, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { id, ...data };
    },

    subscribeToNotices: (filters, callback) => {
        // Handle case where only a callback is provided
        let actualCallback = callback;
        let actualFilters = filters;

        if (typeof filters === 'function') {
            actualCallback = filters;
            actualFilters = null;
        }

        let q = collection(db, 'notices');

        return onSnapshot(q, (snap) => {
            let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (actualFilters?.targetClass) {
                const studentClassBase = String(actualFilters.targetClass).split('-')[0].toLowerCase().trim();
                data = data.filter(n => {
                    if (n.type === 'global') return true;
                    if (!n.targetClass) return false;
                    const noticeClassBase = String(n.targetClass).split('-')[0].toLowerCase().trim();
                    return noticeClassBase === studentClassBase;
                });
            }

            // Client-side sort by date descending
            data.sort((a, b) => new Date(b.date || b.timestamp || 0) - new Date(a.date || a.timestamp || 0));
            if (typeof actualCallback === 'function') {
                actualCallback(data);
            }
        });
    },

    // Tests & Marks (Revisiting structure for NoSQL)
    getTests: async () => {
        const snap = await getDocs(collection(db, 'tests'));
        const tests = docsData(snap);
        // Marks could be a subcollection or separate. Let's assume separate 'marks' collection linked by testId
        // For simplicity in this migration step, let's fetch marks separately
        return tests;
    },

    addTest: async (testData) => {
        const ref = await addDoc(collection(db, 'tests'), {
            ...testData,
            createdAt: new Date().toISOString()
        });
        // If marks are included
        if (testData.marks) {
            const batch = writeBatch(db);
            Object.entries(testData.marks).forEach(([studentId, score]) => {
                const markRef = doc(collection(db, 'marks')); // Auto ID
                batch.set(markRef, { testId: ref.id, studentId, score });
            });
            await batch.commit();
        }
        return { id: ref.id, ...testData };
    },

    // Get single test
    getTestById: async (id) => {
        const docRef = doc(db, 'tests', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    },

    updateMarks: async (testId, marks) => {
        // Save marks directly to the test document for easy retrieval
        const ref = doc(db, 'tests', testId);
        await updateDoc(ref, { marks: marks });
        return { message: 'Updated' };
    },

    updateTest: async (testId, testData) => {
        const ref = doc(db, 'tests', testId);
        await updateDoc(ref, testData);
        return { id: testId, ...testData };
    },

    deleteTest: async (testId) => {
        await deleteDoc(doc(db, 'tests', testId));
        return { message: 'Deleted' };
    },

    subscribeToTests: (filters, callback) => {
        let q = collection(db, 'tests');
        if (filters?.teacherId) {
            q = query(q, where('teacherId', '==', filters.teacherId));
        }

        return onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (typeof callback === 'function') {
                callback(data);
            }
        });
    },

    // Attendance
    getAllAttendance: async () => {
        const snap = await getDocs(collection(db, 'attendance'));
        return docsData(snap);
    },

    getAttendance: async (userId) => {
        const q = query(collection(db, 'attendance'), where('user_id', '==', userId)); // Note: verify field name matches migration
        const snap = await getDocs(q);
        return docsData(snap);
    },

    markAttendance: async (data) => {
        // data: { userId, date, status, type }
        // Check duplicate
        const q = query(
            collection(db, 'attendance'),
            where('user_id', '==', data.userId),
            where('date', '==', data.date)
        );
        const snap = await getDocs(q);

        if (!snap.empty) {
            await updateDoc(snap.docs[0].ref, { status: data.status });
        } else {
            await addDoc(collection(db, 'attendance'), { ...data, user_id: data.userId }); // Ensure field consistency
        }
        return { message: 'Marked' };
    },

    // Classes
    getClasses: async () => {
        const snap = await getDocs(collection(db, 'classes'));
        return docsData(snap);
    },

    addClass: async (classData) => {
        const ref = await addDoc(collection(db, 'classes'), classData);
        return { id: ref.id, ...classData };
    },

    deleteClass: async (id) => {
        await deleteDoc(doc(db, 'classes', id));
        return { message: 'Deleted' };
    },

    getTeacherClasses: async (teacherId) => {
        const q = query(collection(db, 'classes'), where('classTeacherId', '==', teacherId));
        const snap = await getDocs(q);
        return docsData(snap);
    },

    updateClass: async (id, classData) => {
        // Ensure ID is a valid string
        const safeId = String(id).trim();
        if (!safeId) throw new Error("Invalid ID provided for update");

        // Clean undefined values safely
        const safeData = { ...classData };
        Object.keys(safeData).forEach(key => {
            if (safeData[key] === undefined) delete safeData[key];
        });

        // Use safeId
        const docRef = doc(db, 'classes', safeId);
        await updateDoc(docRef, safeData);
        return { id: safeId, ...safeData };
    },

    // Fees
    getFees: async (studentId) => {
        // Fetch fee summary and history
        const summarySnap = await getDoc(doc(db, 'fee_status', studentId));
        const summary = summarySnap.exists() ? summarySnap.data() : { total: 5000, paid: 0, pending: 5000 };

        const q = query(collection(db, 'payments'), where('studentId', '==', studentId), orderBy('date', 'desc'));
        const historySnap = await getDocs(q);
        const history = docsData(historySnap);

        return { ...summary, history };
    },

    getFeeRecord: async (studentId, month) => {
        // Create a composite ID or query
        const id = `${studentId}_${month}`;
        const snap = await getDoc(doc(db, 'student_fees', id));
        return snap.exists() ? snap.data() : null; // returns { status, amount, proofUrl, ... }
    },

    updateFeeStatus: async (studentId, month, data) => {
        // data: { status, amount, proofUrl? }
        const id = `${studentId}_${month}`;
        const ref = doc(db, 'student_fees', id);
        await setDoc(ref, { ...data, studentId, month, updatedAt: new Date().toISOString() }, { merge: true });
        return { message: 'Updated' };
    },

    // Timetable
    getTimetable: async (gradeLevel) => {
        // gradeLevel e.g., "Class 10"
        if (!gradeLevel) return null;
        // Search for timetable doc with id = gradeLevel (sanitized) or query
        // Let's use collection 'timetables'
        const docRef = doc(db, 'timetables', gradeLevel);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
    },

    saveTimetable: async (gradeLevel, timetableData) => {
        await setDoc(doc(db, 'timetables', gradeLevel), timetableData);
        return { message: 'Saved' };
    },

    // Messages
    getMessages: async (userId, role) => {
        // Fetch messages where toId is userId OR toId is 'all' OR (toId is 'role' group)
        // This is complex in Firestore without multiple queries.
        // Let's simplify: fetch messages sent TO this user.

        const q = query(collection(db, 'messages'), where('toId', '==', userId), orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        return docsData(snap);
    },

    sendMessage: async (msgData) => {
        // msgData: { fromId, toId, subject, message, role, fromName, date, time, timestamp }
        await addDoc(collection(db, 'messages'), {
            ...msgData,
            timestamp: new Date()
        });
        return { message: 'Sent' };
    },

    // Assignments
    addAssignment: async (data) => {
        // data: { title, subject, className, dueDate, message, fileUrl, teacherId }
        await addDoc(collection(db, 'assignments'), {
            ...data,
            createdAt: new Date().toISOString()
        });
        return { message: 'Created' };
    },

    getAssignments: async (filter = {}) => {
        let q = collection(db, 'assignments');

        const constraints = [];
        if (filter.class_name) constraints.push(where('className', '==', filter.class_name));
        if (filter.teacherId) constraints.push(where('teacherId', '==', filter.teacherId));

        if (constraints.length > 0) {
            q = query(q, ...constraints);
        }

        const snap = await getDocs(q);
        const data = docsData(snap);

        // Client-side sort
        return data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },

    deleteAssignment: async (id) => {
        await deleteDoc(doc(db, 'assignments', id));
        return { message: 'Deleted' };
    },

    subscribeToAssignments: (filters, callback) => {
        let q = collection(db, 'assignments');
        if (filters?.teacherId) {
            q = query(q, where('teacherId', '==', filters.teacherId));
        }

        return onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (typeof callback === 'function') {
                callback(data);
            }
        });
    },

    // Sync Helper
    syncUsersToAuth: async () => {
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = docsData(usersSnap);
        let created = 0;
        let errors = 0;

        for (const user of users) {
            if (user.email && user.email.includes('@')) {
                try {
                    await createAuthUser(user.email, 'password123');
                    created++;
                    console.log(`Synced: ${user.email}`);
                } catch (e) {
                    // Assume failed means 'already exists' or invalid email
                    errors++;
                }
            }
        }
        return { created, errors, total: users.length };
    },

    // Audit Logs & Analytics
    getLogs: async () => {
        const snap = await getDocs(collection(db, 'logs'));
        return docsData(snap);
    },

    addLog: async (logData) => {
        // logData: { action, targetId, targetName, details, timestamp }
        await addDoc(collection(db, 'logs'), {
            ...logData,
            timestamp: logData.timestamp || new Date().toISOString()
        });
    },

    deleteLog: async (id) => {
        await deleteDoc(doc(db, 'logs', id));
        return { message: 'Log deleted' };
    },
    // Gallery
    getGallery: async () => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return docsData(snap);
    },
    addGalleryItem: async (file, title, onProgress) => {
        console.log("Starting upload:", title, file.name);
        let imageUrl = '';
        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const fileRef = ref(storage, `gallery/${fileName}`);

            const uploadTask = uploadBytesResumable(fileRef, file);

            // Add a 30 second timeout
            const timeout = setTimeout(() => {
                uploadTask.cancel();
                reject(new Error("Upload timed out (30s). This usually means Firebase Storage Rules are blocking the request or your internet is unstable."));
            }, 30000);

            // Return a promise that resolves when upload + URL fetch + Firestore write is done
            await new Promise((resolve, reject_inner) => {
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        if (onProgress) onProgress(progress);
                    },
                    (error) => {
                        clearTimeout(timeout);
                        console.error("Upload Task Error:", error);
                        reject_inner(error);
                    },
                    async () => {
                        clearTimeout(timeout);
                        try {
                            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                            console.log("Got URL:", imageUrl);
                            resolve();
                        } catch (e) {
                            reject_inner(e);
                        }
                    }
                );
            }).catch(e => {
                clearTimeout(timeout);
                throw e;
            });
        }

        console.log("Adding to Firestore...");
        return await addDoc(collection(db, 'gallery'), {
            title,
            imageUrl,
            createdAt: new Date().toISOString()
        });
    },
    deleteGalleryItem: async (id) => {
        return await deleteDoc(doc(db, 'gallery', id));
    },
    subscribeToGallery: (callback) => {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
            const data = docsData(snap);
            if (typeof callback === 'function') {
                callback(data);
            }
        });
    }
};



