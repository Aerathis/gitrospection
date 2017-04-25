var assert = require('assert');
var rewire = require('rewire');

var utility = rewire('../lib/utility.js');

const SSH_ENV = 'GSPEC_SSHPATH';
const SSH_PASS_ENV = 'GSPEC_SSHPASS';

describe('lib/utility', function() {
	describe('#getSSHDetails', function() {
		if (process.env.hasOwnProperty(SSH_ENV)) {
			assert.true(false);
		} else {
			it('should return the value in the env', function() {
				process.env[SSH_ENV] = 'testingvalue';
				let toTest = utility.getSSHDetails();
				assert.equal(toTest.path, 'testingvalue');
			});
		}
	});
});