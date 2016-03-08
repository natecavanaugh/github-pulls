import React from 'react';

import Branch from './Branch';

export default class Repo extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.handleCollapseClick = this.handleCollapseClick.bind(this);
	}

	handleCollapseClick(event) {
		let {item: {path}, config: {collapsed}} = this.props;

		this.props.collapseRepo(
			path,
			!collapsed[path]
		);
	}

	render() {
		var props = this.props;
		var item = props.item;
		var branchPulls = item.branchPulls;
		var branches = Object.keys(branchPulls);

		var cssClass = 'repo card';

		if (props.collapsed) {
			cssClass += ' repo-collapsed';
		}

		return <div className={cssClass}>
				<h2 className="card-header" onClick={this.handleCollapseClick}>
					<span className="repo-name">{item.name}</span>
					<span className="badge badge-primary">{item.total}</span>
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