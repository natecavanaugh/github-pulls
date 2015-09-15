var GitHubApi = require('github-cache');

var CacheDB = require('./cachedb');

var github = new GitHubApi(
	{
		// required
		version: '3.0.0',
		// optional
		debug: false,
		cachedb: new CacheDB('./cachedb.json'),
		protocol: 'https',
		headers: {
			'user-agent': 'Github Pulls app v1.0' // GitHub is happy with a unique user agent
		}
	}
);

module.exports = github;