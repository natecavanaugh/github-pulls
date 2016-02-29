import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import routes from '../routes';
import { reduxReactRouter } from 'redux-router';
import { createHashHistory as createHistory } from 'history';
import api from '../middleware/api';
import login from '../middleware/login';
import pulls from '../middleware/pulls';

const enhancer = compose(
  applyMiddleware(thunk, login, pulls, api),
  reduxReactRouter({ routes, createHistory })
);

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}