import {AsyncStorage} from 'react-native'
// const createLogger = require('redux-logger');
// const freeze = require('redux-freeze');
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { applyMiddleware, createStore, compose, combineReducers, Store, Middleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import { getInitialState } from './state';
import rootReducer from './reducers/index';
import { bluetoothMiddleware } from './middleware';

const persistConfig = {
 key: 'root',
 storage: storage,
 
};

// TODO make sure that on logout we are cleaning the state

// Middlewares and Store Enhancers we are using now are:
// - redux-logger - adds a pretty console.log statement for every state change in redux
// - redux-thunk - allows injection of the dispatcher into actions so that they can dispatch further actions
// - redux-freeze - freeze the state so no misterious modifications are performed

const initialState = getInitialState() 
const middlewareArray: Middleware[] = [
    ReduxThunk,
    bluetoothMiddleware,
];

// Only log actions and freeze state when developing
// cause they have runtime cost
// const logger = createLogger();
// if (__DEV__) {
//   middlewareArray.push(logger);
//   middlewareArray.push(freeze);
// }

const pReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(pReducer, initialState, applyMiddleware(...middlewareArray));
export const persistor = persistStore(store)
