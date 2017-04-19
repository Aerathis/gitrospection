'use strict';

let net = require('net');
let handler = require('./handler');
let git = require('./repo');

let createSocketServer = (port, gitPath, handlerOverride) => {
	return new Promise((resolve, reject) => {
		let server = new net.Server();
		server.listen(port, (err) => {
			if (err) {
				reject(err);
				return;
			}			
			git.getRepoReference(gitPath)
			.then((repoRef) => {
				let serverHandler = handler.defaultHandler(repoRef);
				if (handlerOverride) {
					serverHandler = handlerOverride(repoRef);
				}
				server.on('connection', serverHandler);
				resolve(server);
			})
			.catch((error) => {
				reject(error);
			});
			
		});
	});
};

let serializeCommand = (command, data) => {

};