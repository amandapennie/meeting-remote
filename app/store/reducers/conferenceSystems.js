import { handleActions, handleAction, Action } from 'redux-actions';
import { keyBy, find } from 'lodash';
import * as conferenceSystems from '../actions/conferenceSystems';
import * as bluetooth from '../actions/bluetooth';
import { getInitialState } from '../state';

const initialState = getInitialState().conferenceSystems;

export default handleActions(
  {
    [conferenceSystems.constants.INSERT]: (state, action) => {

      const conferenceSystems = action.payload;
      const conferenceSystemsById = keyBy(conferenceSystems, 'id');
      const data = state.data;
      const newData = Object.assign({}, data, conferenceSystemsById);

      return Object.assign({}, state, { data: newData });
    },

    [conferenceSystems.constants.UPDATE]: (state, action) => {

      const conferenceSystem = action.payload;
      const data = state.data;
      const newData = Object.assign({}, data, {[conferenceSystem.id]: conferenceSystem});

      return Object.assign({}, state, { data: newData });
    },

    [conferenceSystems.constants.DELETE]: (state, action) => {

      const conferenceSystemId = action.payload;
      const data = state.data;
      const newData = Object.assign({}, data);
      delete newData[conferenceSystemId];

      return Object.assign({}, state, { data: newData });
    },

    [bluetooth.constants.BLE_PERIPHERAL_CONNECTED]: (state, action) => {
      const peripheralId = action.payload.id;
      const conferenceSystem = find(state.data, (cs) => cs.peripheralId == peripheralId);
      if(!conferenceSystem) {
        return state;
      }
      const updatedConferenceSystem = Object.assign({}, conferenceSystem, {bluetoothConnected: true});
      const newData = Object.assign({}, state.data, {[conferenceSystem.id]: updatedConferenceSystem});

      return Object.assign({}, state, { data: newData });
    },

    [bluetooth.constants.BLE_PERIPHERAL_DISCONNECTED]: (state, action) => {
      const peripheralId = action.payload.id;
      const conferenceSystem = find(state.data, (cs) => cs.peripheralId == peripheralId);
      if(!conferenceSystem) {
        return state;
      }
      const updatedConferenceSystem = Object.assign({}, conferenceSystem, {bluetoothConnected: false});
      const newData = Object.assign({}, state.data, {[conferenceSystem.id]: updatedConferenceSystem});

      return Object.assign({}, state, { data: newData });
    },
  },
  initialState
);
