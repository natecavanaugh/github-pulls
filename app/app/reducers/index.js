import {combineReducers} from 'redux';
import _ from 'lodash';

import { routerReducer as routing } from 'react-router-redux';

import {PULLS_REQUEST, PULLS_SUCCESS, PULLS_FAILURE} from '../actions/pulls';

import {LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_COMPLETE, LOGIN_FAILURE, LOGOUT} from '../actions/login';

import {PAGE_ONLINE, PAGE_OFFLINE} from '../actions/page';
import {UPDATE_AVAILABLE, UPDATE_CHECK, UPDATE_DOWNLOAD, UPDATE_LATER} from '../actions/update';

import {CONFIG_OPEN, CONFIG_SAVE, CONFIG_LOAD} from '../actions/config';

const checkType = function(type, ...types) {
	return types.includes(type);
};

const rootReducer = combineReducers(
	{
		config: function(state = {collapsed: {}, repos: []}, action) {
			var newState = state;

			var {type} = action;

			if (checkType(type, CONFIG_OPEN, CONFIG_SAVE, CONFIG_LOAD)) {
				newState = _.mergeWith(
					{},
					state,
					action.config,
					function(objValue, srcValue, key, object, src, stack) {
						var retVal;

						if (_.isArray(srcValue)) {
							retVal = [...srcValue];
						}

						return retVal;
					}
				);
			}

			return newState;
		},

		currentVersion: (state = 0, action) => state,

		downloading: (state = false, action) => {
			if (action.type === UPDATE_DOWNLOAD) {
				state = true;
			}

			return state;
		},

		entities: function(state = {issues: {}, repos: {}, result: []}, action) {
			var newState = state;

			var {response, type} = action;

			if (type === PULLS_SUCCESS) {
				var {entities, result} = response;

				newState = _.merge({}, entities, {result});
			}

			return newState;
		},

		lastUpdateCheck: function(state = 0, action) {
			var newState = state;

			var {time, type} = action;

			if (type === UPDATE_CHECK) {
				newState = _.toInteger(time);
			}

			return newState;
		},

		loading: function(state = false, action) {
			var newState = state;

			var {type} = action;

			if (checkType(type, LOGIN_REQUEST, PULLS_REQUEST)) {
				newState = true;
			}
			else if (checkType(type, LOGIN_SUCCESS, LOGIN_FAILURE, PULLS_SUCCESS, PULLS_FAILURE)) {
				newState = false;
			}

			return newState;
		},

		loggedIn: function(state = false, action) {
			var newState = state;

			var {token, type, username} = action;

			if (type === LOGIN_SUCCESS) {
				newState = !!(username && token);
			}
			else if (type === LOGOUT) {
				newState = false;
			}

			return newState;
		},

		loginErrors: function(state = {err: null, errors: null, response: null}, action) {
			var newState = state;

			var {err, errors = '', response, type} = action;

			if (type === LOGIN_FAILURE) {
				if (!errors) {
					try {
						errors = JSON.parse(err.message).message;
					}
					catch (e) {
						console.log('loginError: couldn\'t parse JSON message', e, err);
					}
				}

				newState = {err, errors, response};
			}
			else if (type === LOGIN_SUCCESS) {
				newState = {
					err: null,
					errors: null,
					response: null
				};
			}

			return newState;
		},

		online: function(state = true, action) {
			var newState = state;

			var {status, type} = action;

			if (checkType(type, PAGE_OFFLINE, PAGE_ONLINE)) {
				newState = status;
			}

			return newState;
		},

		pageError: function(state = null, action) {
			var newState = state;

			var {err, type} = action;

			if (type === PULLS_FAILURE) {
				var {defaultMessage: statusText, message} = err;

				if (_.isString(message) && _.isUndefined(statusText)) {
					try {
						var errObj = JSON.parse(message);

						statusText = errObj.statusText || errObj.defaultMessage || 'Error';
						message = errObj.message;
					}
					catch (e) {
						console.log('pageError: couldn\'t parse JSON message', e, err);
					}
				}

				newState = {
					message,
					statusText
				};
			}
			else if (type === PULLS_SUCCESS) {
				newState = null;
			}

			return newState;
		},

		updateAvailable: function(state = null, action) {
			var newState = state;

			var {available, type} = action;

			if (type === UPDATE_AVAILABLE && available) {

				newState = _.merge({}, action.available);
			}

			return newState;
		},

		updateLater: function(state = false, action) {
			var newState = state;

			if (action.type === UPDATE_LATER) {
				newState = true;
			}

			return newState;
		},

		requestMade: function(state = null, action) {
			var newState = state;

			var {err, type} = action;

			if (type === LOGIN_COMPLETE) {
				newState = false;
			}
			else if (checkType(type, PULLS_FAILURE, PULLS_SUCCESS)) {
				newState = true;
			}

			return newState;
		},

		routing,

		settings: function(state = {}, action) {
			var newState = state;

			var {avatar_url, token, type, username} = action;

			if (type === LOGIN_SUCCESS) {
				newState = {token, username, ...state};
			}
			else if (type === LOGIN_COMPLETE) {
				newState = {avatar_url, ...state};
			}

			return newState;
		}
	}
);

export default rootReducer;