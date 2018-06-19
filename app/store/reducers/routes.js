import { handleActions, handleAction } from 'redux-actions';
import { ActionConst } from 'react-native-router-flux';
import { getInitialState } from '../state';

const initialState = getInitialState().routes;

// This only for the purpose of the router, mostly extracted from
// https://github.com/aksonov/react-native-router-flux/blob/master/docs/REDUX_FLUX.md
export default handleActions(
  {
    [ActionConst.FOCUS]: (state, action) => Object.assign({}, state, { scene: action.scene }),
  },
  initialState
);
