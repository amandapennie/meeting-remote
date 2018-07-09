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
import Config from '../config';
import MeetingChoicesView from '../components/ProviderDashboard/MeetingChoices';
import JoinMeetingView from '../components/ProviderDashboard/JoinMeeting';
import ConferenceSystemChoicesView from '../components/ProviderDashboard/ConferenceSystemChoices';
import ProviderButton from '../components/ProviderButton';
import HorizontalRule from '../components/HorizontalRule';

function rowHasChanged(r1, r2) {
  // currently only care about changes to bluetooth connection
  if (r1.bluetoothConnected !== r2.bluetoothConnected) return true;
}


class ProviderDashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      launchType: null,
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
      RouterActions.session({type: 'push'});
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

  launchTypeSelected = (type) => {
    
    // TODO: Check user logged in state here
    // if(type === 'start') {
    //   this.props.requestAuthSignin();
    //   return;
    // }

    this.setState((state) => {
      state.launchType = type;
      return state;
    });
  }

  renderJoinChoices = () => {
    return (
      <JoinMeetingView />
    );
  }

  renderStartChoices = () => {
    return (
      <MeetingChoicesView
        onSelected={this.onMeetingIdSelected}
        selected={this.state.selectedMeetingId} />
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
    console.log(this.state.launchType);

    const clickableBtnStyle = {
      activeColor: Config.colors.lightGrey,
      activeTextColor: Config.colors.darkGrey
    }

    const joinBtnStyle = (this.state.launchType == 'join') ? {} : clickableBtnStyle;
    const startBtnStyle = (this.state.launchType == 'start') ? {} : clickableBtnStyle;
    //         {profile.avatarUrl && <Image style={{width: 40, height: 40}} source={{uri: profile.avatarUrl }} /> }
    return (
       <View style={styles.container}>
          <View style={{marginTop: 10, marginBottom: 10, alignItems: 'center'}}>
            <Image source={require('../../assets/Logo.png')} style={{width: '75%', height: 37}} />
            {profile && <Text style={{color: Config.colors.lightGrey, fontSize: 9}}>Signed in as {profile.firstName} {profile.lastName}</Text> }
            <HorizontalRule />
          </View>
          <View style={{marginLeft: 20, marginRight: 20, paddingTop: 20}}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, marginRight: 7}}>
                <ProviderButton 
                  onPress={() => this.launchTypeSelected('start')} 
                  style={{padding: 0}} {...startBtnStyle}>{`START A\nMEETING`}</ProviderButton>
                </View>
                <View style={{flex: 1, marginLeft: 7}}>
                  <ProviderButton 
                    onPress={() => this.launchTypeSelected('join')}  
                    style={{padding: 0}} {...joinBtnStyle}>{`JOIN A\nMEETING`}</ProviderButton>
                </View>
            </View>
          </View>
          <View style={{paddingTop: 0, flex: 1, marginLeft: 20, marginRight: 20}}>
            <View style={{flex: 1}}>
              {this.state.launchType == 'join' && this.renderJoinChoices()}
              {this.state.launchType == 'start' && this.renderStartChoices()}
            </View>
            <ConferenceSystemChoicesView 
              bluetoothState={this.props.bluetoothState}
              onSelected={this.onPeripheralSelected}
              selected={this.state.selectedPeripheral} />
          </View>
          <View style={{padding: 10, paddingLeft: 25, paddingRight: 25}}>
            <ProviderButton 
              disabled={!this.state.hasValidLaunchInfo} 
              onPress={this.startMeeting} 
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
    requestAuthSignin: () => dispatch(providerActions.requestAuthSignin()),
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
