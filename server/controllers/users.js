const request = require('request');

const apiServer = {server: 'http://localhost:3000'};
if (process.env.NODE_ENV === 'production') {apiOptions.server = 'https://your-URL.com';} // Make sure to add the correct URL

const myProfile = (req, res) => {
  res.render("myProfile");
}

module.exports = {
  myProfile
}
