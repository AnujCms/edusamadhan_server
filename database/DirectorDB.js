const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');

//Check Director User Relation
exports.checkDirectorUserRelation = async (accountId, userId) => {
    let userAccountId = await db.query('select accountId from director_user where userId = ?', [userId])
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
//Check Principal User Relation
exports.checkPrincipalUserRelation = async (accountId, userId) => {
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
//Check Teacher Student Relation
exports.checkTeacherStudentRelation = async (accountId, userId) => {
    let userAccountId = await db.query('select accountId from student_teacher where studentId = ?', [userId])
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
//Create User by Director
exports.createUser = (createUserObject, userId, accountId, userType) => {
    return db.transaction(async (conn) => {
        let getResult = await db.setQuery(conn, 'SELECT * from director_user where accountId = ? and userType = ? and userrole = ?', [accountId, userType, createUserObject.userrole])
        if (getResult.length == 0) {
            let result = await db.setQuery(conn, 'INSERT into userDetails set ?', [createUserObject])
            if (result.affectedRows == 1) {
                let loopUpEntry = { "accountId": accountId, "directorId": userId, "userId": result.insertId, "userType": userType, "userrole": createUserObject.userrole };
                let results = await db.setQuery(conn, 'INSERT INTO director_user SET ?', loopUpEntry);
                return results.affectedRows;
            } else {
                return 0;
            }
        } else {
            return 2;
        }
    })
}

//Update User By Director
exports.updateUserDetails = (updateUserObj, userId, accountId, userType) => {
    return db.transaction(async (conn) => {
        let getResult = await db.setQuery(conn, 'SELECT * from director_user where userId = ? and accountId = ? and userType = ? and userrole = ?', [userId, accountId, userType, updateUserObj.userrole])
        if (getResult.length > 0) {
            let directoUserObj = {
                userrole: updateUserObj.userrole,
                userType: userType
            }
            await db.query('update director_user set ? where userId = ?', [directoUserObj, userId]);
            let results = await db.query('update userDetails set ? where userId = ?', [updateUserObj, userId]);
            return results.affectedRows;
        } else {
            return 0;
        }
    })
}

//delete user details
exports.deleteUserDetails = (userObject) => {
    return db.transaction(async (conn) => {
        await db.setQuery(conn, 'delete from director_user  where userId = ? and directorId = ? and accountId = ?', [userObject.userId, userObject.directorId, userObject.accountId]);
        let result = await db.setQuery(conn, 'delete from userDetails where userId = ? and sessionId = ? and status = ?', [userObject.userId, userObject.sessionId, userObject.status]);
        return result;
    })
}

//Get All users By Direcor
exports.getAllUsers = async (accountId, userRoleToAccess) => {
    let results = await db.query(`SELECT ud.userId, firstName, lastName, cellNumber, aadharNumber, emailId, status, images, ud.userrole, subject, qualification, da.userType from userDetails ud INNER JOIN director_user da where ud.userId = da.userId and da.accountId = ? and ud.userrole IN(${userRoleToAccess})`, [accountId]);
    return results;
}

//get user details
exports.getUserDetailForUpdate = async (userId) => {
    return await db.query(`SELECT ud.userId, firstName, lastName, cellNumber, aadharNumber, emailId, dob, status, images, gender, ud.userrole, subject, qualification, workExperience, educationalAwards, awardDetails, localAddress, parmanentAddress, salary, da.userType from userDetails ud INNER JOIN director_user da where ud.userId = da.userId and ud.userId =?`, [userId]);
}

