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
router.get('/user-collection', getId, ctrlUsers.myCollection);
router.post('/update-user-description', ctrlUsers.editUserDescription);
router.post('/update-profile-contents', ctrlUsers.editProfileInfo);
router.post('/user-account-delete', getId, ctrlUsers.deleteUserAccount);
router.post('/users/change-name', ctrlUsers.changeUserName);

// Shares
router.get('/', getId, ctrlShares.sharesList);
router.post("/load-more-posts", getId, ctrlShares.loadMorePosts);
router.get('/delete-share/:postId', getId, ctrlShares.deletePost);
router.get('/shared-post/:postId', getId, ctrlShares.showPost);
router.get('/add-to-collection/:sourceId', ctrlShares.addToCollection);
router.get("/about", ctrlShares.aboutPage);
router.post('/report-post/:postId', ctrlShares.reportPost)
router.post('/post-comment/:postId', ctrlShares.addComment);
router.post('/', ctrlShares.createPost);
router.post('/edit-share/:postId', ctrlShares.updatePost);
router.post('/edit-comment/:commentId', ctrlShares.updateComment);
router.delete('/delete-comment/:commentId-:postId', ctrlShares.deleteComment);

// Test
router.get('/test', (req, res) => {
  return res.render('email.templates/validationEmail');
});


module.exports = router;
