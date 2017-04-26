var assert = require('assert');
var rewire = require('rewire');

var command = rewire('../lib/commands/commands.js');

let forceSSHFail = false;

const mockRepo = {	
	fetchLatestOrigin: function() {
		return new Promise((resolve, reject) => {
			if (this.fetchResult) {
				resolve();
			} else {
				reject('fetchLatestfailed');
			}
		});
	},
	getLogMasterToOrigin: function() {
		return new Promise((resolve, reject) => {
			if (this.logResult) {
				resolve('logs');
			} else {
				reject('logfailed');
			}
		});
	},
	getPatchMasterToOrigin: function() {
		return new Promise((resolve, reject) => {
			if (this.patchResult) {
				resolve('patches');
			} else {
				reject('patchesfailed');
			}
		});
	},
	updateToCommit: function() {
		return new Promise((resolve, reject) => {
			if (this.updateResult) {
				resolve();
			} else {
				reject('updatefailed');
			}
		});
	}
};

const mockUtility = {
	getSSHDetails: function() {
		if (!forceSSHFail) {
			return {path: 'test', pass: 'test'};
		} else {
			return false;
		}
	}
};

describe('lib/commands/commands', function() {
	describe('$doFetch', function() {		
		command.__set__('repo', mockRepo);
		command.__set__('utility', mockUtility);
		it('should perform the fetch', function() {
			let df = command.__get__('doFetch');
			mockRepo.fetchResult = true;
			return df({})
			.then(function(ssh) {
				assert.equal(ssh.path, 'test');
				assert.equal(ssh.pass, 'test');				
			}, function(err) {
				assert.fail(err);				
			});			
		});
		
		it('should reject with an error if the fetch fails', function() {
			let df = command.__get__('doFetch');
			mockRepo.fetchResult = false;
			return df({})
			.then(function(ssh) {
				throw new Error('Promise should not be fulfilled');
			}, function(err) {
				assert.equal('fetchLatestfailed', err);
			});
		});

		it('should reject if there are no SSH Details', function() {
			forceSSHFail = true;
			let df = command.__get__('doFetch');
			return df({})
			.then(function(ssh) {
				throw new Error('Promise should not be fulfilled');
			}, function(err) {
				assert.equal('SSH details not found', err);
			});
		});
	});

	describe('#getNotes', function() {
		it('should return notes from the repo', function() {
			forceSSHFail = false;
			mockRepo.logResult = true;
			mockRepo.fetchResult = true;
			return command.getNotes(mockRepo)
			.then(function(logs) {
				assert.equal('logs', logs);
			}, function(err) {
				assert.fail(err);
			});
		});

		it('should fail if the fetch fails', function() {
			forceSSHFail = false;
			mockRepo.logResult = true;
			mockRepo.fetchResult = false;
			return command.getNotes(mockRepo)
			.then(function() { 
				throw new Error('Promise should not be fulfilled');
			}, function(err) {
				assert.equal('fetchLatestfailed', err);
			});
		});

		it('should reject if the logs operation fails', function() {
			forceSSHFail = false;
			mockRepo.logResult = false;
			mockRepo.fetchResult = true;
			return command.getNotes(mockRepo)
			.then(function(logs) {
				throw new Error('Promise should not resolve');				
			}, function(err) {
				assert.equal('logfailed', err);
			});
		});
	});

	describe('#getPatches', function() {
		it('should return patches from the repo', function() {
			forceSSHFail = false;
			mockRepo.patchResult = true;
			mockRepo.fetchResult = true;
			return command.getPatches(mockRepo)
			.then(function(patches) {
				assert.equal('patches', patches);
			}, function(err) {
				assert.fail(err);
			});
		});

		it('should fail if the fetch fails', function() {
			forceSSHFail = false;
			mockRepo.patchResult = true;
			mockRepo.fetchResult = false;
			return command.getPatches(mockRepo)
			.then(function() {
				throw new Error('Promise should not be fulfilled');
			}, function(err) {
				assert.equal('fetchLatestfailed', err);
			});
		});

		it('should reject if the patches operation fails', function() {
			forceSSHFail = false;
			mockRepo.patchResult = false;
			mockRepo.fetchResult = true;
			return command.getPatches(mockRepo)
			.then(function() {
				throw new Error('Promise should not be fulfilled');
			}, function(err) {
				assert.equal('patchesfailed', err);
			});
		});
	});

	describe('#updateRepo', function() {
		it('should complete without errors', function() {
			forceSSHFail = false;
			mockRepo.updateResult = true;
			mockRepo.fetchResult = true;
			return command.updateRepo(mockRepo)
			.then(function() {				
			}, function(err) {
				assert.fail(err);
			});
		});

		it('should fail if the fetch fails', function() {
			forceSSHFail = false;
			mockRepo.updateResult = true;
			mockRepo.fetchResult = false;
			return command.updateRepo(mockRepo)
			.then(function() {
				throw new Error('Promise should not be fulfilled');			
			}, function(err) {
				assert.equal('fetchLatestfailed', err);
			});
		});

		it('should reject if the update fails', function() {
			forceSSHFail = false;
			mockRepo.updateResult = false;
			mockRepo.fetchResult = true;
			return command.updateRepo(mockRepo)
			.then(function() {
				throw new Error('Promise should not be fulfilled');
			}, function(err) {
				assert.equal('updatefailed', err);
			});
		});
	});
});