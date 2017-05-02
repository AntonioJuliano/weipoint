import React from "react";
import SearchIcon from 'react-material-icons/icons/action/search';
import WhatshotIcon from 'react-material-icons/icons/social/whatshot';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import { Row, Col } from 'react-flexbox-grid';
import Autosuggest from 'react-autosuggest';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      value: '',
      autocompleteSuggestions: []
    };

    this.onChange = this.onChange.bind(this);
    this.getAutocompleteSuggestions = this.getAutocompleteSuggestions.bind(this);
    this.getInputElement = this.getInputElement.bind(this);
    this.search = this.search.bind(this);
  }

  search(value) {
    let query;
    if (value !== undefined) {
      query = value
    } else {
      query = this.state.value.trim().toLowerCase();
    }
    this.props.onSearchClicked(query);
  }

  onChange(event, { newValue, method }) {
    this.setState({ value: newValue });
  }

  async getAutocompleteSuggestions(v) {
    const value = v.value.trim().toLowerCase();

    // Use the cached value if available
    if (this.props.autocompleteStore[value]) {
      this.setState({ autocompleteSuggestions: this.props.autocompleteStore[value] });
      return;
    }

    const requestPath = `/api/v1/search/autocomplete?query=${value}`;

    try {
      const response = await fetch(requestPath);
      if (response.status !== 200) {
        throw new Error('Autocomplete fetch failed');
      }
      const json = await response.json();
      this.props.autocompleteStore[value] = json.results.map( r => r.value );
      if (this.state.value.trim().toLowerCase() === value) {
        this.setState({ autocompleteSuggestions: json.results.map( r => r.value )});
      }
    } catch (err) {
      console.error(err);
    }
  }



  render() {
    const barSize = this.props.reduced ? 5 : 8;

    const barStyle = this.props.reduced ? { marginTop: 20 } : { marginTop: 190 };
    let colStyle = { minWidth: 300, maxWidth: 550, height: 48 }

    if (!this.props.reduced) {
      colStyle.margin = 'auto';
    } else {
      colStyle.marginTop = 'auto';
      colStyle.marginBottom = 'auto';
    }

    return (
      <div className='SearchBarContainer' style={barStyle}>
        {
          !this.props.reduced &&
          <div>
            <div style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 52,
              fontFamily: "Raleway, sans-serif",
              marginBottom: 12
            }}>
              {'Weipoint'}
            </div>
            <div style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: 18,
              fontFamily: "Raleway, sans-serif",
              marginBottom: 22
            }}>
              {'Search the decentralized web'}
            </div>
          </div>
        }
        <div className="SearchTextField" style={{ marginBottom: 20 }}>
          <Row
            center={this.props.reduced ? null : 'xs'}
            style={{ display: 'flex' }}
          >
            {
              this.props.reduced &&
              <Col smOffset={1} style={{
                fontSize: 22,
                fontFamily: "Raleway, sans-serif",
                marginTop: 'auto',
                marginBottom: 'auto',
                marginRight: 12
              }}>
                {'Weipoint'}
              </Col>
            }
            <Col
              xs={barSize}
              sm={barSize - 1}
              md={barSize - 1}
              lg={barSize - 1}
              style={colStyle}
            >
              <Paper zDepth={this.state.focused ? 2 : 1}
                onMouseEnter={ e => this.setState({ focused: true })}
                onMouseLeave={ e => this.setState({ focused: false })}>
                {this.getInputElement()}
              </Paper>
            </Col>
            {
              this.props.reduced &&
              <div style={{ marginTop: 4, marginBottom: 4, marginLeft: 8 }}>
                <FloatingActionButton
                  mini={true}
                  onClick={this.search}
                  >
                  <SearchIcon />
                </FloatingActionButton>
              </div>
            }
          </Row>
        </div>
        {
          !this.props.reduced &&
          <Row center={'xs'}>
            <Col xs={5}>
              <div style={{ display: 'flex' }} className='button_container_2'>
                <div  style={{ marginLeft: 'auto', marginRight: 15 }}>
                  <FloatingActionButton
                    onClick={this.search}
                  >
                    <SearchIcon />
                  </FloatingActionButton>
                </div>
                <div style={{ marginLeft: 15, marginRight: 'auto' }}
                  className='hint--bottom-right hint--rounded'
                  aria-label='Browse All'>
                  <FloatingActionButton
                    onClick={ this.props.onBrowseClicked }
                  >
                    <WhatshotIcon />
                  </FloatingActionButton>
                </div>
              </div>
            </Col>
          </Row>
        }
      </div>
    );
  }

  getInputElement() {
    const hintText = this.props.reduced ? null : 'Search by address or term, e.g. "token"';
    const inputProps = {
      value: this.state.value,
      onChange: this.onChange
    };

    const style = {
      container: {
        position: 'relative'
      },
      input: {
        height: 48,
        width: 'calc(100% - 20px)',
        fontFamily: 'Roboto',
        fontSize: 16,
        borderStyle: 'none',
        outline: 'none',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 'auto',
        marginBottom: 'auto',
        transition: 'all 450ms',
        color: 'rgba(0, 0, 0, 0.870588)',
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none'
      },
      suggestionsContainer: {
        display: 'none'
      },
      suggestionsContainerOpen: {
        display: 'block',
        position: 'absolute',
        zIndex: 2,
        backgroundColor: '#fff',
        marginTop: 1,
        left: 0,
        right: 0
      },
      suggestion: {
        cursor: 'pointer'
      },
      suggestionHighlighted: {
        backgroundColor: '#ddd'
      }
    }

    return (
      <div
        onKeyPress={ (e) => { if (e.charCode === 13) {
          e.preventDefault();
          this.search();
        }}}
      >
        <Autosuggest
          suggestions={this.state.autocompleteSuggestions}
          onSuggestionsFetchRequested={this.getAutocompleteSuggestions}
          onSuggestionsClearRequested={
            () => this.setState({autocompleteSuggestions: []})
          }
          getSuggestionValue={ v => v }
          renderSuggestion={ (suggestion, { query }) => {
            return (
              <div
                style={{
                  width: 'calc(100% - 10px)',
                  paddingLeft: 10,
                  paddingTop: 5,
                  paddingBottom: 5
                }}
              >
                {suggestion}
              </div>
            );
          }}
          inputProps={inputProps}
          renderSuggestionsContainer={ ({ containerProps , children, query }) => {
            return (
              <div {... containerProps}>
                <Paper zDepth={1} style={{ textAlign: 'left' }}>
                    {children}
                </Paper>
              </div>
            );
          }}
          theme={style}
          onSuggestionSelected={ (event, {suggestion}) => {
            event.preventDefault();
            this.search(suggestion);
          }}
          renderInputComponent={ props => {
            return (
              <div
                style={{
                  fontSize: 16,
                  height: 48,
                  display: 'inline-block',
                  fontFamily: 'Roboto, sans-serif',
                  width: '100%',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    opacity: this.state.value === '' ? 1 : 0,
                    color: 'rgba(0, 0, 0, 0.298039)',
                    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
                    bottom: 12,
                    paddingLeft: 10
                  }}
                >
                  {hintText}
                </div>
                <input {...props} spellcheck="false" autocorrect="off" autocapitalize="off" />
              </div>
            );
          }}
        />
      </div>
    );
  }
}

SearchBar.propType = {
  onSearchClicked: React.PropTypes.func.isRequired,
  onBrowseClicked: React.PropTypes.func.isRequired,
  autocompleteStore: React.PropTypes.object.isRequired,
  reduced: React.PropTypes.bool.isRequired
};

export default SearchBar;
