import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AccountBar from '../components/AccountBar';
import Config from '../components/Config';
import RepoList from '../components/RepoList';
import * as pulls from '../actions/pulls';
import * as config from '../actions/config';
import {logoutAndRedirect} from '../actions/login';
import Promise from 'bluebird';

const MAX_ATTEMPTS = 5;
const REFRESH_TIME = 30 * 1000;

class PullsPage extends Component {
	static defaultProps = {
		repos: {},
		loading: true,
		issues: {},
		avatar: '',
		total: 0
	};

	componentWillReceiveProps(nextProps) {
		clearTimeout(this.timeout);

		if (!nextProps.loading) {
			this._loadPullsTask();
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	_loadPullsTask() {
		this.timeout = setTimeout(() => this.props.loadPulls(), REFRESH_TIME);
	}

	componentWillMount() {
		var { loadPulls, loadPullsTask } = this.props;

		var attempts = MAX_ATTEMPTS;

		loadPulls();
	}

	render() {
		var props = this.props;
		var state = this.state;

		var loader = null;
		var configModal = null;

		if (props.loading && !Object.keys(props.repos).length) {
			loader = <div className="loader"></div>;
		}

		if (props.router.location.pathname === '/config') {
			configModal = <Config {...props} />;
		}

		var cssClass = 'app-container app-column container-fluid-1280 display-compactz ' + (props.loading ? 'loading' : 'loaded');

		return <div className={cssClass}>
			<AccountBar {...props} />
			<RepoList repos={props.repos} issues={props.issues} />
			{configModal}
			{loader}
		</div>;
	}
}

function mapStateToProps(state) {
	var {entities, settings} = state;
	var {repos, issues, result} = entities;
	var {username, avatar_url: avatar} = settings;

	// console.log('PullsPage', settings.avatar_url);

	// console.log('PullsPage',Object.keys(issues || {}));

	var total = Object.keys(issues || {}).length;

	console.log(username);

  return { repos, issues, total, username, avatar, ...state};
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(CounterActions, dispatch);
// }

let mapDispatchToProps = bindActionCreators.bind(null, {logoutAndRedirect, ...pulls, ...config});

export default connect(mapStateToProps, mapDispatchToProps)(PullsPage);