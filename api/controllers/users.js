const mongoose = require('mongoose');
const Share = mongoose.model('Share');
const User = mongoose.model('User');

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

module.exports = {
  myProfile,
  myCollection
};
