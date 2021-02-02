const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const createStudentObject = Joi.object({
    classId: Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15).required(),
    sectionId: Joi.number().valid(1,2,3,4,5,6).required(),
    firstName:Joi.string().pattern(new RegExp('^[a-zA-Z ]{2,100}$')).required(),
    lastName:Joi.string().pattern(new RegExp('^[a-zA-Z ]{2,100}$')).required(),
    cellNumber:Joi.string().max(10).min(10).required(),
    aadharNumber:Joi.string().max(12).min(12).required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    mediumType: Joi.number().valid(1,2).required(),
    studentId: Joi.number().allow(null).allow('')
})

const classIdAndSectionParams = Joi.object({
    classId: Joi.number().required(),
    sectionId: Joi.number().required()
})

const studentIdParams = Joi.object({
    studentId: Joi.number().required()
})

const userIdParams = Joi.object({
    userId: Joi.number().required()
})

const userMessage = Joi.object({
    messageUser: Joi.number().valid(2,3,4).required(),
    userMessage:Joi.string().required().min(5).max(2000),
    images:Joi.string().required(),
    msgId:Joi.number().allow('').allow(null)
})

const achievemetnObj = Joi.object({
    studentName:Joi.string().required().min(3).max(100),
    classId: Joi.number().valid(1,2,3).required(),
    percentage: Joi.string(),
    userMessage:Joi.string().required().min(5).max(500),
    images:Joi.string().required(),
    achievementId:Joi.number().allow('').allow(null)
})

const mediaObj = Joi.object({
    mediaType: Joi.number().valid(1,2,3).required(),
    mediaTitle: Joi.string().min(3).max(50).required(),
    images: Joi.string().required(),
    mediaId: Joi.number().allow('').allow(null)
})

const facilityObj = Joi.object({
    faculityType: Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15).required(),
    facilityDetails: Joi.string().min(5).max(2000).required(),
    images: Joi.string().required(),
    faculityId: Joi.number().allow('').allow(null)
})

exports.createStudentObject = createStudentObject;
exports.classIdAndSectionParams = classIdAndSectionParams;
exports.studentIdParams = studentIdParams;
exports.userIdParams = userIdParams;
exports.userMessage = userMessage;
exports.achievemetnObj = achievemetnObj;
exports.mediaObj = mediaObj;
exports.facilityObj = facilityObj;
