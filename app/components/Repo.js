import React from 'react';

import Branch from './Branch';
import Icon from './Icon';

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

		var cssClass = 'repo card';
		var iconName = 'angle-down';

		if (this.state.collapsed) {
			cssClass += ' repo-collapsed';
			iconName = 'angle-right';
		}

		return <div className={cssClass}>
				<h2 className="card-header" onClick={this.handleCollapseClick}><span className="repo-name">{item.name}</span> <span className="pull-count">{item.total}</span></h2>

				<ul className="list-unstyled repo-branches">
					{branches.map(function(item, index) {
						var branch = branchPulls[item];

						return <Branch key={item + 'branch'} {...props} item={branch} title={item} />
					})}
				</ul>
				{/*<span className="collapse-icon">
									<Icon name={iconName} />
								</span>*/}
		</div>;
	}
}

module.exports = Repo;