import React from "react";
import AceEditor from 'react-ace';
import Measure from 'react-measure';

require('../lib/mode-solidity.js');

import 'brace/theme/tomorrow';

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dimensions: {
        width: this.props.maxHeight,
        height: this.props.maxHeight
      }
    }
  }
  render() {
    const width = this.state.dimensions.width;
    const height = this.state.dimensions.height;

    return (
      <Measure
        onMeasure={(dimensions) => {
          this.setState({dimensions});
        }}
      >
        <div style={{ width:'100%', height: this.props.maxHeight, maxHeight: 'inherit' }}>
          <AceEditor
            width={width + 'px'}
            height={height + 'px'}
            mode="javascript"
            theme="tomorrow"
            readOnly={this.props.readOnly}
            name={this.props.name}
            value={this.props.value}
            onChange={this.props.onChange}
            editorProps={{$blockScrolling: true}}
            setOptions={{
              hScrollBarAlwaysVisible: false,
              vScrollBarAlwaysVisible: false
            }}
          />
        </div>
      </Measure>
    );
  }
}

export default Editor;
