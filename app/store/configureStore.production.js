import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import { reduxReactRouter } from 'redux-router'

const enhancer = compose(
  applyMiddleware(thunk, login, pulls, api),
  reduxReactRouter({ routes, createHistory })
  )
);

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer);
}
