import {createStore, applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {routerMiddleware} from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import rootReducer from './reducers/rootReducer.js';

// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory()
// Build the middleware for intercepting and dispatching navigation actions
const routerHistoryMiddleware = routerMiddleware(history)

// create an object for the default data
const defaultState = {
};

export const store = createStore(rootReducer, defaultState, applyMiddleware(thunkMiddleware, routerHistoryMiddleware));
