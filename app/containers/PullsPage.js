import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import AccountBar from '../components/AccountBar';
import Config from '../components/Config';
import RepoList from '../components/RepoList';
import ErrorMsg from '../components/ErrorMsg';
import * as pulls from '../actions/pulls';
import * as config from '../actions/config';
import {logoutAndRedirect} from '../actions/login';

const REFRESH_TIME = 30 * 1000;

class PullsPage extends Component {
	componentWillReceiveProps(nextProps) {
		clearTimeout(this.timeout);

		if (!nextProps.loading && nextProps.online) {
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
		var {loadPulls} = this.props;

		loadPulls();
	}

	render() {
		var props = this.props;

		var configModal = null;
		var loader = null;

		if (props.loading && !Object.keys(props.repos).length) {
			loader = <div className="loader"></div>;
		}

		if (props.router.location.pathname === '/config') {
			configModal = <Config {...props} />;
		}

		var cssClass = 'app-container app-column container-fluid-1280 display-compactz';

		cssClass += (props.loading ? ' loading' : ' loaded');
		cssClass += (!props.online ? ' status-offline' : '');

		var listContent = null;

		if (!props.pageError) {
			listContent = <RepoList {...props} repos={props.repos} issues={props.issues} />;
		}
		else {
			listContent = <ErrorMsg {...props.pageError} loadPulls={props.loadPulls} />;
		}

		return <div className={cssClass}>
			<AccountBar {...props} />
			{listContent}
			{configModal}
			{loader}
		</div>;
	}
}

PullsPage.defaultProps = {
	avatar: '',
	issues: {},
	loading: true,
	repos: {},
	total: 0
};

function mapStateToProps(state) {
	var {entities, settings} = state;
	var {repos, issues} = entities;
	var {username, avatar_url: avatar} = settings;

	var total = Object.keys(issues || {}).length;

	return {avatar, issues, repos, total, username, ...state};
}

let mapDispatchToProps = bindActionCreators.bind(null, {logoutAndRedirect, ...pulls, ...config});

export default connect(mapStateToProps, mapDispatchToProps)(PullsPage);