var _ = require('lodash');
var success = require('success');

var GithubPulls = require('./');

var github = require('../util/github');
var settings = require('../util/settings');

module.exports = function(username, password) {
	var scriptNote = 'Github Pulls (by Liferay)';

	github.authenticate(
		{
			type: 'basic',
			username: username,
			password: password
		}
	);

	var createToken = function() {
		// Second passs to create it
		github.authorization.create(
			{
				scopes: ['repo'],
				note: scriptNote
			},
			success(handleAuthError, handleNewTokenResponse)
		);
	};

	var checkExistingToken = function(response) {
		// First pass to see if we have it
		var token = _.find(
			response,
			{
				note: scriptNote
			}
		);

		if (token && token.hashed_token) {
			github.authorization.delete(
				{
					id: token.id
				},
				success(handleAuthError, createToken)
			);
		}
		else {
			createToken();
		}
	};

	var handleAuthError = function(err) {
		console.log(err);
		var response = {
			errorText: 'Could not log into Github.',
			statusText: 'Error',
			message: JSON.parse(err.message).message
		};

		GithubPulls.emit('login:error', response, err);
	};

	var handleNewTokenResponse = function(response) {
		var token = response.token;

		if (token) {
			setToken(token);
		}
		else {
			handleAuthError(response);
		}
	};

	var setToken = function(token) {
		var val = {
			token: token,
			username: username
		};

		settings.val(val);

		GithubPulls.emit('login:success');

		github.user.get(
			{},
			function(err, response) {
				if (response && response.avatar_url) {
					settings.val('avatar', response.avatar_url);
				}

				GithubPulls.emit('login:complete');
			}
		);
	};

	github.authorization.getAll(
		{
			per_page: 100
		},
		success(handleAuthError, checkExistingToken)
	);
};