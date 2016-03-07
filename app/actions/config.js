import _ from 'lodash';
import {pushState} from 'redux-router';
import {getUserConfig} from '../utils/user_config';
import {loadPulls, pullsRequest} from './pulls';
import path from 'path';

export const CONFIG_OPEN = 'CONFIG_OPEN';
export const CONFIG_SAVE = 'CONFIG_SAVE';
export const CONFIG_CLOSE = 'CONFIG_CLOSE';
export const CONFIG_LOAD = 'CONFIG_LOAD';

// export const CONFIG_ADD_REPO = 'CONFIG_ADD_REPO';
// export const CONFIG_REMOVE_REPO = 'CONFIG_REMOVE_REPO';

export function configClose() {
	return {
		type: CONFIG_CLOSE
	};
}

export function closeConfig() {
	return (dispatch, state) => {
		dispatch(configClose());
		dispatch(pushState(null, '/'));
	};
}

export function configOpen(config) {
	return {
		type: CONFIG_OPEN
	};
}

export function loadConfig(username) {
	var userConfig = getUserConfig(username);

	var config = userConfig.load();

	return {
		type: CONFIG_LOAD,
		config
	};
}

export function openConfig() {
	return (dispatch, state) => {
		console.log('openConfig', state.config);
		dispatch(configOpen());
		dispatch(pushState(null, '/config'));
	};
}

export function configSave(config) {
	// userConfig.val();
	return {
		type: CONFIG_SAVE,
		config
	};
}

export function saveConfig(fields) {
	return (dispatch, state) => {
		var userConfig = getUserConfig();

		userConfig.val(fields);

		// console.log('saveConfig', fields, userConfig.load());

		dispatch(configSave(fields));
		dispatch(pushState(null, '/'));
		dispatch(pullsRequest());
	};
}

export function collapseRepo(path, collapsed) {
	return (dispatch, state) => {
		var userConfig = getUserConfig();

		var config = {
			collapsed: {
				[path]: collapsed
			}
		};

		userConfig.val(_.merge(userConfig.load(), config));

		dispatch(configSave(config));
	}
};

// export function addRepo(fields) {
// 	return {
// 		type: CONFIG_ADD_REPO
// 	};
// }