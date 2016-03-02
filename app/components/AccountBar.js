import React from 'react';
import { Link } from 'react-router';

import ExternalLink from './ExternalLink';
import Icon from './Icon';

class AccountBar extends React.Component {
	render() {
		var props = this.props;

		return <div className="account-bar" id="accountBar">
			<div className="app-column container-fluid-1280">
				<span className="user-info">
					<ExternalLink className="user-icon" href={'http://github.com/' + props.username}>
						<img className="img-responsive" src={props.avatar} />
					</ExternalLink> {' '}
					<ExternalLink href={'http://github.com/' + props.username} title={props.username} />
					{' '}
					<a href="javascript:;" onClick={() => props.openConfig()}>
						<Icon name="cog" />
					</a>
				</span>

				<span className="app-title">Github Pulls <span className="pull-count">{props.total}</span></span>

				<a className="logout" href="javascript:;" onClick={() => props.logoutAndRedirect()}>
					<Icon name="logout" /> Logout
				</a>
			</div>

			<div className="loading-bar"></div>
		</div>;
	}
}

export default AccountBar;