import React, { Component } from 'react';
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
import { Scene, Router, ActionConst } from 'react-native-router-flux';
import { Stopwatch } from 'react-native-stopwatch-timer';
import * as providerActions from '../store/actions/provider';
import Config from '../config';
import MeetingChoicesView from '../components/ProviderDashboard/MeetingChoices';
import JoinMeetingView from '../components/ProviderDashboard/JoinMeeting';
import ConferenceSystemChoicesView from '../components/ProviderDashboard/ConferenceSystemChoices';
import ProviderButton from '../components/ProviderButton';
import HorizontalRule from '../components/HorizontalRule';

class SessionView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stopwatchStart: true, //true to see if it auto starts
      stopwatchReset: false,
    };
    this.toggleStopwatch = this.toggleStopwatch.bind(this);
    this.resetStopwatch = this.resetStopwatch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // if(Object.keys(nextProps.bluetoothState.connectedPeripherals).length == 0){
    //   RouterActions.pop();
    // }
  }

  // toggle when container is opened
  toggleStopwatch() {
    this.setState({stopwatchStart: !this.state.stopwatchStart, stopwatchReset:false});
  }

  resetStopwatch() {
    this.setState({stopwatchStart: false, stopwatchReset: true});
  }

  getFormattedTime(time) {
    time = time.substring(3);
    return time;
  };

  render() {
    const { profile } = this.props;

    const clickableBtnStyle = {
      activeColor: Config.colors.lightGrey,
      activeTextColor: Config.colors.darkGrey
    }

    return (
       <View style={styles.container}>
          <View style={{marginTop: 10, marginBottom: 10, alignItems: 'center'}}>
            <Image source={require('../../assets/Logo.png')} style={{width: '75%', height: 37}} />
            {profile && <TouchableOpacity><Text style={{color: Config.colors.lightGrey, fontSize: 9}}>Signed in as {profile.firstName} {profile.lastName}</Text></TouchableOpacity> }
          </View>
          <View style={{padding: 30, paddingLeft: 25, paddingRight: 25}}>
            <ProviderButton
              onPress={this._onPressInvite} 
              textAlign='center' 
              fontSize={20} 
              style={{paddingTop: 10, paddingBottom: 10,}}{...clickableBtnStyle}>{`SHARE MEETING LINK`}</ProviderButton>
            <Text style={styles.text}>Sitting all alone? Invite others to join your meeting. Click the button to share your meeting link by email, text, Slack, etc.</Text>
          </View>
          <View style={{padding:30, flex: 1, marginLeft: 20, marginRight: 20}}>
            <View>
              <Stopwatch laps start={this.state.stopwatchStart}
                reset={this.state.stopwatchReset}
                options={options}
                getTime={this.getFormattedTime} />
            </View>
            <Text style={{padding: 10, fontSize: 16, color: Config.colors.lightGrey, textAlign: 'center'}}> Meeting Timer </Text>
          </View>
          <View style={{padding: 30, paddingLeft: 25, paddingRight: 25}}>
            <ProviderButton
              onPress={this._onPressEndMeeting} 
              textAlign='center' 
              fontSize={20} 
              style={{paddingTop: 10, paddingBottom: 10}}{...clickableBtnStyle}>{`END MEETING`}</ProviderButton>
            <Text style={styles.text}>Have feedback? We would love to hear from you. Reach out to us at support@meetingremote.com</Text>
          </View>
        </View>
    );
  }

  _onPressInvite = () => {
    this.props.shareLink(this.props.meetingId);
  }

  _onPressEndMeeting = () => {
    this.props.endMeeting({
      providerType: this.props.providerType,
      peripheral: this.props.peripheral,
      meetingId: this.props.meetingId
    });
    RouterActions.meetingReview({type: 'replace'});
  }
}

function mapStateToProps(state, ownProps) {
  const bluetoothState = state.bluetooth;
  const peripheral = bluetoothState.connectedPeripherals[Object.keys(bluetoothState.connectedPeripherals)[0]];
  const meetingId = (state.provider.launchData) ? state.provider.launchData.meetingId : null;
  const currentProviderType = state.provider.currentProviderType;
  const profile = state.provider.authenticatedProviders[currentProviderType].profile;
  return {
    bluetoothState,
    peripheral,
    providerType: state.provider.currentProviderType,
    meetingId: meetingId,
    profile
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    endMeeting: (options) => dispatch(providerActions.endMeeting(options)),
    shareLink: (meetingId) => dispatch(providerActions.shareLink(meetingId))
  };
}

const Session = connect(mapStateToProps, mapDispatchToProps)(SessionView);
export { Session };


const options = {
   container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 70,
    fontFamily: 'HelveticaNeue-Light',
    color: '#fff',
    fontWeight: 'bold',
  }
};

const styles = StyleSheet.create({
    container: {
      marginTop: 20,
      flex: 1,
      backgroundColor: Config.colors.darkGrey
    },
    text: {
      padding: 10,
      marginRight: 30,
      marginLeft: 30, 
      textAlign: 'center',
      color: Config.colors.lightGrey,
      fontSize: 10,
    },
    text2: {
      textAlign: 'center',
      color: Config.colors.lightGrey,
      fontSize: 10,
      fontWeight: 'bold',
    },
    button: {
        flex: 0.3,
        margin: 40,
        backgroundColor: '#e73',
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
