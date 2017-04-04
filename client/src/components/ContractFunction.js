import React from "react";
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';
import RaisedButton from 'material-ui/RaisedButton';
import ArrowForwardIcon from 'react-material-icons/icons/navigation/arrow-forward';
import ErrorOutlineIcon from 'react-material-icons/icons/alert/error-outline';
import { red500 } from 'material-ui/styles/colors';
import { Promise as bluebirdPromise } from 'bluebird';
import isEqual from 'lodash.isequal';

class ContractFunction extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.setupState(this.props);
    this.getInputs = this.getInputs.bind(this);
    this.handleArgChange = this.handleArgChange.bind(this);
    this.callContractFunction = this.callContractFunction.bind(this);
    this.callConstantFunction = this.callConstantFunction.bind(this);
    this.callNonConstantFunction = this.callNonConstantFunction.bind(this);
    this.getArgValues = this.getArgValues.bind(this);
  }

  componentDidMount() {
    if (this.state.noArgs && this.props.abi.constant) {
      this.callContractFunction(false);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      this.setState(this.setupState(nextProps));
      if (this.state.noArgs && this.props.abi.constant) {
        this.callContractFunction(false);
      }
    }
  }

  setupState(props) {
    let args = {};
    for (let i = 0; i < props.abi.inputs.length; i++) {
      args["arg_" + i] = {
        value: "",
        valid: true,
        errorMessage: "",
        type: props.abi.inputs[i].type
      };
    }

    const noArgs = props.abi.inputs.length === 0;

    return {
      result: null,
      requestState: noArgs ? 'requesting' : 'initialized',
      args: args,
      noArgs: noArgs,
      error: null,
      focused: false
    };
  }

  async callContractFunction(setState) {
    if (this.props.abi.constant) {
      return this.callConstantFunction(setState);
    } else {
      return this.callNonConstantFunction(setState);
    }
  }

  async callConstantFunction(setState) {
    if (setState) {
      this.setState({ requestState: 'requesting', result: null });
    }
    const request = {
      address: this.props.address,
      functionName: this.props.abi.name,
      arguments: this.getArgValues()
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
    if (response.status !== 200) {
      this.setState({ requestState: 'error', error: json.message });
      return;
    }
    let result = json.result;
    if (json.result === false) {
      result = 'false';
    } else if (json.result === true) {
      result = 'true';
    }
    this.setState({ requestState: 'completed', result: result });
  }

  async callNonConstantFunction(setState) {
    if (!this.props.web3.isConnected()) {
      this.setState({ requestState: 'error', error: 'Metamask not connected'});
      return;
    }

    bluebirdPromise.promisifyAll(this.props.web3.version);
    const networkVersion = await this.props.web3.version.getNetworkAsync();
    if (networkVersion !== 1) {
      this.setState({ requestState: 'error', error: 'Metamask not set to mainnet'});
    }

    if (setState) {
      this.setState({ requestState: 'requesting', result: null });
    }

    let contractInstance;
    try {
      contractInstance = this.props.web3.eth.contract(
        this.props.contractAbi).at(this.props.address);
    } catch (e) {
      console.error(e);
    }
    console.log(contractInstance);

    this.props.web3.eth.defaultAccount = this.props.web3.eth.accounts[0];

    bluebirdPromise.promisifyAll(contractInstance);

    try {
      const result =
        await contractInstance[this.props.abi.name + 'Async'](...this.getArgValues());
      this.setState({ requestState: 'completed', result: result });
    } catch (e) {
      let errorString = e.toString();
      if (e.toString().includes('User denied')) {
        errorString = 'Metamask: User denied transaction';
      }
      console.error(e);
      this.setState({ requestState: 'error', error: errorString });
    }
  }

  handleArgChange(event, newValue) {
    const id = event.target.id;
    let newArgs = this.state.args;
    const type = this.state.args[id].type;
    if (type === 'bool' && newValue === 'true') {
      newArgs[id].value = '1';
    } else if (type === 'bool' && newValue === 'false') {
      newArgs[id].value = '0';
    } else {
      newArgs[id].value = newValue;
    }
    const isValid = this.validateArgChange(newValue, type);
    newArgs[id].valid = isValid;
    if (newValue === '') {
      newArgs[id].errorMessage = "Cannot be empty";
    } else if (!isValid) {
      newArgs[id].errorMessage = "Invalid argument for type " + type;
    } else {
      newArgs[id].errorMessage = "";
    }
    this.setState({ args: newArgs })
  }

  validateArgChange(value, type) {
    if (type.match(/^uint/)) {
      return value.match(/^[0-9]+$/);
    } else if (type.match(/^int/)) {
      return value.match(/^-?[0-9]+$/);
    } else if (type === 'bool') {
      return value === '0' || value === '1' || value === 'true' || value === 'false';
    } else if (type === 'address') {
      return this.props.web3.isAddress(value);
    }

    return true;
  }

  getArgValues() {
    let values = [];
    for (const key in this.state.args) {
      if (Object.prototype.hasOwnProperty.call(this.state.args, key)) {
        values.push(this.state.args[key].value);
      }
    }

    return values;
  }

  getInputs() {
    const thisRef = this;
    return this.props.abi.inputs.map(function(value, i) {
      return <Row key={i}>
          <Col xsOffset={1}>
            <TextField
              floatingLabelText={value.name + ' [' + value.type + ']'}
              id={'arg_' + i}
              value={thisRef.state.args['arg_' + i].value}
              onChange={thisRef.handleArgChange}
              errorText={thisRef.state.args['arg_' + i].errorMessage}
              inputStyle={{ fontSize: 12, marginTop: 12 }}
              floatingLabelShrinkStyle={{ fontSize: 12, marginTop: -1 }}
              floatingLabelFocusStyle={{ fontSize: 12 }}
              hintStyle={{ fontSize: 12 }}
              floatingLabelStyle={{ fontSize: 12, marginTop: -7 }}
              style={{ height: 60, marginTop: -10 }}
              errorStyle={{ fontSize: 12 }}
            />
          </Col>
        </Row>;
    });
  }

  render() {
    let callDisabled = false;
    const thisRef = this;
    for (const key in this.state.args) {
      if (!this.state.args[key].valid || this.state.args[key].value === '') {
        callDisabled = true;
      }
    }

    let argumentInputs = <div>
      { this.getInputs() }
      <Row style={{ marginTop: 10, marginBottom: 10 }}>
        <Col xsOffset={1}>
          <RaisedButton
            label='Call'
            primary={true}
            onTouchTap={ e => this.callContractFunction(true) }
            disabled={callDisabled}
            />
        </Col>
      </Row>
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

    const linkable = !this.state.noArgs && !this.props.active;
    let divStyle = {
      fontSize: 12
    };
    if (linkable) {
      divStyle.cursor = 'pointer';
    }

    const nameStyle = this.state.focused && linkable ? { color: '#1c6ced' } : {};
    nameStyle.overflowX = 'auto';

    return (
      <div
        style={divStyle}
        onMouseEnter={ e => this.setState({ focused: true })}
        onMouseLeave={ e => this.setState({ focused: false })}
        >
        <Row style={{ marginTop: 5, marginBottom: 5 }}>
          <Col xsOffset={1} xs={3} style={nameStyle}>
            { this.props.abi.name }
          </Col>
          <Col xs={1}>
            <ArrowForwardIcon style={{ width: 12, height: 12 }}/>
          </Col>
          <Col xs={7} style={{ overflowWrap: 'break-word', overflowX: 'auto' }}>
            { resultData }
          </Col>
        </Row>
        { this.props.active && !this.state.noArgs && argumentInputs }
      </div>
    );
  }
}

ContractFunction.propTypes = {
  address: React.PropTypes.string.isRequired,
  abi: React.PropTypes.object.isRequired,
  contractAbi: React.PropTypes.array.isRequired,
  active: React.PropTypes.bool.isRequired,
  web3: React.PropTypes.object.isRequired
};

export default ContractFunction;
