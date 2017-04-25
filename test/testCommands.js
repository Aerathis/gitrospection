var assert = require('assert');
var rewire = require('rewire');

var command = rewire('../lib/commands/commands.js');

const mockRepo = {
	fetchLatestOrigin: function() {
		return new Promise((resolve, reject) => {
			resolve();
		});
	},
	getLogMasterToOrigin: function() {},
	getPatchMasterToOrigin: function() {},
	updateToCommit: function() {}
};

const mockUtility = {
	getSSHDetails: function() {
		return {path: '', pass: ''};
	}
};

describe('lib/commands/commands', function() {
	describe('$doFetch', function() {
		command.__set__('repo', mockRepo);
		command.__set__('utility', mockUtility);
		it('should perform the fetch', function() {
			let df = command.__get__('doFetch');
			return df({});
		});
	});
});