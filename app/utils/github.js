import GitHubApi from 'github-cache';

import CacheDB from './cachedb';

import _ from 'lodash';
import Promise from 'bluebird';

import { USER_PREFS_PATH } from './settings';

var github = new GitHubApi(
	{
		// required
		version: '3.0.0',
		// optional
		debug: false,
		cachedb: new CacheDB(`${USER_PREFS_PATH}/cachedb.json`),
		protocol: 'https',
		headers: {
			'user-agent': 'Github Pulls app v1.0' // GitHub is happy with a unique user agent
		}
	}
);

// Promise.promisifyAll(_.filter(_.values(github), _.isPlainObject));

// console.log('github', github.repos.getAllAsync);

_.forOwn(
	github,
	function(item, index) {
		if (_.isPlainObject(item)) {
			// console.log(item, index);
			Promise.promisifyAll(item);
		}
	}
);

export default github;

// module.exports = github;