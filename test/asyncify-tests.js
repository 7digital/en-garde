'use strict';

var assert = require('chai').assert;
var fn = require('../');
var iSpy = require('i-spy');

describe('asyncify', function () {

	it('calls the callback with the return value', function (done) {
		var sync = iSpy.createSpy(function () { return 42; });
		var async = fn.asyncify(sync);

		async(function (err, res) {
			assert.equal(res, 42);
			done(err);
		});
	});

	it('calls the callback with the thrown error', function (done) {
		var fakeError = new Error('42');
		var sync = iSpy.createSpy(function () { throw fakeError; });
		var async = fn.asyncify(sync);

		async(function (err, res) {
			assert.equal(err, fakeError);
			done();
		});
	});

	it('proxies the arguments and set the context', function (done) {
		var sync = iSpy.createSpy();
		var fakeContext = {};
		var async = fn.asyncify(sync, fakeContext);


		async('arg1', 2, function (err, res) {
			assert.equal(sync.calls[0][0], 'arg1');
			assert.equal(sync.calls[0][1], 2);
			assert.equal(sync.context, fakeContext);
			done();
		});
	});
});
