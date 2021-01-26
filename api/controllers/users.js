const mongoose = require('mongoose');
const Share = mongoose.model('Share');
const User = mongoose.model('User');
const logger = require('../config/logger.config');
const nodeMailer = require('../config/nodemailer.config');

const _apiError = (req, res) => {
  logger.logError("API error");
  return res.status(400).json({message: "API error"});
}

const myProfile = (req, res) => {
  User.findById(req.params.userId).select("-hash -salt -verHash -verified -failedLogins -allowedLogin -resetAttempts").exec((err, results) => {
    if (err) {logger.logError(err); return res.status(404).json(err);}
    if (!results) {return res.status(404).json({message:"Invalid user Id."});} // Log as security issue
    res.status(200).json(results);
  });
};

const myCollection = (req, res) => {
  if (req.params.userId) {
    User.findById(req.params.userId).populate({path: "userActivity.collections.sourceId", model: "Share"}).exec((err, userInfo) => {
      if (err) {logger.logError(err); return _apiError(req, res);}
      else if (userInfo) {
        let results = userInfo.userActivity.collections;
        results.sort(function (a, b) {
          return b.addedOn - a.addedOn;
        });
        res.status(200).json(userInfo.userActivity.collections);
      } else {
        return _apiError(req, res);
      }
    });
  } else {
    _apiError(req, res);
  }
}

const editUserDescription = (req, res) => {
  if (req.params.userId && req.body.userDescription && req.body.userId) {
    if (req.params.userId === req.body.userId) {
      User.findById(req.params.userId).exec((err, userInfo) => {
        if (err) {logger.logError(err); return _apiError(req, res);}
        else if (userInfo) {
          userInfo.userDescription = req.body.userDescription;
          userInfo.save((err) => {
            if (err) {logger.logError(err); return _apiError(req, res);}
            else {
              res.status(200).json({userDescription: userInfo.userDescription});
            }
          });
        } else {
          _apiError(req, res);
        }
      });
    } else {
      _apiError(req, res);
    }
  } else {
    _apiError(req, res);
  }
}

const editProfileInfo = (req, res) => {
  if (req.params.userId) {
    User.findById(req.params.userId).exec((err, userInfo) => {
      if (err) {logger.logError(err); return _apiError(req, res);}
      else if (userInfo) {
        userInfo.userCompany = req.body.userCompany;
        userInfo.userWebsite = req.body.userWebsite;
        userInfo.userLinkedIn = req.body.userLinkedIn;
        userInfo.save((err) => {
          if (err) {
            logger.logError(err);
            _apiError(req, res);
          }
          else {
            res.status(200).json({userCompany: userInfo.userCompany, userWebsite: userInfo.userWebsite, userLinkedIn: userInfo.userLinkedIn});
          }
        });
      } else {
        _apiError(req, res);
      }
    });
  } else {
    _apiError(req, res);
  }
}

const deleteUserAccount = (req, res) => {
  if (req.params.userId && req.body.password && req.body.reasonForAccountDelete) {
    User.findById(req.params.userId).exec((err, userInfo) => {
      if (err) {logger.logError(err); return _apiError(req, res);}
      else if (userInfo) {
        // Check for log-in time restrictions
        if (Date.now() < userInfo.allowedLogin) {
          return res.status(401).json({
            message: "Too many failed password input attempts. Try again in a few minutes."
          });
        // Deal with wrong password inputs
        } else if (!userInfo.validPassword(req.body.password)) {
          userInfo.failedLogins += 1;
          let message = {"message":"Too many failed password inputs. Try again in a few minutes."};
          if (userInfo.failedLogins > 6) {
            userInfo.allowedLogin = Date.now() + (1000*60*16);
            logger.auditLog(req);
          } else if (userInfo.failedLogins > 5) {
            userInfo.allowedLogin = Date.now() + (1000*60*8);
            logger.auditLog(req);
          } else if (userInfo.failedLogins > 4) {
            userInfo.allowedLogin = Date.now() + (1000*60*4);
            logger.auditLog(req);
          } else if (userInfo.failedLogins > 3) {
            userInfo.allowedLogin = Date.now() + (1000*60*2);
            logger.auditLog(req);
          } else {
            message = {"message":"Incorrect password. Please try again."};
          }
          userInfo.save((err) => {
            if (err) {logger.logError(err); return _apiError(req, res);}
            else {return res.status(401).json(message);}
          });
        // Delete account!
        } else {
          User.findById(req.params.userId).deleteOne((err) => {
            if (err) {logger.logError(err); return _apiError(req, res);}
            else {
              logger.logAccountDelete(req, res, userInfo);
              res.status(200).json({});
            }
          });
        }
      } else {
        _apiError(req, res);
      }
    });
  } else {
    return _apiError(req, res);
  }
}

const changeUserName = (req, res) => {
  if (req.params.userId && req.body.firstName && req.body.lastName) {
    User.findById(req.params.userId).exec((err, userInfo) => {
      if (err) {logger.logError(err); console.log(err); res.status(400).json({message: "API error"});}
      else if (!userInfo) {logger.logError("User not found when changing name."); console.log("User not found.");
        res.status(400).json({message: "API error"});
      } else {
        if (!userInfo.nameChangedOn) {userInfo.nameChangedOn = 0;} // In case data is not present
        let daysDifference = (Date.now() - userInfo.nameChangedOn) / (1000 * 60 * 60 * 24);
        if (daysDifference > 60) {
          userInfo.firstName = req.body.firstName;
          userInfo.lastName = req.body.lastName;
          userInfo.nameChangedOn = Date.now();
          userInfo.save((err) => {
            if (err) {logger.logError(err); console.log(err); res.status(400).json({message: "API error"});}
            else {res.status(200).json({});}
          });
        } else {
          res.status(403).json({message:"User changed name less than 60 days ago."});
        }
      }
    });
  } else {
    return _apiError(req, res);
  }
}

const sendUserContactMessage = (req, res) => {
  nodeMailer.sendContactInfoMessage(req, res);
}

module.exports = {
  myProfile,
  myCollection,
  editUserDescription,
  editProfileInfo,
  deleteUserAccount,
  changeUserName,
  sendUserContactMessage
};
