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
       userDescription: body.userDescription
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
        return res.render('error', {message: "Ups, an error has occurred."});
      }
    }
  });
}

editUserDescription = (req, res) => {
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
        return res.status(headers.statusCode).json({message: "Ups, an error has occurred."});
      }
    }
  });
}

module.exports = {
  myProfile,
  myCollection,
  editUserDescription
}
