import {
  EDIT_2D_VIDEO
} from '../actions/twoDimensionalActions.js'
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import lists from './listsReducer.js';



function editing(state = {}, action) {
  switch (action.type) {
    case EDIT_2D_VIDEO:
      return Object.assign({}, state, {
        [action.collection]: action.parameters
      })
    default:
      return state
  }
}

const rootReducer = combineReducers({ lists, editing, router: routerReducer });
export default rootReducer;
