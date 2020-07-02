const request = require('request');

const apiServer = {server: 'http://localhost:3000'};
// if (process.env.NODE_ENV === 'production') {apiOptions.server = 'https://your-URL.com';}

/* GET shares list (homepage) */
const sharesList = (req, res) => {
  const path = '/api';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: 'GET',
    headers: req.headers,
    json: true
  };
  request(requestOptions, (err, {statusCode}, body) => {
		let data = [];
		if (statusCode === 200 && body.length) {
			data = body
		}
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
	if (res.locals.userId) {trigger2 = "true";} else {trigger2 = "";}
	res.render('shares', {
	  title: 'E-Hub',
	  sharesList: responseBody,
	  message,
	  trigger2
	});
};

const createPost = (req, res) => {
  const path = '/api';
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: 'POST',
    form: req.body
  };
  request(requestOptions, (err, header, body) => {
    if (err) {return res.send(err);}
    if (header.statusCode === 201) {
      return res.redirect('/');
    }
    return res.render('error', {message: "Whoops! Something went wrong."});
  });
};

const deletePost = (req, res) => {
  const path = '/api/delete-share/';
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.postId}`,
    method: 'DELETE',
    form: res.locals
  };
  request(requestOptions, (err, header, body) => {
    if (err) {return res.send(err);}
    if (header.statusCode === 200) {
      return res.redirect('/');
    }
    return res.render('error', {message: JSON.parse(body).message});
  });
}

module.exports = {
	sharesList,
	createPost,
	deletePost
};
