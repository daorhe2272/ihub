const request = require('request');
const logger = require(process.cwd() + "/api/config/logger.config");
require("dotenv").config();

const apiServer = {server: process.env.WEB_SERVER};

const register = (req, res) => {
  const path = '/api/register';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    form: req.body
  };
  request.post(requestOptions, (err, {statusCode}, body) => {
    if (err) {logger.logError(err); return res.send("Whoops, an error occurred. Please try again later.");}
    if (statusCode == 200) {
      res.render('error', {
        message: "Welcome to Idea-Hub, the social network for entrepreneurs. Thank you for choosing us. We have sent you a verification link to your e-mail. It should arrive in a few minutes!",
        trigger: "true"
      });
    }
    if (!JSON.parse(body).message) {
      console.log(body);
      return res.render('error', {
        message: "Ups, something went wrong. Let us know and we'll be working to solve it as soon as possible."
      });
    }
    return res.render('error', {
      message: JSON.parse(body).message
    });
  });
};

const verifyAccount = (req, res) => {
  const path = '/api/verify-account/';
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.verHash}`,
    method: 'GET'
  };
  request(requestOptions, (err, header, body) => {
    if (err) {logger.logError(err); return res.send("Whoops, an error occurred. Please try again later.");}
    if (header.statusCode == 200) {
      res.cookie(header.rawHeaders[3]);
      return res.render('error', {
        message: JSON.parse(body).message,
        trigger: "true"
      });
    }
    if (!JSON.parse(body).message) {
      return res.render('error', {message: "Ups, something went wrong. Let us know and we'll be working to solve it as soon as possible."});
    }
    return res.render('error', {
      message: JSON.parse(body).message
    });
  });
};

const login = (req, res) => {
  const path = '/api/login';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: 'POST',
    form: req.body,
    headers: req.headers
  };
  request(requestOptions, (err, header, body) => {
		if (err) {logger.logError(err); return res.send("Whoops, an error occurred. Please try again later.");}
		if (header.statusCode === 200 && body.length) {
		  res.cookie(header.rawHeaders[3]);
		  res.redirect('/');
    }
    return res.render('error', {
      message: JSON.parse(body).message
    });
  });
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.redirect('/');
}

const requestPasswordReset = (req, res) => {
  const path = '/api/reset-password';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: 'GET',
    form: req.body
  };
  request(requestOptions, (err, header, body) => {
    if (err) {logger.logError(err); return res.send("Whoops, an error occurred. Please try again later.");}
    if (header.statusCode === 200 && body.length) {
      return res.render('error', {
        message: JSON.parse(body).message,
        trigger: true
      });
    }
    return res.render('error', {
      message: JSON.parse(body).message
    });
  });
};

const formRequest = (req, res) => {
  const path = '/api/request-reset/';
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.verHash}`,
    method: 'GET'
  };
  request(requestOptions, (err, header, body) => {
    if (err) {logger.logError(err); return res.send("Whoops, an error occurred. Please try again later.");}
    if (header.statusCode == 200 && body.length) {
      return res.render('passwordReset', {
        verHash: req.params.verHash,
        name: JSON.parse(body).firstName
      });
    }
    return res.render('error', {
      message: JSON.parse(body).message
    });
  });
};

const changePassword = (req, res) => {
  const path = '/api/change-password/';
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.verHash}`,
    method: 'PUT',
    form: req.body,
    headers: req.headers
  };
  request(requestOptions, (err, header, body) => {
    if (err) {logger.logError(err); return res.send("Whoops, an error occurred. Please try again later.");}
    if (header.statusCode == 200 && body.length) {
      return res.render('error', {
        message: JSON.parse(body).message,
        trigger: true
      });
    }
    return res.render('error', {
      message: JSON.parse(body).message
    });
  });
};

module.exports = {
	register,
	verifyAccount,
	login,
	logout,
	requestPasswordReset,
	formRequest,
	changePassword
};
