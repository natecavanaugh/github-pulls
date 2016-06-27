import React, {Component, PropTypes} from 'react';
import {Alert, Button, ControlLabel, FormGroup, FormControl} from 'react-bootstrap';
import ErrorMsg from './ErrorMsg';
import ExternalLink from './ExternalLink';
import Icon from './Icon';
import PureRender from '../containers/PureRender';

const STR_MISSING_CREDENTIALS = 'Please enter both your username and password';

@PureRender
export default class Login extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			password: '',
			username: '',
			otp: '',
			oauthToken: '',
			displayTokenField: false
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

	handleDisplayTokenClick = (event) => {
		var {currentTarget: {id, value}} = event;

		this.setState(
			{
				displayTokenField: true
			}
		);
	}

	handleSubmit = (event) => {
		event.preventDefault();

		var {password, username, otp, oauthToken} = this.state;

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
			this.props.login(username, password, otp, oauthToken);
		}
	}

	render() {
		var props = this.props;

		let {loginErrors, loading, online} = props;
		let {password, username, otp, oauthToken, displayTokenField} = this.state;

		var {errors} = loginErrors;

		var loginErrorsEl;

		var needsTwoFactor = errors && errors.includes('OTP');

		if (errors && !needsTwoFactor) {
			var title = errors === STR_MISSING_CREDENTIALS ? 'Oops! Missing a field.' : 'GitHub responded with:';

			if (loginErrors.response && loginErrors.response.errorText) {
				title = loginErrors.response.errorText;
			}

			loginErrorsEl = (
				<ErrorMsg displayReload={false} id="loginErrors" message={errors} statusText={title} />
			);
		}

		var fields;

		if (!needsTwoFactor) {
			fields = (
				<div className="fields">
					<FormGroup className={username ? 'has-value' : null} controlId="username">
						<ControlLabel>GitHub username</ControlLabel>
						<FormControl onChange={this.handleChange} placeholder="GitHub username" ref="username" type="text" value={username} />
					</FormGroup>

					<FormGroup className={password ? 'has-value' : null} controlId="password">
						<ControlLabel>GitHub password</ControlLabel>
						<FormControl onChange={this.handleChange} placeholder="GitHub password" ref="password" type="password" value={password} />
					</FormGroup>
				</div>
			);
		}
		else {
			// var type = err
			var type = loginErrors.err.headers['x-github-otp'] || '';

			var [required, type] = type.split(';');

			var appAuth = null;
			var authTypeMsg = '';

			if (type) {
				type = type.trim();

				if (type === 'app') {
					authTypeMsg = 'It appears that you use an app to generate your one time password code. Go to your authenticator app and type in the number that it gives you.';
				}
				else {
					authTypeMsg = `It appears that you use SMS to receive your one time password code. GitHub should have texted you a number to type in. If you never receive one, try switching to an app based authentication.`;
				}
			}

			fields = (
				<div className="fields">
					<Alert bsStyle="info">
						<strong className="lead">{'Hi there, it looks like you have two-factor authentication on (you security buff, you).'}
						</strong>
						{authTypeMsg}
					</Alert>
					<FormGroup className={otp ? 'has-value' : null} controlId="otp">
						<ControlLabel>{'Your two factor code'}</ControlLabel>
						<FormControl onChange={this.handleChange} placeholder="Your two factor code" ref="otp" type="text" value={otp} />
					</FormGroup>

					{/*Need to revisit why it's not allowing authentication when manually
						pasting the auth token*/}
					{false && <div className="oauth-token">
						<p>{'or'}</p>

						<p>{`You can also go to your`} <ExternalLink href="https://github.com/settings/tokens" title="GitHub settings page" /> {`and create an authorization token. Once you've done that, click `}<a href="javascript:;" onClick={this.handleDisplayTokenClick}>{`here`}</a>{` to display the token field, and we'll use that to login.`}</p>
						{displayTokenField && <FormGroup className={oauthToken ? 'has-value' : null} controlId="oauthToken">
							<ControlLabel>{'Your personal access token'}</ControlLabel>
							<FormControl onChange={this.handleChange} placeholder="Your personal access token" ref="oauthToken" type="text" value={oauthToken} />
						</FormGroup>}
					</div>}
				</div>
			);
		}

		var cssClass = 'app-container login';

		cssClass += props.loading ? ' loading' : ' loaded';
		cssClass += !props.online ? ' status-offline' : '';

		return <div className={cssClass}>
			<form action="" id="fm" onSubmit={this.handleSubmit}>
				<h1 id="pullsTitle">{'GitHub Pulls'}</h1>

				{loginErrorsEl}

				{fields}

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