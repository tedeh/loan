var _ = require('lodash');
var should = require('should');
var Loan = require(__dirname + '/../lib/loan');
var Format = require(__dirname + '/../lib/format');
var fixtures = require(__dirname + '/fixtures/loan.json');

describe('Format', function() {

  describe('round', function() {

    var round = Format.round;
    var loan = null;

    beforeEach(function() {
      loan = new Loan(_.extend({}, fixtures.short, fixtures.unrounded, {data: {
        monthly_cost: 1000.5,
        interest_rate_effective: 0.0457777777,
        total_cost: 10000.9
      }}));
    });

    it('should return null if not given a loan', function() {
      should(round(2, 0)).equal(null);
    });

    it('should return the loan as is if not given a precision', function() {
      round(loan).should.containDeep(loan.toJSON());
      round(loan).should.be.instanceof(Loan);
    });

    it('should round select variables to an arbitrary precision', function() {
      round(loan, 0).should.containDeep(fixtures.rounded);
    });

    it('should round select variables in the data object', function() {
      round(loan, 0).data.should.containDeep({
        monthly_cost: 1001,
        total_cost: 10001,
        interest_rate_effective: 0.046
      });
    });
  
  });

});
