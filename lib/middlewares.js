'use strict';
var qs = require('querystring');
var _ = require('lodash');

function stringStartingWith(first, second) {
	return first.indexOf(second) === 0;
}

function forPathsMatching(urls, middleware) {
	var parsedUrls = urls.map(parse);

	return function urlMatchingMiddleware(req, res, next) {
		var handled = false;

		parsedUrls.forEach(function (url) {
			if (stringStartingWith(req.path, url.path) && !handled) {
				var qsMatches = _.all(url.params, function (value, key) {
					return req.params[key] === value;
				});

				if (qsMatches) {
					handled = true;
					return middleware(req, res, next);
				}
			}
		});

		if (handled === false) {
			return next();
		}
	};
}

function parse(url) {
	var parts = url.split('?');
	return {
		path: parts[0],
		params: qs.parse(parts[1])
	};
}

function forPathsNotMatching(pathPattern, middleware) {
	return function checkPattern(req, res, next) {
		if (pathPattern.test(req.path)) {
			return next();
		}
		return middleware(req, res, next);
	};
}


module.exports.forPathsMatching = forPathsMatching;
module.exports.forPathsNotMatching = forPathsNotMatching;
