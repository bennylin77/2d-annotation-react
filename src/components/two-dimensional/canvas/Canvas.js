import React, {Component} from 'react';
import './Canvas.css';
import { Stage, Layer, Rect, Group, Circle, Label, Text, Tag } from 'react-konva';
import {interpolationArea, interpolationPosition} from '../helper.js';

class Canvas extends Component {

	handleStageMouseMove = e => {
	  this.props.onCanvasStageMouseMove(e);
	}
	handleStageMouseDown = e => {
	  this.props.onCanvasStageMouseDown(e);
	}
	handleStageMouseUp = e => {
		this.props.onCanvasStageMouseUp(e);
	}
	handleGroupMouseDown = e => {
		//console.log(e.target.stroke())
		//e.target.fill(e.target.stroke())
		e.target.findAncestor('Group').moveToTop()
	  this.props.onCanvasGroupMouseDown(e);
	}
	handleGroupDragStart = e => {
		this.props.onCanvasGroupDragStart(e);
	}
	handleGroupDragEnd = e => {
		this.props.onCanvasGroupDragEnd(e);
	}
	handleGroupRef = r => {
    this.props.onCanvasGroupRef(r);
  }
	handleCircleMouseDown = e => {
		const group = e.target.findAncestor('Group')
		group.draggable(false)
		group.moveToTop()
		e.target.moveToTop()
		this.props.onCanvasCircleMouseDown(e);
	}
	handleCircleDragEnd = e => {
		this.props.onCanvasCircleDragEnd(e)
	}
	handleCircleDragMove = e => {
		const activeAnchor = e.target
		const group = activeAnchor.getParent();
		const topLeft = group.get('.topLeft')[0], topRight = group.get('.topRight')[0], bottomRight = group.get('.bottomRight')[0], bottomLeft = group.get('.bottomLeft')[0];
		const rect = group.get('Rect')[0];
		const anchorX = activeAnchor.getX();
		const anchorY = activeAnchor.getY();
	  // update anchor positions
		switch (activeAnchor.getName()) {
			case 'topLeft':
		  	topRight.setY(anchorY);
		    bottomLeft.setX(anchorX);
		    break;
			case 'topRight':
		    topLeft.setY(anchorY);
		    bottomRight.setX(anchorX);
		    break;
		  case 'bottomRight':
		    bottomLeft.setY(anchorY);
		    topRight.setX(anchorX);
		    break;
		  case 'bottomLeft':
		    bottomRight.setY(anchorY);
		    topLeft.setX(anchorX);
		    break;
		}
		rect.position(topLeft.position());
		const width = topRight.getX() - topLeft.getX();
		const height = bottomLeft.getY() - topLeft.getY();
		if(width && height) {
			rect.width(width);
		  rect.height(height);
		}
	}
	handleExitClick = e =>{
		this.props.onCanvasExitClick(e);
	}
	handleForkClick = e =>{
		this.props.onCanvasForkClick(e);
	}
	handleSplitClick = e =>{
		this.props.onCanvasSplitClick(e);
	}
	//for testing
	handle = e => {}

	render() {
		const { height, width, objects, played, focusing} = this.props;
		const layerItems = [];
		objects.forEach( obj => {
			let trajectories = obj.trajectories
			let rect;
			let x, y, width, height
			if(trajectories[0].time>played)
				return;
			if(obj.exit && obj.exitTime<=played)
				return;
			for( let i = 0; i < trajectories.length; i++){
				if(played >= trajectories[i].time){
					if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
						continue;
					if(i===trajectories.length-1){
						x=trajectories[i].x;
						y=trajectories[i].y;
						width=trajectories[i].width;
						height=trajectories[i].height;
					}else{
						let interpoArea = interpolationArea({startTraj: trajectories[i], endTraj: trajectories[i+1], played: played})
						let interpoPos = interpolationPosition({startTraj: trajectories[i], endTraj: trajectories[i+1], played: played})
						x = interpoPos.x;
						y = interpoPos.y;
						width = interpoArea.width;
						height = interpoArea.height;
					}
					let fill = (focusing===obj.name)? "rgba(0,0,0,.5)": ""
					console.log(obj.name)
					rect = <Rect x={0} y={0} fill={fill} width={width} height={height} stroke={obj.stroke} strokeWidth={1}/>
					break;
				}
			}

			let circles = []
			circles.push(<Circle x={0} y={0} key={'topLeft'} name={'topLeft'} stroke={obj.stroke} fill={obj.stroke} strokeWidth={0} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			circles.push(<Circle x={width} y={0} key={'topRight'} name={'topRight'} stroke={obj.stroke} fill={obj.stroke} strokeWidth={0} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			circles.push(<Circle x={width} y={height} key={'bottomRight'} name={'bottomRight'} stroke={obj.stroke} fill={obj.stroke} strokeWidth={0} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			circles.push(<Circle x={0} y={height} key={'bottomLeft'} name={'bottomLeft'} stroke={obj.stroke} fill={obj.stroke} strokeWidth={0} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			let exit = <Label onClick={this.handleExitClick} name={'exit'} x={width/2-30} y={-5}><Tag fill={obj.stroke} pointerDirection={'down'} pointerWidth={10} pointerHeight={10} lineJoin={'round'} ></Tag><Text fontFamily={'Calibri'} text={'Exit'} fontSize={18} lineHeight={1.2} width={50} align={'center'} fill={'#fff'} ></Text></Label>
			let fork = <Label onClick={this.handleForkClick} name={'fork'} x={width/2+40} y={-5}><Tag fill={obj.stroke} pointerDirection={'down'} pointerWidth={10} pointerHeight={10} lineJoin={'round'} ></Tag><Text fontFamily={'Calibri'} text={'Fork'} fontSize={18} lineHeight={1.2} width={50} align={'center'} fill={'#fff'} ></Text></Label>
			let split = <Label onClick={this.handleSplitClick} name={'split'} x={width/2+100} y={-5}><Tag fill={obj.stroke} pointerDirection={'down'} pointerWidth={10} pointerHeight={10} lineJoin={'round'} ></Tag><Text fontFamily={'Calibri'} text={'Split'} fontSize={18} lineHeight={1.2} width={50} align={'center'} fill={'#fff'} ></Text></Label>
			let name = <Text y={height} fontFamily={'Calibri'} text={obj.name} fontSize={12} lineHeight={1.2} fill={'#fff'} ></Text>
			layerItems.push(<Group x={x} y={y} key={obj.name} name={obj.name} ref={this.handleGroupRef} draggable={true} onDragMove={this.handle} onMouseDown={this.handleGroupMouseDown} onDragEnd={this.handleGroupDragEnd} onDragStart={this.handleGroupDragStart}>{rect}{circles}{exit}{fork}{split}{name}</Group>)
		});

		return(
						<Stage width={width} height={height} className="konva-wrapper" onMouseDown={this.handleStageMouseDown} onMouseUp={this.handleStageMouseUp} onMouseMove={this.handleStageMouseMove}>
				       <Layer>{layerItems}</Layer>
				    </Stage>
					);
	}
}
export default Canvas;
