import React from "react";
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';
import RaisedButton from 'material-ui/RaisedButton';
import ArrowForwardIcon from 'react-material-icons/icons/navigation/arrow-forward';
import ErrorOutlineIcon from 'react-material-icons/icons/alert/error-outline';
import { red500 } from 'material-ui/styles/colors';
import Web3 from 'web3';

class ContractFunction extends React.Component {
  constructor(props) {
    super(props);
    let args = {};
    for (let i = 0; i < this.props.abi.inputs.length; i++) {
      args["arg_" + i] = {
        value: "",
        valid: true,
        errorMessage: ""
      };
    }

    const noArgs = this.props.abi.inputs.length === 0;
    this.state = {
      result: null,
      requestState: noArgs ? 'requesting' : 'initialized',
      args: args,
      noArgs: noArgs,
      error: null,
    };
    this.getInputs = this.getInputs.bind(this);
    this.handleArgChange = this.handleArgChange.bind(this);
    this.callContractFunction = this.callContractFunction.bind(this);
    this.getArgValues = this.getArgValues.bind(this);
    this.web3 = new Web3();

    if (noArgs) {
      this.callContractFunction(false);
    }
  }

  async callContractFunction(setState) {
    if (setState) {
      this.setState({ requestState: 'requesting', result: null });
    }
    const request = {
      address: this.props.address,
      functionName: this.props.abi.name,
      arguments: Object.values(this.getArgValues())
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
    const json = await response.json();
    console.log(json);
    if (response.status !== 200) {
      this.setState({ requestState: 'error', error: json.message });
      return;
    }
    this.setState({ requestState: 'completed', result: json.result });
  }

  handleArgChange(event, newValue) {
    const id = event.target.id;
    let newArgs = this.state.args;
    newArgs[id].value = newValue;
    const isValid = this.validateArgChange(newValue, event.target.argType);
    console.log(isValid);
    newArgs[id].valid = isValid;
    if (!isValid) {
      newArgs[id].errorMessage = "Invalid argument for type " + event.target.argType;
    }
    this.setState({ args: newArgs })
  }

  validateArgChange(value, type) {
    console.log(type);
    if (type.match(/^uint/)) {
      return value.match(/^[0-9]+$/);
    } else if (type.match(/^int/)) {
      value.match(/^-?[0-9]+$/);
    } else if (type === 'bool') {
      return value === '0' || value === '1';
    } else if (type === 'address') {
      return this.web3.isAddress(value);
    }

    return true;
  }

  getArgValues() {
    return Object.values(this.state.args).map(function(v) {
      return v.value;
    });
  }

  getInputs() {
    const thisRef = this;
    return this.props.abi.inputs.map(function(value, i) {
      return <Row key={i}>
          <Col xsOffset={2}>
            <TextField
              floatingLabelText={value.name + ' [' + value.type + ']'}
              id={'arg_' + i}
              value={thisRef.state.args['arg_' + i].value}
              argType={value.type}
              onChange={thisRef.handleArgChange}
            />
          </Col>
        </Row>;
    });
  }

  render() {
    let callDisabled = false;
    const thisRef = this;
    for (const key in this.state.args) {
      if (!this.state.args[key].valid) {
        callDisabled = true;
      }
    }

    let argumentInputs = <div>
      { this.getInputs() }
      <RaisedButton
        label='Call'
        primary={true}
        onTouchTap={ e => this.callContractFunction(true) }
        disabled={callDisabled}
        />
    </div>

    let resultData;
    if (this.state.requestState === 'error') {
      resultData = <div style={{ color: red500 }}>
          <ErrorOutlineIcon
            color={red500}
            style={{ float: 'left', width: 12, height: 12, marginRight: 5, marginTop: 2 }}/>
          {this.state.error}
      </div>;
    } else if (Array.isArray(this.state.result)) {
      resultData = this.state.result.map(function(v, i) {
          let identifier = thisRef.props.abi.outputs[i].name;
          if (identifier !== null && identifier !== undefined && identifier !== '') {
            identifier += ': ';
          }

          return <Row key={i}>
              <div>
                {identifier + v}
              </div>
            </Row>;
        });
    } else {
      resultData = this.state.result;
    }
    return (
      <div style={{ fontSize: 12 }}>
        <Row style={{ marginTop: 5, marginBottom: 5 }}>
          <Col xsOffset={1} xs={3}>
            { this.props.abi.name }
          </Col>
          <Col xs={1}>
            <ArrowForwardIcon style={{ width: 12, height: 12 }}/>
          </Col>
          <Col xs={6}>
            { resultData }
          </Col>
        </Row>
        { this.props.active && !this.state.noArgs && argumentInputs }
      </div>
    );
  }
}

export default ContractFunction;
