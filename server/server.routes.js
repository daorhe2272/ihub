const express = require('express');
const router = express.Router();
const ctrlShares = require('./controllers/shares');
const ctrlAuth = require('./controllers/authentication');
const ctrlUsers = require('./controllers/users');
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
router.post('/register', ctrlAuth.register);
router.get('/verify-account/:verHash', ctrlAuth.verifyAccount);
router.post('/login', ctrlAuth.login);
router.get('/logout', ctrlAuth.logout);
router.post('/reset-password', ctrlAuth.requestPasswordReset);
router.get('/request-reset/:verHash', ctrlAuth.formRequest);
router.post('/change-password/:verHash', ctrlAuth.changePassword);

// Users
router.get('/user/:userId', getId, ctrlUsers.myProfile);

// Shares
router.get('/', getId, ctrlShares.sharesList);
router.post('/', ctrlShares.createPost);
router.get('/delete-share/:postId', getId, ctrlShares.deletePost);

// Test
router.get('/test', (req, res) => {
  return res.render('email.templates/validationEmail');
});


module.exports = router;
