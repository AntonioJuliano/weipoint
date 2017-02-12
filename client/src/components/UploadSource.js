/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import { Row, Col } from 'react-flexbox-grid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';

class UploadSource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: null,
            code: null,
            stepIndex: 0,
            visited: []
        };
    }

    handleChange = (e) => {
        const key = e.target.id;
        const value = e.target.value;
        let pair = {};
        pair[key] = value;
        this.setState(pair);
    }

    uploadSource = () => {

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
              <Paper zDepth={1}>
                <TextField
                  onChange={this.handleChange}
                  style={{ width: "95%", paddingLeft: 5, overflow: 'auto', maxHeight: 300 }}
                  id='codeField'
                  multiLine={true}
                  underlineShow={false}
                  rows={20}
                  value={this.state.codeField}
                />
              </Paper>
            </div>;
        case 1:
          return "B";
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
          label="Next"
          primary={true}
          onTouchTap={this.handleNext}
        />
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
          </Dialog>
        </div>
      );
    }
}

export default UploadSource;
