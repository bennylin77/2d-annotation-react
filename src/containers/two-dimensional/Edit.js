import React, { Component } from 'react';
import Player from '../../components/two-dimensional/player/Player';
import Slider from '../../components/two-dimensional/player/Slider';
import Duration from '../../components/two-dimensional/player/Duration';
import Canvas from '../../components/two-dimensional/canvas/Canvas';
import List from '../../components/two-dimensional/list/List';
import { fetch2DVideo, editAndFetch2DVideoIfNeeded } from '../../actions/twoDimensionalActions.js';
import { connect } from 'react-redux';
import { Container, Row, Col, Button} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

class Edit extends Component {
  constructor(props) {
     super(props);
		 this.state = { played: 0, playing: false, duration: 0, loop: false, seeking: false, adding: false, objects: []};
   }
  componentDidMount() {
    const { dispatch } = this.props;
		const { id } = this.props.match.params;
    dispatch(fetch2DVideo(id))
			.then(dispatch(editAndFetch2DVideoIfNeeded(id)))
  }
  isNotFetched = () => {
    const { twoDimensionalVideoList } = this.props
		const { id } = this.props.match.params
    return (!twoDimensionalVideoList[id] || twoDimensionalVideoList[id].isFetching) ? true : false;
  }

	/* ==================== video player ==================== */
	playerRef = player => {
		this.player = player
	}
	handleVideoPlayPause = () => {
		this.setState({ playing: !this.state.playing })
	}
	handleVideoProgress = state => {
		if (!this.state.seeking) {
			const played = state.played
			this.setState((prevState, props) => {
				//return { played: played, objects: setGroupXY(played, prevState.objects)}
				return { played: played }
			})
		}
  }
	handleVideoDuration = duration => {
    this.setState({ duration })
  }
	handleVideoEnded = () => {
    this.setState({ playing: this.state.loop })
  }
	/* ==================== video player slider ==================== */
	handleSliderMouseUp = e => {
		this.setState({ seeking: false })
		this.player.seekTo(parseFloat(e.target.value))
	}
	handleSliderMouseDown = e => {
		this.setState({ seeking: true })
	}
	handleSliderChange = e => {
			const played = parseFloat(e.target.value);
			this.setState((prevState, props) => {
				//return { played: played, objects: setGroupXY(played, prevState.objects)}
				return { played: played }
			})
	}
	/* ==================== canvas ==================== */
	handleAddObject = () =>{
		this.setState((prevState, props) => {
			return {adding: !prevState.adding, playing: false};
		});
	}
	handleCanvasStageMouseMove = e =>{}
	//add new object
	handleCanvasStageMouseDown = e =>{
		if(!this.state.adding)
			return;
		const stage = e.target.getStage()
		const position = stage.getPointerPosition()
		const name = (new Date()).getTime();
		const stroke = colors[getRandomInt(3)]
		const trajectories = []
		this.setState((prevState, props) => {
			trajectories.push({x: position.x, y: position.y, height: 1, width: 1, time: prevState.played})
			return { adding: !prevState.adding, objects: [...prevState.objects, {name: `${name}`, stroke: stroke, trajectories: trajectories, dragging: false}]};
		}, () => {
			const group = stage.find(`.${name}`)[0]
			const bottomRight = group.get('.bottomRight')[0]
			bottomRight.startDrag()
		});
	}
	handleCanvasStageMouseUp = e => {
	}
	handleCanvasGroupMouseDown = e =>{
		//when user drag a object, pause the video
		this.setState({playing: false});
	}
	handleCanvasGroupDragStart = e =>{
		const target = e.target
		this.setState((prevState, props) => {
			return { objects: prevState.objects.map( obj =>{
					if(obj.name !== target.name())
						return obj;
					return { ...obj, dragging: true };
				})
			}
		})
	}
	handleCanvasGroupDragEnd = e =>{
		const target = e.target
		const position = e.target.position()
		const x = position.x, y = position.y
		this.setState((prevState, props) => {
			const played = prevState.played
			return { playing: false, objects: prevState.objects.map( obj =>{
					if(obj.name !== target.name())
						return obj;

					let trajectories = obj.trajectories
					for( let i = 0; i < trajectories.length; i++){
						if(played >= trajectories[i].time){
							//skip elapsed trajectories
							if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
								continue;

							if(played===trajectories[i].time){
								trajectories[i].x = x; trajectories[i].y = y;
								trajectories[i].width = trajectories[i].width; trajectories[i].height = trajectories[i].height;
								break;
							}
							if(i===trajectories.length-1){
								trajectories = [ ...obj.trajectories, {x: x, y: y, height: trajectories[i].height, width: trajectories[i].width, time: played}];
								break;
							}
							let startTraj = trajectories[i], endTraj = trajectories[i+1]
							let lapseTime = endTraj.time - startTraj.time;
							let curTime = played - startTraj.time;
							let widthSlope = (endTraj.width - startTraj.width)/lapseTime, heightSlope = (endTraj.height - startTraj.height)/lapseTime;
							let width = widthSlope * curTime + startTraj.width
							let height = heightSlope * curTime + startTraj.height
							trajectories = [ ...obj.trajectories, {x: x, y: y, height: height, width: width, time: played}];
							break;
						}
					}

					//the trajectories sorded by the time
					trajectories.sort(function(a, b) {
					  const timeA = a.time, timeB = b.time;
					  if (timeA < timeB) return -1;
					  if (timeA > timeB) return 1;
					  return 0;
					});
					return { ...obj, dragging: false, trajectories: trajectories};
				})
			}
		})
	}
	handleCanvasGroupRef = r =>{
		/*
		this.setState((prevState, props) => {
			return {  objects: prevState.objects.map( obj =>{
					if(obj.name !== r.name())
						return obj;
					return { ...obj, Group: r };
				})
			}
		})*/
	}

	handleCanvasCircleDragEnd = e =>{

		const activeAnchor = e.target
		const group = activeAnchor.getParent();
		group.draggable(true)

		let topLeft = group.get('.topLeft')[0];
		let topRight = group.get('.topRight')[0];
		let bottomRight = group.get('.bottomRight')[0];
		let bottomLeft = group.get('.bottomLeft')[0];
		let width = Math.abs(topRight.x() - topLeft.x());
		let height =  Math.abs(bottomLeft.y() - topLeft.y());

		if(width && height) {
			this.setState((prevState, props) => {
				const played = prevState.played
				return { objects: prevState.objects.map( obj =>{
						if(obj.name !== group.name())
							return obj;
						let trajectories = obj.trajectories

						//console.log(`trajectories size: ${trajectories.length}`)

						for( let i = 0; i < trajectories.length; i++){

							//console.log(i)

							if(played >= trajectories[i].time){
								//skip elapsed trajectories
								if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
									continue;

								let originalX = trajectories[i].x;
								let originalY = trajectories[i].y;
								let newX, newY;
								if(topLeft.x()<topRight.x() && topLeft.y()<bottomLeft.y()){
									newX = originalX + topLeft.x()
									newY = originalY + topLeft.y()
									console.log('topLeft')
								}else if(topRight.x()<topLeft.x() && topRight.y()<bottomLeft.y()){
									newX = originalX + topRight.x()
									newY = originalY + topRight.y()
									console.log('topRight')
								}else if(bottomLeft.x()<topRight.x() && bottomLeft.y()<topLeft.y()){
									newX = originalX + bottomLeft.x()
									newY = originalY + bottomLeft.y()
									console.log('bottomLeft')
								}else if(bottomRight.x()<bottomLeft.x() && bottomRight.y()<topRight.y()){
									newX = originalX + bottomRight.x()
									newY = originalY + bottomRight.y()
									console.log('bottomRight')
								}

								if(played===trajectories[i].time){
									trajectories[i].x=newX;
									trajectories[i].y=newY;
									trajectories[i].width=width;
									trajectories[i].height=height;
									break;
								}

								if(i===trajectories.length-1){
									trajectories = [ ...obj.trajectories, {x: newX, y: newY, height: height, width: width, time: played}];
									break;
								}

								let startTraj = trajectories[i], endTraj = trajectories[i+1]
								let lapseTime = endTraj.time - startTraj.time;
								let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
								// set x and y position
								let curTime = played - startTraj.time;
								newX = xSlope * curTime + newX;
								newY = ySlope * curTime + newY;
								trajectories = [ ...obj.trajectories, {x: newX, y: newY, height: height, width: width, time: played}];
								break;
							}
						}

						//the trajectories sorded by the time
						trajectories.sort(function(a, b) {
							const timeA = a.time, timeB = b.time;
							if (timeA < timeB) return -1;
							if (timeA > timeB) return 1;
							return 0;
						});

						return { ...obj, trajectories: trajectories};
					})
				}
			})
		}
	}
	handleCanvasCircleDragMove = e =>{
	}

	/* ==================== list ==================== */

	handleListObjectDelete = name =>{
		this.setState((prevState) => {
				const objects = prevState.objects.filter( object => {

					if(object.name !== name)
						return true;


					return false
					});
				console.log("-----------")
				console.log(objects)
				return { objects: objects };
		});
	}


  render() {
		const {	playing, played, duration, adding, objects} = this.state;
    const { editing, twoDimensionalVideoList } = this.props
		const { id } = this.props.match.params
		const video = twoDimensionalVideoList[id]
    if (this.isNotFetched()) {
      return <h4><i>Loading</i></h4>
    }
    return (
			<Container>
					<Row className="p-3">
						<Col>
							<div style={{position: 'relative', left: '50%', marginLeft: -video.width/2}}>
								<Player playerRef={this.playerRef}
												onVideoProgress={this.handleVideoProgress}
												onVideoDuration={this.handleVideoDuration}
												onVideoEnded={this.handleVideoEnded }
												url={video.url}
												width={video.width}
												height={video.height}
												playing={playing}
												/>
								<Canvas width = {video.width}
												height = {video.height}
												objects= {objects}
												played = {played}
												onCanvasStageMouseMove={this.handleCanvasStageMouseMove}
												onCanvasStageMouseDown={this.handleCanvasStageMouseDown}
												onCanvasStageMouseUp={this.handleCanvasStageMouseUp}
												onCanvasGroupRef={this.handleCanvasGroupRef}
												onCanvasGroupMouseDown={this.handleCanvasGroupMouseDown}
												onCanvasGroupDragStart={this.handleCanvasGroupDragStart}
												onCanvasGroupDragEnd={this.handleCanvasGroupDragEnd}
												onCanvasCircleDragMove={this.handleCanvasCircleDragMove}
												onCanvasCircleDragEnd={this.handleCanvasCircleDragEnd}
												/>
							</div>
						</Col>
					</Row>
					<Row className="py-1">
						<Col>
							<Button outline color="danger" onClick={this.handleVideoPlayPause}>{playing ? 'Pause video' : 'Play video'}</Button>
							<Button outline color="primary" onClick={this.handleAddObject}>{adding ? 'Adding object' : 'Add object'}</Button>
							<div className="text-right text-muted"><Duration seconds={played*duration}/> / <Duration seconds={duration}/></div>
						</Col>
					</Row>
					<Row className="py-1">
						<Col>
							<Slider played={played}
											onSliderMouseUp={this.handleSliderMouseUp}
											onSliderMouseDown={this.handleSliderMouseDown}
											onSliderChange={this.handleSliderChange}/>
						</Col>
					</Row>
					<Row className="py-1">
						<Col>
							<List objects= {objects}
										duration= {duration}
										onListObjectDelete= {this.handleListObjectDelete}
										/>
						</Col>
					</Row>
			</Container>
    );
  }
}

const colors = ["rgba(3, 169, 244, 0.7)", "rgba(244, 67, 54, 0.7)", "rgba(233, 30, 99, 0.7)"]
const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}

//connect
function mapStateToProps(state) {
  const { editing, lists: {twoDimensionalVideoList} }= state
  return {
		editing,
		twoDimensionalVideoList
  }
}
const App = connect(mapStateToProps)(Edit);
export default App;
