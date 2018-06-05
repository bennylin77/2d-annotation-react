export const REQUEST_2D_VIDEO_LIST = 'REQUEST_2D_VIDEO_LIST'
export const RECEIVE_2D_VIDEO_LIST = 'RECEIVE_2D_VIDEO_LIST'
export const REQUEST_2D_VIDEO = 'REQUEST_2D_VIDEO'
export const RECEIVE_2D_VIDEO = 'RECEIVE_2D_VIDEO'
export const EDIT_2D_VIDEO = 'EDIT_2D_VIDEO'
export const UPDATE_2D_VIDEO = 'UPDATE_2D_VIDEO'

export function fetch2DVideo(id){
	return (dispatch, getState) => {
    dispatch(request2DVideo(id))
    return new Promise((resolve, reject) => {
			const dummnyResponse = {
				width: 640,
				height: 480,
				url: "https://cildata.crbs.ucsd.edu/media/videos/11952/11952_web.mp4"
			}
			resolve(dummnyResponse)
		}).then(response => dispatch(receive2DVideo(id, response)))
  }
}
export function editAndFetch2DVideoIfNeeded(id) {
  return (dispatch, getState) => {
    if (shouldFetch2DVideo(getState(), id))
      return dispatch(fetch2DVideo(id))
							.then(dispatch(edit2DVideo(id)))
    else
      return dispatch(edit2DVideo(id))
  }
}
const shouldFetch2DVideo = (state, id) => {
  const video = state.lists.twoDimensionalVideoList[id]
  if (!video)
    return true
  else if(video.isFetching)
    return false
  else
    return true
}
const request2DVideo = (id) => {
  return {
    type: REQUEST_2D_VIDEO,
		list: 'twoDimensionalVideoList',
		id
  }
}
const receive2DVideo = (id, data) => {
    return {
      type: RECEIVE_2D_VIDEO,
      receivedAt: Date.now(),
      list: 'twoDimensionalVideoList',
      data: Object.assign({}, data),
      id
    }
}
const edit2DVideo = (id) => {
  return {
    type: EDIT_2D_VIDEO,
    collection: 'twoDimensionalVideo',
		params: { id: id }
  }
}


/*
//====================Project====================//

function editProject(id){
  return {
    type: EDIT_PROJECT,
    collection: 'project',
    id
  }
}
function requestProject(id) {
  return {
    type: REQUEST_PROJECT,
    entity: 'projects',
    id
  }
}
function receiveProject(id, result) {
    return {
      type: RECEIVE_PROJECT,
      receivedAt: Date.now(),
      entity: 'projects',
      result: Object.assign({}, result),
      id
    }
}
function removeProject(id){
  return {
    type: 'REMOVE',
    entity: 'projects',
    id
  }
}
function shouldFetchProject(state, id) {
  const project = state.entities.projects[id]
  if (!project) {
    return true
  } else if(project.isFetching) {
    return false
  } else {
    return true
  }
}
export function fetchProjectIfNeeded(id) {
  return (dispatch, getState) => {
    if (shouldFetchProject(getState(), id)) {
      return dispatch(fetchProject(id))
    } else {
      return Promise.resolve()
    }
  }
}

export function editAndFetchProjectIfNeeded(id) {
  return (dispatch, getState) => {
    if (shouldFetchProject(getState(), id)) {
      return dispatch(fetchProject(id)).then( () => dispatch(editProject(id)) )
    } else {
      return Promise.resolve()
    }
  }
}

//-----------------------------------Project API-----------------------------------//
//fetch
function fetchProject(id){
  return (dispatch, getState) => {
    dispatch( requestProject(id) )
    return fetch(`${host}/api/projects/${id}`)
      .then(response => response.json())
      .then(result => dispatch(receiveProject(id, result)))
  }
}
//add
export function addProject(){
  return (dispatch, getState) => {
    return fetch(`${host}/api/projects/add`)
      .then(response => response.json())
      .then(result => { dispatch(receiveProject(result.id)); return result })
      .then(result => dispatch(editProject(result.id)))
  }
}
//update
//delete
export function deleteProject(id){
  return (dispatch, getState) => {
    return fetch(`${host}/api/projects/${id}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(result => dispatch(removeProject(result.item.id)) )
  }
}

//====================Project list====================//
function requestProjectList(tag) {
  return {
    type: REQUEST_PROJECT_LIST,
    tag
  }
}
function receiveProjectList(tag, result) {
    return {
      type: RECEIVE_PROJECT_LIST,
      tag,
      projects: result.map( project => project.id ),
      receivedAt: Date.now()
    }
}
export function fetchProjectList(tag){
  return (dispatch, getState) => {
    dispatch( requestProjectList(tag) )
    return fetch(`${host}/api/projects`)
      .then(response => response.json())
      .then(result => dispatch(receiveProjectList(tag, result)))
      .then( () => {
        getState().projectListInProject[tag].items.forEach(function(id) {
          if (shouldFetchProject(getState(), id))
            dispatch(fetchProject(id))
        });
      })
  }
}
*/
