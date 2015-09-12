var _ = require('lodash');
var async = require('async');
var success = require('success');
var GithubPulls = require('./index');
var github = require('../util/github');
var settings = require('../util/settings');
var moment = require('moment');

var ghCallback = _.bind(
	success,
	null,
	function(err) {
		return GithubPulls.emit('request:error', err);
	}
);

exports.ghCallback = ghCallback;

var getRepoIssues = function(item, cb) {
	github.issues.repoIssues(
		{
			user: github.auth.username,
			repo: item.name,
			filter: 'open',
			per_page: 100
		},
		ghCallback(
			function(response) {
				cb(
					null,
					{
						issues: response,
						name: item.name
					}
				);
			}
		)
	);
};

var getRepoPulls = function(item, cb){
	github.pullRequests.getAll(
		{
			user: settings.val('username'),
			repo: item.name,
			state: 'open',
			per_page: 100
		},
		ghCallback(
			function(response) {
				if (response.length) {
					cb(
						null,
						{
							name: item.name,
							pulls: response
						}
					);
				}
				else {
					getRepoIssues(item, cb);
				}
			}
		)
	);
};

var iteratePullsIssues = function(pull, index, collection) {
	var pullRequest = !!pull.base;

	if (!pullRequest) {
		_.set(pull, 'base.ref', 'master');
	}

	pull.fromUser = pull.user.login;

	var createdAt = pull.created_at;

	var createDate = moment(createdAt);

	var timeAgo = '';

	if (createDate.isValid()) {
		timeAgo = createDate.fromNow();
		createDate = createDate.format('dddd MMMM Do YYYY @ h:mm:ss a');
	}
	else {
		createDate = '';
	}

	pull.createDate = createDate;
	pull.timeAgo = timeAgo;

	pull.pullRequest = pullRequest;
};

var iterateRepos = function(repo, index, collection) {
	var allIssues = _.union(repo.issues, repo.pulls);

	_.each(allIssues, iteratePullsIssues);

	repo.branchPulls = _.groupBy(allIssues, 'base.ref');

	repo.total = allIssues.length;

	delete repo.issues;
	delete repo.pulls;
};

exports.getPullRequests = function(repos, cb) {
	async.map(
		repos,
		getRepoPulls,
		function (err, repos) {
			_.each(repos, iterateRepos);

			cb(
				{
					total: _.sum(repos, 'total'),
					repos: repos
				}
			);
		}
	);
};

exports.filterRepos = function(repos) {
	return _.reduce(
		repos,
		function(prev, item, index, collection) {
			if (item.open_issues > 0) {
				prev.push(
					{
						name: item.name,
						path: [item.owner.login, item.name].join('/'),
						pulls: []
					}
				);
			}

			return prev;
		},
		[]
	);
};

exports.getAllRepos = function(cb) {
	github.repos.getAll(
		{
			per_page: 100,
			type: 'owner'
		},
		ghCallback(cb)
	);
};