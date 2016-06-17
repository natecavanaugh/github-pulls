const electron = require('electron');
const GhReleases = require('electron-gh-releases');

var pkg = require('../package.json');

function getRepo(pkg) {
	var url = pkg.repository.url.split('/');

	return url[3] + '/' + url[4].replace(/\.[^/.]+$/, '');
}

const update = () => {
	var options = {
		repo: getRepo(pkg),
		currentVersion: pkg.version
	};

	const updater = new GhReleases(options);

	electron.ipcMain.on(
		'checkForUpdates',
		(event) => {
			updater.check(
				(err, status) => {
					event.sender.send('updateAvailable', !err && status);
				}
			);
		}
	);

	electron.ipcMain.on(
		'downloadUpdates',
		(event) => {
			updater.download();
		}
	);

	updater.on(
		'update-downloaded',
		(info) => {
			updater.install();
		}
	);
}

module.exports = update;