const express = require('express');
const router = express.Router();
const ctrlShares = require('./shares');
const ctrlAuth = require('./authentication');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || "";
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET);
    return next();
  }
  return res.send("Please sign in.");
};

// shares
router
  .route('/')
  .get(ctrlShares.sharesDefaultList)
  .post(ctrlShares.addPost);
  
// authentication
router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);
router.get('/verify-account/:verHash', ctrlAuth.verifyAccount);

module.exports = router;
