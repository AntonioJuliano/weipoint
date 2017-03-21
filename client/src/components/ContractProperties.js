import React from "react";
import Dialog from 'material-ui/Dialog';
import Divider from 'material-ui/Divider';
import ContractFunction from './ContractFunction';

class ContractProperties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: null
    };
    this.getConstantFunctions = this.getConstantFunctions.bind(this);
    this.setActive = this.setActive.bind(this);
  }

  getConstantFunctions() {
    const thisRef = this;
    return this.props.abi.filter(function(value) {
      return value.constant;
    }).map(function(value, i) {
      return <div
        key={i}
        style={{ width: '90%', margin: 'auto' }}
        onClick={ e => thisRef.setActive(i) }
        >
        <ContractFunction
          abi={value}
          address={thisRef.props.address}
          active={i === thisRef.state.active }
          />
        <Divider />
      </div>;
    });
  }

  setActive(i) {
    this.setState({ active: i });
  }

  render() {
    return (
      <Dialog
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.close}
        actions={[]}
        autoScrollBodyContent={true}
        style={{ minWidth: '850px', overflow: 'hidden' }}
      >
        <div className='propertiesList'>
          {this.getConstantFunctions()}
        </div>
      </Dialog>
    );
  }
}

export default ContractProperties;
