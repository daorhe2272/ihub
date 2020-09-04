const mongoose = require('mongoose');
const uri = 'mongodb://localhost/ehub';

require('./users');

const reportsLogSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ipAddress: String,
  sourceId: {
    type: String,
    required: true
  },
  date: {
    type: Number,
    min: 0,
    required: true
  },
  explanation: String,
  assessed: {
    type: Boolean,
    "default": false
  }
});
mongoose.model("ReportLog", reportsLogSchema);

const commentInShareSchema = new mongoose.Schema({
  content: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Share",
    required: true
  },
  commentedOn: {
    type: Number,
    "default": Date.now(),
    min: 0
  },
  userName: {
    type: String,
    required: true
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
  },
  reports: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
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
  likes: [{
    _id: false,
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    addedOn: {
      type: Number,
      min: 0
    }
  }],
  comments: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "CommentInShare"
  },
  reports: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
  },
  collections: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User"
  },
  timeRank: {
    type: Number,
    'default': Date.now(),
    min: 0
  }
});

mongoose.model('Share', sharesSchema);
