import { handleActions, handleAction, Action } from 'redux-actions';
import { getInitialState } from '../state';
import { keyBy } from 'lodash';
import * as actions from '../actions/bluetooth';
import { REHYDRATE } from 'redux-persist';

const initialState = getInitialState().bluetooth;

function orderTopFour(state, orderedPeripherals, peripheral) {
      const peripheralId = peripheral.id;
      //sort for closest rooms
      orderedPeripherals.sort((a,b) => { 
        if (a.rssi > b.rssi) {
          return 1
        } 

        if(b.rssi > a.rssi) {
          return -1;
        }

        return 0;
      });

      const currentTopFour = state.nearestPeripherals.slice();
      const currentTopFourIds = state.nearestPeripheralsIds.slice();

      const topFour = orderedPeripherals.slice(0,4);
      const topFourIds = topFour.map(p => p.id);

      // if we are in the top four and werent already
      if(topFourIds.indexOf(peripheralId) > -1 && currentTopFourIds.indexOf(peripheralId) < 0) {
        //need to swap into nearestPeripherals
        for(var i=0;i<=3;i++) {
          // insert if index higher than current list or the peripheral is no longer in top four
          if(i > (currentTopFourIds.length - 1) || topFourIds.indexOf(currentTopFourIds[i]) < 0) {
            currentTopFour[i] = peripheral;
            currentTopFourIds[i] = peripheralId;
            break;
          }
        }
      }

      return {nearestPeripherals: currentTopFour, nearestPeripheralsIds: currentTopFourIds}
}

export default handleActions(
  { 
  	[actions.constants.BLE_STATE_UPDATE]: (state, action) => Object.assign({}, state, {bluetoothHardwareState: action.payload}),

    [actions.constants.BLE_SCAN_START]: (state, action) => {
      return Object.assign({}, state, {scanning: true, discoveredPeripherals: {}, nearestPeripherals: [], nearestPeripheralsIds: [] })
    },

    [actions.constants.BLE_SCAN_END]: (state, action) => Object.assign({}, state, {scanning: false}),

  	[actions.constants.BLE_PERIPHERAL_DISCOVERED]: (state, action) => {
      const peripheralsById = keyBy([action.payload], 'id');
      const newData = Object.assign({}, state.discoveredPeripherals, peripheralsById);
      return Object.assign({}, state, {discoveredPeripherals: newData}, orderTopFour(state, Object.values(newData), action.payload));
    }, 

    [actions.constants.BLE_PERIPHERAL_UPDATED]: (state, action) => {
      const peripheralsById = keyBy([action.payload], 'id');
      const newData = Object.assign({}, state.discoveredPeripherals, peripheralsById);
      return Object.assign({}, state, {discoveredPeripherals: newData}, orderTopFour(state, Object.values(newData), action.payload));
    }, 

    [actions.constants.BLE_PERIPHERAL_CONNECTED]: (state, action) => {
      const peripheralsById = keyBy([action.payload], 'id');
      const newData = Object.assign({}, state.connectedPeripherals, peripheralsById);
      return Object.assign({}, state, {connectedPeripherals: newData});
    }, 

    [actions.constants.BLE_PERIPHERAL_DISCONNECTED]: (state, action) => {
      const newData = Object.assign({}, state.connectedPeripherals);
      delete newData[action.payload.id];
      return Object.assign({}, state, {connectedPeripherals: newData});
    }, 

    [actions.constants.BLE_PERIPHERAL_ASSOCIATE_START]: (state, action) => Object.assign({}, state, {
      associatingUuid: action.payload,
    }),

    [REHYDRATE]: (state) => {
      return Object.assign({}, state, {bluetoothHardwareState: 'unknown'})
    },
  },
  initialState
);