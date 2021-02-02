const router = require('express').Router();
const AccountantDB = require("../database/AccountantDB.js");
const UserEnum = require('../lookup/UserEnum');
const joiSchema = require('../apiJoi/accountant.js');
const middleWare = require('../apiJoi/middleWare.js');
const encrypt = require('../utils/encrypt');

function isAccountantOrTeacher(req, res, next) {
    if (req.user.role == UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isAccountantOrTeacherOrStudent(req, res, next) {
    if (req.user.role == UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.Student || req.user.role === UserEnum.UserRoles.Principal) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isTeacher(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function isAccountant(req, res, next) {
    if (req.user.role == UserEnum.UserRoles.FeeAccount ) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}

async function isStudentBelongsToSameSchool(req, res, next) {
    let result = await AccountantDB.checkStudentSchool(req.user.accountId,  (req.params.aadharNumber || req.body.aadharNumber))
    if (result === 1) {
        next();
    } else if(result === 2) {
        return res.status(200).json({ status: 2, statusDescription: "AAdhar number is not belongs to your school. Try with correct aadhar number." });
    }else if(result === 3){
        return res.status(200).json({ status: 2, statusDescription: "AAdhar number is not registered in my system. Try with correct aadhar number." });
    }
}

//Check User and Student Beelongs to same School
let checkStudentAndUserBelongsToSameSchool = async (req, res, next) =>{
    let result = await AccountantDB.checkRelationStudentAndUser(req.user.accountId, req.params.studentId || req.body.studentId);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Student and User are not belongs to same account." });
    }  
}
async function isClassBelongsToSameSchool(req, res, next) {
    let result = await AccountantDB.checkClassSchool(req.user.accountid, req.params.classid, req.params.sectionid, UserEnum.UserRoles.Teacher, JSON.parse(req.user.configData).sessionId)
    if (result) {
        next();
    } else {
        return res.status(200).json({ status: 2, statusDescription: "AAdhar number is not belongs to your school. Try with correct aadhar number." });
    }
}

const classIdMediumParams =  middleWare(joiSchema.classIdMediumParams, "params", true);
const classFeeObject = middleWare(joiSchema.classFeeObject, "body", true);
const saveExpenseObj =  middleWare(joiSchema.saveExpenseObj, "body", true);
const classIdAndSectionParams =  middleWare(joiSchema.classIdAndSectionParams, "params", true);
const transportFeeObject =  middleWare(joiSchema.transportFeeObject, "body", true);
const transportIDParams =  middleWare(joiSchema.transportIDParams, "params", true);
const expensedetailsidParams =  middleWare(joiSchema.expensedetailsidParams, "params", true);
const feeDetailaObject = middleWare(joiSchema.feeDetailaObject, "params", true);
const studentIdParams =  middleWare(joiSchema.studentIdParams, "params", true);
const payFeeObject =  middleWare(joiSchema.payFeeObject, "body", true);

//get fee details
router.get("/getfeedetails", isAccountantOrTeacher, async (req, res) => {
    let result = await AccountantDB.getFeeDetails(JSON.parse(req.user.configData).sessionId, req.user.accountId);
    if (result.length > 0) {
        let resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                feeStructureId: row.feeStructureId,
                classId: row.classId,
                mediumType: row.mediumType,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get fee details.' });
    }
})
//get fee details by class
router.get("/getfeedetailbyclass/:feeStructureId/:mediumType", isAccountantOrTeacher, classIdMediumParams, async (req, res) =>{
    let result = await AccountantDB.getFeeDetailByClass(JSON.parse(req.user.configData).sessionId, req.user.accountId, req.params.feeStructureId, req.params.mediumType);
    if (result.length > 0) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                feeStructureId: row.feeStructureId,
                classId: row.classId,
                mediumType: row.mediumType,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get fee details.' });
    }
})
//create fee for selected class
router.post("/createfeeforselectedclass", isAccountant, classFeeObject, async (req, res) => {
    let feeStructureObject = {
        classId: req.body.classId,
        mediumType: req.body.mediumType,
        january: req.body.january,
        february: req.body.february,
        march: req.body.march,
        april: req.body.april,
        may: req.body.may,
        june: req.body.june,
        july: req.body.july,
        august: req.body.august,
        september: req.body.september,
        october: req.body.october,
        november: req.body.november,
        december: req.body.december,
        sessionId:JSON.parse(req.user.configData).sessionId, 
        accountId:req.user.accountId
    }
    let result = 0;
    let createdMsg = "saved";
    if(req.body.feeStructureId){
        createdMsg = "updated"
        feeStructureObject.feeStructureId = req.body.feeStructureId;
     result = await AccountantDB.updateClassFeeStructure(feeStructureObject);
    }else{
        result = await AccountantDB.saveClassFeeStructure(feeStructureObject);
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `Fee details has been ${createdMsg} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to create fee details.' });
    }
})

//get Student fee details
router.get("/feedetails/:studentId/:mediumType", isAccountantOrTeacherOrStudent, feeDetailaObject, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
   console.log(req.user)
    let getFeeObj = {
        accountId: req.user.accountId, 
        sessionId: JSON.parse(req.user.configData).sessionId,
        studentId: req.params.studentId,
        userrole: UserEnum.UserRoles.Student, 
        status: UserEnum.StudentStatus.Active,
        mediumType: req.params.mediumType
    }
    let result = await AccountantDB.getStudentFeeDetails(getFeeObj);
    if (result.student.length > 0) {
        let s = result.student[0];
        let studentMonthFee = result.feeDetails[0];
        let transportFee = result.transportFee[0];
        let str = result.feeStructure[0];
        let studentFeeStructure, studentFeeDetails, transportFeeDetails;
        let studentfeeData = {
            name: encrypt.decrypt(s.firstName) + " " + encrypt.decrypt(s.lastName),
            motherName: encrypt.decrypt(s.motherName),
            fatherName: encrypt.decrypt(s.fatherName),
            dob: encrypt.decrypt(s.dob),
            cellNumber: encrypt.decrypt(s.cellNumber),
            aadharNumber: encrypt.decrypt(s.aadharNumber),
            gender: s.gender,
            busService: s.busService,
            route: s.route,
            mediumType: s.mediumType
        }
        if (result.feeStructure.length > 0) {
             studentFeeStructure = {
                jan: str.january,
                feb: str.february,
                mar: str.march,
                apr: str.april,
                may: str.may,
                jun: str.june,
                jul: str.july,
                aug: str.august,
                sep: str.september,
                oct: str.october,
                nov: str.november,
                dec: str.december
            }
        }
        if (result.feeDetails.length > 0) {
            studentFeeDetails = {
                jan: studentMonthFee.january!= null && JSON.parse(studentMonthFee.january)[0].schoolFee,
                feb: studentMonthFee.february!= null && JSON.parse(studentMonthFee.february)[0].schoolFee,
                mar: studentMonthFee.march!= null && JSON.parse(studentMonthFee.march)[0].schoolFee,
                apr: studentMonthFee.april!= null && JSON.parse(studentMonthFee.april)[0].schoolFee,
                may: studentMonthFee.may!= null && JSON.parse(studentMonthFee.may)[0].schoolFee,
                jun: studentMonthFee.june!= null && JSON.parse(studentMonthFee.june)[0].schoolFee,
                jul: studentMonthFee.july!= null && JSON.parse(studentMonthFee.july)[0].schoolFee,
                aug: studentMonthFee.august!= null && JSON.parse(studentMonthFee.august)[0].schoolFee,
                sep: studentMonthFee.september!= null && JSON.parse(studentMonthFee.september)[0].schoolFee,
                oct: studentMonthFee.october!= null && JSON.parse(studentMonthFee.october)[0].schoolFee,
                nov: studentMonthFee.november!= null && JSON.parse(studentMonthFee.november)[0].schoolFee,
                dec: studentMonthFee.december!= null && JSON.parse(studentMonthFee.december)[0].schoolFee
            }
        } else {
            studentFeeDetails = {}
        }
        if (result.transportFee.length > 0) {
             transportFeeDetails = {
                jan: transportFee.january!= null && JSON.parse(transportFee.january)[0].transportFee,
                feb: transportFee.february!= null && JSON.parse(transportFee.february)[0].transportFee,
                mar: transportFee.march!= null && JSON.parse(transportFee.march)[0].transportFee,
                apr: transportFee.april!= null && JSON.parse(transportFee.april)[0].transportFee,
                may: transportFee.may!= null && JSON.parse(transportFee.may)[0].transportFee,
                jun: transportFee.june!= null && JSON.parse(transportFee.june)[0].transportFee,
                jul: transportFee.july!= null && JSON.parse(transportFee.july)[0].transportFee,
                aug: transportFee.august!= null && JSON.parse(transportFee.august)[0].transportFee,
                sep: transportFee.september!= null && JSON.parse(transportFee.september)[0].transportFee,
                oct: transportFee.october!= null && JSON.parse(transportFee.october)[0].transportFee,
                nov: transportFee.november!= null && JSON.parse(transportFee.november)[0].transportFee,
                dec: transportFee.december!= null && JSON.parse(transportFee.december)[0].transportFee
            }
        } else {
            transportFeeDetails = {}
        }
        let studentTransportRoute = null;
        if(result.routeName.length>0){
            studentTransportRoute = encrypt.decrypt(result.routeName[0].route);
        }
        res.status(200).json({ status: 1, studentfeeData: studentfeeData, studentFeeDetails: studentFeeDetails, studentFeeStructure: studentFeeStructure, transportFeeDetails: transportFeeDetails, studentTransportRoute: studentTransportRoute });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get fee details." });
    }
})

//pay transport fee
router.post("/paytransportfee", isAccountant, payFeeObject, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let transportFeeObj = {}
    await req.body.selectedMonthName.forEach(async(item, index)=>{
    let monthName= item.value;
    if(monthName == 'january')transportFeeObj.january = JSON.stringify(item.transportFee)
    else if(monthName == 'february')transportFeeObj.february = JSON.stringify(item.transportFee)
    else if(monthName == 'march')transportFeeObj.march = JSON.stringify(item.transportFee)
    else if(monthName == 'april')transportFeeObj.april = JSON.stringify(item.transportFee)
    else if(monthName == 'may')transportFeeObj.may = JSON.stringify(item.transportFee)
    else if(monthName == 'june')transportFeeObj.june = JSON.stringify(item.transportFee)
    else if(monthName == 'july')transportFeeObj.july = JSON.stringify(item.transportFee)
    else if(monthName == 'august')transportFeeObj.august = JSON.stringify(item.transportFee)
    else if(monthName == 'september')transportFeeObj.september = JSON.stringify(item.transportFee)
    else if(monthName == 'october')transportFeeObj.october = JSON.stringify(item.transportFee)
    else if(monthName == 'november')transportFeeObj.november = JSON.stringify(item.transportFee)
    else if(monthName == 'december')transportFeeObj.december = JSON.stringify(item.transportFee)
    })
    let result = await AccountantDB.payTransportFee(req.body.studentId, JSON.parse(req.user.configData).sessionId, transportFeeObj, req.user.accountId);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student fee has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to submit the fee." });
    }
})

//pay student fee
router.post("/paystudentfee", isAccountant, payFeeObject, checkStudentAndUserBelongsToSameSchool, async (req, res) =>{
    let studentFeeObj = {}
    await req.body.selectedMonthName.forEach(async(item, index)=>{
    let monthName= item.value;
    if(monthName == 'january')studentFeeObj.january = JSON.stringify(item.schoolFee)
    else if(monthName == 'february')studentFeeObj.february = JSON.stringify(item.schoolFee)
    else if(monthName == 'march')studentFeeObj.march = JSON.stringify(item.schoolFee)
    else if(monthName == 'april')studentFeeObj.april = JSON.stringify(item.schoolFee)
    else if(monthName == 'may')studentFeeObj.may = JSON.stringify(item.schoolFee)
    else if(monthName == 'june')studentFeeObj.june = JSON.stringify(item.schoolFee)
    else if(monthName == 'july')studentFeeObj.july = JSON.stringify(item.schoolFee)
    else if(monthName == 'august')studentFeeObj.august = JSON.stringify(item.schoolFee)
    else if(monthName == 'september')studentFeeObj.september = JSON.stringify(item.schoolFee)
    else if(monthName == 'october')studentFeeObj.october = JSON.stringify(item.schoolFee)
    else if(monthName == 'november')studentFeeObj.november = JSON.stringify(item.schoolFee)
    else if(monthName == 'december')studentFeeObj.december = JSON.stringify(item.schoolFee)
    })
    let result = await AccountantDB.payStudentFee(req.body.studentId, JSON.parse(req.user.configData).sessionId, studentFeeObj, req.user.accountId);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student fee has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to submit the fee." });
    }
})

//get fee details by class
router.get("/getclassfeedetails/:classId/:sectionId", isTeacher, classIdAndSectionParams, async (req, res) => {
    let result = await AccountantDB.getclassfeedetails(JSON.parse(req.user.configData).sessionId, req.user.accountId, req.params.classId, req.params.sectionId);
    if (result.feeDetails.length > 0) {
        let resultObj = [];
        let fee = result.feeStructure[0];
        let totalFee = fee.january + fee.february + fee.march + fee.april + fee.may + fee.june + fee.july + fee.august + fee.september + fee.october + fee.november + fee.december;
        result.feeDetails.forEach(function (row) {
            let totalPaidFee = row.january + row.february + row.march + row.april + row.may + row.june + row.july + row.august + row.september + row.october + row.november + row.december;
            resultObj.push({
                name: encrypt.decrypt(row.firstname) + " " + encrypt.decrypt(row.lastname),
                adharnumber: row.adharnumber,
                january: row.january,
                february: row.february,
                march: row.march,
                april: row.april,
                may: row.may,
                june: row.june,
                july: row.july,
                august: row.august,
                september: row.september,
                october: row.october,
                november: row.november,
                december: row.december,
                totalFee: totalFee,
                paidfee: totalPaidFee,
                remainingfee: totalFee - totalPaidFee
            })
        })
        res.status(200).json({ status: 1, studentFeeDetails: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get fee details.' });
    }
})

//get student fee print details
router.get("/getfeeprintdetails/:studentId", isAccountant, studentIdParams, isStudentBelongsToSameSchool, async function (req, res) {
    let result = await AccountantDB.getFeeDetailsForPrint(req.params.studentId, JSON.parse(req.user.configData).sessionId, req.user.accountid);
    if (result.studentData.length > 0) {
        let freePrintData = {
            schoolName: encrypt.decrypt(result.school[0].accountName),
            schoolNumber: result.school[0].accountRefNumber,
            schoolAddress: result.school[0].accountAddress,
            studentName: encrypt.decrypt(result.studentData[0].firstName) + " " + encrypt.decrypt(result.studentData[0].lastName),
            aadharNumber: encrypt.decrypt(result.studentData[0].aadharnNmber),
            cellNumber: encrypt.decrypt(result.studentData[0].cellNumber),
            dob: encrypt.decrypt(result.studentData[0].dob),
            motherName: encrypt.decrypt(result.studentData[0].motherName),
            fatherName: encrypt.decrypt(result.studentData[0].fatherName),
            classId: result.studentData[0].classId,
            sectionId: result.studentData[0].sectionId
        }
        res.status(200).json({ status: 1, statusDescription: freePrintData });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able tpoo get the data." });
    }
})

//get Full Class Fee Details of class
router.get("/getstudentslist/:classId/:sectionId", classIdAndSectionParams, async (req, res) => {
    let feeObject = {
        accountId: req.user.accountId,
        classId: req.params.classId,
        sectionId: req.params.sectionId,
        sessionId:JSON.parse(req.user.configData).sessionId,
        userType: req.user.userType,
        status: UserEnum.UserStatus.Active
    }
    let result = await AccountantDB.getStudentsListOfClass(feeObject);
    if (result.length > 0) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                userId: row.userId,
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                motherName: encrypt.decrypt(row.motherName),
                fatherName: encrypt.decrypt(row.fatherName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                roll: row.rollnumber,
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                mediumType: row.mediumType,
                status: row.status,
                images:row.images,
                classId: row.classId,
                sectionId: row.sectionId,
                busService: row.busService
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the students.' });
    }
})

//get Student fee details 
router.get("/getfullfeedetails/:classId/:sectionId", classIdAndSectionParams, async (req, res) => {
    let getFeeObj = {
        accountId: req.user.accountId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        classId: req.params.classId,
        sectionId: req.params.sectionId,
        userrole: UserEnum.UserRoles.Teacher,
        status: UserEnum.StudentStatus.Active
    }
    let result = await AccountantDB.getFullFeeDetails(getFeeObj);
    if (result) {
        let studentObj = [];
        if(result.feeStructure.length>0){
        let a = result.feeStructure[0];
        setRoute = (value) =>{
            let fee
            result.transport.map((item)=>{
                if(value == item.transportFeeId){
                    fee = item.fee
                }
            })
            return fee;
        }

        let feeSum = parseInt(a.january) + a.february + a.march + a.april + a.may + a.june + a.july + a.august + a.september + a.october + a.november + a.december;
        result.student.map((item)=>{
            studentObj.push({
                name: encrypt.decrypt(item.firstName) + " " + encrypt.decrypt(item.lastName),
                totalFee: feeSum,
                busService: item.busService,
                images: item.images,
                studentId: item.userId,
                aadharNumber: encrypt.decrypt(item.aadharNumber),
                transportFee: item.busService == 1?setRoute(item.route):0
            })
        })
        let dataToSend = {
            studentData: studentObj,
            studenttransportfee: result.studenttransportfee,
            submittedfee:result.submittedfee
        }
        res.status(200).json({ status: 1, statusDescription: dataToSend });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee details." });
    }
}else{
    res.status(200).json({ status: 0, statusDescription: "Not able to get the fee details." });
}
})
//**********************//
//create transport fee
router.post("/createtransportfee", isAccountant, transportFeeObject, async (req, res) => {
    let transportFeeObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        route: encrypt.encrypt(req.body.route),
        fee: req.body.fee,
        vehicleNumber: encrypt.encrypt(req.body.vehicleNumber),
        driverName: encrypt.encrypt(req.body.driverName),
        driverNumber: encrypt.encrypt(req.body.driverNumber),
        driverSalary: req.body.driverSalary,
        vehicleType: req.body.vehicleType,
        vehicleColor: req.body.vehicleColor,
        vehicleExpense: req.body.vehicleExpense
    }
    let result = 0;
    let createMsg = "saved";
    if(req.body.transportFeeId){
        createMsg = "updated";
        transportFeeObj.transportFeeId = req.body.transportFeeId;
        result = await AccountantDB.updateTranssportFeeById(transportFeeObj);
    }else{
        result = await AccountantDB.createTranssportFee(transportFeeObj);
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `Transport Fee has been ${createMsg} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to submit the fee." });
    }
})

//get transport fee
router.get("/gettransportfee", isAccountantOrTeacherOrStudent, async (req, res) => {
    let result = await AccountantDB.getTranssportFee(req.user.accountId, JSON.parse(req.user.configData).sessionId);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                route: encrypt.decrypt(row.route),
                fee: row.fee,
                transportFeeId: row.transportFeeId,
                vehicleNumber: encrypt.decrypt(row.vehicleNumber),
                driverName: encrypt.decrypt(row.driverName),
                driverNumber: encrypt.decrypt(row.driverNumber),
                driverSalary: row.driverSalary,
                vehicleType: row.vehicleType,
                vehicleColor: row.vehicleColor,
                vehicleExpense: row.vehicleExpense
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

//delete transport fee
router.delete("/deletetransportfee/:transportFeeId", isAccountant, transportIDParams, async (req, res) => {
    let deleteTranObj = {
        transportFeeId:req.params.transportFeeId,
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
    }
    let result = await AccountantDB.deleteTranssportFee(deleteTranObj);
    if (result === 1) {
        res.status(200).json({ status: 1, statusDescription: "Transport fee has been deleted successfully."});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the fee." });
    }
})

//get transport fee
router.get("/gettetransportfee/:transportFeeId", isAccountantOrTeacher, transportIDParams, async (req, res) => {
    let getTranObj = {
        transportFeeId:req.params.transportFeeId,
        accountId: req.user.accountId,
        sessionId: JSON.parse(req.user.configData).sessionId,
    }
    let result = await AccountantDB.getTranssportFeeById(getTranObj);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                route: encrypt.decrypt(row.route),
                fee: row.fee,
                transportFeeId: row.transportFeeId,
                vehicleNumber: encrypt.decrypt(row.vehicleNumber),
                driverName: encrypt.decrypt(row.driverName),
                driverNumber: encrypt.decrypt(row.driverNumber),
                driverSalary: row.driverSalary,
                vehicleType: row.vehicleType,
                vehicleColor: row.vehicleColor,
                vehicleExpense: row.vehicleExpense
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the fee." });
    }
})

//**********************//
//create expense
router.post("/createexpense", isAccountant, saveExpenseObj, async (req, res) => {
    let expenseObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        expenseName: req.body.expenseName,
        expenseAmount: req.body.expenseAmount,
        expenseDate: req.body.expenseDate
    }
    let result = 0;
    let createMsg = "created";
    if(req.body.expenseId){
        createMsg = "updated";
        expenseObj.expenseId = req.body.expenseId;
       result = await AccountantDB.updateExpenseById(expenseObj);
    }else{
      result = await AccountantDB.createExpense(expenseObj);
    }
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: `Expense has been ${createMsg} successfully.` });
    } else {
        res.status(200).json({ status: 0, statusDescription: `Not able to ${createMsg} the expense.` });
    }
})

//get expense
router.get("/getexpense", isAccountant, async (req, res) => {
    let result = await AccountantDB.getExpense(req.user.accountId, JSON.parse(req.user.configData).sessionId);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                expenseId: row.expenseId,
                expenseName: row.expenseName,
                expenseAmount: row.expenseAmount,
                expenseDate: row.expenseDate
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

//delete expense
router.delete("/deleteexpense/:expenseId", isAccountant, expensedetailsidParams, async (req, res) => {
    let deleteExpObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        expenseId: req.params.expenseId
    }
    let result = await AccountantDB.deleteExpense(deleteExpObj);
    if (result === 1) {
        res.status(200).json({ status: 1, statusDescription: "Expense has been deleted successfully."});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the expense." });
    }
})

//get transport fee
router.get("/getentrance/:expenseId", isAccountant, expensedetailsidParams, async (req, res) => {
    let getExpObj = {
        accountId: req.user.accountId,
        userId: req.user.userId,
        sessionId: JSON.parse(req.user.configData).sessionId,
        expenseId: req.params.expenseId
    }
    let result = await AccountantDB.getExpenxeById(getExpObj);
    if (result.length) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                expenseId: row.expenseId,
                expenseName: row.expenseName,
                expenseAmount: row.expenseAmount,
                expenseDate: row.expenseDate
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to delete the expense." });
    }
})

//***********************************//
//get expense
router.get("/getstaffsalary", isAccountant, async (req, res) => {
    let result = await AccountantDB.getStaffSalary(req.user.accountId, req.user.userType, JSON.parse(req.user.configData).sessionId);
    if (result.length>0) {
        let resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                firstName: encrypt.decrypt(row.firstName),
                lastName: encrypt.decrypt(row.lastName),
                cellNumber: encrypt.decrypt(row.cellNumber),
                emailId:encrypt.decrypt(row.emailId),
                aadharNumber: encrypt.decrypt(row.aadharNumber),
                salary: row.salary,
                gender: row.gender,
                userrole: row.userrole,
                images: row.images
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

//get transport fee
router.get("/getstudenttransportfee/:studentId", isAccountantOrTeacherOrStudent, studentIdParams, checkStudentAndUserBelongsToSameSchool, async (req, res) => {
    let getTransFeeObj = {
        sessionId: JSON.parse(req.user.configData).sessionId,
        studentId: req.params.studentId
    }
    let result = await AccountantDB.getTransportFee(getTransFeeObj);
    if (result.length>0) {
        res.status(200).json({ status: 1, statusDescription: result});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the fee." });
    }
})

/**
* @swagger
* paths:
*     /studentfeeservice/getfeedetails:
*      get:
*          description: Get Fee Details, only access by Accountant 
*          tags: [Accountant Service]
*          summary: Get Fee Details, only access by Accountant 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   class: ''
*                                   january: ''
*                                   february: ''
*                                   march: ''
*                                   april: ''
*                                   may: ''
*                                   june: ''
*                                   july: ''
*                                   august: ''
*                                   september: ''
*                                   october: ''
*                                   november: ''
*                                   december: ''
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getfeedetailbyclass/{classId}:
*       get:
*          description: Get Class Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Class Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classs
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   class: ''
*                                   january: ''
*                                   february: ''
*                                   march: ''
*                                   april: ''
*                                   may: ''
*                                   june: ''
*                                   july: ''
*                                   august: ''
*                                   september: ''
*                                   october: ''
*                                   november: ''
*                                   december: ''
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/createfeeforselectedclass:
*         post:
*             description: Save Fee Details 
*             tags: [Accountant Service]
*             summary: "Save Fee Details of a class, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 class:
*                                     type: number
*                                 january:
*                                     type: number
*                                 february:
*                                     type: number
*                                 march:
*                                     type: number
*                                 april:
*                                     type: number
*                                 may:
*                                     type: number
*                                 june:
*                                     type: number
*                                 july:
*                                     type: number
*                                 august:
*                                     type: number
*                                 september:
*                                     type: number
*                                 october:
*                                     type: number
*                                 november:
*                                     type: number
*                                 december:
*                                     type: number
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /studentfeeservice/feedetails/{aadharnNmber}:
*       get:
*          description: Get Student Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Fee Details by AAdhar Number, only access by Accountant  
*          parameters:
*              - in: path
*                name: adharnumber
*                required: true
*                schema:
*                  type: string
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/paystudentfee:
*         post:
*             description: Pay Student Fee
*             tags: [Accountant Service]
*             summary: Pay student fee, only accessed by Accountant
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 adharnumber:
*                                     type: string
*                                 selectedmonthfee:
*                                     type: number
*                                 monthName:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /studentfeeservice/getclassfeedetails/{classId}/{sectionId}:
*       get:
*          description: Get Class Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Class Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classid
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionid
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getfeeprintdetails/{aadharNumber}:
*       get:
*          description: Get Student Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: adharnumber
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getstudentslist/{classId}/{sectionId}:
*       get:
*          description: Get Students List, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classid
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionid
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getfullfeedetails/{classId}/{sectionId}:
*       get:
*          description: Get Full Class Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Full Class Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: classId
*                required: true
*                schema:
*                  type: number
*              - in: path
*                name: sectionId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/createtransportfee:
*         post:
*             description: Create Transport Fee Detailas 
*             tags: [Accountant Service]
*             summary: "Create Transport Fee Detailas, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 route:
*                                     type: string
*                                 fee:
*                                     type: number
*                                 vehiclenumber:
*                                     type: string
*                                 drivername:
*                                     type: string
*                                 drivernumber:
*                                     type: string
*                                 driversalary:
*                                     type: number
*                                 vehicletype:
*                                     type: number
*                                 vehiclecolor:
*                                     type: string
*                                 vehicleexpense:
*                                     type: number
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /studentfeeservice/gettransportfee:
*       get:
*          description: Get Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Transport Fee Details, only access by Accountant  
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/deletetransportfee/{transportfeeId}:
*       delete:
*          description: Delete Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: transportfeeid
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/gettetransportfee/{transportfeeid}:
*       get:
*          description: Get Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: transportfeeid
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/createexpense:
*         post:
*             description: Create Expense Fee Detailas 
*             tags: [Accountant Service]
*             summary: "Create Expense Fee Detailas, only accessed by Accountant"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 expense:
*                                     type: string
*                                 expenseamount:
*                                     type: number
*                                 expensedate:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*             security:
*                - LoginSecurity: []
*     /studentfeeservice/getexpense:
*       get:
*          description: Get Expense Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Expense Details, only access by Accountant  
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/deleteexpense/{expensedetailsid}:
*       delete:
*          description: Delete Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: expensedetailsid
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/gettetransportfee/{expensedetailsid}:
*       get:
*          description: Get Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: expensedetailsid
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getstaffsalary:
*       get:
*          description: Get Staff Salary, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Staff Salary, only access by Accountant  
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /studentfeeservice/getstudenttransportfee/{studentId}:
*       get:
*          description: Get Student Transport Fee Details, only access by Accountant  
*          tags: [Accountant Service]
*          summary: Get Student Transport Fee Details, only access by Accountant  
*          parameters:
*              - in: path
*                name: studentId
*                required: true
*                schema:
*                  type: number
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*/
module.exports = router;