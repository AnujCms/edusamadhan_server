const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');
const {formatDate} = require('../api/ValidationFunctions');

//Check user belongs to user
exports.checkProviderByAccountID = async (userId, accountId) => {
    let userAccountId = await db.query('select accountId from teacher_principal where userId = ?', [userId])
    if (userAccountId.length > 0) {
        let result = userAccountId[0].accountId.localeCompare(accountId);
        if (result === 0) {
            return true
        } else if (result === -1 || result === undefined) {
            return false
        }
        else {
            return false
        }
    } else {
        return false
    }
}
function checkAdminWithAccount(userid, accountid) {
    return db.query('SELECT EXISTS (SELECT 1 from account where accountAdmin = ? and accountid = ? ) as isAccountExist', [userid, accountid]).then(function (results) {
        if (results[0].isAccountExist != 1) {
            throw "Account id does not belong to this admin";
        } else {
            return results[0].isAccountExist;
        }
    });
}
exports.checkRelationDirectorUser = async (accountid, userId) => {
    let facultyAccountId = await db.query('select accountid from teacher_principal where userid = ?', [userId])
    if (facultyAccountId.length > 0) {
        let result = facultyAccountId[0].accountid.localeCompare(accountid);
        if (result === 0) {
            return true
        } else if (result === -1 || result === undefined) {
            return false
        }
        else {
            return false
        }
    } else {
        return false
    }
}
exports.deleteUsers = (userId, accountId, userroleArray) => {
    return db.transaction(async (conn) => {
        await db.setQuery(conn, 'delete from teacher_principal where userId = ? and accountId = ?', [userId, accountId]);
        let users = await db.setQuery(conn, `delete from userDetails where userrole IN(${userroleArray}) and userId = ?`, [userId]);
        return users;
    })
}
exports.unAssignedClass = async (userId) => {
    let users = await db.query('update userDetails set classId = ? , sectionId = ? where userrole = ? and userId = ?', [0, 0, UserEnum.UserRoles.Teacher, userId]);
    return users;
}

exports.getAllStaffByAccountId = async (accountId, principalId, userType) => {
    let teachers = await db.query('SELECT d.userId, firstName, lastName, cellNumber, aadharNumber, emailId, status, images, d.userrole, gender, classId, sectionId, subject, qualification from userDetails d INNER JOIN teacher_principal da where d.userId = da.userId and accountId = ? and principalId = ? and userType = ? ', [accountId, principalId, userType]);
    return teachers;
}
//get all account
exports.getAllAccounts = async (userId) => {
    let result = await db.query('SELECT accountId, accountName from account where accountAdmin = ?', [userId]);
    return result;
}

//get assigned class and section
exports.getAssignedClassAndSection = async (userId) => {
    let result = await db.query('select classId, sectionId from userDetails where userId = ?', [userId]);
    return result;
}
//get config
exports.getConfigByAccountId = async (accountId, userId) => {
    let result = await checkAdminWithAccount(userId, accountId);
    if (result == 1) {
        let configData = await db.query('select configData from config where configId = (select configId from account where accountId = ?)', [accountId]);
        return configData;
    } else {
        return [];
    }
}
//create teacher by principal
exports.createTeacher = (teacherObj, userId, accountId, userType, entranceExamType) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'INSERT into userDetails set ?', [teacherObj])
        if (result.affectedRows == 1) {
            let attendanceObj = {
                staffId: result.insertId,
                userId: userId,
                sessionId: teacherObj.sessionId,
                attendanceDate: formatDate(new Date()),
                attendance: 1
            }
            await db.setQuery(conn, 'insert into staffAttendance set ?', [attendanceObj]);
            let loopUpEntry = { "accountId": accountId, "principalId": userId, "userId": result.insertId, "userType": userType, "userrole": teacherObj.userrole, "entranceExamType": entranceExamType };
            let results = await db.setQuery(conn, 'INSERT INTO teacher_principal SET ?', loopUpEntry);
            return results.affectedRows;
        } else {
            return 0
        }
    })
}
//update teacher details
exports.updateTeacherDetails = (userId, teacherObj, entranceExamType) => {
    return db.transaction(async (conn) => {
        let loopUpEntry = { "userrole": teacherObj.userrole, "entranceExamType": entranceExamType };
        await db.setQuery(conn, 'update teacher_principal set ? where userId = ?', [loopUpEntry, userId]);
        let results = await db.setQuery(conn, 'update userDetails set ? where userId = ?', [teacherObj, userId]);
        return results.affectedRows;
    })
}
//get teacher details for update by principal
exports.getTeacherDetailForUpdate = async (accountId, principalId, userId, userType) => {
    let teachers = await db.query('SELECT d.userId, firstName, lastName, cellNumber, aadharNumber, emailId, status, images, d.userrole, gender, classId, sectionId, subject, qualification, workExperience, educationalAwards, awardDetails, dob, parmanentAddress, localAddress, da.entranceExamType, salary from userDetails d INNER JOIN teacher_principal da where d.userId = da.userId and da.accountId = ? and da.principalId = ? and da.userId = ? and da.userType = ?', [accountId, principalId, userId, userType]);
    return teachers;
}
//get assigned class
exports.getAssignedClass = async (userId) => {
    let results = await db.query('select classId, sectionId from userDetails where userId = ?', [userId]);
    return results;
}

//get teacher Details
exports.getTeacherDetails = async (userId) => {
    let results = await db.query('select * from userDetails where userId = ?', [userId]);
    return results;
}

//Assign class to teacher
exports.assignClassToTeacher = async (teacherId, classObject, accountId) => {
    return db.transaction(async (conn) => {
        let isClassAssigned = await db.setQuery(conn, 'select userId from userDetails where userId in(select userId from teacher_principal where accountId = ?) and classId = ? and sectionId = ?', [accountId, classObject.classId, classObject.sectionId]);
        if (isClassAssigned.length) {
            return 0
        } else {
            let result = await db.setQuery(conn, 'update userDetails set ? where userId = ?', [classObject, teacherId]);
            return result.affectedRows
        }
    })
}
//get subjects by selected class
exports.getSubjectForClass = async (accountId, userId, classId) => {
    let results = await db.query('select * from subjectDetails where accountId = ? and userId = ? and classId = ?', [accountId ,userId, classId]);
    if (results) {
        return results
    } else {
        return 0
    }
}
//assign subjects to selected class
exports.assignSubjectToClass =  (subjectObject) => {
    return db.transaction(async (conn) => {
        let r = await db.query('select * from subjectDetails where accountId = ? and userId = ? and classId = ?', [subjectObject.accountId, subjectObject.userId, subjectObject.classId]);
        let result
        if (r.length > 0) {
            result = await db.setQuery(conn, 'update subjectDetails set subjects = ? where accountId = ? and userId = ? and classId = ?', [subjectObject.subjects, subjectObject.accountId, subjectObject.userId, subjectObject.classId]);
        } else {
            result = await db.setQuery(conn, 'insert into subjectDetails set ? ', [subjectObject]);
        }
        return result.affectedRows
    })
}
//get Principal Details
exports.getPrincipalDetails = async (userId) => {
    let result = await db.query('select * from userDetails where userId=?', [userId])
    return result
}

//**************************** */
//save the staff Attendance
exports.saveStaffAttendance = (attendanceObj) => {
    return db.transaction(async (conn) => {
        let Result = await db.setQuery(conn, 'select * from staffAttendance where staffId = ? and userId=? and sessionId = ? and attendanceDate = ?', [attendanceObj[0][0], attendanceObj[0][1], attendanceObj[0][2], attendanceObj[0][3]]);
        if (Result.length > 0) {
            if (attendanceObj.length > 0) {
                let updateResult = ''
                for (let i = 0; i < attendanceObj.length; i++) {
                    let dataToUpdate = {
                        attendance: attendanceObj[i][4],
                        reason: attendanceObj[i][5]
                    }
                    updateResult = await db.setQuery(conn, `update staffAttendance set ? where staffId = ? and userId=? and sessionId = ? and attendanceDate = ?`, [dataToUpdate, attendanceObj[i][0], attendanceObj[i][1], attendanceObj[i][2], attendanceObj[i][3]]);
                }
                return updateResult.affectedRows
            }
        } else {
            let result = await db.setQuery(conn, 'insert into staffAttendance (staffId, userId, sessionId, attendanceDate, attendance, reason) values ?', [attendanceObj]);
            return result.affectedRows;
        }
    })
}

//get Staff attendance by date
exports.getStaffAttendanceOfDate = async (attendanceObj) => {
    let Result = await db.query('select * from staffAttendance where userId = ? and attendanceDate = ? and sessionId = ? ', [attendanceObj.userId, attendanceObj.attendanceDate, attendanceObj.sessionId]);
    return Result;
}

//get Staff Attendance Of Selected Dates
exports.getStaffAttendanceOfSelectedDates = async (attendanceObj) => {
    let Result = await db.query(`select * from staffAttendance where userId = ? and sessionId = ? and attendanceDate BETWEEN ? AND ?`, [attendanceObj.userId, attendanceObj.sessionId, attendanceObj.startDate, attendanceObj.endDate]);
    return Result;
}
