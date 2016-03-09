import React from 'react';

import Icon from './Icon';

class AccountBar extends React.Component {
	render() {
		var props = this.props;

		return <div className="management-bar management-bar-default">
			<div className="container-fluid-1280">
				<div className="management-bar-header-right">
					<a className="btn btn-default" href="javascript:;">
						<Icon className="icon-monospaced" name="list-ul" />
					</a>
					<a className="btn btn-default" href="javascript:;">
						<Icon className="icon-monospaced" name="list-ul" />
					</a>
					<a className="btn btn-default" href="javascript:;">
						<Icon className="icon-monospaced" name="list-ul" />
					</a>
				</div>
			</div>
		</div>;
	}
}

export default AccountBar;