import React from 'react';

import ExternalLink from './ExternalLink';

export default class PullRequestLink extends React.Component {
	render() {
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