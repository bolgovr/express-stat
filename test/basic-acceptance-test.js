var assert = require('assert');
var Zombie = require('zombie');
describe('express', function () {
  var app, browser;

  beforeEach(function (done) {
    app = require('./fixtures/express-app.js');
    app.listen(8083);
    browser = new Zombie();
    done();
  });

  afterEach(function (done) {
    app.close();
    done();
  });

  it('application should run', function (done) {
    browser.visit('http://localhost:8083/', function (error, browser) {
      assert.equal(browser.success, true);
      assert.equal(browser.response[0], 200); //http status code
      assert.equal(browser.response[2], "ok");
      done();
    });
  });
});
