import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import routes from '../routes';
import {reduxReactRouter} from 'redux-router';
import {createHashHistory as createHistory} from 'history';
import login from '../middleware/login';
import pulls from '../middleware/pulls';

const enhancer = compose(
	applyMiddleware(thunk, login, pulls),
	reduxReactRouter({createHistory, routes})
);

export default function configureStore(initialState) {
	return createStore(rootReducer, initialState, enhancer);
}