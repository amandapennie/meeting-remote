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
               Personal Code: {this.props.title}
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
      <View style={{flex: 1, paddingTop: 25}}>
        <Text style={{color: Config.colors.lightGrey, marginLeft: 10, fontSize: 15, textAlign: 'center'}}>Select your meeting:</Text>
        <View
          style={{
            marginTop: 7,
            width: '100%',
            borderBottomColor: Config.colors.lightGrey,
            borderBottomWidth: 1 }} />
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