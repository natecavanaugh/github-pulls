import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PullRequest from './PullRequest';

export default class Branch extends React.Component {
	render() {
		var props = this.props;

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
	}
}