import React from 'react';

import ExternalLink from './ExternalLink';
import Icon from './Icon';
import IssueLabels from './IssueLabels';
import PullRequestLink from './PullRequestLink';

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
		var {item, config: {view}} = this.props;

		var issueLabels;

		if (!item.pullRequest) {
			issueLabels = <IssueLabels labels={item.labels} />;
		}

		var content;

		var comments = (
			<span className="comments">
				<Icon name="comments" />

				<span className="comment-count">{item.comments.length}</span>
			</span>
		);

		if (view === 'comfortable') {
			var {user: {htmlUrl, login: userName}} = item;
			var sent = `sent ${item.timeAgo}`;

			content = <div className="card card-horizontal">
				<div className="card-row card-row-padded">
					<div className="card-col-field">
						<div className="list-group-card-icon">
							<div className="user-icon">
								<img className="avatar img-responsive" src={item.user.avatarUrl} title={item.user.login} />
							</div>
						</div>
					</div>
					<div className="card-col-content card-col-gutters">
						<h5 className="text-default pull-title" title={`${userName} ${sent} (${item.createDate})`}>
							<span><ExternalLink href={htmlUrl} title={userName} /> {sent}</span> {issueLabels}
						</h5>

						<h4 title="7 UX Trends of 2015: Get Ready for Big Changes">
							<PullRequestLink item={item} />
						</h4>
					</div>
					<div className="list-group-item-field">
						{comments}
					</div>
				</div>
			</div>;
		}
		else {
			content = <span className="pull-content">
				<span className="pull-info">
					<img className="avatar img-circle" src={item.user.avatarUrl} title={item.user.login} />
					<PullRequestLink item={item} />
				</span>
				{issueLabels}
				<span className="pull-meta">
					<span className="from-user">{item.fromUser}</span>
					<span className="create-date" title={item.createDate}>{item.timeAgo}</span>
				</span>
				{comments}
			</span>;
		}

		return <li onDragStart={this.handleDrag} className="pull list-group-item">
			{content}
		</li>;
	}
}