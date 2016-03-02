# loan

Loan is a tool for representing and performing calculations on loans in JavaScript.

[loan-npm]: https://www.npmjs.com/package/loan
[loan-travis]: https://travis-ci.org/tedeh/loan
[badge-travis]: https://img.shields.io/travis/tedeh/loan/master.svg?style=flat-square
[badge-npm]: https://img.shields.io/npm/v/loan.svg?style=flat-square

[![Travis branch][badge-travis]][loan-travis]
[![npm][badge-npm]][loan-npm]

## Table of contents

- [Features](#features)
- [Example](#example)
- [Installation](#installation)
- [Version history](#version-history)
- [Class documentation](#class-documentation)
- [Usage](#usage)
- [Contributing](#contributing)

## Features

* Represent and serialize data about a loan
* Calculate payment plans
* Effective interest rate
* Total loan cost
* Amortize a defined loan according to the payment plan
* Etc

## Example

```javascript
var Loan = require('loan');

// set up a monthly annuity loan with 120 instalments until settled
var loan = new Loan({
  type: 'annuity',
  pay_every: 'month',
  principal: 100000,
  interest_rate: 0.05,
  invoice_fee: 25,
  instalments: 120
});

// 0.0565
console.log(loan.getEffectiveInterestRate());
```

## Installation

Loan can be installed with [npm](https://github.com/npm/npm) `npm install` in your shell should suffice.

## Version history

- **v0.0.1**<br />
  *2016-02-18*<br />
  Initial (beta) release.

## Class documentation

A comprehensive class documentation made with [jsdoc](http://usejsdoc.org/) is available at [loan.tedeh.net](http://loan.tedeh.net) together with this readme.

## Usage

This section is a friendly showcase of some of the features a loan object has. For more in-depth information, peruse the source code, [the tests](test/), or the [class documentation][#class-documentation]

### Effective interest rate

### Payment Plan

A payment plan is a list of loans relating to the current instance, where every loan in the list corresponds to a

To return a payment plan for a loan instance,

### Filtering

### Completing unknown values

Sometimes not all values of a given loan are known, and it would be useful to infer the unknowns. Loan has a limited capability (more to come) to do this:

| Value         | Requirements                                             | Description                                                  |
|---------------|----------------------------------------------------------|--------------------------------------------------------------|
| `instalments` | 1) `principal` 2) `interest_rate` 3) `data.monthly_cost` | Calculate the number of instalments left for an annuity loan |

Example calculating instalments given some other values:

```javascript
var Loan = require('loan');

var loan = new Loan({
  principal: 50000,
  interst_rate: 0.05,
  data: {monthly_cost: 3000}
});

loan.canCalculateUnknown('instalments');
// returns true

loan.calculateUnknown();
// returns an object with a single property "instalments" corresponding to the wanted value
```

### Amortizing

When the `as_of` date on a loan instance is earlier in time than one (1) `pay_every` period, `shouldAmortize` returns true. Running `amortize` when this is the case returns a copy of the current loan with the present value updated. The `as_of` date is also updated to correspond to the start of the current `pay_every` period.

Example amortizing an older loan:

```javascript
var Loan = require('loan');
var moment = require('moment');

var loan = new Loan({
  interest_rate: 0.01,
  principal: 10000,
  pay_every: 'month',
  instalments: 10,
  type: 'annuity',
  as_of: moment().subtract(3, 'months').toDate()
});

loan.shouldAmortize();
// returns true

loan.amortize();
// returns a copy of loan but with values following three months of amortization
```

Example fully amortizing a loan:

```javascript
var Loan = require('loan');
var moment = require('moment');

var loan = new Loan({
  interest_rate: 0.01,
  principal: 10000,
  pay_every: 'month',
  instalments: 2, // only 2 instalments left
  type: 'annuity',
  as_of: moment().subtract(5, 'months').toDate()
});

loan.shouldAmortize();
// returns true

loan.amortize();
// returns a copy of loan with a principal equal to zero
```

## Contributing

Highlighting [issues](https://github.com/tedeh/loan/issues) or submitting pull
requests on [Github](https://github.com/tedeh/loan) is most welcome.

Please make sure to follow the style of the project, lint your code with `make lint`, and test it with `make test` before submitting a patch.
