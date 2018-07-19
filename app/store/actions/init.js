import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import { Actions as RouterActions } from 'react-native-router-flux';
import { track } from '../../tracking';

export const constants = {
  INIT_START: 'init/START',
  INIT_END: 'init/END',
};

export const initStart = createAction(constants.INIT_START);
export const initEnd = createAction(constants.INIT_END);


export function start() {
  return async function (dispatch, getState) {
    const state = getState();
    const { done, loading } = state.init;
    if (done || loading) {
      return;
    }

    dispatch(initStart());

    RouterActions.providerDashboard({type: 'replace'});

    const userId = state.provider.currentUserId;
    track('APP_LAUNCHED', userId);

    dispatch(initEnd());
  };
}

