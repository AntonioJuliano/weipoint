import React from "react";
import SearchResult from './SearchResult';

class SearchResults extends React.Component {
  constructor(props) {
    super(props);

    this.getResultElements = this.getResultElements.bind(this);
  }

  getResultElements() {
    return this.props.results.map( r => <SearchResult
        address={r.address}
        name={r.name}
        tags={r.tags}
        key={r.address}
        onClick={this.props.onResultClicked}
        contract={r.type === 'contract' ? r : null}
        />
    );
  }

  render() {
    return (
      <div>
        {this.getResultElements()}
      </div>
    );
  }
}

SearchResults.propTypes = {
  results: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  onResultClicked: React.PropTypes.func.isRequired
};

export default SearchResults;
