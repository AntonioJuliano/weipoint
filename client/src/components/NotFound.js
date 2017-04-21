import React from "react";
import ReportProblemIcon from 'react-material-icons/icons/action/report-problem';
import { yellow700 } from 'material-ui/styles/colors';
import SearchStatus from './SearchStatus';

class SearchError extends React.Component {
  render() {
    return (
      <SearchStatus
        icon={
          <ReportProblemIcon color={yellow700} style={{
            width: 48,
            height: 48
          }}/>
        }
        message={'No results found matching: "' + this.props.query + '"'}
      />
    );
  }
}

SearchError.propTypes = {
  query: React.PropTypes.string.isRequired
}

export default SearchError;
