import { Dispatch } from 'redux';
import { Alert } from 'react-native';
import { createAction, Action } from 'redux-actions';
import noble from 'react-native-ble';
import Config from '../../config';
import { Buffer } from 'buffer';
import * as bluetoothActions from './bluetooth';
import { gtm } from '../../providers';

const INCLUDE_DUPES = false;

export const constants = {
  PROVIDER_SELECTED: 'PROVIDER_SELECTED',
  PROVIDER_AUTH_RECEIVED: 'provider/PROVIDER_AUTH_RECEIVED', 
  PROVIDER_LAUNCH_REQUESTED: 'PROVIDER_LAUNCH_REQUESTED', 
  PROVIDER_LAUNCH_REQUEST_ENDED: 'PROVIDER_LAUNCH_REQUEST_ENDED',
  PROVIDER_LAUNCH_CODE_GRANTED: 'PROVIDER_LAUNCH_CODE_GRANTED', 
  ERROR: 'autoreduce provider/ERROR',
};

export const providerSelected = createAction(constants.PROVIDER_SELECTED);
export const providerAuthReceived = createAction(constants.PROVIDER_AUTH_RECEIVED);
export const providerLaunchRequested = createAction(constants.PROVIDER_LAUNCH_REQUESTED);
export const providerLaunchRequestEnded = createAction(constants.PROVIDER_LAUNCH_REQUEST_ENDED);
export const providerLaunchCodeGranted = createAction(constants.PROVIDER_LAUNCH_CODE_GRANTED);
export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta)


export function handleAuthResponse(providerType, access) {
  return async function (dispatch, getState) {
  	  const profile = {
  	  	firstName: access.firstName,
  	  	lastName: access.lastName,
  	  	email: access.email
  	  };
      const providerAuth = {access, profile};
      dispatch(providerAuthReceived({providerType, providerAuth}));
  }
}

export function startMeeting(options) {
  return async function (dispatch, getState) {
      const {providerType, peripheral, meetingType, deviceType} = options;
      dispatch(providerLaunchRequested({providerType, deviceId: peripheral.id, meetingType, deviceType}));
      const {access} = getState().provider.authenticatedProviders[providerType];
      //only supports gtm for now
      gtm.getAdHocGtmLauchUrl(access)
      .then((resp) => {
        dispatch(providerLaunchCodeGranted({providerType, launchCode: resp.hostUrl, meetingId: resp.meetingId}));
        dispatch(bluetoothActions.associatePeripheral(peripheral));
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
