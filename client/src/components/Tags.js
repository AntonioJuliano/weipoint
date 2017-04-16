import React from "react";
import Chip from 'material-ui/Chip';
import TextField from 'material-ui/TextField';

const MAX_TAGS = 30;

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addTagValue: '',
      addTagError: ''
    };

    this.getTagElements = this.getTagElements.bind(this);
    this.getAddTagElement = this.getAddTagElement.bind(this);
    this.onAddTagChange = this.onAddTagChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  onAddTagChange(event, newValue) {
    this.setState({ addTagValue: newValue, addTagError: this.validateTag(newValue) });
  }

  getTagElements() {
    return this.props.tags.map(function(tag) {
      return (
        <Chip
          style={{ margin: 4, height: 32, marginTop: 10, marginBottom: -4 }}
          key={tag.tag + '_'}
        >
          {tag.tag}
        </Chip>
      );
    });
  }

  onKeyPress(event) {
    if (event.charCode === 13) { // enter key pressed
      event.preventDefault();
      if (this.state.addTagValue.trim() === '') {
        return;
      }
      if (this.validateTag(this.state.addTagValue) === '') {
        this.setState({ addTagValue: '' });
        this.props.addTag(this.state.addTagValue.trim());
      }
    }
  }

  getAddTagElement() {
    const hintText = this.props.tags.length === 0 ? 'Add a tag' : 'Add more';
    return <div key='add_tag'>
        <TextField
          hintText={hintText}
          onChange={this.onAddTagChange}
          value={this.state.addTagValue}
          style={{ width: 160 }}
          onKeyPress={this.onKeyPress}
          errorText={this.state.addTagError}
          />
      </div>;
  }

  validateTag(tag) {
    if (tag.length > 30) {
      return 'Too long';
    }
    if (this.props.tags.map(function(v) { return v.tag.toLowerCase(); })
        .includes(tag.toLowerCase())) {
      return 'Duplicate tag'
    }
    if (!tag.match(/^[a-zA-Z0-9_ ]*$/)) {
      return 'Invalid characters';
    }
    return '';
  }

  render() {
    const tagElements = this.getTagElements();
    if (this.props.showAddTag && this.props.tags.length < MAX_TAGS) {
      tagElements.push(this.getAddTagElement());
    }
    return (
      <div style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
        {tagElements}
      </div>
    );
  }
}

Tags.propTypes = {
  tags: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  addTag: React.PropTypes.func,
  showAddTag: React.PropTypes.bool.isRequired
};

export default Tags;
