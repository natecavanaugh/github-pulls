module.exports = function(win) {
	var _ = require('lodash');

	var localStorage = win.localStorage;

	return {
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
};