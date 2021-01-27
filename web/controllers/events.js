const request = require("request");
const logger = require(process.cwd() + "/api/config/logger.config");
require("dotenv").config();

const apiServer = {server: process.env.WEB_SERVER};

const eventsMain = (req, res) => {
  res.render("error", {
    title: "Events | idea-hub.net",
    message: "Page under construction..."
  });
}

module.exports = {
  eventsMain
};
