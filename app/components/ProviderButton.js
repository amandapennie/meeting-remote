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
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import Config from '../config';


export default class ProviderButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const propStyles = this.props.style || {};
    const bgColor = (this.props.disabled) ? Config.colors.lightGrey :  this.props.activeColor || "#ffffff";
    const textColor = this.props.activeTextColor || Config.colors.darkGrey;
    return (
      <TouchableOpacity 
          style={[styles.wrapper, {backgroundColor: bgColor}, propStyles]}
          onPress={(this.props.disabled) ? () => {return;} : this.props.onPress}>
          {this.props.checked && <Icon name="check-circle" style={{position: 'absolute', top: 3, right: 5, fontSize: 20, color: textColor}} />}
          <Text
              style={[{color: textColor, padding: 0, margin: 0, textAlign: this.props.textAlign || 'left', fontSize: this.props.fontSize || 15}]}>
              {this.props.children}
          </Text>
      </TouchableOpacity> 
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    backgroundColor: "#fa7c2d",
  },
  button: {
    backgroundColor: "#fa7c2d",
    color: "#ffffff"
  }
});