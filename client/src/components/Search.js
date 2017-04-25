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
      value: '',
      searchStore: {},
      contractStore: {}
    };
    this.handleSearchBarChange = this.handleSearchBarChange.bind(this);
    this.handleSearchBarClick = this.handleSearchBarClick.bind(this);
    this.getBodyElement = this.getBodyElement.bind(this);
  }

  handleSearchBarChange(e) {
    const value = e.target.value.trim();
    this.setState({ value: value });
  }

  handleSearchBarClick() {
    const value = this.state.value;

    if (value === '') {
      return;
    }

    if (this.props.web3.isAddress(value)) {
      this.props.history.push('/contract/' + value);
    } else {
      this.props.history.push('/search/' + value);
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
        <Col md={8} sm={9} xs={11}>
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
            <div style={{ width: '100%'}}>
              <SearchBar
                onChange={this.handleSearchBarChange}
                onSearchClicked={this.handleSearchBarClick}
                onBrowseClicked={ () => this.props.history.push('/all') }
                reduced={this.props.location.pathname !== '/'}
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
