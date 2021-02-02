const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');


//Check Relation Student And User
exports.checkRelationStudentAndUser = async (accountId, studentId) => {
    let studentAccountId = await db.query('select accountId from student_teacher where studentId = ?', [studentId])
    if (studentAccountId.length > 0) {
        let result = studentAccountId[0].accountId.localeCompare(accountId);
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
//get students for ExamhHead
exports.getStudentsForExamhead = async (accountId, classId, sectionId, userStatus) => {
    let studentObj = await db.query(`select ud.userId, ud.firstName, ud.lastName, ud.status, ud.aadharNumber, ud.cellNumber, ud.classId, ud.sectionId, ud.dob, er.totalMarks, er.obtainedMarks from userDetails ud inner join entranceResult er on ud.userId = er.studentId where userId IN(select studentId from student_teacher where accountId = ?) and classId = ? and sectionId = ? and ud.status IN (${userStatus})`, [accountId, classId, sectionId]);
    return studentObj;
}
//delete student By Exam Head
exports.deleteStudent = async (studentId, userId) => {
    await db.query('delete from userDetails where userId = ?', [studentId]);
    await db.query('delete from student_teacher where teacherId = ? and studentId = ?', [userId, studentId]);
    let result = await db.query('delete from entranceresult where studentId = ? and teacherid = ?', [studentId, userId]);

    return result.affectedRows;
}

exports.pramoteStudent = async (pramoteObj) => {
    let result = await db.query('update userDetails set userrole = ?, status = ? where userId = ?', [pramoteObj.userrole, pramoteObj.status, pramoteObj.studentId]);
    return result
}

//get entrance question based on selected class by Exam Head
exports.getClassForEntrance = async (accountId, classId) => {
    let result = await db.query('select * from entranceQuestions where accountId = ? and classId = ?', [accountId, classId]);
    return result;
}
//delete question by Exam Head
exports.deleteEntranceQuestion = async (questionId, accountId) => {
    let result = await db.query('delete from entranceQuestions where questionId = ? and accountId = ?', [questionId, accountId]);
    return result.affectedRows;
}
//Save Student Details
exports.saveStusentEntrance = (student, userId) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'INSERT into userDetails set ?', [student])
        if (result.affectedRows == 1) {
            let student_teacherObj = {
                teacherId: userId,
                studentId: result.insertId
            }
            let studentteacher = await db.setQuery(conn, 'insert into student_teacher set ?', [student_teacherObj]);
            await db.setQuery(conn, 'insert into entranceresult set ?', [student_teacherObj]);
            return studentteacher;
        } else {
            return 0
        }
    })
}

//get question for edit
exports.getStudentForEdit = async (teacherId, studentId) => {
    let result = await db.query('select * from userDetails where userId = (select studentId from student_teacher where teacherId = ? and studentId = ?)', [teacherId, studentId]);
    return result;
}
//update the entrance student registrtation
exports.updateEntranceStudent = async (studentObject, studentId, userId) => {
    let update = await db.query('update userDetails set  ?  where userId =(select studentId from student_teacher where teacherId = ? and studentId = ?)', [studentObject, userId, studentId]);
    return update
}
//update student userrrole
exports.updateEntranceUserrole = async (studentId, userrole, status) => {
    let update = await db.query('update userDetails set userrole = ?, status = ?  where userId = ?', [userrole, status, studentId]);
    return update.affectedRows
}
//get question for edit
exports.getQuestionForEdit = async (accountId, questionId) => {
    let result = await db.query('select * from entranceQuestions where accountId = ? and questionId = ?', [accountId, questionId]);
    return result;
}
//Update Question
exports.updateEntranceQuestion = async (questionObj) => {
    let result = await db.query('update entranceQuestions set ? where questionId = ?', [questionObj, questionObj.questionId]);
    return result.affectedRows;
}
//Save Entrance Question
exports.saveEntranceQuestion = async (questionObj) => {
    let result = await db.query('INSERT into entranceQuestions set ?', [questionObj]);
    return result.affectedRows;
}
exports.getQuestionForEntrance = async (userId, accountId) => {
    let result = await db.query('select * from entranceQuestions where classID = (select classId from userDetails where userId = ?) and accountId = ? ', [userId, accountId]);
    return result;
}

exports.insertEntranceResult = (entranceResult, userrole, status) => {
    return db.transaction(async (conn) => {
        await db.setQuery(conn, 'update userDetails set userrole = ?, status = ? where userId = ?', [userrole, status, entranceResult.studentId]);
        let result = await db.setQuery(conn, 'update entranceResult set ? where studentId = ?', [entranceResult, entranceResult.studentId]);
        return result;
    })
}
//get Entrance Completed Result
exports.getEntranceCompletedResult = async (studentId) => {
    let result = await db.query('select * from entranceResult where studentId = ?', [studentId]);
    if (result) {
        return result;
    } else {
        return 0;
    }
}

//Create Class Seats
exports.createClassSeats = async (classSeatObject) => {
    let result = await db.query('insert into classSeatDetails set ?', [classSeatObject]);
    return result.affectedRows;
}

//Create Class Seats
exports.updateClassSeats = async (classSeatObject) => {
    let result = await db.query('update classSeatDetails set ? where classSeatId = ?', [classSeatObject, classSeatObject.classSeatId]);
    return result.affectedRows;
}

//get class seats details
exports.getClassSeatsDetails = async (classSeatObject) => {
    let result = await db.query('select * from classSeatDetails where accountId = ? and userId = ? and sessionId = ?', [classSeatObject.accountId, classSeatObject.userId, classSeatObject.sessionId]);
    return result;
}

//get class seats details for Edit
exports.getClassSeatsDetailForEdit = async (classSeatObject) => {
    let result = await db.query('select * from classSeatDetails where accountId = ? and userId = ? and sessionId = ? and classId = ? and sectionId = ?', [classSeatObject.accountId, classSeatObject.userId, classSeatObject.sessionId, classSeatObject.classId, classSeatObject.sectionId]);
    return result;
}

//delete class seats details
exports.deleteClassSeatsDetails = async (classSeatObject) => {
    let result = await db.query('delete from classSeatDetails where accountId = ? and userId = ? and sessionId = ? and classSeatId = ?', [classSeatObject.accountId, classSeatObject.userId, classSeatObject.sessionId, classSeatObject.classSeatId]);
    return result.affectedRows;
}

//get Students List
exports.getStudentsList = (accountId, classArray) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'SELECT student_teacher.studentId FROM teacher_principal INNER JOIN student_teacher ON teacher_principal.userId = student_teacher.teacherId where teacher_principal.accountId = ?', [accountId]);
        let studentArray = []
        result.map((item) => {
            studentArray.push(item.studentId)
        })
        let students = await db.setQuery(conn, `select * from userDetails where userId IN (${studentArray}) and classId IN(${classArray})`);
        if (students.length > 0) {
            return students;
        } else {
            return false
        }
    })
}

//save Create Mixed Students
exports.createMixedStudents = async (mixedStudentsObj) => {
    let result = await db.query('insert into mixedStudentsDetails set ?', [mixedStudentsObj]);
    return result.affectedRows;
}

//update Mixed Students
exports.updateMixedStudents = async (mixedStudentsObj) => {
    let result = await db.query('update mixedStudentsDetails set ? where mixedClassStudentId = ?', [mixedStudentsObj, mixedStudentsObj.mixedClassStudentId]);
    return result.affectedRows;
}

//get Mixed Options
exports.getMixedOptions = async (mixedOptions) => {
    let result = await db.query('select * from mixedStudentsDetails where accountId = ? and userId = ? and sessionId = ?', [mixedOptions.accountId, mixedOptions.userId, mixedOptions.sessionId]);
    return result;
}

//get Mixed students
exports.getMixedStudents = async (mixedOptions) => {
    let result = await db.query('select * from mixedStudentsDetails where accountId = ? and userId = ? and sessionId = ? and mixedOptions = ?', [mixedOptions.accountId, mixedOptions.userId, mixedOptions.sessionId, mixedOptions.mixedOptions]);
    return result;
}

//save Seating Arrangement
exports.saveSeatingArrangement = (seatingObj, mixedClassStudent) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'insert into seatingArrangement set ?', [seatingObj])
        if (result.affectedRows == 1) {
            let classSeatsObj = {
                isAssigned: 1
            }
            await db.setQuery(conn, 'update classSeatDetails set ? where accountId = ? and userId = ? and sessionId = ? and classId = ? and sectionId = ?', [classSeatsObj, seatingObj.accountId, seatingObj.userId, seatingObj.sessionId, seatingObj.classId, seatingObj.sectionId])
            let updateMixed = await db.setQuery(conn, 'update mixedStudentsDetails set ? where accountId = ? and userId = ? and sessionId = ? and mixedOptions = ?', [mixedClassStudent, mixedClassStudent.accountId, mixedClassStudent.userId, mixedClassStudent.sessionId, mixedClassStudent.mixedOptions])
            if (updateMixed.affectedRows == 1) {
                return updateMixed.affectedRows
            } else {
                return false
            }
        } else {
            return false
        }
    })
}

//get Seating Arrangement
exports.getSeatingArrangement = async (getArrangementObj) => {
    let result = await db.query('select * from seatingArrangement where accountId = ? and sessionId = ? and classId = ? and sectionId = ?', [getArrangementObj.accountId, getArrangementObj.sessionId, getArrangementObj.classId, getArrangementObj.sectionId]);
    return result;
}

//Allow for exam
exports.allowForExam = (studentObj) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'select * from entranceResult where studentId = ?', [studentObj.studentId]);
        if (result.length == 0) {
            let studentResultObj = {
                teacherId: studentObj.userId,
                studentId: studentObj.studentId,
                sessionId: studentObj.sessionId
            }
            await db.setQuery(conn, 'insert into entranceResult set ?', [studentResultObj]);
            let result = await db.setQuery(conn, 'UPDATE userDetails set userrole = ?, status = ? where userId = ?', [studentObj.userrole, studentObj.status, studentObj.studentId])
            return result.affectedRows;
        } else {
            return false;
        }
    })
}
