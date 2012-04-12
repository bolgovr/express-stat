var express = require('express');
var app = express.createServer();


app.get('/', function (req, res) {
  res.send('ok');
});

module.exports = app;
