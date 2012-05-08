var redis = require('redis');
var Evt = require('events').EventEmitter;

var RedisClient = function (opts) {
  this.statChannels = {};
  this.communicator = redis.createClient();
  this.intervals = {};
  this.collectingTime = 1000; //1 sec
  var self = this;
  if (opts.statServers) {
    opts.statServers.forEach(function (statSrv) {
      self.addStatChannel(statSrv);
    });
  }
};

RedisClient.prototype = new Evt();

RedisClient.prototype.addStatChannel = function (channel) {
  this.statChannels[channel.toString()] = {};
  this.intervals = setInterval(this.pubStats.bind(this), this.collectingTime);
};
RedisClient.prototype.broadcast = function (msg, callback) {
  var reciever = null;
  for (var channel in this.statChannels) {
    reciever = this.statChannels[channel];
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
RedisClient.prototype._cleanStats = function (channel) {
  if (this.statChannels[channel]) {
    this.statChannels[channel] = {};
  }
};
RedisClient.prototype.removeStatChannel = function (channel) {
  delete this.statChannels[channel];
};

RedisClient.prototype.pubStats = function () {
  var pub = function (msg, channel) {
    try {
      msg = JSON.stringify(msg);
    } catch (e) {
      console.dir(e);
    }
    this.communicator.publish(channel, msg);
    this._cleanStats(channel);
  };
  for (var i in this.statChannels) {
    pub.call(this, this.statChannels[i], i);
  }
};

module.exports = RedisClient;
