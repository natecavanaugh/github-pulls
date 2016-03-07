import React from 'react';

import PullRequestLink from './PullRequestLink';
import IssueLabels from './IssueLabels';

export default class PullRequest extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.handleDrag = this.handleDrag.bind(this);
	}

	handleDrag(e) {
		var {item} = this.props;

		if (item.pullRequest) {
			e.dataTransfer.setData('text/plain', `git pr ${item.number}`);
		}
	}

	render() {
		var item = this.props.item;

		var issueLabels;

		if (!item.pullRequest) {
			issueLabels = <IssueLabels labels={item.labels} />;
		}

		return <li onDragStart={this.handleDrag} className="pull">
				<span className="pull-info">
					<img className="avatar img-circle" src={item.user.avatarUrl} title={item.user.login} />
					<PullRequestLink item={item} />
				</span>
				{issueLabels}
			<span className="pull-meta"><span className="from-user">{item.fromUser}</span><span className="create-date" title={item.createDate}>{item.timeAgo}</span></span>
		</li>;
	}
}