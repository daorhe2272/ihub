const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

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
    type: String,
    'default': 'No'
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

userSchema.methods.generateJwt = function () {
  const expiry = new Date();
  expiry.setDate(expiry.getDate + 1);
  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name
  }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

mongoose.model('User', userSchema);
