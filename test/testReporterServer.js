var assert = require('assert');
var rewire = require('rewire');

var rs = rewire('../lib/reporterServer');

var mockHttp = {
	createServer: function(callback) {		
		return this;
	}
};

describe('lib/reporterServer', function() {
	describe('#startUpdatingServer', function() {
		it('should return the server created', function() {
			rs.__set__('http', mockHttp);
			var testServer = rs.startUpdatingServer();			
			assert.equal(testServer, mockHttp);
		});
	});	
});