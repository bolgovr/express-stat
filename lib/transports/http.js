var Evt = require('events').EventEmitter;
var express = require('express');
var HttpClient = function (opts) {
  this.statServers = {};
  this.maxSavingTime = 3600 * 1000; // save stats for 1 hour
  this.timeouts = {};
  this.srv = express.createServer();
  this.srv.listen(opts.port);
  this.srv.get((opts.url || '/') + '/:key', this.dispatch.bind(this));
  var self = this;
  if (opts.statServers) {
    opts.statServers.forEach(function (statSrv) {
      self.addStatServer(statSrv);
      self.timeouts[statSrv] = setTimeout(self._cleanStats.bind(self, statSrv), self.maxSavingTime);
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
HttpClient.prototype._cleanStats = function (serverKey) {
  if (this.statServers[serverKey]) {
    this.statServers[serverKey] = {};
  }
  if (this.timeouts[serverKey]) {
    cleanTimeout(this.timeouts[serverKey]);
    this.timeouts[serverKey] = setTimeout(this._cleanStats.bind(this, serverKey), this.maxSavingTime);
  }
};
HttpClient.prototype.removeStatServer = function (host) {
  delete this.statServers[host];
};

HttpClient.prototype.dispatch = function (req, res) {
  if (this.statServers[req.params.key]) {
    res.json(this.statServers[req.params.key]);
    this._cleanStats(req.params.key);
  } else {
    res.end('');
  }
};

module.exports = HttpClient;
