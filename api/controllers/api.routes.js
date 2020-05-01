const express = require('express');
const router = express.Router();
const ctrlShares = require('./shares');
const ctrlAuth = require('./authentication');
const jwt = require('express-jwt');

const auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

// shares
router
  .route('/')
  .get(ctrlShares.sharesDefaultList)
  .post(auth, ctrlShares.addPost);
  
// authentication
router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);

module.exports = router;
