import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import routes from '../routes';

import login from '../middleware/login';
import pulls from '../middleware/pulls';
import {hashHistory} from 'react-router';
import {routerMiddleware} from 'react-router-redux';

const enhancer = compose(
	applyMiddleware(thunk, routerMiddleware(hashHistory), login, pulls)
);

export default function configureStore(initialState) {
	return createStore(rootReducer, initialState, enhancer);
}