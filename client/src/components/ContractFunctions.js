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
    this.metamaskMissing = this.metamaskMissing.bind(this);
    this.setActive = this.setActive.bind(this);
    this.mapFunctionToElement = this.mapFunctionToElement.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ active: null });
  }

  mapFunctionToElement(value, i) {
    return <div
      key={value.name + i}
      style={{ width: '90%', margin: 'auto' }}
      onClick={ e => this.setActive(i) }
      >
      <Divider />
      <ContractFunction
        contractAbi={this.props.contractAbi}
        abi={value}
        address={this.props.address}
        active={i === this.state.active}
        web3={this.props.web3}
        storedContract={this.props.storedContract}
        />
    </div>;
  }

  getFunctionElements() {
    return this.props.functions.map( (v, i) => this.mapFunctionToElement(v, i));
  }

  setActive(i) {
    if (this.state.active !== i
      && (!this.props.functions[i].constant || this.props.functions[i].inputs.length !== 0)) {
      this.setState({ active: i });
    }
  }

  metamaskMissing() {
    if (this.props.type === 'STATE_CHANGING' && !this.props.web3.isConnected()) {
      return <Row center='xs' style={{ marginBottom: 20, fontStyle: 'italic' }}>
        <Col xs={8}>
          {'An Ethereum wallet is reqired to interact with this contract.'
            + 'We recommend Metamask, which you can download for chrome '}
          <a href='https://metamask.io/' target='_blank'>
            {'here'}
          </a>
        </Col>
      </Row>
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
      <div className='functionsList'>
        <Row style={{ marginTop: 10, marginBottom: 25 }} center='xs'>
          <Col xs={10}>
            {this.props.intro}
          </Col>
        </Row>
        {this.metamaskMissing()}
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
  web3: React.PropTypes.object.isRequired,
  type: React.PropTypes.string,
  storedContract: React.PropTypes.object
};

export default ContractFunctions;
