var hljs = require('highlight.js/lib/highlight');
var React = require('react');
var ReactDOM = require('react-dom');
import '../styles/darcula.css';
var hljsDefineSolidity = require('highlightjs-solidity');


class Highlight extends React.Component {
  constructor(props) {
    super(props);
    hljsDefineSolidity(hljs);
  }

  handleChange = (e) => {
    console.log("changed");
      this.props.handleChange(e.target.value);
  }

  componentDidMount() {
    this.highlightCode();
  }

  componentDidUpdate() {
    this.highlightCode();
  }

  highlightCode() {
    console.log('highlighting');
    var domNode = ReactDOM.findDOMNode(this);
    var nodes = domNode.querySelectorAll('pre code');
    if (nodes.length > 0) {
        for (var i = 0; i < nodes.length; i++) {
          console.log('node: ' + nodes[i]);
            // hljs.highlightBlock(nodes[i]);
        }
    }
  }

  render() {
      return (
        <pre><code className='solidity'>

        </code></pre>
    );
  }
}

module.exports = Highlight;
