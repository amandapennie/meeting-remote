import { Dispatch } from 'redux';
import { createAction, Action } from 'redux-actions';

export const constants = {
  INSERT: 'conferenceSystems/INSERT',
  UPDATE: 'conferenceSystems/UPDATE',
  DELETE: 'conferenceSystems/DELETE',

  LOADING_START: 'autoreduce conferenceSystems/LOADING_START',
  LOADING_END: 'autoreduce conferenceSystems/LOADING_END',
  ERROR: 'autoreduce conferenceSystems/ERROR'
};

const loadingStart = createAction(constants.LOADING_START);
const loadingEnd = createAction(constants.LOADING_END);
export const setError = createAction(constants.ERROR, undefined, (payload, meta) => meta)


const insert = createAction(constants.INSERT);



