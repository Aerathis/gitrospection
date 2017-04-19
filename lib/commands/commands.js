'use strict';

let git = require('nodegit');

let getNotes = (repositoryReference) => {
	repositoryReference.fetch("origin", {
		callbacks: {
			credentials: (url, userName) => {
				return git.Cred.sshKeyNew();
			}
		}
	});
};

module.exports = {
	getNotes: getNotes
};