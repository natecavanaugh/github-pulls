import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as pageActions from '../actions/page';
import * as updateActions from '../actions/update';
import {setLastUpdateCheck} from '../actions/config';
import UpdateMsg from '../components/UpdateMsg';

const MS_DAY = (24 * 60 * 60 * 1000);

class App extends Component {
	checkForUpdate = () => {
		var {lastUpdateCheck} = this.props;

		if (!lastUpdateCheck || Date.now() - lastUpdateCheck >= MS_DAY) {
			var time = Date.now();

			this.props.checkForUpdates(time);
			this.props.setLastUpdateCheck(time);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.updateLater) {
			clearTimeout(this.timeout);
		}
	}

	componentDidMount() {
		this.checkForUpdate();
	}

	componentWillUnmount() {
		window.removeEventListener('online', this.handleOffline);
		window.removeEventListener('offline', this.handleOffline);

		clearInterval(this.timeout);
	}

	componentWillMount() {
		window.addEventListener('online', this.handleOffline);
		window.addEventListener('offline', this.handleOffline);

		this.handleOffline();

		this.timeout = setInterval(
			this.checkForUpdate,
			MS_DAY
		);
	}

	handleOffline = (e) => {
		this.props.pageOnline(navigator.onLine);
	}

	render() {
		var {
			currentVersion,
			downloadNewVersion,
			remindMeLater,
			updateAvailable,
			updateLater,
		} = this.props;

		var updateMsg = null;

		var className = '';

		if (updateAvailable && !updateLater) {
			updateMsg = <UpdateMsg currentVersion={currentVersion} downloadNewVersion={downloadNewVersion} newVersion={updateAvailable.name} remindMeLater={remindMeLater} {...this.props} />;

			className = 'has-update';
		}

		return (
			<div className={className}>
				{updateMsg}
				{this.props.children}
				{
					(() => {
						let retVal;

						if (process.env.NODE_ENV !== 'production') {
							const DevTools = require('./DevTools');

							retVal = <DevTools />;
						}

						return retVal;
					})()
				}
			</div>
		);
	}
}

App.propTypes = {
	children: PropTypes.element.isRequired
};

function mapStateToProps(state) {
	return Object.assign({}, state);
}

let mapDispatchToProps = bindActionCreators.bind(null, {...pageActions, ...updateActions, setLastUpdateCheck});

export default connect(mapStateToProps, mapDispatchToProps)(App);