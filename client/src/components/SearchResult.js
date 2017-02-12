import React from "react";
import {Card, CardActions, CardTitle} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import '../styles/SearchResult.css';
import CopyToClipboard from 'react-copy-to-clipboard';

const initialBytecodeButtonText = "Copy Bytecode";

class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bytecodeButtonText: initialBytecodeButtonText
    };
    this.copyBytecodeClicked = this.copyBytecodeClicked.bind(this);
  }

  copyBytecodeClicked(e) {
    console.log(this);
    this.setState({ bytecodeButtonText: 'Copied!' });
    const thisRef = this;
    setTimeout(function() {
      thisRef.setState({ bytecodeButtonText: initialBytecodeButtonText });
    }, 1000);
  }

  render() {
    return (
      <div className="SearchResultContainer">
        <Card>
          <CardTitle
            title={this.props.contract.name || "Contract"}
            subtitle={this.props.contract.address}
          />
          <CardActions>
            <FlatButton label="Upload Source" />
            <FlatButton label="Send Transaction" />
            <CopyToClipboard text={this.props.contract.code}>
              <FlatButton
                label={this.state.bytecodeButtonText}
                onClick={this.copyBytecodeClicked}/>
            </CopyToClipboard>
          </CardActions>
        </Card>
      </div>
    );
  }
}

export default SearchResult;
