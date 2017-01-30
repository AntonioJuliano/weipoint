import React from "react";
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import styles from '../styles/SearchBarStyle';
import SearchIcon from 'react-material-icons/icons/action/search';

class SearchBar extends React.Component {
    render() {
        return (
            <div class='searchBar'>
                <TextField
                    fullWidth={true}
                    id='searchTextField'
                    hintText='Search for contract by name or address'
                    onChange={this.props.onChange}
                    />
                <RaisedButton
                    onClick={this.props.onClick}
                    label="Search"
                    primary={true}
                    style={styles.button}
                    icon={<SearchIcon />}
                    />
            </div>
        );
    }
}

export default SearchBar;
