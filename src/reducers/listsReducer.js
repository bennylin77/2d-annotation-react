import {
  REQUEST_2D_VIDEO,
  RECEIVE_2D_VIDEO,
} from '../actions/twoDimensionalActions.js'
import { video } from './twoDimensionalReducer.js';
const REMOVE = 'REMOVE'


const lists = (state = { twoDimensionalVideoList: {}, twoDimensionalImageList: {} }, action) => {
  switch (action.type) {
    case REQUEST_2D_VIDEO:
    case RECEIVE_2D_VIDEO:
      return Object.assign({}, state, {
        [action.list]:  Object.assign({},
                          state[action.list],
                          { [action.id]: video( state[action.list][action.id], action) })
      })
    default:
      return state
  }
}
export default lists;
