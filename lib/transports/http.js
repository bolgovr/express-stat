var Evt = require('events').EventEmitter;
var express = require('express');
var HttpClient = function (opts) {
  this.statServers = {};
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
  this.statServers[host.toString()] = {};
};
HttpClient.prototype.broadcast = function (msg, callback) {
  var reciever = null;
  for (var srv in this.statServers) {
    reciever = this.statServers[srv];
    if (!reciever[msg.eventName]) {
      reciever[msg.eventName] = {
          'start': msg.start
        };
    }
    reciever = reciever[msg.eventName];
    reciever.end = Date.now();
    delete msg.end;
    delete msg.eventName;
    delete msg.start;
    for (var prop in msg) {
      if (reciever[prop]) {
        reciever[prop] += msg[prop];
      } else {
        reciever[prop] = msg[prop];
      }
    }


  }
};

HttpClient.prototype.removeStatServer = function (host) {
  delete this.statServers[host];
};

HttpClient.prototype.dispatch = function (req, res) {
  if (this.statServers[req.params.key]) {
    res.json(this.statServers[req.params.key]);
    this.statServers[req.params.key] = {};
  } else {
    res.end('');
  }
};

module.exports = HttpClient;
