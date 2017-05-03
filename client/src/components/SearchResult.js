import React from "react";
import {Card, CardTitle, CardText} from 'material-ui/Card';
import AssignmentIcon from 'react-material-icons/icons/action/assignment';
import VerifiedUserIcon from 'react-material-icons/icons/action/verified-user';
import LanguageIcon from 'react-material-icons/icons/action/language';
import Tags from './Tags';
import { green600, blue700 } from 'material-ui/styles/colors';
import { withRouter } from 'react-router-dom';

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

      if (this.props.link) {
        badges.push(
          <span
            className="hint--bottom-right hint--rounded"
            aria-label="Has Website"
            style={{ width: 24, height: 24, marginLeft: 10}}
            key='hasWebsite'
            >
            <LanguageIcon color={blue700}/>
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
    const titleStyle = this.state.focused ? { color: '#0060fc' } : {};
    titleStyle.wordWrap = 'break-word';

    return (
      <div
        style={{ marginTop: 10, textAlign: 'left', marginBottom: 10, cursor: 'pointer' }}
        onMouseEnter={ e => this.setState({ focused: true })}
        onMouseLeave={ e => this.setState({ focused: false })}
        onClick={ e => this.props.history.push('/contract/' + this.props.address) }
      >
        <Card>
          <CardTitle
            title={this.props.name || 'Contract'}
            subtitle={this.props.address}
            titleStyle={titleStyle}
            subtitleStyle={{ wordWrap: 'break-word' }}
          />
          <CardText style={{paddingTop: 0}}>
            {
              this.props.description &&
              <div
                style={{
                  wordWrap: 'break-word',
                  fontSize: 14,
                  fontStyle: 'italic',
                  marginLeft: 20,
                  marginBottom: 10
                }}>
                {this.props.description}
              </div>
            }
            {
              this.props.link &&
              <div
                style={{
                  wordWrap: 'break-word',
                  fontSize: 14,
                  fontStyle: 'italic',
                  marginLeft: 20,
                  marginBottom: 10
                }}>
                <a href={this.props.link} target='_blank'>
                  {this.props.link}
                </a>
              </div>
            }
            <div style={{ maxHeight: 115, height: 'auto', overflowY: 'auto', paddingBottom: 5 }}>
              <Tags
                tags={this.props.tags}
                showAddTag={false}
              />
            </div>
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
  description: React.PropTypes.node,
  link: React.PropTypes.node,
  contract: React.PropTypes.object
};

export default withRouter(SearchResult);
