import React from "react";
import {Card} from 'material-ui/Card';
import {Row, Col} from 'react-flexbox-grid';
import ErrorOutlineIcon from 'react-material-icons/icons/alert/error-outline';
import { red500 } from 'material-ui/styles/colors';

const style = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    marginTop: '100px',
    marginBottom: '100px'
  }
};

class SearchError extends React.Component {
  render() {
    return (
      <div className="SearchResultContainer" style={{ marginTop: 25, textAlign: 'left' }}>
        <Card>
          <Row center='xs'>
            <Col xs={2}>
              <div style={style}>
                <ErrorOutlineIcon color={red500} style={{ marginTop: 100, marginBottom: 100 }}/>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

export default SearchError;
