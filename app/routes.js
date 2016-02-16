import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from './containers/App';
import PullsPage from './containers/PullsPage';
import LoginPage from './containers/LoginPage';
import ConfigPage from './containers/ConfigPage';

import settings from './utils/settings';
import github from './utils/github';

function checkAuth(nextState, replaceState) {
	var token = settings.val('token');

	if (token) {
		github.authenticate(
			{
				type: 'token',
				username: settings.val('username'),
				token: token
			}
		);
	}
	else {
		replaceState(null, '/login');
	}
}

export default (
  <Route path="/" component={App}>
    <IndexRoute component={PullsPage} onEnter={checkAuth} />
    <Route path="config" component={PullsPage} onEnter={checkAuth} />
    <Route path="login" component={LoginPage} />
  </Route>
);