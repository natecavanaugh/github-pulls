import _ from 'lodash';
import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Repo from './Repo';
import PureRender from '../containers/PureRender';

export class RepoList extends Component {
	@PureRender
	shouldComponentUpdate(nextProps, nextState) {
		return (_.isObject(nextProps.repos) && _.isObject(nextProps.issues));
	}

	render() {
		var props = this.props;

		var result = props.repos || {};
		var collapsedMap = props.config.collapsed;

		var repos = _.map(
			result,
			function(item, index) {
				return <Repo key={`${item.name}repo${index}`} {...props} collapsed={!!collapsedMap[item.path]} item={item} />;
			}
		);

		return <ReactCSSTransitionGroup className="repo-list" component="div" transitionName="repo" transitionEnterTimeout={500} transitionLeaveTimeout={2000}>
			{repos}
		</ReactCSSTransitionGroup>;
	}
}

export default RepoList;