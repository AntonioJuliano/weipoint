import React from "react";
import isEqual from 'lodash.isequal';
import NotFound from './NotFound';
import PendingSearch from './PendingSearch';
import SearchError from './SearchError';
import Contract from './Contract';
import { withRouter } from 'react-router-dom';
import mixpanel from '../lib/Mixpanel';

const SEARCH_STATES = {
  SEARCHING: 1,
  NOT_FOUND: 2,
  COMPLETED: 3,
  ERROR: 4
}

const initialState = {
  searchState: SEARCH_STATES.SEARCHING,
  contract: null
};

class FetchContract extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.search = this.search.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);

    mixpanel.track(
      "Contract",
      {"address": props.match.params.address.toLowerCase()}
    );
    if (props.contractStore[props.match.params.address]) {
      this.state = {
        contract: props.contractStore[props.match.params.address],
        searchState: SEARCH_STATES.COMPLETED
      };
    } else {
      this.search(props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      mixpanel.track(
        "Contract",
        {"address": this.props.match.params.address.toLowerCase()}
      );
      if (nextProps.contractStore[nextProps.match.params.address]) {
        this.setState({
          contract: nextProps.contractStore[nextProps.match.params.address],
          searchState: SEARCH_STATES.COMPLETED
        });
      } else {
        this.setState(initialState);
        this.search(nextProps);
      }
    }
  }

  async search(props) {
    const address = props.match.params.address.toLowerCase();
    const requestPath = `/api/v1/contract?address=${address}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status === 400) {
        this.setState({ searchState: SEARCH_STATES.NOT_FOUND });
        return;
      }
      if (response.status !== 200) {
        this.setState({ searchState: SEARCH_STATES.ERROR });
        return;
      }
      const json = await response.json();
      this.props.contractStore[address] = json.contract;
      this.setState({
        contract: json.contract,
        searchState: SEARCH_STATES.COMPLETED
      });
    } catch (e) {
      this.setState({ searchState: SEARCH_STATES.ERROR });
    }
  }

  getBodyElement() {
    switch(this.state.searchState) {
      case SEARCH_STATES.SEARCHING:
        return <PendingSearch />;
      case SEARCH_STATES.NOT_FOUND:
        return <NotFound
            query={this.props.match.params.address}
          />;
      case SEARCH_STATES.ERROR:
        return <SearchError />;
      case SEARCH_STATES.COMPLETED:
        return <Contract
            contract={this.state.contract}
            web3={this.props.web3}
            contractStore={this.props.contractStore}
          />
      default:
        // Shouldn't get here
        return null;
    }
  }

  render() {
    return this.getBodyElement();
  }
}

FetchContract.propTypes = {
  web3: React.PropTypes.object.isRequired,
  contractStore: React.PropTypes.object.isRequired
}

export default withRouter(FetchContract);
