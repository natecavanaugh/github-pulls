global.console = console;

var async = require('async');
var gui = require('nw.gui');

// require('nw.gui').Window.get().showDevTools();
// window.focus();

window.resizeTo(window.innerWidth, Math.max(window.innerWidth, screen.height - 100, 930));

var $ = require('jquery')(window);
var Handlebars = require('handlebars');
var _ = require('lodash');

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

var REGEX_SUB = /\{\s*([^|}]+?)\s*(?:\|([^}]*))?\s*\}/g;

_.mixin(
	{
		sub: function(string, data) {
			if (arguments.length > 2 || !_.isObject(data)) {
				data = _.toArray(arguments).slice(1);
			}

			return string.replace ? string.replace(
				REGEX_SUB,
				function (match, key) {
					return _.isUndefined(data[key]) ? match : data[key];
				}
			) : string;
		}
	}
);

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
		var API_URL = 'https://api.github.com/{0}';

		var REFRESH_TIME = 30 * 1000;

		var TPL_LOGIN = $('#loginTemplate').html();
		var TPL_LOGIN_ERROR = $('#loginErrorTemplate').html();
		var TPL_SOURCE = $('#listTemplate').html();
		var TPL_SOURCE_ERROR = $('#errorTemplate').html();

		var errorTemplate = Handlebars.compile(TPL_SOURCE_ERROR);
		var loginTemplate = Handlebars.compile(TPL_LOGIN);
		var loginErrorTemplate = Handlebars.compile(TPL_LOGIN_ERROR);

		var settings = {
			data: {},

			destroy: function() {
				cachedResults = '';
				delete sessionStorage.cachedResults;
				delete localStorage.settings;
			},

			load: function() {
				var instance = this;

				var data = instance.data;

				if (instance._loaded || !localStorage.settings) {
					localStorage.settings = JSON.stringify(data);
				}
				else {
					var parsed = JSON.parse(localStorage.settings);

					_.extend(data, parsed);

					instance._loaded = true;
				}

				return data;
			},
			val: function(key, value) {
				var instance = this;

				var settings = instance.load();

				var setting;

				var get = (arguments.length === 1 && _.isString(key));
				var objectKey = _.isObject(key);

				if (objectKey || arguments.length > 1) {
					get = false;
				}

				if (get) {
					setting = settings[key];
				}
				else {
					if (objectKey) {
						_.extend(settings, key);
					}
					else {
						settings[key] = value;
					}

					setting = settings;
				}

				return setting;
			}
		};

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

		var defaultFailureFn = function(e) {
			var body = $.body;

			var pullsTitle = $('#pullsTitle');

			if (!pullsTitle.length) {
				 pullsTitle = $('#accountBar');
			}

			if (!e.statusText) {
				e.statusText = 'An Unknown error occured when trying to load ' + url;
			}

			var errorResponse = $(errorTemplate(e));

			if (pullsTitle) {
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
				body.prepend(errorResponse);
			}
		};

		var ghApiRequest = function(path, callback, failure, config) {
			var url = _.sub(API_URL, path);

			var headers = {
				'Authorization': 'token ' + settings.val('token'),
				'User-Agent': 'Github Pulls app v1.0'
			};

			var data = null;

			var method = 'GET';

			if (config) {
				headers = _.extend(headers, config.headers);
				data = config.data || data;
				method = config.method || method;
			}

			var x = $.ajax(
				url,
				{
					headers: headers,
					data: data,
					type: method,
					error: function(xhr) {
						(failure || defaultFailureFn)(xhr);
					},
					crossDomain: true,
					complete: function(xhr, response) {
						if (_.isFunction(callback)) {
							var json = JSON.parse(xhr.responseText);

							callback(json, xhr);
						}
					}
				}
			);
		};

		var cachedResults = '';

		var getPullRequests = function(repos) {
			async.map(
				repos,
				function(item, cb){
					ghApiRequest(_.sub('repos/{path}/pulls', item),
						function(json) {
							cb(
								null,
								{
									name: item.name,
									pulls: json
								}
							);
						}
					);
				},
				function (err, results) {
					var result = [];

					var allTotal = 0;

					_.each(
						results,
						function(repo, index, collection) {
							var currentBranchName = '';
							var branchPulls = {};

							repo.branchPulls = branchPulls;
							repo.total = 0;
							var repoName = repo.name;

							_.each(
								repo.pulls,
								function(pull, index, collection) {
									var branchName = pull.base.ref;

									var branch = branchPulls[branchName];

									if (!branch) {
										branch = [];
										branchPulls[branchName] = branch;
									}

									branch.push(pull);

									pull.fromUser = pull.user.login;

									repo.total += 1;
									allTotal += 1;
								}
							);

							delete repo.pulls;
						}
					);

					var body = $.body;

					if (!body) {
						window.reload();

						return;
					}

					if (!cachedResults || cachedResults !== JSON.stringify(results)) {
						cachedResults = JSON.stringify(results);

						sessionStorage.cachedResults = cachedResults;

						var template = Handlebars.compile(TPL_SOURCE);

						var vals = settings.load();

						body.html(
							template(
								{
									results: results,
									total: allTotal,
									avatar: vals.avatar,
									username: vals.username
								}
							)
						);
					}

					body.replaceClass('loading', 'loaded');

					loadPullsTask();
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

				settings.destroy();
			}
		);

		// Usage: debugRequest('repos/natecavanaugh/liferay-portal/pulls');
		debugRequest = function(path) {
			console.log('**** debugRequest: ' + path);

			ghApiRequest(
				path,
				function(json) {
					console.log('* debugRequest - ghApiRequest: ' + JSON.stringify(''+json));
				}
			);
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

						// loginErrors._hideClass = 'hide';

						var usernameField = $('#username');
						var passwordField = $('#password');

						var username = $.trim(usernameField.val());
						var password = $.trim(passwordField.val());

						if (username && password) {
							loginErrors.hide();

							var data = JSON.stringify(
								{
									scopes: ['repo'],
									note: 'Github Pulls (by Liferay)'
								}
							);

							body.addClass('loading');

							ghApiRequest(
								'authorizations',
								function(json, response) {
									var token = json.token;

									if (token) {
										var val = {
											token: json.token,
											username: username
										};

										settings.val(val);

										body.removeClass('loaded').html('');

										loadPulls();
									}
									else {
										response.errorText = 'Could not log into Github.';
										response.message = json.message;

										loginErrors.html(loginErrorTemplate(response)).show();

										body.removeClass('loading');
									}
								},
								function(response) {
								},
								{
									data: data,
									headers: {
										'Authorization': 'Basic ' + btoa(username + ':' + password),
										'Content-Type': 'application/x-www-form-urlencoded'
									},
									method: 'POST'
								}
							);
						}
						else {
							loginErrors.html('Please enter both your username and password').show();
						}
					}
				)

			}
			else {
				body.replaceClass('loading', 'status-offline');
			}
		};

		var loadPulls = function (){
			if (navigator.onLine) {
				$.body.replaceClass('status-offline', 'loading');

				ghApiRequest(
					'user/repos',
					function(json) {
						var repos = [];

						_.each(
							json,
							function(item, index, collection) {
								if (!avatar && item.owner.login == settings.val('username')) {
									avatar = item.owner.avatar_url;

									settings.val('avatar', avatar);
								}

								if (item.open_issues > 0) {
									repos.push(
										{
											name: item.name,
											path: [item.owner.login, item.name].join('/'),
											pulls: []
										}
									);
								}
							}
						);

						getPullRequests(repos);
					}
				);
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
};