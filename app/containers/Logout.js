import React, {Component} from 'react';

import settings from '../utils/settings';

class LogoutPageContainer extends Component {
	componentDidMount() {
		settings.destroy();
	}

	render() {
		var {router} = this.context;

		router.transitionTo('/login');

		return <div></div>;
	}
}

LogoutPageContainer.contextTypes = {
	router: React.PropTypes.func.isRequired
};

export default LogoutPageContainer;