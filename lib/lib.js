'use strict';

let net = require('net');

let server = new net.Server();
server.listen(8000, (err) => {
	if (err) {
		console.log("Unable to listen");
		return;
	}
	server.on('connection', (conn) => {
		
	});
})