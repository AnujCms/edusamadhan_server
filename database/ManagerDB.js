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
//Create student by Manager
exports.createStudent = (createStudentObject, userId, accountId, userType) => {
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

//update student details
exports.updateStudentDetails = (studentObj, studentId, accountId) => {
    return db.transaction(async (conn) => {
        let loopUpEntry = {
            "classId": studentObj.classId,
            "sectionId": studentObj.sectionId,
        };
        await db.setQuery(conn, 'update student_teacher  set ? where studentId = ? and sessionId = ? and accountId = ?', [loopUpEntry, studentId, studentObj.sessionId, accountId]);
        let result = await db.setQuery(conn, 'update userDetails  set ? where userId = ?', [studentObj, studentId]);
        return result.affectedRows;
    })
}

//delete student details
exports.deleteStudentDetails = (studentObj) => {
    return db.transaction(async (conn) => {
        await db.setQuery(conn, 'delete from studentFeeDetails where studentId = ? and sessionId = ?', [studentObj.studentId, studentObj.sessionId]);
        await db.setQuery(conn, 'delete from entranceResult where studentId = ? and sessionId = ?', [studentObj.studentId, studentObj.sessionId]);
        await db.setQuery(conn, 'delete from student_teacher  where studentId = ? and sessionId = ? and accountId = ?', [studentObj.studentId, studentObj.sessionId, studentObj.accountId]);
        let result = await db.setQuery(conn, 'delete from userDetails where userId = ? and sessionId = ?', [studentObj.studentId, studentObj.sessionId]);
        return result;
    })
}

//get student details for update
exports.getStudentDetailsForUpdate = async (getStudentObj) => {
    let results = await db.query(`SELECT userId, firstName, lastName, dob, cellNumber, aadharNumber, status, userrole, mediumType, classId, sectionId from userDetails where userId = ? and sessionId = ?`, [getStudentObj.studentId, getStudentObj.sessionId]);
    return results
}

//get all students of a class
exports.getAllRegisteredStudentsOfClass = async (getStudentObj, userType) => {
    let results = await db.query(`SELECT userId, firstName, lastName, dob, cellNumber, aadharNumber, status, userrole, mediumType from userDetails ud INNER JOIN student_teacher st where ud.userId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and st.userType = ?`, [getStudentObj.accountId, getStudentObj.classId, getStudentObj.sectionId, getStudentObj.sessionId, userType]);
    return results;
}

//get user type
exports.getUserType = async (userId) => {
    let results = await db.query(`SELECT * from director_user where userId = ?`, [userId]);
    return results;
}

// ************************ Message

//get user details
exports.getUserDetails = async (accountId, messageUser, userType) => {
    let userDetails = ''
    if(messageUser == 2){
        userDetails = await db.query('SELECT firstName, lastName from userDetails ud INNER JOIN account aa where ud.userId = aa.accountAdmin and aa.accountId = ? ', [accountId]);
    }else{
        userDetails = await db.query('SELECT firstName, lastName from userDetails ud INNER JOIN director_user du where du.userId = ud.userId and du.accountId = ? and du.userType = ? and du.userrole = ?', [accountId, userType, messageUser]);
    }
    return userDetails;
}
//Save User Message
exports.saveUserMessage = async (messageObj) => {
    let results = await db.query('INSERT INTO authorityMessage SET ?', [messageObj]);
    return results.affectedRows;
}

//Update User Message
exports.updateUserMessage = async (messageObj) => {
    let teachers = await db.query('UPDATE authorityMessage SET ? where accountId = ? and msgId = ?', [messageObj, messageObj.accountId, messageObj.msgId]);
    return teachers.affectedRows;
}

//get user message
exports.getUserMessage = async (accountId, userrole, userType) => {
    let results = await db.query(`SELECT * from authorityMessage where accountId = ? and messageUser = ? and userType = ?`, [accountId, userrole, userType]);
    return results;
}

// ************************ Achievement

//Save Acievement
exports.saveAchievement = async (messageObj) => {
    let results = await db.query('INSERT INTO achievementDetails SET ?', [messageObj]);
    return results.affectedRows;
}

//Update Acievement
exports.updateAchievement = async (acievementObj) => {
    let teachers = await db.query('UPDATE achievementDetails set ? where accountId = ? and classId = ? and achievementId = ?', [acievementObj, acievementObj.accountId, acievementObj.classId, acievementObj.achievementId]);
    return teachers.affectedRows;
}

//get Achievement
exports.getAchievement = async (accountId, classId, userType) => {
    let results = await db.query(`SELECT * from achievementDetails where accountId = ? and classId = ? and userType = ?`, [accountId, classId, userType]);
    return results;
}

//get Achievement By Id
exports.getAchievementById = async (accountId, achievementId, userType) => {
    let results = await db.query(`SELECT * from achievementDetails where accountId = ? and achievementId = ? and userType = ?`, [accountId, achievementId, userType]);
    return results;
}


// ************************ Media

//Save Media Details
exports.saveMediaDetails = async (messageObj) => {
    let results = await db.query('INSERT INTO mediaDetails SET ?', [messageObj]);
    return results.affectedRows;
}

//Update Media Details
exports.updateMediaDetails = async (mediaObj) => {
    let teachers = await db.query('UPDATE mediaDetails set ? where accountId = ? and mediaType = ? and mediaId = ?', [mediaObj, mediaObj.accountId, mediaObj.mediaType, mediaObj.mediaId]);
    return teachers.affectedRows;
}

//get Media Details
exports.getMediaDetails = async (accountId, mediaType, userType) => {
    let results = await db.query(`SELECT * from mediaDetails where accountId = ? and mediaType = ? and userType = ?`, [accountId, mediaType, userType]);
    return results;
}

//get Media Details By Id
exports.getMediaDetailsById = async (accountId, mediaId, userType) => {
    let results = await db.query(`SELECT * from mediaDetails where accountId = ? and mediaId = ? and userType = ?`, [accountId, mediaId, userType]);
    return results;
}

// ************************ Facility Details

//Save Facilty Details
exports.saveFacilityDetails = async (facilityObj) => {
    let results = await db.query('INSERT INTO facilityDetails SET ?', [facilityObj]);
    return results.affectedRows;
}

//Update Facilty Details
exports.updateFacilityDetails = async (facilityObj) => {
    let results = await db.query('UPDATE facilityDetails set ? where accountId = ? and faculityType = ? and faculityId = ?', [facilityObj, facilityObj.accountId, facilityObj.faculityType, facilityObj.faculityId]);
    return results.affectedRows;
}

//get Facilty Details
exports.getFacilityDetails = async (accountId) => {
    let results = await db.query(`SELECT * from facilityDetails where accountId = ?`, [accountId]);
    return results;
}

//get Facilty Details By Id
exports.getFacilityDetailsById = async (accountId, faculityId) => {
    let results = await db.query(`SELECT * from facilityDetails where accountId = ? and faculityId = ?`, [accountId, faculityId]);
    return results;
}