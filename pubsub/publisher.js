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
    }).catch(logger.error);
};

var publisher = new Publisher();

exports.publishEmailEventForCreateStaff = function (msg) {
    msg.type = "Welcome_Email_Provider";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg);
}

exports.publishEmailEventForCreateSchool = function (msg) {
    msg.type = "Welcome_Email_Principal";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg);
}

exports.pubishEmailEventForResetPassword = function(msg) {
    msg.type = "Forgot_Password_Emailid";
    msg.routingKey = "Isage.SignupEvent";
    publisher.publishEmail(msg); 
}
exports.publishWelcomeSmsToStudent = function (msg) {
    msg.type = "Send_Welcome_Message";
    msg.routingKey = "Isage.OtpEvent";
    publisher.publishes(msg);
}

