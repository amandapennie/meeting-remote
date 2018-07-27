import { Dispatch } from 'redux';
import { Alert, Share } from 'react-native';
import { createAction, Action } from 'redux-actions';
import { Buffer } from 'buffer';
import { Actions as RouterActions } from 'react-native-router-flux';
import * as bluetoothActions from './bluetooth';
import { gtm } from '../../providers';
import { isTypeSupported } from '../../providers';
import { track, identify, DEVICE_ID } from '../../tracking';
import uuidv4 from 'uuid/v4';
import {
  Sentry,
  SentrySeverity,
  SentryLog
} from 'react-native-sentry';


const INCLUDE_DUPES = false;

export const constants = {
  PROVIDER_SELECTED: 'provider/PROVIDER_SELECTED',
  PROVIDER_SET_LAUNCH_TYPE: 'provider/PROVIDER_SET_LAUNCH_TYPE',
  PROVIDER_AUTH_RECEIVED: 'provider/PROVIDER_AUTH_RECEIVED', 
  PROVIDER_AUTH_CLEARED: 'provider/PROVIDER_CLEARED', 
  PROVIDER_LAUNCH_REQUESTED: 'provider/PROVIDER_LAUNCH_REQUESTED', 
  PROVIDER_LAUNCH_REQUEST_ENDED: 'provider/PROVIDER_LAUNCH_REQUEST_ENDED',
  PROVIDER_LAUNCH_CODE_GRANTED: 'provider/PROVIDER_LAUNCH_CODE_GRANTED', 
  PROVIDER_LOAD_UPCOMING_MTGS_START: 'provider/PROVIDER_LOAD_UPCOMING_MTGS_START',
  PROVIDER_LOAD_UPCOMING_MTGS_ENDED: 'provider/PROVIDER_LOAD_UPCOMING_MTGS_ENDED',
  PROVIDER_LOAD_UPCOMING_MTGS_ERROR: 'provider/PROVIDER_LOAD_UPCOMING_MTGS_ERROR',
  PROVIDER_SESSION_KILL_REQUESTED: 'provider/PROVIDER_SESSION_KILL_REQUESTED',
  PROVIDER_SESSION_KILLED: 'provider/PROVIDER_SESSION_KILLED',
  PROVIDER_SESSION_KILL_ERROR: 'provider/PROVIDER_SESSION_KILL_ERROR',
  PROVIDER_MEETING_LINK_SHARED: 'provider/PROVIDER_MEETING_LINK_SHARED',
  PROVIDER_VALIDATE_MEETING: 'provider/PROVIDER_VALIDATE_MEETING',
  PROVIDER_CLEAR_VALIDATE_MEETING: 'provider/PROVIDER_CLEAR_VALIDATE_MEETING',
  PROVIDER_VALIDATE_MEETING_ERROR: 'provider/PROVIDER_VALIDATE_MEETING_ERROR',
  ERROR: 'autoreduce provider/ERROR',
};

export const providerSelected = createAction(constants.PROVIDER_SELECTED);
export const providerSetLaunchType = createAction(constants.PROVIDER_SET_LAUNCH_TYPE);
export const providerAuthReceived = createAction(constants.PROVIDER_AUTH_RECEIVED);
export const providerAuthCleared = createAction(constants.PROVIDER_AUTH_CLEARED);
export const providerLaunchRequested = createAction(constants.PROVIDER_LAUNCH_REQUESTED);
export const providerLaunchRequestEnded = createAction(constants.PROVIDER_LAUNCH_REQUEST_ENDED);
export const providerLaunchCodeGranted = createAction(constants.PROVIDER_LAUNCH_CODE_GRANTED);
export const providerLoadUpcomingMtgsStart = createAction(constants.PROVIDER_LOAD_UPCOMING_MTGS_START);
export const providerLoadUpcomingMtgsEnded = createAction(constants.PROVIDER_LOAD_UPCOMING_MTGS_ENDED);
export const providerLoadUpcomingMtgsError = createAction(constants.PROVIDER_LOAD_UPCOMING_MTGS_ERROR);
export const providerSessionKillRequested = createAction(constants.PROVIDER_SESSION_KILL_REQUESTED);
export const providerSessionKilled = createAction(constants.PROVIDER_SESSION_KILLED);
export const providerSessionKillError = createAction(constants.PROVIDER_SESSION_KILL_ERROR);
export const meetingLinkShared = createAction(constants.PROVIDER_MEETING_LINK_SHARED);
export const validateMeeting = createAction(constants.PROVIDER_VALIDATE_MEETING);
export const clearValidateMeeting = createAction(constants.PROVIDER_CLEAR_VALIDATE_MEETING);
export const validateMeetingError = createAction(constants.PROVIDER_VALIDATE_MEETING_ERROR);

export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta)


function getExpirationForAccess(access) {
    // set expiration time (minues 60 seconds)
    const expiresInSeconds = parseInt(access.expires_in, 10);
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + (expiresInSeconds - 60));
    return expires.getTime();
}

export function selectProvider(providerType) {
  return async function (dispatch, getState) {
    dispatch(providerSelected(providerType));
    const userId = getState().provider.currentUserId;
    if (isTypeSupported(providerType)) {
      track("Provider_Selected", userId, {
        "provider" : providerType,
        "supported" : true
      });
      //RouterActions.login({type: 'push'});
      const { authenticatedProviders } = getState().provider;
      if(authenticatedProviders.hasOwnProperty(providerType)) {
        RouterActions.providerDashboard({type: 'push'});
        return;
      } else {
        RouterActions.login({type: 'push'});
        return;
      }
    } else {
      track("Provider_Selected", userId, {
        "provider" : providerType,
        "supported" : false
      })
      RouterActions.unsupported({type: 'push'});
      return;
    };
  }
}

export function requestAuthSignin() {
    return async function (dispatch, getState) {
        const userId = getState().provider.currentUserId;
        Alert.alert(
        'Authentication Required',
        'Please sign in to GoToMeeting to start using Meeting Remote',
        [
          { text: 'Cancel', 
            onPress: () => {
              track('SIGN_IN_ALERT_CANCELED', userId);
            }, 
            style: 'cancel'
          },
          { text: 'Sign In', 
            onPress: () => {
              RouterActions.login({type: 'replace'}); 
              track('SIGN_IN_ALERT_GRANTED', userId);
            }
          },
        ],
        { cancelable: false }
      )
    }
}

function checkAndUpdateProviderAuth(providerType) {
    return async function (dispatch, getState) {
      const state = getState();
      const providerAuth = state.provider.authenticatedProviders[providerType];
      var checkResp;
      try{
        checkResp = await gtm.checkStaleAccess(providerAuth.access);
      }catch(ex){
        Sentry.captureMessage("exception calling checkStaleAccess");
        console.log(ex);
        //RouterActions.login({type: 'replace'});
        return;
      }
      
      if(checkResp.refreshed) {
        providerAuth.access = checkResp.access;
        providerAuth.access.expiresAt = getExpirationForAccess(checkResp.access);
        dispatch(providerAuthReceived({providerType, providerAuth, userId: checkResp.access.organizer_key}));
      }
      return providerAuth;
    }
}

export function handleAuthResponse(providerType, access) {
  return async function (dispatch, getState) {
  	  const oauthProfile = {
  	  	firstName: access.firstName,
  	  	lastName: access.lastName,
  	  	email: access.email
  	  };

      const userId = access.organizer_key;
      identify(userId, oauthProfile);
      track('USER_LOGIN', userId, oauthProfile);
      Sentry.setUserContext({ email: oauthProfile.email });

      access.expiresAt = getExpirationForAccess(access);

      gtm.getProfileInformation(access)
      .then((gtmProfile) => {
        const providerAuth = {access, profile: Object.assign(oauthProfile, gtmProfile)};
        dispatch(providerAuthReceived({providerType, providerAuth, userId: access.organizer_key}));
      });
  }
}

export function confirmLogout() {
  return async function (dispatch, getState) {
      const state = getState();
      const userId = state.provider.currentUserId;
      const providerType = state.provider.currentProviderType;
      const profile = state.provider.authenticatedProviders[providerType].profile;
      Alert.alert(
        'Logout?',
        `Are you sure you want to logout as "${profile.email}"`,
        [
          { text: 'Cancel', 
            onPress: () => {
              track('USER_LOGOUT_CANCELED', userId);
            }, 
            style: 'cancel'
          },
          { text: 'Logout', 
            onPress: () => {
              dispatch(providerAuthCleared({providerType}))
              RouterActions.providerDashboard({type: 'replace'}); 
              track('USER_LOGOUT', userId);
            }
          },
        ],
        { cancelable: false }
      )
  }
}

export function startMeetingWithId(options, meetingId) {
  return async function (dispatch, getState) {
      const {providerType, peripheral, meetingType, deviceType, subject} = options;
      dispatch(providerLaunchRequested({providerType, deviceId: peripheral.id, meetingType, deviceType}));
      const providerAuth = await dispatch(checkAndUpdateProviderAuth(providerType));
      //only supports gtm for now
      gtm.startMeetingApiCall(providerAuth.access, meetingId)
      .then((resp) => {
        console.log(resp);
        if(resp.int_err_code) {
          throw new Error(resp.int_err_code);
        }
        dispatch(providerLaunchCodeGranted({
          providerType, 
          launchId: uuidv4(),
          launchType: 'start', 
          launchCode: resp.hostUrl, 
          meetingId: meetingId, 
          roomName: peripheral.advertisement.localName,
          subject
        }));
        dispatch(bluetoothActions.associatePeripheral(peripheral));
      });
  }
}

export function startAdHocMeeting(options) {
  return async function (dispatch, getState) {
      const {providerType, peripheral, meetingType, deviceType, subject} = options;
      dispatch(providerLaunchRequested({providerType, deviceId: peripheral.id, meetingType, deviceType}));
      const providerAuth = await dispatch(checkAndUpdateProviderAuth(providerType));
      //only supports gtm for now
      gtm.getAdHocGtmLauchUrl(providerAuth.access)
      .then((resp) => {
        dispatch(providerLaunchCodeGranted({
          providerType, 
          launchId: uuidv4(),
          launchType: 'start', 
          launchCode: resp.hostUrl, 
          meetingId: resp.meetingId, 
          roomName: peripheral.advertisement.localName,
          subject
        }));
        dispatch(bluetoothActions.associatePeripheral(peripheral));
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export function joinMeeting(options, id) {
  return async function (dispatch, getState) {
    console.log("inside join");
      const {providerType, peripheral, meetingType, deviceType, subject} = options;
      dispatch(providerLaunchRequested({providerType, deviceId: peripheral.id, meetingType, deviceType}));
      //only supports gtm for now
      dispatch(providerLaunchCodeGranted({
        providerType, 
        launchId: uuidv4(),
        launchType: 'join', 
        meetingId: id, 
        roomName: peripheral.advertisement.localName,
        subject
      }));
      dispatch(bluetoothActions.associatePeripheral(peripheral));
  }
}

export function checkMeetingId(meetingId) { 
  return async function (dispatch, getState) {
    gtm.checkMeetingId(meetingId)
      .then((resp) => {
        console.log(resp);
        dispatch(validateMeeting({code: resp.meetingId, meetingId: resp.meetingId}));
      })
      .catch((err) => {
        dispatch(validateMeetingError(err));
        console.log(err);
      });
  };
}

export function checkProfileId(profileId) { 
  return async function (dispatch, getState) {
    if (profileId.indexOf('.') >= 0) {
      dispatch(validateMeetingError(undefined));
        return Promise.resolve();
    }
    return gtm.checkProfileId(profileId)
        .then((resp) => {
          console.log(resp);
          dispatch(validateMeeting({code: resp.profileId, meetingId: resp.meetingId}));
        })
        .catch((err) => {
          dispatch(validateMeetingError(err));
          console.log(err);
        });
  };
}

export function endMeeting(options) {
  return async function (dispatch, getState) {
      const {providerType, peripheral, meetingId} = options;
      dispatch(providerSessionKillRequested({providerType, meetingId}));
      const {access} = getState().provider.authenticatedProviders[providerType];
      dispatch(bluetoothActions.attemptDisconnect(peripheral, true));
      const state = getState();
      const userId = state.provider.currentUserId;
      const launchId = state.provider.lastLaunchId;
      track('MEETING_END_TRIGGERED', userId, {meetingId, launchId, roomName: peripheral.advertisement.localName});
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

    dispatch(providerLoadUpcomingMtgsStart({providerType}));

    const providerAuth = await dispatch(checkAndUpdateProviderAuth(providerType));

    gtm.loadUpcomingMeetings(providerAuth.access)
    .then((upcomingMeetings) => {
      dispatch(providerLoadUpcomingMtgsEnded({providerType, upcomingMeetings}));
    })
    .catch((err) => {
      console.log(err);
      if(err === 403) {
        RouterActions.login({type: 'replace'});
        return;
      }
      dispatch(providerLoadUpcomingMtgsError(err));
    });
  }
}

export function shareLink(meetingId) {
  return async function (dispatch, getState) {
      const state = getState();
      const userId = state.provider.currentUserId;
      const launchId = state.provider.lastLaunchId;
      track('MEETING_SHARE_TRIGGERED', userId, {meetingId, launchId});
      Share.share({
          message: 'Join my meeting!',
          url: `https://global.gotomeeting.com/join/${meetingId}`,
          title: 'Share meeting link'
      }).then((result) => {
        if(result.action == "sharedAction") {
          launchData.launchCode = null;
          track('MEETING_LINK_SHARED', userId, {meetingId, launchId, ...result});
        }else{
          track('MEETING_SHARE_DISMISSED', userId, {meetingId, launchId});
        }
      });
      dispatch(meetingLinkShared({meetingId}));
  }
}
