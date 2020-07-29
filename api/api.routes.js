const express = require('express');
const router = express.Router();
const ctrlShares = require('./controllers/shares');
const ctrlAuth = require('./controllers/authentication');
const ctrlUsers = require('./controllers/users');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.cookies.token || "";
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET);
    return next();
  }
  return res.send("Please sign in.");
};

const getId = (req, res, next) => {
  const token = req.cookies.token || "";
  if (token) {
    const decrypt = jwt.verify(token, process.env.JWT_SECRET);
    if (decrypt._id) {
      req.params.userId = decrypt._id;
      return next();
    } else {
      return res.status(401).json({message:"Access denied"});
    }
  }
  return res.status(401).json({message:"Access denied"});
};

// Shares
router.get('/', ctrlShares.sharesDefaultList);
router.get('/like-share/:postId', getId, ctrlShares.likePost);
router.get('/get-post/:postId', ctrlShares.getPost);
router.get('/like-share-comment/:commentId', getId, ctrlShares.likeComment);
router.post('/report-post/:sourceId-:ipAddress', getId, ctrlShares.reportPost);
router.post('/', ctrlShares.addPost);
router.post('/process-share', ctrlShares.processShare);
router.post('/post-comment/:postId', getId, ctrlShares.addComment);
router.delete('/delete-share/:postId', getId, ctrlShares.deletePost);
router.delete('/delete-comment/:commentId-:postId', getId, ctrlShares.deleteComment);

// Users
router.get('/user/:userId', ctrlUsers.myProfile);
  
// Authentication
router.post('/login', ctrlAuth.login);
router.post('/register', ctrlAuth.register);
router.get('/verify-account/:verHash', ctrlAuth.verifyAccount);
router.get('/reset-password', ctrlAuth.sendResetEmail);
router.get('/request-reset/:verHash', ctrlAuth.verHashCheck);
router.put('/change-password/:verHash', ctrlAuth.changePassword);

module.exports = router;
