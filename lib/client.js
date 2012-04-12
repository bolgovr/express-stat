var dgram = require('dgram');
var NetClient = function (opts) {
  this.server = dgram.createSocket("udp4");
  this.server.bind(opts.port || 40084);
  this.server.on('message', this.dispatch.bind(this));
};
NetClient.prototype.dispatch = function (message, sender) {
  var command = JSON.parse(message.toString());
  if (command.command === 'ping') {
    this.send(sender, JSON.stringify({'command': 'pong'}));
  }
};
NetClient.prototype.send = function (reciever, msg, callback) {
  callback = (typeof callback === 'function') ? callback : function () {};
  var messageBuff = new Buffer(msg);
  this.server.send(messageBuff, 0, messageBuff.length, reciever.port, reciever.address, callback);
};
module.exports = NetClient;
