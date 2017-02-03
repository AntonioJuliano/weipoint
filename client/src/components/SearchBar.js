import React from "react";
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import IconButton from 'material-ui/IconButton';
import styles from '../styles/SearchBar.css';
import SearchIcon from 'react-material-icons/icons/action/search';
import Paper from 'material-ui/Paper';
import { Grid, Row, Col } from 'react-flexbox-grid';

class SearchBar extends React.Component {
    render() {
        return (
            <div className={ this.props.reduced ? 'SearchBarContainerReduced'
                            : 'SearchBarContainer' }>
                <div className="SearchTextField">
                    <Paper zDepth={1}>
                        <Row>
                            <Col xs={this.props.reduced ? 11 : 12}>
                                <TextField
                                    fullWidth={true}
                                    id='searchTextField'
                                    onChange={this.props.onChange}
                                    underlineShow={false}
                                    />
                            </Col>
                            {
                                this.props.reduced &&
                                <Col xs={1}>
                                    <div className="SearchBarReducedIcon">
                                        <SearchIcon />
                                    </div>
                                </Col>
                            }
                        </Row>
                    </Paper>
                </div>
                {
                    !this.props.reduced &&
                    <div className="SearchButton">
                        <RaisedButton
                            onClick={this.props.onClick}
                            label="Search"
                            primary={true}
                            style={styles.button}
                            icon={<SearchIcon />}
                            />
                    </div>
                }
            </div>
        );
    }
}

export default SearchBar;
