import { combineReducers } from 'redux';
import { Action } from 'redux-actions'
import { getInitialState } from '../state';
import * as sessionActions from '../actions/session';

import routes from './routes';
import session from './session';
import bluetooth from './bluetooth';
import init from './init';
import conferenceSystems from './conferenceSystems';

export const appReducer = combineReducers({
  routes,
  session,
  bluetooth,
  init,
  conferenceSystems
});

export const AUTOREDUCE = 'autoreduce';

/**
 *  Autoreduced actions.
 *
 *  We are using global reducers, namely, genericLoadingReducer and genericErrorReducer
 *  to automatically reduce:
 *
 *  - `autoreduce ${stateSpace}/${nakedAction}`
 *
 *  where nakedAction can be:
 *  - `ERROR`
 *  - `LOADING_START`
 *  - `LOADING_END`
 *
 *  You just need to prefix the action type string literal with `autoreduce`.
 *
 *  # ERROR actions
 *
 *  will simply put `action.payload.message` in `state[stateSpace].error`
 *
 *  # LOADING_START
 *
 *  will set `state[stateSpace].loading = true
 *
 *  # LOADING_END
 *
 *  will set `state[stateSpace].loading = false` and `state[stateSpace].error = ''`
 *
 *  If you need more control over any similar reducer then just write your own :)
 *
 */

function parseActionType(actionType) {
  actionType = actionType.replace(`${AUTOREDUCE} `, '');

  try {
    const [stateSpaceKey, nakedAction] = actionType.split('/');
    return [stateSpaceKey, nakedAction];

  } catch (err) {
    return ['', ''];
  }
}

function genericLoadingReducer(state, action){
  const [stateSpaceKey, nakedAction] = parseActionType(action.type);
  const stateSpace = state[stateSpaceKey];
  let updatedStateSpace: any;

  if (nakedAction === 'LOADING_START') {
    updatedStateSpace = Object.assign({}, stateSpace, {loading: true, error: ''});
  } else if (nakedAction === 'LOADING_END') {
    updatedStateSpace = Object.assign({}, stateSpace, {loading: false});
  } else {
    console.warn('Malformed LOADING action type', action);
  }


  return Object.assign({}, state, {[stateSpaceKey]: updatedStateSpace});
}

function genericErrorReducer(state, action) {
  const [stateSpaceKey, nakedAction] = parseActionType(action.type);
  const stateSpace = state[stateSpaceKey];
  let updatedStateSpace: any;

  if (nakedAction === 'ERROR') {
    let message = 'Something wrong happened';

    try {
      if (typeof action.payload === 'string') {
        message = action.payload;
      } else {
        const errorMessage = action.payload.message;
        message =  errorMessage ? errorMessage : message;
      }
    } catch (e) {}

    updatedStateSpace = Object.assign({}, stateSpace, { error: message });

  } else {
    console.warn('Malformed ERROR action type', action);
  }

  return Object.assign({}, state, {[stateSpaceKey]: updatedStateSpace});
}


export default function rootReducer(state, action) {
  if (action.type === sessionActions.constants.LOGOUT_END) {
    const initialState = getInitialState();
    const init = Object.assign({}, initialState.init, { rehydrated: true});
    return Object.assign(initialState, { init });
  }

  if (action.type.startsWith(AUTOREDUCE)) {
    const [stateSpaceKey, nakedAction] = parseActionType(action.type);

    if (nakedAction.startsWith('LOADING')) {
      return genericLoadingReducer(state, action);
    }

    if (nakedAction.startsWith('ERROR')) {
      return genericErrorReducer(state, action);
    }
  }

  return appReducer(state, action);
}
