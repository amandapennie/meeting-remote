import React, { Component } from 'react';
import { View } from 'react-native';
import Config from  '../config';


export default class HorizontalRule extends React.Component {
  render() {
    return (
      <View
        style={{
          marginTop: this.props.marginTop || 5,
          width: this.props.width || '100%',
          borderBottomColor: this.props.color || Config.colors.lightGrey,
          borderBottomWidth: this.props.thickness || 1 }} />
    );
  }
}
            