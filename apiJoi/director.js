const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const createUserObject = Joi.object({
    firstName:Joi.string().min(3).max(25).pattern(new RegExp('^[a-zA-Z ]{2,20}$')).required(),
    lastName:Joi.string().min(3).max(25).pattern(new RegExp('^[a-zA-Z ]{2,20}$')).required(),
    cellNumber:Joi.string().max(10).min(10).required(),
    emailId: Joi.string().max(50).email().required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    aadharNumber:Joi.string().max(12).min(12).required(),
    gender:Joi.number().valid(1,2).required(),
    subject:Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14).required(),
    qualification:Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14).required(),
    parmanentAddress:Joi.string().min(3).max(200).required(),
    localAddress:Joi.string().min(3).max(200).required(),
    userrole:Joi.number().valid(3,4).required(),
    userType: Joi.number().valid(1,2).required(),
    images:Joi.string().allow('').allow(null),
    userId:Joi.number().allow('').allow(null),
    salary: Joi.number().min(0).max(10000000).allow('').allow(null),
    workExperience: Joi.number().valid(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31).required(),
    educationalAwards: Joi.number().valid(1,2).required(),
    awardDetails: Joi.string().min(3).max(200).allow('')
})

const userIdParams = Joi.object({
    userId: Joi.number().required()
})
exports.createUserObject = createUserObject;
exports.userIdParams = userIdParams;
