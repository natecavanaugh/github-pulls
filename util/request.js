var _ = require('lodash');
var sub = require('string-sub');

var API_URL = 'https://api.github.com/{0}';

module.exports = function(win) {
	var settings = require('./settings');

	var $ = win.jQuery;

	var defaultFailureFn = function(e, xhr, url) {
		var body = $.body;

		var pullsTitle = $('#pullsTitle');

		if (!pullsTitle.length) {
			pullsTitle = $('#accountBar');
		}

		if (!e.statusText) {
			e.statusText = 'An Unknown error occured when trying to load ' + url;
		}

		var errorResponse = $(win.errorTemplate(e));

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

	return function(path, callback, failure, config) {
		var url = sub(API_URL, path);

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

		return $.ajax(
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
					(failure || defaultFailureFn)(json, xhr, url);
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
};