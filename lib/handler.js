'use strict';

let commands = require('./commands');

let defaultHandler = (repositoryReference, managedPid) => {
	return (socket) => {
		socket.setEncoding('utf8');		
		socket.on('data', (rawBuffer) => {
			if (rawBuffer === 'Notes') {
				let notes = commands.getNotes(repositoryReference);
			} else if (rawBuffer === 'Patches') {
				let patches = commands.getPatches(repositoryReference);
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