'use strict';

const http = require('http');

let startUpdatingServer = () => {
	let server = http.createServer((req, res) => {
		res.send("Update in progress please wait");
	});
	return server;
};

let startErrorServer = () => {
	let server = http.createServer((req, res) => {
		res.send("Error occurred during update process");
	});
	return server;
};

let stopServer = (server) => {
	server.close();
};

module.exports = {
	startUpdatingServer: startUpdatingServer,
	startErrorServer: startErrorServer,
	stopServer: stopServer
};