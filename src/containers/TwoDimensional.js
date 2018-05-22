import React, { Component } from 'react';
import VideoAnnotation from '../components/two-dimensional/VideoAnnotation';
import { fetch2DVideo } from '../actions/twoDimensionalActions.js';
import { connect } from 'react-redux';


//content
class TwoDimensional extends Component {
  constructor(props) {
     super(props);
   }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetch2DVideo('cl43556'))
  }

  isNotFetched = () => {
    const { twoDimensionalVideoList } = this.props
    return (!twoDimensionalVideoList) ? true : false;
  }


  render() {
    const { twoDimensionalVideoList } = this.props
		const { type } = this.props.match.params;

    if (this.isNotFetched()) {
      return <h4><i>Loading</i></h4>
    }
    return (
  		<div>
        <VideoAnnotation list={twoDimensionalVideoList} />
  		</div>
    );
  }
}

//connect
function mapStateToProps(state) {
  const { lists: twoDimensionalVideoList }= state
  return {
		twoDimensionalVideoList
  }
}
const App = connect(mapStateToProps)(TwoDimensional);
export default App;
