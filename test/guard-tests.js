'use strict';
var assert = require('chai').assert;
var guard = require('../').guard;
var iSpy = require('i-spy');

describe('guard', function () {

	describe('exit', function () {

		it('creates a guarded callback', function () {
			var spy = iSpy.createSpy();
			var cb = guard.exit(spy);

			assert.isFunction(cb, 'expected a function');
			assert(cb.isGuard, 'expected function to be guarded');
			assert.equal(cb.length, 2, 'expected two arguments');
			assert.equal(cb.msg, '', 'expected a default message');
			assert.equal(cb.code, 1, 'expected a default exit code');
			assert.equal(cb.guarded, spy, 'expected the spy to be guarded');
		});

		it('creates a guarded callback with a message', function () {
			var spy = iSpy.createSpy();
			var cb = guard.exit('oops', spy);

			assert.isFunction(cb, 'expected a function');
			assert(cb.isGuard, 'expected function to be guarded');
			assert.equal(cb.length, 2, 'expected two arguments');
			assert.equal(cb.msg, 'oops', 'expected the message to be set');
			assert.equal(cb.code, 1, 'expected a default exit code');
			assert.equal(cb.guarded, spy, 'expected the spy to be guarded');
		});

		it('creates a guarded callback with a message and an exit code',
			function () {
			var spy = iSpy.createSpy();
			var cb = guard.exit('oops', 42, spy);

			assert.isFunction(cb, 'expected a function');
			assert(cb.isGuard, 'expected function to be guarded');
			assert.equal(cb.length, 2, 'expected two arguments');
			assert.equal(cb.msg, 'oops', 'expected the message to be set');
			assert.equal(cb.code, 42, 'expected the exit code to be set');
			assert.equal(cb.guarded, spy, 'expected the spy to be guarded');
		});

		it('calls the callback with the result', function () {
			var result = { foo: 'bar' };
			var spy = iSpy.createSpy();
			var cb = guard.exit(spy);

			cb(null, result);
			assert(spy.wasCalled(), 'expected the spy to be called');
			assert.equal(spy.firstCall()[0], result,
				'expected the result to be passed to the spy');
		});

	});

	describe('propagate', function () {

		it('creates a guarded callback',
			function () {
			var successHandler = iSpy.createSpy();
			var outerCallback = iSpy.createSpy();
			var cb = guard.propagate(console, successHandler, outerCallback);

			assert.isFunction(cb, 'expected a function');
			assert(cb.isGuard, 'expected function to be guarded');
			assert.equal(cb.length, 2, 'expected two arguments');
			assert.equal(cb.outerCallback, outerCallback,
				'expected the outerCallback to be set');
			assert.equal(cb.guarded, successHandler,
				'expected the successHandler to be guarded');
			assert.equal(cb.msg, '',
				'expected the message to be defaulted');
			assert.equal(cb.log, console,
				'expected the log to be set');
		});

		it('creates a guarded callback with a message',
			function () {
			var successHandler = iSpy.createSpy();
			var outerCallback = iSpy.createSpy();
			var cb = guard.propagate(console, successHandler, outerCallback);

			assert.isFunction(cb, 'expected a function');
			assert(cb.isGuard, 'expected function to be guarded');
			assert.equal(cb.length, 2, 'expected two arguments');
			assert.equal(cb.outerCallback, outerCallback,
				'expected the outerCallback to be set');
			assert.equal(cb.guarded, successHandler,
				'expected the successHandler to be guarded');
			assert.equal(cb.log, console,
				'expected the log to be set');
		});

		it('calls the success handler with the result', function () {
			var result = { foo: 'bar' };
			var successHandler = iSpy.createSpy();
			var outerCallback = iSpy.createSpy();
			var cb = guard.propagate(console, successHandler, outerCallback);

			cb(null, result);
			assert(successHandler.wasCalled(),
				'expected the successHandler to be called');
			assert.equal(successHandler.firstCall()[0], result,
				'expected the result to be passed to the successHandler');
			assert(!outerCallback.wasCalled(),
				'did not expect the outer callback to be called');
		});

		it('propagates errors to the outer callback', function () {
			var err = new Error('Oh noes');
			var successHandler = iSpy.createSpy();
			var outerCallback = iSpy.createSpy();
			var log = { error: iSpy.createSpy() };
			var cb = guard.propagate(log, successHandler, outerCallback);

			cb(err);
			assert(outerCallback.wasCalled(),
				'expected the outer callback to be called');
			assert.equal(outerCallback.firstCall()[0], err,
				'expected the error to be passed to the outer callback');
			assert(!successHandler.wasCalled(),
				'did not expect the success handler to be called');
		});

		it('logs errors', function () {
			var err = new Error('Oh noes');
			var successHandler = iSpy.createSpy();
			var outerCallback = iSpy.createSpy();
			var log = { error: iSpy.createSpy() };
			var cb = guard.propagate(log, successHandler, outerCallback);

			cb(err);
			assert(log.error.wasCalled(), 'expected log.error to be called');
			assert.equal(log.error.callCount(), 1,
				'expected log.error to be called once');
			assert.equal(log.error.firstCall()[0], err,
				'expected error to be logged');
		});

		it('logs the message', function () {
			var err = new Error('Oh noes');
			var msg = 'Error frobnicating the frobs';
			var successHandler = iSpy.createSpy();
			var outerCallback = iSpy.createSpy();
			var log = { error: iSpy.createSpy() };
			var cb = guard.propagate(log, msg, successHandler, outerCallback);

			cb(err);
			assert(log.error.wasCalled(), 'expected log.error to be called');
			assert.equal(log.error.callCount(), 2,
				'expected log.error to be called twice');
			assert.equal(log.error.firstCall()[0], msg,
				'expected error to be logged');
			assert.equal(log.error.lastCall()[0], err,
				'expected error to be logged');
		});

	});

	describe('logAndIgnoreError', function () {
		var fakeResults = {
			foo: 'bar'
		};
		var fakeError = new Error('Oh no');
		var fakeLogger = {
			error: iSpy.createSpy()
		};

		beforeEach(function () {
			fakeLogger.error.reset();
		});

		function callbackWithResults(cb) {
			process.nextTick(function () {
				return cb(null, fakeResults);
			});
		}

		function callbackWithError(cb) {
			process.nextTick(function () {
				return cb(fakeError);
			});
		}

		function callbackWithInputArg(someArg, cb) {
			process.nextTick(function () {
				return cb(null, someArg);
			});
		}

		it('propagates results to callback', function (done) {
			var wrapped = guard.logAndIgnore(fakeLogger, callbackWithResults);

			wrapped(function (err, res) {
				assert(!err, 'expected no error');
				assert.strictEqual(fakeResults, res,
					'expected to be called back with the results');
				assert(fakeLogger.error.wasNotCalled(),
					'expected the logger not to be called');
				done();
			});
		});

		it('calls back with no error', function (done) {
			var wrapped = guard.logAndIgnore(fakeLogger, callbackWithError);

			wrapped(function (err, res) {
				assert(!err, 'expected no error');
				assert(!res,'expected to be called back with no results');
				assert(fakeLogger.error.wasCalled(),
					'expected the logger to be called');
				done();
			});
		});

		it('passes all arguments to the wrapped function', function (done) {
			var wrapped = guard.logAndIgnore(fakeLogger, callbackWithInputArg);
			var inputArg = 'blah';

			wrapped(inputArg, function (err, res) {
				assert(!err, 'expected no error');
				assert.equal(res, inputArg,
					'expected to be called back with the input argument');
				assert(fakeLogger.error.wasNotCalled(),
					'expected the logger not to be called');
				done();
			});
		});
	});
});
