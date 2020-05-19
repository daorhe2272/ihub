const express = require('express');
const router = express.Router();
const ctrlShares = require('./shares');
const ctrlUsers = require('./users');
const jwt = require('jsonwebtoken');

const getId = (req, res, next) => {
  const token = req.cookies.token || "";
  if (token) {
    const decrypt = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.userId = decrypt._id;
    return next();
  }
  next();
};

// Authentication
router.post('/login', ctrlUsers.login);
router.post('/register', ctrlUsers.register);
router.get('/logout', ctrlUsers.logout);
router.get('/verify-account/:verHash', ctrlUsers.verifyAccount);

// Shares
router.get('/', getId, ctrlShares.sharesList);

// Test
router.get('/test', (req, res) => {
  res.render('./email.templates/validationEmail');
});


module.exports = router;

