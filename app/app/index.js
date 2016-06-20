import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import routes from './routes';
import configureStore from './store/configureStore';
import {loginSuccess, loginComplete} from './actions/login';
import {loadConfig} from './actions/config';
import {updateCheck} from './actions/update';
import settings from './utils/settings';

import { Router, hashHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';

const electron = require('electron');

const currentVersion = electron.ipcRenderer.sendSync('currentVersion');

import './scss/main.scss';

const store = configureStore(
	{
		currentVersion
	}
);

let {username, token, avatar, lastUpdateCheck} = settings.load();

const history = syncHistoryWithStore(hashHistory, store);

if (username && token) {
	store.dispatch(loginSuccess(username, token));
	store.dispatch(loginComplete(avatar));
	store.dispatch(loadConfig(username));
	store.dispatch(updateCheck(lastUpdateCheck));
}

var windowConfig = {
	height: window.screen.availHeight,
	width: 800
};

if (process.env.NODE_ENV === 'development') {
	windowConfig.width = Math.min(1400, window.screen.availWidth);
}

window.resizeTo(windowConfig.width, windowConfig.height);

render(
	<Provider store={store}>
		<Router history={history} routes={routes} />
	</Provider>,
	document.getElementById('root')
);