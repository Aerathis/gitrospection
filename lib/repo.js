'use strict';

let git = require('nodegit');

let getRepoReference = (repoPath) => {
	return Promise((resolve, reject) => {
		git.Repository.open(repoPath)
		.then((repo) => {
			resolve(repo);
		})
		.catch((err) => {
			reject(err);
		});
	});
};

let fetchLatestOrigin = (repoReference, sshPath, passphrase) => {
	return Promise((resolve, reject) => {
		return repoReference.fetch('origin', {
			callbacks: {
				credentials: (url, userName) => {
					return git.Cred.sshKeyNew(userName, path.resolve(path.join(sshPath, 'id_rsa.pub')), path.resolve(path.join(sshPath, 'id_rsa')), passphrase ? passphrase : '');
				}
			}
		});
	});
};

module.exports = {
	getRepoReference: getRepoReference,
	fetchLatestOrigin: fetchLatestOrigin,
	//getLogMasterToOrigin: getLogMasterToOrigin,
	//getPatchMasterToOrigin: getPatchMasterToOrigin
};