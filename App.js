import './shim.js'
import React from 'react';
import { Actions, Scene, Router, ActionConst } from 'react-native-router-flux';
import { connect, Provider } from 'react-redux';
import { StyleSheet, Text, View } from 'react-native';
import { store, persistor } from './app/store';
import { PersistGate } from 'redux-persist/lib/integration/react';

if (typeof process === 'undefined') process = {};
process.nextTick = setImmediate;

import { 
  Connected,
  Landing, 
  Login, 
  ProviderDashboard 
  Main,
  Unsupported 
} from './app/containers';

//      <Scene key="login" component={Login} hideNavBar={true} title="Login"/>

const scenes = Actions.create(
  <Scene key="root">
      <Scene key="landing" component={Landing} hideNavBar={true} title="Landing"/>
      <Scene key="main" component={Main} hideNavBar={true} title="Main"/>
      <Scene key="providerDashboard" component={ProviderDashboard} hideNavBar={true} title="ProviderDashboard"/>
      <Scene key="connected" component={Connected} hideNavBar={true} title="Connected"/>
      <Scene key="login" component={Login} hideNavBar={true} title="Login"/>
      <Scene key="unsupported" component={Unsupported} hideNavBar={false} title="Unsupported"/>
  </Scene>
);

class Routes extends React.Component {
  render() {
    return (
      <Router
        scenes={ scenes } />
    );
  }
}

const RouterWithRedux = connect()(Routes);

export default class Application extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate  persistor={persistor}>
          <RouterWithRedux></RouterWithRedux>
        </PersistGate>
      </Provider>
    )
  }
}
