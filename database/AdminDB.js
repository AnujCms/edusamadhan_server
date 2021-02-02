/*eslint-env node*/

const db = require('./db.js');
const encrypt = require("../utils/encrypt.js");
const UserEnum = require('../lookup/UserEnum')

exports.getAllAccounts = async (userId) => {
    let result = await db.query('SELECT accountid, accountname from account where accountadmin = ?', [userId]);
    return result;
}

exports.getAllAccountsForSuperAdmin = async () => {
    let result = await db.query('SELECT accountid, accountname from account');
    return result;
}

exports.getUserByUserId = async (userId) => {
    let result = await db.query('select userId, firstname, lastname, cellnumber, emailid, status, userrole, gender, class, subject, qualification, dob, parmanentaddress, localaddress from doctor where userId = ?', [userId]);
    return result;
}

exports.checkProviderByAccountID = async (userId, accountid) => {
    let result = await db.query('select EXISTS (select 1 from doctor_account where userId = ? and accountid = ?) as data', [userId, accountid]);
    if (result.length > 0 && result[0].data == 0) {
        return (new Error("there is no provider linked to this account"));
    } else
        return (result);
}
exports.checkPatientByProviderID = async (teacherid, studentid) => {
    let result = await db.query('select EXISTS (select 1 from student where studentid=? and (teacherid = (select teacherid from student where studentid = ?)))', [studentid, studentid]);
    if (result.length > 0 && result[0].data == 0) {
        return (new Error("there is no patient linked to this provider"));
    } else {
        return result;
    }
}
exports.checkPatientByCoworkerIDWithRead = async function (coworkerid, patientid) {
    let result = await db.query('select EXISTS (select 1 from patient where patientid = ? and (doctorid IN (select providerid from provider_coworker where coworkerid = ? ))) as data', [patientid, coworkerid]);
    if (result.length > 0 && result[0].data == 0) {
        reject(new Error("there is no patient linked to this coworker"));
    } else {
        return result;
    }
}

exports.updateProviderByUserId = async function (userId, userObj) {
    let results = await db.query('update doctor set ? where userId = ?', [userObj, userId]);
    return results.affectedRows;
}
//get assigned class
exports.getAssignedClass = async function (userId) {
    let results = await db.query('select class, section, session from doctor where userId = ?', [userId]);
    return results;
}
exports.createProvider = async function (providerObj, userId, accountid) {
    return new Promise((resolve, reject) => {
        return db.transaction(async function (conn) {
            return checkAdminWithAccount(userId, accountid).then(async function () {
                let Results = await db.setQuery(conn, 'INSERT INTO doctor SET ?', providerObj);
                let loopUpEntry = {
                    "accountid": accountid,
                    "userid": Results.insertId
                };
                return db.setQuery(conn, 'INSERT INTO doctor_account SET ?', loopUpEntry).then(function (result) {
                });
            });

        }).then(function (Results) {
            resolve(Results);

        }).catch(function (ex) {
            reject(ex);
        });
    })
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

exports.checkAdminHasAccessToAccount = async function (userid, accountid) {
    let results = await db.query('SELECT EXISTS (SELECT 1 from account where accountAdmin = ? and accountid = ? ) as isAccountExist', [userid, accountid]);
    if (results[0].isAccountExist != 1) {
        return ("Account id does not belong to this admin");
    } else {
        return (results[0].isAccountExist);
    }
}


/** Loign methods */

exports.getUserDetailsForUserName = async function (userName) {
    return db.transaction(async function (conn) {
    let results = await db.setQuery(conn, 'select * from userDetails where userName = ?', [userName]);
    if(results.length > 0){//Teacher, ExamHead, Accountant
        if(results[0].userrole == 5 || results[0].userrole == 6 || results[0].userrole == 7){ 
            let checkAdminStatus = await db.setQuery(conn, 'select accountStatus, accountAdmin from account where accountId = (select accountId from teacher_principal where userId = ?)', [results[0].userId]);
            if(checkAdminStatus.length>0){
            let configData = await db.setQuery(conn, 'select configData, accountId, accountName from config c inner join account a on c.configId = a.configId where accountId = (select accountId from teacher_principal where userId = ?)',[results[0].userId]);
            results[0].configData = configData[0];
            let userTypeResult = await db.setQuery(conn, 'select userType, entranceExamType from teacher_principal where userId = ?',[results[0].userId])
                if(userTypeResult.length == 1){
                    results[0].userType = userTypeResult[0].userType,
                    results[0].entranceExamType = userTypeResult[0].entranceExamType
                }
            return results;
            }
        }
        else if(results[0].userrole == 2 ){//Director
            let details = await db.setQuery(conn, 'select configData, accountId, accountStatus, accountName from config c inner join account a on c.configId = a.configId where a.accountAdmin = ?',[results[0].userId])
            if(details.length == 1){
                results[0].configData = details[0];
                return results;
            }
            else{
                return results;
            }
        }
        else if(results[0].userrole == 3 || results[0].userrole == 4){//principal, manager
            let details = await db.setQuery(conn, 'select configData, accountId, accountStatus, accountName from config c inner join account a on c.configId = a.configId where accountAdmin = (select directorId from director_user where userId = ?)',[results[0].userId])
            if(details.length == 1){
                results[0].configData = details[0];
                let userTypeResult = await db.setQuery(conn, 'select userType from director_user where userId = ?',[results[0].userId])
                if(userTypeResult.length == 1){
                    results[0].userType = userTypeResult[0].userType
                }
                return results;
            }
            else{
                return results;
            }
        }
        else if( results[0].userrole == 8 || results[0].userrole == 9 ||  results[0].userrole == 11 || results[0].userrole == 12){//students
            let details = await db.setQuery(conn, "select configData, accountId, accountStatus, accountName from config c inner join account a on c.configId = a.configId where accountId = (select accountId from student_teacher where studentId = ?)",[results[0].userId])
            results[0].configData = details[0];
            return results;
        }
        else if(results[0].userrole ==1){//superAdmin
            return results;
        }
    }
})
}

//get config
exports.getConfigByAccountId = function (accountid, userid) {
    return new Promise(function (resolve, reject) {
        return checkAdminWithAccount(userid, accountid).then(function () {
            return db.query('select configdata from config where configid = (select configid from account where accountid = ?)', [accountid]).then(function (results) {
                resolve(results);
            });
        }).catch(function (ex) {
            console.log(ex)
            reject(ex);
        })
    });
}

//get teachers
exports.getAllProviderByAccountSuperAdmin = function (accountid, callback) {
    return db.query('SELECT d.userId, firstname, lastname, cellnumber, emailid, status, userrole from doctor d INNER JOIN doctor_account da where d.userId = da.userId and accountid = ? and d.status = ? and d.userrole = ?', [accountid, UserEnum.UserStatus.Active, UserEnum.UserRoles.Provider]).then(function (results) {
        callback(null, results);
    }).catch(function (ex) {
        console.log(ex)
        callback(ex, null)
    })
}

exports.getAllProviderByAccountSuperAdminWithDetails = async function () {
    return db.transaction(async function (conn) {
    let account = await db.setQuery(conn, 'select accountid from account where parentaccountid = "0"');
    let result = await db.setQuery(conn, 'select a.accountStatus, a.accountid,a.accountname, a.accountrefnumber, a.accountype, a.createddatetime, d.userId, d.firstname, d.lastname, d.cellnumber, d.emailid from account a inner join account a1 on a.parentaccountid = a1.accountid inner join doctor d on a.accountadmin = d.userId where a.parentaccountid =  ?', [account[0].accountid]);
    return result;
    })
};

exports.getAccounDetailsByAccountId = async function (accountid) {
    return db.query('select a.status, a.accountid,a.accountname, a.accountrefnumber, a.accountype,a.accountaddress, a.createddatetime , d.userId, d.firstname, d.lastname, d.cellnumber, d.emailid,d.userrole,c.configdata from account a  inner join doctor d on a.accountadmin = d.userId inner join config c on a.configid = c.configid where a.accountid =  ?', [accountid]);
};
//Create School account                
exports.createSchoolAdmin = function (adminObj, accountObj, configdata) {
    return db.transaction(async function (conn) {
        let Results = await db.setQuery(conn, 'INSERT INTO doctor SET ?', adminObj);
        let adminid = Results.insertId;
        let accountID = await db.setQuery(conn, 'SELECT accountid from account where parentaccountid = "0" LIMIT 1');
        accountObj.parentaccountid = accountID[0].accountid;
        if (configdata != null) {
            let configResult = await db.setQuery(conn, 'INSERT INTO config set ?', configdata);
            let configid = configResult.insertId;
            accountObj.configid = configid;
        } else {
            accountObj.configid = 1;
        }
        accountObj.accountAdmin = adminid;
        let accountResult = await db.setQuery(conn, 'INSERT INTO account SET ?', accountObj);
        return accountResult.affectedRows;
    })
}

//update teacher account
exports.editSchoolAdmin = function (accountId, adminObj, accountObj, configdata) {
    return db.transaction(async function (conn) {
        let userid = await db.setQuery(conn, 'select accountAdmin, configid from account where accountid = ?', accountId);
        let Results = await db.setQuery(conn, 'update account set ? where accountid = ?', [accountObj, accountId]);
        let upconfig = await db.setQuery(conn, 'update config SET ? where configid = ?', [configdata, userid[0].configid])
        let accountResult = await db.setQuery(conn, 'UPDATE doctor SET ? where userId = ? and userrole = ?', [adminObj, userid[0].accountAdmin, UserEnum.UserRoles.AccountAdmin]);
        return accountResult.affectedRows;
    })
}
// Lock the admin
exports.lockSchoolAdmin = function (accountId) {
    return db.transaction(async function (conn) {
        let accountResult = await db.setQuery(conn, 'update account set status = ? where accountid = ?', [2, accountId]);
        let accountResulte = await db.setQuery(conn, 'update doctor set status = ? where userId = (select accountAdmin from account where accountid = ?)', [2, accountId]);
        return accountResult.affectedRows;
    })
}
// UnLock the admin
exports.unlockSchoolAdmin = function (accountId) {
    return db.transaction(async function (conn) {
        let accountResult = await db.setQuery(conn, 'update account set status = ? where accountid = ?', [1, accountId]);
        let accountResulte = await db.setQuery(conn, 'update doctor set status = ? where userId = (select accountAdmin from account where accountid = ?)', [1, accountId]);
        return accountResult.affectedRows;
    })
}
//Assign class to teacher
exports.assignClassToTeacher = async function (teacherid, classObject) {
    let result = await db.setQuery(conn, 'update doctor set ? where userId = ?', [classObject, teacherid]);
    return result.affectedRows
}
//Assign subject to Teacher
exports.assignSubjectToClass = async function (accountid, userId, classes, subjects) {
    return db.transaction(async function (conn) {
        let r = await db.setQuery(conn, 'select * from subjects where userId = ? and class = ?', [userId, classes]);
        let rArray = [];
        for (j = 0; j < r.length; j++) {
            rArray.push(r[j].subjects)
        }
        let deleteList = rArray.filter(function (item, pos) {
            return subjects.indexOf(item) !== pos
        })
        let insertList = subjects.filter(function (item, pos) {
            return rArray.indexOf(item) !== pos;
        })
        if (deleteList && deleteList.length > 0) {
            await db.setQuery(conn, 'delete from subjects where userId= ? and class = ?', [userId, classes]);
        }
        let bulkInsert = [];
        insertList.forEach(function (subjects) {
            bulkInsert.push([userId, subjects, classes])
        })
        let result = await db.setQuery(conn, 'insert into subjects(userId, subjects, class) values ?', [bulkInsert]);
        return result.affectedRows
    })
}
//Get subject For Teacher
exports.getSubjectForClass = async function (userId, classes) {
    return db.transaction(async function (conn) {
        let results = await db.setQuery(conn, 'select * from subjects where userId = ? and class = ?', [userId, classes]);
        return results
    })
}


function getAllProvidersByAccountId(accountid, userId, callback) {
    return checkAdminWithAccount(userId, accountid).then(function () {
        return db.query('SELECT d.userId, firstname, lastname, cellnumber, emailid, status, userrole, gender, class, section, subject, qualification from doctor d INNER JOIN doctor_account da where d.userId = da.userId and accountid = ? and d.status = ?', [accountid, UserEnum.UserStatus.Active]).then(function (results) {
            callback(null, results);
        })
    }).catch(function (ex) {
        console.log(ex)
        callback(ex, null)
    })
}

exports.updateYourPassword = async function(forgotObj) {
    let result = await db.query('update userDetails set password = ? where adharnumber = ? and cellnumber = ? and dob = ? and userrole = ?',[forgotObj.password, forgotObj.adharnumber, forgotObj.cellnumber, forgotObj.dob, forgotObj.userrole]);
    return result
}
exports.checkPassword = async (userId) => {
    let result = await db.query('select password from userDetails where userId = ?', [userId])
    return result[0]
}
exports.changePassword = async (updateObj, userId) => {
    let result = await db.query('update userDetails set ? where userId = ?', [updateObj, userId])
    return result
}
exports.getUserDetailsByEmailId = async (hashedEmailId) => {
    let userDetails = await db.query("select userId, firstName, lastName, cellNumber, emailId, userrole, status, wrongPasswordCount from userDetails where userName = ?",[hashedEmailId]);
    return userDetails;
};
exports.getUserIdByRefershToken = async (refreshToken) => {
    let results = await db.query(`SELECT * from userDetails ud INNER JOIN refreshTokenPortal rt where ud.userId = rt.userId and refreshToken = ?`, [refreshToken]);    return results;
}
exports.getUserDetailsToUnlockUser = async (userId, userrole, status) => {
    let userID = await db.query('select * from userDetails where userId = ? and userrole = ? and status = ?', [userId, userrole, status]);
    return userID[0];
}
exports.getUserDetails = async (userId) => {
    let userID = await db.query('select * from userDetails where userId = ?', [userId]);
    return userID;
}
exports.createPasswordChangeRequest = async (passwordChangeReqObj) => {
    let result = await db.query("insert into passwordChangeRequest set ? ", [passwordChangeReqObj]);
    return result;
};

exports.updateStatusLockToUnlock = async (userId, userrole, lockStatus, unlockStatus) =>{
    let result = await db.query(`UPDATE userDetails set status = ?, wrongPasswordCount = ?  where userId = ? and userrole = ?`,[unlockStatus, 0, userId, userrole])
    return result.affectedRows;
}
exports.updateStudentStatusPassword = async (userId, userrole, lockStatus, unlockStatus, password) =>{
    let result = await db.query(`UPDATE userDetails set status = ?, password = ?, wrongPasswordCount = ?  where userId = ? and userrole = ? and status = ?`,[unlockStatus, password, 0, userId, userrole, lockStatus])
    return result.affectedRows;
}
exports.updateUserPassword = async (userObj) =>{
    let result = await db.query("UPDATE userDetails set password = ? where userId = ? and userrole = ? and status = ?",[userObj.password, userObj.userId, userObj.userrole, userObj.status])
    return result.affectedRows;
}
exports.getDoctorDetails = async (userObj) =>{
    let result = await db.query("select firstName, lastName, emailId from userDetails where userId = ? and userrole = ? and status = ?",[userObj.userId, userObj.userrole, userObj.status])
    return result;
}
exports.getPasswordChangeRequestByToken = async function(token, currentDatetime) {
    let result = await db.query("select userId, initiatedby from password_changerequest where token = ? and expiredatetime >= ?",[token, currentDatetime]);
    return result;
};
exports.getPasswordChangeRequestByToken = async(token, currentDatetime) => {
    let result = db.query('select userId, initiatedBy from passwordChangeRequest where token = ? and expireDatetime >= ?', [token, currentDatetime]);
    return result
}
exports.checkfirsttimelogin = async userId => {
    let result = await db.query("select * from userDetails where userId = ?", userId);
    return result;
};
exports.setUserPasswordByUserId = async function(userId, newpassword) {
    let result = await db.query("update userDetails set password = ?,passwordchangecount=passwordchangecount+1, status = 1,wrongpasswordcount=0 where userId = ? ",[newpassword, userId]);
    return result;
};
exports.deletePasswordChangeRequest = async (token, userId) => {
    let result = await db.query("delete from  passwordChangeRequest  where token = ? and userId = ?",[token, userId]);
    return result;
};
exports.removeAccessTokenFromDB = async function(userId) {
  let result =  await db.query("DELETE FROM refreshTokenPortal WHERE userId=?", [userId]);
  return result;
};
exports.getAllProvidersByAccountId = getAllProvidersByAccountId;

