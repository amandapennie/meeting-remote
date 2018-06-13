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
  Scan 
} from './app/containers';

const scenes = Actions.create(
  <Scene key="root">
      <Scene key="landing" component={Landing} hideNavBar={true} title="Landing"/>
      <Scene key="scan" component={Scan} hideNavBar={true} title="Scan"/>
      <Scene key="connected" component={Connected} hideNavBar={true} title="Connected"/>
      <Scene key="login" component={Login} hideNavBar={true} title="Login"/>
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

//export default Login;
// export default class Application extends React.Component {
//   render() {
//     return (
//       <View style={styles.container}>
//         <Text>Open up App.js to start working on your app!</Text>
//         <Text>Changes you make will automatically reload.</Text>
//         <Text>Shake your phone to open the developer menu.</Text>
//       </View>
//     );
//   }
// }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
