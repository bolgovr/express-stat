var dgram = require('dgram');
var Evt = require('events').EventEmitter;
var NetClient = function (port) {
  this.server = dgram.createSocket("udp4");
  this.server.bind(port || 40084);
  this.server.on('message', this.dispatch.bind(this));
  this.statServers = {};
};

NetClient.prototype = new Evt();

NetClient.prototype.addStatServer = function (host, port) {
  this.statServers[host] = this._send.bind(this, {'address': host, 'port': port});
};
NetClient.prototype.broadcast = function (msg, callback) {
  for (var i in this.statServers) {
    if (typeof this.statServers[i] === 'function') {
      this.statServers[i](msg, callback);
    }
  }
};

NetClient.prototype.removeStatServer = function (host) {
  delete this.statServers[host];
};

NetClient.prototype.dispatch = function (message, sender) {
  var msg = JSON.parse(message.toString());
  if (msg.command) {
    this.emit(msg.command, msg);
  } else {
    this.emit('unknown', msg);
  }
};

NetClient.prototype._send = function (reciever, msg, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var messageBuff = new Buffer(JSON.stringify(msg));
  this.server.send(messageBuff, 0, messageBuff.length, reciever.port, reciever.address, callback);
};

module.exports = NetClient;
