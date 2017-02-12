import React from "react";
import {Card, CardActions, CardTitle} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import '../styles/SearchResult.css';
import CopyToClipboard from 'react-copy-to-clipboard';
import UploadSource from './UploadSource'

const initialBytecodeButtonText = "Copy Bytecode";

class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bytecodeButtonText: initialBytecodeButtonText,
      uploadSourceOpen: false
    };
    this.copyBytecodeClicked = this.copyBytecodeClicked.bind(this);
    this.uploadSourceClicked = this.uploadSourceClicked.bind(this);
    this.uploadSourceClosed = this.uploadSourceClosed.bind(this);
  }

  copyBytecodeClicked(e) {
    this.setState({ bytecodeButtonText: 'Copied!' });
    const thisRef = this;
    setTimeout(function() {
      thisRef.setState({ bytecodeButtonText: initialBytecodeButtonText });
    }, 1000);
  }

  uploadSourceClicked(e) {
    this.setState({ uploadSourceOpen: true });
  }

  uploadSourceClosed(e) {
    this.setState({ uploadSourceOpen: false });
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
            <FlatButton
              label="Upload Source"
              onClick={this.uploadSourceClicked}/>
            <FlatButton label="Send Transaction" />
            <CopyToClipboard text={this.props.contract.code}>
              <FlatButton
                label={this.state.bytecodeButtonText}
                onClick={this.copyBytecodeClicked}/>
            </CopyToClipboard>
          </CardActions>
          <UploadSource
            open={this.state.uploadSourceOpen}
            close={this.uploadSourceClosed}/>
        </Card>
      </div>
    );
  }
}

export default SearchResult;
