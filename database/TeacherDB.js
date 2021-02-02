const db = require('./db.js');
const { formatDate } = require('../api/ValidationFunctions');

exports.checkTeacherStudentRelation = async (studentId, accountId) => {
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
exports.checkAadharNumber = async (aadharNumber) => {
    let result = await db.query('select aadharNumber from userDetails where aadharNumber = ?', aadharNumber);
    if (result.length > 0) {
        return result
    } else {
        return 0
    }
}
exports.checkEmailId = async (emailId) => {
    let result = await db.query('select emailId from userDetails where emailId = ?', emailId);
    if (result.length > 0) {
        return result
    } else {
        return 0
    }
}
exports.checkProviderByAccountID = async (userId, accountId) => {
    let result = await db.query('select EXISTS (select 1 from teacher_principal where userId = ? and accountId = ?) as data', [userId, accountId]);
    if (result.length > 0 && result[0].data == 0) {
        return (new Error("there is no provider linked to this account"));
    } else
        return (result);
}
//get config details by Admin
exports.getconfigdetailsByPrincipal = async (userId) => {
    let configData = await db.query('select configData from config where configId = (select configId from account where accountAdmin = ?)', [userId]);
    return configData;
}
//get assigned class and section
exports.getAssignedClassAndSection = async (userId) => {
    let result = await db.query('select classId, sectionId from userDetails where userId = ?', [userId]);
    return result;
}
//get config details
exports.getconfigdetailsByAllUsers = async (userId) => {
    let configData = await db.query('select configData from config where configId = (select configId from account where accountId = (select accountId from teacher_principal where userId = ?))', [userId]);
    return configData;
}
//get config details by Student
exports.getconfigdetailsByStudent = async (userId) => {
    let configData = await db.query('select configData from config where configId = (select configId from account where accountId = (select accountId from teacher_principal where userId = (select teacherId from student where studentId=?)))', [userId]);
    return configData;
}
//get students for class teacher
exports.getAllStudents = async (getStudentObj) => {
    return db.transaction(async (conn) => {
        let classData = await db.setQuery(conn, 'select classId, sectionId from userDetails where userId = ?', getStudentObj.teacherId);
        if (classData[0].classId) {
            let results = await db.setQuery(conn, `SELECT * from userDetails ud INNER JOIN student_teacher st where ud.userId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and ud.status IN (${getStudentObj.status}) and userType = ? `, [getStudentObj.accountId, classData[0].classId, classData[0].sectionId, getStudentObj.sessionId, getStudentObj.userType]);
            return results;
        } else {
            return 0;
        }
    })
}
//get inactivated students for class teacher
exports.getAllInactivatedStudents = (teacherId, status, sessionId) => {
    return db.transaction(async (conn) => {
        let classData = await db.setQuery(conn, 'select classId, sectionId from userDetails where userId = ?', teacherId);
        if (classData[0].classId) {
            let results = await db.setQuery(conn, 'select * from userDetails where classId = ? and sectionId = ? and sessionId = ? and status = ?  and userId IN(select studentId from student_teacher where teacherId = ?)', [classData[0].classId, classData[0].sectionId, sessionId, status, teacherId]);
            return results;
        } else {
            return 0;
        }
    })
}
//get class and section of teacher
exports.getTeacherClassSection = async (userId, sessionId) => {
    let classData = await db.query('select classId, sectionId from userDetails where userId = ? and sessionId = ?', [userId, sessionId]);
    return classData;
}
//Create Student Details
exports.createStudentDetails = (createStudentObject, userId, accountId, userType) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'INSERT into userDetails set ?', [createStudentObject])
        if (result.affectedRows == 1) {
            let studentFeeObj = {
                accountId: accountId,
                studentId: result.insertId,
                sessionId: createStudentObject.sessionId
            }
            await db.setQuery(conn, 'insert into studentFeeDetails set ?', [studentFeeObj]);
            let loopUpEntry = {
                "accountId": accountId,
                "teacherId": userId,
                "studentId": result.insertId,
                "classId": createStudentObject.classId,
                "sectionId": createStudentObject.sectionId,
                "sessionId": createStudentObject.sessionId,
                "userType": userType
            };
            let results = await db.setQuery(conn, 'INSERT INTO student_teacher SET ?', loopUpEntry);
            return results.affectedRows;
        } else {
            return 0
        }
    })
}
//Update Student Details
exports.updateStusentRecord = async (studentObj, teacherId, accountId, status, userType) => {
    return db.transaction(async (conn) => {
        let result = await db.setQuery(conn, 'update userDetails  set ? where userId = ?', [studentObj, studentObj.userId]);
        if (result.affectedRows == 1 && status == 13) {
            let attendanceObj = {
                studentId: studentObj.userId,
                teacherId: teacherId,
                sessionId: studentObj.sessionId,
                attendanceDate: formatDate(new Date()),
                attendance: 1
            }
            await db.setQuery(conn, 'insert into studentAttendance set ?', [attendanceObj]);
            let loopUpEntry = {
                "accountId": accountId,
                "teacherId": teacherId,
                "studentId": studentObj.userId,
                "classId": studentObj.classId,
                "sectionId": studentObj.sectionId,
                "sessionId": studentObj.sessionId,
                "userType": userType
            };
            await db.setQuery(conn, 'update student_teacher set ? where studentId = ?', [loopUpEntry, studentObj.userId]);
            if (studentObj.busService == 1) {
                let studentFeeObj = {
                    accountId: accountId,
                    studentId: studentObj.userId,
                    sessionId: studentObj.sessionId
                }
                await db.setQuery(conn, 'insert into studentTransportFeeDetails set ?', [studentFeeObj]);
            }
        } else {
            if (studentObj.busService == 1) {
                let transportResult = await db.setQuery(conn, 'select * from studentTransportFeeDetails where accountId =  ? and sessionId = ? and studentId = ?', [accountId, studentObj.sessionId, studentObj.userId]);
                if (transportResult.length == 0) {
                    let studentFeeObj = {
                        accountId: accountId,
                        studentId: studentObj.userId,
                        sessionId: studentObj.sessionId
                    }
                    await db.setQuery(conn, 'insert into studentTransportFeeDetails set ?', [studentFeeObj]);
                }
            }
        }
        return result.affectedRows;
    })
}

//get student details for update
exports.getStudentDetails = async (studentId, sessionId) => {
    let results = await db.query('select * from userDetails where userId = ? and sessionId = ?', [studentId, sessionId]);
    return results;
}
//Assign subject to Teacher
exports.getAssignSubjectToClass = async (userId, accountId) => {
    let result = await db.query('select * from subjectDetails where classId = (select classId from userDetails where userId = ?) and accountId = ?', [userId, accountId]);
    return result
}
//fill Student Result
exports.saveStusentResult = (results, sessionId) => {
    return db.transaction(async (conn) => {
        let Result = await db.setQuery(conn, 'select studentId, teacherId, sessionId, examinationType from studentresult where studentId = ? and teacherId=? and examinationType=? and sessionId=? ORDER BY modifiedDate LIMIT 3', [results.studentId, results.teacherId, results.examinationType, sessionId]);
        if (Result.length > 0) {
            let result1 = await db.setQuery(conn, 'update studentresult set ? where studentId = ? and teacherId = ? and sessionId = ? and examinationType = ?', [results, results.studentId, results.teacherId, sessionId, results.examinationType]);
            return result1.affectedRows;
        } else {
            results.sessionId = sessionId;
            let result = await db.setQuery(conn, 'insert into studentresult set ?', results);
            return result.affectedRows;
        }
    })
}
//fill Student Attendance
exports.saveStusentAttendance = (results, sessionId) => {
    return db.transaction(async (conn) => {
        let Result = await db.setQuery(conn, 'select studentId, teacherId, sessionId from attendance where studentId = ? and teacherId=? and sessionId = ?', [results.studentId, results.teacherId, sessionId]);
        if (Result.length > 0) {
            let result1 = await db.setQuery(conn, 'update attendance set ? where studentId = ? and teacherId = ? and sessionId = ?', [results, results.studentId, results.teacherId, sessionId]);
            return result1.affectedRows;
        } else {
            results.sessionId = sessionId;
            let result = await db.setQuery(conn, 'insert into attendance set ?', results);
            return result.affectedRows;
        }
    })
}

//get Student Result All
exports.getStudentsResult = async (teacherId) => {
    let result = await db.query('CALL SQSP_GetResult(?)', [teacherId]);
    return result[0];
}
//get Attendance all students
exports.getAllStudentsAttendance = async (teacherId) => {
    let result = await db.query('CALL SQSP_GetAttendance(?)', [teacherId]);
    return result[0];
}
//get teacher Details
exports.getTeacherDetails = async (userId) => {
    let result = await db.query('select * from userDetails where userId=?', [userId])
    return result
}
//Update teacher details
exports.updateOnboardDetails = async (image, userId) => {
    let result = await db.query('update userDetails set images = ? where userId = ?', [image, userId])
    return result;
}
//check password
exports.checkpassword = async (userId) => {
    let result = await db.query('select password from userDetails where userId = ?', [userId])
    return result[0]
}
//change password
exports.changePassword = async (password, userId) => {
    let result = await db.query('update userDetails set password = ? where userId = ?', [password, userId])
    return result
}

//inactivate the student
exports.inactivateStudent = async (studentId, status, userrole) => {
    let results = await db.query(`update userDetails set status = ${status} WHERE userid = ? and userrole = ?`, [studentId, userrole]);
    return results.affectedRows
}

//reactivate the student
exports.reactivateStudent = async (studentId, status, userrole) => {
    let results = await db.query(`update userDetails set status = ${status} WHERE userid = ? and userrole = ?`, [studentId, userrole]);
    return results.affectedRows
}

//get registration details for print
exports.getStudentRegistrationDetails = (userId, sessionId, accountId) => {
    return db.transaction(async (conn) => {
        let school = await db.setQuery(conn, 'select accountName, accountRefNumber, accountAddress from account where accountId = ?', [accountId]);
        let studentData = await db.setQuery(conn, 'select * from userDetails where userId = ? and sessionId = ?', [userId, sessionId])
        let printData = {
            studentData: studentData,
            school: school
        }
        return printData;
    })
}

//save attendance of student
exports.saveDailyAttendance = (attendanceObj) => {
    return db.transaction(async (conn) => {
        for (let i = 0; i < attendanceObj.length; i++) {
            let school = await db.setQuery(conn, 'select * from monthlyattendance where accountId = ? and teacherId = ? and studentId = ? and classId = ? and sectionId = ? and sessionId = ?', [attendanceObj[i].accountId, attendanceObj[i].teacherId, attendanceObj[i].studentId, attendanceObj[i].classId, attendanceObj[i].sectionId, attendanceObj[i].sessionId]);
            let currentMonthNumber = new Date().getMonth();
            let currentDayNumber = new Date().getDate().toString();
            let monthData = null
            if (currentMonthNumber === 0) {
                monthData = school[0].january
            } else if (currentMonthNumber === 1) {
                monthData = school[0].february
            } else if (currentMonthNumber === 2) {
                monthData = school[0].march
            } else if (currentMonthNumber === 3) {
                monthData = school[0].april
            } else if (currentMonthNumber === 4) {
                monthData = school[0].may
            } else if (currentMonthNumber === 5) {
                monthData = school[0].june
            } else if (currentMonthNumber === 6) {
                monthData = school[0].july
            } else if (currentMonthNumber === 7) {
                monthData = school[0].august
            } else if (currentMonthNumber === 8) {
                monthData = school[0].september
            } else if (currentMonthNumber === 9) {
                monthData = school[0].october
            } else if (currentMonthNumber === 10) {
                monthData = school[0].november
            } else if (currentMonthNumber === 11) {
                monthData = school[0].december
            }

            if (monthData === null) {
                let atten = ''
                if (currentMonthNumber === 0) {
                    atten = { january: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 1) {
                    atten = { february: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 2) {
                    atten = { march: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 3) {
                    atten = { april: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 4) {
                    atten = { may: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 5) {
                    atten = { june: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 6) {
                    atten = { july: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 7) {
                    atten = { august: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 8) {
                    atten = { september: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 9) {
                    atten = { october: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 10) {
                    atten = { november: JSON.stringify([currentDayNumber]) }
                } else if (currentMonthNumber === 11) {
                    atten = { december: JSON.stringify([currentDayNumber]) }
                }
                let result = await db.setQuery(conn, 'update monthlyattendance set ? where accountid = ? and teacherId = ? and studentId = ? and classid = ? and section = ? and session = ? ', [atten, attendanceObj[i].accountid, attendanceObj[i].teacherId, attendanceObj[i].studentId, attendanceObj[i].classid, attendanceObj[i].section, attendanceObj[i].session]);
            } else {
                let oldData = '';
                let varvar = ''
                if (currentMonthNumber === 0) {
                    oldData = JSON.parse(school[0].january)
                    oldData.push(currentDayNumber)
                    varvar = { january: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 1) {
                    oldData = JSON.parse(school[0].february)
                    oldData.push(currentDayNumber)
                    varvar = { february: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 2) {
                    oldData = JSON.parse(school[0].march)
                    oldData.push(currentDayNumber)
                    varvar = { march: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 3) {
                    oldData = JSON.parse(school[0].april)
                    oldData.push(currentDayNumber)
                    varvar = { april: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 4) {
                    oldData = JSON.parse(school[0].may)
                    oldData.push(currentDayNumber)
                    varvar = { may: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 5) {
                    oldData = JSON.parse(school[0].june)
                    oldData.push(currentDayNumber)
                    varvar = { june: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 6) {
                    oldData = JSON.parse(school[0].july)
                    oldData.push(currentDayNumber)
                    varvar = { july: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 7) {
                    oldData = JSON.parse(school[0].august)
                    oldData.push(currentDayNumber)
                    varvar = { august: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 8) {
                    oldData = JSON.parse(school[0].september)
                    oldData.push(currentDayNumber)
                    varvar = { september: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 9) {
                    oldData = JSON.parse(school[0].october)
                    oldData.push(currentDayNumber)
                    varvar = { october: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 10) {
                    oldData = JSON.parse(school[0].november)
                    oldData.push(currentDayNumber)
                    varvar = { november: JSON.stringify([...new Set(oldData)]) }
                } else if (currentMonthNumber === 11) {
                    oldData = JSON.parse(school[0].december)
                    oldData.push(currentDayNumber)
                    varvar = { december: JSON.stringify([...new Set(oldData)]) }
                }
                let resultU = await db.setQuery(conn, 'update monthlyattendance set ? where accountid = ? and teacherId = ? and studentId = ? and classid = ? and section = ? and session = ? ', [varvar, attendanceObj[i].accountid, attendanceObj[i].teacherId, attendanceObj[i].studentId, attendanceObj[i].classid, attendanceObj[i].section, attendanceObj[i].session]);
            }

        }
        return 1;
    })
}

//getDailyAttendance
exports.getDailyAttendance = (accountId, teacherId, sessionId) => {
    return db.transaction(async (conn) => {
        let currentMonthNumber = new Date().getMonth();
        let monthName = ''
        if (currentMonthNumber === 0) {
            monthName = 'january'
        } else if (currentMonthNumber === 1) {
            monthName = 'february'
        } else if (currentMonthNumber === 2) {
            monthName = 'march'
        } else if (currentMonthNumber === 3) {
            monthName = 'april'
        } else if (currentMonthNumber === 4) {
            monthName = 'may'
        } else if (currentMonthNumber === 5) {
            monthName = 'june'
        } else if (currentMonthNumber === 6) {
            monthName = 'july'
        } else if (currentMonthNumber === 7) {
            monthName = 'august'
        } else if (currentMonthNumber === 8) {
            monthName = 'september'
        } else if (currentMonthNumber === 9) {
            monthName = 'october'
        } else if (currentMonthNumber === 10) {
            monthName = 'november'
        } else if (currentMonthNumber === 11) {
            monthName = 'december'
        }
        let getAttendance = await db.setQuery(conn, `select ${monthName}, studentId from monthlyattendance where accountid = ? and teacherId = ? and sessionId = ?`, [accountId, teacherId, sessionId]);
        return getAttendance;
    })
}

//save the student results
exports.saveStudentResult = (resultObject) => {
    return db.transaction(async (conn) => {
        let Result = await db.setQuery(conn, 'select studentId, teacherId, sessionId from examResultDetails where studentId = ? and teacherId=? and sessionId = ? and examinationType = ?', [resultObject.studentId, resultObject.teacherId, resultObject.sessionId, resultObject.examinationType]);
        if (Result.length > 0) {
            let result1 = await db.setQuery(conn, 'update examResultDetails set ? where studentId = ? and teacherId=? and sessionId = ? and examinationType = ?', [resultObject, resultObject.studentId, resultObject.teacherId, resultObject.sessionId, resultObject.examinationType]);
            return result1.affectedRows;
        } else {
            let result = await db.setQuery(conn, 'insert into examResultDetails set ?', resultObject);
            return result.affectedRows;
        }
    })
}

//get the student results
exports.getStudentResult = async (resultObject) => {
    let Result = await db.query('select * from examResultDetails where studentId = ? and teacherId=? and sessionId = ? and examinationType = ?', [resultObject.studentId, resultObject.teacherId, resultObject.sessionId, resultObject.examinationType]);
    return Result;
}

//save the student Attendance
exports.saveStudentAttendance = (attendanceObj) => {
    return db.transaction(async (conn) => {
        let Result = await db.setQuery(conn, 'select * from studentAttendance where studentId = ? and teacherId=? and sessionId = ? and attendanceDate = ?', [attendanceObj[0][0], attendanceObj[0][1], attendanceObj[0][2], attendanceObj[0][3]]);
        if (Result.length > 0) {
            if (attendanceObj.length > 0) {
                let updateResult = ''
                for (let i = 0; i < attendanceObj.length; i++) {
                    let dataToUpdate = {
                        attendance: attendanceObj[i][4],
                        reason: attendanceObj[i][5]
                    }
                    updateResult = await db.setQuery(conn, `update studentAttendance set ? where studentId = ? and teacherId=? and sessionId = ? and attendanceDate = ?`, [dataToUpdate, attendanceObj[i][0], attendanceObj[i][1], attendanceObj[i][2], attendanceObj[i][3]]);
                }
                return updateResult.affectedRows
            }
        } else {
            let result = await db.setQuery(conn, 'insert into studentAttendance (studentId, teacherId, sessionId, attendanceDate, attendance, reason) values ?', [attendanceObj]);
            return result.affectedRows;
        }
    })
}

//get class attendance by date
exports.getClassAttendanceOfDate = async (attendanceObj) => {
    return db.transaction(async (conn) => {
        let classData = await db.setQuery(conn, 'select classId, sectionId from userDetails where userId = ?', attendanceObj.teacherId);
        if (classData[0].classId) {
            let results = await db.setQuery(conn, `SELECT * from studentAttendance ud INNER JOIN student_teacher st where ud.studentId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and st.userType = ? and ud.attendanceDate = ?`, [attendanceObj.accountId, classData[0].classId, classData[0].sectionId, attendanceObj.sessionId, attendanceObj.userType, attendanceObj.attendanceDate]);
            return results;
        } else {
            return 0;
        }
    })
    // let Result = await db.query(`select * from studentAttendance where teacherId=? and attendanceDate = ? and sessionId = ?`, [attendanceObj.teacherId, attendanceObj.attendanceDate, attendanceObj.sessionId]);
    // return Result;
}

//get Class Attendance Of Selected Dates
exports.getClassAttendanceOfSelecteddates = async (attendanceObj) => {
    return db.transaction(async (conn) => {
        let classData = await db.setQuery(conn, 'select classId, sectionId from userDetails where userId = ?', attendanceObj.teacherId);
        if (classData[0].classId) {
            let results = await db.setQuery(conn, `SELECT * from studentAttendance ud INNER JOIN student_teacher st where ud.studentId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and st.userType = ? and ud.attendanceDate BETWEEN ? AND ?`, [attendanceObj.accountId, classData[0].classId, classData[0].sectionId, attendanceObj.sessionId, attendanceObj.userType, attendanceObj.startDate, attendanceObj.endDate]);
            return results;
        } else {
            return 0;
        }
    })
    // let results = await db.query(`SELECT * from studentAttendance ud INNER JOIN student_teacher st where ud.studentId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and st.userType = ? and st.attendanceDate BETWEEN ? AND ?`, [attendanceObj.accountId, classData[0].classId, classData[0].sectionId, attendanceObj.sessionId, attendanceObj.userType, attendanceObj.startDate, attendanceObj.endDate]);

    // let Result = await db.query(`select * from studentAttendance where teacherId = ? and sessionId = ? and attendanceDate BETWEEN ? AND ?`, [attendanceObj.teacherId, attendanceObj.sessionId, attendanceObj.startDate, attendanceObj.endDate]);
    // return Result;
}

//get student profile
exports.getStudentprofileDetails = async (studentId, sessionId) => {
    let Result = await db.query('select * from userDetails where userId=? and sessionId = ? ', [studentId, sessionId]);
    return Result;
}

//get student result
exports.getStudentResultDetails = async (studentId, sessionId, examinationType) => {
    let Result = await db.query(`select * from examResultDetails where studentId = ? and sessionId = ? and examinationType IN (${examinationType})`, [studentId, sessionId, examinationType]);
    return Result;
}

//save Home Work Details
exports.createHomeWork = async (homeWorkObj) => {
    let result = await db.query('insert into classHomeWorkDetails set ?', [homeWorkObj]);
    return result.affectedRows;
}

//Update Home Work Details
exports.updateHomeWorkDetails = async (homeWorkObj) => {
    let result = await db.query('update classHomeWorkDetails set ? where accountId = ? and sessionId = ? and userId = ? and homeWorkId = ? and mediumType = ?', [homeWorkObj, homeWorkObj.accountId, homeWorkObj.sessionId, homeWorkObj.userId, homeWorkObj.homeWorkId, homeWorkObj.mediumType]);
    return result.affectedRows;
}

//Get Home Work Details For Update
exports.getHomeWorkDetailsForUpdate = async (homeWorkObj) => {
    let result = await db.query('select * from classHomeWorkDetails  where accountId = ? and sessionId = ? and userId = ? and homeWorkId = ?', [homeWorkObj.accountId, homeWorkObj.sessionId, homeWorkObj.userId, homeWorkObj.homeWorkId]);
    return result;
}

//Get Home Work Details 
exports.getHomeWorkDetails = async (homeWorkObj) => {
    let result = await db.query('select * from classHomeWorkDetails  where accountId = ? and sessionId = ? and classId = ? and sectionId = ? and mediumType = ? and homeWorkDate = ?', [homeWorkObj.accountId, homeWorkObj.sessionId, homeWorkObj.classId, homeWorkObj.sectionId, homeWorkObj.mediumType, homeWorkObj.homeWorkDate]);
    return result;
}
//Delete Home Work
exports.deleteHomeWork = async (homeWorkObj) => {
    let result = await db.query('delete from classHomeWorkDetails  where accountId = ? and sessionId = ? and userId = ? and homeWorkId = ?', [homeWorkObj.accountId, homeWorkObj.sessionId, homeWorkObj.userId, homeWorkObj.homeWorkId]);
    return result.affectedRows;
}
//save Notice Details
exports.createNotice = async (noticeObj) => {
    let result = await db.query('insert into studentNoticeDetails set ?', [noticeObj]);
    return result.affectedRows;
}

//Update Notice Details
exports.updateNitice = async (noticeObj) => {
    let result = await db.query('update studentNoticeDetails set ? where accountId = ? and sessionId = ? and userId = ? and noticeId = ?', [noticeObj, noticeObj.accountId, noticeObj.sessionId, noticeObj.userId, noticeObj.noticeId]);
    return result.affectedRows;
}

//get notice for update
exports.getNoticeForUpdate = async (noticeObj) => {
    let result = await db.query('select * from studentNoticeDetails where accountId = ? and sessionId = ? and studentId = ? and noticeId = ?', [noticeObj.accountId, noticeObj.sessionId, noticeObj.studentId, noticeObj.noticeId]);
    return result;
}

//delete notice 
exports.deleteStudentNotice = async (noticeObj) => {
    let result = await db.query('delete from studentNoticeDetails where accountId = ? and sessionId = ? and studentId = ? and noticeId = ?', [noticeObj.accountId, noticeObj.sessionId, noticeObj.studentId, noticeObj.noticeId]);
    return result.affectedRows;
}

//get all notice of student
exports.getAllNoticeOfStudent = async (noticeObj) => {
    let result = await db.query('select * from studentNoticeDetails where accountId = ? and sessionId = ? and studentId = ?', [noticeObj.accountId, noticeObj.sessionId, noticeObj.studentId]);
    return result;
}

//save Parent Details
exports.createStudentParentDetails = async (parentDetailsObj) => {
    return db.transaction(async (conn) => {
        let parentDetails = await db.setQuery(conn, 'select * from studentParentDetails where studentId = ? and accountId = ? and userId = ?', [parentDetailsObj.studentId, parentDetailsObj.accountId, parentDetailsObj.userId]);
        if (parentDetails.length == 0) {
            let saveResult = await db.setQuery(conn, 'insert into studentParentDetails set ?', [parentDetailsObj]);
            return saveResult.affectedRows;
        } else {
            let updateResult = await db.setQuery(conn, 'update studentParentDetails set ? where studentId = ? and accountId = ? and userId = ?', [parentDetailsObj, parentDetailsObj.studentId, parentDetailsObj.accountId, parentDetailsObj.userId]);
            return updateResult.affectedRows;
        }
    })
}

//Update Parent Details
exports.updateParentDetails = async (parentObj) => {
    let updateResult = await db.query('update studentParentDetails set ? where studentId = ? and accountId = ? and userId = ? and Id = ?', [parentObj, parentObj.studentId, parentObj.accountId, parentObj.userId, parentObj.Id]);
    return updateResult.affectedRows;
}
//get Parent Details of Student
exports.getParentDetailsOfStudent = async (parentObj) => {
    let result = await db.query('select * from studentParentDetails where studentId = ? and accountId = ?', [parentObj.studentId, parentObj.accountId]);
    return result;
}


//get Parent Details of Student to update
exports.getParentDetailsOfStudentToUpdate = async (parentObj) => {
    let result = await db.query('select * from studentParentDetails where Id = ? and studentId = ? and accountId = ? and userId = ?', [parentObj.Id, parentObj.studentId, parentObj.accountId, parentObj.userId]);
    return result;
}