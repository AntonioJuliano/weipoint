import React from "react";
import Dialog from 'material-ui/Dialog';
import { Grid } from 'react-flexbox-grid';
import Divider from 'material-ui/Divider';
import ContractFunction from './ContractFunction';

class ContractProperties extends React.Component {
  getConstantFunctions() {
    return this.props.abi.filter(function(value) {
      return value.constant;
    }).map(function(value, i) {
      return <div key={i} style={{ width: '90%' }}>
        <ContractFunction
          abi={value}
          />
        <Divider />
      </div>;
    });
  }

  render() {
    return (
      <Dialog
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.close}
        actions={[]}
      >
        <div>
          <Grid>
            {this.getConstantFunctions()}
          </Grid>
        </div>
      </Dialog>
    );
  }
}

export default ContractProperties;
