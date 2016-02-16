var React = require('react');

var ExternalLink = require('./ExternalLink');

var PullRequestLink = React.createClass(
	{
		render: function() {
			var item = this.props.item;

			var number = item.number;
			var title = item.title;
			var url = item.htmlUrl;

			var jiraTitle = item.titleJira;
			var jiraTicket = item.jiraTicket;

			var buffer = [<ExternalLink key={number + '1'} href={url} title={number} />];

			if (jiraTitle) {
				buffer.push(' - ', <ExternalLink key={number + '2'} href={jiraTicket} title={jiraTitle} />);
			}

			if (title) {
				buffer.push(' - ', <ExternalLink key={number + '3'} href={url} title={title} />);
			}

			return <span className="pull-request-link">{buffer}</span>;
		}
	}
);

module.exports = PullRequestLink;