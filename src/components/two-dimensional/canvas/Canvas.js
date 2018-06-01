import React, {Component} from 'react';
import './Canvas.css';
import { Stage, Layer, Rect, Group, Circle } from 'react-konva';
import Konva from 'konva';



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
		const target = e.target
		target.getParent().draggable(false)
		//console.log('aaa')
		//console.log(target.getParent())
		target.moveToTop()
		//console.log(target.getParent().draggable())
	}
	handleCircleDragEnd = e => {
		this.props.onCanvasCircleDragEnd(e)
		//const target = e.target
		//target.getParent().draggable(true)
	}
	handleCircleDragMove = e => {
		const activeAnchor = e.target
		const group = activeAnchor.getParent();
		const topLeft = group.get('.topLeft')[0], topRight = group.get('.topRight')[0], bottomRight = group.get('.bottomRight')[0], bottomLeft = group.get('.bottomLeft')[0];
		const rect = group.get('Rect')[0];
		const anchorX = activeAnchor.getX();
		const anchorY = activeAnchor.getY();

		//console.log(`x: ${anchorX}, y: ${anchorY}`)

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

	handle = e => {
	}


	render() {
		const { height, width, objects, played} = this.props;
		const layerItems = [];

		objects.forEach( obj => {
			let trajectories = obj.trajectories
			let rect;
			let x, y, width, height
			//console.log(`obj.trajectories size: ${obj.trajectories.length }`)

			for( let i = 0; i < trajectories.length; i++){
				if(played >= trajectories[i].time){
					//skip elapsed trajectories
					if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
						continue;

					if(i===trajectories.length-1){
						x=trajectories[i].x;
						y=trajectories[i].y;
						width=trajectories[i].width;
						height=trajectories[i].height;
					}else{
						let startTraj = trajectories[i], endTraj = trajectories[i+1]
						let lapseTime = endTraj.time - startTraj.time;
						let curTime = played - startTraj.time;
						let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
						// set x and y position
						x = xSlope * curTime + startTraj.x;
						y = ySlope * curTime + startTraj.y;
					  // set width and height
						let widthSlope = (endTraj.width - startTraj.width)/lapseTime, heightSlope = (endTraj.height - startTraj.height)/lapseTime;
						width = widthSlope * curTime + startTraj.width
						height = heightSlope * curTime + startTraj.height
					}
					rect = <Rect x={0} y={0} width={width} height={height} stroke={obj.stroke} strokeWidth={2}/>
					break;
				}
			}

			let circles = []
			circles.push(<Circle x={0} y={0} key={'topLeft'} name={'topLeft'} stroke={'#000'} fill={'#ffffff'} strokeWidth={1} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			circles.push(<Circle x={width} y={0} key={'topRight'} name={'topRight'} stroke={'#000'} fill={'#ffffff'} strokeWidth={1} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			circles.push(<Circle x={width} y={height} key={'bottomRight'} name={'bottomRight'} stroke={'#000'} fill={'#ffffff'} strokeWidth={1} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)
			circles.push(<Circle x={0} y={height} key={'bottomLeft'} name={'bottomLeft'} stroke={'#000'} fill={'#ffffff'} strokeWidth={1} radius={6} draggable={true} dragOnTop={false} onDragMove={this.handleCircleDragMove} onMouseDown={this.handleCircleMouseDown} onDragEnd={this.handleCircleDragEnd} onMouseOver={this.handle} onMouseOut={this.handle} />)

			layerItems.push(<Group x={x} y={y} key={obj.name} name={obj.name} ref={this.handleGroupRef} draggable={true} onDragMove={this.handle} onMouseDown={this.handleGroupMouseDown} onDragEnd={this.handleGroupDragEnd} onDragStart={this.handleGroupDragStart}>{rect}{circles}</Group>);
		});

		return(
						<Stage width={width} height={height} className="konva-wrapper" onMouseDown={this.handleStageMouseDown} onMouseUp={this.handleStageMouseUp} onMouseMove={this.handleStageMouseMove}>
				       <Layer>{layerItems}</Layer>
				    </Stage>
					);
	}
}
export default Canvas;
