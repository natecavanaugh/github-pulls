var React = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var PullRequest = require('./PullRequest');

var Branch = React.createClass(
	{
		render: function() {
			var props = this.props;
			// console.log('branch',props);

			var pullRequests = props.item.map(
				function(item, index) {
					return <PullRequest key={item.id + 'pullrequest'} {...props} item={item} />
				}
			);

			return <li className="pulls-branch list-group">
					<b className="list-group-heading property-title">{props.title}</b>

					<ul className="list-unstyled pulls list-group-item">
						<ReactCSSTransitionGroup transitionName="pull" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
							{pullRequests}
						</ReactCSSTransitionGroup>
					</ul>
				</li>;
		},
	}
);

module.exports = Branch;