import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from './containers/App';
import PullsPage from './containers/PullsPage';
import LoginPage from './containers/LoginPage';

import settings from './utils/settings';
import github from './utils/github';

function checkAuth(nextState, replace) {
	var token = settings.val('token');

	if (token) {
		github.authenticate(
			{
				token: token,
				type: 'token',
				username: settings.val('username')
			}
		);
	}
	else {
		replace('/login');
	}
}

export default (
  <Route path="/" component={App}>
    <IndexRoute component={PullsPage} />
    <Route path="config" component={PullsPage} onEnter={checkAuth} />
    <Route path="login" component={LoginPage} />
    <Route path="*" component={PullsPage} onEnter={checkAuth} />
  </Route>
);