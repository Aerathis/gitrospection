'use strict';

let net = require('net');
let handler = require('./handler');
let git = require('./repo');

let createSocketServer = (port, gitPath, managedPid, handlerOverride) => {
	return new Promise((resolve, reject) => {
		let server = new net.Server();
		server.listen(port, (err) => {
			if (err) {
				reject(err);
				return;
			}			
			git.getRepoReference(gitPath)
			.then((repoRef) => {
				let serverHandler = handler.defaultHandler(repoRef, managedPid);
				if (handlerOverride) {
					serverHandler = handlerOverride(repoRef, managedPid);
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