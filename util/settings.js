var _ = require('lodash');
var jsop = require('jsop');

module.exports = {
	db: jsop('settings.json'),

	destroy: function() {
		_.forOwn(this.db, this._clearDB);
	},

	load: function() {
		return this.db;
	},

	val: function(key, value) {
		var setting;

		var db = this.db;

		var get = (arguments.length === 1 && _.isString(key));
		var objectKey = _.isObject(key);

		if (objectKey || arguments.length > 1) {
			get = false;
		}

		if (get) {
			setting = db[key];
		}
		else {
			if (objectKey) {
				_.extend(db, key);
			}
			else {
				db[key] = value;
			}
		}

		return setting;
	},

	_clearDB: function(item, index, obj) {
		delete obj[index];
	}
};