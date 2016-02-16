import React from 'react';
import { Link } from 'react-router';

import ExternalLink from './ExternalLink';

class AccountBar extends React.Component {
	render() {
		var props = this.props;

		return <div className="account-bar" id="accountBar">
			<div className="app-column">
				<span className="user-info">
					<ExternalLink href={'http://github.com/' + props.username}>
						<img src={props.avatar} />
					</ExternalLink> {' '}
					<ExternalLink href={'http://github.com/' + props.username} title={props.username} />

					<a href="javascript:;" onClick={() => props.openConfig()}>
						<i className='fa fa-cog' />
					</a>
				</span>

				<span className="app-title">Github Pulls <span className="pull-count">{props.total}</span></span>

				<a className="logout" href="javascript:;" onClick={() => props.logoutAndRedirect()}>
					<i className='fa fa-power-off' /> Logout
				</a>
			</div>

			<div className="loading-bar"></div>
		</div>;
	}
}

export default AccountBar;