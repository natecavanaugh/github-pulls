import _ from 'lodash';
import success from 'success';

import { CALL_API } from './api'
import GithubPulls from '../utils/';

import github from '../utils/github';
import settings from '../utils/settings';
import {pushState} from 'redux-router';

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_COMPLETE, LOGIN_FAILURE, loginRequest, loginFailure, loginSuccess, loginComplete } from '../actions/login';
import {loadConfig} from '../actions/config';

export default function(store) {
	return function(next) {
		return function(action) {
			next(action);

			if (action.type !== LOGIN_REQUEST) {
				return;
			}

			var scriptNote = 'Github Pulls (by Liferay) - electron';

			let {username, password} = action;

			github.authenticate(
				{
					type: 'basic',
					username,
					password
				}
			);

			var ghAuth = github.authorization.getAllAsync(
				{
					per_page: 100
				}
			)
			.then((response) => {
				var token = _.find(
					response,
					{
						note: scriptNote
					}
				);

				if (token && token.hashed_token) {
					return github.authorization.deleteAsync(
						{
							id: token.id
						}
					);
				}
			})
			.then((response) => {
				return github.authorization.createAsync(
					{
						scopes: ['repo'],
						note: scriptNote
					}
				);
			})
			.then(
				(response) => response.token
			)
			.then(
				(token) => {
					var val = {
						token: token,
						username: username
					};

					settings.val(val);

					next(loginSuccess(username, token));
					store.dispatch(loadConfig(username));
					store.dispatch(pushState(null, '/'));

					return github.user.getAsync({});
				}
			)
			.then(
				(response) => {
					var { avatar_url } = response;

					if (response && response.avatar_url) {
						settings.val('avatar', response.avatar_url);
					}

					next(loginComplete(avatar_url));
				}
			)
			.catch((err) => {
				var message = 'Unknown Error';

				if (err && err.message) {
					try {
						message = JSON.parse(err.message).message;
					}
					catch (e) {
						console.log(e, message, err, err.message);
					}
				}

				var response = {
					errorText: 'Could not log into Github.',
					statusText: 'Error',
					message
				};

				next(loginFailure({ err, response }));
			});

			console.log('middleware login.js', ghAuth, loadConfig);

			return ghAuth;
	};
  };
};