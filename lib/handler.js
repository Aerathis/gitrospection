'use strict';

const commands = require('./commands');
const utility = require('./utility');
const reporterServer = require('./reporterServer');

let parseBufferMessage = (bufferData) => {
	let splitVals = bufferData.split('::');
	if (splitVals.length != 2) {
		return -1;
	}
	return splitVals[1];
};

let defaultHandler = (repositoryReference, command) => {
	return (socket) => {		
		socket.setEncoding('utf8');		
		socket.on('data', (rawBuffer) => {
			if (rawBuffer === 'Notes') {
				commands.getNotes(repositoryReference)
				.then((logs) => {
					socket.write(logs);
				})
				.catch((err) => {
					socket.write(err);
				});
			} else if (rawBuffer === 'Patches') {
				commands.getPatches(repositoryReference)
				.then((patches) => {
					socket.write(patches);
				})
				.catch((err) => {
					socket.write(err);
				});
			} else if (rawBuffer.indexOf('Update') > -1) {
				let commitRef = parseBufferMessage(rawBuffer);
				if (commitRef === -1) {
					socket.write('Invalid update request');					
				} else {					
					commands.updateRepo(repositoryReference, commitRef)
					.then(() => {
						socket.close();
						command.process.kill('SIGTERM');
						command.process = null;
						// Start temporary webserver
						let tServer = reporterServer.startUpdatingServer();
						// Run Command setup
						let setupErr = utility.executeCommandSetup(command);
						if (setupErr) {
							reporterServer.stopServer(tServer);
							reporterServer.startErrorServer();
						} else {
							// Stop temporary webserver
							reporterServer.stopServer(tServer);
							// Start process
							command = utility.executeCommand(command, (err) => {
								console.log(err);
								// Start up the webserver again to serve the error message
								reporterServer.startErrorServer();
							});
						}
					})
					.catch((err) => {
						socket.write(err);
					});
				}				
			} else {
				// Invalid command sent
			}
		});
	};
};

module.exports = {
	defaultHandler: defaultHandler
};