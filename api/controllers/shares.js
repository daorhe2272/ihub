const mongoose = require('mongoose');
const Shares = mongoose.model('Share');
const Users = mongoose.model('User');
const grabity = require('grabity');

const sharesDefaultList = (req, res) => {
  Shares.find().exec((err, results) =>  {
    if (!results) {
      return res.status(404).json({"message" : "location not found"});
    } else if (err) {
      return res.status(404).json(err);
    }
    res.status(200).json(results);
  });
};

const addPost = (req, res) => {
  let username
  if (req.payload && req.payload.email) {
    Users
      .findOne({ email: req.payload.email })
      .exec((err, user) => {
        if (!user) {
          return res.status(404).json({"message": "Please sign in."});
        } else if (err) {
          console.log(err);
          return res.status(404).json(err);
        }
        username = user.name;
      }); 
    Shares.create({
      publisher: username,
      content: req.body.content,
      link: req.body.link,
      timeRank: req.body.timeRank
    }, (err, post) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.status(201).json(post);
      }
    });
  } else {
    return res.status(404).json({"message": "User not found."});
  }
};

const processShare = (req, res) => {
  (async () => {
    let it = await grabity.grabIt(req.body.postContent);
    console.log(it);
    res.status(200).json(it);
  }) ();
}

module.exports = {
  sharesDefaultList,
  addPost,
  processShare
};
