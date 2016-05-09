import React from 'react';
import Icon from './Icon';
import { Alert, Button } from 'react-bootstrap';

export default class ErrorMsg extends React.Component {
	handleClick = (e) => {
		this.props.loadPulls();
	}

	render() {
		var props = this.props;

		return <div className="error-warning">
				<h1 className="sr-only">Github Pulls Error</h1>
				<Alert bsStyle="danger" className="error-status">
					<h4><Icon name="exclamation-circle" />{' '}<span>{props.statusText}</span> </h4>
					<p>
						<span>{props.message}</span>
						<Button bsStyle="danger" className="reload-pulls" onClick={this.handleClick}>Reload Pulls</Button>
					</p>
				</Alert>
			</div>;
	}
}

ErrorMsg.defaultProps = {
	message: '',
	statusText: ''
};