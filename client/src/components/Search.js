/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import styles from '../styles/SearchStyle';
import SearchBar from './SearchBar';
import { Grid, Row, Col } from 'react-flexbox-grid'

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: null,
            code: null
        };
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(e) {
        const value = e.target.value;
        this.setState({ value: value });

        const thisRef = this;

        if (this.props.web3.isAddress(value)) {
            console.log("searching for address " + value);
            const requestPath = `/api/v1/contract?address=${value}`;
            fetch(requestPath, {method: 'get'}).then(function(response) {
                    console.log(response);
                    return response.json();
                }
            ).then(function(json) {
                    console.log(json);
                    thisRef.setState({ code: json.code })
                }
            ).catch(function(error) {
                console.error(error);
            });
        }
    }

    render() {
        return (
            <Grid>
                <Row center='xs'>
                    <Col xs={6}>
                        <SearchBar
                            onChange={this.handleChange}
                            onClick={this.handleClick}
                            />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export default Search;
