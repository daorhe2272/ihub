const fs = require('fs');
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const nodeMailer = require('../config/nodemailer.config');

function auditLog(req) {
  fs.appendFile(process.cwd() + '/bin/audit.log.txt', `${Date.now()},${req.ip},${req.method},${req.headers["user-agent"]},${req.headers.referer},${req.body.email}\n`, function (err) {
    if (err) {return console.log(err);}
    console.log("Request logged.");
  });
};

const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({"message": "We were not able to process your request. Please make sure you fill in all the required fields when logging in."});
  }
  User
    .findOne({ email: req.body.email })
    .exec((err, result) => {
      if (!result) {
        return res.status(404).json({
          "message": "No accounts found under this email. Please create one or try again!"
        });
      } else if (err) {
        return res.status(404).json(err);
      }
      // Check if account is verified
      if (result.verified !== true) {
        return res.status(401).json({message: "Your account has not been verified. Please check your email inbox or spam folder to find your verification link."});
      }
      // Check for log-in time restrictions
      if (Date.now() < result.allowedLogin) {
        let message = {"message": "Too many failed log-in attempts. Try again in a few minutes."};
        return res.status(401).json(message);
      }
      // Deal with several failed log-in attemps
      if (!result.validPassword(req.body.password)) {
        result.failedLogins += 1;
        let message = {"message": "Too many failed log-in attempts. Try again in a few minutes."};
        if (result.failedLogins > 6) {
          result.allowedLogin = Date.now() + (1000*60*16);
          auditLog(req);
        } else if (result.failedLogins > 5) {
          result.allowedLogin = Date.now() + (1000*60*8);
          auditLog(req);
        } else if (result.failedLogins > 4) {
          result.allowedLogin = Date.now() + (1000*60*4);
          auditLog(req);
        } else if (result.failedLogins > 3) {
          result.allowedLogin = Date.now() + (1000*60*2);
          auditLog(req);
        } else {
          message = {"message": "Incorrect usename or password. Please try again."};
        }
        result.save((err) => {
          if (err) {
            return res.status(400).json({message: "API error"});
          } else {
            return res.status(401).json(message); 
          }
        });
      }
      // Successful log-in!
      result.failedLogins = 0;
      result.save((err) => {if (err) {console.log(err);}});
      let expiry = 24*60*60*1000;
      if (req.body.keepLogged === "true") {expiry = expiry * 30;}
      const token = result.generateJwt(expiry);
      res.cookie("token", token, {
            expires: new Date(Date.now() + expiry),
            secure: false, // Set to true when using https
            httpOnly: true,
            path: '/'
          });
      res.status(200).json({token});
    });
};

const register = (req, res) => {
  if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
    return res.status(400).json({message: "All fields required."});
  }
  User.findOne({ email: req.body.email }).select("email").exec((err, result) => {
    if (result) {
      return res.status(409).json({message: "The email you selected is already linked to an account. Please check if you already have one."});
    }
    const user = new User();
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    const verHash = user.createVerHash();
    user.save((err) => {
      if (err) {
        res.status(404).json(err);
      } else {
        nodeMailer.sendVerEmail(req, res, verHash);
        res.status(200).json({"message": "Congratulations! Your account has been created. We have sent you a verification link to your e-mail. It should arrive in a few minutes."});
      }
    });
  });
};

const verifyAccount = (req, res) => {
  if (!req.params.verHash) {
    return res.status(404).json({"message": "Account verification failed. No code was submitted."});
  }
  User.findOne({ verHash: req.params.verHash }).select("verified").exec((err, result) => {
    if (!result) {
      return res.status(404).json({"message": "No accounts linked to this verification code. Please make sure you used your verification link correctly."});
    } else if (err) {
      return res.status(404).json(err);
    }
    if (result.verified == false) {
      result.verified = true;
      result.save((err) => {
        if (err) {
          return res.status(404).json(err);
        }
        let expiry = 24*60*60*1000;
        const token = result.generateJwt(expiry);
        res.cookie("token", token, {
          expires: new Date(Date.now() + expiry),
          secure: false, // Set to true when using https
          httpOnly: true,
          path: '/'
        });
        return res.status(200).json({"message": "Your account has been successfully verified. You are now free to post and interact with other users!"});
      });
    } else {
      res.status(200).json({"message": "Your account has been verified already. No need to do it again!"});
    };
  });
};

const sendResetEmail = (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({
      message: "No email provided. Please go back to the log in menu and type in your email address before requesting a password reset."
    });
  }
  User.findOne({ email: req.body.email }).select("-salt -hash").exec((err, result) => {
    if (!result) {
      return res.status(404).json({
        "message": "No accounts found under this email. Please create one or try again!"
      });
    } else if (err) {return res.status(404).json(err);}
    nodeMailer.sendResetEmail(req, res, result);
    return res.status(200).json({message:"Please check your email inbox. We have sent you a link to reset your password."});
  });
};

const verHashCheck = (req, res) => {
  if (!req.params.verHash) {
    return res.status(404).json({
      "message": "Password reset failed. No validation code received."
    });
  }
  User.findOne({ verHash: req.params.verHash }).select("-salt -hash").exec((err, result) => {
    if (!result) {
      return res.status(404).json({message: "Invalid verification code."});
    } else if (err) {return res.status(404).json(err);}
    return res.status(200).json(result);
  });
};

const changePassword = (req, res) => {
  if (!req.params.verHash) {
    return res.status(404).json({
      "message": "Password reset failed. No validation code received."
    });
  }
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({"message": "We were not able to process your request. Please make sure you fill in all the required fields when logging in."});
  }
  User.findOne({ verHash: req.params.verHash }).exec((err, result) => {
    if (!result) {
      return res.status(404).json({message: "Invalid verification code."});
    } else if (err) {return res.status(404).json(err);}
    // Check for time restrictions
    if (Date.now() < result.allowedLogin) {
      return res.status(404).json({"message": "Time restriction in place. Try again later."});
    }
    if (req.body.email !== result.email) {
      let message = {"message": "Invalid email. Please make sure that the email you typed matches the one related to your account."};
      result.resetAttempts += 1;
      result.save((err) => {if (err) {return message = "API error.";}});
      if (result.resetAttempts > 3) {
        auditLog(req);
        result.allowedLogin = Date.now() + (1000*60*10);
        message = {"message": "Time restriction in place. Try again later."};
      }
      return res.status(404).json(message);
    }
    result.resetAttempts = 0;
    result.setPassword(req.body.password);
    result.createVerHash();
    result.save((err) => {
      if (err) {
        return res.status(404).json(err);
      }
      return res.status(200).json({message: "Your password has been successfully updated. You can use it now to access your account"});
    });
  });
};

module.exports = {
  register,
  verifyAccount,
  login,
  sendResetEmail,
  verHashCheck,
  changePassword
};
