import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import routes from './routes';
import { ReduxRouter } from 'redux-router'
import configureStore from './store/configureStore';
import { loginSuccess, loginComplete } from './actions/login';
import { loadConfig } from './actions/config';
import settings from './utils/settings';
import './app.css';
import './scss/main.scss';

const store = configureStore();

let { username, token, avatar } = settings.load();

if (username && token) {
	store.dispatch(loginSuccess(username, token));
	store.dispatch(loginComplete(avatar));
	store.dispatch(loadConfig(username));
}

render(
	<Provider store={store}>
		<ReduxRouter routes={routes} />
	</Provider>,
	document.getElementById('root')
);

if (process.env.NODE_ENV !== 'production') {
	// Use require because imports can't be conditional.
	// In production, you should ensure process.env.NODE_ENV
	// is envified so that Uglify can eliminate this
	// module and its dependencies as dead code.
	// require('./createDevToolsWindow')(store);
}