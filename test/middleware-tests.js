'use strict';
var assert = require('chai').assert;
var qs = require('querystring');
var middlewares = require('../lib/middlewares');
var iSpy = require('i-spy');

describe('middlewares', function () {

	function buildFakeRequest(path, params) {
		return {
			url: path + '?' + params,
			path: path,
			params: qs.parse(params)
		};
	}

	describe('forPathsMatching', function () {

		it('calls the middleware for a matching url', function (done) {
			var urls = [ '/foo/bar' ];
			var fakeRequest = buildFakeRequest('/foo/bar');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy(function (req, res, next) {
				return done(new Error('should have handled the url'));
			});
			var wrapped = iSpy.createSpy(function (req, res, next) {
				assert.equal(req, fakeRequest,
					'should have passed the request');
				assert.equal(res, fakeResponse,
					'should have passed the response');
				assert.equal(next, nextMiddleware,
					'should have passed the response');
				return done();
			});
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
		});

		it('calls the middleware for a url starting the same', function (done) {
			var urls = [ '/foo/bar' ];
			var fakeRequest = buildFakeRequest('/foo/bar/baz');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy(function (req, res, next) {
				return done(new Error('should have handled the url'));
			});
			var wrapped = iSpy.createSpy(function (req, res, next) {
				assert.equal(req, fakeRequest,
					'should have passed the request');
				assert.equal(res, fakeResponse,
					'should have passed the response');
				assert.equal(next, nextMiddleware,
					'should have passed the response');
				return done();
			});
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
		});

		it('skips the middleware for a url not matching', function (done) {
			var urls = [ '/foo/bar' ];
			var fakeRequest = buildFakeRequest('/bar/bar/baz');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy(function () {
				done();
			});
			var wrapped = iSpy.createSpy(function (req, res, next) {
				return done(new Error('should not have handled the url'));
			});
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
		});

		it('favours more specific urls when several match', function () {
			var urls = [
				'/foo/bar',
				'/foo/bar/baz',
				'/foo'
			];
			var fakeRequest = buildFakeRequest('/foo/bar');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy();

			var wrapped = iSpy.createSpy();
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
			assert.equal(wrapped.callCount(), 1,
				'should not have called middleware more than once');
		});

		it('considers params in allowed URL list when matching', function (done) {
			var urls = [
				'/foo/bar?param=true'
			];

			var fakeRequest = buildFakeRequest('/foo/bar');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy(function () {
				done();
			});
			var wrapped = iSpy.createSpy(function (req, res, next) {
				return done(new Error('should not have handled the url'));
			});
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
		});

		it('doesn\'t care about param ordering when matching', function () {
			var urls = [
				'/foo/bar?param1=true&param2=even-truer'
			];

			var fakeRequest = buildFakeRequest('/foo/bar', 'param2=even-truer&param1=true');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy();

			var wrapped = iSpy.createSpy();
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
			assert.equal(wrapped.callCount(), 1,
				'should have called the middleware');
		});

		it('doesn\'t mind if the request has additional params', function () {
			var urls = [
				'/foo/bar?param1=true&param2=even-truer'
			];

			var fakeRequest = buildFakeRequest('/foo/bar', 'param2=even-truer&param3=something&param1=true');
			var fakeResponse = {};
			var nextMiddleware = iSpy.createSpy();

			var wrapped = iSpy.createSpy();
			var wrapper = middlewares.forPathsMatching(urls, wrapped);

			wrapper(fakeRequest, fakeResponse, nextMiddleware);
			assert.equal(wrapped.callCount(), 1,
				'should have called the middleware');
		});
	});

	describe('for paths not matching', function () {
		var forPathsNotMatching = middlewares.forPathsNotMatching;

		it('calls next for matching pattern', function () {
			var fakeNext = iSpy.createSpy();
			var fakeReq = buildFakeRequest('/test/path');
			var middleware = forPathsNotMatching(/^\/test\/path/, null);

			middleware(fakeReq, null, fakeNext);

			assert.isTrue(fakeNext.wasCalled());
		});

		it('calls passed middleware for non-matching pattern', function () {
			var nextMiddleware = iSpy.createSpy();
			var middleware = forPathsNotMatching(
				/^\/test\/path/, nextMiddleware);
			var fakeReq = buildFakeRequest('/nick/boob');
			var fakeRes = {}, fakeNext = {};

			middleware(fakeReq, fakeRes, fakeNext);

			assert.isTrue(nextMiddleware.wasCalled());
			var call = nextMiddleware.calls[0];
			assert.equal(call[0], fakeReq);
			assert.equal(call[1], fakeRes);
			assert.equal(call[2], fakeNext);
		});

	});

});
