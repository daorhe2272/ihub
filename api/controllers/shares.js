const mongoose = require("mongoose");
const Share = mongoose.model("Share");
const User = mongoose.model("User");
const CommentInShare = mongoose.model("CommentInShare");
const ReportLog = mongoose.model('ReportLog');
const grabity = require("grabity");
const sanitize = require("sanitize-html");
const logger = require("../config/logger.config");

const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

const sharesDefaultList = (req, res) => {
  let skipping;
  if (req.body.skipping) {
    skipping = parseInt(req.body.skipping);
  } else {
    skipping = 0;
  }
  Share.find().sort({"timeRank": -1}).skip(skipping).limit(10).populate({path: "comments", model: "CommentInShare"}).exec((err, results) =>  {
    if (!results) {
      return res.status(404).json({"message" : "location not found"});
    } else if (err) {
      logger.logError(err);
      return res.status(404).json(err);
    }
    // Sort comments by most recent publication date
    for (let i = 0; i < results.length; i++) {
      results[i].comments.sort(function (a, b) {
        return b.commentedOn - a.commentedOn;
      });
    }
    res.status(200).json(results);
  });
};

const addPost = (req, res) => {
  let publisher, status, message;
  if (!req.params.userId || req.params.userId=="undefined") {
    logger.logError("No publisher found in request");
    return res.status(401).json({"message":"Please log in before attempting to post any content."});
  }
  if (!req.body.postContent) {
    logger.logError("No content to post found");
    return res.status(400).json({"message":"No content to post found."});
  }
  User.findOne({ _id: req.params.userId }).exec((err, result) => {
    if (!result) {
      logger.logError("User not found");
      return res.status(404).json({"message":"User not found."});
    } else if (err) {
      logger.logError(err);
      console.log(err);
      return res.status(404).json(err);
    } else {
      publisher = `${result.firstName} ${result.lastName}`;
      Share.create({
        publisher: publisher,
        publisherId: req.params.userId,
        content: sanitize(req.body.postContent, {allowedAttributes: {}}),
        linkTitle: req.body.title,
        linkDescription: req.body.description,
        linkImage: req.body.image,
        timeRank: Date.now()
      }, (err, post) => {
        if (err) {
          logger.logError(err);
          res.status(400).json(err);
        } else {
          let index = result.userActivity.shares.indexOf(post._id);
          if (index === -1) {
            result.userActivity.shares.push(post._id);
            result.save((err) => {
              if (err) {
                logger.logError(err);
                console.log("Error is here.");
                return res.status(400).json({"message":"API error"});
              }
              else {console.log("WTF?"); return res.status(201).json(post);}
            });
          } else {
            logger.logError("Undefined error occurred when saving post to database");
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
      logger.logError(err);
      res.status(err.statusCode).json({"message":"Invalid URL. It is possible that your shared link does not exist or is not publicly available."});
    }
  }) ();
}

const deletePost = (req, res) => {
  User.findById(req.params.userId).exec((err, result) => {
    if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
    else if (!result) {return res.status(404).json({message:"Post not found"});}
    else {
      let index = result.userActivity.shares.indexOf(req.params.postId);
      if (index > -1) {
        result.userActivity.shares.splice(index, 1);
        result.save((err) => {
          if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
          else {
            Share.findById(req.params.postId).deleteOne((err, results) => {
              if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
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
  Share.findById(req.params.postId).exec((err, shareInfo) => {
    if (err) {logger.logError(err); return res.status(400).json({message: "API error"});}
    else if (shareInfo) {
      let likesSearch;
      let likes = shareInfo.likes;
      for (let i = 0; i < likes.length; i++) {
        if (likes[i].sourceId == req.params.userId) {
          likesSearch = likes[i];
          break;
        }
      }
      // If user not in likes array, add him
      if (likesSearch == undefined) {
        likes.push({sourceId: req.params.userId, addedOn: Date.now()});
        shareInfo.save((err) => {
          if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
          else {
            User.findById(req.params.userId).exec((err, userInfo) => {
              let userLikesSearch;
              let userLikes = userInfo.userActivity.likes;
              for (let i = 0; i < userLikes.length; i++) {
                if (userLikes[i].sourceId == req.params.postId) {
                  userLikesSearch = userLikes[i];
                  break;
                }
              }
              if (userLikesSearch == undefined) {
                userLikes.push({sourceId: req.params.postId, addedOn: Date.now()});
                userInfo.save((err) => {
                  if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
                  else {return res.status(200).json({message:"Like added"});}
                });
              }
            });
          }
        });
      // If user in likes array, remove him
      } else {
        likes.pull(likesSearch);
        shareInfo.save((err) => {
          if (err) {logger.logError(err); return res.status(400).json({"message":"API error"});}
          else {
            User.findById(req.params.userId).exec((err, userInfo) => {
              let userLikesSearch;
              let userLikes = userInfo.userActivity.likes;
              for (let i = 0; i < userLikes.length; i++) {
                if (userLikes[i].sourceId == req.params.postId) {
                  userLikesSearch = userLikes[i];
                  break;
                }
              }
              if (userLikesSearch != undefined) {
                userLikes.pull(userLikesSearch);
                userInfo.save((err) => {
                  if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
                  else {return res.status(200).json({message:"Like removed"});}
                });
              }
            });
          }
        });
      }
    } else {return res.status(400).json({message:"Unexpected error."});}
  });
}

const getPost = (req, res) => {
  Share.findById(req.params.postId).populate({path: "comments", model: "CommentInShare"}).exec((err, results) => {
    if (err) {return res.status(400).json({message:"API error,"});}
    else if (!results) {return res.status(404).json({message:"Post not found."});}
    else {
      res.status(200).json(results);
    }
  });
}

const addComment = (req, res) => {
  if (req.body.commentContent && req.params.userId && req.params.postId) {
    User.findById(req.params.userId).select("firstName lastName").exec((err, userFullName) => {
      if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
      else {
        CommentInShare.create({
          content: req.body.commentContent,
          userId: req.params.userId,
          postId: req.params.postId,
          commentedOn: Date.now(),
          userName: `${userFullName.firstName} ${userFullName.lastName}`
        }, (err, commentInfo) => {
          if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
          else {
            User.findById(req.params.userId).exec((err, results) => {
              if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
              else {
                results.userActivity.comments.push(commentInfo._id);
                results.save((err) => {
                  if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
                  else {
                    Share.findById(req.params.postId).exec((err, results2) => {
                      if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
                      else {
                        results2.comments.push(commentInfo._id);
                        results2.save((err) => {
                          if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
                          else {return res.status(200).json(commentInfo);}
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  } else {return res.status(400).json({message:"Request unsuccessful."});}
}

const deleteComment = (req, res) => {
  if (req.params.userId && req.params.commentId) {
    CommentInShare.findByIdAndDelete(req.params.commentId, (err, result) => {
      if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
      else if (!result) {return res.status(400).json({message:"Bad request"});}
      else {
        User.findById(req.params.userId).exec((err, result2) => {
          if (err) {logger.logError(err); return res.status(400).json({"message": "API error"});}
          else if (!result2) {return res.status(400).json({message:"Bad request"});}
          else {
            if (req.params.userId == result.userId) {
              let index = result2.userActivity.comments.indexOf(req.params.commentId);
              if (index > -1) {
                result2.userActivity.comments.splice(index, 1);
              }
              result2.save((err) => {
                if (err) {logger.logError(err); return res.status(400).json({message:"Bad request"});}
                else {
                  Share.findById(result.postId).exec((err, result3) => {
                    if (err) {logger.logError(err); return res.status(400).json({message:"Bad request"});}
                    else if (!result3) {return res.status(400).json({message:"Bad request"});}
                    else {
                      let index2 = result3.comments.indexOf(req.params.commentId);
                      if (index2 > -1) {
                        result3.comments.splice(index2, 1);
                      }
                      result3.save((err) => {
                        if (err) {logger.logError(err); return res.status(400).json({message:"Bad request"});}
                        else {
                          return res.status(200).json({message:"Comment deleted"});
                        }
                      });
                    }
                  });
                }
              });
            } else {
              return res.status(401).json({
                message:"This user is not authorized to delete this comment"
              });
            }
          }
        });
      }
    })
  } else {
    return res.status(400).json({message:"Bad request"});
  }
}

const likeComment = (req, res) => {
  CommentInShare.findById(req.params.commentId).exec((err, results) => {
    let index = results.likes.indexOf(req.params.userId);
    // If user in likes array, remove him
    if (index > -1) {
      results.likes.splice(index, 1);
      results.save((err) => {
        if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
        else {
          User.findById(req.params.userId).exec((err, results2) => {
            let index2 = results2.userActivity.commentLikes.indexOf(req.params.commentId);
            if (index2 > -1) {
              results2.userActivity.commentLikes.splice(index2, 1);
              results2.save((err) => {
                if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
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
        if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
        else {
          User.findById(req.params.userId).exec((err, results2) => {
            let index2 = results2.userActivity.commentLikes.indexOf(req.params.commentId);
            if (index2 === -1) {
              results2.userActivity.commentLikes.push(req.params.commentId);
              results2.save((err) => {
                if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
                else {return res.status(200).json({message:"Like added"});}
              });
            }
          });
        }
      });
    }
    else {return res.status(400).json({message:"Unexpected error."});}
  });
}

const reportPost = (req, res) => {
  ReportLog.find({reporterId: req.params.userId}).find({sourceId: req.params.sourceId}).exec(async (err, results) => {
    if (err) {logger.logError(err); return res.status(400).json({message:"API error"});}
    else if (results.length) {
      return res.status(200).json({message:"A report has been filed already"});
    }
    else if (!results.length) {
      await ReportLog.create({
        reporterId: req.params.userId,
        ipAddress: req.params.ipAddress,
        sourceId: req.params.sourceId,
        date: Date.now(),
        explanation: req.body.explanation
      }, (err, reportInfo) => {
        if (err) {logger.logError(err); res.status(400).json({message:"API error"});}
        else {
          User.findById(req.params.userId).exec((err, userInfo) => {
            if (err) {logger.logError(err);}
            else if (userInfo) {
              userInfo.userActivity.reports.push(reportInfo._id);
              userInfo.save((err) => {
                if (err) {logger.logError(err);}
                else {console.log("Report registered for user");}
              });
            }
          });
          Share.findById(req.params.sourceId).exec((err, shareInfo) => {
            if (err) {console.log(err);} // Handle error logging
            else if (shareInfo) {
              shareInfo.reports.push(reportInfo._id);
              shareInfo.save((err) => {
                if (err) {console.log(err);} // Handle error logging
                else {console.log("Report registered for Share");}
              });
            }
          });
          CommentInShare.findById(req.params.sourceId).exec((err, commentInfo) => {
            if (err) {logger.logError(err);}
            else if (commentInfo) {
              commentInfo.reports.push(reportInfo._id);
              commentInfo.save((err) => {
                if (err) {logger.logError(err);}
                else {console.log("Report registered for comment in Share");}
              });
            }
          });
          return res.status(200).json({message:"Post reported"});
        }
      });
    }
    else {return res.status(400).json({message:"API error"});}
  });
}

const editPost = (req, res) => {
  if (!req.body.postContent) {
    return res.status(400).json({"message":"No content to post submitted."});
  } else if (!req.params.postId) {
    return res.status(400).json({"message":"API error."});
  } else {
    Share.findById(req.params.postId).exec((err, shareInfo) => {
      if (err) {logger.logError(err);}
      if (shareInfo.publisherId === req.params.userId) {
        shareInfo.content = sanitize(req.body.postContent, {allowedAttributes: {}}),
        shareInfo.linkTitle = req.body.title,
        shareInfo.linkDescription = req.body.description,
        shareInfo.linkImage = req.body.image
        shareInfo.save((err) => {
          if (err) {return res.status(400).json({"message":"API error"});}
          else {return res.status(200).json({message:"Post updated successfully"});}
        });
      } else {
        return res.status(400).json({"message":"API error"});
      }
    });
  }
}

const editComment = (req, res) => {
  if (!req.body.content || !req.params.commentId || !req.params.userId) {
    return res.status(400).json({"message":"API error."});
  } else {
    CommentInShare.findById(req.params.commentId).exec((err, commentInfo) => {
      if (err) {
        logger.logError(err);
        return res.status(400).json({"message":"API error."});
      } else if (commentInfo) {
        commentInfo.content = req.body.content;
        commentInfo.save((err) => {
          if (err) {logger.logError(err); return res.status(400).json({"message":"API error"});}
          else {return res.status(200).json({content: commentInfo.content});}
        });
      } else {
        logger.logError("An unexpected error occurred when user tried to edit comment.");
        return res.status(400).json({"message":"API error."});
      }
    });
  }
}

const addToCollection = (req, res) => {
  if (req.params.userId && req.params.sourceId) {
    User.findById(req.params.userId).exec((err, userInfo) => {
      if (err) {
        logger.logError(err);
        return res.status(400).json({"message":"API error."});
      } else if (userInfo) {
        let collectionsSearch;
        let collections = userInfo.userActivity.collections;
        for (let i = 0; i < collections.length; i++) {
          if (collections[i].sourceId == req.params.sourceId) {
            collectionsSearch = collections[i];
            break;
          }
        }
        if (collectionsSearch == undefined) {
          collections.push({sourceId: req.params.sourceId, addedOn: Date.now()});
          userInfo.save((err) => {
            if (err) {logger.logError(err); return res.status(400).json({"message":"API error"});}
            else {
              Share.findById(req.params.sourceId).exec((err, shareInfo) => {
                if (shareInfo) {
                  let index2 = shareInfo.collections.indexOf(req.params.userId);
                  if (index2 === -1) {
                    shareInfo.collections.push(req.params.userId);
                    shareInfo.save((err) => {
                      if (err) {logger.logError(err);}
                    });
                  }
                }
              });
              res.status(200).json({message:"Element successfully added to My Collection."});
            }
          });
        } else {
          collections.pull(collectionsSearch);
          userInfo.save((err) => {
            if (err) {logger.logError(err); return res.status(400).json({"message":"API error"});}
            else {
              Share.findById(req.params.sourceId).exec((err, shareInfo) => {
                if (shareInfo) {
                  let index2 = shareInfo.collections.indexOf(req.params.userId);
                  if (index2 > -1) {
                    shareInfo.collections.splice(index2, 1);
                    shareInfo.save((err) => {
                      if (err) {logger.logError(err);}
                    });
                  }
                }
              });
              res.status(200).json({message:"Element successfully removed from My Collection."});
            }
          });
        }
      } else {
        logger.logError("An unexpected error occurred when adding or removing element from user collection.");
        return res.status(400).json({"message":"API error."});
      }
    });
  } else {
    return res.status(400).json({"message":"API error."});
  }
}

module.exports = {
  sharesDefaultList,
  addPost,
  processShare,
  deletePost,
  likePost,
  getPost,
  addComment,
  deleteComment,
  likeComment,
  reportPost,
  editPost,
  editComment,
  addToCollection
};
