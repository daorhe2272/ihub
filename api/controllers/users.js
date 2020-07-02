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

module.exports = {
  myProfile
};
