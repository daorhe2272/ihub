const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

require('./shares');

const userCommentSchema = new mongoose.Schema({
  comment: {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Share"
    },
    content: String,
    commentedOn: {
      type: Number,
      "default": Date.now(),
      min: 0
    }
  }
});
mongoose.model("UserComment", userCommentSchema);

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
  hash: String,
  salt: String,
  verHash: String,
  verified: {
    type: Boolean,
    'default': false
  },
  failedLogins: {
    type: Number,
    'default': 0,
    min: 0
  },
  allowedLogin: {
    type: Number,
    'default': Date.now(),
    min: 0
  },
  resetAttempts: {
    type: Number,
    'default': 0,
    min: 0
  },
  userDescription: {
    type: String,
    'default': ""
  },
  userCompany: {
    type: String,
    'default': ""
  },
  userWebsite: {
    type: String,
    "default": ""
  },
  userLinkedIn: {
    type: String,
    "default": ""
  },
  userActivity: {
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Share"
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "UserComment"
    },
    shares: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Share"
    },
    collections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Share"
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
  console.log(expiry);
  return jwt.sign({
    _id: this._id
  }, process.env.JWT_SECRET, { expiresIn: expiry });
};

mongoose.model('User', userSchema);
