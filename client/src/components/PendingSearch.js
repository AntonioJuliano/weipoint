import React from "react";
import {Card} from 'material-ui/Card';
import '../styles/SearchResult.css';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import { Row, Col } from 'react-flexbox-grid';

const style = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    marginTop: '100px',
    marginBottom: '100px'
  },
};

class PendingSearch extends React.Component {
  render() {
    return (
      <div className="SearchResultContainer">
        <Card>
          <Row center='xs'>
            <Col xs={2}>
              <RefreshIndicator
                size={50}
                left={0}
                top={0}
                loadingColor="#FF9800"
                status="loading"
                style={style.refresh}
                />
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}

export default PendingSearch;
