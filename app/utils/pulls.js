import _ from 'lodash';
import async from 'async';
import success from 'success';
import GithubPulls from './index';
import github from './github';
import settings from './settings';
import moment from 'moment';

var ghCallback = _.bind(
	success,
	null,
	function(err) {
		return GithubPulls.emit('request:error', err);
	}
);

exports.ghCallback = ghCallback;

var processTitle = function(item) {
	var number = item.number;
	var title = item.title;
	var url = item.html_url;

	item.title_raw = title;

	var jiraTicket = '';
	var jiraLink = '';

	title = title.replace(
		/(?:[A-Z]{3,}-\d+)/,
		function(match, key, str) {
			if (match) {
				jiraTicket = match;
			}

			return '';
		}
	);

	if (jiraTicket) {
		jiraLink = `https://issues.liferay.com/browse/${jiraTicket}`;
	}

	title = title.replace(/^\s*-\s*/, '');

	title = _.trim(title);

	item.title_jira = jiraTicket;
	item.jira_ticket = jiraLink;
	item.title = title;

	return item;
};

var getAllIssuesPulls = function(item, cb) {
	async.parallel(
		[
			getRepoPulls.bind(null, item),
			getRepoIssues.bind(null, item)
		],
		ghCallback(
			function(results) {
				item.pulls = results[0];
				item.issues = _.reject(results[1], 'pull_request');

				cb(null, item);
			}
		)
	);
};

var getRepoIssues = function(item, cb) {
	github.issues.repoIssues(
		{
			user: item.owner,
			repo: item.name,
			filter: 'open',
			per_page: 100
		},
		cb
	);
};

var getRepoPulls = function(item, cb){
	github.pullRequests.getAll(
		{
			user: item.owner,
			repo: item.name,
			state: 'open',
			per_page: 100
		},
		cb
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

	pull = processTitle(pull);
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
		getAllIssuesPulls,
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
						owner: item.owner.login,
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
	var repos = [
		github.repos.getAll.bind(
			github.repos,
			{
				per_page: 100,
				type: 'owner'
			}
		)
	];

	repos = [
			'liferay/lexicon',
		].reduce(
		function(prev, item, index) {
			var pieces = item.split('/');

			prev.push(
				github.repos.get.bind(
					null,
					{
						user: pieces[0],
						repo: pieces[1]
					}
				)
			);

			return prev;
		},
		repos
	);

	async.parallel(repos, ghCallback(_.flow(_.flatten, cb)));
};