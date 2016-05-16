import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import Config from '../components/Config';
import * as ConfigActions from '../actions/config';

import React, {Component} from 'react';

export class ConfigPage extends Component {
	render() {

		return (
			<div>
				<Config {...this.props} />
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {...state};
}

let mapDispatchToProps = bindActionCreators.bind(null, ConfigActions);

export default connect(mapStateToProps, mapDispatchToProps)(ConfigPage);