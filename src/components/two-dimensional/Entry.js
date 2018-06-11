import React from 'react';
import Manager from '../../containers/two-dimensional/Manager.js';
import { Switch, Route } from 'react-router-dom'

function Entry(props) {
  return (
    <Switch>
      <Route exact path='/two-dimensional/:id/:type' component={Manager}/>
    </Switch>
  );
}
export default Entry;
