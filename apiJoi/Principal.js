const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const staffObject = Joi.object({
    firstName:Joi.string().min(3).max(25).pattern(new RegExp('^[a-zA-Z ]{2,100}$')).required().required(),
    lastName:Joi.string().min(3).max(25).pattern(new RegExp('^[a-zA-Z ]{2,100}$')).required().required(),
    cellNumber:Joi.string().max(10).min(10).required(),
    emailId: Joi.string().max(50).email().required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    gender:Joi.number().valid(1,2).required(),
    aadharNumber:Joi.string().max(12).min(12).required(),
    subject:Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14).required(),
    qualification:Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14).required(),
    parmanentAddress:Joi.string().min(3).max(200).required(),
    localAddress:Joi.string().min(3).max(200).required(),
    userrole:Joi.number().valid(5,6,7).required(),
    images:Joi.string().allow('').allow(null),
    teacherId:Joi.number().allow('').allow(null),
    salary: Joi.number().allow('').allow(null),
    entranceExamType:  Joi.when('userrole',{
        is : Joi.valid(6),
        then: Joi.number().valid(1,2).required(),
        otherwise: Joi.strip()
    }),
    workExperience: Joi.number().valid(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31).required(),
    educationalAwards: Joi.number().valid(1,2).required(),
    awardDetails: Joi.string().min(3).max(200).allow('')
})
const teacherIdParams = Joi.object({
    teacherId:Joi.number().required()
})
const assignClasstoFaculty = Joi.object({
    selectedClass:Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    selectedSection:Joi.number().required().valid(1,2,3,4,5,6),
    teacherId:Joi.number().required()
})
const subjectIdParams = Joi.object({
    classId:Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15)
})
const assignSubjectToClass = Joi.object({
    selectedClass: Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    subjectOptions: Joi.array().items(Joi.number().strict().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14)).required()
})

const attendanceObject = Joi.object({
    studentId: Joi.number().required(),
    attendanceDate: Joi.string().required(),
    attendance: Joi.number().valid(1,2,3,4,5).required(),
    reason:Joi.when('attendance',{
        is: (value)=> value == 1 || value == 4 || value == 5,
        then: Joi.any().strip(),
        otherwise: Joi.string().min(3).max(200).required()
    })
})

const attendanceArray = Joi.object({
    attendanceArray: Joi.array().items(attendanceObject)
})

const isStartDateAndEndDate = Joi.object({
    startDate: Joi.string().required(),
    endDate: Joi.string().required()
})

const attendanceDateParams = Joi.object({
    attendanceDate: Joi.string().required()
})
exports.staffObject = staffObject;
exports.teacherIdParams = teacherIdParams;
exports.subjectIdParams = subjectIdParams;
exports.assignClasstoFaculty = assignClasstoFaculty;
exports.assignSubjectToClass = assignSubjectToClass;
exports.attendanceArray = attendanceArray;
exports.isStartDateAndEndDate = isStartDateAndEndDate;
exports.attendanceDateParams = attendanceDateParams;