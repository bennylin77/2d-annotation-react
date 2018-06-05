import React, { Component } from 'react';
import Player from '../../components/two-dimensional/player/Player';
import Slider from '../../components/two-dimensional/player/Slider';
import Duration from '../../components/two-dimensional/player/Duration';
import Canvas from '../../components/two-dimensional/canvas/Canvas';
import List from '../../components/two-dimensional/list/List';
import {colors, getRandomInt, interpolationArea, interpolationPosition} from '../../components/two-dimensional/helper.js';
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
			return { adding: !prevState.adding, objects: [...prevState.objects, {name: `${name}`, stroke: stroke, trajectories: trajectories, dragging: false, exit: false, exitTime: 0}]};
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
								trajectories.push({x: x, y: y, height: trajectories[i].height, width: trajectories[i].width, time: played});
								break;
							}
							let interpoArea = interpolationArea( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
							trajectories.splice(i+1, 0, {x: x, y: y, height: interpoArea.height, width: interpoArea.width, time: played});
							break;
						}
					}
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

						for( let i = 0; i < trajectories.length; i++){
							if(played >= trajectories[i].time){
								//skip elapsed trajectories
								if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
									continue;

								let xCorrection, yCorrection
								if(topLeft.x()<topRight.x() && topLeft.y()<bottomLeft.y()){
									xCorrection = topLeft.x()
									yCorrection = topLeft.y()
									console.log('topLeft')
								}else if(topRight.x()<topLeft.x() && topRight.y()<bottomLeft.y()){
									xCorrection = topRight.x()
									yCorrection = topRight.y()
									console.log('topRight')
								}else if(bottomLeft.x()<topRight.x() && bottomLeft.y()<topLeft.y()){
									xCorrection = bottomLeft.x()
									yCorrection = bottomLeft.y()
									console.log('bottomLeft')
								}else if(bottomRight.x()<bottomLeft.x() && bottomRight.y()<topRight.y()){
									xCorrection = bottomRight.x()
									yCorrection = bottomRight.y()
									console.log('bottomRight')
								}
								if(played===trajectories[i].time){
									trajectories[i].x+=xCorrection;
									trajectories[i].y+=yCorrection;
									trajectories[i].width=width;
									trajectories[i].height=height;
									break;
								}
								if(i===trajectories.length-1){
									trajectories.push({x: trajectories[i].x+xCorrection, y: trajectories[i].y+yCorrection, height: height, width: width, time: played});
									break;
								}
								let interpoPos = interpolationPosition( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played, startTrajXCorrection: xCorrection, startTrajYCorrection: yCorrection})
								trajectories.splice( i+1, 0, {x: interpoPos.x, y: interpoPos.y, height: height, width: width, time: played})
								break;
							}
						}
						return { ...obj, trajectories: trajectories};
					})
				}
			})
		}
	}
	handleCanvasCircleDragMove = e =>{
	}
	handleCanvasExitClick = e => {
		const group = e.target.getParent().getParent()
		this.setState((prevState, props) => {
			const played = prevState.played
			return { objects: prevState.objects.reduce( (newObjects, obj) =>{

					if(obj.name !== group.name()){
						newObjects.push(obj)
						return newObjects
					}

					let trajectories = obj.trajectories
					for ( let i = trajectories.length - 1; i >= 0; --i) {
							if (trajectories[i].time >= played){
								if(i===0)
									return newObjects;
								if(trajectories[i-1].time >= played ){
									trajectories.splice(i, 1);
									continue;
								}
								let currentTimeOffset = 1.e-18
								let interpoArea = interpolationArea({startTraj: trajectories[i-1], endTraj: trajectories[i], played: played, currentTimeOffset: currentTimeOffset})
								let interpoPos = interpolationPosition({startTraj: trajectories[i-1], endTraj: trajectories[i], played: played, currentTimeOffset: currentTimeOffset})
								trajectories.splice(i, 1);
								trajectories = [ ...obj.trajectories, {x: interpoPos.x, y: interpoPos.y, height: interpoArea.height, width: interpoArea.width, time: played - currentTimeOffset}];
								break;
							}
					}
					newObjects.push({ ...obj, exit: true, exitTime: played, trajectories: trajectories })
					return newObjects
					//return { ...obj, exit: true, exitTime: played, trajectories: trajectories };
				}, [])
			}
		})
	}
	/* ==================== list ==================== */

	handleListObjectDelete = name =>{
		this.setState((prevState) => {
				const objects = prevState.objects.filter( object => {
					if(object.name !== name)
						return true;
					return false
					});
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
												onCanvasExitClick={this.handleCanvasExitClick}
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
