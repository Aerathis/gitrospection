'use strict';

let git = require('nodegit');

let makeCredentialsCallback = (sshPath, passphrase) => {
	return (url, userName) => {
		return git.Cred.sshKeyNew(userName, path.resolve(path.join(sshPath, 'id_rsa.pub')), path.resolve(path.join(sshPath, 'id_rsa')), passphrase ? passphrase : '');
	};
};

let getRemoteHeadCommit = (repoReference, sshPath, passphrase) => {
	return new Promise((resolve, reject) => {
		repoReference.getRemote('origin')
		.then((remote) => {
			return new Promise((resolve, reject) => {
				remote.connect(git.Enums.DIRECTION.FETCH, {credentials: makeCredentialsCallback(sshPath, passphrase)})
				.then(() => {
					resolve(remote);
				})
				.catch((err) => {
					reject(err);
				});
			});
		})
		.then((remote) => {
			return remote.referenceList();
		})
		.then((refList) => {
			return new Promise((resolve, reject) => {
				let remoteHead;
				let filteredList = refList.filter((c) => { return c.Name() === 'HEAD'; });
				if (filteredList.length === 1) {
					remoteHead = filteredList[0];
					resolve(remoteHead.oid());
				} else {
					reject('Ambiguous remote state');
				}
			});			
		})
		.then((headOid) => {
			return new git.Commit.lookup(headOid);
		});		
	});
};

let getRepoReference = (repoPath) => {
	return new Promise((resolve, reject) => {
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
	return new Promise((resolve, reject) => {
		return repoReference.fetch('origin', {
			callbacks: {
				credentials: makeCredentialsCallback(sshPath, passphrase)
			}
		});
	});
};

let getLogMasterToOrigin = (repoReference, sshPath, passphrase) => {
	return new Promise((resolve, reject) => {
		getRemoteHeadCommit(repoReference, sshPath, passphrase)
		.then((commitObjectt) => {			
		});
	});
};

module.exports = {
	getRepoReference: getRepoReference,
	fetchLatestOrigin: fetchLatestOrigin,
	//getLogMasterToOrigin: getLogMasterToOrigin,
	//getPatchMasterToOrigin: getPatchMasterToOrigin
};