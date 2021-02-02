const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');

//save school events
exports.saveSchoolEvent = async (eventsObjects) => {
    let Result = await db.query('insert into schoolEvents set ?', [eventsObjects]);
    return Result;
}
//get school events for update
exports.getSchoolEventsById = async (eventId, accountId, userId, sessionId) => {
    let Result = await db.query('select * from schoolEvents where eventId = ? and accountId = ? and userId = ? and sessionId = ?',[eventId, accountId, userId, sessionId]);
    return Result;
}
//update school events
exports.updateSchoolEvent = async (eventsObjects) => {
    let Result = await db.query('update schoolEvents set ? where accountId = ? and userId = ? and eventId = ? and sessionId = ?', [eventsObjects, eventsObjects.accountId, eventsObjects.userId, eventsObjects.eventId, eventsObjects.sessionId]);
    return Result;
}
//get school events
exports.getSchoolEvents = async (accountId, sessionId) => {
    let Result = await db.query('select * from schoolEvents where accountId = ? and sessionId = ?',[accountId, sessionId]);
    return Result;
}
//get school events for student
exports.getSchoolEventsForStudent = async (accountId) => {
    let Result = await db.query('select * from schoolEvents where accountId =?',[accountId]);
    return Result;
}
//delete school events
exports.deleteSchoolEvents = async (userId, accountId, eventId, sessionId) => {
    let Result = await db.query('delete from schoolEvents where userId = ? and accountId = ? and eventId = ? and sessionId = ?',[userId, accountId, eventId, sessionId]);
    return Result;
}