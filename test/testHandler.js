var assert = require('assert');
var rewire = require('rewire');

var handler = rewire('../lib/handler.js');

describe('lib/handler', function() {
	describe('$parseBufferMessage', function() {
		let pbm = handler.__get__('parseBufferMessage');
		it('should return -1 on failure', function() {
			let res = pbm('');
			assert.equal(-1, res);
		});
	});
});