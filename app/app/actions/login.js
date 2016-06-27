import settings from '../utils/settings';
import {hashHistory} from 'react-router';

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

function loginUser(username, password, otp, oauthToken) {
	return {
		password,
		type: LOGIN_REQUEST,
		username,
		otp,
		oauthToken
	};
}

export function login(username, password, otp, oauthToken) {
	return (dispatch, getState) => {
		return dispatch(loginUser(username, password, otp, oauthToken));
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

		hashHistory.push('/login');
	};
}