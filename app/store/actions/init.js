import { Dispatch } from 'redux';
import { createAction } from 'redux-actions';
import { Actions as RouterActions } from 'react-native-router-flux';
import { track } from '../../tracking';
import { Sentry } from 'react-native-sentry';

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

    // set user context
    try {
      const provider = state.provider;
      const profile = state.provider.authenticatedProviders[provider.currentProviderType].profile;
      Sentry.setUserContext({ email: profile.email });
    }catch(ex) {
      //fail silently
    }

    RouterActions.providerDashboard({type: 'replace'});

    const userId = state.provider.currentUserId;
    track('APP_LAUNCHED', userId);

    dispatch(initEnd());
  };
}

