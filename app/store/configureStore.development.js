import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import routes from '../routes'
import { reduxReactRouter } from 'redux-router'
import { createHashHistory as createHistory } from 'history';
import api from '../middleware/api';
import login from '../middleware/login';
import pulls from '../middleware/pulls';

const enhancer = compose(
  applyMiddleware(thunk, login, pulls, api),
  reduxReactRouter({ routes, createHistory }),
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
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers'))
    );
  }

  return store;
}