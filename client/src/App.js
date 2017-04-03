
/*global web3:true*/
import React, { Component } from 'react';
import Search from './components/Search';
import Web3 from 'web3';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

class App extends Component {
  constructor(props) {
    super(props);
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      web3 = new Web3();
    }
  }

  render() {
    return (
      <div className='App'
        style={{
          backgroundColor: '#efefef',
          minHeight: '100%',
          minWidth: '100%',
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -1,
          overflow: 'auto'
        }}>
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
          <Search web3={web3}/>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
