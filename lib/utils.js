'use strict';

/** * @namespace */
var Utils = module.exports;

// same reference as other files use, for tidyness
var utils = Utils;

/**
 * @summary Round a number to a certain decimal precision
 * @param {Number}
 * @return {Number}
 */
Utils.round = function(n, precision) {
  if(!utils.isFiniteNumber(n)) return NaN;
  if(!utils.isFiniteNumber(precision)) return n;
  var fac = Math.pow(10, precision);
  return Math.round(n * fac) / fac;
};

/**
 * @summary Determine if a variable is a finite number
 * @param {*} n
 * @return {Boolean}
 */
Utils.isFiniteNumber = function(n) {
  return typeof(n) === 'number' && isFinite(n);
};
