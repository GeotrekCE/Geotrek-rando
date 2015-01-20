// Dependencies
var chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai);

beforeEach(function() {
  // Create a new sandbox before each test
  this.sinon = sinon.sandbox.create();
});

afterEach(function() {
  // Cleanup the sandbox to remove all the stubs
  this.sinon.restore();
});

module.exports = {
  expect: chai.expect,
  spy: sinon.spy,
  stub: sinon.stub
};