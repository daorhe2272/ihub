const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

require('./shares');

const myCollectionSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Share"
  },
  addedOn: {
    type: Number,
    min: 0
  }
}, {_id: false});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  nameChangedOn: {
    type: Number,
    "default": 0,
    min: 0
  },
  hash: String,
  salt: String,
  verHash: String,
  verified: {
    type: Boolean,
    'default': false
  },
  failedLogins: {
    type: Number,
    "default": 0,
    min: 0
  },
  allowedLogin: {
    type: Number,
    "default": Date.now(),
    min: 0
  },
  resetAttempts: {
    type: Number,
    'default': 0,
    min: 0
  },
  userDescription: {
    type: String,
    'default': "",
    maxlength: 300
  },
  userCompany: {
    type: String,
    'default': "",
    maxlength: 150
  },
  userWebsite: {
    type: String,
    "default": "",
    maxlength: 150
  },
  userLinkedIn: {
    type: String,
    "default": "",
    maxlength: 150
  },
  joinedOn: {
    type: Number,
    min: 0,
    default: 0
  },
  userActivity: {
    likes: [{
      _id: false,
      sourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Share"
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
    shares: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Share"
    },
    collections: [myCollectionSchema],
    commentLikes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "CommentInShare"
    },
    reports: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ReportLog"
    }
  }
});

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.createVerHash = function () {
  this.verHash = crypto.randomBytes(32).toString('hex');
  return this.verHash;
};

userSchema.methods.validPassword = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function (expiry) {
  expiry = expiry / 1000;
  return jwt.sign({
    _id: this._id
  }, process.env.JWT_SECRET, { expiresIn: expiry });
};

mongoose.model('User', userSchema);
