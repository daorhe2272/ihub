const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const nodeMailer = require('../config/nodemailer.config');

const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({"message": "We were not able to process your request. Please make sure you fill in all the required fields when logging in."});
  }
  User
    .findOne({ email: req.body.email })
    .exec((err, result) => {
      if (!result) {
        return res.status(404).json({
          "message": "No accounts found under this email. Would you like to create one?"
        });
      } else if (err) {
        return res.status(404).json(err);
      }
      if (!result.validPassword(req.body.password)) {
        return res.status(401).json({"message": "Incorrect password. Please try again."});
      }
      const token = result.generateJwt();
      res.status(200).json({token});
    });
};

const register = (req, res) => {
  if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password) {
    return res.status(400).json({"message": "All fields required."});
  }
  const user = new User();
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  const verHash = user.createVerHash();
  nodeMailer.sendVerEmail(req, res, verHash);
  user.save((err) => {
    if (err) {
      res.status(404).json(err);
    } else {
      const token = user.generateJwt();
      res.status(200).json({token});
    }
  });
};

/*
const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({"message": "We were not able to process your request. Please make sure you fill in all the required fields when logging in."});
  }
  // The following is a custom callback specified in passport.js documentation manuals.
  // If an exception occurred, err will be set.
  passsport.authenticate('local', (err, user, info) => {
    let token;
    if (err) {
      return res.status(404).json(err);
    }
    if (user) {
      token = user.generateJwt();
      res.status(200).json({token});
    } else {
      res.status(401).json(info);
    }
  }) (req, res);
};
*/ 
module.exports = {
  register,
  login
};
