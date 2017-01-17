import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Search from './components/Search';
import Web3 from 'web3';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { web3: new Web3() };
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <Search web3={this.state.web3}/>
            </div>
        );
    }
}

export default App;
