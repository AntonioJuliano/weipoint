import React from "react";
import {Card, CardTitle, CardText} from 'material-ui/Card';
import AssignmentIcon from 'react-material-icons/icons/action/assignment';
import VerifiedUserIcon from 'react-material-icons/icons/action/verified-user';
import Tags from './Tags';
import { green600 } from 'material-ui/styles/colors';

class SearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false
    }

    this.getBadges = this.getBadges.bind(this);
  }

  getBadges() {
    let badges = [];

    if (this.props.contract) {
      badges.push(
        <span
          className="hint--bottom-right hint--rounded"
          aria-label="Ethereum Contract"
          style={{ width: 24, height: 24}}
          key='ethereumContract'
          >
          <AssignmentIcon />
        </span>
      );

      if (this.props.contract.source) {
        badges.push(
          <span
            className="hint--bottom-right hint--rounded"
            aria-label="Source Code Verified"
            style={{ width: 24, height: 24, marginLeft: 10}}
            key='sourceVerified'
            >
            <VerifiedUserIcon color={green600}/>
          </span>
        );
      }
    }

    if (badges.length > 0) {
      return (
        <div className='badges' style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginTop: 18,
            marginBottom: -10,
            marginLeft: 5
          }}>
          {badges}
        </div>
      );
    }

    return null;
  }

  render() {
    const titleStyle = this.state.focused ? { color: '#1c6ced' } : {};

    return (
      <div
        style={{ marginTop: 10, textAlign: 'left', cursor: 'pointer', marginBottom: 10 }}
        onMouseEnter={ e => this.setState({ focused: true })}
        onMouseLeave={ e => this.setState({ focused: false })}
        onClick={ e => this.props.onClick(this.props.address)}
        >
        <Card>
          <CardTitle
            title={this.props.name || 'Contract'}
            subtitle={this.props.address}
            titleStyle={titleStyle}>
          </CardTitle>
          <CardText style={{paddingTop: 0}}>
            <Tags
              tags={this.props.tags}
              showAddTag={false}/>
            {this.getBadges()}
          </CardText>
        </Card>
      </div>
    );
  }
}

SearchResult.propTypes = {
  address: React.PropTypes.string.isRequired,
  name: React.PropTypes.string,
  tags: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  onClick: React.PropTypes.func.isRequired,
  contract: React.PropTypes.object
};

export default SearchResult;
