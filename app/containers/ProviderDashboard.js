import React from 'react';
import {
  AppState,
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
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { Actions as RouterActions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import noble from 'react-native-ble';
import * as bluetoothActions from '../store/actions/bluetooth';
import * as providerActions from '../store/actions/provider';
import Config from '../config';
import MeetingChoicesView from '../components/ProviderDashboard/MeetingChoices';
import JoinMeetingView from '../components/ProviderDashboard/JoinMeeting';
import ConferenceSystemChoicesView from '../components/ProviderDashboard/ConferenceSystemChoices';
import ProviderButton from '../components/ProviderButton';
import HorizontalRule from '../components/HorizontalRule';
import LoadingView from '../components/LoadingView';

function rowHasChanged(r1, r2) {
  // currently only care about changes to bluetooth connection
  if (r1.bluetoothConnected !== r2.bluetoothConnected) return true;
}


class ProviderDashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appState: 'active',
      launchType: null,
      selectedMeetingId: 'profileId',
      selectedPeripheral: null,
      hasValidLaunchInfo: false,
    };

    if(!!this.props.authenticatedProviders[this.props.providerType]) {
      this.props.loadUpcomingMeetings(this.props.providerType);
    }
  }

  componentDidMount() {
    // reset launch state on load
    if(this.props.launchRequested) {
      this.props.providerLaunchRequestEnded();
    }

    //clear join code validation
    this.props.clearValidateMeeting();

    if(this.props.bluetoothState.bluetoothHardwareState === "poweredOn"){
      this.beginScan();
    }

    AppState.addEventListener('change', this._handleAppStateChange);
    
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.launchData && nextProps.launchData === null) {
      this.setState((state) => {
        state.selectedMeetingId = "profileId";
        state.selectedPeripheral = null;
        state.hasValidLaunchInfo = false;
        return state;
      });

      if(nextProps.bluetoothState.bluetoothHardwareState === "poweredOn"){
        this.beginScan();
      }
    }

    if(this.props.launchRequested && !nextProps.launchRequested && 
        nextProps.bluetoothState.bluetoothHardwareState === "poweredOn") {
        //launch was killed, possibly because of timeout connecting to peripheral
        this.setState((state) => {
          state.selectedPeripheral = null;
          state.hasValidLaunchInfo = false;
          return state;
        });
        this.beginScan();
    }

    if(nextProps.bluetoothState.bluetoothHardwareState === "poweredOn" &&
       this.props.bluetoothState.bluetoothHardwareState !== "poweredOn" &&
       this.props.bluetoothState.scanning === false) {
      this.beginScan()
    }

    if(this.props.launchType == 'join' && 
      !!this.state.selectedPeripheral) {
        if(typeof nextProps.validJoinCode !== 'undefined') {
          this.setState((state) => {
            state.hasValidLaunchInfo = true;
            return state;
          });
        }else{
          this.setState((state) => {
            state.hasValidLaunchInfo = false;
            return state;
          });
        }
    }
  }

  componentWillUnmount() {
    this.props.stopScan();
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      this.beginScan();
    }else{
      this.stopScan();
    }

    this.setState({appState: nextAppState});
  }

  beginScan() {
    this.props.scanForNewPeripherals();
  }

  stopScan() {
    this.props.stopScan();
  }

  launchMeeting = () => {
    var meetingId;
    if(this.props.launchType == "start") {
      if(this.state.selectedMeetingId == "profileId") {
        //start user
        meetingId = this.props.profile.meetingId;
        this.props.startMeetingWithId({
            providerType: this.props.providerType,
            peripheral: this.state.selectedPeripheral
        }, meetingId);
      }else{
        this.props.startMeetingWithId({
            providerType: this.props.providerType,
            peripheral: this.state.selectedPeripheral
        }, this.state.selectedMeetingId);
      }
    }else {
      this.props.joinMeeting({
        providerType: this.props.providerType,
        peripheral: this.state.selectedPeripheral
      }, this.props.joinMeetingId);
    }
  }

  startMeeting = () => {
    this.props.startMeeting({
      providerType: this.props.providerType,
      peripheral: this.state.selectedPeripheral,
      meetingType,
      deviceType
    });
  }

  onPeripheralSelected = (peripheral) => {
    this.setState((state) => {
      var validLaunchInfo = false;
      if(this.props.launchType === 'start') {
        validLaunchInfo = !!state.selectedMeetingId && peripheral != null;
      }

      if(this.props.launchType === 'join') {
        console.log(typeof this.props.validJoinCode);
        validLaunchInfo = typeof this.props.validJoinCode !== 'undefined' && peripheral != null;
      }

      state.selectedPeripheral = peripheral;
      state.hasValidLaunchInfo = validLaunchInfo;
      return state;
    });
  }

  onMeetingIdSelected = (meetingId) => {
    this.setState((state) => {
      state.selectedMeetingId = meetingId;
      state.hasValidLaunchInfo = !!state.selectedPeripheral;
      return state;
    });
  }

  launchTypeSelected = (type) => {
    if(type === 'start' && !this.props.authenticatedProviders[this.props.providerType]) {
      this.props.requestAuthSignin();
      return;
    }

    this.props.setLaunchType(type);

    var validLaunchInfo = false;

    if(type === 'start') {
      validLaunchInfo = !!this.state.selectedMeetingId && !!this.state.selectedPeripheral;
    }

    if(type === 'join') {
      validLaunchInfo = !!this.state.selectedPeripheral && typeof this.props.validJoinCode !== 'undefined';
    }

    this.setState((state) => {
      state.hasValidLaunchInfo = validLaunchInfo;
      return state;
    });
  }

  renderJoinChoices = () => {
    return (
      <JoinMeetingView 
        validJoinCode={this.props.validJoinCode}
        checkMeetingId={this.props.checkMeetingId} 
        checkProfileId={this.props.checkProfileId} />
    );
  }

  renderStartChoices = () => {
    return (
      <MeetingChoicesView
        profileId={this.props.profile.profileId}
        meetings={this.props.upcomingMeetings}
        onSelected={this.onMeetingIdSelected}
        selected={this.state.selectedMeetingId} />
    );
  }

  render() {
    const { bluetoothState, launchRequested, profile } = this.props;

    if(launchRequested) {
      return (
        <LoadingView message="Launching Meeting" />
      );
    }

    const clickableBtnStyle = {
      activeColor: Config.colors.lightGrey,
      activeTextColor: Config.colors.darkGrey
    }

    const joinBtnStyle = (this.props.launchType == 'join') ? {} : clickableBtnStyle;
    const startBtnStyle = (this.props.launchType == 'start') ? {} : clickableBtnStyle;

    return (
       <View style={styles.container}>
          <View style={{marginTop: 10, marginBottom: 10, alignItems: 'center'}}>
            <Image source={require('../../assets/Logo.png')} style={{width: '75%', height: 37}} />
            {profile && <TouchableOpacity onPress={this.props.confirmLogout}><Text style={{color: Config.colors.lightGrey, fontSize: 9}}>Signed in as {profile.firstName} {profile.lastName}</Text></TouchableOpacity> }
            <HorizontalRule />
          </View>
          <View style={{marginLeft: 20, marginRight: 20, paddingTop: 20}}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, marginRight: 7}}>
                <ProviderButton 
                  onPress={() => this.launchTypeSelected('start')} 
                  checked={this.props.launchType == 'start'}
                  style={{padding: 0}} {...startBtnStyle}>{`START A\nMEETING`}</ProviderButton>
                </View>
                <View style={{flex: 1, marginLeft: 7}}>
                  <ProviderButton 
                    onPress={() => this.launchTypeSelected('join')}  
                    checked={this.props.launchType == 'join'}
                    style={{padding: 0}} {...joinBtnStyle}>{`JOIN A\nMEETING`}</ProviderButton>
                </View>
            </View>
          </View>
          <View style={{paddingTop: 0, flex: 1}}>
            <View style={{flex: 1, marginLeft: 20, marginRight: 20}}>
              {this.props.launchType == 'join' && this.renderJoinChoices()}
              {this.props.launchType == 'start' && this.renderStartChoices()}
            </View>
            <ConferenceSystemChoicesView 
              active={this.state.appState === 'active'}
              bluetoothState={this.props.bluetoothState}
              onSelected={this.onPeripheralSelected}
              selected={this.state.selectedPeripheral} />
          </View>
          <View style={{padding: 10, paddingLeft: 25, paddingRight: 25}}>
            <ProviderButton 
              disabled={!this.state.hasValidLaunchInfo} 
              activeColor={Config.colors.primaryColor}
              onPress={this.launchMeeting} 
              textAlign='center' 
              fontSize={20} 
              style={{paddingTop: 10, paddingBottom: 10}}>Launch Meeting</ProviderButton>
          </View>
        </View>
    );
  }
}

function mapStateToProps(state, ownProps) { 
  const bluetoothState = state.bluetooth;
  const currentProviderType = state.provider.currentProviderType;
  var profile = {};
  var upcomingMeetings = [];
  if(state.provider.authenticatedProviders[currentProviderType]){
    profile = state.provider.authenticatedProviders[currentProviderType].profile;
    upcomingMeetings = state.provider.authenticatedProviders[currentProviderType].upcomingMeetings;
  }
  
  return {
    providerType: state.provider.currentProviderType,
    launchRequested: state.provider.launchRequested,
    launchData: state.provider.launchData,
    authenticatedProviders: state.provider.authenticatedProviders,
    bluetoothState,
    profile,
    launchType: state.provider.launchType,
    validJoinCode: state.provider.validJoinCode,
    joinMeetingId: state.provider.joinMeetingId,
    upcomingMeetings,
    scene: state.routes.scene
  };
}


function mapDispatchToProps(dispatch, ownProps) {
  return {
    requestAuthSignin: () => dispatch(providerActions.requestAuthSignin()),
    setLaunchType: (lt) => dispatch(providerActions.providerSetLaunchType(lt)),
    confirmLogout: () => dispatch(providerActions.confirmLogout()),
    startMeeting: (options) => dispatch(providerActions.startAdHocMeeting(options)),
    startMeetingWithId: (options, id) => dispatch(providerActions.startMeetingWithId(options, id)),
    joinMeeting: (options, id) => dispatch(providerActions.joinMeeting(options, id)),
    loadUpcomingMeetings: (providerType) => dispatch(providerActions.loadUpcomingMeetings(providerType)),
    providerLaunchRequestEnded: () => dispatch(providerActions.providerLaunchRequestEnded()),
    providerSelected: (p) => dispatch(providerActions.providerSelected(p)),
    providerValidateMeeting: () => dispatch(providerActions.providerValidateMeeting()),
    clearValidateMeeting: () => dispatch(providerActions.clearValidateMeeting()),
    checkProfileId: (code) => dispatch(providerActions.checkProfileId(code)),
    checkMeetingId: (code) => dispatch(providerActions.checkMeetingId(code)),
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
    marginTop: 20,
    flex: 1,
    backgroundColor: Config.colors.darkGrey
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
