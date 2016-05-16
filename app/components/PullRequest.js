import React, {Component} from 'react';

import ExternalLink from './ExternalLink';
import Icon from './Icon';
import IssueLabels from './IssueLabels';
import PullRequestLink from './PullRequestLink';

var MAP_STATUS_STATE = {
	failure: 'exclamation-full',
	pending: 'time',
	success: 'check-circle'
};

export default class PullRequest extends Component {
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
		var {item, config} = this.props;

		var view = config.view;

		var displayComments = _.get(config, 'displayComments', true);
		var displayJira = _.get(config, 'displayJira', true);
		var displayStatus = _.get(config, 'displayStatus', true);

		var status = item.status;

		var issueLabels;
		var pullStatus;

		if (!item.pullRequest) {
			issueLabels = <IssueLabels labels={item.labels} />;
		}
		else if (displayStatus && status && status.statuses.length) {
			var statusState = status.state;

			var name = MAP_STATUS_STATE[statusState];

			var description = status.statuses.map(item => item.description).join('\n\n');

			pullStatus = <span className={'pull-status pull-status-' + statusState} title={description}>
				<Icon name={name} />
			</span>;
		}

		var content;

		var comments = null;

		if (displayComments) {
			comments = (
				<span className="comments">
					<Icon name="comments" />

					<span className="comment-count">{item.comments ? item.comments.length : 0}</span>
				</span>
			);
		}

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

						<h4 title={item.title}>
							<PullRequestLink item={item} displayJira={displayJira} />
						</h4>
					</div>
					<div className="list-group-item-field">
						{comments}
						{pullStatus}
					</div>
				</div>
			</div>;
		}
		else {
			content = <span className="pull-content">
				<span className="pull-info">
					<img className="avatar img-circle" src={item.user.avatarUrl} title={item.user.login} />
					<PullRequestLink item={item} displayJira={displayJira} />
				</span>
				{pullStatus}
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