import settings from './settings';
import path from 'path';

var userConfig;

export function getUserConfig(username = settings.val('username')) {
	if (!userConfig) {
		userConfig = new settings.constructor(path.join(settings.USER_PREFS_PATH, `config.${username}.json`));
	}

	return userConfig;
}