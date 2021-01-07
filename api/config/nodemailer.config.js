const nodemailer = require('nodemailer');
const pug = require('pug');
require("dotenv").config();

let apiServer = {server: process.env.WEB_SERVER};

let transporter = nodemailer.createTransport({
  host: "smtp-mail.outlook.com",
  port: "587",
  secureConnection: false,
  auth: {
    user: "daorhe2272@hotmail.com",
    pass: process.env.EMAIL_PWD
  },
  tls: {ciphers: "SSLv3"}
});

const sendVerEmail = (req, res, verHash) => {
  const path = `${apiServer.server}/verify-account/`
  let htmlFile = pug.renderFile(process.cwd() + '/web/pages/email.templates/validationEmail.pug', {firstName: req.body.firstName, verLink: path + verHash});
  transporter.sendMail({
    from: '"idea-hub.net" <daorhe2272@hotmail.com>',
    to: req.body.email,
    subject: "Verify your account - Idea-Hub",
    text: "",
    html: htmlFile
  }, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message %s sent: %s", info.messageId, info.response); // Remove for production
  });
};

const sendResetEmail = (req, res, result) => {
  const path = `${apiServer.server}/request-reset/`
  let htmlFile = pug.renderFile(process.cwd() + '/web/pages/email.templates/resetPasswordEmail.pug', {firstName: result.firstName, verLink: path + result.verHash});
  transporter.sendMail({
    from: '"idea-hub.net" <daorhe2272@hotmail.com>',
    to: req.body.email,
    subject: "Password reset - Idea-Hub",
    text: "",
    html: htmlFile
  }, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message %s sent: %s", info.messageId, info.response); // Remove for production
  });
};

module.exports = {
  sendVerEmail,
  sendResetEmail
};
