import React, { Component } from 'react';
import {
  ActivityIndicator,
  Button,
  TextStyle,
  StyleSheet,
  Text,
  ListView,
  Image,
  View,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput
} from 'react-native';
import { connect } from 'react-redux';


export default class ProviderButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const bgColor = (this.props.disabled) ? "#666666" : "#fa7c2d";
    return (
      <View style={[styles.wrapper, {backgroundColor: bgColor}]}>
          <Button
              style={styles.button}
              disabled={this.props.disabled}
              color={"#ffffff"}
              onPress={this.props.onPress} 
              title="Launch Meeting" />
      </View> 
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 5,
    backgroundColor: "#fa7c2d",
  },
  button: {
    backgroundColor: "#fa7c2d",
    color: "#ffffff"
  }
});