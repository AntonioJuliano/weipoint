import React from "react";
import Divider from 'material-ui/Divider';
import { Row, Col } from 'react-flexbox-grid';
import ContractFunction from './ContractFunction';

class ContractFunctions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: null
    };
    this.getFunctionElements = this.getFunctionElements.bind(this);
    this.setActive = this.setActive.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ active: null });
  }

  getFunctionElements() {
    const thisRef = this;
    return this.props.functions.map(function(value, i) {
      return <div
        key={value.name + i}
        style={{ width: '90%', margin: 'auto' }}
        onClick={ e => thisRef.setActive(i) }
        >
        <Divider />
        <ContractFunction
          contractAbi={thisRef.props.contractAbi}
          abi={value}
          address={thisRef.props.address}
          active={i === thisRef.state.active}
          web3={thisRef.props.web3}
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
    const functionElements = this.getFunctionElements();
    const anyFunctions = this.props.functions.length !== 0;
    const noFunctionsMessage = <div
      style={{ textAlign: 'center', marginTop: 150, fontStyle: 'italic' }}>
      {this.props.noFunctionsMessage}
    </div>;
    return (
      <div className='functionsList'
        style={{ height: '100%', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <Row style={{ marginTop: 10, marginBottom: 25 }} center='xs'>
          <Col xs={10}>
            {this.props.intro}
          </Col>
        </Row>
        {anyFunctions ? functionElements : noFunctionsMessage}
      </div>
    );
  }
}

ContractFunctions.propTypes = {
  functions: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  contractAbi: React.PropTypes.array.isRequired,
  noFunctionsMessage: React.PropTypes.string.isRequired,
  intro: React.PropTypes.string.isRequired,
  address: React.PropTypes.string.isRequired,
  web3: React.PropTypes.object.isRequired
};

export default ContractFunctions;
