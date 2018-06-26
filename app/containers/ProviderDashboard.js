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
import ConferenceSystemChoicesView from '../components/ProviderDashboard/ConferenceSystemChoices';
import ProviderButton from '../components/ProviderButton'

function rowHasChanged(r1, r2) {
  // currently only care about changes to bluetooth connection
  if (r1.bluetoothConnected !== r2.bluetoothConnected) return true;
}


class ProviderDashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMeetingId: 'profileId',
      selectedPeripheral: null,
      hasValidLaunchInfo: false,
    };

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
      
    this.beginScan();
    
  }

  componentWillReceiveProps(nextProps) {
    if(Object.keys(nextProps.bluetoothState.connectedPeripherals).length > 0){
      RouterActions.connected({type: 'push'});
    }

    if(this.props.launchData && nextProps.launchData === null) {
      this.setState((state) => {
        state.selectedMeetingId = "profileId";
        state.selectedPeripheral = null;
        state.hasValidLaunchInfo = false;
        return state;
      });
      this.beginScan();
    }

    // if(nextProps.routeName === "providerDashboard" && this.props.routeName !== "providerDashboard") {
    //   this.beginScan();
    // }
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
      peripheral: this.state.selectedPeripheral,
      meetingType,
      deviceType
    });
  }

  onPeripheralSelected = (peripheral) => {
    this.setState((state) => {
      state.selectedPeripheral = peripheral;
      state.hasValidLaunchInfo = !!state.selectedMeetingId;
      return state;
    });
  }

  onMeetingIdSelected = (meetingId) => {
    this.setState((state) => {
      state.selectedMeetingId = meetingId;
      state.hasValidLaunchInfo = !!state.selectedPeripheralId;
      return state;
    });
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

    //         {profile.avatarUrl && <Image style={{width: 40, height: 40}} source={{uri: profile.avatarUrl }} /> }
    return (
       <LinearGradient start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}} colors={['#515f75', '#886952', '#515f75']} style={styles.container}>
          <View style={{marginTop: 10, marginBottom: 10}}>
            <Text style={styles.providerTitle}>GotoMeeting</Text>
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
          <View style={{backgroundColor: "#39404d", paddingTop: 10, flex: 1}}>
            <View style={{flex: 0.5}}>
              <MeetingChoicesView
                onSelected={this.onMeetingIdSelected}
                selected={this.state.selectedMeetingId} />
              <JoinMeetingView />
              <View
                style={{
                  marginTop: 5,
                  width: '100%',
                  borderBottomColor: '#ffffff',
                  borderBottomWidth: 1 }} />
            </View>
            <ConferenceSystemChoicesView 
              bluetoothState={this.props.bluetoothState}
              onSelected={this.onPeripheralSelected}
              selected={this.state.selectedPeripheral} />
          </View>
          <View style={{padding: 7}}>
            <ProviderButton disabled={!this.state.hasValidLaunchInfo} onPress={this.startMeeting} />
          </View>
        </LinearGradient>
    );
  }
}

function mapStateToProps(state, ownProps) { 
  const bluetoothState = state.bluetooth;
  const currentProviderType = state.provider.currentProviderType;
  const profile = state.provider.authenticatedProviders[currentProviderType].profile;
  return {
    providerType: state.provider.currentProviderType,
    launchRequested: state.provider.launchRequested,
    launchData: state.provider.launchData,
    authenticatedProviders: state.provider.authenticatedProviders,
    bluetoothState,
    profile,
    scene: state.routes.scene
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
