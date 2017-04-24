var assert = require('assert');
var rewire = require('rewire');

var repo = rewire('../lib/repo.js');

describe('lib/repo', function() {
	describe('$makeCredentialsCallback()', function() {
		let mcc = repo.__get__('makeCredentialsCallback');
		it('should return a function', function() {
			let res = mcc('', '');
			assert.equal(typeof(res), 'function');
		});
	});
});