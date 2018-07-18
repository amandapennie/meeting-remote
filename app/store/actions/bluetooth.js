import { Dispatch } from 'redux';
import { Alert } from 'react-native';
import { createAction, Action } from 'redux-actions';
import { Actions as RouterActions } from 'react-native-router-flux';
import noble from 'react-native-ble';
import { track } from '../../tracking';
import { BLE_CONF_SYSTEM_SERVICE_ID, BLE_CONF_SYSTEM_CHARACTERISTIC_ID } from 'react-native-dotenv';
import { Buffer } from 'buffer'
import url from 'url';

const INCLUDE_DUPES = false;

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
  	POWERED_OFF : "poweredOff",
  	POWERED_ON : "poweredOn"
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

export function scanForNewPeripherals() {
  return async function (dispatch, getState) {
    noble.on('discover', function(peripheralInstance) {
      // cannot store Peripheral instance in AppState, need to convert to simple object
      // noble will hold onto the proper Peripheral instance
      let peripheral = JSON.parse(peripheralInstance.toString());

      var serviceUuid; 
      if(peripheralInstance.advertisement.serviceUuids){
        serviceUuid = peripheralInstance.advertisement.serviceUuids[0];
        if(!serviceUuid.startsWith("c578000f18f7")) {
          return;
        }
      }else{
        return;
      }
      
      const hexRoomName = serviceUuid.substr(serviceUuid.length - 20);
      const roomName = Buffer.from(hexRoomName, 'hex').toString('utf8');
      peripheralInstance.advertisement.serviceUuids 
      peripheral.advertisement = {
        localName: peripheralInstance.advertisement.localName || roomName, 
        serviceUuids: peripheralInstance.advertisement.serviceUuids
      };

      dispatch(peripheralDiscovered(peripheral));
      //dispatch(checkForRssiUpdates(peripheralInstance));

    });

  	noble.startScanning(
      [], 
      true, 
      (err) => {
        console.log(err);
        (!err) ? dispatch(scanStart()) : dispatch(scanStartError(err));
      });
  };
}

export function stopScan() {
  return async function (dispatch, getState) {
    noble.stopScanning((err) => {
      dispatch(scanEnd());
    });
    dispatch(scanEnd());
    noble.removeAllListeners('discover');

  };
}

export function associatePeripheral(peripheral) {
  return async function(dispatch) {
    dispatch(peripheralAssociateStart(peripheral.id));
    dispatch(attemptConnect(peripheral, true));
  };
}

export function connectTimeout() {
  return async function(dispatch) {
      dispatch(peripheralConnectTimeout());
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
      track('LAUNCH_TIMEOUT');
  }
}

// Attempt to connect to bluetooth peripheral
export function attemptConnect(peripheral, noPrompt) {
  return async function (dispatch, getState) {
    const state = getState().bluetooth;

    if (!noPrompt && state.bluetoothHardwareState !== constants.states.POWERED_ON) {
      // Can't connect without bluetooth turned on
      Alert.alert(
        'Bluetooth Unavailable',
        'Bluetooth does not appear to be turned on.',
        [{text: 'OK' }]
      );
      return;
    }


    function connect(instance){
      instance.once('connect', function(){
        clearTimeout(_launchConnectTimeout);
        dispatch(peripheralConnected(peripheral));
        if(state.scanning){ dispatch(stopScan()); }

        const { launchData } = getState().provider;

        if(launchData) {
          RouterActions.session({type: 'replace'});
          // gtm specific code
          console.log('connected now sending launch data');
          console.log(launchData);
          if(launchData.launchType == "start"){
            var queryData = url.parse(launchData.launchCode, true).query;
            const token = queryData.authenticationToken;
            dispatch(sendMessage(peripheral, `start|${launchData.meetingId}|${token}`));
          }else{
            dispatch(sendMessage(peripheral, `join|${launchData.meetingId}`));
          }
        }else{
          // no launch data, why are we connecting???
        }

      });

      instance.once('disconnect', function(){
        console.log('disconnected ' + peripheral.id);
        dispatch(peripheralDisconnected(peripheral));
      });

      instance.connect(function(err){
        if(err) {
          console.log(err);
          if(state.scanning){ dispatch(stopScan()); }
          dispatch(setError(err));
        }
      });

      _launchConnectTimeout = setTimeout(() => {
        instance.disconnect(); // cancel pending connect
        dispatch(connectTimeout())
      }, 10000);
    }

    function findInstanceAndConnect(){
      const peripheralInstance = noble._peripherals[peripheral.id];
      if(!peripheralInstance) {
        _scanForPeripheralId(peripheral.id, (err, foundPeripheral) => {
          if(!err && foundPeripheral) {
            connect(foundPeripheral);
          } else if(!err) {
            dispatch(setError('Peripheral Not Found'));
          } else {
            dispatch(setError(err));
          }
        });
      }else{
        connect(peripheralInstance);
      }
    }

    if(noPrompt){
      findInstanceAndConnect();  
    }else{
      Alert.alert(
        'Connect System',
        'Connect to system via Bluetooth?',
        [
          {text: 'Cancel'},
          {text: 'OK', onPress: () => findInstanceAndConnect() },
        ]
      );
    }
  };
}

export function attemptDisconnect(peripheral, noPrompt) {
  return async function (dispatch, getState) {
    function disconnect(){
      const peripheralInstance = noble._peripherals[peripheral.id];
      if(peripheralInstance) {
        dispatch(sendMessage(peripheral, "end"));
        setTimeout(() => {
                  peripheralInstance.disconnect((err) => { (err) => (!err) ? dispatch(peripheralDisconnected({id: peripheral.id})) : console.log(err); });
        }, 2000);
      }else{
        dispatch(peripheralDisconnected({id: peripheral.id}));
      }
    }

    if(noPrompt){
      disconnect();
    }else{
      Alert.alert(
        'Disconnect System',
        'Disconnect system from Bluetooth?',
        [
          {text: 'Cancel'},
          {text: 'OK', onPress: () => disconnect() },
        ]
      );
    }
  };
}

export function checkForRssiUpdates(peripheralInstance) {
  return async function (dispatch, getState) {
    console.log("running check");
    const state = getState();
    const discoveredPeripherals = state.bluetooth.discoveredPeripherals;

    peripheralInstance.updateRssi((error, updatedRssi) => {
      if(error) {
        console.log('rssi update error');
        console.log(error);
        return;
      }
      if(originalRssi !== updatedRssi) {
        console.log("updated rssi");
        peripheral.rssi = updatedRssi;
        dispatch(peripheralUpdated(peripheral));
      }else{
        console.log("same rssi");
      }

      if(state.bluetooth.scanning);
      dispatch(checkForRssiUpdates(peripheralInstance));
    });

  }
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export function sendMessage(peripheral, message) {
  return async function (dispatch, getState) {
      const peripheralInstance = noble._peripherals[peripheral.id];
      const serviceUuid = peripheral.advertisement.serviceUuids[0];
      peripheralInstance.discoverSomeServicesAndCharacteristics([serviceUuid], [BLE_CONF_SYSTEM_CHARACTERISTIC_ID], (error, services, characteristics) => {
        if(error) {
          console.log(error);
        }
        const characteristic = characteristics[0];
        characteristic.write(Buffer.from(message, 'utf8'), false, (error) => {if(error){console.log(error)} } );
      });
  };
}

// Scan for a particular peripheral with timeout
function _scanForPeripheralId(peripheralId, callback, timeout) {
  let _cleanupTimeout = null;
  if(!timeout){ timeout = 15000 }

  function cleanUp() {
    noble.stopScanning();
    callback(null);
  }

  noble.on('discover', function(peripheralInstance) {
    if(peripheralId == peripheralInstance.id) {
      if(_cleanupTimeout){clearTimeout(_cleanupTimeout);}
      noble.stopScanning();
      callback(null, peripheralInstance);
    }
  });

  noble.startScanning(
    [BLE_CONF_SYSTEM_SERVICE_ID], 
    INCLUDE_DUPES, 
    (err) => { 
      if(!err){
        _cleanupTimeout = setTimeout(cleanUp, timeout);
      }else{
        callback(err);
      }
    }
  );
}


