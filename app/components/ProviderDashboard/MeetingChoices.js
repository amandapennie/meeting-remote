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
    const textColor = this.props.selected ? "red" : "black";

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
  state = {selected: 'profileId'};

  _keyExtractor = (item, index) => item.id;

  _onPressItem = (id) => {
    this.setState((state) => {
      const selected = id;
      return {selected};
    });
  };

  _renderItem = ({item}) => (
    <MeetingListItem
      id={item.id}
      onPressItem={this._onPressItem}
      selected={this.state.selected == item.id}
      title={item.title} />
  );

  render() {
    return (
      <FlatList
        data={this.props.data}
        extraData={this.state}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem} />
    );
  }
}

export default class MeetingChoicesView extends React.Component {
  render() {
    return (
      <View>
        <Text>Choose a meeting</Text>
        <MeetingSelectList data={[{id: 'profileId', title: 'BostonSully'}]} />
      </View> 
    );
  }
}