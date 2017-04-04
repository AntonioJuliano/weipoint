import React from "react";
import {Card, CardTitle} from 'material-ui/Card';
import CopyToClipboard from 'react-copy-to-clipboard';
import UploadSource from './UploadSource';
import ViewSource from './ViewSource';
import ContractFunctions from './ContractFunctions';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import InfoIcon from 'react-material-icons/icons/action/info';
import BookIcon from 'react-material-icons/icons/action/book';
import ChromeReaderModeIcon from 'react-material-icons/icons/action/chrome-reader-mode';
import AddCircleIcon from 'react-material-icons/icons/content/add-circle';
import SendIcon from 'react-material-icons/icons/content/send';
import FlatButton from 'material-ui/FlatButton';
import update from 'immutability-helper';

const initialBytecodeButtonText = "Copy Bytecode";

const OVERVIEW = 'OVERVIEW';
const VIEW_SOURCE = 'VIEW_SOURCE';
const UPLOAD_SOURCE = 'UPLOAD_SOURCE';
const VIEW_PROPERTIES = 'VIEW_PROPERTIES';
const CALL_FUNCTION = 'CALL_FUNCTION';

class Contract extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bytecodeButtonText: initialBytecodeButtonText,
      uploadSourceOpen: false,
      viewSourceOpen: false,
      callFunctionOpen: false,
      contract: this.props.contract,
      uploadState: 'initialized',
      price: null,
      height: 0
    };
    this.copyBytecodeClicked = this.copyBytecodeClicked.bind(this);
    this.uploadSource = this.uploadSource.bind(this);
    this.getPrice = this.getPrice.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.getCurrentTab = this.getCurrentTab.bind(this);
    this.getNavigationBar = this.getNavigationBar.bind(this);
    this.getBalanceString = this.getBalanceString.bind(this);

    this.getPrice();
  }

  copyBytecodeClicked(e) {
    this.setState({ bytecodeButtonText: 'Copied!' });
    const thisRef = this;
    setTimeout(function() {
      thisRef.setState({ bytecodeButtonText: initialBytecodeButtonText });
    }, 1000);
  }

  updateDimensions() {
    this.setState({ height: window.innerHeight - 350 });
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
        throw Error("Search request to server failed");
      }

      const updatedContract = update(this.state.contract, {
        source: { $set: json.source },
        sourceType: { $set: json.sourceType },
        sourceVersion: { $set: json.sourceVersion },
        optimized: { $set: json.optimized },
        name: { $set: json.name },
        abi: { $set: json.abi },
        libraries: { $set: json.libraries },
      });
      this.setState({
        uploadState: 'completed',
        contract: updatedContract
      });
    } catch (error) {
      this.setState({ uploadState: 'error' });
      console.error(error);
    }
  }

  changeTab(name, index) {
    this.setState({ currentTabIndex: index, currentTabName: name })
  }

  getCurrentTab() {
    const overviewTab = <div>
        {"Overview!"}
        <CopyToClipboard text={this.state.contract.code}>
          <FlatButton
            label={this.state.bytecodeButtonText}
            onClick={this.copyBytecodeClicked}/>
        </CopyToClipboard>
      </div>;
    const uploadSourceTab = <UploadSource
        uploadSource={this.uploadSource}
        uploadState={this.state.uploadState}
      />;
    const viewSourceTab = <ViewSource
        source={this.state.contract.source}
      />;
    const contractPropertiesTab = <ContractFunctions
        functions={this.state.contract.abi.filter(function(val) {
          return val.constant && val.type === 'function';
        })}
        address={this.state.contract.address}
        intro={'Here you can view properties defined by this contract. Click on a property to'
          + ' expand the parameters it takes, and call it with a given set of parameters.'}
        noFunctionsMessage={'This contract has no properties'}
        contractAbi={this.state.contract.abi}
        web3={this.props.web3}
      />;
      const contractFunctions = <ContractFunctions
          functions={this.state.contract.abi.filter(function(val) {
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
      return <BottomNavigationItem
          label={tabInfo.label}
          icon={tabInfo.icon}
          onTouchTap={() => thisRef.changeTab(tabInfo.name, index)}
          key={index}
        />;
    });

    return <BottomNavigation selectedIndex={this.state.currentTabIndex}>
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
        style={{ marginTop: 25, textAlign: 'left', marginBottom: 15 }}>
        <Card>
          <CardTitle
            title={this.state.contract.name || "Contract"}
            subtitle={<div>
              {this.state.contract.address}
              <div style={{ marginTop: 5 }}>
                {this.getBalanceString()}
              </div>
            </div>}
          />
        <div style={{ height: this.state.height, minHeight: 420 }}>
          {this.getCurrentTab()}
        </div>
        {this.getNavigationBar()}
        </Card>
      </div>
    );
  }
}

Contract.propTypes = {
  contract: React.PropTypes.object.isRequired,
  web3: React.PropTypes.object.isRequired
};

export default Contract;
