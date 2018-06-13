import { Dispatch } from 'redux';
import { createAction, Action } from 'redux-actions';
import { Actions as RouterActions } from 'react-native-router-flux';

export const constants = {
  SET_USER: 'session/SET_USER',
  USER_INFO: 'session/USER_INFO',
  CREATE: 'session/CREATE',
  SET_VALIDITY: 'session/SET_VALIDITY',

  LOGOUT_START: 'session/LOGOUT_START',
  LOGOUT_END: 'session/LOGOUT_END',
};


const logoutStart = createAction(constants.LOGOUT_START);
const logoutEnd = createAction(constants.LOGOUT_END);


export const create = createAction(constants.CREATE);
export const setValidity = createAction(constants.SET_VALIDITY);
export const setUser = createAction(constants.SET_USER);
