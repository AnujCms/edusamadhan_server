const router = require('express').Router();
const teacherDB = require("../database/TeacherDB.js");
const UserEnum = require('../lookup/UserEnum');
const passwordHash = require('password-hash');
const joiSchema = require('../apiJoi/teacher.js');
const middleWare = require('../apiJoi/middleWare.js');

function isTeacherOrExamHead(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead ) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
function AllUsers(req, res, next) {
    if (req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead || req.user.role === UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.SuperAdmin || req.user.role === UserEnum.UserRoles.Student ) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
async function isTeacherStudentRelated(req,res,next){
    let result = await teacherDB.checkTeacherStudentRelation(req.params.studentid, req.user.accountid);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Student and Teacher are not belongs to same account." });
    }    
}
async function isTeacherStudentRelatedBody(req,res,next){
    let result = await teacherDB.checkTeacherStudentRelation(req.body.studentid, req.user.accountid);
    if(result){
        next();
    }else{ 
        return res.status(200).json({ status: 0, statusDescription: "Student and Teacher are not belongs to same account." });
    }    
}
const studentObject = middleWare(joiSchema.studentObject, "body", true);
const studentIdParams =  middleWare(joiSchema.studentIdParams, "params", true);
const adharNumberParams =  middleWare(joiSchema.adharNumberParams, "params", true);
const emailIdParams =  middleWare(joiSchema.emailIdParams, "params", true);
const studentCreateResult = middleWare(joiSchema.studentCreateResult, "body", true);
const studentCreateAttendance = middleWare(joiSchema.studentCreateAttendance, "body", false);
const studentIdBody =  middleWare(joiSchema.studentIdBody, "body", true);
const saveAttendanceObject =  middleWare(joiSchema.saveAttendanceObject, "body", true);
const saveResultObject =  middleWare(joiSchema.saveResultObject, "body", true);
const getResultObject =  middleWare(joiSchema.getResultObject, "params", true);
const attendanceArray = middleWare(joiSchema.attendanceArray, 'body', false);
const getAttendanceObj = middleWare(joiSchema.getAttendanceObj, "params", false);

//Student Registration
router.post("/studentRegistration", isTeacherOrExamHead, studentObject, async function (req, res) {
    let img = req.body.images;
    var image;
    if (img == null) {
        image = img
    } else if (img.length == 0) {
        image = null
    } else {
        image = img
    }
    if(req.body.images !== '' && req.body.images != null){
        var encryptimg =  image.replace(/^data:image\/[a-z]+;base64,/, "");
    }
    let studentObj = {
        firstname: encrypt.encrypt(req.body.firstname),
        lastname: encrypt.encrypt(req.body.lastname),
        mothername: req.body.mothername,
        fathername: req.body.fathername,
        cellnumber: encrypt.encrypt(req.body.cellnumber),
        username: encrypt.computeHash(req.body.adharnumber),
        password: encrypt.getHashedPassword(req.body.adharnumber),
        dob: encrypt.encrypt(req.body.dob),
        adharnumber: req.body.adharnumber,
        gender: req.body.gender,
        religion: req.body.religion,
        category: req.body.category,
        locality: req.body.locality,
        mediumType: req.body.mediumType,
        localaddress: req.body.localaddress,
        parmanentaddress: req.body.parmanentaddress,
        userid: req.user.userid,
        userrole: UserEnum.UserRoles.Student,
        status: UserEnum.UserStatus.Active,
        images: encryptimg,
        session:JSON.parse(req.user.configdata).session,
        busservice: req.body.busservice,
        route: req.body.route
    }
    let result = '';
    if(req.body.studentid){
        studentObj.studentid = req.body.studentid
        result = await teacherDB.updateStusentRecord(studentObj);
    }else{
        result = await teacherDB.saveStusentDetails(studentObj, req.user.userid, req.user.accountid);
    }
    if (result) {
        res.status(200).json({ status: 1, statusDescription: req.body.studentid?'Student has been updated successfully.':'Student has been created successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Your principal is not assigned you any class.' });
    }
});
// getting student information for update 
router.get("/updateStudentDetails/:studentid", isTeacherOrExamHead, studentIdParams, isTeacherStudentRelated, async function (req, res) {
    let result = await teacherDB.getStudentDetails(req.params.studentid, req.user.userid, JSON.parse(req.user.configdata).session);
        if (result.length > 0) {
            var resultObj = [];
            result.forEach(function (row) {
                resultObj.push({
                    userid: row.userid,
                    firstname: encrypt.decrypt(row.firstname),
                    lastname: encrypt.decrypt(row.lastname),
                    mothername: row.mothername,
                    fathername: row.fathername,
                    cellnumber: encrypt.decrypt(row.cellnumber),
                    adharnumber: row.adharnumber,
                    dob: encrypt.decrypt(row.dob),
                    gender: row.gender,
                    religion: row.religion,
                    category: row.category,
                    locality: row.locality,
                    locaddress: row.localaddress,
                    paraddress: row.parmanentaddress,
                    images: row.images,
                    busservice: row.busservice,
                    route: row.route
                });
            });
            res.status(200).json({ status: 1, statusDescription: resultObj });
        } else {
            res.status(200).json({ status: 0, statusDescription: 'Not able to get the data.' });
        }
    });
//get Students for teacher
router.get("/getmystudents", isTeacherOrExamHead, async function (req, res) {
    let result = await teacherDB.getAllStudents(req.user.userid, UserEnum.UserStatus.Active, JSON.parse(req.user.configdata).session);
    if (result.length > 0) {
        var resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                userid: row.userid,
                firstname: encrypt.decrypt(row.firstname),
                lastname: encrypt.decrypt(row.lastname),
                mothername: row.mothername,
                fathername: row.fathername,
                cellnumber: encrypt.decrypt(row.cellnumber),
                roll: row.rollnumber,
                adharnumber: row.adharnumber,
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                mediumType: row.mediumType,
                status: row.status,
                images:row.images,
                classid: row.classid,
                section: row.section,
                busservice: row.busservice
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the students.' });
    }
});

//get Inactivated Students for teacher
router.get("/getmyinactivatedstudents", isTeacherOrExamHead, async function (req, res) {
    let result = await teacherDB.getAllInactivatedStudents(req.user.userid, UserEnum.UserStatus.Inactive, JSON.parse(req.user.configdata).session);
    if (result.length > 0) {
        var resultObj = [];
        result.forEach(function (row) {
            resultObj.push({
                userid: row.userid,
                firstname: encrypt.decrypt(row.firstname),
                lastname: encrypt.decrypt(row.lastname),
                mothername: row.mothername,
                fathername: row.fathername,
                cellnumber: encrypt.decrypt(row.cellnumber),
                roll: row.rollnumber,
                adharnumber: row.adharnumber,
                dob: encrypt.decrypt(row.dob),
                gender: row.gender,
                religion: row.religion,
                category: row.category,
                locality: row.locality,
                status: row.status,
                images:row.images
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'No Inactivate Student fount of this class.' });
    }
});

//check adharnumber
router.get("/getAdharnumber/:adharnumber", async function(req, res){
let result = await teacherDB.checkAddhar(req.params.adharnumber);
if(result){
    res.status(200).json({ "isAdharNumberUsed": true });
}else{
    res.status(200).json({ "isAdharNumberUsed": false });
}
})

//check emailid 
router.get("/getEmailId/:emailid", async function(req, res){
    let result = await teacherDB.checkEmailId(encrypt.encrypt(req.params.emailid));
    if(result){
        res.status(200).json({ "isEmailIdUsed": true });
    }else{
        res.status(200).json({ "isEmailIdUsed": false });
    }
})

//get config details(Delete)
router.get("/:teacherid/getconfigdetails", async function (req, res) {
       let result = await teacherDB.getconfigdetailsByAllUsers(req.params.teacherid);
    if (result.length > 0) {
        let configData = JSON.parse(result[0].configdata);
        res.status(200).json({ status: 1, statusDescription: configData });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'There is no config.' });
    }
})
//get assign subjects
router.get("/assignsubjects", isTeacherOrExamHead, async function (req, res) {
    let result = await teacherDB.getAssignSubjectToClass(req.user.userid, req.user.accountid);
    if (result.length > 0) {
        res.status(200).json({ status: 1, statusDescription: JSON.parse(result[0].subjects) });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Principal is not assigned subjects for this class.' });
    }
})
//Save Student Result
router.post("/studentResult", isTeacherOrExamHead, isTeacherStudentRelatedBody, studentCreateResult, async function (req, res) {
    var result;
    switch (req.body.subjectid) {
        case 1: result = { hindi: JSON.stringify([{totalMarks:req.body.totalMarks, obtainMarks:req.body.obtainMarks }])}
            break;
        case 2: result = { english: JSON.stringify([{totalMarks:req.body.totalMarks, obtainMarks: req.body.obtainMarks }])};
            break;
        case 3: result = { mathematics: JSON.stringify([{totalMarks:req.body.totalMarks, obtainMarks: req.body.obtainMarks }])};
            break;
        case 4: result = { science:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }])};
            break;
        case 5: result = { socialscience:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks}]) };
            break;
        case 6: result = { geography:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks}]) };
            break;
        case 7: result = { physics:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks}]) };
            break;
        case 8: result = { chemistry:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks}]) };
            break;
        case 9: result = { biology:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks}]) };
            break;
        case 10: result = { moralscience:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks}]) };
            break;
        case 11: result = { drawing:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }])};
            break;
        case 12: result = { computer:JSON.stringify([{totalMarks: req.body.totalMarks, obtainMarks: req.body.obtainMarks }])};
            break;
        default:
            break;
    }
    result.teacherid = req.user.userid,
    result.studentid = req.body.studentid
    result.examinationtype = req.body.examinationtype
let results = await teacherDB.saveStusentResult(result, JSON.parse(req.user.configdata).session);
    if (results) {
        res.status(200).json({ status: 1, statusDescription: "Student result has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save student result" });
    }
});
//Save Student Attendance by class teacher
router.post("/studentAttendance", isTeacherOrExamHead, isTeacherStudentRelatedBody, studentCreateAttendance, async function (req, res) {
    var result;
    switch (req.body.monthName) {
        case 1: result = { january: req.body.monthName, jtd: req.body.totalClasses, jpd: req.body.presentClasses };
            break;
        case 2: result = { february: req.body.monthName, ftd: req.body.totalClasses, fpd: req.body.presentClasses };
            break;
        case 3: result = { march: req.body.monthName, mtd: req.body.totalClasses, mpd: req.body.presentClasses };
            break;
        case 4: result = { april: req.body.monthName, atd: req.body.totalClasses, apd: req.body.presentClasses };
            break;
        case 5: result = { may: req.body.monthName, matd: req.body.totalClasses, mapd: req.body.presentClasses };
            break;
        case 6: result = { june: req.body.monthName, juntd: req.body.totalClasses, junpd: req.body.presentClasses };
            break;
        case 7: result = { july: req.body.monthName, jultd: req.body.totalClasses, julpd: req.body.presentClasses };
            break;
        case 8: result = { august: req.body.monthName, autd: req.body.totalClasses, aupd: req.body.presentClasses };
            break;
        case 9: result = { september: req.body.monthName, std: req.body.totalClasses, spd: req.body.presentClasses };
            break;
        case 10: result = { october: req.body.monthName, otd: req.body.totalClasses, opd: req.body.presentClasses };
            break;
        case 11: result = { november: req.body.monthName, ntd: req.body.totalClasses, npd: req.body.presentClasses };
            break;
        case 12: result = { december: req.body.monthName, dtd: req.body.totalClasses, dpd: req.body.presentClasses };
            break;
        default:
            break;
    }
    result.teacherid = req.user.userid,
        result.studentid = req.body.studentid
    let attendance = await teacherDB.saveStusentAttendance(result, JSON.parse(req.user.configdata).session);
    if (attendance) {
        res.status(200).json({ status: 1, statusDescription: "Student attendance has been submitted successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to save student attendance" });
    }
});
//get Student fee details for Teacher
router.get("/getfeedetailsforteacher", async function (req, res) {
    let result = await teacherDB.getFeeDetailsForTeacher(req.user.userid, JSON.parse(req.user.configdata).session, req.user.accountid);
    if (result) {
        var studentObj = [];
        var a = result.feeStructure[0];
        setRoute = (value) =>{
            let fee
            result.transport.map((item)=>{
                if(value == item.transportfeeid){
                    fee = item.fee
                }
            })
            return fee;
        }

        var feeSum = parseInt(a.january) + a.february + a.march + a.april + a.may + a.june + a.july + a.august + a.september + a.october + a.november + a.december;
        result.student.map((item)=>{
            studentObj.push({
                name: encrypt.decrypt(item.firstname) + " " + encrypt.decrypt(item.lastname),
                totalFee: feeSum,
                busservice: item.busservice,
                images: item.images,
                studentid: item.studentid,
                adharnumber: item.adharnumber,
                transportFee: item.busservice == 2?setRoute(item.route):0
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
})
//get Student Result All
router.get("/getstudentsresult", isTeacherOrExamHead, async function (req, res) {
    let result = await teacherDB.getStudentsResult(req.user.userid);
    if (result.length > 0) {
        var resultObj = []
        result.forEach(function (row) {
            resultObj.push({
                studentid: row.studentid,
                hindi: row.hindi,
                hindiobtainmarks: row.hindiobtainmarks,
                english: row.english,
                englishobtainmarks: row.englishobtainmarks,
                math: row.math,
                mathobtainmarks: row.mathobtainmarks,
                science: row.science,
                scienceobtainmarks: row.scienceobtainmarks,
                history: row.history,
                historyobtainmarks: row.historyobtainmarks,
                physics: row.physics,
                physcisobtainmarks: row.physcisobtainmarks,
                chemistry: row.chemistry,
                chemistryobtainmarks: row.chemistryobtainmarks
            })
        })
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result details." });
    }
})
//get Attendance of all students
router.get("/getstudentsattendance", isTeacherOrExamHead, async function (req, res) {
    let results = await teacherDB.getAllStudentsAttendance(req.user.userid);
    if (results.length > 0) {
        var resultObj = [];
        results.forEach(function (result) {
            resultObj.push({
                studentid: result.studentid,
                january: result.january,
                jtd: result.jtd,
                jpd: result.jpd,
                february: result.february,
                ftd: result.ftd,
                fpd: result.fpd,
                march: result.march,
                mtd: result.mtd,
                mpd: result.mpd,
                april: result.april,
                atd: result.atd,
                apd: result.apd,
                may: result.may,
                matd: result.matd,
                mapd: result.mapd,
                june: result.june,
                juntd: result.juntd,
                junpd: result.junpd,
                july: result.july,
                jultd: result.jultd,
                julpd: result.julpd,
                august: result.august,
                autd: result.autd,
                aupd: result.aupd,
                september: result.september,
                std: result.std,
                spd: result.spd,
                october: result.october,
                otd: result.otd,
                opd: result.opd,
                november: result.november,
                ntd: result.ntd,
                npd: result.npd,
                december: result.december,
                dtd: result.dtd,
                dpd: result.dpd
            });
        });
        res.status(200).json({ status: 1, statusDescription: resultObj });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the attendance' });
    }
})
//get teacher Details
router.get("/getTeacherDetails", AllUsers, async (req, res) => {
    let result = await teacherDB.getTeacherDetails(req.user.userid);
    if (result.length > 0) {
        var resultObj = {
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            cellnumber: encrypt.decrypt(result[0].cellnumber),
            emailid: encrypt.decrypt(result[0].emailid),
            dob: result[0].dob,
            parmanentaddress: result[0].parmanentaddress,
            localaddress: result[0].localaddress,
            qualification: result[0].qualification,
            class: result[0].classid,
            section: result[0].section,
            image: result[0].images
        };
        res.status(200).json({ status: 1, statusDescription: resultObj })
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the Teacher details." });
    }
})
//Update teacher profile
router.post("/updateProfileDetails", AllUsers, async (req, res) => {
    let changePassword = req.body.changePassword,
        oldPassword = req.body.oldPassword,
        newPassword = req.body.newPassword;
    let img = req.body.image;
    if (newPassword != undefined || newPassword != null) {
        var hashedpassword = passwordHash.generate(newPassword);
    }
    var image;

    if (img == null) {
        image = img
    } else if (img.length == 0) {
        image = null
    } else {
        image = img
    }
    if (image == null) {
        let result = await teacherDB.updateOnboardDetails(image, req.user.userid)
        if (result.affectedRows == 1) {
            if (changePassword) {
                let result = await teacherDB.checkpassword(req.user.userid);
                if (!passwordHash.verify(oldPassword, result.password)) {
                    res.status(200).json({ status: 2, statusDescription: 'current password did not match' })
                } else {
                    let changepassword = await teacherDB.changePassword(hashedpassword, req.user.userid)
                    if (changepassword.affectedRows == 1) {
                        res.status(200).json({ status: 1, statusDescription: "Password updated successfully." })
                    } else {
                        return res.status(200).json({ status: 0, statusDescription: "Unable to update the password." });
                    }
                }
            }
            else {
                res.status(200).json({ status: 1, statusDescription: "successfully saved the record." })
            }

            if (firstname == checkemail[0].firstname && lastname == checkemail[0].lastname) {
                return
            }
        } else {
            return res.status(200).json({ status: 0, statusDescription: "Not able to update record." });
        }
    } else {
        let encryptimg = img.replace(/^data:image\/[a-z]+;base64,/, "");
        let result = await teacherDB.updateOnboardDetails(encryptimg, req.user.userid)

        if (result.affectedRows == 1) {
            if (changePassword) {
                let result = await teacherDB.checkpassword(req.user.userid);
                if (!passwordHash.verify(oldPassword, result.password)) {
                    res.status(200).json({ status: 2, statusDescription: 'current password did not match' })
                } else {
                    let changepassword = await teacherDB.changePassword(hashedpassword, req.user.userid)
                    if (changepassword.affectedRows == 1) {
                        res.status(200).json({ status: 1, statusDescription: "Password has been successfully saved." })
                    } else {
                        return res.status(200).json({ status: 0, statusDescription: "Not able to save the password." });
                    }
                }
            }
            else {
                res.status(200).json({ status: 1, statusDescription: "Record has been saved." })
            }
        } else {
            return res.status(200).json({ status: 0, statusDescription: "Not able to save the record." });
        }
    }
})
//Inactivate student by class teacher
router.post('/inactivatestudent', isTeacherOrExamHead, studentIdBody, isTeacherStudentRelatedBody, async function (req, res) {
    let result = await teacherDB.inactivateStudent(req.body.studentid, UserEnum.UserStatus.Inactive, UserEnum.UserRoles.Student);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student has been inactivated successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Student is not inactivated." });
    }
});
//Inactivate student by class teacher
router.post('/reactivatestudent', isTeacherOrExamHead, studentIdBody, isTeacherStudentRelatedBody, async function (req, res) {
    let result = await teacherDB.reactivateStudent(req.body.studentid, UserEnum.StudentStatusEnum.active, UserEnum.UserRoles.Student);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Student has been activated successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Student is not Reactivated." });
    }
});

//get student Registration print details
router.get("/getstudentregistrationdetails/:adharnumber", isTeacherOrExamHead, adharNumberParams, async function (req, res) {
let result = await teacherDB.getStudentRegistrationDetails(req.params.adharnumber, JSON.parse(req.user.configdata).session, req.user.accountid);
    if(result.studentData.length>0){
        let freePrintData = {
            schoolName:result.school[0].accountname,
            schoolNumber:result.school[0].accountrefnumber,
            schoolAddress: result.school[0].accountaddress,
            studentName: encrypt.decrypt(result.studentData[0].firstname) +" " +encrypt.decrypt(result.studentData[0].lastname),
            adharNumber: result.studentData[0].adharnumber,
            cellNumber:encrypt.decrypt(result.studentData[0].cellnumber),
            dob:encrypt.decrypt(result.studentData[0].dob),
            motherName: result.studentData[0].mothername,
            fatherName: result.studentData[0].fathername,
            class: result.studentData[0].classid,
            section: result.studentData[0].section,
            gender: result.studentData[0].gender,
            religion: result.studentData[0].religion,
            category: result.studentData[0].category,
            locality: result.studentData[0].locality,
            localAddress: result.studentData[0].localaddress,
            parmanentAddress: result.studentData[0].parmanentaddress
        }
    res.status(200).json({ status: 1, statusDescription: freePrintData});
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the data." });
    }
})

//save attendance student by class teacher
router.post('/savedailyattendance',isTeacherOrExamHead, saveAttendanceObject, async function (req, res) {
    let attendanceObj = [];
    for(let i=0;i<req.body.length;i++){
        attendanceObj.push({
            accountid: req.user.accountid,
            teacherid: req.user.userid,
            studentid: req.body[i].studentId,
            classid: req.body[i].classid,
            section: req.body[i].section,
            session: JSON.parse(req.user.configdata).session,
        })
    }
    let result = await teacherDB.saveDailyAttendance(attendanceObj);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Attendance has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Attendance is not saved." });
    }
});

//get student attendance
router.get('/getdailyattendance', async function (req, res) {
    let result = await teacherDB.getDailyAttendance(req.user.accountid, req.user.userid, JSON.parse(req.user.configdata).session );
    if (result) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Student is not Reactivated." });
    }
});

//save exam result of student
router.post('/savestudentresult',isTeacherOrExamHead, saveResultObject, async function (req, res) {
    let resultObject = {
        studentid: req.body.studentid,
        teacherid: req.user.userid,
        examinationtype: req.body.examinationType,
        session: JSON.parse(req.user.configdata).session,
        subjectResultArray: JSON.stringify(req.body.subjectResultArray)
    }

    let result = await teacherDB.saveStudentResult(resultObject);
    if (result == 1) {
        res.status(200).json({ status: 1, statusDescription: "Result has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Result is not saved." });
    }
});

//get exam result of student
router.get('/getstudentresult/:studentid/:examinationType',isTeacherOrExamHead, getResultObject,  async function (req, res) {
    let resultObject = {
        studentid: req.params.studentid,
        teacherid: req.user.userid,
        examinationtype: req.params.examinationType,
        session: JSON.parse(req.user.configdata).session
    }

    let result = await teacherDB.getStudentResult(resultObject);
    if (result.length>0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result." });
    }
});

//save exam result of student
router.post('/savestudentAttendance',isTeacherOrExamHead, attendanceArray, async function (req, res) {
   let attendanceArray = []
   req.body.attendanceArray.map((item)=>{
       let array =[]
       array.push(item.studentId)
       array.push(req.user.userid)
       array.push(JSON.parse(req.user.configdata).session)
       array.push(item.attendanceDate)
       array.push(item.attendance)
       attendanceArray.push(array)
   })
    let result = await teacherDB.saveStudentAttendance(attendanceArray);
    if (result) {
        res.status(200).json({ status: 1, statusDescription: "Attendance has been saved successfully." });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Attendance is not saved." });
    }
});

//get class attendance by date
router.get('/getClassAttendanceOfDate/:attendanceDate',isTeacherOrExamHead,  async function (req, res) {
    let attendanceObj = {
        teacherId: req.user.userid,
        attendanceDate: req.params.attendanceDate,
        session: JSON.parse(req.user.configdata).session
    }
    let result = await teacherDB.getClassAttendanceOfDate(attendanceObj);
    if (result.length>0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the result." });
    }
});

//get class attendance of time period
router.get('/getClassAttendanceOfSelecteddates/:startDate/:endDate',isTeacherOrExamHead, getAttendanceObj, async function (req, res) {
    let attendanceObj = {
        teacherId: req.user.userid,
        startDate: req.params.startDate,
        endDate: req.params.endDate,
        session: JSON.parse(req.user.configdata).session
    }
    let result = await teacherDB.getClassAttendanceOfSelecteddates(attendanceObj);
    if (result.length>0) {
        res.status(200).json({ status: 1, statusDescription: result });
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to get the attendance." });
    }
});
/**
* @swagger
* paths:
*     /teacherservice/studentRegistration:
*         post:
*             description: Regisster Student 
*             tags: [Faculty Service]
*             summary: "Register Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 firstname:
*                                     type: string
*                                 lastname:
*                                     type: string
*                                 mothername:
*                                     type: string
*                                 fathername:
*                                     type: string
*                                 cellnumber:
*                                     type: string
*                                 adharnumber:
*                                     type: string
*                                 dob:
*                                     type: string
*                                 gender:
*                                     type: number
*                                 religion:
*                                     type: number
*                                 category:
*                                     type: number
*                                 locality:
*                                     type: string
*                                 parmanentaddress:
*                                     type: string
*                                 localaddress:
*                                     type: string
*                                 busservice:
*                                     type: number
*                                 route: 
*                                     type: number
*                                 images:
*                                     type: string
*                                 studentid:
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
*     /teacherservice/updateStudentDetails/{studentid}:
*       get:
*          description: Get Student Details, only access by Class Teacher  
*          tags: [Faculty Service]
*          summary: Get Student Details for Edit, only access by Class Teacher  
*          parameters:
*              - in: path
*                name: studentid
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
*     /teacherservice/getmystudents:
*      get:
*          description: Get All Students List Of Class, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Details, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   userid: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   mothername: ''
*                                   fathername: ''
*                                   cellnumber: ''
*                                   adharnumber: ''
*                                   dob: ''
*                                   gender: ''
*                                   religion: ''
*                                   category: ''
*                                   locality: ''
*                                   parmanentaddress: ''
*                                   localaddress: ''
*                                   busservice: ''
*                                   route: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /teacherservice/getmyinactivatedstudents:
*      get:
*          description: Get Inactivated Students List Of Class, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Inactivated students, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   userid: ''
*                                   firstname: ''
*                                   lastname: ''
*                                   mothername: ''
*                                   fathername: ''
*                                   cellnumber: ''
*                                   adharnumber: ''
*                                   dob: ''
*                                   gender: ''
*                                   religion: ''
*                                   category: ''
*                                   locality: ''
*                                   parmanentaddress: ''
*                                   localaddress: ''
*                                   busservice: ''
*                                   route: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /teacherservice/getAdharnumber/{adharnumber}:
*       get:
*          description: Verify the AAdhar Number 
*          tags: [Faculty Service]
*          summary: Verify the AAdhar Number  
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
*     /teacherservice/getEmailId/{emailid}:
*       get:
*          description: Verify the emailid 
*          tags: [Faculty Service]
*          summary: Verify the emailid  
*          parameters:
*              - in: path
*                name: emailid
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
*     /teacherservice/assignsubjects:
*       get:
*          description: Get Assign Subjects
*          tags: [Faculty Service]
*          summary: Get Assign Subjects 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/studentResult:
*         post:
*             description: Student Result 
*             tags: [Faculty Service]
*             summary: "Craete Student Result, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentid:
*                                     type: number
*                                 subjectid:
*                                     type: number
*                                 totalMarks:
*                                     type: number
*                                 obtainMarks:
*                                     type: number
*                                 examinationtype:
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
*     /teacherservice/studentAttendance:
*         post:
*             description: Student Result 
*             tags: [Faculty Service]
*             summary: "Craete Student Result, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentid:
*                                     type: number
*                                 monthName:
*                                     type: number
*                                 totalClasses:
*                                     type: number
*                                 presentClasses:
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
*     /teacherservice/getfeedetailsforteacher:
*       get:
*          description: Get Fee Details
*          tags: [Faculty Service]
*          summary: Get Fee Details for Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/getstudentsresult:
*      get:
*          description: Get Student Result, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Result, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/getstudentsattendance:
*      get:
*          description: Get Student Attendance, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Attendance, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*          security:
*                - LoginSecurity: []
*     /teacherservice/getTeacherDetails:
*      get:
*          description: Get Student Attendance, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Students Attendance, only access by Class Teacher 
*          responses:
*                200:
*                   description: success
*                   content:
*                        application/json:
*                            schema:
*                                type: object
*                                example:
*                                   firstname: ''
*                                   lastname: ''
*                                   emailid: ''
*                                   dob: ''
*                                   cellnumber: ''
*                                   localaddress: ''
*                                   parmanentaddress: ''
*                                   qualification: ''
*                                   classid: ''
*                                   section: ''
*                                   images: ''
*          security:
*                - LoginSecurity: []
*     /teacherservice/inactivatestudent:
*         post:
*             description: Inactivate Student
*             tags: [Faculty Service]
*             summary: "Inactivate Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentid:
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
*     /teacherservice/reactivatestudent:
*         post:
*             description: Reactivate Student
*             tags: [Faculty Service]
*             summary: "Reactivate Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 studentid:
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
*     /teacherservice/getStudentRegistrationDetails/{adharnumber}:
*      get:
*          description: Get Student Registration Details, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Student Registration Details, only access by Class Teacher 
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
*     /teacherservice/savedailyattendance:
*         post:
*             description: Reactivate Student
*             tags: [Faculty Service]
*             summary: "Reactivate Student, only accessed by Teacher"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 accountid:
*                                     type: string
*                                 userid:
*                                     type: number
*                                 studentId:
*                                     type: number
*                                 classid:
*                                     type: number
*                                 section:
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
*     /teacherservice/getdailyattendance:
*      get:
*          description: Get Daily Attendance, only access by Class Teacher 
*          tags: [Faculty Service]
*          summary: Get Daily Attendance, only access by Class Teacher 
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