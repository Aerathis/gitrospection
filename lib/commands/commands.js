'use strict';

const COMMAND_BITMASK = 192;
const COMMAND_SHIFT = 6;

let parseCommandByte = (headerByte) => {
	return new Promise((resolve, reject) => {
		let commandBits = (headerByte & COMMAND_BITMASK) >>> COMMAND_SHIFT;
		let metaBits = (headerByte & ~COMMAND_BITMASK);
	});	
};

let checkBufferLength = (buffer) => {
	return (command) => {
		return new Promise((resolve, reject) => {

		});
	};
};

let getBufferData = (command, buffer) => {
	return new Promise((resolve, reject) => {

	});
};

let execute = (repo) => {
	return (command, data) => {
		return new Promise((resolve, reject) => {

		});
	};
};

module.exports = {
	parseCommandByte: parseCommandByte
};