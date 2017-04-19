import React from "react";
import TextField from 'material-ui/TextField';
import SearchIcon from 'react-material-icons/icons/action/search';
import WhatshotIcon from 'react-material-icons/icons/social/whatshot';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { Row, Col } from 'react-flexbox-grid';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false
    };
  }

  render() {
    const barSize = this.props.reduced ? 6 : 7;

    const barStyle = this.props.reduced ? { marginTop: 40 } : { marginTop: 180 };
    const colStyle = this.props.reduced ? {} : { maxWidth: 550, margin: 'auto' };

    return (
      <div className='SearchBarContainer' style={barStyle}>
        {
          !this.props.reduced &&
          <div>
            <div style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 52,
              fontFamily: "Bitter, serif",
              marginBottom: 12
            }}>
              {'Weipoint'}
            </div>
            <div style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 18,
              fontFamily: "Bitter, serif",
              marginBottom: 28
            }}>
              {'Search the decentralized web'}
            </div>
          </div>
        }
        <div className="SearchTextField" style={{ marginBottom: 20 }}>
          <Row
            center={this.props.reduced ? null : 'xs'}>
            <Col
              xs={barSize}
              md={barSize - 1}
              lg={barSize - 2}
              style={colStyle}
              xsOffset={this.props.reduced ? 1 : 0}>
              <Paper zDepth={this.state.focused ? 2 : 1}
                onMouseEnter={ e => this.setState({ focused: true })}
                onMouseLeave={ e => this.setState({ focused: false })}>
                <div style={{ marginRight: 10, marginLeft: 10, width: "auto" }}>
                  <TextField
                    id='searchTextField'
                    onChange={this.props.onChange}
                    onKeyPress={ (e) => { if (e.charCode === 13) {
                      e.preventDefault();
                      this.props.onSearchClicked();
                    }}}
                    underlineShow={false}
                    fullWidth={true}
                    spellCheck={false}
                    />
                </div>
              </Paper>
            </Col>
            {
              this.props.reduced &&
              <div style={{ marginTop: 4, marginBottom: 4, marginLeft: 8 }}>
                <FloatingActionButton
                  mini={true}
                  onClick={this.props.onSearchClicked}
                  >
                  <SearchIcon />
                </FloatingActionButton>
              </div>
            }
          </Row>
        </div>
        {
          !this.props.reduced &&
          <Row center={'xs'}>
            <Col xs={5}>
              <div style={{ display: 'flex' }} className='button_container_2'>
                <div  style={{ marginLeft: 'auto', marginRight: 15 }}>
                  <FloatingActionButton
                    onClick={this.props.onSearchClicked}>
                      <SearchIcon />
                  </FloatingActionButton>
                </div>
                <div style={{ marginLeft: 15, marginRight: 'auto' }}
                  className='hint--bottom-right hint--rounded'
                  aria-label='Browse Most Popular'>
                  <FloatingActionButton
                    onClick={this.props.onBrowseClicked}
                    >
                      <WhatshotIcon />
                  </FloatingActionButton>
                </div>
              </div>
            </Col>
          </Row>
        }
      </div>
    );
  }
}

SearchBar.propType = {
  onChange: React.PropTypes.func.isRequired,
  onSearchClicked: React.PropTypes.func.isRequired,
  onBrowseClicked: React.PropTypes.func.isRequired
};

export default SearchBar;
