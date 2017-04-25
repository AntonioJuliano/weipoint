import React from "react";
import SearchResult from './SearchResult';
import { grey700 } from 'material-ui/styles/colors';
import KeyboardArrowRightIcon from 'react-material-icons/icons/hardware/keyboard-arrow-right';
import KeyboardArrowLeftIcon from 'react-material-icons/icons/hardware/keyboard-arrow-left';
import FlatButton from 'material-ui/FlatButton';

class SearchResults extends React.Component {
  constructor(props) {
    super(props);

    this.getResultElements = this.getResultElements.bind(this);
    this.getTotalResultsElement = this.getTotalResultsElement.bind(this);
    this.getPagingElement = this.getPagingElement.bind(this);
  }

  getResultElements() {
    return this.props.results.map( r => <SearchResult
        address={r.address}
        name={r.name}
        tags={r.tags}
        key={r.address}
        description={r.description}
        link={r.link}
        onClick={this.props.onResultClicked}
        contract={r.type === 'contract' ? r : null}
        />
    );
  }

  getTotalResultsElement() {
    const first = this.props.index + 1;
    const last = this.props.index + this.props.results.length;
    const total = this.props.total;

    return (
      <div style={{
          color: grey700,
          fontSize: 12,
          fontStyle: 'italic',
          textAlign: 'left',
          marginBottom: 10
      }}>
        {'Results ' + first + ' - ' + last + ' of ' + total}
      </div>
    );
  }

  getPagingElement() {
    const showPrevious = this.props.index > 0;
    const showNext = this.props.index + this.props.results.length < this.props.total;

    let previousStyle = { marginLeft: 'auto' };
    let nextStyle = { marginRight: 'auto' };
    if (showPrevious && !showNext) {
      previousStyle.marginRight = 'auto';
    }
    if (!showPrevious && showNext) {
      nextStyle.marginLeft = 'auto';
    }

    return (
      <div
        className='navigation'
        style={{
          display: 'flex',
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 'auto',
          marginRight: 'auto',
          width: 'auto'
        }}
      >
        {
          showPrevious &&
          <FlatButton
            label="Previous"
            labelPosition="after"
            icon={<KeyboardArrowLeftIcon />}
            style={previousStyle}
            onTouchTap={this.props.onPreviousPage}
          />
        }
        {
          showNext &&
          <FlatButton
            label="Next"
            labelPosition="before"
            icon={<KeyboardArrowRightIcon />}
            style={nextStyle}
            onTouchTap={this.props.onNextPage}
          />
        }
      </div>
    );
  }

  render() {
    return (
      <div className='searchResults'>
        {this.getTotalResultsElement()}
        {this.getResultElements()}
        {this.getPagingElement()}
      </div>
    );
  }
}

SearchResults.propTypes = {
  results: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  onNextPage: React.PropTypes.func.isRequired,
  onPreviousPage: React.PropTypes.func.isRequired,
  total: React.PropTypes.number,
  index: React.PropTypes.number,
};

export default SearchResults;
