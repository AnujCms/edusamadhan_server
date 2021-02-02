const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');

//grt all accounts
exports.getAllAccountsForSuperAdmin = async () => {
    let result = await db.query('SELECT accountId, accountName from account where parentAccountId !="0"');
    return result;
}
exports.getAllProviderByAccountSuperAdminWithDetails = async () => {
    return db.transaction(async function (conn) {
        let account = await db.setQuery(conn, 'select accountid from account where parentaccountid = "0"');
        if (account) {
            let result = await db.setQuery(conn, 'select a.status, a.accountid,a.accountname, a.accountrefnumber, a.createddatetime, d.userid, d.firstname, d.lastname, d.cellnumber, d.emailid from account a inner join account a1 on a.parentaccountid = a1.accountid inner join doctor d on a.accountadmin = d.userid where a.parentaccountid =  ?', [account[0].accountid]);
            return result;
        } else {
            return 0;
        }
    })
};
//get teachers for selected account
exports.getAllTeachersByAccountSuperAdmin = async (accountId, callback) => {
    let results = await db.query('SELECT d.userId, firstName, lastName, cellNumber, emailId, status, d.userrole from userDetails d INNER JOIN teacher_principal da where d.userId = da.userId and accountId = ? and d.status = ? and d.userrole = ?', [accountId, UserEnum.UserStatus.Active, UserEnum.UserRoles.Teacher]);
    return results;
}
//get students of selected teacher by superAdmin
exports.getAllStudentsBySuperAdmin = (accountId, teacherId, status) => {
    return db.transaction(async (conn) => {
        let classData = await db.setQuery(conn, 'select classId, sectionId, sessionId from userDetails where userId = ?', teacherId);
        if (classData.length > 0) {
            let results = await db.query(`SELECT * from userDetails ud INNER JOIN student_teacher st where ud.userId = st.studentId and st.accountId = ? and st.classId = ? and st.sectionId = ? and st.sessionId = ? and ud.status = ?`, [accountId, classData[0].classId, classData[0].sectionId, classData[0].sessionId, status]);
            return results;
        } else {
            return 0
        }
    })
}
//Create School account                
exports.createSchoolAdmin = (adminObj, accountObj, configData) => {
    return db.transaction(async (conn) => {
        let Results = await db.setQuery(conn, 'INSERT INTO userDetails SET ?', adminObj);
        let accountID = await db.setQuery(conn, 'SELECT accountId from account where parentAccountId = "0" LIMIT 1');
        accountObj.parentAccountId = accountID[0].accountId;
        if (configData != null) {
            let configResult = await db.setQuery(conn, 'INSERT INTO config set ?', configData);
            accountObj.configId = configResult.insertId;
        } else {
            accountObj.configId = 1;
        }
        accountObj.accountAdmin = Results.insertId;
        let accountResult = await db.setQuery(conn, 'INSERT INTO account SET ?', accountObj);
        return accountResult.affectedRows;
    })
}
//update school information
exports.updateSchoolAdmin = (accountId, adminObj, accountObj, configData) => {
    return db.transaction(async (conn) => {
        let accountResult = await db.setQuery(conn, 'select accountAdmin, configId from account where accountId = ?', accountId);
        if (accountResult.length > 0) {
            await db.setQuery(conn, 'update account set ? where accountId = ?', [accountObj, accountId]);
            await db.setQuery(conn, 'update config SET ? where configId = ?', [configData, accountResult[0].configId])
            let result = await db.setQuery(conn, 'UPDATE userDetails SET ? where userId = ? and userrole = ?', [adminObj, accountResult[0].accountAdmin, UserEnum.UserRoles.Director]);
            return result.affectedRows;
        } else {
            return 0;
        }
    })
}
//get the school account information for update
exports.getSchoolAccountDetailsForUpdate = async (accountId) => {
    return await db.query('select a.accountStatus, a.accountId,a.accountName, a.phoneNumber, a.schoolLogo, a.accountRefNumber,a.accountAddress, d.userId, d.dob, d.firstName, d.lastName, d.cellNumber, d.emailId,d.userrole,d.aadharNumber, d.gender,d.sessionId,d.images,c.configData from account a  inner join userDetails d on a.accountAdmin = d.userId inner join config c on a.configId = c.configId where a.accountId =  ?', [accountId]);
};
//get all school admin details for manage account
exports.getAllSchoolAdminDetailsForManage = () => {
    return db.transaction(async (conn) => {
        let account = await db.setQuery(conn, 'select accountId from account where parentAccountId = "0"');
        if (account) {
            let result = await db.setQuery(conn, 'select a.accountStatus, a.accountId,a.accountName, a.accountRefNumber, d.userId, d.status, d.userrole, d.firstName, d.lastName, d.cellNumber, d.emailId, d.images, d.aadharNumber from account a inner join account a1 on a.parentAccountId = a1.accountId inner join userDetails d on a.accountAdmin = d.userId where a.parentAccountId =  ?', [account[0].accountId]);
            return result;
        } else {
            return 0;
        }
    })
};
// Lock the admin
exports.lockSchoolAdmin = async (accountStatus, accountId) => {
    let accountResult = await db.query('update account set accountStatus = ? where accountId = ?', [accountStatus, accountId]);
    return accountResult.affectedRows;
}
// UnLock the admin
exports.unlockSchoolAdmin = async (accountStatus, accountId) => {
    let accountResult = await db.query('update account set accountStatus = ? where accountId = ?', [accountStatus, accountId]);
    return accountResult.affectedRows;
}

exports.changeDoctorPassword = async (newPassword) => {
    let result = await db.query('UPDATE userDetails SET password = ?, passwordChangeCount=?, status = ? where userId = ?', [newPassword.password, 1, newPassword.status, newPassword.userId]);
    return result.affectedRows;
}
exports.removeAccessTokenFromDB = async (userid) => {
    await db.query('DELETE FROM refreshTokenPortal WHERE userid=?', [userid])
}
exports.getUserIdByRefershToken = async (refreshToken) => {
    let results = await db.query(`SELECT * from userDetails ud INNER JOIN refreshTokenPortal rt where ud.userId = rt.userId and refreshToken = ?`, [refreshToken]);    return results;
}
exports.updateRefreshTokenForPortl = async (refreshTokenObj, oldRefreshToken) => {
    let result = await db.query('update refreshTokenPortal set ? where refreshToken = ?', [refreshTokenObj, oldRefreshToken])
    return result;
}

