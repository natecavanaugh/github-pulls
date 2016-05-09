import {combineReducers} from 'redux';
import _ from 'lodash';

import { routerReducer as routing } from 'react-router-redux';

import {PULLS_REQUEST, PULLS_SUCCESS, PULLS_FAILURE} from '../actions/pulls';

import {LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_COMPLETE, LOGIN_FAILURE, LOGOUT} from '../actions/login';

import {PAGE_ONLINE, PAGE_OFFLINE} from '../actions/page';

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
				newState = _.merge({}, state, action.config);
			}

			return newState;
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
						console.log(e);
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
						// console.log(e);
					}
				}

				console.log(message, statusText);

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