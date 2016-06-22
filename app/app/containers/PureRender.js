import _ from 'lodash';

var baseCheck = function(nextProps, nextState) {
		var shouldUpdate = !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);

		return shouldUpdate;
};

export default function PureRender(...args) {
	var fn = baseCheck;

	var [target, property, descriptor] = args;

	var originalTarget = target;

	if (_.isFunction(target)) {
		if (args.length === 1) {
			target = target.prototype;
		}
		else {
			fn = function(...args) {
				return baseCheck.call(this, ...args) && target.call(this, ...args);
			};
		}
	}

	target.shouldComponentUpdate = fn;

	return originalTarget;
}