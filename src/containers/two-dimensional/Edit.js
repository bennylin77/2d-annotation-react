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
		const position = e.target.getPointerPosition()
		this.setState((prevState, props) => {
			const name = (new Date()).getTime();
			const stroke = colors[getRandomInt(3)]
			//const anchors = []
			//anchors.push({name: 'topLeft', x: 0, y: 0})
			//anchors.push({name: 'topRight', x: 20, y: 0})
			//anchors.push({name: 'bottomRight', x: 20, y: 20})
			//anchors.push({name: 'bottomLeft', x: 0, y: 20})
			const trajectories = []
			trajectories.push({x: position.x, y: position.y, height: 20, width: 20, time: prevState.played})
			return { adding: !prevState.adding, objects: [...prevState.objects, {name: `${name}`, stroke: stroke, trajectories: trajectories, dragging: false}]};
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
		this.setState((prevState, props) => {
			return {  objects: prevState.objects.map( obj =>{
					if(obj.name !== r.name())
						return obj;
					return { ...obj, Group: r };
				})
			}
		})
	}

	handleCanvasCircleDragEnd = e =>{

		const activeAnchor = e.target
		const group = activeAnchor.getParent();
		group.draggable(true)

		let topLeft = group.get('.topLeft')[0];
		let topRight = group.get('.topRight')[0];
		let bottomRight = group.get('.bottomRight')[0];
		let bottomLeft = group.get('.bottomLeft')[0];
		let width = topRight.getX() - topLeft.getX();
		let height = bottomLeft.getY() - topLeft.getY();

		if(width && height) {

			this.setState((prevState, props) => {
				const played = prevState.played
				return { objects: prevState.objects.map( obj =>{
						if(obj.name !== group.name())
							return obj;
						let trajectories = obj.trajectories

						console.log(`trajectories size: ${trajectories.length}`)

						for( let i = 0; i < trajectories.length; i++){

							console.log(i)

							if(played >= trajectories[i].time){
								//skip elapsed trajectories
								if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
									continue;

								//console.log(played)

								//console.log(trajectories[i].time)

								if(played===trajectories[i].time){
									trajectories[i].width = width; trajectories[i].height = height;
									break;
								}

								if(i===trajectories.length-1){
									trajectories = [ ...obj.trajectories, {x: trajectories[i].x, y: trajectories[i].y, height: height, width: width, time: played}];
									break;
								}

								let startTraj = trajectories[i], endTraj = trajectories[i+1]
								let lapseTime = endTraj.time - startTraj.time;
								let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
								// set x and y position
								let curTime = played - startTraj.time;
								let x = xSlope * curTime + startTraj.x;
								let y = ySlope * curTime + startTraj.y;
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
						return { ...obj, trajectories: trajectories};
					})
				}
			})
		}
	}
	handleCanvasCircleDragMove = e =>{


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
			</Container>
    );
  }
}

const colors = ["rgba(3, 169, 244, 0.7)", "rgba(244, 67, 54, 0.7)", "rgba(233, 30, 99, 0.7)"]
const getRandomInt = max => {
  return Math.floor(Math.random() * Math.floor(max));
}
/*
const setGroupXY = (played, objs) => {
	return objs.map( obj =>{
		let offsetX = obj.offset.x, offsetY = obj.offset.y
		let trajectories = obj.trajectories
		for( let i = 0; i < trajectories.length; i++){
			// To find the played time between which trajectories
			if(played >= trajectories[i].time){
				if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
					continue;
				if(i===trajectories.length-1){
					offsetX = trajectories[i].x - trajectories[0].x;
					offsetY = trajectories[i].y - trajectories[0].y;
				}else{
					let startTraj = trajectories[i], endTraj = trajectories[i+1]
					let lapseTime = endTraj.time - startTraj.time;
					let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
					// set x and y position
					let curTime = played - startTraj.time;
					let x = xSlope * curTime + startTraj.x;
					let y = ySlope * curTime + startTraj.y;
					offsetX = x - trajectories[0].x;
					offsetY = y - trajectories[0].y;
				}
				obj.Group.x(offsetX);
				obj.Group.y(offsetY);
				break;
			}
		}
		return { ...obj, offset: {x:offsetX, y:offsetY }};
	})
}
*/
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
