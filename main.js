global.console = console;

var async = require('async');
var gui = require('nw.gui');

var $ = window.jQuery;
var Handlebars = require('handlebars');
var _ = require('lodash');

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
		var API_BASE_URL = 'https://api.github.com/';
		var API_URL = API_BASE_URL + '{0}';

		var REFRESH_TIME = 30 * 1000;

		var TPL_LOGIN = $('#loginTemplate').html();
		var TPL_LOGIN_ERROR = $('#loginErrorTemplate').html();
		var TPL_SOURCE = $('#listTemplate').html();
		var TPL_SOURCE_ERROR = $('#errorTemplate').html();

		var errorTemplate = Handlebars.compile(TPL_SOURCE_ERROR);
		var loginTemplate = Handlebars.compile(TPL_LOGIN);
		var loginErrorTemplate = Handlebars.compile(TPL_LOGIN_ERROR);

		var settings = window.settings = {
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
					instance._save();
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

				var data = instance.load();

				var setting;

				var get = (arguments.length === 1 && _.isString(key));
				var objectKey = _.isObject(key);

				if (objectKey || arguments.length > 1) {
					get = false;
				}

				if (get) {
					setting = data[key];
				}
				else {
					if (objectKey) {
						_.extend(data, key);
					}
					else {
						data[key] = value;
					}

					// This second calls saves the data back in
					setting = instance._save();
				}

				return setting;
			},

			_save: function() {
				var instance = this;

				localStorage.settings = JSON.stringify(instance.data);
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
					dataType: 'json',
					type: method,
					error: function(xhr) {
						var json = {};

						if (xhr && xhr.responseText) {
							try {
								json = JSON.parse(xhr.responseText);
							}
							catch (e) {
								// console.log(e);
							}
						}
						(failure || defaultFailureFn)(json, xhr);
					},
					crossDomain: true,
					success: function(json, msg) {
						if (_.isFunction(callback)) {
							callback(json, msg);
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

					var repos = _.filter(
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

									repo.total += 1;
									allTotal += 1;
								}
							);

							delete repo.pulls;

							return !!allTotal;
						}
					);

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
									total: allTotal,
									avatar: vals.avatar,
									username: vals.username
								}
							)
						);
					}

					body.replaceClass('loading', 'loaded');

					$.body.trigger('loaded');

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

		$.body.on(
			'loaded',
			function() {
				var statusTags = $('.pull-ci-status');

				async.eachLimit(
					statusTags,
					5,
					function(statusTag, cb) {
						var statusesURL = $(statusTag).attr('data-statuses-url');

						statusesURL = statusesURL.replace(API_BASE_URL, '');

						ghApiRequest(
							statusesURL,
							function(response) {
								if (response.length) {
									var state = response[0].state;

									var stateCssClass = 'state-' + state;

									$(statusTag).addClass('complete');
									$(statusTag).addClass(stateCssClass);
									$(statusTag).text(state);
								}

								cb();
							}
						);
					}
				);
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

						var usernameField = $('#username');
						var passwordField = $('#password');

						var username = $.trim(usernameField.val());
						var password = $.trim(passwordField.val());

						if (username && password) {
							loginErrors.addClass('hide');

							var scriptNote = 'Github Pulls (by Liferay)';

							var data = JSON.stringify(
								{
									scopes: ['repo'],
									note: scriptNote
								}
							);

							body.addClass('loading');

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

								body.removeClass('loaded').html('');

								loadPulls();
							};

							var handleAuthError = function(json, response) {
								console.log(json, response);
								response.errorText = 'Could not log into Github.';
								response.message = json.message;

								loginErrors.html(loginErrorTemplate(response)).removeClass('hide');

								body.removeClass('loading');
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
										function(json, response){
											console.log(json, response);
										},
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
										success(json, response, loginData)
									},
									function(json, response){
										failure(json, response, loginData)
									},
									loginData
								);
							};

							authRequest(loginData, checkExistingToken, handleAuthError);
						}
						else {
							loginErrors.html('Please enter both your username and password').removeClass('hide');
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
					},
					null,
					{
						data: {
							per_page: 100,
							type: 'owner'
						}
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
};