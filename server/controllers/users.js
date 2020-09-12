const request = require('request');

const apiServer = {server: 'http://localhost:3000'};
if (process.env.NODE_ENV === 'production') {apiOptions.server = 'https://your-URL.com';} // Make sure to add the correct URL

const myProfile = (req, res) => {
  const path = '/api/user/';
  const requestOptions = {
    url: `${apiServer.server}${path}${req.params.userId}`,
    method: 'GET',
    json: true
  };
  request(requestOptions, (err, headers, body) => {
    if (headers.statusCode === 200) {
      console.log(body); // Don't forget to hide sensitive information!!!!
      res.render("myProfile", {
       title: `${body.firstName} ${body.lastName} | E-Hub`,
       userFullName: `${body.firstName} ${body.lastName}`,
       visitorId: body._id,
       userName: body.firstName,
       userEmail: body.email,
       userDescription: body.userDescription,
       userCompany: body.userCompany,
       userWebsite: body.userWebsite,
       userLinkedIn: body.userLinkedIn
      });
    } else {
      res.render("myProfile", {userName: "Error!!!"});
    }
  });
}

const myCollection = (req, res) => {
  const path = "/api/user-collection";
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: "GET",
    headers: {cookie: req.headers.cookie},
    json: true
  };
  request(requestOptions, (err, headers, body) => {
    if (headers.statusCode === 200) {
      res.render("myCollection", {collectionList: body, title: "My Collection | E-Hub"});
    } else {
      if (body.message) {
        return res.render("error", {message: body.message});
      } else {
        return res.render('error', {message: "Whoops, an error has occurred."});
      }
    }
  });
}

const editUserDescription = (req, res) => {
  const path = "/api/update-user-description";
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: "POST",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  }
  request(requestOptions, (err, headers, body) => {
    if (headers.statusCode === 200) {
      return res.status(200).json(body);
    } else {
      if (body.message) {
        return res.status(headers.statusCode).json({message: body.message});
      } else {
        return res.status(headers.statusCode).json({message: "Whoops, an error has occurred."});
      }
    }
  });
}

const editProfileInfo = (req, res) => {
  const path = "/api/update-profile-contents";
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: "POST",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  }
  request(requestOptions, (err, headers, body) => {
    if (headers.statusCode === 200) {
      return res.status(200).json(body);
    } else {
      if (body.message) {
        return res.status(headers.statusCode).json({message: body.message});
      } else {
        return res.status(headers.statusCode).json({message: "Whoops, an error has occurred."});
      }
    }
  });
}

const deleteUserAccount = (req, res) => {
  const path = "/api/user-account-delete";
  const requestOptions = {
    url: `${apiServer.server}${path}`,
    method: "DELETE",
    headers: {cookie: req.headers.cookie},
    form: req.body,
    json: true
  }
  request(requestOptions, (err, headers, body) => {
    if (headers.statusCode === 200) {
      res.clearCookie("token");
      res.render("error", {
        message: "It's sad to see you leave. If you ever feel like coming back, we'll be here working every day to make things better.",
        trigger: "true",
        userId: ""
      });
    } else {
      res.render("error", {
        message: body.message
      });
    }
  });
}

module.exports = {
  myProfile,
  myCollection,
  editUserDescription,
  editProfileInfo,
  deleteUserAccount
}
