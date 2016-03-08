import jsop from 'jsop';

export default class {
	constructor(path) {
		this.db = jsop(path);
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