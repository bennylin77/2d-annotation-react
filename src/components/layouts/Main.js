import React, { Component } from 'react';
import TwoDimensional from '../two-dimensional/Entry';
//import Sunburst from '../gallery/Sunburst';
//import WordCloud from '../gallery/WordCloud';
import { Switch, Route } from 'react-router-dom'
class Main extends Component {
	render() {
				return (
					<main>
						<Switch>
			        <Route path='/two-dimensional' component={TwoDimensional}/>
			      </Switch>
					</main>);
	}
}
export default Main;
/*
<Route exact path='/' component={Home}/>
*/
