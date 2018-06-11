import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Button } from 'reactstrap';
import { ListGroup, ListGroupItem } from 'reactstrap';
class UndoList extends Component {

  render() {
		const { undoStates } = this.props;
		const items = 	undoStates.map(s =>{
										let datetime = new Date(parseInt(s.id));
										return(	<ListGroupItem key={s.id}>
															{s.type}<br/>
															{datetime.toLocaleTimeString()}
														</ListGroupItem>)
										})

    return (
			<ListGroup>{items}</ListGroup>
    );
  }
}
export default UndoList;
