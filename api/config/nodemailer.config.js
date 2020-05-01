const nodemailer = require('nodemailer');
let apiServer = {server: 'http://localhost:3000'};
// if (process.env.NODE_ENV === 'production') {apiServer.server = 'https://your-URL.com';}
const path = `${apiServer.server}/verify-account/`

let transporter = nodemailer.createTransport({
  host: "smtp.live.com",
  port: "25",
  secure: false,
  auth: {
    user: "daorhe2272@hotmail.com",
    pass: "bhkbhkej2272" // Make sure not to expose your password later on you idiot!
  }
});

const sendVerEmail = (req, res, verHash) => {
  const pug = require('pug');
  let htmlFile = pug.renderFile(process.cwd() + '/server/views/email.templates/validationEmail.pug', {firstName: req.body.firstName, verLink: path + verHash});
  transporter.sendMail({
    from: '"The Entrepreneurial Hub" <daorhe2272@hotmail.com>',
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

module.exports= {
  sendVerEmail
};
