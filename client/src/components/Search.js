import React from "react";
import SearchBar from './SearchBar';
import Contract from './Contract';
import PendingSearch from './PendingSearch';
import SearchError from './SearchError';
import NotFound from './NotFound';
import SearchResults from './SearchResults';
import { Grid, Row, Col } from 'react-flexbox-grid';

// The maximum number of results to be fetched from server
const PAGE_SIZE = 10;

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchedValue: '',
      value: '',
      error: null,
      contract: null,
      searchState: 'initialized',
      searchResults: null,
      searchIndex: 0,
      totalResults: 0,
      showBack: false
    };
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
    this.handleSearchBarClick = this.handleSearchBarClick.bind(this);
    this.searchByTags = this.searchByTags.bind(this);
    this.searchByAddress = this.searchByAddress.bind(this);
    this.searchResultClicked = this.searchResultClicked.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
    this.getNextPage = this.getNextPage.bind(this);
    this.getPreviousPage = this.getPreviousPage.bind(this);
    this.backToResults = this.backToResults.bind(this);
  }

  handleSearchBarChange(e) {
    const value = e.target.value.trim();
    this.setState({ value: value });
  }

  async handleSearchBarClick() {
    const value = this.state.value;

    if (value === '') {
      return;
    }

    if (this.props.web3.isAddress(value)) {
      this.searchByAddress(value);
    } else {
      this.searchByTags(value);
    }
  }

  async searchByTags(query, index) {
    if (!index) {
      index = 0;
    }
    this.setState({
      searchState: 'searching',
      searchedValue: query,
      searchIndex: index
    });

    const requestPath = `/api/v1/search?query=${query}&index=${index}&size=${PAGE_SIZE}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status !== 200) {
        this.setState({ searchState: 'error' });
        return;
      }
      const json = await response.json();

      if (json.results.length > 0) {
        this.setState({
          searchResults: json.results,
          totalResults: json.total,
          searchState: 'completed'
        });
      } else {
        this.setState({
          searchState: 'notFound'
        });
      }
    } catch (e) {
      this.setState({ searchState: 'error' });
    }
  }

  async searchByAddress(address) {
    this.setState({ searchState: 'searching', searchedValue: address });

    const requestPath = `/api/v1/contract?address=${address}`;

    try {
      const response = await fetch(requestPath, { method: 'get' });
      if (response.status !== 200) {
        this.setState({ searchState: 'error' });
        return;
      }
      const json = await response.json();
      this.setState({
        contract: json.contract,
        searchState: 'contract',
        showBack: false
      });
    } catch (e) {
      this.setState({ searchState: 'error' });
    }
  }

  getNextPage() {
    return this.searchByTags(this.state.searchedValue, this.state.searchIndex + PAGE_SIZE);
  }

  getPreviousPage() {
    return this.searchByTags(this.state.searchedValue, this.state.searchIndex - PAGE_SIZE);
  }

  backToResults() {
    this.setState({ searchState: 'completed' });
  }

  searchResultClicked(address) {
    const contract = this.state.searchResults.find( e => e.address === address );
    this.setState({
      searchState: 'contract',
      contract: contract,
      showBack: true
    });
  }

  getBodyElement() {
    let content = null;
    switch (this.state.searchState) {
      case 'initialized':
        return null;
      case 'searching':
        content = <PendingSearch />;
        break;
      case 'error':
        content = <SearchError />;
        break;
      case 'completed':
        content = (
          <SearchResults
            results={this.state.searchResults}
            onResultClicked={this.searchResultClicked}
            onNextPage={this.getNextPage}
            onPreviousPage={this.getPreviousPage}
            total={this.state.totalResults}
            index={this.state.searchIndex}
          />
        );
        break;
      case 'contract':
        content = (
          <Contract
            contract={this.state.contract}
            web3={this.props.web3}
            back={this.state.showBack ? this.backToResults : null}
          />
        );
        break;
      case 'notFound':
        content = <NotFound query={this.state.searchedValue}/>;
        break;
      default:
        // Shouldn't get here
        return null;
    }
    return (
      <Row center='xs'>
        <Col md={8} xs={11}>
          <div className="content">
            {content}
          </div>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <div className="search" style={{ minWidth: 600 }}>
        <Grid fluid={true}>
          <Row center='xs'>
            <Col xs={11}>
              <SearchBar
                onChange={this.handleSearchBarChange}
                onSearchClicked={this.handleSearchBarClick}
                onBrowseClicked={ () => this.searchByTags('') }
                reduced={this.state.searchState !== 'initialized'}
              />
            </Col>
          </Row>
          {this.getBodyElement()}
        </Grid>
      </div>
    );
  }
}

export default Search;
