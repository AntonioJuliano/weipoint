import React from "react";
import TextField from 'material-ui/TextField';
import '../styles/SearchBar.css';
import SearchIcon from 'react-material-icons/icons/action/search';
import FaceIcon from 'react-material-icons/icons/action/face';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { Row, Col } from 'react-flexbox-grid';

class SearchBar extends React.Component {
  render() {
    return (
      <div className={ this.props.reduced ? 'SearchBarContainerReduced' : 'SearchBarContainer' }>
        <div className="SearchTextField">
          <Row
            center={this.props.reduced ? false : 'xs'}>
            <Col xs={this.props.reduced ? 6 : 7} md={this.props.reduced ? 5 : 6}>
              <Paper zDepth={2}>
                <TextField
                  id='searchTextField'
                  onChange={this.props.onChange}
                  underlineShow={false}
                  style={{marginLeft: "10px", marginRight: "0px", width: "95%"}}
                  />
              </Paper>
            </Col>
            {
              this.props.reduced &&
              <Col xs={1}>
                <div style={{marginTop: "4px", marginBottom: "4px"}}>
                  <FloatingActionButton
                    mini={true}>
                    <SearchIcon
                      onClick={this.props.onClick}
                      />
                  </FloatingActionButton>
                </div>
              </Col>
            }
          </Row>
        </div>
        {
          !this.props.reduced &&
          <Row center={'xs'}>
            <Col xs={1} style={{marginRight: "8px"}}>
              <FloatingActionButton>
                <SearchIcon
                  onClick={this.props.onClick}
                  />
              </FloatingActionButton>
            </Col>
            <Col xs={1} style={{marginLeft: "8px"}}>
              <FloatingActionButton>
                <FaceIcon />
              </FloatingActionButton>
            </Col>
          </Row>
        }
      </div>
    );
  }
}

export default SearchBar;
