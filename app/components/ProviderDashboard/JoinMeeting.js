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
import * as providerActions from '../../store/actions/provider';
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
        this.props.checkProfileId(targetValue.replace(this.profileIdPrefix, ''));
      } else {
        this.props.checkMeetingId(targetValue.replace(/-/g, ''));
      }
    }
  };

  onJoinCodeChange = (text) => {
    const targetValue = formatId(cleanId(text, this.profileIdPrefix), this.profileIdPrefix);

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

  hasValidJoinCode = (joinMeetingInputValue) => {
    return this.validateOnChange(this.state.joinMeetingInputValue);
  };

  render() {
    console.log(this.state.joinMeetingInputValue !== "");
    const hasValidCode = (this.state.joinMeetingInputValue === "" || typeof this.props.validJoinCode !== 'undefined');
    const bColor = (hasValidCode) ? 'gray' : 'red';
    return (
      <View>
        <View style={{paddingTop: 50}}>
          <TextInput
            autoFocus={true}
            style={{height: 40, borderColor: bColor, textAlign: 'center', borderWidth: 1, backgroundColor: "#ffffff"}}
            onBlur={Keyboard.dismiss}
            onChangeText={this.onJoinCodeChange}
            placeholder="Enter a Meeting ID or name"
            placeholderTextColor="#666666"
            value={this.state.joinMeetingInputValue}/>
          { hasValidCode && <Text style={{color: 'gray', textAlign: 'center', padding: 5}}>For example, 123-456-789 or 'name' for gotomeet.me/name</Text> }
          { !hasValidCode && <Text style={{color: 'red', textAlign: 'center', padding: 5}}>This meeting ID is invalid. Please check your invitation and try again</Text> }
        </View>
      </View> 
    );
  }
}