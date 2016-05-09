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

		if (!nextProps.loading && nextProps.online && !this._isConfigPath(nextProps)) {
			this._loadPullsTask();
		}
	}

	componentWillUnmount() {
		clearTimeout(this.timeout);
	}

	componentWillMount() {
		var {loadPulls} = this.props;

		loadPulls();
	}

	_isConfigPath(props) {
		props = props || this.props;

		return props.router.location.pathname === '/config';
	}

	_loadPullsTask() {
		this.timeout = setTimeout(() => this.props.loadPulls(), REFRESH_TIME);
	}

	render() {
		var props = this.props;

		var configModal = null;
		var loader = null;

		var hasRepos = !!Object.keys(props.repos).length;

		if (this._isConfigPath()) {
			configModal = <Config {...props} />;
		}

		var cssClass = 'app-container app-column container-fluid-1280';

		cssClass += (!props.online ? ' status-offline' : '');
		cssClass += ` display-${props.config.view || ''}`;

		if (props.loading) {
			cssClass += ' loading';

			if (!props.requestMade) {
				loader = <div className="loader"></div>;
			}
		}

		if (!props.loading || hasRepos) {
			cssClass += ' loaded';
		}

		var listContent = null;
		var errMsg = null;

		if (hasRepos) {
			listContent = <RepoList {...props} repos={props.repos} issues={props.issues} />;
		}
		else if (props.requestMade) {
			listContent = <div className="no-repos">
				<h1>{'You don\'t have any pull requests yet.'}</h1>
			</div>;
		}

		if (props.pageError) {
			errMsg = <ErrorMsg {...props.pageError} loadPulls={props.loadPulls} />;
		}

		return <div className={cssClass}>
			<AccountBar {...props} />
			{errMsg}
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