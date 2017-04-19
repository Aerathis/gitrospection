'use strict';

let commands = require('./commands');

let defaultHandler = (repositoryReference) => {
	return (socket) => {
		socket.setEncoding(null);
		socket.on('data', (rawBuffer) => {
			let header = rawBuffer.readUInt8(0);
			let dataBuffer = Buffer.alloc(header.length -1, 0, null);
			header.copy(dataBuffer, 0, 1);			
			commands.parseCommandByte(header)
			.then(commands.checkBufferLength(dataBuffer))
			.catch((reason) => {/* Buffer not sufficient length */})
			.then(commands.getBufferData)			
			.then(commands.execute(repositoryReference))
			.then((commandOutput) => {
			})
			.catch((reason) => {});
		});
	};
};

module.exports = {
	defaultHandler: defaultHandler
};