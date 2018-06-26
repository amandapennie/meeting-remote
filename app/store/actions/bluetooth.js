import { Dispatch } from 'redux';
import { Alert } from 'react-native';
import { createAction, Action } from 'redux-actions';
import noble from 'react-native-ble';
import Config from '../../config';
import { Buffer } from 'buffer'
import url from 'url';

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
export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta);


export function scanForNewPeripherals() {
  return async function (dispatch, getState) {
    noble.on('discover', function(peripheralInstance) {
      // cannot store Peripheral instance in AppState, need to convert to simple object
      // noble will hold onto the proper Peripheral instance
      let peripheral = JSON.parse(peripheralInstance.toString());
      //console.log(peripheral);

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

      //console.log(noble._peripherals);
    });

  	noble.startScanning(
      [], 
      INCLUDE_DUPES, 
      (err) => (!err) ? dispatch(scanStart()) : dispatch(scanStartError(err)));
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

        const { launchData } = getState().provider;

        console.log("do we have data")
        console.log(launchData);
        if(launchData) {
          // gtm specific code
          console.log('connected now sending launch data');
          var queryData = url.parse(launchData.launchCode, true).query;
          const token = queryData.authenticationToken;
          dispatch(sendMessage(peripheral, `start|${token}|${launchData.meetingId}`));
        }else{
          // no launch data, why are we connecting???
        }

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
      console.log(peripheral);
      console.log(peripheral.id);
      console.log(noble._peripherals);
      const peripheralInstance = noble._peripherals[peripheral.id];
      console.log("insidee heeeer")
      console.log(peripheralInstance);
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

      // conferenceSystemCharacteristicUuid
      peripheralInstance.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
        if(error) {
          console.log(error);
        }
        const characteristic = characteristics[0];
        characteristic.write(Buffer.from(message, 'utf8'), false, (error) => {if(error){console.log(error)} } );

      });
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


