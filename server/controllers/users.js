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
      console.log(body);
      res.render("myProfile", {
       title: `${body.firstName} ${body.lastName} | E-Hub`,
       userFullName: `${body.firstName} ${body.lastName}`,
       visitorId: body._id,
       userName: body.firstName,
       userEmail: body.email
      });
    } else {
      res.render("myProfile", {userName: "Error!!!"});
    }
  });
}

const myCollection = (req, res) => {
  res.render("myCollection");
}

module.exports = {
  myProfile,
  myCollection
}
