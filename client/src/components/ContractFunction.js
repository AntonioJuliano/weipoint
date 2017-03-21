import React from "react";
import TextField from 'material-ui/TextField';
import { Grid, Row, Col } from 'react-flexbox-grid';
import FlatButton from 'material-ui/FlatButton';

class ContractFunction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      requestState: 'initialized',
      args: {},
    };
    this.getInputs = this.getInputs.bind(this);
    this.handleArgChange = this.handleArgChange.bind(this);
    this.callContractFunction = this.callContractFunction.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let args = {};
    for (let i = 0; i < this.props.abi.inputs.length; i++) {
      args["arg_" + i] = "";
    }
    this.setState({ args: args });
  }

  async callContractFunction() {
    this.setState({ requestState: 'requesting', result: null });
    const request = {
      address: this.props.address,
      functionName: this.props.abi.name,
      arguments: Object.values(this.state.args)
    };
    const requestPath = '/api/v1/contract/constantFunction';
    const response = await fetch(requestPath, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });
    if (response.status !== 200) {
      this.setState({ requestState: 'error' });
      return;
    }
    const json = await response.json();
    console.log(json);
    this.setState({ requestState: 'completed', result: json.result });
  }

  handleArgChange(event, newValue) {
    const id = event.target.id;
    let newArgs = this.state.args;
    newArgs[id] = newValue;
    this.setState({ args: newArgs })
  }

  getInputs() {
    const thisRef = this;
    return this.props.abi.inputs.map(function(value, i) {
      return <Row key={i}>
          <TextField
            floatingLabelText={value.name}
            id={'arg_' + i}
            value={thisRef.state.args['arg_' + i]}
            onChange={thisRef.handleArgChange}
          />
        </Row>;
    });
  }

  render() {
    let callDisabled = false;
    const thisRef = this;
    for (const key in this.state.args) {
      if (this.state.args[key] === '') {
        callDisabled = true;
      }
    }

    let resultData;
    if (Array.isArray(this.state.result)) {
      resultData = this.state.result.map(function(v, i) {
          return <Row key={i}>
              <div>
                {thisRef.getConstantFunctions()[thisRef.state.index].outputs[i].name + ': ' + v}
              </div>
            </Row>;
        });
    } else {
      resultData = <Row>
          {this.state.result}
        </Row>;
    }
    return (
      <Grid>
        <Row style={{ marginTop: 5, marginBottom: 5 }}>
          <Col xsOffset={1} xs={4}>
            {this.props.abi.name}
          </Col>
          <Col xsOffset={4} xs={3}>
            {this.props.name}
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default ContractFunction;
