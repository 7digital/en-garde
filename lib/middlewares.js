'use strict';

function stringStartingWith(first, second) {
	return first.indexOf(second) === 0;
}

function forPathsMatching(urls, middleware) {
	function urlMatchingMiddleware(req, res, next) {
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
	}

	urlMatchingMiddleware.urlMatches = urls;

	return urlMatchingMiddleware;
}

function forPathsNotMatching(pathPattern, middleware) {
	function checkPattern(req, res, next) {
		if (pathPattern.test(req.path)) {
			return next();
		}
		return middleware(req, res, next);
	}

	checkPattern.rejectPattern = pathPattern;

	return checkPattern;
}


module.exports.forPathsMatching = forPathsMatching;
module.exports.forPathsNotMatching = forPathsNotMatching;
