const mongoose = require('mongoose');
const Share = mongoose.model('Share');
const User = mongoose.model('User');
const grabity = require('grabity');
const sanitize = require('sanitize-html');

const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

const sharesDefaultList = (req, res) => {
  Share.find().sort({"timeRank": -1}).exec((err, results) =>  {
    if (!results) {
      return res.status(404).json({"message" : "location not found"});
    } else if (err) {
      return res.status(404).json(err);
    }
    res.status(200).json(results);
  });
};

const addPost = (req, res) => {
  let publisher;
  let status;
  let message;
  if (!req.body.publisher || req.body.publisher=="undefined") {
    return res.status(401).json({"message":"Please log in before attempting to post any content."});
  }
  if (!req.body.postContent) {
    return res.status(400).json({"message":"No content to post found."});
  }
  User.findOne({ _id: req.body.publisher }).exec((err, result) => {
    if (!result) {
      return res.status(404).json({"message":"User not found."});
    } else if (err) {
      return res.status(404).json(err);
    } else {
      publisher = `${result.firstName} ${result.lastName}`;
      Share.create({
        publisher: publisher,
        publisherId: req.body.publisher,
        content: sanitize(req.body.postContent, {allowedAttributes: {}}),
        linkTitle: req.body.title,
        linkDescription: req.body.description,
        linkImage: req.body.image,
        timeRank: Date.now()
      }, (err, post) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.status(201).json(post);
        }
      });
    }
  });
};

const processShare = (req, res) => {
  (async () => {
    try {
      let it = await grabity.grabIt(req.body.postContent);
      res.status(200).json(it);
    } catch(err) {
      res.status(err.statusCode).json({"message":"Invalid URL. It is possible that your shared link does not exist or is not publicly available."});
    }
  }) ();
}

const deletePost = (req, res) => {
  Share.findById(req.params.postId).deleteOne((err, results) => {
    if (!results) {
      return res.status(404).json({message:"An error has occurred."});
    } else if (err) {
      return res.status(404).json(err);
    }
    res.status(200).json(results);
  });
}

module.exports = {
  sharesDefaultList,
  addPost,
  processShare,
  deletePost
};
