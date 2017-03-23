import React, { Component } from 'react';
import Search from './components/Search';
import './styles/App.css';
import Web3 from 'web3';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: new Web3()
    };
  }

  render() {
    return (
      <div className='App'>
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
          <Search web3={this.state.web3}/>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
