import _ from 'lodash';
import {hashHistory} from 'react-router';
import {getUserConfig} from '../utils/user_config';
import {pullsRequest} from './pulls';

export const CONFIG_CLOSE = 'CONFIG_CLOSE';
export const CONFIG_LOAD = 'CONFIG_LOAD';
export const CONFIG_OPEN = 'CONFIG_OPEN';
export const CONFIG_SAVE = 'CONFIG_SAVE';

export function configClose() {
	return {
		type: CONFIG_CLOSE
	};
}

export function closeConfig() {
	return (dispatch, state) => {
		dispatch(configClose());

		hashHistory.push('/');
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
		config,
		type: CONFIG_LOAD
	};
}

export function openConfig() {
	return (dispatch, state) => {
		dispatch(configOpen());

		hashHistory.push('/config');
	};
}

export function configSave(config) {
	return {
		config,
		type: CONFIG_SAVE
	};
}

export function saveConfig(fields) {
	return (dispatch, state) => {
		var userConfig = getUserConfig();

		userConfig.val(fields);

		dispatch(configSave(fields));
		hashHistory.push('/');
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
	};
}

export function setDisplayView(view) {
	return (dispatch, state) => {
		var userConfig = getUserConfig();

		var config = {
			view
		};

		userConfig.val(_.merge(userConfig.load(), config));

		dispatch(configSave(config));
	}
}