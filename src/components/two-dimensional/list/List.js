import React, {Component} from 'react';
import Duration from '../player/Duration'
import 'bootstrap/dist/css/bootstrap.css';
import { Button } from 'reactstrap';
import { ListGroup, ListGroupItem } from 'reactstrap';

class List extends Component {



	handleDelete = (name) => {
    this.props.onListObjectDelete(name);
  }

  render() {
		const { objects, duration } = this.props;
		const items = 	objects.map(obj =>{
										//console.log(obj)
										let trajectories = [];
										for( let t of obj.trajectories){
											trajectories.push(<div key={t.time}>x: {t.x} y: {t.y} height: {t.height} width: {t.width} time: <Duration seconds={duration*t.time}/> ({t.time})</div>)
										}
										return(	<ListGroupItem key={obj.name}>
															{obj.name}<br/>
															{obj.stroke}<br/>
															{obj.parent}<br/>
															{obj.children.join(":")}<br/>
															{trajectories}
															<Button outline color="danger" className="float-right" onClick={()=>this.handleDelete(obj.name)}>Delete</Button>
														</ListGroupItem>)
										})

    return (
			<ListGroup>{items}</ListGroup>
    );
  }
}

export default List;
