import _ from 'lodash';
import jsop from 'jsop';
import path from 'path';

const electron = require('electron');

export const USER_PREFS_PATH = electron.ipcRenderer.sendSync('userPrefsPath');

global.USER_PREFS_PATH = USER_PREFS_PATH;

class Settings {
	constructor(path) {
		this.db = jsop(path);
	}

	destroy() {
		_.forOwn(this.db, this._clearDB);
	}

	load() {
		return this.db;
	}

	val(key, value) {
		var setting;

		var db = this.db;

		var get = (arguments.length === 1 && _.isString(key));
		var objectKey = _.isObject(key);

		if (objectKey || arguments.length > 1) {
			get = false;
		}

		if (get) {
			setting = db[key];
		}
		else if (objectKey) {
			_.extend(db, key);

			_.each(
				db,
				function(item, index) {
					if (item === null) {
						delete db[index];
					}
				}
			);
		}
		else if (_.isNull(value)) {
			delete db[key];
		}
		else {
			db[key] = value;
		}

		return setting;
	}

	_clearDB(item, index, obj) {
		delete obj[index];
	}
}

var settings = new Settings(path.join(USER_PREFS_PATH || '', 'settings.json'));

settings.USER_PREFS_PATH = USER_PREFS_PATH;

export default settings;