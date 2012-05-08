var Evt = require('eventemitter2').EventEmitter2;
var os = require('os');
var Harvester = function () {
  this.counters = {};
};

Harvester.prototype = new Evt({
  'wildcard': true,
  'delimiter': '::'
});

Harvester.prototype.getCounter = function (counterName) {
  this.counters[counterName] = {};
  this.counters[counterName].start = Date.now();
  var self = this;
  return function (data) {
    if (!self.counters[counterName][data]) {
      self.counters[counterName][data] = 1;
    } else {
      self.counters[counterName][data] += 1;
    }
    self.emit('counter::' + counterName, data);
  };
};
Harvester.prototype.getProcessInfo = function () {
  this.emit('info::processInfo', {
    'title': process.title,
    'versions': process.versions,
    'arch': process.arch,
    'memoryUsage': process.memoryUsage(),
    'uptime': process.uptime(),
    'cwd': process.cwd()
  });
};
Harvester.prototype.getSystemInfo = function () {
  this.emit('info::systemInfo', {
    'hostname': os.hostname(),
    'uptime': os.uptime(),
    'loadavg': os.loadavg(),
    'totalmem': os.totalmem(),
    'freemem': os.freemem(),
    'usedmem': os.totalmem() - os.freemem()
  });
};
module.exports = Harvester;
