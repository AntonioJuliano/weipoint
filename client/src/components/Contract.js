import React from "react";
import {Card, CardTitle} from 'material-ui/Card';
import UploadSource from './UploadSource';
import ViewSource from './ViewSource';
import ContractFunctions from './ContractFunctions';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import InfoIcon from 'react-material-icons/icons/action/info';
import BookIcon from 'react-material-icons/icons/action/book';
import KeyboardArrowLeftIcon from 'react-material-icons/icons/hardware/keyboard-arrow-left';
import ChromeReaderModeIcon from 'react-material-icons/icons/action/chrome-reader-mode';
import AddCircleIcon from 'react-material-icons/icons/content/add-circle';
import SendIcon from 'react-material-icons/icons/content/send';
import ContractOverview from './ContractOverview';
import update from 'immutability-helper';
import clone from 'lodash.clone';
import FlatButton from 'material-ui/FlatButton';
import { withRouter } from 'react-router-dom';

const OVERVIEW = 'OVERVIEW';
const VIEW_SOURCE = 'VIEW_SOURCE';
const UPLOAD_SOURCE = 'UPLOAD_SOURCE';
const VIEW_PROPERTIES = 'VIEW_PROPERTIES';
const CALL_FUNCTION = 'CALL_FUNCTION';

const MIN_CONTENT_HEIGHT = 420;

class Contract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTabName: OVERVIEW,
      currentTabIndex: 0,
      contract: this.props.contract,
      uploadState: 'initialized',
      price: null,
      height: 0
    };
    this.uploadSource = this.uploadSource.bind(this);
    this.getPrice = this.getPrice.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.getCurrentTab = this.getCurrentTab.bind(this);
    this.getNavigationBar = this.getNavigationBar.bind(this);
    this.getBalanceString = this.getBalanceString.bind(this);
    this.addMetadata = this.addMetadata.bind(this);
    this.updateContract = this.updateContract.bind(this);

    this.getPrice();
  }

  updateDimensions() {
    this.setState({ height: window.innerHeight - 321 });
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ contract: this.props.contract });
  }

  // We store the updated contract in state, and also update it in the contract cache
  updateContract(updatedContract) {
    this.setState({ contract: updatedContract });
    this.props.contractStore[this.props.contract.address] = updatedContract;
  }

  async addMetadata(metadata) {
    const tags = metadata.tags;
    const description = metadata.description;
    let link = metadata.link;

    let request = { address: this.state.contract.address };
    let contractClone = clone(this.state.contract);
    if (tags && tags.length > 0) {
      tags.forEach( tag => contractClone.tags.push({ tag: tag }) );
      request.tags = tags;
    }
    if (description) {
      if (!contractClone.description) {
        contractClone.description = description;
      }
      request.description = description;
    }
    if (link) {
      if (!link.match(/^https?:\/\//)) {
        link = 'http://' + link;
      }
      request.link = link;
    }
    this.updateContract(contractClone);

    const requestPath = `/api/v1/contract/metadata`;

    try {
      await fetch(requestPath, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });
    } catch (error) {
      console.error('Metadata add failed');
    }
  }

  async getPrice() {
    const requestPath = `/api/v1/data/price`;
    const response = await fetch(requestPath);
    if (response.status === 200) {
      const json = await response.json();
      this.setState({ price: json.usd });
    } else {
      console.error("Fetching price failed");
    }
  }

  async uploadSource(code, sourceType, compilerVersion, optimized) {
    try {
      const request = {
        address: this.state.contract.address,
        source: code,
        sourceType: sourceType,
        compilerVersion: compilerVersion,
        optimized: optimized
      };

      const requestPath = `/api/v1/contract/source`;
      const response = await fetch(requestPath, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      const json = await response.json();
      if (response.status !== 200) {
        throw Error("Upload source request to server failed");
      }

      const updatedContract = update(this.state.contract, {
        source: { $set: json.contract.source },
        sourceType: { $set: json.contract.sourceType },
        sourceVersion: { $set: json.contract.sourceVersion },
        optimized: { $set: json.contract.optimized },
        name: { $set: json.contract.name },
        abi: { $set: json.contract.abi },
        libraries: { $set: json.contract.libraries },
      });
      this.props.contractStore[this.props.contract.address] = updatedContract;

      this.setState({
        uploadState: 'completed',
        contract: updatedContract
      });
    } catch (error) {
      this.setState({ uploadState: 'error' });
      console.error('Upload Source failed');
    }
  }

  changeTab(name, index) {
    this.setState({ currentTabIndex: index, currentTabName: name })
  }

  getCurrentTab() {
    const overviewTab = <ContractOverview
        contract={this.state.contract}
        addMetadata={this.addMetadata}
      />;
    const uploadSourceTab = <UploadSource
        uploadSource={this.uploadSource}
        uploadState={this.state.uploadState}
        height={Math.max(this.state.height, MIN_CONTENT_HEIGHT)}
      />;
    const viewSourceTab = <ViewSource
        source={this.state.contract.source}
      />;
    const contractPropertiesTab = <ContractFunctions
        functions={this.state.contract.abi.filter(val => {
          return val.constant && val.type === 'function';

        // Sort so no arg functions show up after functions that take args
        }).sort( (a, b) => b.inputs.length - a.inputs.length)}
        address={this.state.contract.address}
        intro={'Here you can view properties defined by this contract. Click on a property to'
          + ' expand the parameters it takes, and call it with a given set of parameters.'}
        noFunctionsMessage={'This contract has no properties'}
        contractAbi={this.state.contract.abi}
        web3={this.props.web3}
        type='CONSTANT'
        storedContract={this.props.contractStore[this.state.contract.address]}
      />;
    const contractFunctions = <ContractFunctions
        functions={this.state.contract.abi.filter(val => {
          return !val.constant && (val.type === 'function' || val.type === 'fallback');
        })}
        address={this.state.contract.address}
        intro={'Here you can send transactions to this contract on the blockchain.'
          + ' Click on a function name to expand the parameters it takes, and call it'
          + ' with a given set of parameters.'}
        noFunctionsMessage={'This contract has no functions'}
        contractAbi={this.state.contract.abi}
        web3={this.props.web3}
        type='STATE_CHANGING'
      />;

    switch(this.state.currentTabName) {
      case OVERVIEW:
        return overviewTab;
      case UPLOAD_SOURCE:
        return uploadSourceTab;
      case VIEW_SOURCE:
        return viewSourceTab;
      case VIEW_PROPERTIES:
        return contractPropertiesTab;
      case CALL_FUNCTION:
        return contractFunctions;
      default:
        return null;
    }
  }

  getNavigationBar() {
    const overview = {
      label: "Overview",
      icon: <InfoIcon />,
      name: OVERVIEW
    };
    const uploadSource = {
      label: "Upload Source",
      icon: <AddCircleIcon />,
      name: UPLOAD_SOURCE
    };
    const viewSource = {
      label: "Source Code",
      icon: <BookIcon />,
      name: VIEW_SOURCE
    };
    const viewProperties = {
      label: "Read Contract",
      icon: <ChromeReaderModeIcon />,
      name: VIEW_PROPERTIES
    };
    const callFunction = {
      label: "Interact",
      icon: <SendIcon />,
      name: CALL_FUNCTION
    };

    let itemsToShow;
    if (this.state.contract.source === undefined) {
      itemsToShow = [overview, uploadSource];
    } else {
      itemsToShow = [overview, viewSource, viewProperties, callFunction];
    }

    const thisRef = this;
    const elementsToShow = itemsToShow.map(function(tabInfo, index) {
      const style = index === 0 ? { left: 0 } : {};
      return <BottomNavigationItem
          label={tabInfo.label}
          icon={tabInfo.icon}
          onTouchTap={() => thisRef.changeTab(tabInfo.name, index)}
          key={index}
          style={style}
        />;
    });

    return <BottomNavigation
      selectedIndex={this.state.currentTabIndex}
      style={{ width: 'auto', height: 'auto', minWidth: 75 * elementsToShow.length }}
    >
      {elementsToShow}
    </BottomNavigation>;
  }

  getBalanceString() {
    let balanceString = this.state.contract.balance + " \u039E";
    if (this.state.price != null) {
      const usdAmount =
        (Math.round(this.state.contract.balance * this.state.price * 100) / 100).toFixed(2);
      balanceString += '  ($' + usdAmount + ')';
    }
    return balanceString;
  }

  render() {
    return (
      <div
        className="SearchResultContainer"
        style={{ marginTop: 15, textAlign: 'left', marginBottom: 10 }}>
        <Card>
          <div style={{ display: 'flex', maxWidth: 'inherit', width: 'inherit' }} >
            {
              this.props.back &&
              <FlatButton
                style={{ height: 84, width: 50, maxWidth: 50, minWidth: 50 }}
                icon={<KeyboardArrowLeftIcon style={{ width: 32, height: 32 }} />}
                onTouchTap={this.props.back}
              />
            }
            <CardTitle
              title={this.state.contract.name || "Contract"}
              subtitle={this.state.contract.address}
              titleStyle={{ wordWrap: 'break-word' }}
              subtitleStyle={{ wordWrap: 'break-word' }}
              style={{ maxWidth: '90%' }}
            />
          </div>
          <div style={{
            height: this.state.height,
            minHeight: MIN_CONTENT_HEIGHT,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {this.getCurrentTab()}
          </div>
          <div style={{ overflowX: 'auto', overflowY: 'hidden'}}>
            {this.getNavigationBar()}
          </div>
        </Card>
      </div>
    );
  }
}

Contract.propTypes = {
  contract: React.PropTypes.object.isRequired,
  web3: React.PropTypes.object.isRequired,
  back: React.PropTypes.func,
  contractStore: React.PropTypes.object.isRequired
};

export default withRouter(Contract);
