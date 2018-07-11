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
    const textColor = this.props.selected ? Config.colors.darkGrey : Config.colors.darkGrey;
    const bgColor = this.props.selected ? "#ffffff" : Config.colors.lightGrey;

    return (
      <TouchableOpacity onPress={this._onPress} style={{width: '48%', margin:5, padding: 10, backgroundColor: bgColor, borderRadius: 5}}>
          <Text style={{ color: textColor }}>
            {this.props.item.advertisement.localName}
          </Text>
      </TouchableOpacity>
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
    //sort for closest rooms
    discoveredPeripherals.sort((a,b) => { 
      if (a.rssi > b.rssi) {
        return 1
      } 

      if(b.rssi > a.rssi) {
        return -1;
      }

      return 0;
    });
    console.log(discoveredPeripherals.length);
    const emptiesLength =  (discoveredPeripherals.length >= 4) ? 0 : 4 - discoveredPeripherals.length;
    var data = [];
    for(var i = 0; i < emptiesLength; i++) {
        data.push({});
    }
    const choices = discoveredPeripherals.concat(data);


    return (
      <View style={{flex: 0.5, paddingTop: 10, paddingLeft: 20, paddingRight: 20, backgroundColor: Config.colors.mediumGrey}}>
          <View style={{flexDirection: 'row'}}>
              <View style={{flex:1}}>
                <Text style={{color: "#ffffff", marginLeft: 10, fontSize: 18, textAlign: 'center'}}>Conference Rooms Near Me:</Text>
              </View>
              <View style={{paddingRight: 10}}>
                <ActivityIndicator animating={bluetoothState.scanning} size="small" color="#fff" />
              </View>
          </View>
              <View>
                <Text style={{color: Config.colors.lightGrey, marginLeft: 10, fontSize: 12, textAlign: 'center'}}>select conference room to begin</Text>
              </View>
          <View style={{flex: 1, flexWrap: 'wrap'}}>
              { choices && choices.map((item, i) => {
                    if(item.id){
                      return (
                          <ConferenceSystemListItem 
                                key={item.id} 
                                id={item.id} 
                                item={item} 
                                selected={this.props.selected && this.props.selected.id === item.id}
                                onPressItem={this.props.onSelected} />
                      );
                    }else{
                      return (
                            <View key={i} onPress={this._onPress} style={{width: '48%',  margin:5, padding: 10, backgroundColor: Config.colors.darkGrey, borderRadius: 5}}><Text>{` `}</Text></View>
                      );
                    }
                }
              )}
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