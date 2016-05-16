import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PullRequest from './PullRequest';

export default class Branch extends Component {
	render() {
		var props = this.props;

		var pullRequests = props.item.map(
			function(item, index) {
				return <PullRequest key={item.id + 'pullrequest'} {...props} item={item} />;
			}
		);

		var className = 'list-group';

		if (props.config.view === 'comfortable') {
			className += ' list-group-card pulls-branch';
		}
		else {
			className += ' pulls-branch';
		}

		return <li className={className}>
				<b className="list-group-heading property-title">{props.title}</b>

				<ul className="list-unstyled pulls">
					<ReactCSSTransitionGroup transitionName="pull" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
						{pullRequests}
					</ReactCSSTransitionGroup>
				</ul>
			</li>;
	}
}