import React from "react";
import SearchBar from './SearchBar';
import FetchContract from './FetchContract';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Route, withRouter, Switch } from 'react-router-dom';
import TagSearch from './TagSearch';
import PageNotFound from './PageNotFound';
import MarkdownRenderer from './MarkdownRenderer';
import terms from '../assets/docs/terms';
import privacy from '../assets/docs/privacy';
import About from './About';

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchStore: {},
      contractStore: {},
      autocompleteStore: {}
    };
    this.handleSearchBarClick = this.handleSearchBarClick.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
  }

  handleSearchBarClick(query) {
    if (query === '') {
      return;
    }

    if (this.props.web3.isAddress(query)) {
      this.props.history.push('/contract/' + query);
    } else {
      this.props.history.push('/search/' + query);
    }
  }

  getBodyElement() {
    const content = (
      <div>
        <Switch>
          <Route
            path='/all/:page?'
            render={() => <TagSearch
              all={true}
              searchStore={this.state.searchStore}
              contractStore={this.state.contractStore}
            />}
          />
          <Route
            path='/search/:query/:page?'
            render={() => <TagSearch
              searchStore={this.state.searchStore}
              contractStore={this.state.contractStore}
            />}
          />
          <Route
            path="/contract/:address"
            render={() => <FetchContract
              web3={this.props.web3}
              contractStore={this.state.contractStore}
            />}
          />
          <Route
            path="/terms"
            render={() => <MarkdownRenderer
              content={terms}
              title='Terms of Service'
            />}
          />
          <Route
            path="/privacy"
            render={() => <MarkdownRenderer
              content={privacy}
              title='Privacy Policy'
            />}
          />
          <Route
            path="/about"
            render={() => <About />}
          />
          <Route path="/:path" render={() => <PageNotFound />}/>
        </Switch>
      </div>
    );

    return (
      <Row center='xs'>
        <Col lg={8} md={9} sm={10} xs={12}>
          <div className="content">
            {content}
          </div>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <div className="search" style={{ minWidth: 320 }}>
        <Grid fluid={true}>
          <Row center='xs'>
            <div style={{ width: '100%'}}>
              <SearchBar
                onSearchClicked={this.handleSearchBarClick}
                onBrowseClicked={ () => this.props.history.push('/all') }
                reduced={this.props.location.pathname !== '/'}
                autocompleteStore={this.state.autocompleteStore}
              />
            </div>
          </Row>
          {this.getBodyElement()}
        </Grid>
      </div>
    );
  }
}

export default withRouter(Search);
