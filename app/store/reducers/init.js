import { handleActions } from 'redux-actions';
import * as init from '../actions/init';
import { getInitialState } from '../state';
import { REHYDRATE } from 'redux-persist';

const initialState = getInitialState().init;
export default handleActions(
  {
    [init.constants.INIT_START]: state => Object.assign({}, state, {
      done: false,
      loading: true,
    }),

    [init.constants.INIT_END]: state => Object.assign({}, state, {
      done: true,
      loading: false,
    }),

    [REHYDRATE]: (state) => {
      return Object.assign({}, state, { rehydrated: true })
    },
  },
  initialState
);

