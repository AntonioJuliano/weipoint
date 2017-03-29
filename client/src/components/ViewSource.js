import React from "react";
import Dialog from 'material-ui/Dialog';
import Editor from './Editor';

require('../lib/mode-solidity.js');

import 'brace/theme/tomorrow';

class ViewSource extends React.Component {
  render() {
    return (
      <Dialog
        actions={[]}
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.close}
        bodyStyle={{
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: 'hidden',
          maxHeight: 800
        }}
      >
        <Editor
          readOnly={true}
          name='viewSource'
          value={this.props.source}
          maxHeight={800}
        />
      </Dialog>
    );
  }
}

export default ViewSource;
