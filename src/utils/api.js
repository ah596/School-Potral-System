// ============================================================
// API Utility - SQL Backend (replaces Firebase/Firestore)
// All calls go to http://localhost:5000/api/...
// ============================================================

const BASE_URL = 'http://localhost:5000/api';

const request = async (method, endpoint, body = null) => {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
    return data;
};

const get  = (ep)         => request('GET',    ep);
const post = (ep, body)   => request('POST',   ep, body);
const put  = (ep, body)   => request('PUT',    ep, body);
const del  = (ep)         => request('DELETE', ep);

// ============================================================
// Subscription helpers (polling-based, replaces onSnapshot)
// ============================================================
const createPollingSubscription = (fetcher, callback, intervalMs = 5000) => {
    let active = true;
    const poll = async () => {
        try {
            const data = await fetcher();
            if (active && typeof callback === 'function') callback(data);
        } catch (e) {
            console.error('Polling error:', e);
        }
        if (active) setTimeout(poll, intervalMs);
    };
    poll();
    return () => { active = false; }; // Unsubscribe function
};

// ============================================================
export const api = {

    // ----------------------------
    // AUTH
    // ----------------------------
    login: async (id, password) => {
        return await post('/login', { id, password });
    },

    logout: async () => {
        // No server-side session, just clear client storage
        return { message: 'Logged out' };
    },

    // ----------------------------
    // USER PROFILE
    // ----------------------------
    updateUserProfile: async (id, data) => {
        await put(`/users/${id}`, data);
        return { id, ...data };
    },

    changePassword: async (id, newPassword) => {
        return await put(`/users/${id}/password`, { newPassword });
    },

    checkEmailExists: async (email, excludeId = null) => {
        const params = new URLSearchParams({ email });
        if (excludeId) params.append('excludeId', excludeId);
        const data = await get(`/check-email?${params}`);
        return data.exists;
    },

    // File upload - stored as base64 or URL (no Firebase Storage)
    uploadFile: async (file, pathHint) => {
        // Convert file to base64 data URL for local storage
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // ----------------------------
    // STUDENTS
    // ----------------------------
    getStudents: async () => {
        return await get('/students');
    },

    getStudent: async (id) => {
        try {
            return await get(`/students/${id}`);
        } catch (e) {
            return null;
        }
    },

    addStudent: async (studentData) => {
        const res = await post('/students', {
            id: studentData.id,
            name: studentData.name,
            gradeLevel: studentData.gradeLevel,
            email: studentData.email,
            phone: studentData.phone,
            password: studentData.password || 'password123',
            parentName: studentData.parentName,
            parentPhone: studentData.parentPhone,
            address: studentData.address,
            dob: studentData.dob,
            firstAdmission: studentData.firstAdmission
        });
        await api.addLog({
            action: 'ADD_STUDENT',
            targetId: studentData.id,
            targetName: studentData.name,
            details: `Student ${studentData.name} (ID: ${studentData.id}) enrolled in ${studentData.gradeLevel}`,
        });
        return { ...studentData, role: 'student' };
    },

    updateStudent: async (id, studentData) => {
        await put(`/students/${id}`, studentData);
        return { id, ...studentData };
    },

    migrateStudentId: async (oldId, newId, data) => {
        await post('/students/migrate-id', { oldId, newId, data });
        return newId;
    },

    deleteStudent: async (id) => {
        return await del(`/students/${id}`);
    },

    // ----------------------------
    // TEACHERS
    // ----------------------------
    getTeachers: async () => {
        return await get('/teachers');
    },

    getTeacher: async (id) => {
        try {
            return await get(`/teachers/${id}`);
        } catch (e) {
            return null;
        }
    },

    addTeacher: async (teacherData) => {
        const res = await post('/teachers', {
            id: teacherData.id,
            name: teacherData.name,
            subject: teacherData.subject,
            classes: teacherData.classes,
            email: teacherData.email,
            phone: teacherData.phone,
            salary: teacherData.salary,
            password: teacherData.password || 'password123',
            qualification: teacherData.qualification,
        });
        await api.addLog({
            action: 'ADD_TEACHER',
            targetId: teacherData.id,
            targetName: teacherData.name,
            details: `Teacher ${teacherData.name} joined for ${teacherData.subject}`,
        });
        return { ...teacherData, role: 'teacher' };
    },

    updateTeacher: async (id, teacherData) => {
        await put(`/teachers/${id}`, teacherData);
        return { id, ...teacherData };
    },

    deleteTeacher: async (id) => {
        await api.addLog({ action: 'DELETE_TEACHER', targetId: id, targetName: '', details: `Teacher removed` });
        return await del(`/teachers/${id}`);
    },

    // Teacher's own classes
    getTeacherClasses: async (teacherId) => {
        const classes = await get('/classes');
        return classes.filter(c => c.class_teacher_id === teacherId);
    },

    // ----------------------------
    // ADMINS
    // ----------------------------
    getAdmins: async () => {
        return await get('/admins');
    },

    addAdmin: async (adminData) => {
        const res = await post('/admins', adminData);
        await api.addLog({
            action: 'ADD_ADMIN',
            targetId: adminData.id,
            targetName: adminData.name,
            details: `New admin ${adminData.name} added`,
        });
        return adminData;
    },

    deleteAdmin: async (id) => {
        return await del(`/admins/${id}`);
    },

    updateUser: async (id, userData) => {
        await put(`/users/${id}`, userData);
        return { id, ...userData };
    },

    // ----------------------------
    // NOTICES
    // ----------------------------
    getNotices: async () => {
        return await get('/notices');
    },

    addNotice: async (notice) => {
        return await post('/notices', {
            title: notice.title,
            date: notice.date || new Date().toISOString().split('T')[0],
            content: notice.content,
            priority: notice.priority || 'Medium',
            audience: notice.audience || notice.type || 'all',
            targetClass: notice.targetClass,
            type: notice.type || 'global',
            authorId: notice.authorId,
            authorName: notice.authorName,
        });
    },

    updateNotice: async (id, data) => {
        await put(`/notices/${id}`, data);
        return { id, ...data };
    },

    deleteNotice: async (id) => {
        return await del(`/notices/${id}`);
    },

    // Polling-based subscription (replaces onSnapshot)
    subscribeToNotices: (filtersOrCallback, callback) => {
        let actualCallback = callback;
        let actualFilters = filtersOrCallback;
        if (typeof filtersOrCallback === 'function') {
            actualCallback = filtersOrCallback;
            actualFilters = null;
        }

        return createPollingSubscription(async () => {
            let data = await get('/notices');
            // Apply class filter if provided
            if (actualFilters?.targetClass) {
                const base = String(actualFilters.targetClass).split('-')[0].toLowerCase().trim();
                data = data.filter(n => {
                    if (n.type === 'global' || n.audience === 'all') return true;
                    if (!n.target_class) return false;
                    return String(n.target_class).split('-')[0].toLowerCase().trim() === base;
                });
            }
            return data.sort((a, b) => new Date(b.date || b.timestamp || 0) - new Date(a.date || a.timestamp || 0));
        }, actualCallback);
    },

    // ----------------------------
    // TESTS & MARKS
    // ----------------------------
    getTests: async () => {
        return await get('/tests');
    },

    getTestById: async (id) => {
        try {
            return await get(`/tests/${id}`);
        } catch (e) {
            return null;
        }
    },

    addTest: async (testData) => {
        return await post('/tests', {
            name: testData.name,
            subject: testData.subject,
            date: testData.date,
            totalMarks: testData.totalMarks,
            section: testData.section,
            className: testData.className,
            teacherId: testData.teacherId,
            marks: testData.marks,
        });
    },

    updateTest: async (testId, testData) => {
        await put(`/tests/${testId}`, testData);
        return { id: testId, ...testData };
    },

    updateMarks: async (testId, marks) => {
        return await post('/marks/update', { testId, marks });
    },

    deleteTest: async (testId) => {
        return await del(`/tests/${testId}`);
    },

    subscribeToTests: (filters, callback) => {
        return createPollingSubscription(async () => {
            let data = await get('/tests');
            if (filters?.teacherId) {
                data = data.filter(t => t.teacher_id === filters.teacherId);
            }
            return data;
        }, callback);
    },

    // ----------------------------
    // ATTENDANCE
    // ----------------------------
    getAllAttendance: async () => {
        return await get('/attendance');
    },

    getAttendance: async (userId) => {
        return await get(`/attendance/${userId}`);
    },

    markAttendance: async (data) => {
        return await post('/attendance', {
            userId: data.userId || data.user_id,
            date: data.date,
            status: data.status,
            type: data.type,
        });
    },

    // ----------------------------
    // CLASSES
    // ----------------------------
    getClasses: async () => {
        return await get('/classes');
    },

    addClass: async (classData) => {
        return await post('/classes', {
            name: classData.name,
            section: classData.section,
            classTeacherId: classData.classTeacherId,
            roomNumber: classData.roomNumber,
            capacity: classData.capacity,
        });
    },

    updateClass: async (id, classData) => {
        await put(`/classes/${String(id).trim()}`, {
            name: classData.name,
            section: classData.section,
            classTeacherId: classData.classTeacherId,
            roomNumber: classData.roomNumber,
            capacity: classData.capacity,
            monthlyFee: classData.monthlyFee,
            annualDues: classData.annualDues,
            overtimeCharges: classData.overtimeCharges,
            otherCharges: classData.otherCharges,
            admissionFee: classData.admissionFee,
            admissionFeeEnabled: classData.admissionFeeEnabled,
            annualFeeEnabled: classData.annualFeeEnabled,
            tuitionFeeEnabled: classData.tuitionFeeEnabled,
            overtimeFeeEnabled: classData.overtimeFeeEnabled,
            labFee: classData.labFee,
            labFeeEnabled: classData.labFeeEnabled,
            securityCharges: classData.securityCharges,
            securityChargesEnabled: classData.securityChargesEnabled,
            sportsFee: classData.sportsFee,
            sportsFeeEnabled: classData.sportsFeeEnabled,
            otherChargesEnabled: classData.otherChargesEnabled
        });
        return { id, ...classData };
    },

    deleteClass: async (id) => {
        return await del(`/classes/${id}`);
    },

    // ----------------------------
    // FEES
    // ----------------------------
    getFees: async (studentId) => {
        return await get(`/fees/${studentId}`);
    },

    getFeeRecord: async (studentId, month) => {
        return await get(`/fees/${studentId}/record/${encodeURIComponent(month)}`);
    },

    updateFeeStatus: async (studentId, month, data) => {
        return await post(`/fees/${studentId}/record/${encodeURIComponent(month)}`, data);
    },

    getAllFees: async () => {
        return await get('/fees');
    },

    addPayment: async (paymentData) => {
        return await post('/payments', paymentData);
    },

    generateMonthlyFees: async (month, dueDate, forceIncludeAdmission = false, forceIncludeAnnual = false) => {
        return await post('/fees/generate-monthly', { month, dueDate, forceIncludeAdmission, forceIncludeAnnual });
    },

    generateAnnualDues: async (year, dueDate) => {
        return await post('/fees/generate-annual', { year, dueDate });
    },

    getFeeReports: async () => {
        return await get('/fees/reports');
    },

    // ----------------------------
    // TIMETABLE
    // ----------------------------
    getTimetable: async (gradeLevel) => {
        if (!gradeLevel) return null;
        try {
            const res = await get(`/timetable/${encodeURIComponent(gradeLevel)}`);
            return res ? res.data : null;
        } catch (e) {
            return null;
        }
    },

    saveTimetable: async (gradeLevel, timetableData) => {
        return await post(`/timetable/${encodeURIComponent(gradeLevel)}`, timetableData);
    },

    // ----------------------------
    // MESSAGES
    // ----------------------------
    getMessages: async (userId, role) => {
        return await get(`/messages/${userId}`);
    },

    sendMessage: async (msgData) => {
        return await post('/messages', {
            fromId: msgData.fromId,
            fromName: msgData.fromName,
            toId: msgData.toId,
            subject: msgData.subject,
            message: msgData.message,
            role: msgData.role,
            date: msgData.date,
            time: msgData.time,
        });
    },

    // ----------------------------
    // ASSIGNMENTS
    // ----------------------------
    getAssignments: async (filter = {}) => {
        const params = new URLSearchParams();
        if (filter.class_name) params.append('className', filter.class_name);
        if (filter.teacherId) params.append('teacherId', filter.teacherId);
        return await get(`/assignments?${params}`);
    },

    addAssignment: async (data) => {
        return await post('/assignments', {
            title: data.title,
            subject: data.subject,
            className: data.className,
            dueDate: data.dueDate,
            message: data.message,
            fileUrl: data.fileUrl,
            teacherId: data.teacherId,
        });
    },

    deleteAssignment: async (id) => {
        return await del(`/assignments/${id}`);
    },

    subscribeToAssignments: (filters, callback) => {
        return createPollingSubscription(async () => {
            const params = new URLSearchParams();
            if (filters?.teacherId) params.append('teacherId', filters.teacherId);
            return await get(`/assignments?${params}`);
        }, callback);
    },

    // ----------------------------
    // GALLERY
    // ----------------------------
    getGallery: async () => {
        return await get('/gallery');
    },

    addGalleryItem: async (imageUrl, title) => {
        return await post('/gallery', { title, imageUrl });
    },

    deleteGalleryItem: async (id) => {
        return await del(`/gallery/${id}`);
    },

    subscribeToGallery: (callback) => {
        return createPollingSubscription(() => get('/gallery'), callback);
    },

    // ----------------------------
    // AUDIT LOGS
    // ----------------------------
    getLogs: async () => {
        return await get('/logs');
    },

    addLog: async (logData) => {
        try {
            await post('/logs', {
                action: logData.action,
                targetId: logData.targetId,
                targetName: logData.targetName,
                details: logData.details,
            });
        } catch (e) {
            console.warn('Log failed:', e.message);
        }
    },

    deleteLog: async (id) => {
        return await del(`/logs/${id}`);
    },

    // ----------------------------
    // SYNC HELPER (No-op for SQL)
    // ----------------------------
    syncUsersToAuth: async () => {
        return { message: 'Not needed for SQL backend', created: 0, errors: 0 };
    },
};
