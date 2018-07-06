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


export default class JoinMeetingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {code: null};
  }

  onJoinCodeChange = (text) => {

  }

  render() {
    return (
      <View>
        <Text style={{color: "#cfdaee", marginLeft: 10, fontSize: 18}}>or Join a meeting:</Text>
        <View style={{padding: 10}}>
          <TextInput
            style={{height: 40, borderColor: 'gray', textAlign: 'center', borderWidth: 1, backgroundColor: "#ffffff"}}
            onBlur={Keyboard.dismiss}
            onChangeText={this.onJoinCodeChange}
            placeholder="Enter a Meeting ID or name"
            placeholderTextColor="#666666"
            value={this.state.code}/>
          </View>
      </View> 
    );
  }
}