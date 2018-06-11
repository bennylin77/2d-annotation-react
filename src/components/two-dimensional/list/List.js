import React, {Component} from 'react';
import Duration from '../player/Duration'
import 'bootstrap/dist/css/bootstrap.css';
import { Button, ButtonGroup, ListGroup, ListGroupItem, UncontrolledCollapse } from 'reactstrap';
import MdCallSplit from 'react-icons/lib/md/call-split';
import MdDelete from 'react-icons/lib/md/delete';
import MdHighlightRemove from 'react-icons/lib/md/highlight-remove';
import {SPLITED, HIDE, SHOW} from '../../../models/2DVideo.js';

class List extends Component {


	handleDelete = (name) => {
    this.props.onListObjectDelete(name);
  }
	handleSplit = (name) => {
    this.props.onListObjectSplit(name);
  }
	handleShowHide = (e) => {
    this.props.onListObjectShowHide(e);
  }
	handleTrajectoryJump = (e) => {
		this.props.onListTrajectoryJump(e);
	}
	handleTrajectoryDelete = (e) => {
		this.props.onListTrajectoryDelete(e);
	}

  render() {
		const { objects, duration } = this.props;
		const items = 	objects.map(obj =>{
										//console.log(obj)
										let trajectories = [];
										for( let t of obj.trajectories){
											trajectories.push(<ListGroupItem key={t.time}>
																				<Button onClick={()=>this.handleTrajectoryJump({name: obj.name, time: t.time})}>x:{t.x} y:{t.y} width:{t.width} height:{t.height} status:{t.status} <Duration seconds={duration*t.time}/></Button>
																				<Button color="link" onClick={()=>this.handleTrajectoryDelete({name: obj.name, time: t.time})}><MdHighlightRemove style={{fontSize: '30px'}}/></Button>
																				</ListGroupItem>)
										}
										return(	<ListGroupItem key={obj.name}>
															<ButtonGroup className="float-left">
																<Button outline onClick={()=>this.handleSplit(obj.name)}><MdCallSplit/> {SPLITED}</Button>
																<Button outline onClick={()=>this.handleShowHide({name: obj.name, status: SHOW})}> {SHOW}</Button>
																<Button outline onClick={()=>this.handleShowHide({name: obj.name, status: HIDE})}> {HIDE}</Button>
															</ButtonGroup>
															<Button outline color="danger" className="float-right" onClick={()=>this.handleDelete(obj.name)}><MdDelete/> Delete</Button>
															<br/>
															<br/>{obj.name}
															<br/>Parent: {obj.parent}
															<br/>Children: {obj.children.join(":")}
															<br/>


															<Button color="link" id={"toggler"+obj.name} style={{ marginBottom: '0rem' }}>
													      Trajectories
													    </Button>
															<UncontrolledCollapse toggler={"#toggler"+obj.name}>

															</UncontrolledCollapse>
															<ListGroup className="py-2 list-group-flush">{trajectories}</ListGroup>

														</ListGroupItem>)
										})

    return (
			<ListGroup>{items}</ListGroup>
    );
  }
}
export default List;

/*<Button outline color="info" onClick={()=>this.handleDelete(obj.name)}>Fork</Button>*/
