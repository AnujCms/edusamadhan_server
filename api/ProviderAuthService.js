const app = require('express').Router();
const envVariable = require("../config/envValues.js");
const util = require('util');
const passwordHash = require('password-hash');
const passport = require('passport');
const ProviderDB = require("../database/ProviderDB");
const principalDB = require("../database/principalDB");
const crypto = require('crypto');
const UserEnum = require('../lookup/UserEnum');
const jwt = require('jsonwebtoken');
const uuidV4 = require('uuid/v4');
const AdminDB = require("../database/SuperAdminDB.js");
const adminDB = require('../database/AdminDB');
const publisher = require('../pubsub/publisher');
const encrypt = require("../utils/encrypt.js");
const joiSchema = require('../apiJoi/authservice.js');
const middleWare = require('../apiJoi/middleWare.js');
const generator = require('generate-password');
const { checkDirectorAndUserBelongsToSameAccount, checkPrincipalAndUserBelongsToSameAccount, checkTeacherAndStudentBelongsToSameAccount } = require('./ValidationFunctions');

let opts = {};
opts.secretOrKey = envVariable.sessionSecretForMobile;

const isValidUser = (req, res, next) => {
    if (req.user.role == UserEnum.UserRoles.Director || req.user.role === UserEnum.UserRoles.Principal || req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
const isTeacherOnly = (req, res, next) => {
    if (req.user.role === UserEnum.UserRoles.Teacher) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
const allAuthorizedUser = (req, res, next) => {
    if (req.user.role == UserEnum.UserRoles.SuperAdmin || req.user.role == UserEnum.UserRoles.Director || req.user.role == UserEnum.UserRoles.Principal || req.user.role == UserEnum.UserRoles.Manager || req.user.role == UserEnum.UserRoles.FeeAccount || req.user.role === UserEnum.UserRoles.Teacher || req.user.role === UserEnum.UserRoles.ExamHead || req.user.role === UserEnum.UserRoles.Student) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
const isUserHaveAcces = (req, res, next) => {
    if (req.user.role == UserEnum.UserRoles.Director) {
        checkDirectorAndUserBelongsToSameAccount(req, res, next);
    } else if (req.user.role == UserEnum.UserRoles.Principal) {
        checkPrincipalAndUserBelongsToSameAccount(req, res, next);
    } else if (req.user.role == UserEnum.UserRoles.Teacher) {
        checkTeacherAndStudentBelongsToSameAccount(req, res, next);
    } else if (req.user.role == UserEnum.UserRoles.SuperAdmin) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
const resetPassword = async (req, res, next) => {
    let result = await adminDB.checkPassword(req.user.userId)
    if (!passwordHash.verify(req.body.oldPassword, result.password)) {
        res.status(200).json({ status: 2, statusDescription: "Old password is not matching with entered password." })
    } else if (passwordHash.verify(req.body.newPassword, result.password)) {
        res.status(200).json({ status: 3, statusDescription: "New password can not be old password." })
    } else {
        next()
    }
}
const isFirstTimeUser = async (req, res, next) => {
    if (req.user.role == UserEnum.UserRoles.FirstTime) {
        next();
    } else {
        return res.status(403).json({ status: 0, statusDescription: "Not Authenticated user." });
    }
}
app.get('/getconfig', async (req, res) => {
    try {
        res.status(200).json({
            title: "svm",
            okButtonBackground: "#f57a4c",
            okButtonHover: "#a62e02",
            printDetail: "en_PrintDetails",
            primaryColor: "#ff6c00",
            secondaryColor: "#449d44",
            hoverPrimaryColor: "#f78028",
            loginBGImage: "bg-login.jpg",
            navbarImage: "logo-admin.png",
            loginLogo: "logo-login.png",
            favicon: "favicon.ico",
            thirdColor: "#ffffff",
            default: "#000",
            hoverPrimaryColor: "#f78028",
            hoverSecondaryColor: "#79d47a",
            hoverThirdColor: "#fff",
            textPrimaryColor: "#fff",
            textSecondaryColor: "#fff",
            textThirdColor: "#000",
            hoverTextPrimaryColor: "#fff",
            hoverTextSecondaryColor: "#fff",
            hoverTextThirdColor: "#000",
            primaryBorder: "#ff6c00",
            secondaryBorder: "#449d44",
            thirdBorder: "#000",
            hoverPrimaryBorder: "#f78028",
            hoverSecondaryBorder: "#79d47a",
            hoverThirdBorder: "#000",
            logbookFasting: "#FF6B28",
            logbookNonFasting: "#9B9B9B",
            logbookInsulin: "#00ACBE",
            bgcolor: "#FC5608",
            med1GraphStartColor: "#01F3B9",
            med1Color: "#04E1F9",
            med1GraphEndColor: "#04E1F9",
            profilePic: "doctor.png",
            viewcoworker: "#777777",
            minWidthMenu: "280px"
        })
    }
    catch (ex) {
        console.log(ex)
    }
})

app.post("/login", (req, res, next) => {
    try {
        req.assert('username', "Invalid UserName").notEmpty().withMessage("Please enter correct username");
        req.assert('password', "Invalid Password").notEmpty();
        let errors = req.validationErrors();
        if (errors) {
            res.json({ status: 0, error: util.inspect(errors) });
            return;
        }
        passport.authenticate('login', async (err, user) => {
            if (err) {
                return res.json({ status: 0, error: util.inspect(err) });
            }
            if (!user) {
                let result = await ProviderDB.wrongUserNameOrPassword(encrypt.computeHash(req.body.username.toLowerCase().trim()));
                let wrongCount = 5;
                if (result == "superAdmin") {
                    return res.json({ status: 0, warningmessage: "Usename or Password is wrong." });
                } else if (result == "wrongUserName") {
                    return res.json({ status: 0, warningmessage: "User is not registered in our system." });
                } else if (result >= 5) {
                    return res.json({ status: 0, warningmessage: "Your account has been locked due to wrong attempts. Contact your admin." });
                } else {
                    return res.json({ status: 0, warningmessage: `You have only ${wrongCount - result} attempts after that your account will be locked.` });
                }
            }
            else if (user == 2) {
                return res.json({ status: 2, warningmessage: "Your Account is BLOCKED. Please  Contact SuperAdmin, Cellnumber: 9648340892 or email: superadmin@gmail.com" });
            } else if (user == 3) {
                return res.json({ status: 3, warningmessage: "Your Admin is Inactivated you, If you have any issue then contact your Admin." });
            } else if (user === UserEnum.UserStatus.Locked) {
                return res.json({ status: 0, warningmessage: "Your account has been locked due to wrong attempts. Contact your admin." });
            }
            req.logIn(user, async (err) => {
                if (err) {
                    return next(err);
                }
                let userDetails = {
                    userId: req.user.userId, role: req.user.role, firstName: req.user.firstName, lastName: req.user.lastName,
                    accountId: req.user.accountId, configData: req.user.configData, accountName: req.user.accountName, mediumType: req.user.mediumType
                }
                let accessToken = jwt.sign({ user: userDetails }, opts.secretOrKey, { expiresIn: '1m' });
                let refreshTokenObj = {
                    userId: user.userId,
                    refreshToken: uuidV4(),
                    accessToken: accessToken
                };
                await ProviderDB.saveRefreshTokenForPortl(refreshTokenObj);
                await ProviderDB.successLogin(encrypt.computeHash(req.body.username.toLowerCase().trim()));
                if (req.user.role === UserEnum.UserRoles.FirstTime) {
                    return res.json({ status: 1, redirecturl: '/Private/change-password.html', userrole: getKeyByValue(UserEnum.UserRoles, req.user.role), firstName: req.user.firstName, lastName: req.user.lastName, accessToken: accessToken, refreshToken: refreshTokenObj.refreshToken });
                }
                else if (req.user.status == 1 || req.user.status == 11 || req.user.status == 12 || req.user.status == 13) {
                    return res.json({ status: 1, redirecturl: '/User/index.html', accountId: req.user.accountId, userrole: getKeyByValue(UserEnum.UserRoles, req.user.role), configData: req.user.configData, firstName: req.user.firstName, lastName: req.user.lastName, userId: req.user.userId, aadharNumber: req.user.aadharNumber, image: req.user.image, studentName: req.user.studentName, accessToken: accessToken, refreshToken: refreshTokenObj.refreshToken, accountName: req.user.accountName, userType: req.user.userType, entranceExamType: req.user.entranceExamType, mediumType: req.user.mediumType });
                }
            });
        })(req, res, next);
    } catch (ex) {
        console.log(ex)
        return res.json({ status: 0, statusDescription: "Something went wrong" })
    }
});

const changePassword = middleWare(joiSchema.changePassword, "body", true);
const userIdUserRoleObj = middleWare(joiSchema.userIdUserRoleObj, "body", true);
const isTokenValid = middleWare(joiSchema.isTokenValid, "body", true);
const validateEmail = middleWare(joiSchema.validateEmail, "body", true);
const userIdParams = middleWare(joiSchema.userIdParams, "params", true);
const isValidPassword = middleWare(joiSchema.isValidPassword, "body", true);

//Change own password by All Users
app.post("/changePasswordByUser", allAuthorizedUser, changePassword, resetPassword, async (req, res) => {
    let hashedpassword = {
        password: encrypt.getHashedPassword(req.body.newPassword)
    }
    let changepassword = await adminDB.changePassword(hashedpassword, req.user.userId)
    if (changepassword.changedRows) {
        res.status(200).json({ status: 1, statusDescription: "Password has been changes successfully." })
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to change the password." })
    }
});
//If Active User Forgot Password Can Reset
app.post("/forgotPassword", validateEmail, async (req, res) => {
    let lowerCaseEmailID = req.body.emailId.toLowerCase();
    let hashedEmailId = encrypt.computeHash(lowerCaseEmailID.trim());
    let r = await adminDB.getUserDetailsByEmailId(hashedEmailId)
    if (r.length > 0) {
        if (r[0].wrongPasswordCount >= 5) {
            return res.status(200).json({ status: 0, statusDescription: "Your account is already locked. You can not reset your password. Please contact your admin." });
        }
        if (r[0].status == 1) {
            let token = await getRandomToken();
            let date = new Date();
            date.setHours(date.getHours() + 1);
            let passwordchangeReqObj = {
                token: token,
                userId: r[0].userId,
                initiatedBy: r[0].userId,
                expireDatetime: date
            }
            await adminDB.createPasswordChangeRequest(passwordchangeReqObj)
            let resetpasswordurl = envVariable.resetpasswordurl;
            // send restlink password email
            let publishEvent = {
                emailId: encrypt.decrypt(r[0].emailId),
                userName: encrypt.decrypt(r[0].firstName) + " " + encrypt.decrypt(r[0].lastName),
                resetlink: resetpasswordurl + token,
                userId: r[0].userId,
            }
            console.log('publishEvent', publishEvent)
            publisher.pubishEmailEventForForgotPassword(publishEvent);
            return res.status(200).json({ status: 1, statusDescription: "Reset link ha been send to your registered EmailId." });
        } else {
            return res.status(200).json({ status: 0, statusDescription: "Only Active users can do the forgot passowrd." });
        }
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Email Id is not registered in this system." });
    }
});
//TO Unlock the Locked User Due to Entered wrong password
app.post("/unlockRequestToUser", allAuthorizedUser, userIdUserRoleObj, isUserHaveAcces, async (req, res) => {
    let result = await adminDB.getUserDetailsToUnlockUser(req.body.userId, req.body.userrole, UserEnum.UserStatus.Locked);
    if (result) {
        let token = await getRandomToken()
        let date = new Date();
        date.setHours(date.getHours() + 24);
        let passwordChangeReqObj = {
            token: token,
            userId: result.userId,
            initiatedBy: req.user.userId,
            expireDatetime: date
        }
        let publishEvent = {
            userId: result.userId,
            emailId: encrypt.decrypt(result.emailId),
            userName: encrypt.decrypt(result.firstName) + " " + encrypt.decrypt(result.lastName),
            resetLink: envVariable.resetPasswordUrl + token,
            "type": "Reset_Password",
            "routingKey": "EmailEvent"
        }
        console.log(publishEvent)
        let updateResult = await adminDB.updateStatusLockToUnlock(req.body.userId, req.body.userrole, UserEnum.UserStatus.Locked, UserEnum.UserStatus.UnLocked);
        let results = await adminDB.createPasswordChangeRequest(passwordChangeReqObj);
        if (updateResult == 1 && results) {
            publisher.pubishEmailEventForResetPassword(publishEvent);
            res.status(200).json({ "status": 1, statusDescription: "Reset Password email has been send Successfully" });
        } else {
            res.status(200).json({ "status": 0, statusDescription: "Not able to send reset email." });
        }
    } else {
        res.status(200).json({ "status": 0, statusDescription: "Not able to send reset email." });
    }
})
//TO Unlock the Locked Student Due to Entered wrong password
app.post("/unlockRequestToStudent", isTeacherOnly, userIdUserRoleObj, isUserHaveAcces, async (req, res) => {
    let result = await adminDB.getUserDetailsToUnlockUser(req.body.userId, req.body.userrole, UserEnum.UserStatus.Locked);
    console.log('result', result)
    if (result) {
        let password = encrypt.computeHash(result.aadharNumber);
        let updateResult = await adminDB.updateStudentStatusPassword(req.body.userId, req.body.userrole, UserEnum.UserStatus.Locked, UserEnum.UserStatus.UnLocked, password);
        if (updateResult == 1) {
            res.status(200).json({ "status": 1, statusDescription: "User has been unlocked Successfully" });
        } else {
            res.status(200).json({ "status": 0, statusDescription: "Not able to update the password." });
        }
    } else {
        res.status(200).json({ "status": 0, statusDescription: "Not able to update the password." });
    }
})
//Send Reset Password By Passing the Token
app.post("/resetPassword", allAuthorizedUser, isTokenValid, async (req, res) => {
    let result = await adminDB.getPasswordChangeRequestByToken(req.body.token, new Date());
    if (result.length > 0) {
        let updateObj = {
            password: encrypt.getHashedPassword(req.body.password),
            status: UserEnum.UserStatus.Active,
            wrongPasswordCount: 0
        }
        let changepassword = await adminDB.changePassword(updateObj, result[0].userId)
        if (changepassword) {
            await adminDB.deletePasswordChangeRequest(req.body.token, result[0].userId)
            res.status(200).json({ "status": 1, statusDescription: "Your passowrd has been changed Successfully." });
        } else {
            res.status(200).json({ "status": 0, statusDescription: "Not able to chnage your password." });
        }
    } else {
        res.status(200).json({ "status": 0, statusDescription: "Your token has been expired." });
    }
});
//Resend Welcome Email For Pending Users
app.post("/resendWelcomeEmail", isValidUser, userIdUserRoleObj, isUserHaveAcces, async (req, res) => {
    let password = generator.generate({ length: 10, numbers: true });
    let accountObj = {
        userId: req.body.userId,
        status: UserEnum.UserStatus.Pending,
        userrole: req.body.userrole,
        password: encrypt.getHashedPassword(password)
    }

    let updateResult = await adminDB.updateUserPassword(accountObj);
    if (updateResult == 1) {
        let userDetails = await adminDB.getDoctorDetails(accountObj);
        if (userDetails.length > 0) {
            let publishEvent = {
                "emailId": encrypt.decrypt(userDetails[0].emailId),
                "principalName": encrypt.decrypt(userDetails[0].firstName) + " " + encrypt.decrypt(userDetails[0].lastName),
                "schoolName": req.user.accountName,
                "tempPassword": password,
                "userRole": getKeyByValue(UserEnum.UserRoles, req.body.userrole)
            }
            console.log(publishEvent)
            if (req.user.role == UserEnum.UserRoles.SuperAdmin) {
                publisher.publishEmailEventForCreateDirector(publishEvent);
            } else if (req.user.role == UserEnum.UserRoles.Director) {
                publisher.publishEmailEventForCreatePrincipal(publishEvent);
            } else if (req.user.role == UserEnum.UserRoles.Principal) {
                publisher.publishEmailEventForCreateStaff(publishEvent);
            }
            res.status(200).json({ status: 1, statusDescription: "Welcome Email has been send successfully." });
        } else {
            res.status(200).json({ status: 0, statusDescription: "Not able to send wencome Email." });
        }
    } else {
        res.status(200).json({ status: 0, statusDescription: "Not able to send wencome Email." });
    }
})
//inactivate the user
app.put("/inactivateUser/:userId", isValidUser, userIdParams, isUserHaveAcces, async (req, res) => {
    let results = await ProviderDB.inactivateUser(UserEnum.UserStatus.Inactive, req.params.userId);
    if (results == 1) {
        let teacherDetails = await principalDB.getTeacherDetails(req.body.teacherId);
        if (teacherDetails.length > 0) {
            let publishEvent = {
                "emailId": encrypt.decrypt(teacherDetails[0].emailId),
                "staffName": encrypt.decrypt(teacherDetails[0].firstName),
                "schoolName": req.user.accountName,
                "userRole": teacherDetails[0].userrole
            }
            publisher.publishEmailEventForInactivateUser(publishEvent);
        }
        res.status(200).json({ status: 1, statusDescription: 'User has been inactivated successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to get the user details.' });
    }
});
//reactivate the user
app.put("/reactivateUser/:userId", isValidUser, userIdParams, isUserHaveAcces, async (req, res) => {
    let results = await ProviderDB.reactivateUser(UserEnum.UserStatus.Active, req.params.userId);
    if (results == 1) {
        let teacherDetails = await principalDB.getTeacherDetails(req.body.teacherId);
        if (teacherDetails.length > 0) {
            let publishEvent = {
                "emailId": encrypt.decrypt(teacherDetails[0].emailId),
                "staffName": encrypt.decrypt(teacherDetails[0].firstName),
                "schoolName": req.user.accountName,
                "userRole": teacherDetails[0].userrole
            }
            publisher.publishEmailEventForReactivateUser(publishEvent);
        }
        res.status(200).json({ status: 1, statusDescription: 'User has been Reactivated successfully.' });
    } else {
        res.status(200).json({ status: 0, statusDescription: 'Not able to Reactivate the user.' });
    }
});
//Frsttime Change Password
app.post("/firsttimeChangePassword", isFirstTimeUser, isValidPassword, async (req, res) => {
    let passwordObj = {
        password: passwordHash.generate(req.body.password),
        userId: req.user.userId,
        status: UserEnum.UserStatus.Active
    };
    let result = await AdminDB.changeDoctorPassword(passwordObj);
    if (result == 1) {
        await AdminDB.removeAccessTokenFromDB(req.user.userId)
        req.logout();
        return res.status(200).json(
            { status: 1, statusDescription: "Password updated successfully." }
        );
    } else {
        return res.status(200).json({ status: 0, statusDescription: "Sorry! Password not updated." });
    }
});
/**
* @swagger
* paths:
*     /providerauthservice/login:
*         post:
*             description: Login
*             tags: [Provider Auth Service]
*             summary: "User Login"
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 username:
*                                     type: string
*                                 password:
*                                     type: string
*                                     format: password
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*     /admin/signout:
*       get:
*          description: sign out
*          tags: [Provider Auth Service]
*          summary: sign out
*          responses:
*                   '200':
*                     description: Redirects to Login Page
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*     /admin/forgotPassword:
*         post:
*             description: Forgot password
*             tags: [Provider Auth Service]
*             summary: Forgot password
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 emailid:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*                                 example:
*                                    status: ''
*                                    statusDescription: ''
*     /admin/resetpassword:
*         post:
*             description: Reset password
*             tags: [Provider Auth Service]
*             summary: Reset password
*             requestBody:
*                 required: true
*                 content:
*                     application/x-www-form-urlencoded:
*                         schema:
*                             type: object
*                             properties:
*                                 token:
*                                     type: string
*                                 password:
*                                     type: string
*                                 cnfpassword:
*                                     type: string
*             responses:
*                 '200':
*                     description: Login
*                     content:
*                         application/json:
*                             schema:
*                                 type: object
*                                 example:
*                                    status: ''
*                                    statusDescription: ''
*/

app.post("/accessTokenByRefershToken", async function (req, res) {
    let refreshToken = req.body.refreshToken;
    let userDetails = await AdminDB.getUserIdByRefershToken(refreshToken);
    if (userDetails.length > 0) {
        let obj = userDetails[0];
        let user = {
            'email': encrypt.decrypt(obj.emailId),
            'hashedPassword': obj.password,
            'userId': obj.userId,
            'firstName': encrypt.decrypt(obj.firstName),
            'lastName': encrypt.decrypt(obj.lastName),
            'cellNumber': encrypt.decrypt(obj.cellNumber),
            'passwordchangecount': obj.passwordChangeCount,
            'userrole': obj.userrole,
            'status': obj.status,
            'aadharNumber': obj.aadharNumber,
            'image': obj.images        };
        if (obj.passwordchangecount === 0) {
            user.role = UserEnum.UserRoles.FirstTime; // user without password changed
        }

        let accessToken = jwt.sign({ user: user }, opts.secretOrKey, { expiresIn: '1m' });
        let refreshTokenObj = {
            userId: user.userId,
            refreshToken: uuidV4(),
            accessToken: accessToken
        };
        result = await AdminDB.updateRefreshTokenForPortl(refreshTokenObj, refreshToken);
        return res.status(200).send({ redirecturl: '/User/index.html', accountId: user.accountId, userrole: getKeyByValue(UserEnum.UserRoles, user.userrole),  firstName: user.firstName, lastName: user.lastName, userId: user.userId, aadharNumber: user.aadharNumber, image: user.image, studentname: user.studentname, accessToken: accessToken, refreshToken: refreshTokenObj.refreshToken });
    } else {
        return res.status(400).send({ redirecturl: 'error' });
    }
});

app.get("/signout", function (req, res) {
    req.logout();
    res.redirect('/Guest/login.html');
    return;
});

app.get("/isreachable", function (req, res) {
    res.status(200).end();
    return;
});


app.post("/log", function (req, res) {
    let providerid = req.user ? req.user.userid : 0,
        platform = req.body.platform || "WEB",
        errmsg = req.body.errmsg;
    errmsg.providerid = providerid;
    res.end();
});


function getRandomToken() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(20, function (err, buf) {
            let token = buf.toString('hex');
            if (err) {
                reject(err);
            } else {
                resolve(token)
            }
        })
    });
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
module.exports = app;
