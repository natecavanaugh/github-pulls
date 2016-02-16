import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Login from '../components/Login';
import * as Actions from '../actions/login';

function mapStateToProps(state) {
	return Object.assign({}, state);
}

let mapDispatchToProps = bindActionCreators.bind(null, Actions);

export default connect(mapStateToProps, mapDispatchToProps)(Login);