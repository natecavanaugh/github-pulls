import { combineReducers } from 'redux';
import _ from 'lodash';

import { routerStateReducer as router } from 'redux-router'

import { PULLS_REQUEST, PULLS_SUCCESS, PULLS_FAILURE } from '../actions/pulls';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_COMPLETE, LOGIN_FAILURE, LOGOUT } from '../actions/login';

import { CONFIG_OPEN, CONFIG_SAVE, CONFIG_CLOSE, CONFIG_LOAD, CONFIG_REPO_COLLAPSE } from '../actions/config';

const rootReducer = combineReducers({
	entities: function(state = {repos: {}, issues: {}, result: []}, action) {
		switch (action.type) {
			case PULLS_SUCCESS:
				var response = action.response;
				var { entities, result } = response;

				var newState = _.merge({}, entities, { result });

				return newState;
			break;
			default:
			break;
		}

		return state;
	},
	config: function(state = {repos: [], collapsed: {}}, action) {
		switch (action.type) {
			case CONFIG_OPEN:
			case CONFIG_SAVE:
			// case CONFIG_CLOSE:
			case CONFIG_LOAD:
				var newState = _.merge({}, state, action.config);

				// _.defaults(newState, {repos: []});
				// console.log(action.type, newState, action, action.config);

				return newState;
			default:
				break;
		}

		return state;
	},
	loading: function(state = false, action) {
		switch (action.type) {
			case LOGIN_REQUEST:
			case PULLS_REQUEST:
				return true;
			case LOGIN_SUCCESS:
			// case LOGIN_COMPLETE:
			case LOGIN_FAILURE:
			case PULLS_SUCCESS:
			case PULLS_FAILURE:
				return false;
			default:
				break;
		}

		return state;
	},
	loginErrors: function(state = {err: null, errors: null, response: null}, action) {
		switch (action.type) {
			case LOGIN_FAILURE:
				let {err, response} = action;
				let errors = action.errors || '';

				if (!errors) {
					try {
						errors = JSON.parse(err.message).message;
					}
					catch (e) {
						console.log(e);
					}
				}

				return {
					err,
					errors,
					response
				};
			case LOGIN_SUCCESS:
				return {err: null, errors: null, response: null};
			default:
				break;
		}

		return state;
	},
	settings: function(state = {}, action) {
		switch (action.type) {
			case LOGIN_SUCCESS:
				let {username, token} = action;
				return {username, token, ...state};
			case LOGIN_COMPLETE:
				let {avatar_url} = action;
				return {avatar_url, ...state};
			default:
				break;
		}

		return state;
	},
	loggedIn: function(state = false, action) {
		switch (action.type) {
			case LOGIN_SUCCESS:
				let {username, token} = action;
				return !!(username && token);
			case LOGOUT:
				return false;
			default:
				break;
		}

		return state;
	},
  router
});

export default rootReducer;