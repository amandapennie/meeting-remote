import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ListView,
  StatusBar,
  TextStyle,
  ViewStyle,
  ImageStyle,
  View,
  Image,
  TouchableHighlight,
} from 'react-native';

import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Actions as RouterActions } from 'react-native-router-flux';
import * as initActions from '../store/actions/init';


class LandingView extends React.Component {

  // These two hooks are the core of the app.
  // We first let the app rehydrate it's state from disk
  // then, and only then we fire maximum one time the init routine
  componentWillMount() {
    if (this.props.isRehydrated) {
      this.props.init();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isRehydrated && !nextProps.isDoneInitializing) {
      this.props.init();
    }
  }

  render() {
    const { isInitializing, isLoggedIn } = this.props;

    if (isInitializing || isLoggedIn) {
      return (
        <View style={styles.container}>
          <StatusBar hidden={true}/>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        <Text>Should do something here</Text>
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const isRehydrated = state.init.rehydrated;
  const isInitializing = !state.init.done || state.init.loading;
  const isDoneInitializing = state.init.done;
  const isLoggedIn = state.session.valid;

  return {
    isInitializing,
    isLoggedIn,
    isRehydrated,
    isDoneInitializing,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    init: () => dispatch(initActions.start()),
  };
}

const Landing = connect(mapStateToProps, mapDispatchToProps)(LandingView);
export { Landing };

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
    width: null,
    height: null
  },

  container: {
    flex: 1,
    backgroundColor: '#b3b3b3',
  },

  main: {
    flex: 1
  },

  bannerContainer: {
    flex: 3,
    paddingLeft: 40,
    paddingRight: 40,
  },

  bannerText: {
    fontSize: 40,
    color: 'white',
    letterSpacing: 6.58,
    lineHeight: 46,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    textAlign: 'left',
  },

  signInContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 90,
  },
});
