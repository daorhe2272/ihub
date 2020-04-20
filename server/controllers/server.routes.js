const express = require('express');
const router = express.Router();
const ctrlShares = require('./shares');

/* GET home page. */
router.get('/', ctrlShares.sharesList);

module.exports = router;
