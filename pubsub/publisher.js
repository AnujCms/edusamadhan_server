const envVariable = require("../config/envValues.js")
const amqp = require('amqplib');



const rabbitmqConn = "amqp://" + envVariable.rabbitmq.username + ":" + envVariable.rabbitmq.password + "@" + envVariable.rabbitmq.host
//var open = require('amqplib').connect(connectionUrl);


//const EXCHANGE_NAME = "ISAGE_EXCHANGE";
//const EXCHANGE_TYPE = "direct";
const q = envVariable.rabbitmq.emailQueue;
const p = envVariable.rabbitmq.smsQueue;
const AuditQueue = envVariable.rabbitmq.auditQueue;
// Publisher

function Publisher() {

}

/**
* Creates the connection to RabbitMQ and assigns a message handler that 
* will publish the messages 
*/

Publisher.prototype.publishEmail = function (msg) {
    amqp.connect(rabbitmqConn).then(function (conn) {
        return conn.createConfirmChannel().then(function (ch) {
            var ok = ch.assertQueue(q, { durable: true });

            return ok.then(async function () {
                await ch.sendToQueue(q, Buffer.from(JSON.stringify(msg)));
                // logger.info("published : " + "type = " + msg.type +", routingkey = " + msg.routingKey);
                return ch.close();
            }); // Save msg to Database.
        }).finally(function () { conn.close(); });
    }).catch("not able to");
};

Publisher.prototype.publishSms = function (msg) {
    amqp.connect(rabbitmqConn).then(function (conn) {
        return conn.createConfirmChannel().then(function (ch) {
            var ok = ch.assertQueue(p, { durable: true });

            return ok.then(async function () {
                await ch.sendToQueue(p, Buffer.from(JSON.stringify(msg)));
                // logger.info("published : " + "OTP = " + msg.otp + ", type = " + msg.type +", routingkey = " + msg.routingKey);
                return ch.close();
            }); // Save msg to Database.
        }).finally(function () { conn.close(); });
    }).catch("not able to");
};

var publisher = new Publisher();

exports.publishEmailEventForCreateDirector = function (msg) {
    msg.type = "Welcome_Email_Director";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg);
}

exports.publishEmailEventForCreatePrincipal = function (msg) {
    msg.type = "Welcome_Email_Principal";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg);
}

exports.publishEmailEventForCreateStaff = function (msg) {
    msg.type = "Welcome_Email_Staff";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg);
}
exports.publishEmailEventForAssignClass = function(msg) {
    msg.type = "Assign_Class_Teacher";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.publishEmailEventForUnAssignClass = function(msg) {
    msg.type = "UnAssign_Class_Teacher";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.publishEmailEventForInactivateUser = function(msg) {
    msg.type = "Inactivate_User";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.publishEmailEventForReactivateUser = function(msg) {
    msg.type = "Reactivate_User";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.pubishEmailEventForForgotPassword = function(msg) {
    msg.type = "Forgot_Password";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.pubishEmailEventForResetPassword = function(msg) {
    msg.type = "Reset_Password";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.publishWelcomeSmsToStudent = function (msg) {
    msg.type = "Send_Welcome_Message";
    msg.routingKey = "Isage.OtpEvent";
    publisher.publishEmail(msg);
}

