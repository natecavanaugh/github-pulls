import React from 'react';
import Icon from './Icon';

export default class ErrorMsg extends React.Component {
	constructor(...args) {
		super(...args);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e) {
		this.props.loadPulls();
	}

	render() {
		var props = this.props;

		return <div className="error-warning">
				<h1>Github Pulls Error</h1>
				<div className="error-status">
					<p>
						<Icon name="exclamation-circle" /> <span>{props.statusText}<br />
				{props.message}</span> <a className="reload-pulls" href="javascript:;" onClick={this.handleClick}>Reload Pulls</a>
					</p>
				</div>
			</div>;
	}
}

ErrorMsg.defaultProps = {
	message: '',
	statusText: ''
};