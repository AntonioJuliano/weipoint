/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import '../styles/Search.css';
import SearchBar from './SearchBar';
import SearchResult from './SearchResult';
import PendingSearch from './PendingSearch';
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

    handleSearchBarClick(e) {
        const value = this.state.value;

        const thisRef = this;

        if (this.props.web3.isAddress(value)) {
          this.setState({ searchState: 'searching' });

          const requestPath = `/api/v1/contract?address=${value}`;
          fetch(requestPath, {method: 'get'}).then(function(response) {
                  if (response.status !== 200) {
                      throw Error("Search request to server failed");
                  }
                  return response.json();
              }
          ).then(function(json) {
                  thisRef.setState({
                      contract: json,
                      searchState: 'completed'
                  })
              }
          ).catch(function(error) {
              console.error(error);
          });
        }
    }

    render() {
        return (
            <div className="search">
                <Grid fluid={true}>
                    <Row center='xs'>
                        <Col xs={10}>
                            <SearchBar
                                onChange={this.handleSearchBarChange}
                                onClick={this.handleSearchBarClick}
                                reduced={this.state.searchState !== 'initialized'}
                                />
                        </Col>
                    </Row>
                    { (this.state.searchState === 'searching') &&
                      <Row center='xs'>
                        <Col md={8} xs={10}>
                          <div className="SearchResults">
                            <PendingSearch />
                          </div>
                        </Col>
                      </Row>
                    }
                    { (this.state.searchState === 'completed') &&
                      <Row center='xs'>
                        <Col md={8} xs={10}>
                          <div className="SearchResults">
                            <SearchResult
                              contract={this.state.contract}
                              />
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
