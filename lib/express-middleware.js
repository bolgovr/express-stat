var NetClient = require('./client.js');
var client = new NetClient({});
module.exports = {
  "stats": function () {
    return function (req, res, next) {
      next();
    };
  }
};

