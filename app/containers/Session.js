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
  TouchableHighlight,
  ScrollView,
  FlatList,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { connect } from 'react-redux';
import { Actions as RouterActions } from 'react-native-router-flux';
import { Scene, Router, ActionConst } from 'react-native-router-flux';
import { Stopwatch } from 'react-native-stopwatch-timer';
import * as providerActions from '../store/actions/provider';

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
    if(Object.keys(nextProps.bluetoothState.connectedPeripherals).length == 0){
      RouterActions.pop();
    }
  }

// toggle when container is opened
  toggleStopwatch() {
    this.setState({stopwatchStart: !this.state.stopwatchStart, stopwatchReset:false});
  }

  resetStopwatch() {
    this.setState({stopwatchStart: false, stopwatchReset: true});
  }

  getFormattedTime(time) {
    this.currentTime = time;
  };

  render() {
    return (
      <View style={styles.container}>
        <Stopwatch laps start={this.state.stopwatchStart}
          reset={this.state.stopwatchReset}
          options={options}
          getTime={this.getFormattedTime} />
        <TouchableOpacity style={styles.button} onPress={this._onPressInvite}>
          <Text style={styles.text}> Invite </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={this._onPressEndMeeting}>
          <Text style={styles.text}> End Meeting </Text>
        </TouchableOpacity>
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
  }

}

function mapStateToProps(state, ownProps) {
  const bluetoothState = state.bluetooth;
  const peripheral = bluetoothState.connectedPeripherals[Object.keys(bluetoothState.connectedPeripherals)[0]];
  const meetingId = (state.provider.launchData) ? state.provider.launchData.meetingId : null;
  return {
    bluetoothState,
    peripheral,
    providerType: state.provider.currentProviderType,
    meetingId: meetingId
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
    flex: 0.3,
    margin: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 55,
    fontFamily: 'HelveticaNeue-Light',
    color: '#000',
    marginLeft: 0,
  }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    text: {
        fontFamily: 'HelveticaNeue-Light',
        fontSize: 28,
        color: '#fff',
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
