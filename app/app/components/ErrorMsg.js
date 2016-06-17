import React, {Component} from 'react';
import Icon from './Icon';
import { Alert, Button } from 'react-bootstrap';

export default class ErrorMsg extends Component {
	handleClick = (e) => {
		this.props.loadPulls();
	}

	render() {
		var props = this.props;

		var reload = props.displayReload ? <Button bsStyle="danger" className="reload-pulls" onClick={this.handleClick}>Reload Pulls</Button> : null;

		return <div className="error-warning">
				<h1 className="sr-only">Github Pulls Error</h1>
				<Alert bsStyle="danger" className="error-status" {...props}>
					<Icon name={props.icon} />
					<strong className="lead">{props.statusText}</strong>
					<p>
						<span>{props.message}</span>
						{reload}
					</p>
				</Alert>
			</div>;
	}
}

ErrorMsg.defaultProps = {
	displayReload: true,
	icon: 'exclamation-circle',
	message: '',
	statusText: ''
};