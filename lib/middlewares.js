'use strict';

function stringStartingWith(first, second) {
	return first.indexOf(second) === 0;
}

function forPathsMatching(urls, middleware) {
	return function urlMatchingMiddleware(req, res, next) {
		var handled = false;

		urls.forEach(function (url) {
			if (stringStartingWith(req.url, url) && !handled) {
				handled = true;
				return middleware(req, res, next);
			}
		});

		if (handled === false) {
			return next();
		}
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
