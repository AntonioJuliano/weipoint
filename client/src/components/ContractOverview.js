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
      <div className='functionsList'
        style={{ height: '100%', maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
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
        <Row style={{ marginTop: 10, marginBottom: 10 }}>
          <Col xs={2} xsOffset={1}>
            {'Tags: '}
          </Col>
          <Col xs={8}>
            <Tags tags={this.props.contract.tags} addTag={this.props.addTag}/>
          </Col>
        </Row>
      </div>
    );
  }
}

ContractOverview.propTypes = {
  contract: React.PropTypes.object.isRequired
}

export default ContractOverview;
