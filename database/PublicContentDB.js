const db = require('./db.js');
const UserEnum = require('../lookup/UserEnum');


//get All Schools Name
exports.getAllSchoolsName = async () => {
    let schoolsObj = await db.query(`select * from account where parentAccountId != ?`, [0]);
    return schoolsObj;
}

//get fee FeeDetails
exports.getSchoolsFeeDetails = async (accountId) => {
    let result = await db.query(`select * from feeStructureDetails where accountid = ?`,[accountId]);
    return result;
}

//get faculty details
exports.getAllFacultyDetails = async (accountId) => {
    let teachers = await db.query('SELECT d.userId, firstName, lastName, cellNumber, aadharNumber, emailId, status, images, d.userrole, gender, classId, sectionId, subject, qualification, dob, parmanentAddress, localAddress, da.entranceExamType, salary from userDetails d INNER JOIN teacher_principal da where d.userId = da.userId and da.accountId = ? ', [accountId]);
    return teachers;
}

// ********************
//get user message
exports.getUserMessage = async (userrole, accountId) => {
    let results = await db.query(`SELECT * from authorityMessage where messageUser = ? and accountId = ?`, [userrole, accountId]);
    return results;
}

//get Achievement
exports.getAchievement = async (accountId, classId) => {
    let results = await db.query(`SELECT * from achievementDetails where accountId = ? and classId = ?`, [accountId, classId]);
    return results;
}

//get Media Details
exports.getMediaDetails = async (accountId, mediaType) => {
    let results = await db.query(`SELECT * from mediaDetails where accountId = ? and mediaType = ?`, [accountId, mediaType]);
    return results;
}

// *********************
//get Dubject Details
exports.getSubjectsDetails = async (classId) => {
    let results = await db.query(`SELECT DISTINCT subjectId from eBooksDetails where classId = ?`, [classId]);
    return results;
}

//get Books Of  Details
exports.getBooksOfSubject = async (classId, subjectId) => {
    let results = await db.query(`SELECT DISTINCT numberOfBook from eBooksDetails where classId = ? and subjectId = ?`, [classId, subjectId]);
    return results;
}

//get Book Details
exports.getBookDetails = async (classId, subjectId, numberOfBook) => {
    let results = await db.query(`SELECT bookUrl from eBooksDetails where classId = ? and subjectId = ? and numberOfBook = ?`, [classId, subjectId, numberOfBook]);
    return results;
}

//get Facilty Details
exports.getFacilityDetails = async (accountId) => {
    let results = await db.query(`SELECT * from facilityDetails where accountId = ?`, [accountId]);
    return results;
}

//get Public Content Url
exports.getPublicContentUrl = async (accountId, contentType) => {
    let results = await db.query(`SELECT * from publicContentDetails where accountId = ? and contentType = ?`, [accountId, contentType]);
    return results;
}

//get School Information
exports.getSchoolInformation = async (accountId) => {
    return await db.query('select a.accountStatus, a.accountId,a.accountName, a.phoneNumber, a.schoolLogo, a.accountRefNumber,a.accountAddress, d.userId, d.dob, d.firstName, d.lastName, d.cellNumber, d.emailId,d.userrole,d.aadharNumber, d.gender,d.sessionId,d.images,c.configData from account a  inner join userDetails d on a.accountAdmin = d.userId inner join config c on a.configId = c.configId where a.accountId =  ?', [accountId]);
}