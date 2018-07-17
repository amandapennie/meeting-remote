import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';

import Config from '../config';


export default class LoadingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  onPress = () => {

  }

  render() {
    return (
      <View style={styles.container}>
          <View>
            <ActivityIndicator
              color="#ffffff"
              size="large" />
            <Text style={{color: '#ffffff', marginTop: 10}}>{this.props.message}</Text>
          </View>
      </View> 
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Config.colors.darkGrey
  },
  button: {
    backgroundColor: "#fa7c2d",
    color: "#ffffff"
  }
});