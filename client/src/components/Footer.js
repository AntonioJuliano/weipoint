import React from 'react';
import { Link } from 'react-router-dom';
import { Col } from 'react-flexbox-grid';
import Divider from 'material-ui/Divider';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      hovered: null
    }
  }

  render() {
    let linkStyles = [{
      textDecoration: 'none',
      color: '#4c4c4c'
    }, {
      textDecoration: 'none',
      color: '#4c4c4c'
    }, {
      textDecoration: 'none',
      color: '#4c4c4c'
    }];

    if (this.state.hovered !== null) {
      linkStyles[this.state.hovered].color = '#000000';
    }

    return (
      <footer
        style={{
          paddingBottom: 16,
          textAlign: 'center',
          fontSize: 14,
          paddingTop: 16,
        }}>
        <Col xs={10} style={{ marginLeft: 'auto', marginRight: 'auto', minWidth: 320 }}>
          <Divider style={{ margin: 'auto', width: '100%' }} />
          <div style={{ width: '100%', display: 'flex', marginTop: 16, marginRight: 0, justifyContent: 'flex-end' }}>
            <div style={{ width: 'auto', margin: 'auto', marginRight: 0, marginLeft: 'auto' }}>
              <Link
                to='/about'
                style={linkStyles[0]}
                onMouseEnter={ () => this.setState({ hovered: 0 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
              >
                {'About'}
              </Link>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginLeft: 20, marginRight: 20 }}>
              <Link
                to='/privacy'
                style={linkStyles[1]}
                onMouseEnter={ () => this.setState({ hovered: 1 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
              >
                {'Privacy Policy'}
              </Link>
            </div>
            <div style={{ width: 'auto', margin: 'auto', marginLeft: 0, marginRight: 10 }}>
              <Link
                to='/terms'
                style={linkStyles[2]}
                onMouseEnter={ () => this.setState({ hovered: 2 })}
                onMouseLeave={ () => this.setState({ hovered: null })}
              >
                {'Terms of Service'}
              </Link>
            </div>
          </div>
        </Col>
      </footer>
    );
  }
}

export default Footer;
