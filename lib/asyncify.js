'use strict';

function asyncify(fn, ctx) {
	return function () {
		var originalArgs = [].slice.call(arguments);
		var cb = originalArgs.pop();

		return process.nextTick(function () {
			var result;

			try {
				result = fn.apply(ctx, originalArgs);

			} catch (e) {
				return cb(e);
			}

			return cb(null, result);
		});
	};
}

module.exports = exports = asyncify;
