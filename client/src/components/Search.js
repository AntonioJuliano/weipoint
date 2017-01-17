/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import './ContractSearch.css';
import { FormGroup, FormControl, HelpBlock, ControlLabel, Grid, Row, Col, Panel } from 'react-bootstrap';

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

    getValidationState() {
        if (this.props.web3.isAddress(this.state.value)) {
            return 'success';
        } else {
            return 'warning';
        }
    }

    render() {
        return (
            <Grid>
                <Row>
                    <Col xsOffset={3} xs={6}>
                        <form>
                            <FormGroup
                                controlId="formBasicText"
                                validationState={this.getValidationState()}
                            >
                                <ControlLabel>Ethnexus</ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.value}
                                    placeholder="Enter text"
                                    onChange={this.handleChange}
                                    className="Search-Bar"
                                />
                                <FormControl.Feedback />
                                <HelpBlock>Search for an ethereum contract by address or name</HelpBlock>
                            </FormGroup>
                        </form>
                    </Col>
                </Row>
                <Row>
                    <Col xsOffset={2} xs={8}>
                        {this.state.error && <Panel header="Error" bsStyle="danger">
                            this.state.error
                        </Panel>}
                        {this.state.code && <Panel header="Contract" bsStyle="primary">
                            {this.state.code}
                        </Panel>}
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export default Search;