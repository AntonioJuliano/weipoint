import React from "react";
import TextField from 'material-ui/TextField';
import AddIcon from 'react-material-icons/icons/content/add';
import RemoveIcon from 'react-material-icons/icons/content/remove';
import Snackbar from 'material-ui/Snackbar';

const MAX_LENGTH = 100;

class EditableField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      error: '',
      showAddField: false,
      showReviewingMessage: false
    };

    this.getElements = this.getElements.bind(this);
    this.getAddElement = this.getAddElement.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  onChange(event, newValue) {
    this.setState({
      value: newValue,
      error: this.props.validate(newValue.trim())
    });
  }

  onKeyPress(event) {
    if (event.charCode === 13) { // enter key pressed
      event.preventDefault();
      if (this.state.value.trim() === '') {
        return;
      }
      if (this.props.validate(this.state.value.trim()) === '') {
        const showMessage = !(this.props.autoAcceptFirst && !this.props.value);
        this.setState({ value: '', showAddField: false, showReviewingMessage: showMessage });
        this.props.add(this.state.value.trim());
      }
    }
  }

  getAddElement() {
    const hintText = this.props.value ? 'Edit' : 'Add';
    const iconStyle = {
      marginTop: 'auto',
      marginBottom: 'auto',
      width: 24,
      height: 24,
      marginLeft: 10
    };
    if (this.state.showAddField) {
      return (
        <div key='addDescription' style={{ display: 'flex' }}>
          <div style={iconStyle}>
            <span
              className="hint--bottom-right hint--rounded"
              aria-label="Hide"
              style={{
                width: 24,
                height: 24,
                cursor: 'pointer'
              }}
              onClick={ e => this.setState({ showAddField: false })}
            >
              <RemoveIcon />
            </span>
          </div>
          <TextField
            hintText={hintText}
            onChange={this.onChange}
            value={this.state.value}
            style={{ width: 260, marginLeft: 10 }}
            onKeyPress={this.onKeyPress}
            errorText={this.state.error}
            inputStyle={{ fontSize: 14 }}
            hintStyle={{ fontSize: 14 }}
          />
        </div>
      );
    } else {
      return (
        <div style={iconStyle} key='addDescription'>
          <span
            className="hint--bottom-right hint--rounded"
            aria-label={this.props.value ? "Edit" : "Add"}
            style={{
              width: 24,
              height: 24,
              cursor: 'pointer'
            }}
            onClick={ e => this.setState({ showAddField: true })}
          >
            <AddIcon />
          </span>
        </div>
      );
    }
  }

  validate(description) {
    if (description.length > MAX_LENGTH) {
      return 'Too long';
    }
    return '';
  }

  getElements() {
    let elements = [];
    const description = this.props.value || this.props.defaultValue
    elements.push(
      <div
        style={{ fontStyle: 'italic', marginTop: 'auto', marginBottom: 'auto' }}
        key='description'
      >
        {description}
      </div>
    );
    if (this.props.showAdd) {
      elements.push(this.getAddElement());
    }
    return elements;
  }

  render() {
    const elements = this.getElements();
    return (
      <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          height: 48,
          fontSize: 14
        }}>
        {elements}
        <Snackbar
          open={this.state.showReviewingMessage}
          message={
            <div style={{ marginLeft: 'auto', marginRight: 'auto', textAlign: 'center'}}>
              {"Submitted your update for review"}
            </div>
          }
          autoHideDuration={3000}
          onRequestClose={ e => this.setState({ showReviewingMessage: false })}
        />
      </div>
    );
  }
}

EditableField.propTypes = {
  value: React.PropTypes.node,
  defaultValue: React.PropTypes.string.isRequired,
  autoAcceptFirst: React.PropTypes.bool.isRequired,
  add: React.PropTypes.func,
  showAdd: React.PropTypes.bool.isRequired,
  validate: React.PropTypes.func.isRequired
};

export default EditableField;
