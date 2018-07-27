import './shim.js'
import React from 'react';
import { Actions, Scene, Router, ActionConst } from 'react-native-router-flux';
import VersionNumber from 'react-native-version-number';
import { connect, Provider } from 'react-redux';
import { YellowBox } from 'react-native';
import { store, persistor } from './app/store';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { Sentry } from 'react-native-sentry';
import { SENTRY_PUBLIC_DSN, SENTRY_ENVIRONMENT } from 'react-native-dotenv';

import { 
  Connected,
  Landing, 
  Login, 
  ProviderDashboard,
  Main,
  Unsupported,
  Session,
  MeetingReview
} from './app/containers';

if (typeof process === 'undefined') process = {};
process.nextTick = setImmediate;

Array.prototype.isArray = true;

// suppress warnings
YellowBox.ignoreWarnings([
  'Remote debugger is in a background tab which may cause apps to perform slowly. Fix this by foregrounding the tab (or opening it in a separate window).',
  'Warning: isMounted(...) is deprecated in plain JavaScript React classes. Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks.', 
  'Module RCTImageLoader',
  'Module RNBLE requires main queue setup since it overrides `init` but doesn\'t implement `requiresMainQueueSetup`. In a future release React Native will default to initializing all native modules on a background thread unless explicitly opted-out of.'
]);

//sentry error logging
Sentry.config(SENTRY_PUBLIC_DSN).install();

Sentry.setTagsContext({
  "appVersion": VersionNumber.appVersion,
  "environment": SENTRY_ENVIRONMENT,
  "react": true
});

const scenes = Actions.create(
  <Scene key="root">
      <Scene key="landing" component={Landing} hideNavBar={true} title="Landing"/>
      <Scene key="main" component={Main} hideNavBar={true} title="Main"/>
      <Scene key="providerDashboard" component={ProviderDashboard} hideNavBar={true} title="ProviderDashboard"/>
      <Scene key="session" component={Session} hideNavBar={true} title="Session"/>
      <Scene key="connected" component={Connected} hideNavBar={true} title="Connected"/>
      <Scene key="login" component={Login} hideNavBar={true} title="Login"/>
      <Scene key="meetingReview" component={MeetingReview} hideNavBar={true} title="Review"/>
      <Scene key="unsupported" component={Unsupported} hideNavBar={false} title="Unsupported"/>
  </Scene>
);

class Routes extends React.Component {
  render() {
    return (
      <Router scenes={ scenes } />
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
