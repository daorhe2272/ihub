const express = require('express');
const router = express.Router();
const ctrlShares = require('./controllers/shares');
const ctrlAuth = require('./controllers/authentication');
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

// Shares
router.get('/', getId, ctrlShares.sharesList);

// Test
router.get('/test', (req, res) => {
  res.send("Hola care bola boom boom bang bang cha cha cha sha shu ka shakshukha why the hell is the res object not containing my message? It is pretty long, I should be able to spot it in the console! Oh shit, why???");
});


module.exports = router;
