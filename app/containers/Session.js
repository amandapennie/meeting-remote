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
import { Actions, Scene, Router, ActionConst } from 'react-native-router-flux';
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
    return [
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
    ];
  }

  _onPressInvite = () => {
  }

  _onPressEndMeeting = () => {
    this.props.endMeeting(options);
  }

}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    endMeeting: (options) => dispatch(providerActions.endMeeting(options))
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
