import { Dispatch } from 'redux';
import { Alert } from 'react-native';
import { createAction, Action } from 'redux-actions';
import noble from 'react-native-ble';
import Config from '../../config';

const INCLUDE_DUPES = false;

export const constants = {
  BLE_STATE_UPDATE: 'bluetooth/BLE_STATE_UPDATE', 
  BLE_SCAN_START: 'bluetooth/BLE_SCAN_START',
  BLE_SCAN_START_ERROR: 'bluetooth/BLE_SCAN_START_ERROR',
  BLE_SCAN_END: 'bluetooth/BLE_SCAN_END',
  BLE_PERIPHERAL_DISCOVERED: 'bluetooth/BLE_PERIPHERAL_DISCOVERED',
  BLE_PERIPHERAL_ASSOCIATE_START: 'bluetooth/BLE_PERIPHERAL_ASSOCIATE_START',
  BLE_PERIPHERAL_CONNECTED: 'bluetooth/BLE_PERIPHERAL_CONNECTED',
  BLE_PERIPHERAL_DISCONNECTED: 'bluetooth/BLE_PERIPHERAL_DISCONNECTED',
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
export const peripheralAssociateStart = createAction(constants.BLE_PERIPHERAL_ASSOCIATE_START);
export const peripheralConnected = createAction(constants.BLE_PERIPHERAL_CONNECTED);
export const peripheralDisconnected = createAction(constants.BLE_PERIPHERAL_DISCONNECTED);
export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta)

export function scanForNewPeripherals() {
  return async function (dispatch, getState) {
    noble.on('discover', function(peripheralInstance) {
      // cannot store Peripheral instance in AppState, need to convert to simple object
      // noble will hold onto the proper Peripheral instance
      let peripheral = JSON.parse(peripheralInstance.toString());
      peripheral.advertisement = {
        localName: peripheralInstance.advertisement.localName, 
        serviceUuids: peripheralInstance.advertisement.serviceUuids
      };
      dispatch(peripheralDiscovered(peripheral));
    });

  	noble.startScanning(
      [Config.ble.conferenceSystemServiceUuid], 
      INCLUDE_DUPES, 
      (err) => (!err) ? dispatch(scanStart()) : dispatch(scanStartError(err)));
  };
}

export function stopScan() {
  return async function (dispatch, getState) {
    noble.stopScanning(() => dispatch(scanEnd()));
    noble.removeAllListeners('discover');
  };
}

export function associatePeripheral(peripheral) {
  return async function(dispatch) {
    dispatch(peripheralAssociateStart(peripheral.id));
    dispatch(attemptConnect(peripheral, true));
  };
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
        dispatch(peripheralConnected(peripheral));
        if(state.scanning){ dispatch(stopScan()); }
      });

      instance.once('disconnect', function(){
        dispatch(peripheralDisconnected(peripheral));
      });

      instance.connect(function(err){
        if(err) {
          if(state.scanning){ dispatch(stopScan()); }
          dispatch(setError(err));
        }
      });
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
        'Connect Jacket',
        'Connect to jacket via Bluetooth?',
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
        peripheralInstance.disconnect((err) => { (err) => (!err) ? dispatch(peripheralDisconnected({id: peripheral.id})) : console.log(err); });
      }else{
        dispatch(peripheralDisconnected({id: peripheral.id}));
      }
    }

    if(noPrompt){
      disconnect();
    }else{
      Alert.alert(
        'Disconnect Jacket',
        'Disconnect jacket from Bluetooth?',
        [
          {text: 'Cancel'},
          {text: 'OK', onPress: () => disconnect() },
        ]
      );
    }
  };
}

// toggle bluetooth connect/disconnect for jacket
export function toggleBluetooth(jacket, noPrompt) {
  return async function(dispatch){
    if (jacket.isConnectedJacket !== 'true') {
      return;
    }

    if(jacket.bluetoothConnected) {
      dispatch(attemptDisconnect({id:jacket.peripheralId}, noPrompt))
    }else{
      dispatch(attemptConnect({id:jacket.peripheralId}, noPrompt))   
    }
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
    [Config.ble.conferenceSystemServiceUuid], 
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


