/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { Row, Col } from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

class UploadSource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: null,
            code: null
        };
        this.handleChange = this.handleChange.bind(this);
        this.uploadSource = this.uploadSource.bind(this);
    }

    handleChange(e) {
        const value = e.target.value;
        this.setState({ value: value });

        const thisRef = this;

        if (this.props.web3.isAddress(value)) {
            console.log("searching for address " + value);
            const requestPath = `/api/v1/contract?address=${value}`;
            fetch(requestPath, {method: 'get'}).then(function(response) {
                    console.log(response);
                    return response.json();
                }
            ).then(function(json) {
                    console.log(json);
                    thisRef.setState({ code: json.code })
                }
            ).catch(function(error) {
                console.error(error);
            });
        }
    }

    uploadSource() {

    }

    render() {
      const actions = [
        <FlatButton
          label="Cancel"
          primary={true}
          onTouchTap={this.props.close}
        />,
        <FlatButton
          label="Upload"
          primary={true}
          keyboardFocused={true}
          onTouchTap={this.uploadSource}
        />,
      ];
      return (
        <div>
          <Dialog
            title="Upload Contract Source"
            actions={actions}
            modal={false}
            open={this.props.open}
            onRequestClose={this.props.close}
            >
            <Row center='xs'>
              <Col xs={10}>
                <div style={{marginTop: '5px', marginBottom: '5px'}}>
                  Upload the Solidity source code for this contract. After upload we will verify
                  that the supplied source code matches the bytecode of the contract.
                </div>
              </Col>
              <Col xs={10}>
                <Paper zDepth={1}>
                  <TextField
                    id='contractSourceField'
                    multiLine={true}
                    onChange={this.props.onChange}
                    underlineShow={false}
                    rows={20}
                    style={
                      {marginLeft: "5px",
                       marginRight: "0px",
                       maxHeight: "200px",
                       width: "95%"}}
                    />
                </Paper>
              </Col>
            </Row>
          </Dialog>
        </div>
      );
    }
}

export default UploadSource;
