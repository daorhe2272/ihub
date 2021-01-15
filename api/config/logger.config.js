const fs = require("fs");
require("dotenv").config();

function auditLog(req) {
  fs.appendFile(
    process.cwd() + '/bin/audit.log.txt',
    `${Date.now()},${req.ip},${req.method},${req.headers["user-agent"]},${req.headers.referer},${req.body.email}\n`,
    function (err) {
      if (err) {} // Log error
    }
  );
};

const logAccountDelete = (req, res, userInfo) => {
  let reasonForAccountDelete = req.body.reasonForAccountDelete;
  if (reasonForAccountDelete.length > 150) {
    reasonForAccountDelete = reasonForAccountDelete.substring(0, 150);
  }
  reasonForAccountDelete = reasonForAccountDelete.replace(/,/g, " ");
  fs.appendFile(
    process.cwd() + "/bin/delete.log.txt",
    `${Date.now()},${userInfo.firstName} ${userInfo.lastName},${userInfo.email},${userInfo.verified},${userInfo.userActivity.comments.length},${userInfo.userActivity.shares.length},${userInfo.userActivity.collections.length},${reasonForAccountDelete}\n`,
    function (err) {
      if (err) {} // Log error
    }
  );
}

function logError(error) {
  fs.appendFile(
    process.cwd() + "/bin/errors.log.txt",
    error.toString(),
    function (err) {
      if (err) {}
    }
  );
}

module.exports = {
  auditLog,
  logAccountDelete,
  logError
};
