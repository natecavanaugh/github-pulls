global.console = console;

var async = require('async');
var gui = require('nw.gui');

global.USER_PREFS_PATH = gui.App.dataPath;

var GithubPulls = require('./lib');

var $ = window.jQuery;
var Handlebars = require('handlebars');
var _ = require('lodash-bindright')(require('lodash'));
var sub = require('string-sub');

var Window = gui.Window.get();

var mb = new gui.Menu({type:'menubar'});

mb.createMacBuiltin('Github Pulls');

Window.menu = mb;

var reloadMenuItem = new gui.MenuItem(
	{
		click: function(event) {
			Window.reload();
		},
		key: 'r',
		label: 'Refresh',
		modifiers: 'cmd',
		type: 'normal'
	}
);

var reloadFullMenuItem = new gui.MenuItem(
	{
		click: function(event) {
			var cache = global.require.cache;

			_.each(
				cache,
				function(item, index) {
					delete cache[index];
				}
			);

			Window.reload();
		},
		key: 'r',
		label: 'Refresh (clear all cache)',
		modifiers: 'cmd-shift',
		type: 'normal'
	}
);

process.once('uncaughtException', function (err) {
	console.log(err);
});

var editMenu = mb.items[1];

editMenu.submenu.insert(reloadMenuItem, 0);
editMenu.submenu.insert(reloadFullMenuItem, 1);

window.resizeTo(window.innerWidth, Math.max(window.innerWidth, screen.height - 100, 930));

var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

$.support.cors = true;

$.ajaxSettings.xhr = function () {
	return new XMLHttpRequest();
};

$.fn.replaceClass = function(oldClass, newClass) {
	return this.each(
		function(index, item) {
			var instance = $(this);

			instance.removeClass(oldClass);
			instance.addClass(newClass);
		}
	);
};

Object.defineProperty(
	$,
	'body',
	{
		get: function() {
			return $('body');
		},
		configurable: true
	}
);

$(document).ready(
	function($) {
		var REFRESH_TIME = 30 * 1000;

		var TPL_LOGIN = $('#loginTemplate').html();
		var TPL_LOGIN_ERROR = $('#loginErrorTemplate').html();
		var TPL_SOURCE = $('#listTemplate').html();
		var TPL_SOURCE_ERROR = $('#errorTemplate').html();

		var errorTemplate = Handlebars.compile(TPL_SOURCE_ERROR);
		var loginTemplate = Handlebars.compile(TPL_LOGIN);
		var loginErrorTemplate = Handlebars.compile(TPL_LOGIN_ERROR);

		var settings = require('./util/settings');

		window.settings = settings;

		var avatar = settings.val('avatar');

		Handlebars.registerHelper(
			'eachProperty',
			function(context, options) {
				var ret = '';

				for(var prop in context) {
					ret = ret + options.fn({property:prop,value:context[prop]});
				}

				return ret;
			}
		);

		Handlebars.registerHelper(
			'createLink',
			function(context, options) {
				var number = this.number;
				var title = this.title;
				var url = this.html_url;

				var jiraLink = '';

				title = title.replace(
					/(?:[A-Z]{3,}-\d+)/,
					function(match, key, str) {
						if (match) {
							jiraLink = '<a class="external-link" href="https://issues.liferay.com/browse/' + match + '">' + match + '</a>';
						}

						return '';
					}
				);

				title = title.replace(/^\s*-\s*/, '');

				title = $.trim(title);

				var buffer = ['<a class="external-link" href="' + url + '">' + number + '</a>'];

				if (jiraLink) {
					buffer.push(jiraLink);
				}

				if (title) {
					buffer.push('<a class="external-link" href="' + url + '">' + title + '</a>');
				}

				return new Handlebars.SafeString(buffer.join(' - '));
			}
		);

		window.errorTemplate = errorTemplate;

		var ghApiRequest = require('./util/request')(window);

		var cachedResults = '';

		var mapRequests = function(item, cb){
			ghApiRequest(
				sub('repos/{path}/pulls', item),
				function(pulls) {
					if (pulls.length) {
						cb(
							null,
							{
								name: item.name,
								pulls: pulls
							}
						);
					}
					else {
						ghApiRequest(
							sub('repos/{path}/issues', item),
							function(issues) {
								cb(
									null,
									{
										issues: issues,
										name: item.name
									}
								);
							},
							null,
							{
								filter: 'all'
							}
						);
					}
				}
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

		var getPullRequests = function(repos, cb) {
			async.map(
				repos,
				mapRequests,
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

		$.body.on(
			'click',
			'.reload-pulls',
			function(event) {
				event.preventDefault();

				loadPulls();
			}
		);

		$.body.on(
			'click',
			'.logout',
			function(event) {
				event.preventDefault();

				loadPullsTask.cancel();

				loadLogin();

				cachedResults = '';
				delete sessionStorage.cachedResults;

				settings.destroy();
			}
		);

		// Usage: debugRequest('repos/natecavanaugh/liferay-portal/pulls');
		var debugRequest = function(path) {
			console.log('**** debugRequest: ' + path);

			ghApiRequest(
				path,
				function(json) {
					console.log('* debugRequest - ghApiRequest: ' + JSON.stringify(''+json));
				}
			);
		};

		var login = function(username, password) {
			var scriptNote = 'Github Pulls (by Liferay)';

			var data = JSON.stringify(
				{
					scopes: ['repo'],
					note: scriptNote
				}
			);

			var loginData = {
				data: data,
				headers: {
					'Authorization': 'Basic ' + btoa(username + ':' + password),
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				method: 'GET'
			};

			var setToken = function(token) {
				var val = {
					token: token,
					username: username
				};

				settings.val(val);

				GithubPulls.emit('login:success');

				ghApiRequest(
					'users/' + username,
					function(json, response) {
						if (json.avatar_url) {
							avatar = json.avatar_url;

							settings.val('avatar', avatar);
						}

						GithubPulls.emit('login:complete');
					},
					function() {
						GithubPulls.emit('login:complete');
					}
				);
			};

			var handleAuthError = function(json, response) {
				console.log(json, response);
				response.errorText = 'Could not log into Github.';
				response.message = json.message;

				GithubPulls.emit('login:error', response, json);
			};

			var createToken = function() {
				// Second passs to create it
				loginData.method = 'POST';

				authRequest(loginData, handleNewTokenResponse, handleAuthError);
			};

			var checkExistingToken = function(json, response) {
				// First pass to see if we have it
				var token = _.find(
					json,
					{
						note: scriptNote
					}
				);

				if (token && token.hashed_token) {
					ghApiRequest(
						'authorizations/' + token.id,
						function(json, response){
							createToken();
						},
						handleAuthError,
						_.defaults({method: 'DELETE'}, loginData)
					);
				}
				else {
					createToken();
				}
			};

			var handleNewTokenResponse = function(json, response, loginData) {
				var token = json.token;

				if (token) {
					setToken(token);
				}
				else {
					handleAuthError(json, response, loginData);
				}
			};

			var authRequest = function(loginData, success, failure) {
				ghApiRequest(
					'authorizations',
					function(json, response){
						success(json, response, loginData);
					},
					function(json, response){
						failure(json, response, loginData);
					},
					loginData
				);
			};

			authRequest(loginData, checkExistingToken, handleAuthError);
		};

		var loadLogin = function() {
			var body = $.body;

			if (navigator.onLine) {
				body.removeClass('status-offline').removeClass('loading').addClass('loaded').addClass('login').html(loginTemplate());

				$('#fm').on(
					'submit',
					function(event) {
						event.preventDefault();

						var loginErrors = $('#loginErrors');

						var usernameField = $('#username');
						var passwordField = $('#password');

						var username = $.trim(usernameField.val());
						var password = $.trim(passwordField.val());

						if (username && password) {
							loginErrors.addClass('hide');

							body.addClass('loading');

							GithubPulls.once(
								'login:error',
								function(response, json) {
									loginErrors.html(loginErrorTemplate(response)).removeClass('hide');

									$.body.removeClass('loading');
								}
							);

							GithubPulls.once(
								'login:complete',
								function() {
									$.body.removeClass('loaded');

									loadPulls();
								}
							);

							login(username, password);
						}
						else {
							loginErrors.html('Please enter both your username and password').removeClass('hide');
						}
					}
				);
			}
			else {
				body.replaceClass('loading', 'status-offline');
			}
		};

		var getAllRepos = function(cb) {
			ghApiRequest(
				'user/repos',
				cb,
				null,
				{
					data: {
						per_page: 100,
						type: 'owner'
					}
				}
			);
		};

		var filterRepos = function(repos) {
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

		var handleProcessedRepos = function(result) {
			var repos = result.repos;

			var body = $.body;

			if (!body) {
				window.reload();

				return;
			}

			if (!cachedResults || cachedResults !== JSON.stringify(repos)) {
				cachedResults = JSON.stringify(repos);

				sessionStorage.cachedResults = cachedResults;

				var template = Handlebars.compile(TPL_SOURCE);

				var vals = settings.load();

				body.html(
					template(
						{
							results: repos,
							total: result.total,
							avatar: vals.avatar,
							username: vals.username
						}
					)
				);
			}

			body.replaceClass('loading', 'loaded');

			loadPullsTask();
		};

		var loadPulls = function (){
			if (navigator.onLine) {
				$.body.replaceClass('status-offline', 'loading');

				getAllRepos(_.flow(filterRepos, _.bindRight(getPullRequests, null, handleProcessedRepos)));

				/*function(repos) {
					// if (!avatar) {
					//	var username = settings.val('username');
					//	var avatarURL = _.result(_.findWhere(repos, {owner: {login: username}}), 'owner.avatar_url');

					//	if (avatarURL) {
					//		avatar = avatarURL;

					//		settings.val('avatar', avatar);
					//	}
					// }

					getPullRequests(filterRepos(repos));
				}*/
			}
			else {
				$.body.replaceClass('loading', 'status-offline');
			}
		};

		var loadPullsTask = debounce(loadPulls, REFRESH_TIME);

		window.loadPullsTask = loadPullsTask;

		var init = function() {
			if (settings.val('token')) {
				loadPulls();
			}
			else {
				loadLogin();
			}
		};

		init();

		$(window).on(
			'online',
			function(event) {
				loadPulls();
			}
		);

		$(window).on(
			'offline',
			function(event) {
				loadPullsTask.cancel();

				$.body.replaceClass('loading', 'status-offline');
			}
		);

		$.body.on(
			'click',
			'.external-link',
			function(event) {
				gui.Shell.openExternal($(event.currentTarget).attr('href'));

				event.preventDefault();
			}
		);

		// appending to the HTML to always persist
		var html = $('html');

		html.append('<span class="load-devtools" title="Keep DevTools Open"><i class="glyphicon glyphicon-wrench"></i></span>');

		function toggleDevTools(open, persist) {
			open = !!open;

			var dtWin = Window[open ? 'showDevTools' : 'closeDevTools']();

			if (open) {
				dtWin.x = Window.x + 400;
			}

			window.focus();

			if (persist) {
				settings.val('load_devtools', open);
			}

			html.toggleClass('devtools-loaded', open);
		}

		toggleDevTools(settings.val('load_devtools'));

		html.on(
			'click',
			'.load-devtools',
			function(event) {
				var showDevTools = html.hasClass('devtools-loaded');

				toggleDevTools(!showDevTools, true);
			}
		);
});

// Temporarily adding debounce until Lodash 3 is published, in order to support cancelling a debounced function

var isArray = _.isArray;
var isString = _.isString;
var isUndefined = _.isUndefined;

var DEFAULT_ARGS = [];

var toArray = function(arr, fallback, index) {
	return !isUndefined(arr) ? _.toArray(arr).slice(index || 0) : fallback;
};

function debounce(fn, delay, context, args) {
	var id;
	var tempArgs;

	if (isString(fn) && context) {
		fn = _.bindKey(context, fn);
	}

	delay = delay || 0;

	args = toArray(arguments, DEFAULT_ARGS, 3);

	var clearFn = function() {
		clearInterval(id);

		id = null;
	};

	var base = function() {
		clearFn();

		var result = fn.apply(context, tempArgs || args || DEFAULT_ARGS);

		tempArgs = null;

		return result;
	};

	var delayFn = function(delayTime, newArgs, newContext, newFn) {
		wrapped.cancel();

		delayTime = !isUndefined(delayTime) ? delayTime : delay;

		fn = newFn || fn;
		context = newContext || context;

		if (newArgs != args) {
			tempArgs = toArray(newArgs, DEFAULT_ARGS, 0, false).concat(args);
		}

		if (delayTime > 0) {
			id = setInterval(base, delayTime);
		}
		else {
			return base();
		}
	};

	var cancelFn = function() {
		if (id) {
			clearFn();
		}
	};

	var setDelay = function(delay) {
		cancelFn();

		delay = delay || 0;
	};

	var wrapped = function() {
		var currentArgs = arguments.length ? arguments : args;

		return wrapped.delay(delay, currentArgs, context || this);
	};

	wrapped.cancel = cancelFn;
	wrapped.delay = delayFn;
	wrapped.setDelay = setDelay;

	return wrapped;
}