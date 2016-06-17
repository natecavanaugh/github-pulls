import settings from './settings';
import path from 'path';

export function getUserConfig(username = settings.val('username')) {
	var userConfig = new settings.constructor(path.join(settings.USER_PREFS_PATH, `config.${username}.json`));

	return userConfig;
}