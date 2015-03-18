'use strict';
var util = require('util');
var VError = require('verror');

function isFunction(thing) {
	return typeof thing === 'function';
}

function die(msg, err, code) {
	var colorise = process.stderr.isTTY;
	var formattedErr;

	if (msg) {
		console.error(msg);
	}

	if (err) {
		formattedErr = util.inspect(err, { colors: colorise, depth: null });
		console.error(formattedErr);
	}

	process.exit(code || 1);
}

function exit(msg, code, cb) {
	if (!cb && !code && isFunction(msg)) {
		cb = msg;
		msg = '';
		code = 1;
	}
	else if (!cb && isFunction(code)) {
		cb = code;
		code = 1;
	}

	function guard(err, result) {
		if (err) {
			return die(msg, err, code);
		}

		return cb(result);
	}

	guard.isGuard = true;
	guard.msg = msg;
	guard.code = code;
	guard.guarded = cb;

	return guard;
}

function propagate(log, msg, successHandler, outerCallback) {
	if (isFunction(msg)) {
		outerCallback = successHandler;
		successHandler = msg;
		msg = '';
	}

	function guard(err, result) {
		var remainingArgs;

		if (err) {
			if (msg) log.error(msg);
			log.error(err);
			return outerCallback(err);
		}

		remainingArgs = [].slice.call(arguments, 1);
		return successHandler.apply(null, remainingArgs);
	}

	guard.isGuard = true;
	guard.log = log;
	guard.msg = msg;
	guard.guarded = successHandler;
	guard.outerCallback = outerCallback;

	return guard;
}

function logAndIgnore(log, msg, fn) {
	if (!fn) {
		fn = msg;
		msg = 'Ignoring callback error';
	}
	return function wrappedIgnoringErrors() {
		var args = [].slice.call(arguments);
		var cb = args.pop(); // Assume cb to wrap is the last argument

		function ignoreErrorsAndCallback(err, result) {
			if (err) {
				log.warn(new VError(err, msg));
				return cb();
			}

			return cb(null, result);
		}

		args.push(ignoreErrorsAndCallback); // Use the wrapped callback instead

		return fn.apply(this, args);
	};
}

module.exports.exit = exit;
module.exports.propagate = propagate;
module.exports.logAndIgnore = logAndIgnore;
