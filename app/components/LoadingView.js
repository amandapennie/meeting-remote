import React, { Component } from 'react';
import {
  ActivityIndicator,
  TextStyle,
  StyleSheet,
  Text,
  ListView,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Dimensions
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';


export default class LoadingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, ...Dimensions.get('window') };
  }

  onPress = () => {

  }

  render() {
    return (
      <LinearGradient start={{x: 0.0, y: 0.25}} end={{x: 0.5, y: 1.0}} colors={['#515f75', '#886952', '#515f75']} style={styles.container}>
          <ActivityIndicator
            color="#ffffff"
            style={{ position: "absolute", top: this.state.height / 2, left: (this.state.width / 2) - 15 }}
            size="large" />
      </LinearGradient> 
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25
  },
  button: {
    backgroundColor: "#fa7c2d",
    color: "#ffffff"
  }
});