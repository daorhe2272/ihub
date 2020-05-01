const request = require('request');

// Sets the default server URL for the local development. If the application is running in production mode, sets a different base URL
const apiServer = {server: 'http://localhost:3000'};
if (process.env.NODE_ENV === 'production') {apiOptions.server = 'https://your-URL.com';}

/* GET shares list (homepage) */
const sharesList = (req, res) => {
  const path = '/api';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: 'GET',
    json: {}
  };
  request(requestOptions, (err, {statusCode}, body) => {
		let data = [];
		if (statusCode === 200 && body.length) {
			data = body
		}
		console.log(data); // Comment out this line for production
		renderShares(req, res, data);
	});
};

const renderShares = (req, res, responseBody) => {
	let message = null;
	if (!(responseBody instanceof Array)) {
		message = "API lookup error";
		responseBody = [];
	} else {
		if (!responseBody.length) {
			message = "No shared posts found in your area";
		}
	}
	res.render('shares', {
	  title: 'The Entrepreneurial Hub - Main page',
	  sharesList: responseBody,
	  message
	});
};

module.exports = {
	sharesList
};
