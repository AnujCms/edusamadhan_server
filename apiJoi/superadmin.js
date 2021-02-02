const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));
const examinationObject = Joi.object({

})
const schoolObject = Joi.object({
    schoolName: Joi.string().min(3).max(100).pattern(new RegExp('^[a-zA-Z ]{2,200}$')).required(),
    phoneNumber: Joi.string().min(10).max(10).required(),
    registration: Joi.string().min(3).max(50).required(),
    firstName:Joi.string().min(3).max(25).pattern(new RegExp('^[a-zA-Z ]{2,100}$')).required(),
    lastName:Joi.string().min(3).max(25).pattern(new RegExp('^[a-zA-Z ]{2,100}$')).required(),
    cellNumber:Joi.string().max(10).min(10).required(),
    aadharNumber:Joi.string().max(12).min(12).required(),
    emailId: Joi.string().max(50).email().required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    gender:Joi.number().valid(1,2).required(),
    schoolAddress: Joi.string().min(3).max(200).required(),
    sessionId: Joi.number().required(),
    configType: Joi.number().required(),
    examination: Joi.string().required(),
    accountant: Joi.string().required(),
    examOption: Joi.array().items(Joi.number().valid(1,2,3,4)).required(),
    examinationType: Joi.string().required(),
    images:Joi.string().allow('').allow(null),
    schoolLogo:Joi.string().allow('').allow(null),
    accountId: Joi.string().guid().allow('').allow(null)
})

const accountIdParams = Joi.object({
    accountId: Joi.string().guid().required()
})
exports.schoolObject = schoolObject;
exports.accountIdParams = accountIdParams;

