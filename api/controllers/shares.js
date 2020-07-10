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
          let index = result.userActivity.shares.indexOf(post._id);
          if (index === -1) {
            result.userActivity.shares.push(post._id);
            result.save((err) => {
              if (err) {return res.status(400).json(err);}
              else {res.status(201).json(post);}
            });
          } else {
            return res.status(400).json({message:"API error"});
          }
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
  User.findById(req.params.userId).exec((err, result) => {
    if (err) {return res.status(400).json(err);}
    else if (!result) {return res.status(404).json({message:"Post not found"});}
    else {
      let index = result.userActivity.shares.indexOf(req.params.postId);
      if (index > -1) {
        result.userActivity.shares.splice(index, 1);
        result.save((err) => {
          if (err) {return res.status(400).json(err);}
          else {
            Share.findById(req.params.postId).deleteOne((err, results) => {
              if (err) {return res.status(400).json(err);}
              else if (!results) {res.status(404).json({message:"Post not found"});}
              else {
                return res.status(200).json(results);
              }
            });
          }
        });
      } else {
        return res.status(400).json({message:"API error"});
      }
    }
  });
}

const likePost = (req, res) => {
  Share.findById(req.params.postId).exec((err, results) => {
    let index = results.likes.indexOf(req.params.userId);
    // If user in likes array, remove him
    if (index > -1) {
      results.likes.splice(index, 1);
      results.save((err) => {
        if (err) {return res.status(400).json({message:"API error"});}
        else {
          User.findById(req.params.userId).exec((err, results2) => {
            let index2 = results2.userActivity.likes.indexOf(req.params.postId);
            if (index2 > -1) {
              results2.userActivity.likes.splice(index2, 1);
              results2.save((err) => {
                if (err) {return res.status(400).json({message:"API error"});}
                else {return res.status(200).json({message:"Like removed"});}
              });
            }
          });
        }
      });
    }
    // If user not in likes array, add him
    else if (index === -1) {
      results.likes.push(req.params.userId);
      results.save((err) => {
        if (err) {return res.status(400).json({message:"API error"});}
        else {
          User.findById(req.params.userId).exec((err, results2) => {
            let index2 = results2.userActivity.likes.indexOf(req.params.postId);
            if (index2 === -1) {
              results2.userActivity.likes.push(req.params.postId);
              results2.save((err) => {
                if (err) {return res.status(400).json({message:"API error"});}
                else {return res.status(200).json({message:"Like added"});}
              });
            }
          });
        }
      });
    }
    else {return res.status(400).json({message:"Unexpected error"});}
  });
}

const getPost = (req, res) => {
  Share.findById(req.params.postId).exec((err, results) => {
    if (err) {return res.status(400).json({message:"API error"});}
    else if (!results) {return res.status(404).json({message:"Post not found"});}
    else {
      res.status(200).json(results);
    }
  });
}

module.exports = {
  sharesDefaultList,
  addPost,
  processShare,
  deletePost,
  likePost,
  getPost
};
