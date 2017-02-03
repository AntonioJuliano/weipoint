/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import '../styles/Search.css';
import SearchBar from './SearchBar';
import SearchResult from './SearchResult';
import { Grid, Row, Col } from 'react-flexbox-grid';

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            error: null,
            contract: null
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        const value = e.target.value.trim();
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
                    thisRef.setState({
                        contract: {
                            address: json.address,
                            name: json.name,
                            source: json.source,
                            sourceType: json.sourceType,
                            code: json.code,
                            blockNumber: json.blockNumber
                        }
                    })
                }
            ).catch(function(error) {
                console.error(error);
            });
        }
    }

    render() {
        return (
            <Grid fluid={true}>
                <Row center='xs'>
                    <Col md={5} xs={7}>
                        <SearchBar
                            onChange={this.handleChange}
                            onClick={this.handleClick}
                            reduced={this.state.contract !== null}
                            />
                    </Col>
                </Row>
                { this.state.contract &&
                    <Row center='xs'>
                        <Col md={8} xs={10}>
                            <div className="SearchResults">
                                <SearchResult
                                    contract={this.state.contract}
                                    />
                            </div>
                        </Col>
                    </Row>
                }
            </Grid>
        );
    }
}

export default Search;
