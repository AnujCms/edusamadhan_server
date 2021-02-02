const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');

//Check Relation Student And User
exports.checkRelationStudentAndUser = async (accountId, studentId) => {
    let studentAccountId = await db.query('select accountId from student_teacher where studentId = ?',[studentId])
    if(studentAccountId.length>0){
    let result = studentAccountId[0].accountId.localeCompare(accountId);
    if(result === 0){
        return true
    }else if(result === -1 || result === undefined){
        return false
    }
    else{
        return false
    }
}else{
    return false
}
}
//check the student school validation
exports.checkStudentSchool = async (accountId, aadharNumber) => {
    let result = await db.query('select accountId from teacher_principal where userId = (select teacherId from student_teacher where studentId = (select userId from userDetails where aadharNumber = ? ))', [aadharNumber]);
   if(result.length === 1){
    let status = result[0].accountId.localeCompare(accountId);
    if(status === 0){
        return 1
    }else{
        return 2
    }
   }else{
       return 3
   }
}
//check the class school validation
exports.checkClassSchool = async (accountId, classId, sectionId, userrole, sessionId) => {
    let result = await db.query('select accountId from teacher_principal where userId = (select userId from userDetails where classId = ? and sectionId = ? and sessionId = ?and userrole =  ?)', [classId, sectionId, sessionId, userrole]);
    let status = result[0].accountId.localeCompare(accountId);
    if(status === 0){
        return true
    }else{
        return false
    }
}
//get fee details
exports.getFeeDetails = async (sessionId, accountId) => {
    let result = await db.query('select * from feeStructureDetails where accountId = ? and sessionId = ?', [accountId, sessionId]);
    return result;
}
//get fee details by class
exports.getFeeDetailByClass = async (sessionId, accountId, feeStructureId, mediumType) => {
    let result = await db.query('select * from feeStructureDetails where accountId = ? and sessionId = ? and feeStructureId = ? and mediumType = ?', [accountId, sessionId, feeStructureId, mediumType]);
    return result;
}
//create fee for selected class
exports.saveClassFeeStructure = (feeObject) => {
    return db.transaction(async (conn) => {
        let checkdata = await db.setQuery(conn, 'select * from feeStructureDetails where accountId = ? and classId = ? and sessionId = ? and mediumType = ?', [feeObject.accountId, feeObject.classId, feeObject.sessionId, feeObject.mediumType]);
        if (checkdata.length > 0) {
            let result = await db.setQuery(conn, 'update feeStructureDetails set ? where accountId = ? and classId = ? and sessionId = ? and mediumType = ?', [feeObject, feeObject.accountId, feeObject.classId, feeObject.sessionId, feeObject.mediumType]);
            return result.affectedRows;
        }
        else {
            let result = await db.query('insert into feeStructureDetails set ?',[feeObject]);
            return result.affectedRows;
        }
    });
}

//update Student fee details
exports.updateClassFeeStructure = async (feeObject) => {
    let result = await db.query('update feeStructureDetails set ? where accountId = ? and feeStructureId = ? and sessionId = ? and mediumType = ?', [feeObject, feeObject.accountId, feeObject.feeStructureId, feeObject.sessionId, feeObject.mediumType]);
    return result.affectedRows;
}
//get Student fee details
exports.getStudentFeeDetails = (getFeeObj) => {
    return db.transaction(async (conn) => {
        let studentData = await db.setQuery(conn, 'select * from userDetails where userId = ? and sessionId = ? and status = ? and userrole = ?', [getFeeObj.studentId, getFeeObj.sessionId, getFeeObj.status, getFeeObj.userrole]);
        if(studentData[0]){
            let feeStructure = await db.setQuery(conn, 'select * from feeStructureDetails where classId = ? and accountId = ? and sessionId = ? and mediumType = ?', [studentData[0].classId, getFeeObj.accountId, getFeeObj.sessionId, getFeeObj.mediumType]);
            let results = await db.setQuery(conn, 'select * from studentFeeDetails where studentId = ? and sessionId = ? and accountId = ?', [getFeeObj.studentId, getFeeObj.sessionId, getFeeObj.accountId]);
            let transportFee = [];
            let routeName = '';
            if(studentData[0].busService == 1){
                transportFee = await db.setQuery(conn, 'select * from studentTransportFeeDetails where studentId = ? and sessionId = ? and accountId = ?', [getFeeObj.studentId, getFeeObj.sessionId, getFeeObj.accountId]);
                routeName = await db.setQuery(conn, 'select * from transportStructureDetails where transportFeeId = ? and sessionId = ? and accountId = ?', [studentData[0].route, getFeeObj.sessionId, getFeeObj.accountId]);
            }
            let feeData = {
                student: studentData,
                feeStructure: feeStructure,
                feeDetails: results,
                transportFee:transportFee,
                routeName: routeName
            }
            return feeData;
        }else {
            return  feeData = {
                student: []
            }
        }
    });
}

exports.getStudentFee = async (monthName, aadharNumber, sessionId) => {
    let monthData = await db.query(`select ${monthName} from  studentFeeDetails where aadharNumber = ? and sessionId = ?`, [aadharNumber, sessionId]);
    return monthData;
}

//pay student transport fee
exports.payTransportFee = async (studentId, sessionId, transportFeeObj, accountId) => {
    let result = await db.query(`update studentTransportFeeDetails set ? where studentId = ? and sessionId = ? and accountId = ?`, [transportFeeObj, studentId, sessionId, accountId]);
    return result.affectedRows
}
//pay student fee
exports.payStudentFee = async (studentId, sessionId, studentFeeObj, accountId) => {
    let result = await db.query(`update studentFeeDetails set ? where studentId = ? and sessionId = ? and accountId = ?`, [studentFeeObj, studentId, sessionId, accountId]);
    return result.affectedRows
}
//get fee details by class
exports.getclassfeedetails = (sessionId, accountId, classId, sectionId) => {
    console.log('sessionId, accountId, classId, sectionId',sessionId, accountId, classId, sectionId)
    return db.transaction(async (conn) => {
        let feeStructure = await db.setQuery(conn, 'select * from feestructure where classId = ? and accountId = ? and sessionId = ?', [classId, accountId, sessionId]);
        console.log('feeStructure',feeStructure)
        let results = await db.setQuery(conn, 'select u.firstName, u.lastName, u.aadharNumber, f.january, f.february, f.march, f.april, f.may, f.june, f.july, f.august, f.september, f.october, f.november, f.december from userDetails u inner join studentFeeDetails f on u.userId = f.studentId where u.classId = ? and u.sectionId = ? and u.sessionId = ?', [classId, sectionId, sessionId]);
        if(results.length>0){
            let feeData = {
                feeStructure: feeStructure,
                feeDetails: results
            }
            return feeData;
        }else{
            let feeData1 = {
                feeDetails: []
            }
            return feeData1
        }

    });
}
//get fee details for print
exports.getFeeDetailsForPrint = (studentId, sessionId, accountId) => {
    return db.transaction(async (conn) => {
    let school = await db.setQuery(conn, 'select accountName, accountRefNumber, accountAddress from account where accountId = ?',[accountId]);
    let studentData  = await db.setQuery(conn, 'select firstName, lastname, cellNumber,dob, motherName, fatherName, aadharNumber, classId, sectionId from userDetails where userId = ?',[studentId])
    let printData = {
        studentData:studentData,
        school: school
    }
    return printData;
    })
}

//get students list of class
exports.getStudentsListOfClass = async (feeObject) => {
    let results = await db.query(`SELECT * from userDetails ud INNER JOIN student_teacher st where ud.userId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and st.userType = ? and ud.status = ?`, [feeObject.accountId, feeObject.classId, feeObject.sectionId, feeObject.sessionId, feeObject.userType, feeObject.status]);
    return results
}

//get Student fee details 
exports.getFullFeeDetails = (getFeeObj) => {
    return db.transaction(async (conn) => {
            let student = await db.setQuery(conn, 'select userId, firstName, lastName, cellNumber, aadharNumber, status, userrole, mediumType, route, images, busService from userDetails ud INNER JOIN student_teacher st where ud.userId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and ud.status = ?', [getFeeObj.accountId, getFeeObj.classId, getFeeObj.sectionId, getFeeObj.sessionId, getFeeObj.status]);
            if (student.length > 0) {
                let studentIdArray = [];
                let routeArray = []
                student.forEach((row) => {
                    if(row.busService == 1){
                        routeArray.push(row.route)
                    }else{
                        routeArray.push(0)
                    }
                    studentIdArray.push(row.userId)
                })
                let sumFeeDetails = await db.setQuery(conn, `select * from feeStructureDetails where accountId = ? and classId = ? and sessionId = ?`, [getFeeObj.accountId, getFeeObj.classId, getFeeObj.sessionId]);
                let results = await db.setQuery(conn, `select * from studentFeeDetails where studentId IN(${studentIdArray}) and sessionId = ? and accountId = ?`, [getFeeObj.sessionId, getFeeObj.accountId]);
                let studenttransportfee = await db.setQuery(conn, `select * from studentTransportFeeDetails where studentId IN(${studentIdArray}) and accountId = ? and sessionId = ?`, [getFeeObj.accountId, getFeeObj.sessionId]);
                let transport = await db.setQuery(conn, `select * from transportStructureDetails where transportFeeId IN(${routeArray}) and accountId = ? and sessionId = ?`, [getFeeObj.accountId, getFeeObj.sessionId]);
                let feeData = {
                    feeStructure: sumFeeDetails,
                    submittedfee: results,
                    student: student,
                    transport:transport,
                    studenttransportfee:studenttransportfee
                }
                return feeData;
            } else {
                return 0
            }
    });
}

//Create Transport Fee
exports.createTranssportFee = async (feeObject) => {
    let result = await db.query('insert into transportStructureDetails set ? ', [feeObject]);
    return result.affectedRows;
}

//get Transport Fee
exports.getTranssportFee = async (accountId, sessionId) =>{
    let result = await db.query('select * from transportStructureDetails where accountId = ? and sessionId = ?', [accountId, sessionId]);
    return result;
}

//delete Transport Fee
exports.deleteTranssportFee = async (deleteTranObj) => {
    let result = await db.query('delete from transportStructureDetails where accountId = ? and sessionId = ? and userId = ? and transportFeeId = ?', [deleteTranObj.accountId, deleteTranObj.sessionId, deleteTranObj.userId, deleteTranObj.transportFeeId]);
    return result.affectedRows;
}

//get Transport Fee
exports.getTranssportFeeById = async (getTranObj) => {
    let result = await db.query('select * from transportStructureDetails where accountId = ? and sessionId = ? and transportFeeId = ?', [getTranObj.accountId, getTranObj.sessionId, getTranObj.transportFeeId]);
    return result;
}

//update Transport Fee by IB
exports.updateTranssportFeeById = async (transStrObj) => {
    let result = await db.query('update transportStructureDetails set ? where accountId = ? and sessionId = ? and transportFeeId = ?', [transStrObj, transStrObj.accountId, transStrObj.sessionId, transStrObj.transportFeeId]);
    return result.affectedRows;
}

//Create expense
exports.createExpense = async (expenseObj) => {
    let result = await db.query('insert into expenseDetails set ? ', [expenseObj]);
    return result.affectedRows;
}

//get expense
exports.getExpense = async (accountId, sessionId) => {
    let result = await db.query('select * from expenseDetails where accountId = ? and sessionId = ?', [accountId, sessionId]);
    return result;
}

//delete expense
exports.deleteExpense = async (deleteExpObj) => {
    let result = await db.query('delete from expenseDetails where accountId = ? and userId = ? and sessionId = ? and expenseId = ?', [deleteExpObj.accountId, deleteExpObj.userId, deleteExpObj.sessionId,deleteExpObj.expenseId]);
    return result.affectedRows;
}

//get expense by ID
exports.getExpenxeById = async (getExpObj) => {
    let result = await db.query('select * from expenseDetails where accountId = ? and userId = ? and sessionId = ? and expenseId = ?', [getExpObj.accountId, getExpObj.userId,getExpObj.sessionId, getExpObj.expenseId]);
    return result;
}

//update Expense by IB
exports.updateExpenseById = async (expenseObj) => {
    let result = await db.query('update expenseDetails set ? where accountId = ? and userId = ? and sessionId = ? and expenseId = ?', [expenseObj, expenseObj.accountId, expenseObj.userId, expenseObj.sessionId, expenseObj.expenseId]);
    return result.affectedRows;
}

//get staff salary
exports.getStaffSalary = async (accountId, userType, sessionId) => {
    let staffDetails = await db.query('select * from userDetails where userId in(select userId from teacher_principal where accountId = ? and userType = ? ) and sessionId = ?',[accountId, userType, sessionId]);
    return staffDetails;
}

//get transport fee
exports.getTransportFee = async (getTransFeeObj) => {
    let result = await db.query('select fee from transportStructureDetails where transportFeeId = (select route from userDetails where userId = ? and sessionId = ?)',[getTransFeeObj.studentId, getTransFeeObj.sessionId]);
    return result;
}