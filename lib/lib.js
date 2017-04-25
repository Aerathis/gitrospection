'use strict';

const net = require('net');

const git = require('./repo');
const handler = require('./handler');
const utility = require('./utility');

let createSocketServer = (port, gitPath, command, handlerOverride) => {
	return new Promise((resolve, reject) => {
		let setupErr = utility.executeCommandSetup(command);
		if (setupErr === -1) {
			reject('Error setting up command', setupErr);
		}		
		
		command = utility.executeCommand(command, (err) => {
			reject(err);
			command.process = null;
		});
		let server = new net.Server();
		server.listen(port, (err) => {
			if (err && command.process) {
				reject(err);
				return;
			}
			git.getRepoReference(gitPath)
			.then((repoRef) => {
				let serverHandler = handler.defaultHandler(repoRef, command);
				if (handlerOverride) {
					serverHandler = handlerOverride(repoRef, command);
				}
				server.on('connection', serverHandler);
				if (!command.process) {
					reject('No process');
				} else {
					resolve(server);
				}
			})
			.catch((error) => {
				reject(error);
			});			
		});
	});
};