import React from "react";
import { Row, Col } from 'react-flexbox-grid';
import Tags from './Tags';
import EditableField from './EditableField';
import Divider from 'material-ui/Divider';

class ContractOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  validateDescription(value) {
    if (value.length > 100) {
      return 'Too long';
    }
    return '';
  }

  validateLink(value) {
    if (!value.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      return 'Invalid link';
    }
    return '';
  }

  render() {
    const headerStyle = {
      marginTop: 10,
      fontSize: 18,
      color: '#616161',
      marginBottom: 10,
      marginLeft: -10
    };

    const linkValue = this.props.contract.link ?
      <a href={this.props.contract.link} target='_blank'>{this.props.contract.link}</a> : null;
    return (
      <div className='content'>
        <Row style={{ marginBottom: 10 }} center='xs'>
          <Col xs={10} style={{ textAlign: 'left' }}>
            <div style={headerStyle}>
              {'Description'}
            </div>
            <EditableField
              value={this.props.contract.description}
              add={ v => this.props.addMetadata({ description: v }) }
              showAdd={true}
              defaultValue={'No Description Added'}
              autoAcceptFirst={true}
              validate={this.validateDescription}
              />
          </Col>
        </Row>
        <Divider style={{ marginLeft: 'auto', marginRight: 'auto', width: '90%'}}/>
        <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
          <Col xs={10} style={{ textAlign: 'left' }}>
            <div style={headerStyle}>
              {'Links'}
            </div>
            <div style={{ marginTop: 10, marginBottom: 10, display: 'flex' }}>
              <EditableField
                value={linkValue}
                add={ v => this.props.addMetadata({ link: v }) }
                showAdd={true}
                defaultValue={'No Official Site Added'}
                autoAcceptFirst={false}
                validate={this.validateLink}
                />
            </div>
            <div style={{ marginTop: 10, marginBottom: 10, fontSize: 14 }}>
              {'View on '}
              <a
                href={'https://etherscan.io/address/' + this.props.contract.address}
                target='_blank'
              >
                {'Etherscan'}
              </a>
            </div>
          </Col>
        </Row>
        <Divider style={{ marginLeft: 'auto', marginRight: 'auto', width: '90%'}}/>
        <Row style={{ marginTop: 10, marginBottom: 10 }} center='xs'>
          <Col xs={10} style={{ textAlign: 'left' }}>
            <div style={headerStyle}>
              {'Tags'}
            </div>
            <Tags
              tags={this.props.contract.tags}
              addTag={ v => this.props.addMetadata({ tags: [v] }) }
              showAddTag={true}/>
          </Col>
        </Row>
      </div>
    );
  }
}

ContractOverview.propTypes = {
  contract: React.PropTypes.object.isRequired,
  addMetadata: React.PropTypes.func.isRequired,
}

export default ContractOverview;
