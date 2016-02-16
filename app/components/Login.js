import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class Login extends Component {

	static defaultProps = {
		message: '',
		statusText: ''
	};

	state = {
		username: '',
		password: ''
	};

	constructor(props, context) {
		super(props, context);
	}

	handleSubmit(event) {
		event.preventDefault();

		var username = this.refs.username.value;
		var password = this.refs.password.value;

		if (!username || !password) {
			this.props.loginFailure({
				errors: 'Please enter both your username and password'
			});

			return;
		}

		this.props.login(username, password);
	}

	render() {
		var props = this.props;

		let {loginErrors, loading} = props;

		var {errors} = loginErrors;

		var loginErrorsEl;

		if (errors) {
			loginErrorsEl = <div className="alert alert-danger" id="loginErrors">{errors}</div>;
		}

		return <div className={'container login ' + (loading ? 'loading' : '')}>
			<form action="" id="fm" onSubmit={this.handleSubmit.bind(this)}>
				<h1 id="pullsTitle">Github Pulls <span className="status-icon glyphicon glyphicon-exclamation-sign"></span></h1>

				{loginErrorsEl}

				<input autofocus className="form-control" id="username" placeholder="Github username" ref="username" type="text" /><br />
				<input className="form-control" id="password" placeholder="Github password" ref="password" type="password" /><br />

				<input className="btn btn-primary" type="submit" value="Login" />
			</form>

			<div className="loading-bar"></div>
		</div>;
	}
}

Login.propTypes = {
	login: PropTypes.func.isRequired
};