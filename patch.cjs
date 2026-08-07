const fs = require('fs');
const apiStr = fs.readFileSync('src/utils/api.firebase.utf8.js', 'utf8');

const newCode = `
    // ADDED FEE LOGIC FOR FIREBASE
    getAllFees: async () => {
        const snap = await getDocs(collection(db, 'fee_status'));
        return docsData(snap);
    },

    addPayment: async (paymentData) => {
        const ref = await addDoc(collection(db, 'payments'), paymentData);
        // Also update fee_status
        const statusRef = doc(db, 'fee_status', paymentData.studentId);
        const statusSnap = await getDoc(statusRef);
        if (statusSnap.exists()) {
            const data = statusSnap.data();
            await updateDoc(statusRef, {
                paid: (data.paid || 0) + Number(paymentData.amount),
                pending: (data.pending || 0) - Number(paymentData.amount)
            });
        }
        return { id: ref.id, ...paymentData };
    },

    generateMonthlyFees: async (month, dueDate, forceIncludeAdmission = false, forceIncludeAnnual = false) => {
        const classesSnap = await getDocs(collection(db, 'classes'));
        const classes = docsData(classesSnap);
        const studentsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
        const students = docsData(studentsSnap);
        
        const isJanuary = month && month.endsWith('-01');
        let generatedCount = 0;
        
        const batch = writeBatch(db);
        let opCount = 0;
        
        for (let student of students) {
            const cls = classes.find(c => student.gradeLevel === c.name || student.grade_level?.includes(c.name));
            if (!cls) continue;
            
            const isNew = student.firstAdmission === 1 || student.first_admission === 1;
            
            const tuitionVal = cls.tuitionFeeEnabled !== false && cls.tuition_fee_enabled !== 0 ? (cls.monthlyFee || cls.tuitionFee || 0) : 0;
            const overtimeVal = cls.overtimeFeeEnabled !== false && student.overtimeApplicable === 1 ? (cls.overtimeCharges || 0) : 0;
            const labVal = cls.labFeeEnabled !== false ? (cls.labFee || 0) : 0;
            const securityVal = cls.securityChargesEnabled !== false ? (cls.securityCharges || 0) : 0;
            const sportsVal = cls.sportsFeeEnabled !== false ? (cls.sportsFee || 0) : 0;
            const otherVal = cls.otherChargesEnabled !== false ? (cls.otherCharges || 0) : 0;
            
            const admissionVal = ((isNew && cls.admissionFeeEnabled !== false) || forceIncludeAdmission) ? (cls.admissionFee || 0) : 0;
            const annualVal = ((isNew && cls.annualFeeEnabled !== false) || isJanuary || forceIncludeAnnual) ? (cls.annualDues || 0) : 0;
            
            const total = Number(tuitionVal) + Number(overtimeVal) + Number(labVal) + Number(securityVal) + Number(sportsVal) + Number(otherVal) + Number(admissionVal) + Number(annualVal);
            
            if (total > 0) {
                const feeId = student.id + '_' + month;
                const feeRef = doc(db, 'student_fees', feeId);
                
                batch.set(feeRef, {
                    studentId: student.id,
                    month: month,
                    amount: total,
                    status: 'Unpaid',
                    dueDate: dueDate,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                
                opCount++;
                generatedCount++;
                
                if (opCount >= 400) {
                    await batch.commit();
                    opCount = 0;
                }
            }
        }
        
        if (opCount > 0) {
            await batch.commit();
        }
        
        return { message: 'Fees generated', count: generatedCount };
    },

    generateAnnualDues: async (year, dueDate) => {
        return { message: 'Not fully implemented on client side yet. Use monthly generator.' };
    },

    getFeeReports: async () => {
        const feesSnap = await getDocs(collection(db, 'student_fees'));
        const paymentsSnap = await getDocs(collection(db, 'payments'));
        return {
            totalFees: feesSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0),
            totalPayments: paymentsSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0),
            fees: docsData(feesSnap),
            payments: docsData(paymentsSnap)
        };
    },
`;

const updatedApi = apiStr.replace('// Timetable', newCode + '\\n    // Timetable');
fs.writeFileSync('src/utils/api.js', updatedApi);
console.log('Appended fee logic.');
