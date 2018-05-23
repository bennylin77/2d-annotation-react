import React, {Component} from 'react';
import './Canvas.css';
import { Stage, Layer, Rect, Group, Circle } from 'react-konva';
import Konva from 'konva';



class Canvas extends Component {
	constructor(props) {
		super(props);
		this.state = {
    	color: 'green'
  	};
	}
	handleClick = () => {
     this.setState({
       color: Konva.Util.getRandomColor()
     });
   };


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

handle = e => {
/*
	const target = e.target
	const offsetX = parseInt(target.x())
	const offsetY = parseInt(target.y())
	console.log(target.getAbsolutePosition())
	console.log(`offsetX: ${offsetX} offsetY: ${offsetY}`)
	console.log(`x: ${target.x()} y: ${target.y()}`)*/
}
/*
	 handle = (e) => {
     // to() is a method of `Konva.Node` instances
		 console.log(e)
		 console.log(e.target.offsetY())
     console.log(e.target.offsetY())
		 console.log(e.target.getChildren())
   }
*/
	render() {
		const { height, width, objects, played} = this.props;
		const layerItems = [];

		objects.forEach( obj => {
			let trajectories = obj.trajectories
			let rect;
			for( let i = 0; i < trajectories.length; i++){
				if(played >= trajectories[i].time){
					//skip past trajectories
					if(i!==trajectories.length-1 && played >= trajectories[i+1].time)
						continue;

					let x, y, width, height
					if(i===trajectories.length-1){
						x=trajectories[i].x;
						y=trajectories[i].y;
						width=trajectories[i].width;
						height=trajectories[i].height;
					}else{
						let startTraj = trajectories[i], endTraj = trajectories[i+1]
						let lapseTime = endTraj.time - startTraj.time;
						let xSlope = (endTraj.x - startTraj.x)/lapseTime, ySlope = (endTraj.y - startTraj.y)/lapseTime;
						// set x and y position
						let curTime = played - startTraj.time;
						x = xSlope * curTime + startTraj.x;
						y = ySlope * curTime + startTraj.y;
					  // set width and height
						let widthSlope = (endTraj.width - startTraj.width)/lapseTime, heightSlope = (endTraj.height - startTraj.height)/lapseTime;
						width = widthSlope * curTime + startTraj.width
						height = heightSlope * curTime + startTraj.height
					}
					rect = <Rect x={x-obj.offset.x} y={y-obj.offset.y} width={width} height={height} stroke={obj.stroke}/>
					//console.log(`render played: ${played}`)
					//console.log(`render offsetX: ${obj.offset.x} offsetY: ${obj.offset.y}`)
					break;
				}
			}
			layerItems.push(<Group key={`${obj.id}`} ref={this.handleGroupRef} id={`${obj.id}`} draggable={true} onDragMove={this.handle} onMouseDown={this.handleGroupMouseDown} onDragEnd={this.handleGroupDragEnd} onDragStart={this.handleGroupDragStart}>{rect}</Group>);
		});



		return(
						<Stage width={width} height={height} className="konva-wrapper" onMouseDown={this.handleStageMouseDown} onMouseUp={this.handleStageMouseUp} onMouseMove={this.handleStageMouseMove}>
				       <Layer>{layerItems}</Layer>
				    </Stage>
					);
	}
}
export default Canvas;
