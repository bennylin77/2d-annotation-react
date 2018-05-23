import React from 'react';
import Edit from '../../containers/two-dimensional/Edit.js';
import { Switch, Route } from 'react-router-dom'

function Entry(props) {
  return (
    <Switch>
      <Route exact path='/two-dimensional/:id/:type' component={Edit}/>
    </Switch>
  );
}
export default Entry;
