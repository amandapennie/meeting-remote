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
  FlatList
} from 'react-native';
import { connect } from 'react-redux';
import Config from '../../config';
import HorizontalRule from '../HorizontalRule';


class MeetingListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? "#ffffff" : Config.colors.lightGrey;
    const fontWeight = this.props.selected ? 'bold': 'normal';

    if(this.props.id == "profileId") {
      return (
        <TouchableOpacity onPress={this._onPress}>
          <View style={{paddingTop: 12}}>
            <Text style={{ color: textColor, fontWeight }}>
               New Meeting: {this.props.title}
            </Text>
            <HorizontalRule marginTop={12} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={{paddingTop: 12}}>
          <Text style={{ color: textColor, fontWeight }}>
            {this.props.title}
          </Text>
          <HorizontalRule marginTop={12} />
        </View>
      </TouchableOpacity>
    );
  }
}


class MeetingSelectList extends React.PureComponent {
  _keyExtractor = (item, index) => item.id.toString();

  _onPressItem = (id) => {
    this.props.onSelected(id);
  };

  _renderItem = ({item}) => (
    <MeetingListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={this.props.selected == item.id}
      title={item.title} />
  );

  render() {
    return (
      <FlatList
        refreshing={this.props.refreshing}
        onRefresh={this.props.onRefresh}
        data={this.props.data}
        extraData={this.props}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem} />
    );
  }
}

export default class MeetingChoicesView extends React.Component {
  render() {
    const meetingChoices = [
      {id: 'profileId', title: this.props.profileId}
    ];

    if(this.props.meetings && this.props.meetings.isArray) {
      this.props.meetings.map((meeting) => {
        var start = "";
        if(meeting.startTime) {
          try{
            var startTime = new Date(meeting.startTime.substring(0, 19));
            start = `@ ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
          }catch(e){
            //pass
          }
        }
        meetingChoices.push({
          id: meeting.meetingId,
          title: `${meeting.subject} ${start}`
        })
      });
    }


    return (
      <View style={{flex: 1, paddingTop: 25, paddingBottom: 10}}>
        <Text style={{color: Config.colors.lightGrey, marginLeft: 10, fontSize: 15, textAlign: 'center'}}>Available Meetings</Text>
        <View
          style={{
            marginTop: 7,
            width: '100%',
            borderBottomColor: Config.colors.lightGrey,
            borderBottomWidth: 1 }} />
        <MeetingSelectList data={meetingChoices}
                refreshing={this.props.refreshing}
                onRefresh={this.props.onRefresh}
                selected={this.props.selected}
                onSelected={this.props.onSelected} />
      </View> 
    );
  }
}