import React from 'react';
import Divider from 'material-ui/Divider';

class About extends React.Component {
  render() {
    return (
      <div style={{ marginTop: 15, marginBottom: 30 }}>
        <h2 style={{ color: '#5b5b5b'}}>{'About Us'}</h2>
        <Divider style={{ margin: 'auto', marginLeft: 'auto', marginRight: 'auto', width: '80%' }} />
        <div style={{ marginTop: 30}}>
          {'Weipoint is a search platform that makes it east to discover and interact with '
            + 'the decentralized web'}
        </div>
        <h2 style={{ color: '#5b5b5b', marginTop: 100}}>{'Blog'}</h2>
        <Divider style={{ margin: 'auto', marginLeft: 'auto', marginRight: 'auto', width: '80%' }} />
        <div style={{ marginTop: 30 }}>
          {'Read our blog at '}
          <a href='https://medium.com/weipoint' target='_blank'>
            {'medium.com/weipoint'}
          </a>
        </div>
        <h2 style={{ color: '#5b5b5b', marginTop: 100}}>{'Contact'}</h2>
        <Divider style={{ margin: 'auto', marginLeft: 'auto', marginRight: 'auto', width: '80%' }} />
        <div style={{ marginTop: 30 }}>
          <div>
            {'If you have questions or issues, please reach out to us at support@weipoint.com'}
          </div>
          <div style={{ marginTop: 15 }}>
            {'For other inquiries, please use contact@weipoint.com'}
          </div>
        </div>
      </div>
    );
  }
}

export default About;
