var db = require('./db.js');

//get subjets of selected class
exports.getSubjectsOfSelectedClass = async (classId, userId, accountId) =>{
    let result = await db.query('select subjects from subjectDetails where classId = ? and userId = ? and accountId = ?', [classId, userId, accountId]);
    return result;
}

//get teachers of selected subjects
exports.getTeachersOfSelectedSubject = async (subjectId, userrole, accountId) =>{
    let result = await db.query('select userId, firstName, lastName from userDetails where userrole = ? and subject = ? and userId in(select userId from teacher_principal where accountId = ?)', [userrole , subjectId, accountId]);
    return result;
}

//create periods
exports.createPeriods = async (periodObject) => {
    return db.transaction(async (conn) =>{
        let Result = await db.setQuery(conn, 'select accountId, userId, sessionId from periodDetails where accountId = ? and userId=? and sessionid = ? ORDER BY modifiedDate LIMIT 3', [periodObject.accountId, periodObject.userId, periodObject.sessionId]);
        if (Result.length > 0) {
            let result1 = await db.setQuery(conn, 'update periodDetails set ? where accountId = ? and userId = ? and sessionId = ?', [periodObject, periodObject.accountId, periodObject.userId, periodObject.sessionId]);
            return result1.affectedRows;
        } else {
            let result = await db.setQuery(conn, 'insert into periodDetails set ?', periodObject);
            return result.affectedRows;
        }
    })
}

//get periods details
exports.getPeriodsDetails = async (accountId, sessionId) => {
    let result = await db.query('select * from periodDetails where accountId = ? and sessionId = ?', [accountId, sessionId]);
    return result;
}

//createTimeTable
exports.createTimeTable = async (timeTableObject) => {
    return db.transaction(async (conn) => {
        let Result = await db.setQuery(conn, 'select accountId, userId, classId, sectionId, sessionId from timeTableDetails where accountId = ? and userId = ? and classId = ? and sectionId = ? and sessionId = ? and dayname = ? ORDER BY modifiedDate LIMIT 3', [timeTableObject.accountId, timeTableObject.userId, timeTableObject.classId, timeTableObject.sectionId, timeTableObject.sessionId, timeTableObject.dayname]);
        if (Result.length > 0) {
            let result1 = await db.setQuery(conn, 'update timeTableDetails set ? where accountId = ? and userId = ? and classId = ? and sectionId = ? and sessionId = ? and dayname = ?', [timeTableObject, timeTableObject.accountId, timeTableObject.userId, timeTableObject.classId, timeTableObject.sectionId, timeTableObject.sessionId, timeTableObject.dayname]);
            return result1.affectedRows;
        } else {
            let result = await db.setQuery(conn, 'insert into timeTableDetails set ?', timeTableObject);
            return result.affectedRows;
        }
    })
}

//get full timetable by Principal
exports.getFullTimeTable = async (accountId, sessionId, classId, sectionId) => {
    let result = await db.query('select * from timeTableDetails where accountId = ? and sessionId = ? and classId = ? and sectionId = ?', [accountId, sessionId, classId, sectionId]);
    return result;
}