import { Dispatch } from 'redux';
import { Alert } from 'react-native';
import { createAction, Action } from 'redux-actions';
import { Actions as RouterActions } from 'react-native-router-flux';
import BleManager from 'react-native-ble-manager';
import { track } from '../../tracking';
import { BLE_CONF_SYSTEM_SERVICE_ID, BLE_CONF_SYSTEM_CHARACTERISTIC_ID } from 'react-native-dotenv';
import { UTF8 } from 'convert-string';
import url from 'url';
import {
  Sentry,
  SentrySeverity,
  SentryLog
} from 'react-native-sentry';

const INCLUDE_DUPES = false;
const CONNECTION_TIMEOUT_MILLISECONDS = 10000;

export const constants = {
  BLE_STATE_UPDATE: 'bluetooth/BLE_STATE_UPDATE', 
  BLE_SCAN_START: 'bluetooth/BLE_SCAN_START',
  BLE_SCAN_START_ERROR: 'bluetooth/BLE_SCAN_START_ERROR',
  BLE_SCAN_END: 'bluetooth/BLE_SCAN_END',
  BLE_PERIPHERAL_DISCOVERED: 'bluetooth/BLE_PERIPHERAL_UPDATED',
  BLE_PERIPHERAL_UPDATED: 'bluetooth/BLE_PERIPHERAL_DISCOVERED',
  BLE_PERIPHERAL_ASSOCIATE_START: 'bluetooth/BLE_PERIPHERAL_ASSOCIATE_START',
  BLE_PERIPHERAL_CONNECTED: 'bluetooth/BLE_PERIPHERAL_CONNECTED',
  BLE_PERIPHERAL_DISCONNECTED: 'bluetooth/BLE_PERIPHERAL_DISCONNECTED',
  BLE_PERIPHERAL_CONNECT_TIMEOUT: 'BLE_PERIPHERAL_CONNECT_TIMEOUT',
  ERROR: 'autoreduce bluetooth/ERROR',
  states : {
  	UNKNOWN : "unknown",
  	RESETTING : "resetting",
  	UNSUPPORTED : "unsupported",
  	UNAUTHORIZED : "unauthorized",
  	POWERED_OFF : "off",
  	POWERED_ON : "on"
  }
};

export const hardwareStateUpdate = createAction(constants.BLE_STATE_UPDATE);
export const scanStart = createAction(constants.BLE_SCAN_START);
export const scanStartError = createAction(constants.BLE_SCAN_START_ERROR);
export const scanEnd = createAction(constants.BLE_SCAN_END);
export const peripheralDiscovered = createAction(constants.BLE_PERIPHERAL_DISCOVERED);
export const peripheralUpdated = createAction(constants.BLE_PERIPHERAL_UPDATED);
export const peripheralAssociateStart = createAction(constants.BLE_PERIPHERAL_ASSOCIATE_START);
export const peripheralConnected = createAction(constants.BLE_PERIPHERAL_CONNECTED);
export const peripheralDisconnected = createAction(constants.BLE_PERIPHERAL_DISCONNECTED);
export const peripheralConnectTimeout = createAction(constants.BLE_PERIPHERAL_CONNECT_TIMEOUT);
export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta);

var _launchConnectTimeout;

//maybe put this in a higher location
const defaultErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((err, isFatal) => {
  if(!err.message.includes("discoverCharacteristics is not a function")) {
    defaultErrorHandler(err, isFatal);
  }
});

export function peripheralFound(peripheralInstance) {
    return async function (dispatch, getState) {
      // let peripheral = JSON.parse(peripheralInstance.toString());
      //console.log(peripheralInstance);
      let peripheral = {id: peripheralInstance.id, rssi: peripheralInstance.rssi};

      var serviceUuid; 
      if(peripheralInstance.advertising.serviceUUIDs){
        serviceUuid = peripheralInstance.advertising.serviceUUIDs[0];
        if(!serviceUuid.startsWith("C578000F-18F7")) {
          return;
        }
      }else{
        return;
      }
      
      var roomName = peripheralInstance.advertising.localName;

      if(!roomName) {
        try{
          serviceUuid = serviceUuid.replace(/-/g, "");
          const hexRoomName = serviceUuid.substr(serviceUuid.length - 20);
          roomName = Buffer.from(hexRoomName, 'hex').toString('utf8');
        }catch(ex){
          //pass
        }
      }

      peripheral.advertisement = {
        localName: roomName, 
        serviceUuids: peripheralInstance.advertising.serviceUUIDs
      };

      dispatch(peripheralDiscovered(peripheral));
    }  
}

export function scanForNewPeripherals() {
  return async function (dispatch, getState) {
    BleManager.scan([], 5*60, true).then(() => {
      dispatch(scanStart())
    });
  };
}

export function stopScan() {
  return async function (dispatch, getState) {
    BleManager.stopScan().then((err) => {
      dispatch(scanEnd());
    });
    //dispatch(scanEnd());
  };
}

export function associatePeripheral(peripheral) {
  return async function(dispatch) {
    dispatch(peripheralAssociateStart(peripheral.id));
    dispatch(attemptConnect(peripheral, true));
  };
}

export function connectTimeout() {
  return async function(dispatch, getState) {
      dispatch(peripheralConnectTimeout());
      const userId = getState().provider.currentUserId;
      Alert.alert(
        'Launch Error',
        'We cannot connect to this device, it may be out of range.',
        [
          { text: 'Ok', 
            onPress: () => {
            }
          }
        ],
        { cancelable: false }
      );
      track('LAUNCH_TIMEOUT', userId);
      Sentry.captureMessage("launch timeout");
  }
}

// Attempt to connect to bluetooth peripheral
export function attemptConnect(peripheral, noPrompt) {
  return async function (dispatch, getState) {
    const globalState = getState();
    const userId = globalState.provider.currentUserId;
    const state = globalState.bluetooth;

    if (!noPrompt && state.bluetoothHardwareState !== constants.states.POWERED_ON) {
      // Can't connect without bluetooth turned on
      Alert.alert(
        'Bluetooth Unavailable',
        'Bluetooth does not appear to be turned on.',
        [{text: 'OK' }]
      );
      return;
    }


    BleManager.connect(peripheral.id)
    .then(() => {
        // Successfull connection
        clearTimeout(_launchConnectTimeout);
        dispatch(peripheralConnected(peripheral));
        if(state.scanning){ dispatch(stopScan()); }

        //cant write data til we discover services
        BleManager.retrieveServices(peripheral.id)
        .then((peripheralInfo) => {
          // Success code
          //console.log('Peripheral info:', peripheralInfo);

          const { launchData } = getState().provider;

          if(launchData) {
            RouterActions.session({type: 'replace'});
            // gtm specific code
            //console.log('connected now sending launch data');
            //console.log(launchData);
            if(launchData.launchType == "start"){
              var queryData = url.parse(launchData.launchCode, true).query;
              const token = queryData.authenticationToken;
                dispatch(sendMessage(peripheral, `start|${launchData.meetingId}|${token}`));
            }else{
                dispatch(sendMessage(peripheral, `join|${launchData.meetingId}`));
            }
            launchData.launchCode = null;
            track('MEETING_LAUNCH_TRIGGERED', userId, launchData);
          }else{
            // no launch data, why are we connecting???
            Sentry.captureMessage("connecting without launch data");
          }

        });  
    })
    .catch((err) => {
          // Failure code
          Sentry.captureMessage(`connect error: ${err}`);
          if(state.scanning){ dispatch(stopScan()); }
          dispatch(setError(err));
    });

    _launchConnectTimeout = setTimeout(() => {
      BleManager.disconnect(peripheral.id).catch((err) => console.log(err)); // cancel pending connect
      dispatch(connectTimeout())
    }, CONNECTION_TIMEOUT_MILLISECONDS);
  };
}

export function attemptDisconnect(peripheral, noPrompt) {
  return async function (dispatch, getState) {
      dispatch(sendMessage(peripheral, "end"));
      setTimeout(() => {
          BleManager.disconnect(peripheral.id)
          .then(() => {
              dispatch(peripheralDisconnected({id: peripheral.id}));
          })
      }, 2000);


  };
}

// todo: move
const channelCharacteristic = '41bb2d1f-4e3b-47eb-8c6c-6d651aa361fd';

export function sendMessage(peripheral, message) {
  return async function (dispatch, getState) {
      const serviceUuid = peripheral.advertisement.serviceUuids[0];

      Sentry.setExtraContext({
        "room_name": peripheral.advertisement.localName
      });

      console.log(message);

      BleManager.write(peripheral.id, serviceUuid, channelCharacteristic, UTF8.stringToBytes(message), 1024)
      .then(() => {
        // Success code
        Sentry.captureMessage(`message sent to room`);
      })
      .catch((error) => {
        // Failure code
        Sentry.captureMessage(`send message error: ${error}`);
      });
  };
}
