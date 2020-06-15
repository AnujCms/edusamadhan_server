const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;
const moment= require('moment')

const studentObject = Joi.object({
    firstname:Joi.string().required().max(100),
    lastname:Joi.string().required().max(100),
    mothername:Joi.string().required().max(100),
    fathername:Joi.string().required().max(100),
    cellnumber:Joi.string().max(10).min(10).required(),
    adharnumber:Joi.string().max(12).min(12).required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    gender:Joi.number().valid(1,2).required(),
    religion:Joi.number().valid(1,2,3,4).required(),
    category:Joi.number().valid(1,2,3).required(),
    locality:Joi.number().valid(1,2).required(),
    mediumType: Joi.number().valid(1,2).required(),
    parmanentaddress:Joi.string().max(100).required(),
    localaddress:Joi.string().max(100).required(),
    images:Joi.string().allow('').allow(null),
    busservice: Joi.number().valid(1,2),
    route:Joi.when('busservice',{
        is: 1,
        then: Joi.any().strip(),
        otherwise:Joi.number().required()
    }),
    studentid:Joi.string().allow('').allow(null)
})

const studentIdParams = Joi.object({
    studentid: Joi.number().required()
})

const adharNumberParams = Joi.object({
    adharnumber: Joi.string().required().max(12).min(12)
})

const emailIdParams = Joi.object({
    emailid: Joi.string().email().required()
})

const studentCreateResult = Joi.object({
    studentid: Joi.number().required(),
    examinationtype:Joi.number().required().valid(1,2,3,4),
    subjectid:Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14),
    totalMarks:Joi.number().required().min(1),
    obtainMarks:Joi.number().required().min(0)
})
const studentCreateAttendance = Joi.object({
    studentid: Joi.number().required(),
    monthName:Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12),
    totalClasses:Joi.number().required().min(1),
    presentClasses:Joi.number().required().min(0)
})

const studentIdBody = Joi.object({
    studentid: Joi.number().required()
})

const saveAttendanceObject = Joi.object({
    accountid: Joi.string().required(),
    userid: Joi.number().required(),
    studentId: Joi.number().required(),
    classid: Joi.number().required().valid(1,2,3,4,5,6,7,8),
    section: Joi.number().required().valid(1,2,3,4,5)
})

const resultObject = Joi.object({
    subjectName: Joi.string().required(),
    theoryTotalMarks: Joi.number().min(1),
    theoryObtainMarks: Joi.string().max(Joi.ref('theoryTotalMarks')).min(1),
    practicalTotalMarks: Joi.number().min(1),
    practicalObtainMarks: Joi.string().max(Joi.ref('practicalTotalMarks')).min(1),
    grade: Joi.string().max(5)
})
const saveResultObject = Joi.object({
    studentid: Joi.number().required(),
    examinationType: Joi.number().valid(1,2,3,4).required(),
    subjectResultArray: Joi.array().items(resultObject)

})

const getResultObject = Joi.object({
    studentid: Joi.number().required(),
    examinationType: Joi.number().valid(1,2,3,4).required()
})

const attendanceObject = Joi.object({
    studentId: Joi.number().required(),
    attendanceDate: Joi.date().max(new Date()).required(),
    attendance: Joi.number().valid(1,2,3).required()
})

const attendanceArray = Joi.object({
    attendanceArray: Joi.array().items(attendanceObject)
})

const getAttendanceObj = Joi.object({
    startDate: Joi.string().required(),
    endDate: Joi.date().max(moment(new Date()).add(1,"days").toDate()).required()
})

exports.studentObject = studentObject;
exports.studentIdParams = studentIdParams;
exports.adharNumberParams = adharNumberParams;
exports.emailIdParams = emailIdParams;
exports.studentCreateResult = studentCreateResult;
exports.studentCreateAttendance = studentCreateAttendance;
exports.studentIdBody = studentIdBody;
exports.saveAttendanceObject = saveAttendanceObject;
exports.saveResultObject = saveResultObject;
exports.getResultObject = getResultObject;
exports.attendanceArray = attendanceArray;
exports.getAttendanceObj = getAttendanceObj;