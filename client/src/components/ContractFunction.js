import React from "react";
import TextField from 'material-ui/TextField';
import { Row, Col } from 'react-flexbox-grid';
import RaisedButton from 'material-ui/RaisedButton';
import ArrowForwardIcon from 'react-material-icons/icons/navigation/arrow-forward';

class ContractFunction extends React.Component {
  constructor(props) {
    super(props);
    let args = {};
    for (let i = 0; i < this.props.abi.inputs.length; i++) {
      args["arg_" + i] = "";
    }

    const noArgs = this.props.abi.inputs.length === 0;
    this.state = {
      result: null,
      requestState: noArgs ? 'requesting' : 'initialized',
      args: args,
      noArgs: noArgs
    };
    this.getInputs = this.getInputs.bind(this);
    this.handleArgChange = this.handleArgChange.bind(this);
    this.callContractFunction = this.callContractFunction.bind(this);

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
          <Col xsOffset={2}>
            <TextField
              floatingLabelText={value.name}
              id={'arg_' + i}
              value={thisRef.state.args['arg_' + i]}
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
      if (this.state.args[key] === '') {
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
    if (Array.isArray(this.state.result)) {
      resultData = this.state.result.map(function(v, i) {
          console.log(thisRef.props.abi.outputs[i]);
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
      <div>
        <Row style={{ marginTop: 5, marginBottom: 5 }}>
          <Col xsOffset={1} xs={4}>
            { this.props.abi.name }
          </Col>
          <Col xs={1}>
            <ArrowForwardIcon />
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
