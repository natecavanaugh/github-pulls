import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Config from '../components/Config';
import Modal from '../components/Modal';
import * as ConfigActions from '../actions/config';

import React from 'react';

export class ConfigPage extends React.Component {
	render() {

		return (
			<div>
				<Config {...this.props} />
			</div>
		);
	}
}

function mapStateToProps(state) {
	return { ...state };
}

let mapDispatchToProps = bindActionCreators.bind(null, ConfigActions);

export default connect(mapStateToProps, mapDispatchToProps)(ConfigPage);