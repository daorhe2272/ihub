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

const loadMorePosts = (req, res) => {
  const path = "/api/load-more-posts";
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: "POST",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.status(400).json({message:"An error has occurred"});}
    else if (headers.statusCode === 200) {
      res.render("./mixins/morePosts", {
        sharesList: body
      });
    } else {
      return res.status(400).json({message:"An error has occurred"});
    }
  });
}

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
    headers: req.headers
  };
  request(requestOptions, (err, header, body) => {
    if (err) {return res.send(err);}
    if (header.statusCode === 200) {
      return res.redirect('/');
    }
    return res.render('error', {message: JSON.parse(body).message});
  });
}

const showPost = (req, res) => {
  const path = '/api/get-post/';
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.postId}`,
    method: "GET",
    headers: req.headers,
    json: true
  };
  request(requestOptions, (err, header, body) => {
    if (err) {return res.send(err);}
    else if (header.statusCode === 200) {
      return res.render("shares", {
        title: "Shared content | E-Hub",
        sharesList: [body],
        message: "",
        trigger2: ""
      });
    } else {
      return res.render("error", {message: "Ups... Something went wrong."});
    }
  });
}

const addComment = (req, res) => {
  const path = "/api/post-comment/";
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.postId}`,
    method: "POST",
    form: req.body,
    headers: {cookie: req.headers.cookie}
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.send(err);}
    else if (headers.statusCode === 200) {
      return res.status(200).json(body);
    } else if (headers.statusCode === 401) {
      return res.status(401).json({message:"Access forbidden"});
    } else {
      return res.render("error", {message: "Ups... Something went wrong."});
    }
  });
}

const deleteComment = (req, res) => {
  const path = "/api/delete-comment/";
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.commentId}-${req.params.postId}`,
    method: "DELETE",
    headers: {cookie: req.headers.cookie}
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.send(err);}
    else if (headers.statusCode === 200) {
      res.status(200).json(JSON.parse(body));
    }
  });
}

const reportPost = (req, res) => {
  const path = "/api/report-post/";
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.postId}-${req.ip}`,
    method: "POST",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.status(400).json({message:"An error has occurred"});}
    else if (headers.statusCode === 200) {
      res.status(200).json(body);
    }
  });
}

const updatePost = (req, res) => {
  const path = "/api/edit-share/";
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.postId}`,
    method: "PUT",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.status(400).json({message:"An error has occurred"});}
    else if (headers.statusCode === 200) {
      return res.redirect("/");
    } else {
      return res.render('error', {message: body.message});
    }
  });
}

const updateComment = (req, res) => {
  const path = "/api/edit-comment/";
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.commentId}`,
    method: "PUT",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.status(400).json({message:"An error has occurred"});}
    else if (headers.statusCode === 200) {
      return res.status(200).json(body);
    }
    else {return res.status(400).json({message:"An error has occurred"});}
  });
}

const addToCollection = (req, res) => {
  const path = "/api/add-to-collection/";
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.sourceId}`,
    method: "GET",
    headers: {cookie: req.headers.cookie},
    json:true
  };
  request(requestOptions, (err, headers, body) => {
    if (err) {return res.status(400).json({message:"An error has occurred"});}
    else if (headers.statusCode === 200) {
      return res.status(200).json(body);
    } else {
      return res.status(400).json({message:"An error has occurred"});
    }
  });
}

module.exports = {
	sharesList,
	loadMorePosts,
	createPost,
	deletePost,
	showPost,
	addComment,
	deleteComment,
	reportPost,
	updatePost,
	updateComment,
	addToCollection
};
