import React, { Component } from 'react';
import Menu from './components/layouts/Menu.js';
import Main from './components/layouts/Main.js';
import Footer from './components/layouts/Footer.js';


class App extends Component {
  render() {
    return (
			<div>
	      <Menu/>
	      <Main/>
	      <Footer/>
	    </div>
    );
  }
}

export default App;
