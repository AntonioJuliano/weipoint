import React from "react";
import ErrorOutlineIcon from 'react-material-icons/icons/alert/error-outline';
import { red500 } from 'material-ui/styles/colors';
import SearchStatus from './SearchStatus';

class SearchError extends React.Component {
  render() {
    return (
      <SearchStatus
        icon={
          <ErrorOutlineIcon color={red500} style={{ marginTop: 100, marginBottom: 100 }}/>
        }
        message='We were unable to fetch your results. Please try again later.'
      />
    );
  }
}

export default SearchError;
