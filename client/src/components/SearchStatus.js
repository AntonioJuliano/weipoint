import React from "react";
import {Card} from 'material-ui/Card';
import {Row} from 'react-flexbox-grid';

class SearchStatus extends React.Component {
  render() {
    return (
      <div className="SearchResultContainer" style={{ marginTop: 25, textAlign: 'left' }}>
        <Card>
          <Row center='xs'>
            <div style={{ display: 'flex', marginTop: 200, marginBottom: 200 }}>
              <div>
                {this.props.icon}
              </div>
              <div style={{ marginLeft: 20, marginTop: 'auto', marginBottom: 'auto', fontSize: 16 }}>
                {this.props.message}
              </div>
            </div>
          </Row>
        </Card>
      </div>
    );
  }
}

SearchStatus.propTypes = {
  icon: React.PropTypes.element.isRequired,
  message: React.PropTypes.string
};

export default SearchStatus;
