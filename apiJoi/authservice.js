const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const changePassword = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required()
})

const validateEmail = Joi.object({
    eventId: Joi.number().required()
})

const validateResetObject = Joi.object({
    password: Joi.string().required(),
    token: Joi.string().alphanum().min(3).max(200).required()
})
exports.changePassword = changePassword;
exports.validateEmail = validateEmail;
exports.validateResetObject = validateResetObject;