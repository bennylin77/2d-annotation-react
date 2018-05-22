import React from 'react';
import TwoDimensional from '../../containers/TwoDimensional.js';
import { Switch, Route } from 'react-router-dom'

function Entry(props) {
  return (
    <Switch>
      <Route exact path='/two-dimensional/:type' component={TwoDimensional}/>
    </Switch>
  );
}
export default Entry;
