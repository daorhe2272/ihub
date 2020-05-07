const request = require('request');

const apiServer = {server: 'http://localhost:3000'};
if (process.env.NODE_ENV === 'production') {apiOptions.server = 'https://your-URL.com';} // Make sure to add the correct URL

const register = (req, res) => {
  const path = '/api/register';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    form: req.body
  };
  request.post(requestOptions, (err, {statusCode}, body) => {
    if (statusCode !== 200) {
      return res.render('error', {
        message: "An error occurred during registration. Please try again and make sure all fields are filled in correctly."
      });
    } else if (!body.length) {
      return res.render('error', {
        message: "Ups, something went wrong. Let us know and we'll be working to solve it as soon as possible."
      });
    }
    res.render('error', {
      message: "Welcome to ehub, the social network for entrepreneurs. Thank you for choosing us. We have sent you a verification link to your e-mail. It should arrive in a few minutes!",
      trigger: "true"
    });
  });
};

const login = (req, res) => {
  const path = '/api/login';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: 'POST',
    json: {}
  };
  request(requestOptions, (err, {statusCode}, body) => {
		let data = [];
		if (statusCode === 200 && body.length) {
			data = body
		}
		console.log(data); // Comment out this line for production
		renderAuth(req, res, data);
	});
};

renderAuth = (req, res, data) => {
  let message = null;
  if (!(data instanceof Array)) {
    message = "Ups, something went wrong. We'll be working to solve it soon."
    data = [];
  }
  res.redirect('/');
};

module.exports = {
	register,
	login
};
