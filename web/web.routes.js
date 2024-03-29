const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const ctrlShares = require('./controllers/shares');
const ctrlAuth = require('./controllers/authentication');
const ctrlUsers = require('./controllers/users');
const ctrlAbout = require("./controllers/about");
const ctrlDiscussions = require("./controllers/discussions");
const ctrlPartnerUp = require("./controllers/partnering");
const ctrlEvents = require("./controllers/events");
const ctrlRankings = require("./controllers/rankings");

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
router.post('/report-post/:postId', ctrlShares.reportPost)
router.post('/post-comment/:postId', ctrlShares.addComment);
router.post('/', ctrlShares.createPost);
router.post('/edit-share/:postId', ctrlShares.updatePost);
router.post('/edit-comment/:commentId', ctrlShares.updateComment);
router.delete('/delete-comment/:commentId-:postId', ctrlShares.deleteComment);

// Discussions
router.get("/discussions", getId, ctrlDiscussions.discussionsMain);

// Partner Up
router.get("/partner-up", getId, ctrlPartnerUp.partnerUpMain);

// Events
router.get("/events", getId, ctrlEvents.eventsMain);

// Rankings
router.get("/rankings", getId, ctrlRankings.rankingsMain);

// About
router.get("/about", getId, ctrlAbout.aboutPage);
router.get("/about/contact", getId, ctrlAbout.contactInfo);
router.get("/about/cookie-policy", getId, ctrlAbout.cookiePolicy);
router.get("/about/privacy-policy", getId, ctrlAbout.privacyPolicy);
router.get("/about/service-terms", getId, ctrlAbout.serviceTerms);

// Test
router.get('/test', (req, res) => {
  return res.render('email.templates/resetPasswordEmail');
});


module.exports = router;
