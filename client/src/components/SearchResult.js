import React from "react";
import {Card, CardActions, CardTitle} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import '../styles/SearchResult.css';
import CopyToClipboard from 'react-copy-to-clipboard';
import UploadSource from './UploadSource';
import ViewSource from './ViewSource';

const initialBytecodeButtonText = "Copy Bytecode";

class SearchResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bytecodeButtonText: initialBytecodeButtonText,
      uploadSourceOpen: false,
      viewSourceOpen: false,
      contract: this.props.contract,
      uploadState: 'initialized'
    };
    this.copyBytecodeClicked = this.copyBytecodeClicked.bind(this);
    this.uploadSourceClicked = this.uploadSourceClicked.bind(this);
    this.viewSourceClicked = this.viewSourceClicked.bind(this);
    this.uploadSourceClosed = this.uploadSourceClosed.bind(this);
    this.viewSourceClosed = this.viewSourceClosed.bind(this);
    this.uploadSource = this.uploadSource.bind(this);
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

  viewSourceClicked(e) {
    this.setState({ viewSourceOpen: true });
  }

  viewSourceClosed(e) {
    this.setState({ viewSourceOpen: false });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ contract: this.props.contract });
  }

  uploadSource(code, sourceType, compilerVersion, optimized) {
    const request = {
      address: this.state.contract.address,
      source: code,
      sourceType: sourceType,
      compilerVersion: compilerVersion,
      optimized: optimized
    };
    const thisRef = this;

    const requestPath = `/api/v1/contract/source`;
    fetch(requestPath, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    }).then(function(response) {
      if (response.status !== 200) {
          throw Error("Search request to server failed");
      }
      return response.json();
    }).then(function(contract) {
      thisRef.setState({
        uploadState: 'completed',
        contract: contract
      });
    }).catch(function(error) {
      thisRef.setState({ uploadState: 'error' });
      console.error(error);
    });
  }

  render() {
    const showUploadSource = this.state.contract.source === undefined;
    const uploadSourceButton = showUploadSource ?
      <FlatButton
        label="Upload Source Code"
        onClick={this.uploadSourceClicked}/> : null;

    const viewSourceButton = showUploadSource ? null :
      <FlatButton
        label="View Source Code"
        onClick={this.viewSourceClicked}/>;

    return (
      <div className="SearchResultContainer">
        <Card>
          <CardTitle
            title={this.state.contract.name || "Contract"}
            subtitle={this.state.contract.address}
          />
          <CardActions>
            {uploadSourceButton}
            {viewSourceButton}
            <FlatButton label="Send Transaction" />
            <CopyToClipboard text={this.state.contract.code}>
              <FlatButton
                label={this.state.bytecodeButtonText}
                onClick={this.copyBytecodeClicked}/>
            </CopyToClipboard>
          </CardActions>
          <UploadSource
            open={this.state.uploadSourceOpen}
            close={this.uploadSourceClosed}
            uploadSource={this.uploadSource}
            uploadState={this.state.uploadState}
          />
          <ViewSource
            open={this.state.viewSourceOpen}
            close={this.viewSourceClosed}
            source={this.state.contract.source}
          />
        </Card>
      </div>
    );
  }
}

export default SearchResult;
