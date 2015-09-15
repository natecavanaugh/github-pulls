global.console = console;

var async = require('async');
var gui = require('nw.gui');

var $ = window.jQuery;
var Handlebars = require('handlebars');
var _ = require('lodash-bindright')(require('lodash'));
var sub = require('string-sub');
var success = require('success');

var GithubPulls = require('./lib/');
var login = require('./lib/login');
var pulls = require('./lib/pulls');

var settings = require('./util/settings');
var github = require('./util/github');

var Window = gui.Window.get();

global.USER_PREFS_PATH = gui.App.dataPath;

window.github = github;

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

			Window.reloadDev();
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
							jiraLink = `<a class="external-link" href="https://issues.liferay.com/browse/${match}">${match}</a>`;
						}

						return '';
					}
				);

				title = title.replace(/^\s*-\s*/, '');

				title = $.trim(title);

				var buffer = [`<a class="external-link" href="${url}">${number}</a>`];

				if (jiraLink) {
					buffer.push(jiraLink);
				}

				if (title) {
					buffer.push(`<a class="external-link" href="${url}">${title}</a>`);
				}

				return new Handlebars.SafeString(buffer.join(' - '));
			}
		);

		window.errorTemplate = errorTemplate;

		var cachedResults = '';

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

		var handleProcessedRepos = function(result) {
			var repos = result.repos;

			var body = $.body;

			if (!body) {
				window.reload();

				return;
			}

			if (!cachedResults || cachedResults !== JSON.stringify(repos)) {
				cachedResults = JSON.stringify(repos);

				window.sessionStorage.cachedResults = cachedResults;

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

				pulls.getAllRepos(_.flow(pulls.filterRepos, _.bindRight(pulls.getPullRequests, null, handleProcessedRepos)));

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

		var defaultFailureFn = function(err) {
			var body = $.body;

			var errObj;

			try {
				errObj = JSON.parse(err.message);
			}
			catch (e) {
				errObj = {
					message: 'Unknown error'
				};

				console.log(e, err);
			}

			var pullsTitle = $('#pullsTitle');

			if (!pullsTitle.length) {
				pullsTitle = $('#accountBar');
			}

			errObj.statusText = 'An error occured when trying to load the request';

			var errorResponse = $(errorTemplate(errObj));

			if (pullsTitle.length) {
				var currentError = $('.error-warning');

				var showError = function() {
					pullsTitle.after(errorResponse);

					body.addClass('status-error').removeClass('status-offline').removeClass('loading');

					errorResponse.addClass('alert alert-warning');
				};

				if (currentError) {
					currentError.remove();

					setTimeout(showError, 200);
				}
				else {
					showError();
				}
			}
			else {
				body.addClass('status-error').removeClass('status-offline').removeClass('loading').prepend(errorResponse);
			}
		};

		GithubPulls.on(
			'request:error',
			function(err) {
				defaultFailureFn(err);
			}
		);

		var loadPullsTask = debounce(loadPulls, REFRESH_TIME);

		window.loadPullsTask = loadPullsTask;
		window.loadPulls = loadPulls;

		var init = function() {
			var token = settings.val('token');

			if (token) {
				github.authenticate(
					{
						type: 'token',
						username: settings.val('username'),
						token: token
					}
				);

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
				var intersects = require('intersects');

				var getObj = function(winObj) {
					return {
						left: winObj.x,
						top: winObj.y,
						height: winObj.height,
						width: winObj.width,
						bottom: winObj.y + winObj.height,
						right: winObj.x + winObj.width
					};
				};

				var winDetails = getObj(Window);
				var dtWinDetails = getObj(dtWin);

				while (intersects(winDetails, dtWinDetails, 0.5)) {
					dtWinDetails.left += 10;
					dtWinDetails.right += 10;
				}

				dtWin.x = dtWinDetails.left;
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