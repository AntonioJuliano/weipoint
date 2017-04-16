import React from "react";
import RefreshIndicator from 'material-ui/RefreshIndicator';
import SearchStatus from './SearchStatus';
const style = {
  refresh: {
    display: 'inline-block',
    position: 'relative',
    marginTop: '100px',
    marginBottom: '100px'
  }
};

class PendingSearch extends React.Component {
  render() {
    return (
      <SearchStatus
        icon={
          <RefreshIndicator
            size={50}
            left={0}
            top={0}
            loadingColor="#FF9800"
            status="loading"
            style={style.refresh}
          />}
      />
    );
  }
}

export default PendingSearch;
