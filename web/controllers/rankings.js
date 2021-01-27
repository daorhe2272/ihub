const request = require("request");
const logger = require(process.cwd() + "/api/config/logger.config");
require("dotenv").config();

const apiServer = {server: process.env.WEB_SERVER};

const rankingsMain = (req, res) => {
  res.render("error", {
    title: "Rankings | idea-hub.net",
    message: "Page under construction..."
  });
}

module.exports = {
  rankingsMain
}
