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

const classIdandSectionId = Joi.object({
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
    studentId: Joi.number().required()
})

const questionObject = Joi.object({
    question: Joi.string().required().max(250),
    optiona: Joi.string().required().max(100),
    optionb: Joi.string().required().max(100),
    optionc: Joi.string().required().max(100),
    optiond: Joi.string().required().max(100),
    optione: Joi.string().required().max(100),
    answer: Joi.number().valid(1,2,3,4,5).required(),
    classId: Joi.number().required(),
    subjectId: Joi.number().required(),
    questionId: Joi.number().allow('')
})

const resultObject = Joi.object({
    totalMarks: Joi.number().required(),
    obtainedMarks: Joi.number().required()
})

const profileObject = Joi.object({
    changePassword:Joi.boolean().required(),
    oldPassword: Joi.string().required(),
    newPassword:Joi.string().required(),
    image:Joi.string().required().allow(null)
})

const classSeatsObject = Joi.object({
    classId: Joi.number().required(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    sectionId: Joi.number().valid(1,2,3,4,5,6).required(),
    totalRows: Joi.number().required(),
    totalColumns: Joi.number().required(),
    totalSeats: Joi.number().required(),
    classSeatId: Joi.number().allow("")
})

exports.classIdParams = classIdParams;
exports.studentIdParams = studentIdParams;
exports.classIdandSectionId = classIdandSectionId;
exports.questionIdParams = questionIdParams;
exports.entranceObject = entranceObject;
exports.studentIdBody = studentIdBody;
exports.questionObject = questionObject;
exports.resultObject = resultObject;
exports.classSeatsObject = classSeatsObject;
