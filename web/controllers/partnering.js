const request = require("request");
const logger = require(process.cwd() + "/api/config/logger.config");
require("dotenv").config();

const apiServer = {server: process.env.WEB_SERVER};

const partnerUpMain = (req, res) => {
  res.render("error", {
    title: "Partner Up! | idea-hub.net",
    message: "Page under construction..."
  });
}

module.exports = {
  partnerUpMain
}
