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
  TextInput,
  Keyboard
} from 'react-native';
import { connect } from 'react-redux';
import { gtm } from '../../providers';
import { formatId, cleanId } from '@getgo/format-meeting-id';


export default class JoinMeetingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joinMeetingInputValue: '',
    };
    this.joinMeetingIdTimer = '';
    this.profileIdPrefix = 'gotomeet.me/';
  }

  validateOnChange = targetValue => {
    clearTimeout(this.joinMeetingIdTimer);
    this.joinMeetingIdTimer = setTimeout(this.validate, 500, targetValue);
  }

  validate = targetValue => {
    if (targetValue) {
      if (targetValue.includes(this.profileIdPrefix)) {
        gtm.checkProfileId(targetValue.replace(this.profileIdPrefix, ''));
      } else {
        gtm.checkMeetingId(targetValue.replace(/-/g, ''));
      }
    }
  };

  onJoinCodeChange = (event) => {
    const input = event.target.value;
    const targetValue = formatId(cleanId(input, this.profileIdPrefix), this.profileIdPrefix);

    this.setState({
      joinMeetingInputValue: targetValue,
    });

    this.validateOnChange(targetValue);
  };

  clearInputValidation = () => {
    this.setState({
      joinMeetingInputValue: ''
    });
  };

  render() {
    return (
      <View>
        <View style={{paddingTop: 50}}>
          <TextInput
            autoFocus={true}
            style={{height: 40, borderColor: 'gray', textAlign: 'center', borderWidth: 1, backgroundColor: "#ffffff"}}
            onBlur={Keyboard.dismiss}
            onChangeText={this.onJoinCodeChange}
            placeholder="Enter a Meeting ID or name"
            placeholderTextColor="#666666"
            value={this.state.joinMeetingInputValue}/>
          </View>
      </View> 
    );
  }
}