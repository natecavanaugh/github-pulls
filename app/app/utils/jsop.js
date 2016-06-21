import _ from 'lodash';
import fs from 'fs';
import steno from 'steno';

var objects = {};

function createProxy(filename) {
	if (objects[filename]) {
		return objects[filename];
	}
	else {
		if (!fs.existsSync(filename)) {
			fs.writeFileSync(filename, '{}');
		}

		var object = JSON.parse(fs.readFileSync(filename), {encoding: 'utf-8'});

		var updateProp = function(type, obj, property, newValue) {
			var result = true;

			if (type === 'set') {
				if (_.isObject(newValue)) {
					newValue = recurse(newValue);
				}

				result = obj[property] = newValue;
			}
			else if (type === 'defineProperty') {
				result = Object.defineProperty(obj, property, newValue);
			}
			else if (true) {
				result = delete target[propKey];
			}

			write();

			return result;
		};

		function proxy(obj) {
			var proxy = new Proxy(obj, {
				set: _.partial(updateProp, 'set'),
				defineProperty: _.partial(updateProp, 'defineProperty'),
				deleteProperty: _.partial(updateProp, 'deleteProperty')
			});

			return proxy;
		}

		function recurse(obj) {
			_.forEach(
				obj,
				(item, index) => {
					if (_.isObject(item)) {
						obj[index] = recurse(item);
					}
				}
			);

			return proxy(obj);
		}

		object = recurse(object);

		var write = _.debounce(function() {
			steno.writeFile(
				filename,
				JSON.stringify(object, null, 2),
				err => {
					if (err) {
						console.error(err);
					}
				}
			);
		}, 10);

		objects[filename] = object;

		return object;
	}
}

export default createProxy;