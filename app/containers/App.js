import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as pageActions from '../actions/page';

class App extends Component {
	componentWillUnmount() {
		window.removeEventListener('online', this.handleOffline);
		window.removeEventListener('offline', this.handleOffline);
	}

	componentWillMount() {
		window.addEventListener('online', this.handleOffline);
		window.addEventListener('offline', this.handleOffline);

		this.handleOffline();
	}

	handleOffline = (e) => {
		this.props.pageOnline(navigator.onLine);
	}

	render() {
		return (
			<div>
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

let mapDispatchToProps = bindActionCreators.bind(null, pageActions);

export default connect(mapStateToProps, mapDispatchToProps)(App);