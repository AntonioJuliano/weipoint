/**
 * Created by antonio on 1/2/17.
 */
import * as React from "react";
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import '../styles/SearchResult.css';

class SearchResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className="SearchResultContainer">
                <Card>
                    <CardTitle
                      title="Contract"
                      subtitle={this.props.contract.address}
                    />
                    <CardText>
                        {this.props.contract.code}
                    </CardText>
                    <CardActions>
                        <FlatButton label="Upload Source" />
                        <FlatButton label="Send Transaction" />
                    </CardActions>
                </Card>
            </div>
        );
    }
}

export default SearchResult;
