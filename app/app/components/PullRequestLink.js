import React, {Component} from 'react';

import ExternalLink from './ExternalLink';

export default class PullRequestLink extends Component {
	render() {
		var item = this.props.item;

		var number = item.number;
		var title = item.title;
		var url = item.htmlUrl;

		var jiraTitle = item.titleJira;
		var jiraTicket = item.jiraTicket;

		var link;

		if (this.props.displayJira) {
			var buffer = [<ExternalLink key={number + '1'} href={url} title={number} />];

			if (jiraTitle) {
				buffer.push(' - ', <ExternalLink key={number + '2'} href={jiraTicket} title={jiraTitle} />);
			}

			if (title) {
				buffer.push(' - ', <ExternalLink key={number + '3'} href={url} title={title} />);
			}

			link = buffer;
		}
		else {
			link = <ExternalLink key={number + '1'} href={url} title={item.titleRaw} />;
		}

		return <span className="pull-request-link">{link}</span>;
	}
}