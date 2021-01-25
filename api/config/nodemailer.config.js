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

let contactTransporter = nodemailer.createTransport({
  host: "mail.idea-hub.net",
  port: "465",
  secureConnection: true,
  auth: {
    user: "contact@idea-hub.net",
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

const sendContactInfoMessage = (req, res) => {
  contactTransporter.sendMail({
    from: req.body.email,
    to: "contact@idea-hub.net",
    subject: req.body.subject,
    text: `The following messaged from ${req.body.firstName} ${req.body.lastName} was sent on ${new Date()}:\n\n${req.body.message}\n\n`
  }, (error, info) => {
    if (error) {
      logger.logError(`In sendContactInfoMessage: ${JSON.stringify(error)}`);
      console.log(error);
      return res.status(400).json({});
    } else {
      res.status(200).json({});
      infoTransporter.sendMail({
        from: '"idea-hub.net" <info@idea-hub.net>',
        to: req.body.email,
        subject: "RE: " + req.body.subject,
        text: `The following message from ${req.body.firstName} ${req.body.lastName} was received today:\n\n${req.body.message}\n\nWe will read your message as soon as possible and get back to you if necessary.\n*idea-hub.net customer service`
      }, (error, info) => {
        if (error) {
          logger.logError(`Failed to send confirmation message to ${req.body.firstName} ${req.body.lastName} at ${req.body.email}`);
          console.log(error);
        }
      });
    }
  });
}

module.exports = {
  sendVerEmail,
  sendResetEmail,
  sendContactInfoMessage
};
