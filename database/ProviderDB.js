const db = require('./db.js');
const Promise = require('bluebird');
const UserEnum = require('../lookup/UserEnum');

//save refresh token
exports.saveRefreshTokenForPortl = async function (userObj) {
    await db.query('insert into refreshTokenPortal SET ?', [userObj])
}
//get user details by refresh token
exports.getUserIdByRefershToken = async function (refreshToken) {
    let userID = await db.query('select userid from refreshTokenPortal where refreshToken = ?', [refreshToken]);
    return userID[0];
}
//get userDetails
exports.getUserDetails = async function (userid) {
    return db.transaction(async function (conn) {
        let results = await db.setQuery(conn, 'select * from userDetails where userid = ?', [userid]);
        if (results.length > 0) {
            if (results[0].userrole == 3 || results[0].userrole == 4 || results[0].userrole == 5) {
                let checkAdminStatus = await db.setQuery(conn, 'select status, accountAdmin from account where accountid = (select accountid from teacher_principal where userid = ?)', [results[0].userid]);
                if (checkAdminStatus[0].status == 1) {
                    let configdata = await db.setQuery(conn, 'select configdata, accountid from config c inner join account a on c.configid = a.configid where accountid = (select accountid from teacher_principal where userid = ?)', [results[0].userid]);
                    results[0].configdata = configdata[0];
                    return results;
                } else if (checkAdminStatus[0].status == 2) {
                    let adminDetails = await db.setQuery(conn, 'select cellnumber, emailid  from userDetails where userid = ?', [checkAdminStatus[0].accountAdmin]);
                    results[0].status = 3;
                    results[0].cellnumber = adminDetails[0].cellnumber;
                    results[0].emailid = adminDetails[0].emailid;
                    return results;
                }
            }
            else if (results[0].userrole == 2) {
                let details = await db.setQuery(conn, 'select configdata, accountid from config c inner join account a on c.configid = a.configid where accountAdmin = ?', [results[0].userid])
                if (details.length == 1) {
                    results[0].configdata = details[0];
                    return results;
                }
                else {
                    return results;
                }
            }
            else if (results[0].userrole == 6 || results[0].userrole == 7) {
                let details = await db.setQuery(conn, "select configdata, accountid from config c inner join account a on c.configid = a.configid where accountid = (select accountid from teacher_principal where userid = (select teacherid from student_teacher where studentid = ?))", [results[0].userid])
                results[0].configdata = details[0];
                return results;
            }
            else if (results[0].userrole == 1) {
                return results;
            }
        }
    })
}

//updateRefreshTokenForPortl
exports.updateRefreshTokenForPortl = async function (refreshTokenObj, oldRefreshToken) {
    let result = await db.query('update refreshTokenPortal set ? where refreshToken = ?', [refreshTokenObj, oldRefreshToken])
    return result;
}
//get teacher Details
exports.getProviderDetails = async (userid) => {
    let result = await db.query('select * from doctor where userid=?', [userid])
    return result
}
//Update teacher details
exports.updateOnboardDetails = async (nickname, img, userid) => {
    let result = await db.query('update doctor set nickname= ?, image = ? where userid = ?', [nickname, img, userid])
    return result
}
//delete profile photo
exports.deleteProfilePic = async (userid) => {
    let result = await db.query('update doctor set image = ? where userid = ?', [null, userid])
    return result
}

//lock the account
exports.wrongUserNameOrPassword = async (hashedEmailId) => {
    let getPreviousCount = await db.query('select wrongPasswordCount, userrole, userId from userDetails where userName = ?', [hashedEmailId]);
    if (getPreviousCount.length > 0) {
        if (getPreviousCount[0].userrole == 1) {//SuperAdmin
            return "superAdmin";
        } else {//other users
            if (getPreviousCount[0].wrongPasswordCount >= 5) {
                return getPreviousCount[0].wrongPasswordCount;
            }else if(getPreviousCount[0].wrongPasswordCount == 4){
                await db.query('update userDetails set status = ?, wrongPasswordCount = wrongPasswordCount + 1 where userName = ?', [UserEnum.UserStatus.Locked, hashedEmailId]);
                return getPreviousCount[0].wrongPasswordCount + 1;
            } else {
                await db.query('update userDetails set wrongPasswordCount = wrongPasswordCount + 1 where userName = ?', [hashedEmailId]);
                return getPreviousCount[0].wrongPasswordCount + 1;
            }
        }
    } else {
        return "wrongUserName"
    }
}

exports.successLogin = async (hashedEmailId) => {
    await db.query('update userDetails set wrongPasswordCount = ? where userName = ?', [0, hashedEmailId]);
}
exports.getProviderDetailsByEmailId = function (emailid) {
    return new Promise((resolve, reject) => {
        return db.query('select userid, firstname, lastname, cellnumber, emailid, userrole , permissionlevel from doctor where hashedemail = ?', [emailid])
            .then((r) => {
                resolve(r);
            }).catch((ex) => {
                console.log(ex)
                reject(ex);
            });
    })
}

exports.createPasswordChangeRequest = function (passwordchangeReqObj) {
    return new Promise((resolve, reject) => {
        return db.query('insert into password_changerequest set ? ', [passwordchangeReqObj]).
            then((r) => {
                resolve();
            }).catch((ex) => {
                reject(ex);
            })

    })
}


exports.getPasswordChangeRequestByToken = async(token, currentDatetime) => {
    let result = db.query('select userId, initiatedBy from passwordChangeRequest where token = ? and expireDatetime >= ?', [token, currentDatetime]);
    return result
}


exports.setUserPasswordByUserId = function (userid, newpassword) {
    return new Promise((resolve, reject) => {
        return db.query('update doctor set password = ? where userid = ? ', [newpassword, userid]).
            then((r) => {
                resolve(r);
            }).catch((ex) => {
                console.log(ex)
                reject(ex);
            })

    })
}

exports.deletePasswordChangeRequest = function (token) {
    return new Promise((resolve, reject) => {
        return db.query('delete from  password_changerequest  where token = ? ', [token]).
            then((r) => {
                resolve(r);
            }).catch((ex) => {
                console.log(ex)
                console.log(ex)
                reject(ex);
            })

    })
}

exports.updateOnboardDetails = async (image, userid) => {
    let result = await db.query('update doctor set image = ? where userid = ?', [image, userid])
    return result;
}
exports.checkpassword = async (userid) => {
    let result = await db.query('select password from doctor where userid = ?', [userid])
    return result[0]
}

exports.changePassword = async (password, userid) => {
    let result = await db.query('update doctor set password = ? where userid = ?', [password, userid])
    return result
}

// inactivate the user
exports.inactivateUser = async (lockedStatus, userId) => {
    let lockedResult = await db.query('update userDetails set status = ? where userId = ?', [lockedStatus, userId]);
    return lockedResult.affectedRows;
}

// reactivate the user
exports.reactivateUser = async (activeStatus, userId) => {
    let lockedResult = await db.query('update userDetails set status = ? where userId = ?', [activeStatus, userId]);
    return lockedResult.affectedRows;
}