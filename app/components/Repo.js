import React from 'react';

import Branch from './Branch';

export class Repo extends React.Component {
	state = {
		collapsed: false
	};

	constructor(props, context) {
		super(props, context);

		this.handleCollapseClick = this.handleCollapseClick.bind(this);
	}

	handleCollapseClick(event) {
		this.setState({collapsed: !this.state.collapsed});
	}

	render() {
		var props = this.props;
		var item = props.item;
		var branchPulls = item.branchPulls;
		var branches = Object.keys(branchPulls);

		var cssClass = 'repo';
		var iconCssClass = 'fa-toggle-down';

		if (this.state.collapsed) {
			cssClass += ' repo-collapsed';
			iconCssClass = 'fa-toggle-right';
		}

		return <div className={cssClass}>
				<h2><span className="repo-name">{item.name}</span> <span className="pull-count">{item.total}</span></h2>

				<ul className="list-unstyled repo-branches">
					{branches.map(function(item, index) {
						var branch = branchPulls[item];
// console.log(branch);
						return <Branch key={item + 'branch'} {...props} item={branch} title={item} />
					})}
				</ul>
				<span className="collapse-icon" onClick={this.handleCollapseClick}>
					<span className={`fa ${iconCssClass}`}></span>
				</span>
		</div>;
	}
}

module.exports = Repo;