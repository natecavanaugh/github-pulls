import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import routes from './routes';
import {ReduxRouter} from 'redux-router';
import configureStore from './store/configureStore';
import {loginSuccess, loginComplete} from './actions/login';
import {loadConfig} from './actions/config';
import settings from './utils/settings';

import './scss/main.scss';

const store = configureStore();

let {username, token, avatar} = settings.load();

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