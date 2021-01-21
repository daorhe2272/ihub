const request = require("request");
const logger = require(process.cwd() + "/api/config/logger.config");
require("dotenv").config();

const apiServer = {server: process.env.WEB_SERVER};

const aboutPage = (req, res) => {
  res.render("about", {
    title: "About | idea-hub.net"
  });
}

const contactInfo = (req, res) => {
  res.render("error", {
    title: "Contact | idea-hub.net",
    message: "Under construction..."
  });
}

const cookiesPolicy = (req, res) => {
  res.render("error", {
    title: "Cookies Policy | idea-hub.net",
    message: "Under construction..."
  })
}

const privacyPolicy = (req, res) => {
  res.render("error", {
    title: "Privacy Policy | idea-hub.net",
    message: "Under construction..."
  })
}

const serviceTerms = (req, res) => {
  res.render("error", {
    title: "Terms of Service | idea-hub.net",
    message: "Under construction..."
  })
}

module.exports = {
  contactInfo,
  aboutPage,
  cookiesPolicy,
  privacyPolicy,
  serviceTerms
};
