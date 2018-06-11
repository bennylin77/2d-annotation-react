import React, { Component } from 'react';
import MdRedo from 'react-icons/lib/md/redo';
import MdUndo from 'react-icons/lib/md/undo';
import MdPlayArrow from 'react-icons/lib/md/play-arrow';
import MdPause from 'react-icons/lib/md/pause';
import MdAdd from 'react-icons/lib/md/add';
import MdReplay from 'react-icons/lib/md/replay';
import Player from '../../components/two-dimensional/player/Player';
import Slider from '../../components/two-dimensional/player/Slider';
import Duration from '../../components/two-dimensional/player/Duration';
import Canvas from '../../components/two-dimensional/canvas/Canvas';
import List from '../../components/two-dimensional/list/List';
import UndoList from '../../components/two-dimensional/undo-list/UndoList';
import {VideoObject, Trajectory } from '../../models/2DVideo.js';
import {UndoState} from '../../models/UndoState.js';
import {ADD_2D_VIDEO_OBJECT, DELETE_2D_VIDEO_OBJECT, SPLIT_2D_VIDEO_OBJECT, EXIT_2D_VIDEO_OBJECT} from '../../models/UndoState.js';
import {SPLITED, HIDE, SHOW} from '../../models/2DVideo.js';
import {colors, getRandomInt, interpolationArea, interpolationPosition} from '../../components/two-dimensional/helper.js';
import { fetch2DVideo, editAndFetch2DVideoIfNeeded } from '../../actions/twoDimensionalActions.js';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, ButtonGroup} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

class Manager extends Component {
  constructor(props) {
     super(props);
		 this.state = { played: 0, playing: false, duration: 0, loop: false, seeking: false, stage:{}, adding: false, focusing: "", objects: [], undoStates: []};
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
	handleVideoRewind = () => {
		this.setState({ playing: false, played: 0 })
		this.player.seekTo(0)
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
		this.setState({ playing: false, seeking: true })
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
	handleCanvasStageRef = r =>{
		this.setState({stage: r.getStage()})
	}
	handleCanvasStageMouseMove = e =>{}
	handleCanvasStageMouseDown = e =>{
		if(!this.state.adding)
			return;
		const stage = e.target.getStage()
		const position = stage.getPointerPosition()
		const name = (new Date()).getTime().toString(36);
		const color = colors[getRandomInt(colors.length)]
		const trajectories = []
		this.setState((prevState, props) => {
			trajectories.push( new Trajectory({x: position.x, y: position.y, height: 1, width: 1, time: prevState.played}) )
			return { adding: !prevState.adding, focusing: `${name}`, undoStates: [...prevState.undoStates, new UndoState({id: `${(new Date()).getTime()}`, type: ADD_2D_VIDEO_OBJECT, attrs: {name: `${name}`} })],
			 				 objects: [...prevState.objects, new VideoObject({name: `${name}`, color: color, trajectories: trajectories})]};
		}, () => {
			const group = stage.find(`.${name}`)[0]
			const bottomRight = group.get('.bottomRight')[0]
			bottomRight.startDrag()
		});
	}
	handleCanvasStageMouseUp = e => {}
	handleCanvasGroupMouseDown = e =>{
		const group = e.target.findAncestor('Group')
		this.setState({playing: false, focusing: group.name()});
	}
	handleCanvasGroupDragStart = e =>{}
	handleCanvasGroupDragEnd = e =>{
		const group = e.target
		const position = e.target.position()
		this.setState((prevState, props) => {
			const played = prevState.played
			return { playing: false, objects: prevState.objects.map( obj =>{
					if(obj.name !== group.name())
						return obj;
					let trajectories = obj.trajectories
					for( let i = 0; i < trajectories.length; i++){
						if(played >= trajectories[i].time){
							//skip elapsed trajectories
							if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
								continue;
							if(played===trajectories[i].time){
								trajectories[i].x = position.x; trajectories[i].y = position.y;
								break;
							}
							if(i===trajectories.length-1){
								trajectories.push(new Trajectory({x: position.x, y: position.y, height: trajectories[i].height, width: trajectories[i].width, time: played}));
								break;
							}
							let interpoArea = interpolationArea( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
							trajectories.splice(i+1, 0, new Trajectory({x: position.x, y: position.y, height: interpoArea.height, width: interpoArea.width, time: played}));
							break;
						}
					}
					return { ...obj, trajectories: trajectories};
				})
			}
		})
	}
	handleCanvasGroupRef = r =>{}
	handleCanvasCircleMouseDown = e =>{
		const group = e.target.findAncestor('Group')
		this.setState({focusing: group.name()})
	}
	handleCanvasCircleDragMove = e =>{}
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
								let xCorrection, yCorrection;
								if(topLeft.x() < topRight.x() && topLeft.y() < bottomLeft.y()){
									xCorrection = topLeft.x();
									yCorrection = topLeft.y();
									console.log('topLeft')
								}else if(topRight.x() < topLeft.x() && topRight.y() < bottomLeft.y()){
									xCorrection = topRight.x()
									yCorrection = topRight.y()
									console.log('topRight')
								}else if(bottomLeft.x() < topRight.x() && bottomLeft.y() < topLeft.y()){
									xCorrection = bottomLeft.x()
									yCorrection = bottomLeft.y()
									console.log('bottomLeft')
								}else if(bottomRight.x() < bottomLeft.x() && bottomRight.y() < topRight.y()){
									xCorrection = bottomRight.x()
									yCorrection = bottomRight.y()
									console.log('bottomRight')
								}
								if(played === trajectories[i].time){
									trajectories[i].x+=xCorrection;
									trajectories[i].y+=yCorrection;
									trajectories[i].width=width;
									trajectories[i].height=height;
									break;
								}
								if(i===trajectories.length-1){
									trajectories.push(new Trajectory({x: trajectories[i].x+xCorrection, y: trajectories[i].y+yCorrection, height: height, width: width, time: played}));
									break;
								}
								let interpoPos = interpolationPosition( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played, startTrajXCorrection: xCorrection, startTrajYCorrection: yCorrection})
								trajectories.splice( i+1, 0, new Trajectory({x: interpoPos.x, y: interpoPos.y, height: height, width: width, time: played}))
								break;
							}
						}
						return { ...obj, trajectories: trajectories};
					})
				}
			})
		}
	}
	/* ==================== list ==================== */
	handleListTrajectoryJump = e => {
		const name = e.name
		const time = e.time
		this.setState({ playing: false, focusing: name },
			() => {
				this.player.seekTo(parseFloat(time))
				for(let o of this.state.objects){
					if(o.name!==name)
						continue;
					if(o.status===SHOW)
						this.state.stage.find(`.${name}`)[0].moveToTop();
					break;
				}
		})

	}
	handleListTrajectoryDelete = e => {
		const name = e.name
		const time = e.time
		this.setState((prevState) => {
			const objects = prevState.objects.map( obj => {
				if(obj.name !== name)
					return obj;
				const trajectories = obj.trajectories.filter( t => {
						if(t.time !== time)
							return true;
						return false
				});
				return {...obj, trajectories: trajectories};
			});
			return { objects: objects };
		});
	}
	handleListObjectDelete = name => {
		this.setState((prevState) => {
				const objects = prevState.objects.filter( object => {
					if(object.name !== name)
						return true;
					return false
					});
				return { objects: objects };
		});
	}
	handleListObjectShowHide = e => {
		const name = e.name;
		const status = e.status;
		this.setState((prevState, props) => {
			const played = prevState.played
			return { objects: prevState.objects.map( obj =>{
					if(obj.name !== name)
						return obj
					let trajectories = obj.trajectories
					for( let i = 0; i < trajectories.length; i++){
						if(i===0 && played < trajectories[i].time){
							trajectories.splice(0, 0, new Trajectory({x: trajectories[i].x, y: trajectories[i].y, height: trajectories[i].height, width: trajectories[i].width, time: played, status: status}));
							break;
						}
						if(played >= trajectories[i].time){
							//skip elapsed trajectories
							if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
								continue;
							if(played===trajectories[i].time){
								trajectories[i].status = status;
								break;
							}
							if(i===trajectories.length-1){
								trajectories.push(new Trajectory({x: trajectories[i].x, y: trajectories[i].y, height: trajectories[i].height, width: trajectories[i].width, time: played, status: status}));
								break;
							}
							let interpoArea = interpolationArea( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
							let interpoPos = interpolationPosition( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
							trajectories.splice(i+1, 0, new Trajectory({x: interpoPos.x, y: interpoPos.y, height: interpoArea.height, width: interpoArea.width, time: played, status: status}));
							break;
						}
					}
					return { ...obj, trajectories: trajectories};
				})
			}
		})
	}
	handleListObjectSplit = name =>{
		const childName1 = (new Date()).getTime().toString(36);
		const childName2 = ((new Date()).getTime()+1).toString(36);
		const childColor1 = colors[getRandomInt(colors.length)]
		const childColor2 = colors[getRandomInt(colors.length)]
		const childTrajectories1 = []
		const childTrajectories2 = []
		const status = SPLITED;
		let exChildName1, exChildName2
		let parentX, parentY, parentWidth, parentHeight
		this.setState((prevState, props) => {
			const played = prevState.played
			let objects = prevState.objects.map( obj =>{
				if(obj.name !== name)
					return obj;
				exChildName1 = obj.children[0]
				exChildName2 = obj.children[1]
				let trajectories = obj.trajectories
				for( let i = 0; i < trajectories.length; i++){
					if(played >= trajectories[i].time){
						if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
							continue;
						parentX = trajectories[i].x;
						parentY = trajectories[i].y;
						parentWidth = trajectories[i].width;
						parentHeight = trajectories[i].height;
						if(played===trajectories[i].time){
							trajectories[i].status = status;
							trajectories = trajectories.slice(0,i+1);
							break;
						}
						if(i===trajectories.length-1){
							trajectories.push(new Trajectory({x: trajectories[i].x, y: trajectories[i].y, height: trajectories[i].height, width: trajectories[i].width, time: played, status: status}));
							break;
						}
						let interpoArea = interpolationArea( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
						let interpoPos = interpolationPosition( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
						parentX = interpoPos.x;
						parentY = interpoPos.y;
						parentWidth = interpoArea.width;
						parentHeight = interpoArea.height;
						trajectories.splice(i+1, 0, new Trajectory({x: interpoPos.x, y: interpoPos.y, height: interpoArea.height, width: interpoArea.width, time: played, status: status}));
						trajectories = trajectories.slice(0,i+2);
						break;
					}
				}
				return { ...obj, trajectories: trajectories, children: [`${childName1}`, `${childName2}`]};
			})
			objects = objects.filter(obj => {
				if(obj.name!==exChildName1 && obj.name!==exChildName2)
					return true
				return false
			})
			childTrajectories1.push(new Trajectory({x: parentX+10, y: parentY+10, height: parentHeight, width: parentWidth, time: played}));
			childTrajectories2.push(new Trajectory({x: parentX+20, y: parentY+20, height: parentHeight, width: parentWidth, time: played}));
			objects.push(new VideoObject({name: `${childName1}`, color: childColor1, trajectories: childTrajectories1, parent: name }))
			objects.push(new VideoObject({name: `${childName2}`, color: childColor2, trajectories: childTrajectories2, parent: name }))
			return { objects: objects};
		})
	}

  render() {
		const {	playing, played, duration, adding, focusing, objects, undoStates} = this.state;
    const { editing, twoDimensionalVideoList } = this.props
		const { id } = this.props.match.params
		const video = twoDimensionalVideoList[id]
    if (this.isNotFetched()) {
      return <h4><i>Loading</i></h4>
    }
    return (
			<Container fluid={true}>
				<Row className="py-3">
					<Col>
						<div style={{width: '848px'}}>
							<Row>
								<Col>
									<div style={{position: 'relative', left: '50%', marginLeft: -424}}>
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
														focusing = {focusing}
														onCanvasStageRef={this.handleCanvasStageRef}
														onCanvasStageMouseMove={this.handleCanvasStageMouseMove}
														onCanvasStageMouseDown={this.handleCanvasStageMouseDown}
														onCanvasStageMouseUp={this.handleCanvasStageMouseUp}
														onCanvasGroupRef={this.handleCanvasGroupRef}
														onCanvasGroupMouseDown={this.handleCanvasGroupMouseDown}
														onCanvasGroupDragStart={this.handleCanvasGroupDragStart}
														onCanvasGroupDragEnd={this.handleCanvasGroupDragEnd}
														onCanvasCircleMouseDown={this.handleCanvasCircleMouseDown}
														onCanvasCircleDragMove={this.handleCanvasCircleDragMove}
														onCanvasCircleDragEnd={this.handleCanvasCircleDragEnd}
														/>
									</div>
								</Col>
							</Row>
							<Row>
								<Col>
									<Slider played={played}
													onSliderMouseUp={this.handleSliderMouseUp}
													onSliderMouseDown={this.handleSliderMouseDown}
													onSliderChange={this.handleSliderChange}/>
								</Col>
							</Row>
							<Row className="align-items-center">
								<Col xs={{size: 2, offset: 0}} className="mx-auto">
									<ButtonGroup>
										<Button style={{padding: "0.375rem 0.1rem"}} color="link" onClick={this.handleVideoRewind}><MdReplay style={{fontSize: '30px'}}/></Button>
										<Button color="link" onClick={this.handleVideoPlayPause}>{playing ? <MdPause style={{fontSize: '30px'}}/> : <MdPlayArrow style={{fontSize: '30px'}}/>}</Button>
									</ButtonGroup>
								</Col>
								<Col xs="10" className="mx-auto">
									<div className="text-right text-muted"><Duration seconds={played*duration}/> / <Duration seconds={duration}/></div>
								</Col>
							</Row>
						</div>
					</Col>
					<Col>
							<div className="sticky-top">
								<div className="pb-2">
									<ButtonGroup>
										<Button outline onClick={this.handleAddObject}><MdUndo/> Ubdo</Button>
										<Button outline onClick={this.handleAddObject}><MdRedo/> Redo</Button>
										<Button outline onClick={this.handleAddObject}><MdAdd/> {adding ? 'Adding Object' : 'Add Object'}</Button>
									</ButtonGroup>
								</div>
								<List objects= {objects}
											duration= {duration}
											onListObjectDelete= {this.handleListObjectDelete}
											onListObjectShowHide={this.handleListObjectShowHide}
											onListObjectSplit={this.handleListObjectSplit}
											onListTrajectoryJump={this.handleListTrajectoryJump}
											onListTrajectoryDelete={this.handleListTrajectoryDelete}
											/>
							</div>
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
const App = connect(mapStateToProps)(Manager);
export default App;




/*
<div className="text-right text-muted"><Duration seconds={played*duration}/> / <Duration seconds={duration}/></div>
<Col>
	<div className="sticky-top">
		<UndoList undoStates={undoStates}/>
	</div>
</Col>
handleCanvasForkClick = e => {
	const group = e.target.getParent().getParent()
	const childName = (new Date()).getTime().toString(36);
	const childColor = colors[getRandomInt(colors.length)]
	const childTrajectories = []
	let parentX, parentY, parentWidth, parentHeight
	this.setState((prevState, props) => {
		const played = prevState.played
		let objects = prevState.objects.map( obj =>{
			if(obj.name !== group.name())
				return obj;
			let trajectories = obj.trajectories
			for(let i=0; i<trajectories.length ;i++){
				if(played >= trajectories[i].time){
					//skip elapsed trajectories
					if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
						continue;

					if(i===trajectories.length-1){
						parentX = trajectories[i].x;
						parentY = trajectories[i].y;
						parentWidth = trajectories[i].width;
						parentHeight = trajectories[i].height;
						break;
					}
					let interpoArea = interpolationArea( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
					let interpoPos = interpolationPosition( { startTraj: trajectories[i], endTraj: trajectories[i+1], played: played })
					parentX = interpoPos.x;
					parentY = interpoPos.y;
					parentWidth = interpoArea.width;
					parentHeight = interpoArea.height;
					break;
				}
			}
			return { ...obj, children: [...obj.children, `${childName}`]};
		})
		childTrajectories.push({x: parentX+10, y: parentY+10, height: parentHeight, width: parentWidth, time: played})
		return { objects: [...objects, {name: `${childName}`, color: childColor, trajectories: childTrajectories, children:[], parent: group.name() }]};
	})
}
*/
