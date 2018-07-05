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


class MeetingListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.id);
  };

  render() {
    const textColor = this.props.selected ? "#fa7c2d" : "#cfdaee";

    if(this.props.id == "profileId") {
      return (
        <TouchableOpacity onPress={this._onPress}>
          <View style={{padding: 15}}>
            <Text style={{ color: textColor }}>
               Personal Code: {this.props.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={{padding: 15}}>
          <Text style={{ color: textColor }}>
            {this.props.title}
          </Text>
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
        data={this.props.data}
        extraData={this.props}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem} />
    );
  }
}

export default class MeetingChoicesView extends React.Component {
  render() {
    return (
      <View style={{flex: 1}}>
        <Text style={{color: "#cfdaee", marginLeft: 10, fontSize: 18}}>Choose your meeting:</Text>
        <MeetingSelectList data={[
          {id: 'profileId', title: 'BostonSully'},
          {id: 123456789, title: 'Daily Standup @ 10:10am'}
        ]}
                selected={this.props.selected}
                onSelected={this.props.onSelected} />
      </View> 
    );
  }
}