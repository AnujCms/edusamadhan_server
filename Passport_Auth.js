const passwordHash = require('password-hash');
const encrypt = require("./utils/encrypt.js");
const AdminDB = require("./database/AdminDB");
const UserEnum = require('./lookup/UserEnum');
const envVariable = require("./config/envValues.js");
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy,
    secretOrKey = envVariable.sessionSecretForMobile;

function configLocalAuth(passport) {
    let LocalStrategy = require('passport-local').Strategy;
    passport.serializeUser(function (user, done) {
        done(null, {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            accountId: user.accountId,
            configData: user.configData,
            accountName: user.accountName,
            userType: user.userType,
            entranceExamType: user.entranceExamType
        });
    });

    passport.deserializeUser(function (userObjFromSession, done) {
        done(null, userObjFromSession);
    });

    passport.use('login',
        new LocalStrategy({
            passReqToCallback: true
        },
            async function (req, username, password, done) {
                try {
                    let hashedEmail = encrypt.computeHash(username);
                    let result = await AdminDB.getUserDetailsForUserName(hashedEmail);
                    if (result === undefined) {
                        return done(null, false);
                    } else {
                        let obj = result[0];
                        let user = {
                            'emailId': encrypt.decrypt(obj.emailId),
                            'hashedPassword': obj.password,
                            'userId': obj.userId,
                            'firstName': encrypt.decrypt(obj.firstName),
                            'lastName': encrypt.decrypt(obj.lastName),
                            'cellNumber': encrypt.decrypt(obj.cellNumber),
                            'wrongPasswordCount': obj.wrongPasswordCount,
                            'passwordChangeCount': obj.passwordChangeCount,
                            'userrole': obj.userrole,
                            'status': obj.status,
                            'aadharNumber': encrypt.decrypt(obj.aadharNumber),
                            'image': obj.images,
                            "userType": obj.userType,
                            "entranceExamType": obj.entranceExamType,
                            "accountId": obj.userrole && obj.accountId,
                            "mediumType": obj.mediumType
                        };
                        //verify the passowrd
                        if (!passwordHash.verify(password, user.hashedPassword)) {
                            return done(null, false);
                        }
                        if (obj.userrole !== 1) {
                            user.configData = obj.configData.configData,
                                user.accountId = obj.configData.accountId,
                                user.accountName = encrypt.decrypt(obj.configData.accountName)
                            if (obj.configData.accountStatus == UserEnum.AccountStatus.Locked) {
                                return done(null, UserEnum.AccountStatus.Locked);
                            }
                            if(obj.status == UserEnum.UserStatus.Locked){
                                return done(null, UserEnum.UserStatus.Locked);
                            }
                        }
                        if (obj.userrole == 3 || obj.userrole == 4 || obj.userrole == 5 || obj.userrole == 6 || obj.userrole == 7 || obj.userrole == 9 || obj.userrole == 8 || obj.userrole == 11 || obj.userrole == 12) {
                            user.studentname = encrypt.decrypt(obj.firstname) + " " + encrypt.decrypt(obj.lastnNme);
                            user.firstname = encrypt.decrypt(obj.firstName)
                            user.lastname = encrypt.decrypt(obj.lastName)
                        }

                        if (user.passwordChangeCount === null || user.passwordChangeCount === 0) {
                            user.role = UserEnum.UserRoles.FirstTime; // user without password changed
                        } else {
                            user.role = user.userrole;
                        }

                        if (user.status === 1 || user.status === 0 || user.status === 11 || user.status === 12 || user.status == 3 || user.status == 13) {
                            return done(null, user);
                        } else if (user.status === 2) {
                            return done(null, 3);
                        } else {
                            return done(null, false);
                        }
                    }

                } catch (ex) {
                    console.log(ex)
                    return done(ex, false);
                }
            }));
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromHeader('x-access-token');
    opts.secretOrKey = secretOrKey;

    passport.use('nonPatientJWT', new JwtStrategy(opts, function (jwt_payload, done) {
        done(null, jwt_payload.user);
    }));

}
module.exports = configLocalAuth;