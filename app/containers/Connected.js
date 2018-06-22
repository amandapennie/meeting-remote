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
import { Actions as RouterActions } from 'react-native-router-flux';
import { connect } from 'react-redux';

import noble from 'react-native-ble';
import * as bluetoothActions from '../store/actions/bluetooth';
import * as providerActions from '../store/actions/provider';

class ConnectedView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    if(Object.keys(nextProps.bluetoothState.connectedPeripherals).length == 0){
      RouterActions.pop();
    }
  }

  componentWillUnmount() {}

  renderScanningButton(bluetoothHardwareState) {
    return (
      <View style={styles.horizontal}>
        <Button
            disabled={bluetoothHardwareState != 'poweredOn'}
            style={styles.submit}
            onPress={this.beginScan.bind(this)} 
            title="Scan for Rooms" />
      </View>
    );
  }

  disconnect() {
    console.log(this.props.peripheral);
    this.props.launchEnd();
    this.props.attemptDisconnect(this.props.peripheral, true);
  }

  sendmsg() {
    console.log(this.props.peripheral);
    this.props.sendMessage(this.props.peripheral, true);
  }

  render() {
    const { bluetoothState, peripheral } = this.props;
    if(!peripheral) {
      return (
        <Text>disconnecting</Text>
      )
    }
    return (
      <View style={styles.container}>
        <View>
          <Text>Connected To:</Text>
          <Text>{peripheral.id}</Text>
        </View>
        <View style={styles.horizontal}>
          <Button
              style={styles.submit}
              onPress={this.disconnect.bind(this)} 
              title="Disconnect" />
        </View>
        <View style={styles.horizontal}>
          <Button
              style={styles.submit}
              onPress={this.sendmsg.bind(this)} 
              title="Send Msg" />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const bluetoothState = state.bluetooth;
  const peripheral = bluetoothState.connectedPeripherals[Object.keys(bluetoothState.connectedPeripherals)[0]];
  return {
    bluetoothState,
    peripheral
  };
}


function mapDispatchToProps(dispatch, ownProps) {
  return {
    launchEnd: () => dispatch(providerActions.providerLaunchRequestEnded()),
    attemptDisconnect: (p, prompt) => dispatch(bluetoothActions.attemptDisconnect(p, prompt)),
    sendMessage: (p, prompt) => dispatch(bluetoothActions.sendMessage(p, prompt))
  };
}


const Connected = connect(mapStateToProps, mapDispatchToProps)(ConnectedView);

export { Connected };


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
