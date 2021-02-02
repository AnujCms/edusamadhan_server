const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));
const moment= require('moment')

const studentObject = Joi.object({
    firstName:Joi.string().required().pattern(new RegExp('^[a-zA-Z ]{2,20}$')).required(),
    lastName:Joi.string().required().pattern(new RegExp('^[a-zA-Z ]{2,20}$')).required(),
    motherName:Joi.string().required().pattern(new RegExp('^[a-zA-Z ]{2,40}$')).required(),
    fatherName:Joi.string().required().pattern(new RegExp('^[a-zA-Z ]{2,40}$')).required(),
    cellNumber:Joi.string().max(10).min(10).required(),
    aadharNumber:Joi.string().max(12).min(12).required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    gender:Joi.number().valid(1,2).required(),
    religion:Joi.number().valid(1,2,3,4).required(),
    category:Joi.number().valid(1,2,3).required(),
    locality:Joi.number().valid(1,2).required(),
    mediumType: Joi.number().valid(1,2).required(),
    parmanentAddress:Joi.string().min(3).max(200).required(),
    localAddress:Joi.string().min(3).max(200).required(),
    images:Joi.string().allow('').allow(null),
    busService: Joi.number().valid(1,2),
    route:Joi.when('busService',{
        is: 2,
        then: Joi.any().strip(),
        otherwise:Joi.number().required()
    }),
    studentId:Joi.string().allow('').allow(null),
    classId: Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15).required(),
    sectionId: Joi.number().valid(1,2,3,4,5,6).required(),
    status: Joi.number().required()
})

const studentIdParams = Joi.object({
    studentId: Joi.number().required()
})

const homeWorkIdParams = Joi.object({
    homeWorkId: Joi.number().required()
})

const emailIdParams = Joi.object({
    emailId: Joi.string().max(50).email().required()
})

const studentCreateResult = Joi.object({
    studentId: Joi.number().required(),
    examinationtype:Joi.number().required().valid(1,2,3,4),
    subjectId:Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14),
    totalMarks:Joi.number().required().min(1),
    obtainMarks:Joi.number().required().min(0)
})
const studentCreateAttendance = Joi.object({
    studentId: Joi.number().required(),
    monthName:Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12),
    totalClasses:Joi.number().required().min(1),
    presentClasses:Joi.number().required().min(0)
})

const studentIdBody = Joi.object({
    studentId: Joi.number().required()
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
    studentId: Joi.number().required(),
    examinationType: Joi.number().valid(1,2,3,4).required(),
    subjectResultArray: Joi.array().items(resultObject).min(1).required()

})

const getResultObject = Joi.object({
    studentId: Joi.number().required(),
    examinationType: Joi.number().valid(1,2,3,4).required()
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

const homeWorkObject = Joi.object({
    classId: Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15).required(),
    sectionId: Joi.number().valid(1,2,3,4,5,6).required(),
    mediumType: Joi.number().valid(1,2).required(),
    subjectId: Joi.number().required(),
    homeWorkDate: Joi.string().required(),
    homeWorkDetails: Joi.string().required(),
    homeWorkId: Joi.number()
})

const noticeObject = Joi.object({
    noticeDate: Joi.string().required(),
    studentNotice: Joi.string().max(1000).required(),
    studentId: Joi.number().required(),
    noticeId: Joi.number()
})

const siblingObject = Joi.object({
    siblingFirstName: Joi.string().required().min(3).max(100),
    siblingLastname: Joi.string().required().min(3).max(100),
    siblingClassId:Joi.string().required()
})

const parentDetailsObj = Joi.object({
    motherFirstName:Joi.string().required().min(3).max(100),
    motherLastName:Joi.string().required().min(3).max(100),
    motherCellNumber:Joi.string().max(10).min(10).required(),
    motherAAdharNumber:Joi.string().max(12).min(12).required(),
    motherOccupation:Joi.string().required().min(2).max(100),
    motherQualification:Joi.string().required().min(2).max(100),
    fatherFirstName:Joi.string().required().min(3).max(100),
    fatherLastName:Joi.string().required().min(3).max(100),
    fatherCellNumber:Joi.string().max(10).min(10).required(),
    fatherAAdharNumber:Joi.string().max(12).min(12).required(),
    fatherOccupation:Joi.string().required().min(2).max(100),
    fatherQualification:Joi.string().required().min(2).max(100),
    localGuardianFirstName:Joi.string().required().min(3).max(100),
    localGuardianLastName:Joi.string().required().min(3).max(100),
    localGuardianCellNumber:Joi.string().max(10).min(10).required(),
    localGuardianAAdharNumber:Joi.string().max(12).min(12).required(),
    localGuardianOccupation:Joi.string().required().min(2).max(100),
    localGuardianQualification:Joi.string().required().min(2).max(100),
    siblings:Joi.number().valid(1,2).required(),
    siblingsDetails:Joi.when('siblings',{
        is: 2,
        then: Joi.any().strip(),
        otherwise: Joi.array().items(siblingObject).min(1).required()
    }),
    physicalDisability: Joi.number().valid(1,2).required(),
    physicalDisabilityDetails:Joi.when('physicalDisability',{
        is: 2,
        then: Joi.any().strip(),
        otherwise: Joi.string().required().min(3).max(100)
    }),
    currentTreatment: Joi.number().valid(1,2).required(),
    currentTreatmentDetails:Joi.when('currentTreatment',{
        is: 2,
        then: Joi.any().strip(),
        otherwise: Joi.string().required().min(3).max(100)
    }),
    isStaffChild: Joi.number().valid(1,2),
    studentBloodGroup: Joi.number().valid(1,2,3,4,5,6,7,8),
    isWeekInSubject: Joi.array(),
    studentId: Joi.number().required(),
    motherImage: Joi.string().allow(null),
    fatherImage: Joi.string().allow(null),
    localGuardianImage: Joi.string().allow(null),
    addressProof: Joi.string().allow(null),
    parentDetailsId: Joi.number()
})

const studentIdAndId = Joi.object({
    studentId: Joi.number().required(),
    parentDetailsId: Joi.number().required()
})
const imageObj = Joi.object({
    image: Joi.string().required()
})
exports.studentObject = studentObject;
exports.studentIdParams = studentIdParams;
exports.homeWorkIdParams = homeWorkIdParams;
exports.emailIdParams = emailIdParams;
exports.studentCreateResult = studentCreateResult;
exports.studentCreateAttendance = studentCreateAttendance;
exports.studentIdBody = studentIdBody;
exports.saveAttendanceObject = saveAttendanceObject;
exports.saveResultObject = saveResultObject;
exports.getResultObject = getResultObject;
exports.attendanceArray = attendanceArray;
exports.homeWorkObject = homeWorkObject;
exports.noticeObject = noticeObject;
exports.parentDetailsObj = parentDetailsObj;
exports.studentIdAndId = studentIdAndId;
exports.imageObj = imageObj;