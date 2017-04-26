var assert = require('assert');
var rewire = require('rewire');

var handler = rewire('../lib/handler.js');

let testEncoding = null;
let testSocketData = null;
let injectEvents = [];
let testExecuteData = null;
let testErrorServerData = null;

const mockSocket = {
	setEncoding: function(enc) {
		testEncoding = enc;
	},
	write: function(data) {
		testSocketData = data;
		if (this.postWrite) {
			this.postWrite();
		}
	},
	on: function(eventname, callback) {
		injectEvents.push({event: eventname, func: callback});
	},
	close: function() {
		testSocketData = 'closed';
	},
	setPostWrite: function(cb) {
		this.postWrite = cb;
	},
	clearPostWrite: function() {
		this.postWrite = null;
	}
};

const mockCommands = {
	getNotes: function(r) {
		return new Promise((resolve, reject) => {
			if (r) {
				resolve('getNotes');
			} else {
				reject('getNotesFailed');
			}
		});
	},
	getPatches: function(r) {
		return new Promise((resolve, reject) => {
			if (r) {
				resolve('getPatches');				
			} else {
				reject('getPatchesFailed');
			}
		});
	},
	updateRepo: function(r, c) {
		return new Promise((resolve, reject) => {
			if (r) {
				resolve();
			} else {
				reject('updateRepoFailed');
			}
		});
	}
};

const mockUtility = {
	executeCommandSetup: function(c) {
		if (c.fail) {
			return 'setup error';
		}
	},
	executeCommand: function(c, cb) {
		testExecuteData = 'Command executed';
		if (this.postExecute) {
			this.postExecute();
		}
		if (c.commandFail) {
			cb('error');
		}
		return c;
	},
	setPostExecute: function(cb) {
		this.postExecute = cb;
	},
	clearPostExecute: function() {
		this.postExecute = null;
	}
};

const mockReporterServer = {
	startUpdatingServer: function() {},
	stopServer: function(t) {},
	startErrorServer: function(){
		testErrorServerData = 'Errored';
		if (this.postServer) {
			this.postServer();
		}
	},
	setPostServer: function(cb) {
		this.postServer = cb;
	},
	clearPostServer: function() {
		this.postServer = null;
	}
};

describe('lib/handler', function() {
	describe('$parseBufferMessage', function() {
		let pbm = handler.__get__('parseBufferMessage');
		it('should return -1 on failure', function() {
			let res = pbm('');
			assert.equal(-1, res);
		});

		it('should return the second field on success', function() {
			let res = pbm('first::second');
			assert.equal('second', res);
		});

		it('should fail if the wrong field separator is used', function() {
			let res = pbm('first||second');
			assert.equal(-1, res);
		});
	});

	describe('#defaultHandler', function() {
		it('should return a function', function() {
			let hnd = handler.defaultHandler(null, null);
			assert.equal(typeof(hnd), 'function');
		});

		it('should set the socket encoding', function() {
			let hnd = handler.defaultHandler(null, null);
			hnd(mockSocket);
			assert.equal(testEncoding, 'utf8');
			injectEvents = [];			
		});

		it('should have an event listener for "data"', function() {
			let hnd = handler.defaultHandler(null, null);
			hnd(mockSocket);
			assert.equal(injectEvents.length, 1);
			assert.equal(injectEvents[0].event, 'data');
			assert.equal(typeof(injectEvents[0].func), 'function');
			injectEvents = [];
		});

		it('should return an error message on invalid socket input', function() {
			let hnd = handler.defaultHandler(null, null);
			hnd(mockSocket);
			injectEvents[0].func('invalid');
			assert.equal('Invalid command request', testSocketData);
			injectEvents = [];
			testSocketData = '';
		});

		it('should write logs with valid Notes request', function(done) {
			handler.__set__('commands', mockCommands);
			let hnd = handler.defaultHandler(true, null);
			let postWrite = function() {
				assert.equal('getNotes', testSocketData);
				mockSocket.clearPostWrite();
				done();
			};
			mockSocket.setPostWrite(postWrite);
			hnd(mockSocket);
			injectEvents[0].func('Notes');
			injectEvents = [];
		});

		it('should write command error on notes failure', function(done) {
			handler.__set__('commands', mockCommands);
			let hnd = handler.defaultHandler(false, null);
			let postWrite = function() {
				assert.equal('getNotesFailed', testSocketData);
				mockSocket.clearPostWrite();
				done();
			};
			mockSocket.setPostWrite(postWrite);
			hnd(mockSocket);
			injectEvents[0].func('Notes');
			injectEvents = [];
		});

		it('should write patches with valid Patches request', function(done) {
			handler.__set__('commands', mockCommands);
			let hnd = handler.defaultHandler(true, null);
			let postWrite = function() {
				assert.equal('getPatches', testSocketData);
				mockSocket.clearPostWrite();
				done();
			};
			mockSocket.setPostWrite(postWrite);
			hnd(mockSocket);
			injectEvents[0].func('Patches');
			injectEvents = [];
		});

		it('should write command error on patches failure', function(done) {
			handler.__set__('commands', mockCommands);
			let hnd = handler.defaultHandler(false, null);
			let postWrite = function() {
				assert.equal('getPatchesFailed', testSocketData);
				mockSocket.clearPostWrite();
				done();
			};
			mockSocket.setPostWrite(postWrite);
			hnd(mockSocket);
			injectEvents[0].func('Patches');
			injectEvents = [];
		});

		it('should process update requests', function(done) {
			handler.__set__('commands', mockCommands);
			handler.__set__('utility', mockUtility);
			let postExecute = function() {
				assert.equal('closed', testSocketData);
				assert.equal('Command executed', testExecuteData);
				mockUtility.clearPostExecute();
				done();
			};
			mockUtility.setPostExecute(postExecute);
			let hnd = handler.defaultHandler(true, {process: {kill: function() {}}});		
			hnd(mockSocket);			
			injectEvents[0].func('Update::testreference');
			injectEvents = [];
		});

		it('should respond to invalid update requests', function(done) {
			let hnd = handler.defaultHandler(true, null);
			let postWrite = function() {
				assert.equal('Invalid update request', testSocketData);
				mockSocket.clearPostWrite();
				done();
			};
			mockSocket.setPostWrite(postWrite);
			hnd(mockSocket);
			injectEvents[0].func('Update||invalid');
			injectEvents = [];
		});

		it('should report command setup errors', function(done) {
			handler.__set__('reporterServer', mockReporterServer);
			let hnd = handler.defaultHandler(true, {process: {kill: function() {}}, fail: true});
			let postServer = function() {
				assert.equal('Errored', testErrorServerData);
				mockReporterServer.clearPostServer();
				done();
			};
			mockReporterServer.setPostServer(postServer);
			hnd(mockSocket);
			injectEvents[0].func('Update::testref');
			injectEvents = [];
		});

		it('should report command execution errors', function(done) {
			handler.__set__('reporterServer', mockReporterServer);
			let hnd = handler.defaultHandler(true, {process: {kill: function() {}}, commandFail: true});
			let postServer = function() {
				assert.equal('Errored', testErrorServerData);
				mockReporterServer.clearPostServer();
				done();
			};
			mockReporterServer.setPostServer(postServer);
			hnd(mockSocket);
			injectEvents[0].func('Update::testref');
			injectEvents = [];
		});

		it('should report failure of updateRepo', function(done) {
			handler.__set__('reporterServer', mockReporterServer);
			let hnd = handler.defaultHandler(false, null);
			let postWrite = function() {
				assert.equal('updateRepoFailed', testSocketData);
				mockSocket.clearPostWrite();
				done();
			};
			mockSocket.setPostWrite(postWrite);
			hnd(mockSocket);
			injectEvents[0].func('Update::testref');
			injectEvents = [];
		});
	});
});