import { handleActions, handleAction, Action } from 'redux-actions';
import { getInitialState } from '../state';
import { keyBy } from 'lodash';
import * as actions from '../actions/bluetooth';

const initialState = getInitialState().bluetooth;

export default handleActions(
  { 
  	[actions.constants.BLE_STATE_UPDATE]: (state, action) => Object.assign({}, state, {bluetoothHardwareState: action.payload}),

    [actions.constants.BLE_SCAN_START]: (state, action) => {
      return Object.assign({}, state, {scanning: true, discoveredPeripherals: {} })
    },

    [actions.constants.BLE_SCAN_END]: (state, action) => Object.assign({}, state, {scanning: false}),

  	[actions.constants.BLE_PERIPHERAL_DISCOVERED]: (state, action) => {
      const peripheralsById = keyBy([action.payload], 'id');
      const newData = Object.assign({}, state.discoveredPeripherals, peripheralsById);
      return Object.assign({}, state, {discoveredPeripherals: newData});
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
  },
  initialState
);