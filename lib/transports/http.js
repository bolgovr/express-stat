var Evt = require('events').EventEmitter;
var express = require('express');
var HttpClient = function (opts) {
  this.statServers = {};
  this.cache = [];
  this.srv = express.createServer();
  this.srv.listen(opts.port);
  this.srv.get((opts.url || '/') + '/:key', this.dispatch.bind(this));
  var self = this;
  if (opts.statServers) {
    opts.statServers.forEach(function (statSrv) {
      self.addStatServer(statSrv);
    });
  }
};

HttpClient.prototype = new Evt();

HttpClient.prototype.addStatServer = function (host) {
  this.statServers[host.toString()] = [];
};
HttpClient.prototype.broadcast = function (msg, callback) {
  msg.end = Date.now();
  for (var srv in this.statServers) {
    this.statServers[srv].push(msg);
  }
};

HttpClient.prototype.removeStatServer = function (host) {
  delete this.statServers[host];
};

HttpClient.prototype.dispatch = function (req, res) {
  if (this.statServers[req.params.key]) {
    res.json(this.statServers[req.params.key]);
    this.statServers[req.params.key] = [];
  }
  res.end('');
};

module.exports = HttpClient;
