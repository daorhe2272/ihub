const express = require('express');
const router = express.Router();
const ctrlShares = require('./controllers/shares');
const ctrlAuth = require('./controllers/authentication');
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
  .get('/', ctrlShares.sharesDefaultList)
  .post('/', ctrlShares.addPost);
router.post('/process-share', ctrlShares.processShare);
  
// authentication
router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);
router.get('/verify-account/:verHash', ctrlAuth.verifyAccount);
router.get('/reset-password', ctrlAuth.sendResetEmail);
router.get('/request-reset/:verHash', ctrlAuth.verHashCheck);
router.put('/change-password/:verHash', ctrlAuth.changePassword);

module.exports = router;
