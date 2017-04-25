'use strict';

const child_process = require('child_process');
const exec = child_process.exec;
const spawn = child_process.spawn;

const SSH_ENV = 'GSPEC_SSHPATH';
const SSH_PASS_ENV = 'GSPEC_SSHPASS';

let getSSHDetails = () => {
	if (process.env.hasOwnProperty(SSH_ENV)) {
		return {
			path: process.env[SSH_ENV],
			pass: process.env[SSH_PASS_ENV]
		};
	} else {
		return false;
	}
};

let executeCommandSetup = (command) => {
	if (command.setup) {
		let setup = exec(command.setup, (err, stdout, stderr) => {
			if (err) {
				return err;
			} else {
				console.log(stdout, stderr);
				return null;
			}
		});
	}
};

let executeCommand = (command, errCallback) => {
	let managedPid = spawn(command.run);
	managedPid.on('error', errCallback);
	command.process = managedPid;
	return command;
};

module.exports = {
	getSSHDetails: getSSHDetails,
	executeCommandSetup: executeCommandSetup,
	executeCommand: executeCommand
};