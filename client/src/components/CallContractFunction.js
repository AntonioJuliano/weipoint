import React from "react";
import Dialog from 'material-ui/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import { Grid, Row } from 'react-flexbox-grid';
import FlatButton from 'material-ui/FlatButton';

class CallContractFunction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      requestState: 'initialized',
      index: null,
      args: {},
    };
    this.handleChange = this.handleChange.bind(this);
    this.getInputs = this.getInputs.bind(this);
    this.handleArgChange = this.handleArgChange.bind(this);
    this.callContractFunction = this.callContractFunction.bind(this);
  }

  handleChange(event, index, value) {
    let args = {};
    for (let i = 0; i < this.getConstantFunctions()[value].inputs.length; i++) {
      args["arg_" + i] = "";
    }
    this.setState({ index: index, args: args });
  }

  getConstantFunctions() {
    return this.props.abi.filter(function(value) {
      return value.constant;
    })
  }

  handleArgChange(event, newValue) {
    const id = event.target.id;
    let newArgs = this.state.args;
    newArgs[id] = newValue;
    this.setState({ args: newArgs })
  }

  getInputs() {
    if (this.state.index === null) {
      return null;
    }
    const thisRef = this;
    return this.getConstantFunctions()[this.state.index].inputs.map(function(value, i) {
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

  callContractFunction() {
    const request = {
      address: this.props.address,
      functionName: this.getConstantFunctions()[this.state.index].name,
      arguments: Object.values(this.state.args)
    };
    const requestPath = '/api/v1/contract/constantFunction';
    const thisRef = this;
    fetch(requestPath, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    }).then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log(json);
      thisRef.setState({ result: json.result });
    });
  }

  render() {
    const menuItems = this.getConstantFunctions().map(function(value, i) {
      return <MenuItem value={i} key={i} primaryText={value.name} />;
    });

    let callDisabled = false;
    if (this.state.index !== null) {
      for (const key in this.state.args) {
        if (this.state.args[key] === '') {
          callDisabled = true;
        }
      }
    } else {
      callDisabled = true;
    }

    const actions = [
      <FlatButton
        label="Call"
        primary={true}
        disabled={callDisabled}
        onTouchTap={this.callContractFunction}
      />
    ];

    const thisRef = this;
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
    const result = this.state.result === null ? null : resultData;

    return (
      <Dialog
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.close}
        actions={actions}
      >
        <div>
          <Grid>
            <SelectField
              value={this.state.index}
              onChange={this.handleChange}
              maxHeight={300}
              floatingLabelText="Function Name"
            >
              {menuItems}
            </SelectField>
            {this.getInputs()}
            {result}
          </Grid>
        </div>
      </Dialog>
    );
  }
}

export default CallContractFunction;
