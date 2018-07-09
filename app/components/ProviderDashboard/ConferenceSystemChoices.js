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
import Icon from 'react-native-vector-icons/dist/FontAwesome';


class ConferenceSystemListItem extends React.PureComponent {
  _onPress = () => {
    this.props.onPressItem(this.props.item);
  };

  render() {
    const textColor = this.props.selected ? "#fa7c2d" : "#cfdaee";

    return (
      <TouchableOpacity onPress={this._onPress}>
        <View style={{flex: 1, flexDirection: 'row'}}>
            <View style={{padding: 15}}>
              <Icon name="tv" size={30} color={textColor} />
            </View>
            <View style={{padding: 15}}>
              <Text style={{ color: textColor }}>
                {this.props.title}
              </Text>
              <Text>{this.props.id}</Text>
            </View>
        </View>
      </TouchableOpacity>
    );
  }
}


class ConferenceSystemSelectList extends React.PureComponent {
  _keyExtractor = (item, index) => item.id.toString();

  _onPressItem = (id) => {
    this.props.onSelected(id);
  };

  _renderItem = ({item}) => (
    <ConferenceSystemListItem
      id={item.id}
      item={item}
      onPressItem={this._onPressItem}
      selected={(this.props.selected) ? this.props.selected.id == item.id : false}
      title={item.advertisement.localName} />
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

export default class ConferenceSystemChoicesView extends React.Component {

  render() {
    const { bluetoothState } = this.props;

    // if not poweredOn need to tell them to turn on bluetooth
    if(bluetoothState.bluetoothHardwareState !== "poweredOn") {
      return (
        <View style={{flex: 0.5, paddingTop: 10, backgroundColor: Config.colors.mediumGrey}}>
          <Text style={{color: "#ffffff", marginLeft: 10, fontSize: 18, textAlign: 'center'}}>Conference Rooms Near Me:</Text>
          <View style={{flex: 1, paddingTop: 30}}>
              <Text style={styles.bleStatusMessage}>Turn on bluetooth</Text>
              <Text style={styles.bleStatusMessage}>to find nearby devices</Text>
          </View>
        </View>
      );
    }

    const discoveredPeripherals = Object.values(bluetoothState.discoveredPeripherals);
    return (
      <View style={{paddingTop: 10, backgroundColor: Config.colors.mediumGrey}}>
          <View style={{flexDirection: 'row'}}>
              <View style={{flex:1}}>
                <Text style={{color: "#ffffff", marginLeft: 10, fontSize: 18, textAlign: 'center'}}>Conference Rooms Near Me:</Text>
              </View>
              <View style={{paddingRight: 10}}>
                <ActivityIndicator animating={bluetoothState.scanning} size="small" color="#fff" />
              </View>
          </View>
          <View style={{flex: 1}}>
              <ConferenceSystemSelectList 
                data={discoveredPeripherals} 
                selected={this.props.selected}
                onSelected={this.props.onSelected} />
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25
  },
  bleStatusMessage: {
    textAlign: 'center', 
    color: Config.colors.darkGrey
  }
});