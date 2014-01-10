'use strict';

var assert = require('chai').assert;
var fn = require('../');

describe('fn', function () {

	describe('noop', function () {

		it('is a function that does nothing', function () {
			var noop = fn.noop;
			assert.isFunction(noop);
		});

	});

});
