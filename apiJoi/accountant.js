const Joi = require("@hapi/joi").extend(require('@hapi/joi-date'));;

const classIdMediumParams = Joi.object({
    feeStructureId: Joi.number().required(),
    mediumType: Joi.number().required()
})

const classFeeObject = Joi.object({
    classId: Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    mediumType: Joi.number().required().valid(1,2),
    january: Joi.number().required(),
    february: Joi.number().required(),
    march: Joi.number().required(),
    april: Joi.number().required(),
    may: Joi.number().required(),
    june: Joi.number().required(),
    july: Joi.number().required(),
    august: Joi.number().required(),
    september: Joi.number().required(),
    october: Joi.number().required(),
    november: Joi.number().required(),
    december: Joi.number().required(),
    feeStructureId: Joi.number().allow('').allow(null)
})

const feeObject = Joi.object({
    value: Joi.string().required().valid('january','february','march','april','may','june','july','august','september','october','november','december'),
    monthFee: Joi.number().required()
})

const monthFeeObject = Joi.object({
    adharnumber:Joi.string().max(12).min(12).required(),
    selectedMonthName: Joi.array().items(feeObject)
    // monthName: Joi.string().required().valid('january','february','march','april','may','june','july','august','september','october','november','december')
})

const classIdAndSectionParams = Joi.object({
    classId: Joi.number().required().valid(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
    sectionId: Joi.number().required().valid(1,2,3,4,5,6)
})

const transportFeeObject = Joi.object({
    route: Joi.string().required(),
    fee: Joi.number().min(1).required(),
    vehicleNumber: Joi.string().required(),
    driverName: Joi.string().required().max(100),
    driverNumber: Joi.string().max(10).min(10).required(),
    driverSalary: Joi.number().min(1).required(),
    vehicleType: Joi.number().required().valid(1,2,3,4),
    vehicleColor: Joi.string().required(),
    vehicleExpense: Joi.number().min(1).required(),
    transportFeeId: Joi.number().allow('').allow(null)
})

const transportIDParams = Joi.object({
    transportFeeId: Joi.number().required()
})

const saveExpenseObj = Joi.object({
    expenseName: Joi.string().required(),
    expenseAmount: Joi.number().required(),
    expenseDate:Joi.date().format('YYYY-MM-DD').raw().required(),
    expenseId: Joi.number().allow('').allow(null)
})

const expensedetailsidParams = Joi.object({
    expenseId: Joi.number().required()
})

const feeDetailaObject = Joi.object({
    studentId: Joi.number().required(),
    mediumType: Joi.number().valid(1,2).required()
})

const studentIdParams = Joi.object({
    studentId: Joi.number().required()
})

const payFeeObject = Joi.object({
    selectedMonthName: Joi.array().min(1).required(),
    payfeetype: Joi.number().valid(1,2,3).required(),
    studentId: Joi.number().required()
})
exports.classIdMediumParams = classIdMediumParams;
exports.classFeeObject = classFeeObject;
exports.feeDetailaObject = feeDetailaObject;
exports.monthFeeObject = monthFeeObject;
exports.classIdAndSectionParams = classIdAndSectionParams;
exports.transportFeeObject = transportFeeObject;
exports.transportIDParams = transportIDParams;
exports.expensedetailsidParams = expensedetailsidParams;
exports.saveExpenseObj = saveExpenseObj;
exports.studentIdParams = studentIdParams;
exports.payFeeObject = payFeeObject;