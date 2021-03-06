import _ from 'lodash';

import github from '../utils/github';
import settings from '../utils/settings';

import {hashHistory} from 'react-router';

import {LOGIN_REQUEST, login, loginFailure, loginSuccess, loginComplete} from '../actions/login';
import {loadConfig} from '../actions/config';

export default function(store) {
	return function(next) {
		return function(action) {
			next(action);

			var retVal;

			if (action.type === LOGIN_REQUEST) {
				var scriptNote = 'Github Pulls (by Liferay) - electron';

				let {username, password, otp, oauthToken} = action;

				var headers = {};

				var payload = {
					cache: false,
					headers,
					password,
					type: 'basic',
					username
				};

				if (oauthToken) {
					payload = {
						type: 'oauth',
						token: oauthToken
					};
				}
				else if (otp) {
					payload.headers['X-GitHub-OTP'] = otp;
				}

				github.authenticate(payload);

				retVal = github.authorization.getAllAsync(
					{
						headers,
						per_page: 100
					}
				)
				.then(
					response => {
						var token = _.find(
							response,
							{
								note: scriptNote
							}
						);

						var newResponse;

						if (token && token.hashed_token) {
							newResponse = github.authorization.deleteAsync(
								{
									headers,
									id: token.id
								}
							);
						}

						return newResponse;
					}
				)
				.then(
					response => {
						return github.authorization.createAsync(
							{
								headers,
								note: scriptNote,
								scopes: ['repo']
							}
						);
					}
				)
				.then(
					response => response.token
				)
				.then(
					token => {
						var val = {
							token: token,
							username: username
						};

						settings.val(val);

						next(loginSuccess(username, token));

						store.dispatch(loadConfig(username));

						hashHistory.push('/')

						return github.users.getAsync({});
					}
				)
				.then(
					response => {
						var {avatar_url} = response;

						if (response && response.avatar_url) {
							settings.val('avatar', response.avatar_url);
						}

						next(loginComplete(avatar_url));
					}
				)
				.catch(
					err => {
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
							message,
							statusText: 'Error'
						};

						next(loginFailure({err, response}));
					}
				);
			}

			return retVal;
		};
	};
}