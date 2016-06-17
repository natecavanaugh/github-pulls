import React, {Component, PropTypes} from 'react';
import {Alert, Button, ControlLabel, FormGroup, FormControl} from 'react-bootstrap';
import ErrorMsg from './ErrorMsg';
import Icon from './Icon';

const STR_MISSING_CREDENTIALS = 'Please enter both your username and password';

export default class Login extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			password: '',
			username: ''
		};
	}

	handleChange = (event) => {
		var {currentTarget: {id, value}} = event;

		this.setState(
			{
				[id]: value
			}
		);
	}

	handleSubmit = (event) => {
		event.preventDefault();

		var {password, username} = this.state;

		password = password.trim();
		username = username.trim();

		if (!username || !password) {
			this.props.loginFailure(
				{
					errors: STR_MISSING_CREDENTIALS
				}
			);
		}
		else {
			this.props.login(username, password);
		}
	}

	render() {
		var props = this.props;

		let {loginErrors, loading, online} = props;
		let {password, username} = this.state;

		var {errors} = loginErrors;

		var loginErrorsEl;

		if (errors) {
			var title = errors === STR_MISSING_CREDENTIALS ? 'Oops! Missing a field.' : 'Github responded with:';

			if (loginErrors.response && loginErrors.response.errorText) {
				title = loginErrors.response.errorText;
			}

			loginErrorsEl = (
				<ErrorMsg displayReload={false} id="loginErrors" message={errors} statusText={title} />
			);
		}

		var cssClass = 'app-container login';

		cssClass += props.loading ? ' loading' : ' loaded';
		cssClass += !props.online ? ' status-offline' : '';

		return <div className={cssClass}>
			<form action="" id="fm" onSubmit={this.handleSubmit}>
				<h1 id="pullsTitle">{'Github Pulls'}</h1>

				{loginErrorsEl}

				<FormGroup className={username ? 'has-value' : null} controlId="username">
					<ControlLabel>Github username</ControlLabel>
					<FormControl onChange={this.handleChange} placeholder="Github username" ref="username" type="text" value={username} />
				</FormGroup>

				<FormGroup className={password ? 'has-value' : null} controlId="password">
					<ControlLabel>Github password</ControlLabel>
					<FormControl onChange={this.handleChange} placeholder="Github password" ref="password" type="password" value={password} />
				</FormGroup>

				<Button bsStyle="primary" type="submit">{'Login'}</Button>
			</form>

			<div className="loading-bar"></div>
		</div>;
	}
}

Login.defaultProps = {
	message: '',
	statusText: ''
};

Login.propTypes = {
	login: PropTypes.func.isRequired
};