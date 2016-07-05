import React, {Component} from 'react';

import Branch from './Branch';
import ExternalLink from './ExternalLink';
import Icon from './Icon';

export default class Repo extends Component {
	handleCollapseClick = (event) => {
		let {item: {path}, config: {collapsed}} = this.props;

		this.props.collapseRepo(
			path,
			!collapsed[path]
		);
	}

	render() {
		var props = this.props;
		var {item, settings: {username}} = props;
		var branchPulls = item.branchPulls;
		var branches = Object.keys(branchPulls);

		var cssClass = 'repo card';

		if (props.collapsed) {
			cssClass += ' repo-collapsed';
		}

		var repoTitle = item.name;

		if (item.owner !== username) {
			repoTitle = `${item.owner}/${repoTitle}`;
		}

		return <div className={cssClass}>
				<h2 className="card-header" onClick={this.handleCollapseClick}>
					<span className="repo-title">
						<span className="repo-name">{repoTitle}</span>
						<ExternalLink className="repo-link" href={`http://github.com/${item.path}`} stopPropagation={true}>
							<Icon className="icon-monospaced" name="link" />
						</ExternalLink>
					</span>
					<span className="badge badge-primary pull-count">{item.total}</span>
				</h2>

				<ul className="list-unstyled repo-branches">
					{branches.map(
						(item, index) => {
							var branch = branchPulls[item];

							return <Branch key={item + 'branch'} {...props} item={branch} title={item} />;
						}
					)}
				</ul>
		</div>;
	}
}