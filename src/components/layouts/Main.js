import React, { Component } from 'react';
import VizWiz from '../vizwiz/Entry';
//import Sunburst from '../gallery/Sunburst';
//import WordCloud from '../gallery/WordCloud';
import { Switch, Route } from 'react-router-dom'
class Main extends Component {
	render() {
				return (
					<main>
						<Switch>
			        <Route path='/vizwiz' component={VizWiz}/>
			      </Switch>
					</main>);
	}
}
export default Main;
/*
<Route exact path='/' component={Home}/>
*/
