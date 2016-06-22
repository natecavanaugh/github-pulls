import _ from 'lodash';
import jsop from './jsop';

export default class {
	constructor(path) {
		this.db = jsop(path);
	}

	batch(ops, options, cb) {
		if (!_.isArray(ops)) {
			throw new Error('The ops parameter must be an array');
		}

		if (_.isUndefined(cb)) {
			cb = options;
		}

		if (!_.isFunction(cb)) {
			throw new Error('The callback parameter must be a function');
		}

		var arr = _.map(
			ops,
			item => {
				if (!item.type && !_.isUndefined(item.key) && !_.isUndefined(item.value)) {
					item.type = 'put';
				}

				return item;
			}
		);

		var errors = [];

		var collectResults = function(err, res) {
			if (err) {
				errors.push(err);
			}
		};

		_.forEach(
			arr,
			({type, key, value}) => {
				if (type === 'del') {
					value = collectResults;
				}

				this[type](key, value, collectResults);
			}
		);

		cb(errors.length ? errors : null);
	}

	del(key, cb) {
		delete this.db[key];

		cb(null);
	}

	get(key, cb) {
		const db = this.db;

		let err = null;
		let value = null;

		if (!db.hasOwnProperty(key)) {
			err = {status: 404};
		}
		else {
			value = db[key];
		}

		cb(err, value);
	}

	put(key, value, cb) {
		this.db[key] = value;

		cb(null, value);
	}
}