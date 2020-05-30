const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const classIdParams = Joi.object({
    classId: Joi.number().required()
})
const studentIdParams = Joi.object({
    studentId: Joi.number().required()
})

const questionIdParams = Joi.object({
    questionId: Joi.number().required()
})

const studentIdClassIdSectionIdParams = Joi.object({
    studentId: Joi.number().required(),
    classId: Joi.number().required(),
    sectionId: Joi.number().required()
})

const entranceObject = Joi.object({
    fname: Joi.string().required().max(100),
    lname: Joi.string().required().max(100),
    cellnumber:Joi.string().max(10).min(10).required(),
    adharnumber:Joi.string().max(12).min(12).required(),
    dob: Joi.string().required(),
    class: Joi.number().required(),
    section: Joi.number().required(),
    studentId: Joi.number().allow('')
})

const studentIdBody = Joi.object({
    studentid: Joi.number().required()
})

const questionObject = Joi.object({
    question: Joi.string().required().max(),
    optiona: Joi.string().required().max(100),
    optionb: Joi.string().required().max(100),
    optionc: Joi.string().required().max(100),
    optiond: Joi.string().required().max(100),
    optione: Joi.string().required().max(100),
    answer: Joi.string().required().max(100),
    class: Joi.number().required(),
    subject: Joi.number().required(),
    questionId: Joi.number().allow('')
})

const resultObject = Joi.object({
    totalmarks: Joi.number().required(),
    obtainedmarks: Joi.number().required()
})

const profileObject = Joi.object({
    changePassword:Joi.boolean().required(),
    oldPassword: Joi.string().required(),
    newPassword:Joi.string().required(),
    image:Joi.string().required().allow(null)
})

exports.classIdParams = classIdParams;
exports.studentIdParams = studentIdParams;
exports.studentIdClassIdSectionIdParams = studentIdClassIdSectionIdParams;
exports.questionIdParams = questionIdParams;
exports.entranceObject = entranceObject;
exports.studentIdBody = studentIdBody;
exports.questionObject = questionObject;
exports.resultObject = resultObject;
