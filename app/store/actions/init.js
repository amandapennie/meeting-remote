import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import { Actions as RouterActions } from 'react-native-router-flux';
import * as session from './session';

export const constants = {
  INIT_START: 'init/START',
  INIT_END: 'init/END',
};

export const initStart = createAction(constants.INIT_START);
export const initEnd = createAction(constants.INIT_END);


export function start() {
  return async function (dispatch, getState) {
    const { done, loading } = getState().init;
    if (done || loading) {
      return;
    }

    dispatch(initStart());

    let isLoggedIn = false;
    let user = {};

    // try {
    //   isLoggedIn = await xively.comm.checkJwt();
    // } catch(e) {}

    RouterActions.session({type: 'replace'});

    if (isLoggedIn) {
      dispatch(session.setValidity(true));
      //await dispatch(loadData());
      RouterActions.scan({type: 'replace'});
    } else {
      dispatch(session.setValidity(false));
    }


    dispatch(initEnd());
  };
}

export function loadData() {
  return async function (dispatch, getState) {
    await dispatch(jackets.fetchAll());
  };
}
