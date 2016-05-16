import _ from 'lodash';
import moment from 'moment';
import {camelizeKeys} from 'humps';
import {normalize} from 'normalizr';
import Promise from 'bluebird';

import github from '../utils/github';
import settings from '../utils/settings';
import {getUserConfig} from '../utils/user_config';

import {PULLS_REQUEST, pullsFailure, pullsSuccess, Schemas} from '../actions/pulls';

export default function(store) {
	return function(next) {
		return function(action) {
			next(action);

			var retVal;

			if (action.type === PULLS_REQUEST) {
				var getRepoIssues = function(repo) {
					return github.issues.repoIssuesAsync(
						{
							filter: 'open',
							per_page: 100,
							repo: repo.name,
							user: repo.owner
						}
					);
				};

				var getRepoPulls = function(repo) {
					return github.pullRequests.getAllAsync(
						{
							per_page: 100,
							repo: repo.name,
							state: 'open',
							user: repo.owner
						}
					);
				};

				var getComments = function(type, item, repo) {
					return github[type].getCommentsAsync(
						{
							per_page: 100,
							number: item.number,
							repo: repo.name,
							user: repo.owner
						}
					);
				};

				var getIssueComments = getComments.bind(null, 'issues');
				var getPullComments = getComments.bind(null, 'pullRequests');

				var getPullStatus = function(item, repo) {
					return github.statuses.getCombinedAsync(
						{
							sha: item.head.sha,
							repo: repo.name,
							user: repo.owner
						}
					);
				};

				var USER_CACHE = {};

				var getRepoPullsIssues = function(item) {
					return Promise.join(
						getRepoIssues(item),
						getRepoPulls(item),
						(issues, pulls) => {
							issues = camelizeKeys(issues);
							pulls = camelizeKeys(pulls);

							item.pulls = pulls;
							item.issues = _.reject(issues, 'pullRequest');

							var allIssuesPulls = [].concat(issues, pulls);

							var allCommentsPromise;
							var pullCommentsPromise;
							var statusPromise;

							var displayComments = _.get(config, 'displayComments', true);

							if (displayComments) {
								allCommentsPromise = Promise.map(
									allIssuesPulls,
									function(issue) {
										return getIssueComments(issue, item);
									}
								);

								pullCommentsPromise = Promise.map(
									pulls,
									function(pull) {
										return getPullComments(pull, item);
									}
								);
							}

							var displayStatus = _.get(config, 'displayStatus', true);

							if (displayStatus) {
								statusPromise = Promise.map(
									pulls,
									function(pull) {
										return getPullStatus(pull, item);
									}
								);
							}

							var userPromises = _(allIssuesPulls)
										.map('user.login')
										.filter(user => !_.has(USER_CACHE, user))
										.map(user => github.user.getFromAsync({user}))
										.value();

							return Promise.join(
								allCommentsPromise, pullCommentsPromise, statusPromise, ...userPromises,
								function(allComments, pullComments, pullStatuses, ...users) {
									if (allComments) {
										allComments.forEach(
											(item, index) => {
												allIssuesPulls[index].comments = item;
											}
										);
									}

									if (pullComments) {
										pullComments.forEach(
											(item, index) => {
												var pull = pulls[index];

												pull.comments = pull.comments.concat(item);
											}
										);
									}

									if (pullStatuses) {
										pullStatuses.forEach(
											(item, index) => {
												pulls[index].status = item;
											}
										);
									}

									if (users.length) {
										users.forEach(
											(item, index) => {
												USER_CACHE[item.login] = item;
											}
										);
									}

									allIssuesPulls.forEach(
										(item, index) => {
											if (!item.userFull) {
												item.userFull = USER_CACHE[item.user.login];
											}
										}
									);
								}
							).return(item);
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
					var title = item.title;

					item.titleRaw = title;

					var jiraLink = '';
					var jiraTicket = '';

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
						var jiraServer = _.get(config, 'jiraServer', 'https://issues.liferay.com');

						jiraLink = `${jiraServer}/browse/${jiraTicket}`;
					}

					title = title.replace(/^\s*-\s*/, '');

					title = _.trim(title);

					item.jiraTicket = jiraLink;
					item.titleJira = jiraTicket;
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
								repo,
								user
							}
						);
					}
				);

				externalRepos.unshift(myRepos);

				retVal = Promise.all(externalRepos)
						.then(
							repos => {

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
							repos => {
								return Promise.map(
									repos,
									getRepoPullsIssues
								);
							}
						)
						.then(
							repos => {
								_.each(repos, iterateRepos);

								return {
									repos,
									total: _.sum(repos, 'total')
								};
							}
						)
						.then(
							obj => {
								var response = normalize(obj.repos, Schemas.REPO_ARRAY);

								next(pullsSuccess(response));

								return response;
							}
						)
						.catch(
							err => {
								next(pullsFailure(err));
							}
						);
			}

			return retVal;
		};
	};
}