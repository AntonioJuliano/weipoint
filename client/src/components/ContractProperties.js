import React from "react";
import Divider from 'material-ui/Divider';
import { Row, Col } from 'react-flexbox-grid';
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
        <Divider />
        <ContractFunction
          abi={value}
          address={thisRef.props.address}
          active={i === thisRef.state.active }
          />
      </div>;
    });
  }

  setActive(i) {
    if (this.state.active !== i) {
      this.setState({ active: i });
    }
  }

  render() {
    return (
      <div className='propertiesList'
        style={{ height: '100%', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <Row style={{ marginTop: 10, marginBottom: 25 }} center='xs'>
          <Col xs={10}>
            Here you can view properties defined by this contract. Click on a property to expand
            the parameters it takes, and call it with a given set of parameters.
          </Col>
        </Row>
        {this.getConstantFunctions()}
      </div>
    );
  }
}

export default ContractProperties;
