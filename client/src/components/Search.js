import React from "react";
import SearchBar from './SearchBar';
import Contract from './Contract';
import PendingSearch from './PendingSearch';
import SearchError from './SearchError';
import { Grid, Row, Col } from 'react-flexbox-grid';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        value: '',
        error: null,
        contract: null,
        searchState: 'initialized'
    };
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
    this.handleSearchBarClick = this.handleSearchBarClick.bind(this);
  }

  handleSearchBarChange(e) {
    const value = e.target.value.trim();
    this.setState({ value: value });
  }

  async handleSearchBarClick(e) {
    const value = this.state.value;

    if (this.props.web3.isAddress(value)) {
      this.setState({ searchState: 'searching' });

      const requestPath = `/api/v1/contract?address=${value}`;
      const response = await fetch(requestPath, {method: 'get'});
      if (response.status !== 200) {
        this.setState({ searchState: 'error' });
        return;
      }
      const json = await response.json();
      this.setState({
        contract: json,
        searchState: 'completed'
      });
    }
  }

  render() {
    return (
      <div className="search" style={{ minWidth: 600 }}>
        <Grid fluid={true}>
          <Row center='xs'>
            <Col xs={11}>
              <SearchBar
                onChange={this.handleSearchBarChange}
                onClick={this.handleSearchBarClick}
                reduced={this.state.searchState !== 'initialized'}
                />
            </Col>
          </Row>
          { (this.state.searchState === 'searching') &&
            <Row center='xs'>
              <Col md={8} xs={11}>
                <div className="SearchResults">
                  <PendingSearch />
                </div>
              </Col>
            </Row>
          }
          { (this.state.searchState === 'completed') &&
            <Row center='xs'>
              <Col md={8} xs={11}>
                <div className="SearchResults">
                  <Contract
                    contract={this.state.contract}
                    web3={this.props.web3}
                    />
                </div>
              </Col>
            </Row>
          }
          { (this.state.searchState === 'error') &&
            <Row center='xs'>
              <Col md={8} xs={11}>
                <div className="SearchResults">
                  <SearchError />
                </div>
              </Col>
            </Row>
          }
        </Grid>
      </div>
    );
  }
}

export default Search;
