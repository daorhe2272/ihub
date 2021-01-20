const nodemailer = require("nodemailer");
const logger = require("./logger.config");
const pug = require('pug');
require("dotenv").config();

let apiServer = {server: process.env.WEB_SERVER};

let infoTransporter = nodemailer.createTransport({
  host: "mail.idea-hub.net",
  port: "465",
  secureConnection: true,
  auth: {
    user: "info@idea-hub.net",
    pass: process.env.MAIL_INFO_PWD
  }
});

const sendVerEmail = (req, res, verHash) => {
  const path = `${apiServer.server}/verify-account/`
  let htmlFile = pug.renderFile(process.cwd() + '/web/pages/email.templates/validationEmail.pug', {firstName: req.body.firstName, verLink: path + verHash});
  infoTransporter.sendMail({
    from: '"idea-hub.net" <info@idea-hub.net',
    to: req.body.email,
    subject: "Verify your account",
    text: "",
    html: htmlFile
  }, (error, info) => {
    if (error) {
      logger.logError(`In sendVerEmail: ${JSON.stringify(error)}`);
      return console.log(error);
    }
  });
};

const sendResetEmail = (req, res, result) => {
  const path = `${apiServer.server}/request-reset/`
  let htmlFile = pug.renderFile(process.cwd() + '/web/pages/email.templates/resetPasswordEmail.pug', {firstName: result.firstName, verLink: path + result.verHash});
  infoTransporter.sendMail({
    from: '"idea-hub.net" <info@idea-hub.net>',
    to: req.body.email,
    subject: "Password reset",
    text: "",
    html: htmlFile
  }, (error, info) => {
    if (error) {
      logger.logError(`In sendResetEmail: ${JSON.stringify(error)}`);
      return console.log(error);
    }
  });
};

module.exports = {
  sendVerEmail,
  sendResetEmail
};
