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
  const path = "/api/user/";
  const requestOptions = {
    url: `${apiServer.server}${path}${res.locals.userId}`,
    method: "GET",
    json: true
  };
  request(requestOptions, (err, response, body) => {
    if (response.statusCode === 200) {
      res.render("contact-info", {
        title: "Contact | idea-hub.net",
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email
      });
    } else if (err) {
      console.log(err);
    } else {
      res.render("contact-info", {
        title: "Contact | idea-hub.net"
      });
    }
  });
}

const cookiePolicy = (req, res) => {
  res.render("cookie-policy", {
    title: "Cookie Policy | idea-hub.net"
  })
}

const privacyPolicy = (req, res) => {
  res.render("privacy-policy", {
    title: "Privacy Policy | idea-hub.net"
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
  cookiePolicy,
  privacyPolicy,
  serviceTerms
};
