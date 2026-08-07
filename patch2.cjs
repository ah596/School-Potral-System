const fs = require('fs');
let code = fs.readFileSync('src/utils/api.js', 'utf8');

const newGetFees = `    getFees: async (studentId) => {
        const studentSnap = await getDoc(doc(db, 'users', studentId));
        const pending = studentSnap.exists() ? (studentSnap.data().balance || 0) : 0;
        
        const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('studentId', '==', studentId), orderBy('date', 'desc')));
        const history = docsData(paymentsSnap);
        const paid = history.reduce((acc, p) => acc + (p.amount || 0), 0);
        
        const feesSnap = await getDocs(query(collection(db, 'student_fees'), where('studentId', '==', studentId)));
        const invoices = docsData(feesSnap).sort((a,b) => new Date(b.updated_at || b.createdAt) - new Date(a.updated_at || a.createdAt));
        const total = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
        
        return { total, paid, pending, history, invoices };
    },`;

const newGetFeeReports = `    getFeeReports: async () => {
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const feesSnap = await getDocs(collection(db, 'student_fees'));
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        
        let grandTotal = 0;
        let grandPaid = 0;
        let grandPending = 0;
        
        const studentClassMap = {};
        const classWiseMap = {};
        
        studentsSnap.forEach(doc => {
            const data = doc.data();
            const cls = data.class || 'Unassigned';
            studentClassMap[doc.id] = cls;
            
            const pending = data.balance || 0;
            grandPending += pending;
            
            if (!classWiseMap[cls]) {
                classWiseMap[cls] = { className: cls, total: 0, paid: 0, pending: 0 };
            }
            classWiseMap[cls].pending += pending;
        });

        feesSnap.forEach(f => {
            const data = f.data();
            grandTotal += (data.amount || 0);
            const cls = studentClassMap[data.studentId] || 'Unassigned';
            if (!classWiseMap[cls]) classWiseMap[cls] = { className: cls, total: 0, paid: 0, pending: 0 };
            classWiseMap[cls].total += (data.amount || 0);
        });

        paymentsSnap.forEach(p => {
            const data = p.data();
            grandPaid += (data.amount || 0);
            const cls = studentClassMap[data.studentId] || 'Unassigned';
            if (!classWiseMap[cls]) classWiseMap[cls] = { className: cls, total: 0, paid: 0, pending: 0 };
            classWiseMap[cls].paid += (data.amount || 0);
        });

        return {
            summary: { grandTotal, grandPaid, grandPending },
            classWise: Object.values(classWiseMap)
        };
    },`;

code = code.replace(/getFees: async \(studentId\) => {[\s\S]*?    },\n\n    getFeeRecord/, newGetFees + '\n\n    getFeeRecord');
code = code.replace(/getFeeReports: async \(\) => {[\s\S]*?    },\n    \/\/ Timetable/, newGetFeeReports + '\n    // Timetable');

fs.writeFileSync('src/utils/api.js', code);
console.log("Updated api.js");
