import React from "react";
import FlatButton from 'material-ui/FlatButton';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import Toggle from 'material-ui/Toggle';
import Editor from './Editor';
import CheckCircleIcon from 'react-material-icons/icons/action/check-circle';
import { green500 } from 'material-ui/styles/colors';

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
            optimized: true,
            uploadState: this.props.uploadState
        };
        this.loadCompilerVersions();

        this.handleChange = this.handleChange.bind(this);
        this.handleCodeChanged = this.handleCodeChanged.bind(this);
        this.handleVersionChanged = this.handleVersionChanged.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.componentWillUpdate = this.componentWillUpdate.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleOptimizedChanged = this.handleOptimizedChanged.bind(this);
        this.uploadSource = this.uploadSource.bind(this);
        this.getStepContent = this.getStepContent.bind(this);
    }

    async loadCompilerVersions() {
      const requestPath = '/api/v1/contract/compilerVersions';
      const thisRef = this;
      const response = await fetch(requestPath, { method: 'get'});
      const json = await response.json();
      const compilerVersions = json.versions;
      let menuItems = [];
      for (let i = 0; i < compilerVersions.length; i++ ) {
        menuItems.push(
          <MenuItem value={i} key={compilerVersions[i]} primaryText={compilerVersions[i]} />
        );
      }
      thisRef.setState({ compilerVersions: menuItems });
    }

    handleChange(e) {
        const key = e.target.id;
        const value = e.target.value;
        let pair = {};
        pair[key] = value;
        this.setState(pair);
    }

    handleCodeChanged(value) {
      this.setState({ code: value });
    }

    handleVersionChanged(event, index, value) {
      this.setState({ versionIndex: value });
    };

    componentWillMount() {
      const {stepIndex, visited} = this.state;
      this.setState({visited: visited.concat(stepIndex)});
    }

    componentWillReceiveProps(nextProps) {
      const keepOldState = (nextProps.uploadState === 'error'
        && this.state.uploadState !== 'uploading');
      if (!keepOldState) {
        this.setState({ uploadState: nextProps.uploadState });
      }
    }

    componentWillUpdate(nextProps, nextState) {
      const {stepIndex, visited} = nextState;
      if (visited.indexOf(stepIndex) === -1) {
        this.setState({visited: visited.concat(stepIndex)});
      }
    }

    handleNext() {
      const stepIndex = this.state.stepIndex;
      if (stepIndex < 2) {
        this.setState({stepIndex: stepIndex + 1});
      }
    };

    handlePrev() {
      if (this.state.uploadState === 'error') {
        this.setState({ stepIndex: 0, uploadState: 'initialized' });
        return;
      }
      const {stepIndex} = this.state;
      if (stepIndex > 0) {
        this.setState({stepIndex: stepIndex - 1});
      }
    };

    handleOptimizedChanged(e, optimized) {
      this.setState({ optimized: optimized });
    }

    uploadSource() {
      this.setState({ uploadState: 'uploading' });
      this.props.uploadSource(
        this.state.code,
        "solidity",
        this.state.compilerVersions[this.state.versionIndex].key,
        this.state.optimized
      );
    }

    getStepContent(stepIndex) {
      switch (stepIndex) {
        case 0:
          return <div>
              Add contract source code here.
              <p style={{ fontSize: '75%'}}>
                Note: currently only Solidity source code is supported
              </p>
              <Paper zDepth={2} style={{ height: this.props.height - 180 }}>
                <Editor
                  readOnly={false}
                  name='uploadSource'
                  value={this.state.code}
                  onChange={this.handleCodeChanged}
                />
              </Paper>
            </div>;
        case 1:
          return <div>
              Specify Solidity version used to compile contract
              <p style={{ fontSize: '75%'}}>
                Note: currently only release versions are supported
              </p>
              <Grid style={{ width: '90%' }}>
                <Row center='xs' style={{ marginTop: 20 }}>
                  <Col xs={6} style={{ minWidth: 200 }}>
                    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 150 }}>
                      <Toggle
                        label="Optimized"
                        labelStyle={{ width: 100 }}
                        toggled={this.state.optimized}
                        onToggle={this.handleOptimizedChanged}
                      />
                    </div>
                  </Col>
                </Row>
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
      const submitDisabled = (this.state.stepIndex === 1 && this.state.versionIndex === null)
        || this.state.uploadState === 'error'
        || this.state.uploadState === 'uploading'
        || this.state.uploadState === 'completed'
        || this.state.code.trim() === '';
      const backDisabled = this.state.stepIndex === 0
        || this.state.uploadState === 'uplaoding'
        || this.state.uploadState === 'completed';
      const actions = [
        <FlatButton
          label="Back"
          disabled={backDisabled}
          onTouchTap={this.handlePrev}
          style={{ marginRight: 10 }}
          key={0}
        />,
        <RaisedButton
          label={this.state.stepIndex === 1 ? "Submit" : "Next"}
          primary={true}
          disabled={submitDisabled}
          onTouchTap={this.state.stepIndex === 1 ? this.uploadSource : this.handleNext}
          key={1}
        />
      ];

      const uploadForm = <div>
          <Row center='xs'>
            <Col xs={8} md={6}>
              <Stepper linear={false} activeStep={this.state.stepIndex} style={{ height: 60 }}>
                <Step
                  completed={this.state.visited.indexOf(0) !== -1 && this.state.stepIndex !== 0}
                  active={this.state.stepIndex === 0}
                >
                  <StepButton onClick={() => this.setState({stepIndex: 0})}>
                    Code
                  </StepButton>
                </Step>
                <Step
                  completed={this.state.visited.indexOf(1) !== -1 && this.state.stepIndex !== 1}
                  active={this.state.stepIndex === 1}
                  disabled={this.state.code.trim() === ''}
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

      const spinner = <div>
        <Row center={'xs'} style={{marginTop: 15}}>
          <p>
            Verifying source code matches contract on blockchain. This may take a minute...
          </p>
        </Row>
        <Row center={'xs'}>
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
        </Row>
      </div>;

      const success = <Row center={'xs'}>
        <div
          style={{
            marginTop: 50,
            marginBottom: 50,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
          >
            {'Contract source code verified'}
          </div>
        </Row>;

      const error = <Row center={'xs'}>
        <div
          style={{
            marginTop: 50,
            marginBottom: 50,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: '80%'
          }}
        >
            {'Error verifying contract source code. Please check your inputs are correct '
              + '(including Solidity version and optimized) and try again'}
          </div>
        </Row>;

      const verifiedIcon = <div>
        <CheckCircleIcon style={{ width: 60, height: 60 }} color={green500} />
      </div>

      let current;
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
          {current}
          <Row style={{ marginTop: 10 }} center='xs'>
            {this.state.uploadState !== 'completed' && actions}
            {this.state.uploadState === 'completed' && verifiedIcon}
          </Row>
        </div>
      );
    }
}

export default UploadSource;
