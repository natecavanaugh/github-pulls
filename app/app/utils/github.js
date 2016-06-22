import GitHubApi from 'github-cache';

import CacheDB from './cachedb';

import _ from 'lodash';
import Promise from 'bluebird';

import {USER_PREFS_PATH} from './settings';

var github = new GitHubApi(
	{
		cachedb: new CacheDB(`${USER_PREFS_PATH}/cachedb.json`),
		debug: false,
		headers: {
			'user-agent': 'Github Pulls app v1.0'
		},
		protocol: 'https',
		version: '3.0.0'
	}
);

_.forOwn(
	github,
	function(item, index) {
		if (_.isPlainObject(item)) {
			Promise.promisifyAll(item);
		}
	}
);

Promise.promisifyAll(github);

export default github;