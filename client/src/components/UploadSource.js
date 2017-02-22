/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';

class UploadSource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: null,
            code: "",
            stepIndex: 0,
            versionIndex: null,
            visited: [],
            compilerVersions: [],
            uploadState: 'initialized'
        };
        this.loadCompilerVersions();
    }

    loadCompilerVersions() {
      const requestPath = '/api/v1/contract/compilerVersions';
      const thisRef = this;
      fetch(requestPath, { method: 'get'})
        .then(function(response) {
          return response.json();
        }).then(function(json) {
          console.log(json);
          const compilerVersions = json.versions;
          let menuItems = [];
          for (let i = 0; i < compilerVersions.length; i++ ) {
            menuItems.push(<MenuItem value={i} key={compilerVersions[i]} primaryText={compilerVersions[i]} />);
          }
          thisRef.setState({ compilerVersions: menuItems });
        });
    }

    handleChange = (e) => {
        const key = e.target.id;
        const value = e.target.value;
        let pair = {};
        pair[key] = value;
        this.setState(pair);
    }

    handleCodeChanged = (e, v) => {
      this.setState({ code: v });
    }

    handleVersionChanged = (event, index, value) => {
      this.setState({ versionIndex: value });
    };

    uploadSource = () => {
      const request = {
        address: this.props.contract.address,
      	source: this.state.code,
      	sourceType: "solidity",
        compilerVersion: this.state.compilerVersions[this.state.versionIndex].key
      };
      console.log("Uploading contract");
      console.log(request);
      this.setState({ uploadState: 'uploading' });
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
      }).then(function(json) {
        thisRef.setState({ uploadState: 'completed' });
        thisRef.props.sourceUploaded(json);
      }).catch(function(error) {
        thisRef.setState({ uploadState: 'error' });
        console.error(error);
      });
    }

    componentWillMount() {
      const {stepIndex, visited} = this.state;
      this.setState({visited: visited.concat(stepIndex)});
    }

    componentWillUpdate(nextProps, nextState) {
      const {stepIndex, visited} = nextState;
      if (visited.indexOf(stepIndex) === -1) {
        this.setState({visited: visited.concat(stepIndex)});
      }
    }

    handleNext = () => {
      const {stepIndex} = this.state;
      if (stepIndex < 2) {
        this.setState({stepIndex: stepIndex + 1});
      }
    };

    handlePrev = () => {
      const {stepIndex} = this.state;
      if (stepIndex > 0) {
        this.setState({stepIndex: stepIndex - 1});
      }
    };

    getStepContent(stepIndex) {
      switch (stepIndex) {
        case 0:
          return <div>
              Add contract source code here.
              <p style={{ fontSize: '75%'}}>
                Note: currently only Solidity source code is supported
              </p>
              <Paper zDepth={1}>
                <TextField
                  onChange={this.handleCodeChanged}
                  style={{ width: "95%", paddingLeft: 5, overflow: 'auto', maxHeight: 300 }}
                  id='codeField'
                  multiLine={true}
                  underlineShow={false}
                  rows={20}
                  value={this.state.code}
                />
              </Paper>
            </div>;
        case 1:
          return <div>
              <Grid style={{ width: '90%' }}>
                <Row center='xs'>
                  <Col xs={6} style={{ minWidth: 200 }}>
                    <SelectField
                      value={this.state.versionIndex}
                      onChange={this.handleVersionChanged}
                      maxHeight={200}
                      floatingLabelText="Solidity Version"
                      style={{
                        width: 200,
                        textAlign: 'left',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }}
                      >
                      {this.state.compilerVersions}
                    </SelectField>
                  </Col>
                </Row>
              </Grid>
            </div>;
        default:
          return null;
      }
    }

    render() {
      const actions = [
        <FlatButton
          label="Back"
          disabled={this.state.stepIndex === 0}
          onTouchTap={this.handlePrev}
          style={{ marginRight: 10 }}
        />,
        <RaisedButton
          label={this.state.stepIndex === 1 ? "Submit" : "Next"}
          primary={true}
          disabled={this.state.stepIndex === 1 && this.state.versionIndex === null}
          onTouchTap={this.state.stepIndex === 1 ? this.uploadSource : this.handleNext}
        />
      ];

      const uploadForm = <div>
          <Row center='xs'>
            <Col xs={10} md={8}>
              <Stepper linear={false} activeStep={this.state.stepIndex}>
                <Step
                  completed={this.state.visited.indexOf(0) !== -1}
                  active={this.state.stepIndex === 0}
                >
                  <StepButton onClick={() => this.setState({stepIndex: 0})}>
                    Code
                  </StepButton>
                </Step>
                <Step
                  completed={this.state.visited.indexOf(1) !== -1}
                  active={this.state.stepIndex === 1}
                >
                  <StepButton onClick={() => this.setState({stepIndex: 1})}>
                    Version
                  </StepButton>
                </Step>
              </Stepper>
            </Col>
          </Row>
          <div>
            <Row center='xs'>
              <Col xs={10}>
                {this.getStepContent(this.state.stepIndex)}
              </Col>
            </Row>
          </div>
        </div>;

      const spinner = <Row center={'xs'}>
        <Col xs={4}>
          <div
            style={{
              marginTop: 50,
              marginBottom: 50
            }}
            >
            <CircularProgress
              size={60}
              thickness={6} />
          </div>
        </Col>
      </Row>;

      const success = <div
        style={{
          marginTop: 50,
          marginBottom: 50,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
        >
          {'Success!'}
        </div>;

      const error = <div
        style={{
          marginTop: 50,
          marginBottom: 50,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
        >
          {'Error!'}
        </div>;

      let current;
      console.log(this.state.uploadState);
      if (this.state.uploadState === 'initialized') {
        current = uploadForm;
      } else if (this.state.uploadState === 'uploading') {
        current = spinner;
      } else if (this.state.uploadState === 'completed') {
        current = success;
      } else {
        current = error;
      }
      return (
        <div>
          <Dialog
            title="Upload Contract Source"
            actions={actions}
            modal={false}
            open={this.props.open}
            onRequestClose={this.props.close}
            >
            {current}
          </Dialog>
        </div>
      );
    }
}

export default UploadSource;
