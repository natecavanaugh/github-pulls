import React from 'react';
import Icon from './Icon';

export default class ErrorMsg extends React.Component {
	render() {
		var props = this.props;

		return <div className="error-warning">
				<h1>Github Pulls Error</h1>
				<div className="error-status">
					<p>
						<Icon name="exclamation-circle" /> <span>{props.statusText}<br />
				{props.message}</span> <a className="reload-pulls" href="javascript:;">Reload Pulls</a>
					</p>
				</div>
			</div>;
	}
}

ErrorMsg.defaultProps = {
	message: '',
	statusText: ''
};

export class LoginError extends React.Component {
	render() {
		var props = this.props;

		var errorText;
		var message;

		if (props.errorText) {
			errorText = <p>{props.errorText}</p>;
		}

		if (props.message) {
			message = <p>Server responded with:<br />
				<b>{props.message}</b>
			</p>;
		}

		return <div className="alert alert-danger">
			{errorText}
			<p><span className="glyphicon glyphicon-exclamation-sign"></span> {props.statusText}</p>
			{message}
		</div>;
	}
}

LoginError.defaultProps = {
	errorText: '',
	message: '',
	statusText: ''
};