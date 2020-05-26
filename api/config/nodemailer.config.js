const nodemailer = require('nodemailer');
const pug = require('pug');

let apiServer = {server: 'http://localhost:3000'};
// if (process.env.NODE_ENV === 'production') {apiServer.server = 'https://your-URL.com';}

let transporter = nodemailer.createTransport({
  host: "smtp.live.com",
  port: "25",
  secure: false,
  auth: {
    user: "daorhe2272@hotmail.com",
    pass: process.env.EMAIL_PWD
  }
});

const sendVerEmail = (req, res, verHash) => {
  const path = `${apiServer.server}/verify-account/`
  let htmlFile = pug.renderFile(process.cwd() + '/server/views/email.templates/validationEmail.pug', {firstName: req.body.firstName, verLink: path + verHash});
  transporter.sendMail({
    from: '"ehub.com" <daorhe2272@hotmail.com>',
    to: req.body.email,
    subject: "Verify your account - ehub",
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
  let htmlFile = pug.renderFile(process.cwd() + '/server/views/email.templates/resetPasswordEmail.pug', {firstName: result.firstName, verLink: path + result.verHash});
  transporter.sendMail({
    from: '"ehub.com" <daorhe2272@hotmail.com>',
    to: req.body.email,
    subject: "Password reset - ehub",
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
