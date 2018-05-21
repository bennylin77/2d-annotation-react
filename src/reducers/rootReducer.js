import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { vizwizList } from './vizwizReducer.js';


const rootReducer = combineReducers({ vizwizList, router: routerReducer });
export default rootReducer;
