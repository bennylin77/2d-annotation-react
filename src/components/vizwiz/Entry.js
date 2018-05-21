import React from 'react';
import Vizwiz from '../../containers/Vizwiz.js';
import { Switch, Route } from 'react-router-dom'

function Entry(props) {
  return (
    <Switch>
      <Route exact path='/vizwiz/:type' component={Vizwiz}/>
    </Switch>
  );
}
export default Entry;
