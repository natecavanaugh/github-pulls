import _ from 'lodash';

var baseCheck = function(nextProps, nextState) {
		var shouldUpdate = !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);

		return shouldUpdate;
};

export default function PureRender(target) {
	var fn = baseCheck;
	var originalTarget = target;

	if (_.isFunction(target)) {
		if (/(^class\s|_classCallCheck)/.test(Function.prototype.toString.call(target))) {
			originalTarget = target;
			target = target.prototype;
		}
		else {
			fn = function(...args) {
				return baseCheck.call(this, ...args) && target.call(this, ...args);
			};
		}
	}

	target.shouldComponentUpdate = fn;

	if (originalTarget != target) {
		target = originalTarget;
	}

	return target;
}