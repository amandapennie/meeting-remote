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
import LinearGradient from 'react-native-linear-gradient';
import noble from 'react-native-ble';
import * as bluetoothActions from '../store/actions/bluetooth';
import * as providerActions from '../store/actions/provider';

import MeetingChoicesView from '../components/ProviderDashboard/MeetingChoices';
import JoinMeetingView from '../components/ProviderDashboard/JoinMeeting';
import ProviderButton from '../components/ProviderButton'

function rowHasChanged(r1, r2) {
  // currently only care about changes to bluetooth connection
  if (r1.bluetoothConnected !== r2.bluetoothConnected) return true;
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

    // if(Object.keys(this.props.bluetoothState.connectedPeripherals).length > 0){
    //   RouterActions.connected({type: 'replace'});
    // }

    console.log(this.props.providerType);
    if(!this.props.authenticatedProviders.hasOwnProperty(this.props.providerType)){
      RouterActions.login({type: 'replace'});
    }else{
      //this.props.loadUpcomingMeetings(this.props.providerType);
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

  renderConferenceSystems = () => {
    const { bluetoothState } = this.props;

    // if not poweredOn need to tell them to turn on bluetooth
    if(bluetoothState.bluetoothHardwareState !== "poweredOn") {
      return (
        <View style={{flex: 0.5, paddingTop: 10}}>
          <Text style={{color: "#cfdaee", marginLeft: 10, fontSize: 18}}>Choose a device:</Text>
          <View style={{flex: 1, paddingTop: 30}}>
              <Text style={styles.bleStatusMessage}>Turn on bluetooth</Text>
              <Text style={styles.bleStatusMessage}>to find nearby devices</Text>
          </View>
        </View>
      );
    }

    const button = (bluetoothState.scanning) ? this.renderStopScanningButton() : this.renderScanningButton(bluetoothState.bluetoothHardwareState);
    return (
      <View style={{flex: 0.5, paddingTop: 10}}>
          <View style={{flex: 1, flexDirection: 'row'}}>
              <View style={{flex:1}}>
                <Text style={{color: "#cfdaee", marginLeft: 10, fontSize: 18}}>Choose a device:</Text>
              </View>
              <View style={{paddingRight: 10}}>
                <ActivityIndicator animating={bluetoothState.scanning} size="small" color="#fff" />
              </View>
          </View>
          <View>
              { button }
            </View>
            <View>
              <ListView
                enableEmptySections={true}
                dataSource={this.state.dataSource}
                renderRow={this.renderConferenceSystemOption.bind(this)} />
            </View>
      </View>
    );
  }

  render() {
    const { bluetoothState, launchRequested, profile } = this.props;

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
    console.log(profile);
    //         {profile.avatarUrl && <Image style={{width: 40, height: 40}} source={{uri: profile.avatarUrl }} /> }
    return (
       <LinearGradient start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}} colors={['#515f75', '#886952', '#515f75']} style={styles.container}>
          <View style={{marginTop: 10, marginBottom: 10}}>
            <Text style={styles.providerTitle}>GotoMeeting</Text>
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
          <View style={{backgroundColor: "#39404d", paddingTop: 10, flex: 1}}>
            <View style={{flex: 0.5}}>
              <MeetingChoicesView />
              <JoinMeetingView />
              <View
                style={{
                  marginTop: 5,
                  width: '100%',
                  borderBottomColor: '#ffffff',
                  borderBottomWidth: 1 }} />
            </View>
            { this.renderConferenceSystems() }
          </View>
          <View style={{padding: 7}}>
            <ProviderButton />
          </View>
        </LinearGradient>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const scene = ownProps.navigationState;

  console.log(state.provider);

  const bluetoothState = state.bluetooth;
  const currentProviderType = state.provider.currentProviderType;
  const profile = state.provider.authenticatedProviders[currentProviderType].profile;
  return {
    providerType: state.provider.currentProviderType,
    launchRequested: state.provider.launchRequested,
    authenticatedProviders: state.provider.authenticatedProviders,
    bluetoothState,
    profile
  };
}


function mapDispatchToProps(dispatch, ownProps) {
  return {
    startMeeting: (options) => dispatch(providerActions.startMeeting(options)),
    loadUpcomingMeetings: (providerType) => dispatch(providerActions.loadUpcomingMeetings(providerType)),
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
    marginTop: 25
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  },
  bleStatusMessage: {
    textAlign: 'center', 
    color: "#cfdaee"
  },
  providerTitle:{
    color: "#ffffff",
    fontSize: 20,
    textAlign: 'center'
  },
  profileName:{
    color: "#ffffff",
    fontSize: 12,
    textAlign: 'center'
  },
  linearGradient: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5
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
    backgroundColor: "#fa7c2d",
    color: "#ffffff"
  },

  errorText: {
    color: 'white',
    fontSize: 11,
    marginTop: 3,
  },


});
