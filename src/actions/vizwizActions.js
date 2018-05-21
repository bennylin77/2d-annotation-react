export const REQUEST_VIZWIZ_LIST = 'REQUEST_VIZWIZ_LIST'
export const RECEIVE_VIZWIZ_LIST = 'RECEIVE_VIZWIZ_LIST'

/*
export function fetchVizwizList(){
	return (dispatch, getState) => {
    dispatch( requestVizwizList() )
		const readFile = new Promise((resolve, reject)=>{
			console.log(fs)
			fs.readFile('./data/vizwiz_train.json', (err, data) => {
			    if (err) throw err;
			    let vizwiz = JSON.parse(data);
					resolve(vizwiz)
			});
		})
		return readFile.then( data => dispatch(receiveVizwizList(data)) )
	}
}
*/


export function fetchVizwizList(){
  return (dispatch, getState) => {
    dispatch( requestVizwizList() )
		var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
		    targetUrl = 'http://chi-lin.com:8082/datasets/vizwiz/vizwiz_train'
    return fetch(proxyUrl + targetUrl)
			.then(response => response.json())
      .then(result => {
				dispatch(receiveVizwizList(result))
			})
  }
}
function receiveVizwizList(data){
	return {
    type: RECEIVE_VIZWIZ_LIST,
		list: data,
		receivedAt: Date.now()
  }
}
function requestVizwizList() {
  return {
    type: REQUEST_VIZWIZ_LIST
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
