import React from "react";
import { Row, Col } from 'react-flexbox-grid';
import CopyButton from './CopyButton';
import Tags from './Tags';

class ContractOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div className='functionsList'>
        <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
          <Col xs={10}>
            {'OVERVIEW!!'}
          </Col>
        </Row>
        <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
          <Col xs={10}>
            <CopyButton
              label='Copy Bytecode'
              copyValue={this.props.contract.code}
              />
          </Col>
        </Row>
        <div style={{ display: 'flex' }}>
          <Col xs={1} xsOffset={1} style={{ fontSize: 16, marginTop: 15 }}>
              {'Tags: '}
          </Col>
          <Col xs={9}>
            <Tags tags={this.props.contract.tags} addTag={this.props.addTag}/>
          </Col>
        </div>
      </div>
    );
  }
}

ContractOverview.propTypes = {
  contract: React.PropTypes.object.isRequired,
  addTag: React.PropTypes.func.isRequired
}

export default ContractOverview;
