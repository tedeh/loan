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
- [Usage](#usage)
- [Class documentation](#class-documentation)
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

- **0.0.1**
  *2016-02-18*
  Initial (beta) release.

## Usage

Coming soon! Until then, read the source and the tests.

## Class documentation

*Coming soon!*

A comprehensive class documentation made with [jsdoc](http://usejsdoc.org/) is available at [loan.tedeh.net](http://loan.tedeh.net).

## Contributing

Highlighting [issues](https://github.com/tedeh/loan/issues) or submitting pull
requests on [Github](https://github.com/tedeh/loan) is most welcome.

Please make sure to follow the style of the project, lint your code with `make lint`, and test it with `make test` before submitting a patch.
