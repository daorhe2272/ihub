const mongoose = require('mongoose');
const uri = 'mongodb://localhost/ehub';

require('./users');

const commentInShareSchema = new mongoose.Schema({
  content: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Share"
  },
  commentedOn: {
    type: Number,
    "default": Date.now(),
    min: 0
  }
});
mongoose.model("CommentInShare", commentInShareSchema);

const sharesSchema = new mongoose.Schema({
  publisher: {
    type: String,
    required: true
  },
  publisherId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  linkTitle: {
    type: String,
    'default': ""
  },
  linkDescription: {
    type: String,
    'default':""
  },
  linkImage: {
    type: String,
    'default':""
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
  },
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CommentInShare"
  },
  timeRank: {
    type: Number,
    'default': Date.now(),
    min: 0
  }
});

mongoose.model('Share', sharesSchema);
