import React, { Component } from 'react';
import Player from '../../components/two-dimensional/player/Player';
import Slider from '../../components/two-dimensional/player/Slider';
import Duration from '../../components/two-dimensional/player/Duration';
import Canvas from '../../components/two-dimensional/canvas/Canvas';
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
    	//this.setState({played: state.played})
			const played = state.played
			//const target = e.target
			this.setState((prevState, props) => {
				return { played: played, objects: prevState.objects.map( obj =>{
						let offsetX = obj.offset.x
						let offsetY = obj.offset.y
						let trajectories = obj.trajectories
						for( let i = 0; i < trajectories.length; i++){
							if(played >= trajectories[i].time){
								if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
									continue;
								let x, y;

								if(i===trajectories.length-1){
									offsetX = trajectories[i].x - trajectories[0].x;
									offsetY = trajectories[i].y - trajectories[0].y;
								}else{
									let startTraj = trajectories[i], endTraj = trajectories[i+1]
									let lapseTime = endTraj.time - startTraj.time;
									let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
									// set x and y position
									let curTime = played - startTraj.time;
									x = xSlope * curTime + startTraj.x;
									y = ySlope * curTime + startTraj.y;
									offsetX = x - trajectories[0].x;
									offsetY = y - trajectories[0].y;
									//obj.Group.x(offsetX)
									//obj.Group.y(offsetY)
								}
								obj.Group.x(offsetX)
								obj.Group.y(offsetY)
								break;
							}
						}
						//console.log(offsetX, offsetY);
						return { ...obj,
										 offset: {x:offsetX, y:offsetY }
									 };
					})
				}
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
			const played = this.state.played
			const target = e.target
			this.setState((prevState, props) => {
				return { played: parseFloat(target.value), objects: prevState.objects.map( obj =>{
						let offsetX = obj.offset.x
						let offsetY = obj.offset.y
						let trajectories = obj.trajectories
						for( let i = 0; i < trajectories.length; i++){
							if(played >= trajectories[i].time){
								if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
									continue;
								let x, y;

								if(i===trajectories.length-1){
									offsetX = trajectories[i].x - trajectories[0].x;
									offsetY = trajectories[i].y - trajectories[0].y;
								}else{
									let startTraj = trajectories[i], endTraj = trajectories[i+1]
									let lapseTime = endTraj.time - startTraj.time;
									let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
									// set x and y position
									let curTime = played - startTraj.time;
									x = xSlope * curTime + startTraj.x;
									y = ySlope * curTime + startTraj.y;
									offsetX = x - trajectories[0].x;
									offsetY = y - trajectories[0].y;
									//obj.Group.x(offsetX)
									//obj.Group.y(offsetY)
								}
								obj.Group.x(offsetX)
								obj.Group.y(offsetY)
								break;
							}
						}
						//console.log(offsetX, offsetY);
						return { ...obj,
										 offset: {x:offsetX, y:offsetY }
	              	 };
					})
				}
			})
		}
	/* ==================== canvas ==================== */
	handleAddObject = () =>{
		this.setState((prevState, props) => {
			return {adding: !prevState.adding, playing: false};
		});
	}
	handleCanvasStageMouseMove = e =>{
	}
	handleCanvasStageMouseDown = e =>{
		if(!this.state.adding)
			return;
		const position = e.target.getPointerPosition()
		this.setState((prevState, props) => {
			const id = (new Date()).getTime();
			const stroke = colors[getRandomInt(3)]
			const trajectories = []
			trajectories.push({x: position.x, y: position.y, height: 20, width: 20, time: prevState.played})
			return { adding: !prevState.adding, objects: [...prevState.objects, {id: id, stroke: stroke, trajectories: trajectories, offset: {x:0 , y:0}, dragging: false}]};
		});
	}
	handleCanvasStageMouseUp = e =>{
	}
	handleCanvasGroupMouseDown = e =>{
	}
	handleCanvasGroupDragStart = e =>{
		const target = e.target
		this.setState((prevState, props) => {
			return { objects: prevState.objects.map( obj =>{
					if(obj.id !== parseInt(target.id(), 10))
						return obj;
					return { ...obj, dragging: true };
				})
			}
		})
	}
	handleCanvasGroupDragEnd = e =>{
		const target = e.target
		const offsetX = parseInt(target.x(), 10)
		const offsetY = parseInt(target.y(), 10)
		this.setState((prevState, props) => {
			return { playing: false, objects: prevState.objects.map( obj =>{
					if(obj.id !== parseInt(target.id(), 10))
						return obj;
					let trajectories = [ ...obj.trajectories, {x: obj.trajectories[0].x+offsetX, y: obj.trajectories[0].y+offsetY, height: 20, width: 20, time: prevState.played}];
					trajectories.sort(function(a, b) {
					  var timeA = a.time;
					  var timeB = b.time;
					  if (timeA < timeB)
					    return -1;
					  if (timeA > timeB)
					    return 1;
					  return 0;
					});
					return { ...obj,
									 offset: {x:offsetX, y:offsetY },
									 dragging: false,
	               	 trajectories: trajectories
	             	 };
				})
			}
		})
	}
	handleCanvasGroupRef = r =>{
		this.setState((prevState, props) => {
			return {  objects: prevState.objects.map( obj =>{
					if(obj.id !== parseInt(r.id(), 10))
						return obj;
					//console.log(trajectories)
					return { ...obj, Group: r };
				})
			}
		})
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
												onCanvasGroupDragEnd={this.handleCanvasGroupDragEnd} />
							</div>
						</Col>
					</Row>
					<Row className="py-1">
						<Col><Button outline color="danger" onClick={this.handleVideoPlayPause}>{playing ? 'Pause video' : 'Play video'}</Button></Col>
						<Col><Button outline color="primary" onClick={this.handleAddObject}>{adding ? 'Adding object' : 'Add object'}</Button></Col>
						<Col><div className="text-right text-muted"><Duration seconds={played*duration}/> / <Duration seconds={duration}/></div></Col>
					</Row>
					<Row className="py-1">
						<Col>
							<Slider played={played}
											onSliderMouseUp={this.handleSliderMouseUp}
											onSliderMouseDown={this.handleSliderMouseDown}
											onSliderChange={this.handleSliderChange}/>
						</Col>
					</Row>
			</Container>
    );
  }
}

const colors = ["rgba(3, 169, 244, 0.7)", "rgba(244, 67, 54, 0.7)", "rgba(233, 30, 99, 0.7)"]
function getRandomInt (max) {
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
