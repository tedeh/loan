var should = require('should');
var Utils = require(__dirname + '/../lib/utils');

describe('Utils', function() {

  describe('round', function() {

    var round = Utils.round;

    it('should return NaN for invalid input', function() {
      should(round(true)).be.NaN;
      should(round(null)).be.NaN;
      should(round()).be.NaN;
    });

    it('should return the number for no given precision', function() {
      round(4.3).should.equal(4.3);
      round(666).should.equal(666);
    });

    it('should round a number to the given precision', function() {
      round(1.23456, 3).should.equal(1.235);
      round(666, 2).should.equal(666);
      round(1.05, 0).should.equal(1);
    });
  
  });

  describe('isFiniteNumber', function() {

    var isFiniteNumber = Utils.isFiniteNumber;

    it('should return true for finite numbers', function() {
      isFiniteNumber(-1).should.equal(true);
      isFiniteNumber(0).should.equal(true);
    });

    it('should return false otherwise', function() {
      isFiniteNumber().should.equal(false);
      isFiniteNumber(NaN).should.equal(false);
      isFiniteNumber(Infinity).should.equal(false);
    });
  
  });

});
