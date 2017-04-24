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

let extractRemoteDataList = (repoReference, sshPath, passphrase, funcName) => {
	return new Promise((resolve, reject) => {
		Promise.all([getRemoteHeadCommit(repoReference, sshPath, passphrase), repoReference.getMasterCommit])
		.then((values) => {
			let remote = values[0];
			let master = values[1];
			let dataList = [];
			let history = remote.history();
			let processCommit = (commit) => {
				if (commit.sha() === master.sha()) {
					history.removeListener('commit', processCommit);
					resolve(dataList);
				} else {
					dataList.push(commit[funcName]());
				}
			};
			history.on('commit', processCommit);
			history.start();
		})
		.catch((err) => {
			reject(err);
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
	return repoReference.fetch('origin', {
		callbacks: {
			credentials: makeCredentialsCallback(sshPath, passphrase)
		}
	});
};

let getLogMasterToOrigin = (repoReference, sshPath, passphrase) => {
	return extractRemoteDataList(repoReference, sshPath, passphrase, 'message');
};

let getPatchMasterToOrigin = (repoReference, sshPath, passphrase) => {
	return extractRemoteDataList(repoReference, sshPath, passphrase, 'diff');
};

module.exports = {
	getRepoReference: getRepoReference,
	fetchLatestOrigin: fetchLatestOrigin,
	getLogMasterToOrigin: getLogMasterToOrigin,
	getPatchMasterToOrigin: getPatchMasterToOrigin
};