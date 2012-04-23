var Evt = require('events').EventEmitter;
var express = require('express');
var HttpClient = function (opts) {
  this.statServers = {};
  this.cache = [];
  this.srv = express.createServer();
  this.srv.listen(opts.port);
  this.srv.get(opts.url, this.dispatch.bind(this));
};

HttpClient.prototype = new Evt();

HttpClient.prototype.addStatServer = function (host, port) {
  this.statServers[host] = [];
};
HttpClient.prototype.broadcast = function (msg, callback) {
  for (var srv in this.statServers) {
    this.statServers[srv].push(msg);
  }
};

HttpClient.prototype.removeStatServer = function (host) {
  delete this.statServers[host];
};

HttpClient.prototype.dispatch = function (req, res) {
  if (this.statServers[req.connection.remoteAddress]) {
    res.send(JSON.stringify(this.statServers[req.connection.remoteAddress]));
    this.statServers[req.connection.remoteAddress] = [];
  }
  res.end('\r\n');
};

HttpClient.prototype._send = function (reciever, msg, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var messageBuff = new Buffer(JSON.stringify(msg));
  this.server.send(messageBuff, 0, messageBuff.length, reciever.port, reciever.address, callback);
};

module.exports = HttpClient;
