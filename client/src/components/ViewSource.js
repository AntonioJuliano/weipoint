import React from "react";
import Dialog from 'material-ui/Dialog';
import brace from 'brace';
import AceEditor from 'react-ace';

require('../lib/mode-solidity.js');

import 'brace/theme/github';

class ViewSource extends React.Component {
  render() {
    return (
      <div>
        <Dialog
          actions={[]}
          modal={false}
          open={this.props.open}
          onRequestClose={this.props.close}
          autoScrollBodyContent={true}
        >
          <AceEditor
            width='500px'
            height='700px'
            mode="ace/mode/javascript"
            theme="github"
            readOnly={true}
            name="UNIQUE_ID_OF_DIV"
            value={this.props.source}
            editorProps={{$blockScrolling: true}}
          />
        </Dialog>
      </div>
    );
  }
}

export default ViewSource;
