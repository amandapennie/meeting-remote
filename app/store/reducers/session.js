import { handleActions, handleAction, Action } from 'redux-actions';
import * as session from '../actions/session';
import { getInitialState } from '../state';
import { REHYDRATE } from 'redux-persist';

const initialState = getInitialState().session;

export default handleActions(
  {
    [session.constants.CREATE]: (state, action) => {

      const user = action.payload.user;
      return Object.assign({}, state, {
        valid: true,
        validating: false,
        user: user,
      });
    },

    [session.constants.SET_VALIDITY]: (state, action) => {
      const validity = action.payload;

      if (validity) {
        return Object.assign({}, state, {
          valid: action.payload,
          validating: false,
        });
      }

      return initialState;
    },

    [session.constants.SET_USER]: (state, action) => {
      const user = action.payload;
      return Object.assign({}, state, { user });
    },

    [REHYDRATE]: (state, action) => {
        let user = {};
        // let session = action.payload.session;
        // if (session && session.user) {
        //   user = session.user;
        // }

        if (Object.keys(user).length === 0) {
          return state;
        }

        return Object.assign({}, state, {user});
      },
  },
  initialState
);
