import {createStore, applyMiddleware, compose} from 'redux';
import {persistState} from 'redux-devtools';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import routes from '../routes';

import login from '../middleware/login';
import pulls from '../middleware/pulls';
import {browserHistory} from 'react-router';
import {routerMiddleware} from 'react-router-redux';

const enhancer = compose(
	applyMiddleware(thunk, routerMiddleware(browserHistory), login, pulls),
	DevTools.instrument(),
	persistState(
		window.location.href.match(
			/[?&]debug_session=([^&]+)\b/
		)
	)
);

export default function configureStore(initialState) {
	const store = createStore(rootReducer, initialState, enhancer);

	if (module.hot) {
		module.hot.accept(
			'../reducers',
			() => store.replaceReducer(require('../reducers'))
		);
	}

	return store;
}