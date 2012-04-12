module.exports = {
  "stats": function () {
    return function (req, res, next) {
      next();
    };
  }
};

