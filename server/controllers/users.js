const request = require('request');

// Sets the default server URL for the local development
const apiServer = {
	server: 'http://localhost:3000'
};
// If the application is running in production mode, sets a different base URL
if (process.env.NODE_ENV === 'production') {apiOptions.server = 'https://your-URL.com';}

const authenticating = (req, res) => {
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
  res.locals();
};

module.exports = {
	authenticating
};
