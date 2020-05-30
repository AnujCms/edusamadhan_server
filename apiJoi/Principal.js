const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const staffObject = Joi.object({
    firstname:Joi.string().required().max(100),
    lastname:Joi.string().required().max(100),
    cellnumber:Joi.string().max(10).min(10).required(),
    emailid: Joi.string().email().required(),
    dob:Joi.date().format('YYYY-MM-DD').raw().required(),
    gender:Joi.number().valid(1,2).required(),
    adharnumber:Joi.string().max(12).min(12).required(),
    subject:Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14).required(),
    qualification:Joi.number().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14).required(),
    parmanentaddress:Joi.string().max(200).required(),
    localaddress:Joi.string().max(200).required(),
    userrole:Joi.number().valid(3,4,5).required(),
    images:Joi.string().allow('').allow(null),
    teacherid:Joi.string().allow('').allow(null),
    salary: Joi.number().allow('')
})
const teacherIdParams = Joi.object({
    teacherid:Joi.number().required()
})
const assignClasstoFaculty = Joi.object({
    selectedClass:Joi.number().required().valid(1,2,3,4,5,6,7,8),
    selectedSection:Joi.number().required().valid(1,2,3,4,5),
    teacherid:Joi.number().required()
})
const subjectIdParams = Joi.object({
    classId:Joi.number().required().valid(1,2,3,4,5,6,7,8)
})
const assignSubjectToClass = Joi.object({
    selectedClass: Joi.number().required().valid(1,2,3,4,5,6,7,8),
    subjectOptions: Joi.array().items(Joi.number().strict().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14)).required()
})

exports.staffObject = staffObject;
exports.teacherIdParams = teacherIdParams;
exports.subjectIdParams = subjectIdParams;
exports.assignClasstoFaculty = assignClasstoFaculty;
exports.assignSubjectToClass = assignSubjectToClass;