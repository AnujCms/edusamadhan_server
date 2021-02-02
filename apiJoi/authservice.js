const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const changePassword = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
})

const validateEmail = Joi.object({
    emailId: Joi.string().max(50).email().required()
})

const validateResetObject = Joi.object({
    password: Joi.string().required(),
    token: Joi.string().alphanum().min(3).max(500).required()
})

const userIdParams = Joi.object({
    userId: Joi.number().required()
})

const userIdUserRoleObj = Joi.object({
    userId: Joi.number().required(),
    userrole: Joi.number().required()
})
const isTokenValid = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!%*#_?&^+=-])[A-Za-z0-9$@$!%*#_?&^+=-]{8,}')).required()
})

const isValidPassword = Joi.object({
    password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!%*#_?&^+=-])[A-Za-z0-9$@$!%*#_?&^+=-]{8,}')).required(),
    cnfPassword: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!%*#_?&^+=-])[A-Za-z0-9$@$!%*#_?&^+=-]{8,}')).required()
})
exports.changePassword = changePassword;
exports.validateEmail = validateEmail;
exports.validateResetObject = validateResetObject;
exports.userIdParams = userIdParams;
exports.userIdUserRoleObj = userIdUserRoleObj;
exports.isTokenValid = isTokenValid;
exports.isValidPassword = isValidPassword;