var GitHubApi = require('github');

var github = new GitHubApi(
	{
		// required
		version: '3.0.0',
		// optional
		debug: false,
		protocol: 'https',
		timeout: 5000,
		headers: {
			'user-agent': 'Github Pulls app v1.0' // GitHub is happy with a unique user agent
		}
	}
);

module.exports = github;