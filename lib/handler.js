'use strict';

let commands = require('./commands');

let defaultHandler = (repositoryReference, managedPid) => {
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
				let commitRef;
				let result = commands.updateRepo(repositoryReference, commitRef);
			} else {
				// Invalid command sent
			}
		});
	};
};

module.exports = {
	defaultHandler: defaultHandler
};