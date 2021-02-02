const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const classIdParams = Joi.object({
    classId: Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15)
})

const periodObject = Joi.object({
    periodId: Joi.number().required(),
    periodStartTime: Joi.string().required(),
    periodEndTime: Joi.string().required()
})

const timeTableObject = Joi.object({
    periodId: Joi.number().required(),
    dayName: Joi.string().required(),
    subjectName: Joi.string().required(),
    teacherName: Joi.string().required(),
    classId: Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    sectionId: Joi.number().required().valid(1,2,3,4,5,6),
    dayname: Joi.number().required()
})

const classAndSectionParams = Joi.object({
    classId: Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    sectionId: Joi.number().required().valid(1,2,3,4,5,6)
})

const subjectIdParams = Joi.object({
    subjectId: Joi.number().required()
})

exports.classIdParams = classIdParams;
exports.periodObject = periodObject;
exports.timeTableObject = timeTableObject;
exports.classAndSectionParams = classAndSectionParams;
exports.subjectIdParams = subjectIdParams;
