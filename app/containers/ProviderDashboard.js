import React from 'react';
import {
  ActivityIndicator,
  Button,
  TextStyle,
  StyleSheet,
  Text,
  ListView,
  Image,
  View,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { Actions as RouterActions } from 'react-native-router-flux';
import noble from 'react-native-ble';
import * as bluetoothActions from '../store/actions/bluetooth';
import * as providerActions from '../store/actions/provider';

function rowHasChanged(r1, r2) {
  // currently only care about changes to bluetooth connection
  if (r1.bluetoothConnected !== r2.bluetoothConnected) return true;
}


class MeetingListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? "red" : "black";
    return (
      <TouchableOpacity onPress={this._onPress}>
        <View>
          <Text style={{ color: textColor }}>
            {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}


class MeetingSelectList extends React.PureComponent {
  state = {selected: (new Map(): Map<string, boolean>)};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (id) => {
    this.setState((state) => {
      const selected = id;
      return {selected};
    });
  };

  _renderItem = ({item}) => (
    <MeetingListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={!!this.state.selected == item.id}
      title={item.title} />
  );

  render() {
    return (
      <FlatList
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem} />
    );
  }
}


class ProviderDashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    const ds = new ListView.DataSource({rowHasChanged});
    const discoveredPeripherals = Object.values(this.props.bluetoothState.discoveredPeripherals);
    this.state = {
      dataSource:  ds.cloneWithRows(discoveredPeripherals),
    };



    if(Object.keys(this.props.bluetoothState.connectedPeripherals).length > 0){
      RouterActions.connected({type: 'replace'});
    }

    console.log(this.props.providerType);
    if(!this.props.authenticatedProviders.hasOwnProperty(this.props.providerType)){
      RouterActions.login({type: 'replace'});
    }
  }

  componentDidMount() {
    // reset launch state on load
    if(this.props.launchRequested) {
      this.props.providerLaunchRequestEnded();
    }
  }

  componentWillReceiveProps(nextProps) {
    if(Object.keys(nextProps.bluetoothState.connectedPeripherals).length > 0){
      RouterActions.connected({type: 'push'});
    }

    const discoveredPeripherals = Object.values(nextProps.bluetoothState.discoveredPeripherals);
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(discoveredPeripherals),
    });
  }

  componentWillUnmount() {
    this.props.stopScan();
  }

  beginScan() {
    this.props.scanForNewPeripherals();
  }

  stopScan() {
    this.props.stopScan();
  }

  startMeeting = (peripheral, meetingType, deviceType) => {
    this.props.startMeeting({
      providerType: this.props.providerType,
      peripheral,
      meetingType,
      deviceType
    });
  }

  renderConferenceSystemOption(peripheral) {
    return (
      <TouchableOpacity onPress={() => this.startMeeting(peripheral, 'ad-hoc', 'gtc')} key={peripheral.id} >
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View>
            <Image style={{width: 60, height: 50}} source={require('../static/monitor.png')} />
          </View>
          <View style={{padding: 10}}>
            <Text style={{color:'#000'}}>{peripheral.advertisement.localName}</Text> 
            <Text style={{color:'#666', fontSize: 7}}>{peripheral.id}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderStopScanningButton() {
    return (
      <View style={styles.horizontal}>
        <ActivityIndicator size="small" color="#00ff00" />
        <Button
            style={styles.submit}
            onPress={this.stopScan.bind(this)} 
            title="Stop Scanning" />
      </View>
    );
  }

  renderScanningButton(bluetoothHardwareState) {
    return (
      <View style={styles.horizontal}>
        <Button
            style={styles.submit}
            onPress={this.beginScan.bind(this)} 
            title="Scan for Rooms" />
      </View>
    );
  }

  render() {
    const { bluetoothState, launchRequested } = this.props;

    if(launchRequested) {
      return (
        <View style={styles.container}>
          <View>
            <ActivityIndicator size="large" color="#000" />
          </View>
          <View>
            <Text>Lauching Meeting...</Text>
          </View>
        </View>
      );
    }

    const button = (bluetoothState.scanning) ? this.renderStopScanningButton() : this.renderScanningButton(bluetoothState.bluetoothHardwareState);
    return (
      <View style={styles.container}>
        <View>
          { button }
        </View>
        <View>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderConferenceSystemOption.bind(this)} />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const scene = ownProps.navigationState;

  console.log(state.provider);

  const bluetoothState = state.bluetooth;
  return {
    providerType: state.provider.currentProviderType,
    launchRequested: state.provider.launchRequested,
    authenticatedProviders: state.provider.authenticatedProviders,
    bluetoothState
  };
}


function mapDispatchToProps(dispatch, ownProps) {
  return {
    startMeeting: (options) => dispatch(providerActions.startMeeting(options)),
    providerLaunchRequestEnded: () => dispatch(providerActions.providerLaunchRequestEnded()),
    providerSelected: (p) => dispatch(providerActions.providerSelected(p)),
    scanForNewPeripherals: () => dispatch(bluetoothActions.scanForNewPeripherals()),
    stopScan: () => dispatch(bluetoothActions.stopScan())
  };
}


const ProviderDashboard = connect(mapStateToProps, mapDispatchToProps)(ProviderDashboardView);

export { ProviderDashboard };


const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#2B2B2B',
  },

  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
    marginTop: 100
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  marginate: {
    marginTop: 32,
  },

  label: {
    fontSize: 13,
    color: '#ABABAB',
    letterSpacing: 0.3,
    marginBottom: 4,
  } ,

  submit: {
    marginTop: 40
  },

  errorText: {
    color: 'white',
    fontSize: 11,
    marginTop: 3,
  },


});
