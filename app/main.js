global.A = AUI();
global.console = console;

var async = require('async');
var gui = require('nw.gui');
var Y = require('yui/io-base');

// require('nw.gui').Window.get().showDevTools();
// window.focus();

window.resizeTo(window.innerWidth, Math.max(window.innerWidth, screen.height - 100, 930));

AUI().use(
	'aui-base', 'dump', 'handlebars',
	function(A) {
		var Lang = A.Lang;

		var API_URL = 'https://api.github.com/{0}';

		var REFRESH_TIME = 30 * 1000;

		var TPL_LOGIN = A.one('#loginTemplate').html();
		var TPL_LOGIN_ERROR = A.one('#loginErrorTemplate').html();
		var TPL_SOURCE = A.one('#listTemplate').html();
		var TPL_SOURCE_ERROR = A.one('#errorTemplate').html();

		var errorTemplate = A.Handlebars.compile(TPL_SOURCE_ERROR);
		var loginTemplate = A.Handlebars.compile(TPL_LOGIN);
		var loginErrorTemplate = A.Handlebars.compile(TPL_LOGIN_ERROR);

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

					A.mix(data, parsed, true);

					instance._loaded = true;
				}

				return data;
			},
			val: function(key, value) {
				var instance = this;

				var settings = instance.load();

				var setting;

				var get = (arguments.length === 1 && Lang.isString(key));
				var objectKey = Lang.isObject(key);

				if (objectKey || arguments.length > 1) {
					get = false;
				}

				if (get) {
					setting = settings[key];
				}
				else {
					if (objectKey) {
						A.mix(settings, key, true);
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

		A.Handlebars.registerHelper(
			'eachProperty',
			function(context, options) {
				var ret = '';

				for(var prop in context) {
					ret = ret + options.fn({property:prop,value:context[prop]});
				}

				return ret;
			}
		);

		A.Handlebars.registerHelper(
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

				title = A.Lang.trim(title);

				var buffer = ['<a class="external-link" href="' + url + '">' + number + '</a>'];

				if (jiraLink) {
					buffer.push(jiraLink);
				}

				if (title) {
					buffer.push('<a class="external-link" href="' + url + '">' + title + '</a>');
				}

				return new A.Handlebars.SafeString(buffer.join(' - '));
			}
		);

		var defaultFailureFn = function(e) {
			var body = A.getBody();

			var pullsTitle = A.one('#pullsTitle') || A.one('#accountBar');

			if (!e.statusText) {
				e.statusText = 'An Unknown error occured when trying to load ' + url;
			}

			var errorResponse = A.Node.create(errorTemplate(e));

			if (pullsTitle) {
				var currentError = A.one('.error-warning');

				var showError = function() {
					pullsTitle.placeAfter(errorResponse);

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
			var url = Lang.sub(API_URL, [path]);

			var headers = {
				'Authorization': 'token ' + settings.val('token'),
				'User-Agent': 'Github Pulls app v1.0'
			};

			var data = null;

			var method = 'GET';

			if (config) {
				headers = A.mix(headers, config.headers, true);
				data = config.data || data;
				method = config.method || method;
			}

			var x = Y.io(
				url,
				{
					headers: headers,
					data: data,
					method: method,
					on: {
						failure: function(id, e) {
							(failure || defaultFailureFn)(e);
						},
						complete: function(id, e) {
							if (Lang.isFunction(callback)) {
								var json = JSON.parse(e.responseText);

								callback(json, e);
							}
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
					ghApiRequest(Lang.sub('repos/{path}/pulls', item),
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

					A.each(
						results,
						function(repo, index, collection) {
							var currentBranchName = '';
							var branchPulls = {};

							repo.branchPulls = branchPulls;
							repo.total = 0;
							var repoName = repo.name;

							A.each(
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

					var body = A.getBody();

					if (!body) {
						window.reload();

						return;
					}

					if (!cachedResults || cachedResults !== JSON.stringify(results)) {
						cachedResults = JSON.stringify(results);

						sessionStorage.cachedResults = cachedResults;

						var template = A.Handlebars.compile(TPL_SOURCE);

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

		A.getBody().delegate(
			'click',
			function(event) {
				event.preventDefault();

				loadPullsTask.delay(0);
			},
			'.reload-pulls'
		);

		A.getBody().delegate(
			'click',
			function(event) {
				event.preventDefault();

				loadPullsTask.cancel();

				loadLogin();

				settings.destroy();
			},
			'.logout'
		);

		// Usage: debugRequest('repos/natecavanaugh/liferay-portal/pulls');
		debugRequest = function(path) {
			console.log('**** debugRequest: ' + path);

			ghApiRequest(
				path,
				function(json) {
					console.log('* debugRequest - ghApiRequest: ' + A.dump(json));
				}
			);
		};

		var loadLogin = function() {
			var body = A.getBody();

			if (navigator.onLine) {
				body.removeClass('status-offline').removeClass('loading').addClass('loaded').addClass('login').html(loginTemplate());

				A.one('#fm').on(
					'submit',
					function(event) {
						event.preventDefault();

						var loginErrors = A.one('#loginErrors');

						loginErrors._hideClass = 'hide';

						var usernameField = A.one('#username');
						var passwordField = A.one('#password');

						var username = Lang.trim(usernameField.val());
						var password = Lang.trim(passwordField.val());

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
				A.getBody().replaceClass('status-offline', 'loading');

				ghApiRequest(
					'user/repos',
					function(json) {
						var repos = [];

						A.Object.each(
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
				A.getBody().replaceClass('loading', 'status-offline');
			}
		};

		var loadPullsTask = A.debounce(loadPulls, REFRESH_TIME);

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

		AUI.Env.add(
			window,
			'online',
			function(event) {
				loadPullsTask.delay(0);
			}
		);

		AUI.Env.add(
			window,
			'offline',
			function(event) {
				loadPullsTask.cancel();

				A.getBody().replaceClass('loading', 'status-offline');
			}
		);

		A.getBody().delegate(
			'click',
			function(event) {
				gui.Shell.openExternal(event.currentTarget.attr('href'));

				event.preventDefault();
			},
			'.external-link'
		);
});