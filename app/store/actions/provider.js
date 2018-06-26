import { Dispatch } from 'redux';
import { Alert } from 'react-native';
import { createAction, Action } from 'redux-actions';
import noble from 'react-native-ble';
import Config from '../../config';
import { Buffer } from 'buffer';
import { Actions as RouterActions } from 'react-native-router-flux';
import * as bluetoothActions from './bluetooth';
import { gtm } from '../../providers';
import { isTypeSupported } from '../../providers';
import { track } from '../../tracking';

const INCLUDE_DUPES = false;

export const constants = {
  PROVIDER_SELECTED: 'provider/PROVIDER_SELECTED',
  PROVIDER_AUTH_RECEIVED: 'provider/PROVIDER_AUTH_RECEIVED', 
  PROVIDER_LAUNCH_REQUESTED: 'provider/PROVIDER_LAUNCH_REQUESTED', 
  PROVIDER_LAUNCH_REQUEST_ENDED: 'provider/PROVIDER_LAUNCH_REQUEST_ENDED',
  PROVIDER_LAUNCH_CODE_GRANTED: 'provider/PROVIDER_LAUNCH_CODE_GRANTED', 
  PROVIDER_LOAD_UPCOMING_MTGS_START: 'provider/PROVIDER_LOAD_UPCOMING_MTGS_START',
  PROVIDER_LOAD_UPCOMING_MTGS_ENDED: 'provider/PROVIDER_LOAD_UPCOMING_MTGS_ENDED',
  PROVIDER_LOAD_UPCOMING_MTGS_ERROR: 'provider/PROVIDER_LOAD_UPCOMING_MTGS_ERROR',
  PROVIDER_SESSION_KILL_REQUESTED: 'provider/PROVIDER_SESSION_KILL_REQUESTED',
  PROVIDER_SESSION_KILLED: 'provider/PROVIDER_SESSION_KILLED',
  PROVIDER_SESSION_KILL_ERROR: 'provider/PROVIDER_SESSION_KILL_ERROR',
  ERROR: 'autoreduce provider/ERROR',
};

export const providerSelected = createAction(constants.PROVIDER_SELECTED);
export const providerAuthReceived = createAction(constants.PROVIDER_AUTH_RECEIVED);
export const providerLaunchRequested = createAction(constants.PROVIDER_LAUNCH_REQUESTED);
export const providerLaunchRequestEnded = createAction(constants.PROVIDER_LAUNCH_REQUEST_ENDED);
export const providerLaunchCodeGranted = createAction(constants.PROVIDER_LAUNCH_CODE_GRANTED);
export const providerLoadUpcomingMtgsStart = createAction(constants.PROVIDER_LOAD_UPCOMING_MTGS_START);
export const providerLoadUpcomingMtgsEnded = createAction(constants.PROVIDER_LOAD_UPCOMING_MTGS_ENDED);
export const providerLoadUpcomingMtgsError = createAction(constants.PROVIDER_LOAD_UPCOMING_MTGS_ERROR);
export const providerSessionKillRequested = createAction(constants.PROVIDER_SESSION_KILL_REQUESTED);
export const providerSessionKilled = createAction(constants.PROVIDER_SESSION_KILLED);
export const providerSessionKillError = createAction(constants.PROVIDER_SESSION_KILL_ERROR);
export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta)


export function selectProvider(providerType) {
  return async function (dispatch, getState) {
    dispatch(providerSelected(providerType));
    if (isTypeSupported(providerType)) {
      track("Provider_Selected", {
        "provider" : providerType,
        "supported" : true
      })
      RouterActions.login({type: 'push'});
    } else {
      track("Provider_Selected", {
        "provider" : providerType,
        "supported" : false
      })
      RouterActions.unsupported({type: 'push'});
    };
  }
}

export function handleAuthResponse(providerType, access) {
  return async function (dispatch, getState) {
  	  const oauthProfile = {
  	  	firstName: access.firstName,
  	  	lastName: access.lastName,
  	  	email: access.email
  	  };

      gtm.getProfileInformation(access)
      .then((gtmProfile) => {
        const providerAuth = {access, profile: Object.assign(oauthProfile, gtmProfile)};
        dispatch(providerAuthReceived({providerType, providerAuth}));
      });
  }
}

export function startMeeting(options) {
  return async function (dispatch, getState) {
      const {providerType, peripheral, meetingType, deviceType} = options;
      console.log(options);
      dispatch(providerLaunchRequested({providerType, deviceId: peripheral.id, meetingType, deviceType}));
      const {access} = getState().provider.authenticatedProviders[providerType];
      //only supports gtm for now
      gtm.getAdHocGtmLauchUrl(access)
      .then((resp) => {
        console.log(resp);
        dispatch(providerLaunchCodeGranted({providerType, launchCode: resp.hostUrl, meetingId: resp.meetingId}));
        dispatch(bluetoothActions.associatePeripheral(peripheral));
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export function endMeeting(options) {
  return async function (dispatch, getState) {
      const {providerType, peripheral, meetingId} = options;
      dispatch(providerSessionKillRequested({providerType, meetingId}));
      const {access} = getState().provider.authenticatedProviders[providerType];
      dispatch(bluetoothActions.attemptDisconnect(peripheral, true));
      //only supports gtm for now
      gtm.killSession(access, meetingId)
      .then((resp) => {
        dispatch(providerSessionKilled({meetingId: meetingId}));
      })
      .catch((err) => {
        dispatch(providerSessionKillError(err));
        console.log(err);
      });
  }
}

export function loadUpcomingMeetings(providerType) {
  return async function (dispatch, getState) {
    if(providerType != 'gtm') {
      throw "unknown provider";
    }

    const state = getState();
    const access = state.provider.authenticatedProviders[providerType].access;

    dispatch(providerLoadUpcomingMtgsStart({providerType}));

    gtm.loadUpcomingMeetings(access)
    .then((upcomingMeetings) => {
      dispatch(providerLoadUpcomingMtgsEnded({providerType, upcomingMeetings}));
    })
    .catch((err) => {
      dispatch(providerLoadUpcomingMtgsError(err));
    })
  }
}
