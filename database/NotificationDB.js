const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');

//save school Notification
exports.saveSchoolNotification = async (notificationsObject) => {
    let Result = await db.query('insert into schoolNotifications set ?', [notificationsObject]);
    return Result;
}
//get school Notification for update
exports.getSchoolNotificationsById = async (notificationId, userId, accountId, sessionId) => {
    let Result = await db.query('select * from schoolNotifications where notificationId = ? and createdBy = ? and accountId = ? and sessionId = ?',[notificationId, userId, accountId, sessionId]);
    return Result;
}
//update school Notification
exports.updateSchoolNotification = async (notificationsObject, notificationId, sessionId) => {
    let Result = await db.query('update schoolNotifications set ? where accountId = ? and createdBy = ? and userrole = ? and notificationId = ? and sessionId = ?', [notificationsObject, notificationsObject.accountId, notificationsObject.createdBy, notificationsObject.userrole, notificationId, sessionId]);
    return Result;
}
//get school Notification
exports.getSchoolNotifications = async (createdBy, userrole, accountId, sessionId) => {
    let Result = await db.query('select * from schoolNotifications where createdBy = ? and userrole = ? and accountId =? and sessionId = ?',[createdBy,userrole, accountId, sessionId]);
    return Result;
}
//get school Notification for student 
exports.getSchoolNotificationsForStudents = async (accountId, userrole, sessionId) => {
    let Result = await db.query(`select * from schoolNotifications where accountId = ? and notificationuser in(${userrole}, 10) and sessionId = ?`,[accountId, sessionId]);
    return Result;
}
//get School Notifications For Principal
exports.getSchoolNotificationsForPrincipal = async (accountId, userId, userrole, sessionId) => {
    let Result = await db.query(`select * from schoolNotifications where accountId = ? and createdBy = ? and userrole = ? and sessionId = ?`,[accountId, userId, userrole, sessionId]);
    return Result;
}

//get school Notification for Teacher 
exports.getSchoolNotificationsForTeacher = async (accountId, userId, userrole, sessionId) => {
    let Result = await db.query(`select * from schoolNotifications where accountId = ? and notificationUser in(${userrole}, 10) and sessionId = ? or createdBy = ?`,[accountId, sessionId, userId]);
    return Result;
}

//get school Notification for Student
exports.getSchoolNotificationsForStudent = async (accountId, userId, userrole, sessionId) => {
    return db.transaction(async (conn) => {    
        let teacherResult = await db.query('SELECT st.teacherId from userDetails ud INNER JOIN student_teacher st where ud.userId = st.studentId and st.sessionId = ud.sessionId and st.accountId = ? and ud.userId = ? and ud.sessionId = ?', [accountId, userId, sessionId]);
        if(teacherResult.length>0){
            let Result = await db.setQuery(conn, `select * from schoolNotifications where accountId = ? and notificationUser in(${userrole}, 10) and sessionId = ? or createdBy = ?`,[accountId, sessionId, teacherResult[0].teacherId]);
            return Result;        
        }else{
            return false
        }
    })
}

//get school Notification for users 
exports.getSchoolNotificationsForUser = async (accountId, userrole, sessionId) => {
    let Result = await db.query(`select * from schoolNotifications where accountId = ? and notificationuser in(${userrole}, 10) and sessionId = ?`,[accountId, sessionId]);
    return Result;
}
//delete school Notification
exports.deleteSchoolEvents = async (userId, userrole, accountId, notificationId) => {
    let Result = await db.query('delete from schoolNotifications where createdBy = ? and userrole = ? and accountId = ? and notificationId = ?',[userId, userrole, accountId, notificationId]);
    return Result;
}