var jsop = require('jsop');

var CacheDB = function(path) {
	this.db = jsop(path);
};

CacheDB.prototype = {
	del: function(key, cb) {
		delete this.db[key];

		// console.log('delete', key);

		cb(null);
	},

	get: function(key, cb) {
		var db = this.db;

		var err = null;
		var value = null;

		if (!db.hasOwnProperty(key)) {
			err = {
				status: 404
			};
		}
		else {
			value = db[key];
		}

		// console.log('get', key, value);

		cb(err, value);
	},

	put: function(key, value, cb) {
		this.db[key] = value;

		// console.log('put', key, value);

		cb(null, value);
	}
};

module.exports = CacheDB;