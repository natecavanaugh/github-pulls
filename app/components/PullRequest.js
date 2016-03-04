var React = require('react');

var PullRequestLink = require('./PullRequestLink');
var IssueLabels = require('./IssueLabels');

var PullRequest = React.createClass(
	{
		render: function() {
			var item = this.props.item;

			var issueLabels;

			if (!item.pullRequest) {
				issueLabels = <IssueLabels labels={item.labels} />;
			}

			return <li className="pull">
					<span className="pull-info">
						<img className="avatar img-circle" src={item.user.avatarUrl} title={item.user.login} />
						<PullRequestLink item={item} />
					</span>
					{issueLabels}
				<span className="pull-meta"><span className="from-user">{item.fromUser}</span><span className="create-date" title={item.createDate}>{item.timeAgo}</span></span>
			</li>;
		},
	}
);

module.exports = PullRequest;