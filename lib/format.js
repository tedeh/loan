'use strict';

var _ = require('lodash');
var Utils = require(__dirname + '/utils');
var Loan = require(__dirname + '/loan');

/** * @namespace */
var Format = module.exports;

/**
 * @summary Returns the smallest representation of a loan
 * @param {Loan} loan
 * @param {Object} [defaults] - Defaults to Loan.prototype.getDefaults
 * @return {Loan}
 */
Format.minimal = function(loan) {
  return loan;
};

/**
 * @summary Return a new loan where all relevant are rounded to a certain precision
 * @param {Loan} loan
 * @param {Number} precision
 * @return {Loan}
 */
Format.round = function(loan, precision) {
  if(!_.isPlainObject(loan) && !(loan instanceof Loan)) return null;
  if(!Utils.isFiniteNumber(precision)) return loan;
  _.each(['principal', 'invoice_fee', 'initial_fee', 'amortization', 'interest', 'to_pay'], _.partial(maybeRound, loan, Utils.round));
  if(loan.data) {
    _.each(['monthly_cost', 'total_cost'], _.partial(maybeRound, loan.data, Utils.round));
    _.each(['interest_rate_effective'], _.partial(maybeRound, loan.data, roundInterestTo));
  }
  return loan;

  function maybeRound(container, fn, prop) {
    var num = container[prop];
    if(!_.isNumber(num) || !isFinite(num)) return;
    container[prop] = fn(num, precision);
  }

  function roundInterestTo(num, precision) {
    return Utils.round(num, precision + 3);
  }
};