import { handleActions, handleAction, Action } from 'redux-actions';
import { getInitialState } from '../state';
import { keyBy } from 'lodash';
import * as actions from '../actions/provider';

const initialState = getInitialState().provider;

export default handleActions(
  { 
    [actions.constants.PROVIDER_SELECTED]: (state, action) => {
      return Object.assign({}, state, {currentProviderType: action.payload});
    },

  	[actions.constants.PROVIDER_AUTH_RECEIVED]: (state, action) => {
      const providersByType = {};
      providersByType[action.payload.providerType] = action.payload.providerAuth;
      const newData = Object.assign({}, state.authenticatedProviders, providersByType);
      return Object.assign({}, state, {authenticatedProviders: newData});
    },

    [actions.constants.PROVIDER_LAUNCH_REQUESTED]: (state, action) => {
      return Object.assign({}, state, {launchRequested: true});
    },

    [actions.constants.PROVIDER_LAUNCH_REQUEST_ENDED]: (state, action) => {
      return Object.assign({}, state, {launchRequested: false, launchData: null});
    },

    [actions.constants.PROVIDER_LAUNCH_CODE_GRANTED]: (state, action) => {
      return Object.assign({}, state, {launchData: action.payload});
    },

    [actions.constants.PROVIDER_LOAD_UPCOMING_MTGS_ENDED]: (state, action) => {
      const providersByType = {};
      providersByType[action.payload.providerType] = action.payload.providerAuth;
      const newData = Object.assign({}, state.authenticatedProviders, providersByType);
      return Object.assign({}, state, {authenticatedProviders: newData});
    }

  },
  initialState
);