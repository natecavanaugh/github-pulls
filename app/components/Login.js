import React, {Component, PropTypes} from 'react';
import Icon from './Icon';

export default class Login extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			password: '',
			username: ''
		};
	}

	handleSubmit(event) {
		event.preventDefault();

		var password = this.refs.password.value;
		var username = this.refs.username.value;

		if (!username || !password) {
			this.props.loginFailure(
				{
					errors: 'Please enter both your username and password'
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

		var {errors} = loginErrors;

		var loginErrorsEl;

		if (errors) {
			loginErrorsEl = <div className="alert alert-danger" id="loginErrors">{errors}</div>;
		}

		var cssClass = 'app-container login';

		cssClass += props.loading ? ' loading' : ' loaded';
		cssClass += !props.online ? ' status-offline' : '';

		return <div className={cssClass}>
			<form action="" id="fm" onSubmit={this.handleSubmit.bind(this)}>
				<h1 id="pullsTitle">Github Pulls <Icon className="status-icon" name="exclamation-circle" /></h1>

				{loginErrorsEl}

				<input autofocus className="form-control" id="username" placeholder="Github username" ref="username" type="text" /><br />
				<input className="form-control" id="password" placeholder="Github password" ref="password" type="password" /><br />

				<input className="btn btn-primary" type="submit" value="Login" />
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