import settings from '../utils/settings';
import {browserHistory} from 'react-router';

export const LOGIN_COMPLETE = 'LOGIN_COMPLETE';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export const LOGOUT = 'LOGOUT';

export function loginRequest() {
	return {
		type: LOGIN_REQUEST
	};
}

export function loginFailure(data) {
	return {
		type: LOGIN_FAILURE,
		...data
	};
}

export function loginSuccess(username, token) {
	return {
		token,
		type: LOGIN_SUCCESS,
		username
	};
}

export function loginComplete(avatar_url) {
	return {
		avatar_url,
		type: LOGIN_COMPLETE
	};
}

function loginUser(username, password) {
	return {
		password,
		type: LOGIN_REQUEST,
		username
	};
}

export function login(username, password) {
	return (dispatch, getState) => {
		return dispatch(loginUser(username, password));
	};
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

		browserHistory.push('/login');
	};
}