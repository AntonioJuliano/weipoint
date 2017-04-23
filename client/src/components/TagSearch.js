import React from "react";
import isEqual from 'lodash.isequal';
import NotFound from './NotFound';
import PendingSearch from './PendingSearch';
import SearchError from './SearchError';
import SearchResults from './SearchResults';
import { withRouter } from 'react-router-dom';
import mixpanel from '../lib/Mixpanel';

// The maximum number of results to be fetched from server
const PAGE_SIZE = 10;

const SEARCH_STATES = {
  SEARCHING: 1,
  NOT_FOUND: 2,
  COMPLETED: 3,
  ERROR: 4
}

const initialState = {
  searchState: SEARCH_STATES.SEARCHING,
  totalResults: null,
  results: null
};

class TagSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.search = this.search.bind(this);
    this.gotoNextPage = this.gotoNextPage.bind(this);
    this.gotoPreviousPage = this.gotoPreviousPage.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);

    // Use the cached results
    const query = props.match.params.query || '';
    const index = this.getIndex(props);
    if (props.searchStore[query] && props.searchStore[query][index]) {
      this.state = {
        results: props.searchStore[query][index].results,
        totalResults: props.searchStore[query][index].total,
        searchState: SEARCH_STATES.COMPLETED
      };
    } else {
      this.search(props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps, this.props)) {
      const query = nextProps.match.params.query || '';
      const index = this.getIndex(nextProps);
      if (nextProps.searchStore[query] && nextProps.searchStore[query][index]) {
        this.setState({
          results: nextProps.searchStore[query][index].results,
          totalResults: nextProps.searchStore[query][index].total,
          searchState: SEARCH_STATES.COMPLETED
        });
      } else {
        this.setState(initialState);
        this.search(nextProps);
      }
    }
  }

  gotoNextPage() {
    const query = this.props.match.params.query;
    const index = this.props.match.params.page ? parseInt(this.props.match.params.page, 10) : 0;
    if (this.props.all) {
      this.props.history.push('/all/' + (index + 1));
    } else {
      this.props.history.push('/search/' + query + '/' + (index + 1));
    }
  }

  gotoPreviousPage() {
    const query = this.props.match.params.query;
    const index = this.props.match.params.page ? parseInt(this.props.match.params.page, 10) : 0;
    if (this.props.all) {
      this.props.history.push('/all/' + (index - 1));
    } else {
      this.props.history.push('/search/' + query + '/' + (index - 1));
    }
  }

  getIndex(props) {
    return props.match.params.page ? parseInt(props.match.params.page, 10) * PAGE_SIZE : 0;
  }

  async search(props) {
    const query = props.match.params.query || '';
    const index = this.getIndex(props);

    const requestPath = `/api/v1/search?query=${query}&index=${index}&size=${PAGE_SIZE}`;

    mixpanel.track(
      "Search",
      {"query": query}
    );

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status !== 200) {
        this.setState({ searchState: 'error' });
        return;
      }
      const json = await response.json();

      if (json.results.length > 0) {
        // Cache results
        if(!this.props.searchStore[query]) {
          this.props.searchStore[query] = {};
        }
        this.props.searchStore[query][index] = {
          results: json.results,
          total: json.total
        }
        // Cache contracts
        json.results.forEach( r => {
          if (!this.props.contractStore[r.address]) {
            this.props.contractStore[r.address] = r;
          }
        });
        this.setState({
          results: json.results,
          totalResults: json.total,
          searchState: SEARCH_STATES.COMPLETED
        });
      } else {
        this.setState({
          searchState: SEARCH_STATES.NOT_FOUND
        });
      }
    } catch (e) {
      console.error(e)
      this.setState({ searchState: SEARCH_STATES.ERROR });
    }
  }

  getBodyElement() {
    switch(this.state.searchState) {
      case SEARCH_STATES.SEARCHING:
        return <PendingSearch />;
      case SEARCH_STATES.NOT_FOUND:
        return <NotFound
            query={this.props.match.params.query}
          />;
      case SEARCH_STATES.ERROR:
        return <SearchError />;
      case SEARCH_STATES.COMPLETED:
        return <SearchResults
            results={this.state.results}
            onNextPage={this.gotoNextPage}
            onPreviousPage={this.gotoPreviousPage}
            total={this.state.totalResults}
            index={this.getIndex(this.props)}
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

TagSearch.propTypes = {
  searchStore: React.PropTypes.object.isRequired,
  contractStore: React.PropTypes.object.isRequired,
}

export default withRouter(TagSearch);
