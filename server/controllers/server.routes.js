const express = require('express');
const router = express.Router();
const ctrlShares = require('./shares');
const ctrlUsers = require('./users');

// Authentication
router.post('/login', ctrlUsers.login);
router.post('/register', ctrlUsers.register);

// Shares
router.get('/', ctrlShares.sharesList);

// Test
router.get('/test', (req, res) => {
  res.render('./email.templates/validationEmail');
});


module.exports = router;

