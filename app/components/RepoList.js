import _ from 'lodash';
import React from 'react';

import Repo from './Repo';

export class RepoList extends React.Component {
	shouldComponentUpdate(nextProps, nextState) {
		return _.isObject(nextProps.repos) && _.isObject(nextProps.issues);
	}

	render() {
		var props = this.props;

		var result = props.repos || {};

		var repos = _.map(
			result,
			function(item, index) {
				return <Repo key={item.name + 'repo' + index} {...props} item={item} />
			}
		);

		return <div className='repo-list'>
			{repos}
		</div>;
	}
}

export default RepoList;