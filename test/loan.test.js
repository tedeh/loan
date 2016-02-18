var _ = require('lodash');
var moment = require('moment');
var should = require('should');
var Loan = require(__dirname + '/../lib/loan');
var fixtures = require(__dirname + '/fixtures/loan.json');

describe('Loan', function() {

  it('should export utils', function() {
    Loan.Utils.should.exist;
    Loan.utils.should.exist;
  });

  it('should export format', function() {
    Loan.Format.should.exist;
    Loan.format.should.exist;
  });

  describe('instance', function() {

    var loan = null;
    beforeEach(function() {
      loan = new Loan();
    });

    it('should return an instance of Loan when not called with new', function() {
      Loan().should.be.instanceof(Loan);
    });

    it('should have some defaults from getDefaults', function() {
      loan.should.containDeep(_.omit(loan.getDefaults(), 'as_of'));
    });

    it('should set as_of to the date of today', function() {
      should(loan.as_of).be.instanceof(Date);
      moment(loan.as_of).isSame(new Date(), 'day').should.equal(true);
    });

    describe('getPaymentPlan', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.short);
      });

      it('should return an empty array when instalments is 0', function() {
        loan.instalments = 0;
        loan.getPaymentPlan().should.be.instanceof(Array).and.have.lengthOf(0);
      });

      it('should return an array with a length equal to instalments here the first is equal to a calculated copy of the loan', function() {
        loan.instalments = 4;
        var plan = loan.getPaymentPlan();
        plan.should.be.instanceof(Array).and.have.lengthOf(4);
        Loan.Format.round((plan[0]), 0).should.containDeep(_.pick(loan.round(0), 'instalments', 'principal', 'interest_rate', 'initial_fee', 'invoice_fee'));
        loan.type = 'serial';
        loan.getPaymentPlan().should.be.instanceof(Array).and.have.lengthOf(4);
      });

      it('should return the correct payment plan for a long annuity loan', function() {
        loan = new Loan(fixtures.long);
        var plan = loan.getPaymentPlan();
        plan.should.have.lengthOf(120);
        var last = Loan.Format.round(_.last(plan), 0);
        last.should.containDeep({
          interest_rate: loan.interest_rate,
          interest: 11,
          to_pay: 2382,
          principal: 2382 - 11,
          as_of: loan.getDateOfInstalment(last.instalment)
        });
      });

      it('should return the correct payment plan for a long serial loan', function() {
        loan = new Loan(_.extend({}, fixtures.long, {type: 'serial'}));
        var plan = loan.getPaymentPlan();
        plan.should.have.lengthOf(120);
        var last = Loan.Format.round(_.last(plan), 0);
        last.should.containDeep({
          interest_rate: loan.interest_rate,
          interest: 8,
          to_pay: 1842,
          principal: 1841 - 8,
          as_of: loan.getDateOfInstalment(last.instalment)
        });
      });

      it('should return a commutative series', function() {
        loan = new Loan(fixtures.long);
        loan.instalments = 10;
        var plan = loan.getPaymentPlan();
        var index = Math.floor(plan.length / 2);
        var nloan = new Loan(plan[index]);
        var nplan = nloan.getPaymentPlan();
        var omit = ['as_of', 'instalments']; // will vary and can't be compared
        plan = plan.slice(index).map(function(p) { return Loan.Format.round(_.omit(p, omit), 0) });
        nplan = nplan.map(function(p) { return Loan.Format.round(_.omit(p, omit), 0); });
        plan.should.containDeepOrdered(nplan);
      });

      it('should return the correct payment plan for an annuity loan without interest', function() {
        loan = new Loan(fixtures.short);
        loan.interest_rate = 0;
        var plan = loan.getPaymentPlan();
        plan.should.have.lengthOf(2);
        plan[1].should.have.property('principal', fixtures.short.principal / 2);
      });
    
    });

    describe('getDateOfInstalment', function() {

      it('should return as_of as set if instalment is not given', function() {
        loan.as_of = new Date(Date.now() - 1000);
        loan.getDateOfInstalment().should.eql(loan.as_of);
      });

      it('should return null if as_of and pay_every is not set', function() {
        delete loan.as_of, loan.pay_every;
        should(loan.getDateOfInstalment()).equal(null);
      });

      it('should return the start of pay_every for the 0th (current) instalment', function() {
        var m = moment().subtract(1, 'second');
        loan.as_of = m.toDate();
        loan.pay_every = 'month';
        loan.getDateOfInstalment(0).should.eql(m.clone().startOf('month').toDate());
        loan.pay_every = 'quarter';
        loan.getDateOfInstalment(0).should.eql(m.clone().startOf('quarter').toDate());
        loan.pay_every = 'year';
        loan.getDateOfInstalment(0).should.eql(m.clone().startOf('year').toDate());
      });

      it('should return successive instalments at the start of pay_every', function() {
        var m = moment().subtract(1, 'second');
        loan.as_of = m.toDate();
        loan.pay_every = 'month';
        loan.getDateOfInstalment(9).should.eql(m.clone().add(9, 'months').startOf('month').toDate());
      });
    
    });

    describe('getTotalCost', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.long);
      });

      it('should return 0 when instalments is 0', function() {
        loan.instalments = 0;
        loan.getTotalCost().should.equal(0);
      });

      it('should not return NaN when having missing properties', function() {
        var loan = new Loan({principal: 10000, instalments: 120});
        loan.getTotalCost().should.be.above(-1);
      });

      it('should return the total cost long annuity loan', function() {
        loan.getTotalCost().should.be.approximately(66351, 0.5);
      });

      it('should return the total cost long serial loan', function() {
        loan.type = 'serial';
        loan.getTotalCost().should.be.approximately(60945, 0.5);
      });
    
    });

    describe('getInterestRatePerInstalment', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.short);
      });

      it('should return 0 when interest_rate is invalid', function() {
        loan.interest_rate = null;
        loan.getInterestRatePerInstalment().should.equal(0);
      });

      it('should return 0 when pay_every is invalid', function() {
        loan.pay_every = 'asdf';
        loan.getInterestRatePerInstalment().should.equal(0);
      });

      it('should return the correct rate when pay_every is month', function() {
        loan.pay_every = 'month';
        loan.getInterestRatePerInstalment().should.equal(loan.interest_rate / 12);
      });

      it('should return the correct rate when pay_every is quarter', function() {
        loan.pay_every = 'quarter';
        loan.getInterestRatePerInstalment().should.equal(loan.interest_rate / 4);
      });

      it('should return the correct rate when pay_every is year', function() {
        loan.pay_every = 'year';
        loan.getInterestRatePerInstalment().should.equal(loan.interest_rate);
      });
    
    });

    describe('getEffectiveInterestRate', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.long);
      });

      it('should return 0 when instalments is 0', function() {
        loan.instalments = 0;
        loan.getEffectiveInterestRate().should.equal(0);
      });

      it('should return the correct effective rate for a long annuity loan', function() {
        var rate = 0.0564;
        var erate = loan.getEffectiveInterestRate();
        erate.should.be.approximately(rate, 0.0005);
      });

      it('should return the correct effective rate for another annuity loan', function() {
        loan = new Loan({
          principal: 55000,
          instalments: 12 * 12,
          initial_fee: 495,
          invoice_fee: 35,
          interest_rate: 0.159
        });
        var erate = loan.getEffectiveInterestRate();
        erate.should.be.approximately(0.1848, 0.0005);
      });
    
    });

    describe('shouldAmortize', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.long);
        loan.as_of = new Date();
      });

      it('should return false when as_of is not set', function() {
        delete loan.as_of;
        loan.shouldAmortize().should.equal(false);
      });

      it('should return false when as_of is within the current month or in the future', function() {
        loan.shouldAmortize().should.equal(false);
        loan.as_of = moment().add(1, 'year').toDate();
        loan.shouldAmortize().should.equal(false);
      });

      it('should return false when instalments is 0', function() {
        loan.as_of = moment().subtract(3, 'months').toDate();
        loan.instalments = 0;
        loan.shouldAmortize().should.equal(false);
      });

      it('should return false when principal is 0', function() {
        loan.as_of = moment().subtract(3, 'months').toDate();
        loan.principal = 0;
        loan.shouldAmortize().should.equal(false);
      });

      it('should return true when as_of is a month previous and before', function() {
        loan.as_of = moment().subtract(3, 'months').toDate();
        loan.shouldAmortize().should.equal(true);
      });

      it('should be passed a date as a parameter to compare to, instead of now', function() {
        var date = moment().subtract(3, 'months').toDate();
        loan.as_of = date; 
        loan.shouldAmortize(date).should.equal(false);
      });

    });

    describe('calculateMeta', function() {

      it('should calculate a number of meta fields', function() {
        loan = new Loan(fixtures.short);
        loan.data.interest_rate_effective = 666; // test unlocked loan
        loan.calculateMeta();
        var firstPlan = _.first(loan.getPaymentPlan());
        loan.data.should.containDeep({
          interest_rate_effective: loan.getEffectiveInterestRate(),
          should_amortize: loan.shouldAmortize(),
          monthly_cost: firstPlan.to_pay + firstPlan.invoice_fee,
          total_cost: loan.getTotalCost()
        });
      });

      it('should not calculate any non-present meta fields if the loan is locked', function() {
        var data = {interest_rate_effective: 999, total_cost: 456, should_amortize: false};
        loan = new Loan(_.extend({}, fixtures.short, {data: data}));
        loan.locked = true;
        loan.data.should.not.have.property('monthly_cost');
        var ndata = loan.calculateMeta();
        loan.data.should.containDeep(data);
        loan.data.should.have.property('monthly_cost', ndata.monthly_cost);
      });
    
    });

    describe('amortize', function() {

      var stableFields = ['interest_rate', 'principal', 'pay_every', 'intial_fee', 'invoice_fee', 'instalments'];

      beforeEach(function() {
        loan = new Loan(fixtures.long);
        loan.as_of = new Date();
      });

      context('by date', function() {

        it('should return a copy of the same loan when when as_of is the current month or not set', function() {
          loan.amortize().should.containDeep(_.pick(loan.toJSON(), stableFields));
          delete loan.as_of;
          loan.amortize().should.containDeep(_.pick(loan.toJSON(), stableFields));
        });

        it('should return a loan that corresponds to the payment plan of the amount of months up to today', function() {
          loan.as_of = moment().subtract(3, 'months').toDate();
          var plan = loan.getPaymentPlan();
          loan.amortize().should.containDeep(_.omit(plan[3], 'data'));
        });

        it('should be passed a date as a parameter and return the loan up to those months', function() {
          var plan = loan.getPaymentPlan();
          var date = moment().add(3, 'months').toDate();
          loan.amortize(date).should.containDeep(_.omit(plan[3], 'data'));
        });

        it('should return a loan with 0 principal and interest instalments are 0', function() {
          loan.instalments = 0;
          loan.amortize().should.containDeep({principal: 0, interest_rate: 0, instalments: 0});
        });

        it('should return a loan with 0 principal when amortization is further away than bounds', function() {
          loan.as_of = moment().subtract(5, 'months').toDate();
          loan.instalments = 3;
          loan.amortize().should.containDeep({
            principal: 0,
            interest_rate: loan.interest_rate,
            instalments: 0,
            instalment: 3
          });
        });

        it('should consider pay_every', function() {
          loan.pay_every = 'year';
          loan.instalments = 2;
          var plan = loan.getPaymentPlan();
          var date = moment().add(3, 'months').toDate();
          loan.amortize(date).should.containDeep(_.omit(plan[0], 'data'));
        });

        it('should calculateMeta when finished', function() {
          loan.as_of = moment().subtract(3, 'months').toDate();
          loan.data.should_amortize = true;
          var plan = loan.getPaymentPlan();
          loan.amortize().should.containDeep({data: {should_amortize: false}});
        });
      
      });
    
    });

    describe('round', function() {

      it('should pass the current object through Loan.Format.round', function() {
        loan = new Loan(fixtures.unrounded);
        loan.round(0).should.containDeep(fixtures.rounded);
      });

      it('should return a copy', function() {
        loan = new Loan({invoice_fee: 4.9});
        var rounded = loan.round(1);
        loan.invoice_fee.should.equal(4.9);
      });
    
    });

    describe('clone', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.long);
      });

      it('should return a superficial clone of the loan', function() {
        var clone = loan.clone();
        clone.should.containDeep(loan);
        clone.should.not.equal(loan);
        clone.should.be.instanceof(Loan);
      });

      it('should also copy deep objects', function() {
        loan.data = {description: 'Hello'};
        var clone = loan.clone();
        clone.data.should.containDeep(loan.data);
        loan.data.should.not.equal(clone.data);
      });
    
    });

    describe('toJSON', function() {

      beforeEach(function() {
        loan = new Loan(fixtures.long);
      });

      it('should return a clone of all important fields of the loan', function() {
        // change some fields from the expected defaults
        loan.invoice_fee = 1;
        loan.type = 'serial';
        loan.pay_every = 'quarter';
        loan.locked = true;
        var json = loan.toJSON();
        _.keys(json).should.containDeep(_.keys(fixtures.long));
        json.should.containDeep({locked: true});
      });

      it('should leave out fields that are equal to the default values', function() {
        var defaults = (new Loan()).getDefaults();
        (new Loan()).toJSON().should.not.containDeep(defaults);
      });

      it('should keep all fields if first parameter is true', function() {
        var defaults = (new Loan()).getDefaults();
        (new Loan()).toJSON(true).should.containDeep(defaults);
      });

      it('should create the same loan when given to the constructor', function() {
        var mloan = new Loan(loan.toJSON());
        mloan.should.containDeep(loan);
      });

      it('should keep the data object as is if set', function() {
        loan.data = {hello: 'asdf', value: 3, interest_rate_effective: 4.3};
        loan.toJSON().should.have.property('data', loan.data);
      });

      it('should not keep payment_plan in the data object', function() {
        loan.data = {payment_plan: []};
        loan.toJSON().data.should.not.have.property('payment_plan');
      });
    
    });
  
  });

});
