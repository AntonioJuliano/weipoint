import React from "react";
import FeedbackIcon from 'react-material-icons/icons/action/feedback';
import { yellow700 } from 'material-ui/styles/colors';
import SearchStatus from './SearchStatus';

class PageNotFound extends React.Component {
  render() {
    return (
      <SearchStatus
        icon={
          <FeedbackIcon color={yellow700} style={{
            width: 48,
            height: 48
          }}/>
        }
        message={'Page not found'}
      />
    );
  }
}

export default PageNotFound;
