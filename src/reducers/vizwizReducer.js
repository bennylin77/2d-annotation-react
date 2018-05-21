import {
  REQUEST_VIZWIZ_LIST,
  RECEIVE_VIZWIZ_LIST
} from '../actions/vizwizActions.js'

export function vizwizList( state = {isFetching: false, list: []}, action) {
  switch (action.type) {
    case REQUEST_VIZWIZ_LIST:
      return { ...state,
               isFetching: true}
    case RECEIVE_VIZWIZ_LIST:
      return { ...state,
               isFetching: false,
               list: action.list,
               lastUpdated: action.receivedAt
             }
    default:
      return state
  }
}




/*
export function selectedArticleTag(state = 'all', action) {
  switch (action.type) {
    case SELECT_ARTICLE_LIST:
      return action.tag
    default:
      return state
  }
}

export function article( state = {isFetching: false}, action) {
  switch (action.type) {
    case REQUEST_ARTICLE:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_ARTICLE:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt
      }, Object.assign({}, action.result))
    default:
      return state
  }
}

function article_list( state = {isFetching: false, items: []}, action) {
  switch (action.type) {
    case REQUEST_ARTICLE_LIST:
      return { ...state,
               isFetching: true}
    case RECEIVE_ARTICLE_LIST:
      return { ...state,
               isFetching: false,
               items: action.articles,
               lastUpdated: action.receivedAt
             }
    default:
      return state
  }
}

export function articlesByArticle(state = {}, action) {
  switch (action.type) {
    case REQUEST_ARTICLE_LIST:
    case RECEIVE_ARTICLE_LIST:
      return {...state, [action.tag]: article_list(state[action.tag], action)}
    default:
      return state
  }
}
*/
