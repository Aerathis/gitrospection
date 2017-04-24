'use strict';

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

module.exports = {
	getSSHDetails: getSSHDetails
};