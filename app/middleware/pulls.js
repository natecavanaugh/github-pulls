import _ from 'lodash';
import moment from 'moment';
import { camelizeKeys } from 'humps'
import { Schema, arrayOf, valuesOf, normalize } from 'normalizr'
import { pushState } from 'redux-router';
import Promise from 'bluebird';

import github from '../utils/github';
import settings from '../utils/settings';
import { getUserConfig } from '../utils/user_config';

import { PULLS_REQUEST, PULLS_SUCCESS, PULLS_COMPLETE, PULLS_FAILURE, pullsRequest, pullsFailure, pullsSuccess, Schemas } from '../actions/pulls';

export default function(store) {
	return function(next) {
		return function(action) {
			next(action);

			if (action.type !== PULLS_REQUEST) {
				return;
			}

			var getRepoIssues = function(repo) {
				return github.issues.repoIssuesAsync(
					{
						user: repo.owner,
						repo: repo.name,
						filter: 'open',
						per_page: 100
					}
				);
			};

			var getRepoPulls = function(repo) {
				return github.pullRequests.getAllAsync(
					{
						user: repo.owner,
						repo: repo.name,
						state: 'open',
						per_page: 100
					}
				);
			};

			var iteratePullsIssues = function(pull, index, collection) {
				var pullRequest = !!pull.base;

				if (!pullRequest) {
					_.set(pull, 'base.ref', 'master');
				}

				pull.fromUser = pull.user.login;

				var createdAt = pull.createdAt;

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

				repo.allIssues = allIssues;

				repo.total = allIssues.length;

				delete repo.issues;
				delete repo.pulls;
			};

			var processTitle = function(item) {
				var number = item.number;
				var title = item.title;
				var url = item.htmlUrl;

				item.titleRaw = title;

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

				item.titleJira = jiraTicket;
				item.jiraTicket = jiraLink;
				item.title = title;

				return item;
			};

			var myRepos = github.repos.getAllAsync(
				{
					per_page: 100,
					type: 'owner'
				}
			);

			var config = getUserConfig(settings.val('username')).load();

			var externalRepos = (config.repos || []).map(
				function(item, index) {
					var [user, repo] = item.split('/');

					return github.repos.getAsync(
						{
							user,
							repo
						}
					);
				}
			);

			externalRepos.unshift(myRepos);

			var gh = Promise.all(externalRepos)
			.then(
				function(repos) {

					repos = _.flatten(repos);

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
				}
			)
			.then(
				function(repos) {
					return Promise.map(
						repos,
						// repos.map(
							(item) => {
								return Promise.join(
									getRepoIssues(item), getRepoPulls(item),
									(issues, pulls) => {
										issues = camelizeKeys(issues);
										pulls = camelizeKeys(pulls);

										item.pulls = pulls;
										item.issues = _.reject(issues, 'pullRequest');

										return item;
									}
								);
							}
						// )
					);
				}
			)
			.then(
				function(repos) {
					_.each(repos, iterateRepos);

					return {
						repos,
						total: _.sum(repos, 'total')
					}
				}
			)
			.then(
				(obj) => {
					var response = normalize(obj.repos, Schemas.REPO_ARRAY);

					next(pullsSuccess(response));

					return response;
				}
			)
			.catch(function(err) {
				console.log('Error', err);
				next(pullsFailure(err));
			});

			return gh;
	};
  };
};