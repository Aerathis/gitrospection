'use strict';

let repo = require('../repo');
let utility = require('../utility');

let doFetch = (repositoryReference) => {
	return new Promise((resolve, reject) => {
		let ssh = utility.getSSHDetails();
		if (!ssh) {
			reject('SSH details not found');
			return;
		}
		repo.fetchLatestOrigin(repositoryReference, ssh.path, ssh.pass)
		.then(() => {
			resolve(ssh);
		})
		.catch((err) => {
			reject(err);
		});
	});
};

let getNotes = (repositoryReference) => {
	return new Promise((resolve, reject) => {
		doFetch(repositoryReference)
		.then((ssh) => {
			return repo.getLogMasterToOrigin(repositoryReference, ssh.path, ssh.pass);
		})
		.then((logs) => {
			resolve(logs);
		})
		.catch((err) => {
			reject(err);
		});
	});
};

let getPatches = (repositoryReference) => {
	return new Promise((resolve, reject) => {
		doFetch(repositoryReference)
		.then((ssh) => {
			return repo.getPatchMasterToOrigin(repositoryReference, ssh.path, ssh.pass);
		})
		.then((patches) => {
			resolve(patches);
		})
		.catch((err) => {
			reject(err);
		});
	});
};

let updateRepo = (repositoryReference, commitRef) => {
	return new Promise((resolve, reject) => {
		doFetch(repositoryReference)
		.then((ssh) => {
			resolve(repo.updateToCommit(repositoryReference, commitRef, ssh.path, ssh.pass));
		})
		.catch((err) => {
			reject(err);
		});
	});
};

module.exports = {
	getNotes: getNotes,
	getPatches: getPatches,
	updateRepo: updateRepo
};