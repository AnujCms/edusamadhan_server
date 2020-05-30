const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const classIdParams = Joi.object({
    classid: Joi.number().required().valid(1,2,3,4,5,6,7,8)
})

const periodObject = Joi.object({
    periodId: Joi.number().required(),
    periodStartTime: Joi.string().required(),
    periodEndTime: Joi.string().required()
})

const timeTableObject = Joi.object({
    periodId: Joi.number().required(),
    dayName: Joi.number().required(),
    subjectName: Joi.number().required(),
    teacherName: Joi.string().required(),
    class: Joi.number().required().valid(1,2,3,4,5,6,7,8),
    section: Joi.number().required().valid(1,2,3,4,5),
    dayname: Joi.number().required()
})

const classAndSectionParams = Joi.object({
    classid: Joi.number().required().valid(1,2,3,4,5,6,7,8),
    sectionid: Joi.number().required().valid(1,2,3,4,5)
})

exports.classIdParams = classIdParams;
exports.periodObject = periodObject;
exports.timeTableObject = timeTableObject;
exports.classAndSectionParams = classAndSectionParams;
