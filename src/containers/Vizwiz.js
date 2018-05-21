import React from 'react';
import Sunburst from '../components/gallery/Sunburst';
import { fetchVizwizList } from '../actions/vizwizActions.js';
import { connect } from 'react-redux';


//content
export class Vizwiz extends React.Component {
  constructor(props) {
     super(props);
   }
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchVizwizList())
  }
  isNotFetched = () => {
    const { vizwizList } = this.props
    return (!vizwizList) ? true : false;
  }


  render() {
    const { vizwizList } = this.props
		const { type } = this.props.match.params;

    if (this.isNotFetched()) {
      return <h4><i>Loading</i></h4>
    }
    return (
  		<div>
        <Sunburst data={vizwizList} />
  		</div>
    );
  }
}

//connect
function mapStateToProps(state) {
  const { vizwizList }= state
  return {
		vizwizList
  }
}
const App = connect(mapStateToProps)(Vizwiz);
export default App;
