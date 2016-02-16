import { CALL_API } from '../middleware/api'
import github from '../utils/github';
import settings from '../utils/settings';
import getUserConfig from '../utils/user_config';
import {pushState} from 'redux-router';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_COMPLETE = 'LOGIN_COMPLETE';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT = 'LOGOUT';

// export function login(username, password) {
// 	return {
// 		type: LOGIN_REQUEST,
// 		username,
// 		password
// 	};
// }

export function loginRequest() {
	return {
		type: LOGIN_REQUEST
	}
}

export function loginFailure(data) {
	return {
		type: LOGIN_FAILURE,
		...data
	}
}

export function loginSuccess(username, token) {
	return {
		type: LOGIN_SUCCESS,
		username,
		token
	}
}

export function loginComplete(avatar_url) {
	return {
		type: LOGIN_COMPLETE,
		avatar_url
	}
}

// Fetches a single repository from Github API.
// Relies on the custom API middleware defined in ../middleware/api.js.
function loginUser(username, password) {
	return {
		type: LOGIN_REQUEST,
		username,
		password
	}
}

// Fetches a single repository from Github API unless it is cached.
// Relies on Redux Thunk middleware.
export function login(username, password) {
	return (dispatch, getState) => {
		return dispatch(loginUser(username, password));
	}
}

export function logout() {
	settings.destroy();

	return {
		type: LOGOUT
	};
}

export function logoutAndRedirect() {
	return (dispatch, state) => {
		dispatch(logout());
		dispatch(pushState(null, '/login'));
	};
}