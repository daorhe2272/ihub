const mongoose = require('mongoose');
const Share = mongoose.model('Share');
const User = mongoose.model('User');

const _checkPassword = (req, res) => {
  User.findById(req.params.userId).exec((err, userInfo) => {
    if (err) {return false;}
    else if (userInfo) {
      console.log(userInfo.validPassword(req.body.password));
      if (!userInfo.validPassword(req.body.password)) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });
}

const myProfile = (req, res) => {
  User.findById(req.params.userId).select("-hash -salt -verHash").exec((err, results) => {
    if (err) {return res.status(404).json(err);}
    if (!results) {return res.status(404).json({message:"Invalid user Id."});} // Log as security issue
    res.status(200).json(results);
  });
};

const myCollection = (req, res) => {
  if (req.params.userId) {
    User.findById(req.params.userId).populate({path: "userActivity.collections.sourceId", model: "Share"}).exec((err, userInfo) => {
      if (err) {return res.status(400).json({message: "API error"});}
      else if (userInfo) {
        let results = userInfo.userActivity.collections;
        results.sort(function (a, b) {
          return b.addedOn - a.addedOn;
        });
        res.status(200).json(userInfo.userActivity.collections);
      } else {
        return res.status(400).json({message: "API error"});
      }
    });
  } else {
    res.status(400).json({message: "API error"});
  }
}

const editUserDescription = (req, res) => {
  if (req.params.userId && req.body.userDescription && req.body.userId) {
    if (req.params.userId === req.body.userId) {
      User.findById(req.params.userId).exec((err, userInfo) => {
        if (err) {return res.status(400).json({message:"API error"});}
        else if (userInfo) {
          userInfo.userDescription = req.body.userDescription;
          userInfo.save((err) => {
            if (err) {return res.status(400).json({message:"API error"});}
            else {
              res.status(200).json({userDescription: userInfo.userDescription});
            }
          });
        } else {
          return res.status(400).json({message:"API error"});
        }
      });
    } else {
      res.status(400).json({message:"API error"});
    }
  } else {
    res.status(400).json({message: "API error"});
  }
}

const editProfileInfo = (req, res) => {
  if (req.params.userId && req.body.userCompany && req.body.userWebsite && req.body.userLinkedIn) {
    User.findById(req.params.userId).exec((err, userInfo) => {
      if (err) {return res.status(400).json({message:"API error"});}
      else if (userInfo) {
        userInfo.userCompany = req.body.userCompany;
        userInfo.userWebsite = req.body.userWebsite;
        userInfo.userLinkedIn = req.body.userLinkedIn;
        userInfo.save((err) => {
          if (err) {res.status(400).json({message: "API error"});}
          else {
            res.status(200).json({userCompany: userInfo.userCompany, userWebsite: userInfo.userWebsite, userLinkedIn: userInfo.userLinkedIn});
          }
        });
      } else {
        res.status(400).json({message: "API error"});
      }
    });
  } else {
    res.status(400).json({message: "API error"});
  }
}

const deleteUserAccount = async (req, res) => {
  if (req.params.userId && req.body.password && req.body.reasonForAccountDelete) {
    let checkForPassword = await _checkPassword(req, res);
    if (checkForPassword === false) {
      console.log("Incorrect password");
      res.status(200).json({});
    } else {
      console.log("Account deleted");
      res.status(200).json({});
    }
  } else {
    res.status(400).json({message: "API error"});
  }
}

module.exports = {
  myProfile,
  myCollection,
  editUserDescription,
  editProfileInfo,
  deleteUserAccount
};
