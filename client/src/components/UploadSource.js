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
import AutoComplete from 'material-ui/AutoComplete';


const fruit = [
  'Apple', 'Apricot', 'Avocado',
  'Banana', 'Bilberry', 'Blackberry', 'Blackcurrant', 'Blueberry',
  'Boysenberry', 'Blood Orange',
  'Cantaloupe', 'Currant', 'Cherry', 'Cherimoya', 'Cloudberry',
  'Coconut', 'Cranberry', 'Clementine',
  'Damson', 'Date', 'Dragonfruit', 'Durian',
  'Elderberry',
  'Feijoa', 'Fig',
  'Goji berry', 'Gooseberry', 'Grape', 'Grapefruit', 'Guava',
  'Honeydew', 'Huckleberry',
  'Jabouticaba', 'Jackfruit', 'Jambul', 'Jujube', 'Juniper berry',
  'Kiwi fruit', 'Kumquat',
  'Lemon', 'Lime', 'Loquat', 'Lychee',
  'Nectarine',
  'Mango', 'Marion berry', 'Melon', 'Miracle fruit', 'Mulberry', 'Mandarine',
  'Olive', 'Orange',
  'Papaya', 'Passionfruit', 'Peach', 'Pear', 'Persimmon', 'Physalis', 'Plum', 'Pineapple',
  'Pumpkin', 'Pomegranate', 'Pomelo', 'Purple Mangosteen',
  'Quince',
  'Raspberry', 'Raisin', 'Rambutan', 'Redcurrant',
  'Salal berry', 'Satsuma', 'Star fruit', 'Strawberry', 'Squash', 'Salmonberry',
  'Tamarillo', 'Tamarind', 'Tomato', 'Tangerine',
  'Ugli fruit',
  'Watermelon',
];

class UploadSource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: null,
            code: "",
            stepIndex: 0,
            version: "",
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

    handleCodeChanged = (e, v) => {
      this.setState({ code: v });
    }

    handleVersionChanged = (v) => {
      this.setState({ version: v.trim() });
    }

    uploadSource = () => {
      const request = {
        address: this.props.contract.address,
      	source: this.state.code,
      	sourceType: "solidity",
      	compilerVersion: this.state.version
      };
      console.log("Uploading contract");
      console.log(request);
      this.setState({ searchState: 'uploading' });

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
          }
      ).then(function(json) {
        console.log(json);
      }
      ).catch(function(error) {
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
                  <Col xs={6}>
                    <AutoComplete
                      floatingLabelText="Solidity version"
                      filter={AutoComplete.fuzzyFilter}
                      dataSource={fruit}
                      onUpdateInput={this.handleVersionChanged}
                      searchText={this.state.version}
                      maxSearchResults={5}
                    />
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
          onTouchTap={this.state.stepIndex === 1 ? this.uploadSource : this.handleNext}
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
