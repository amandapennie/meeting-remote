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
  Platform,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';


class MainView extends React.Component {
  render() {
    return [
      <View style={styles.title}>,
      <Text style={styles.titleText}> Meeting Remote </Text>, 
      <Text style={styles.subText}> Choose your provider </Text>,
      </View>,
      <View style={styles.container}>,
        <View>
        <TouchableOpacity onPress={this._onPressGTM} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/gtmw.png')}
          />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressBlueJeans} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/bluejeansw.png')}
          />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressHangout} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/hangoutw.png')}
          />      
        </TouchableOpacity>
        </View>
        <View>
        <TouchableOpacity onPress={this._onPressZoom} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/zoomw.png')}
          />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressWebex} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/webexw.png')}
          />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressSkype} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/skypew.png')}
          />      
        </TouchableOpacity>
        </View>
      </View>
    ];
  }
  
  _onPressGTM() {
    Alert.alert('Logging into GoToMeeting')
  }

  _onPressBlueJeans() {
    Alert.alert('Logging into BlueJeans')
  }

  _onPressWebex() {
    Alert.alert('Logging into Webex')
  }

  _onPressZoom() {
    Alert.alert('Logging into Zoom')
  }

  _onPressHangout() {
    Alert.alert('Logging into Google Hangouts')
  }

  _onPressSkype() {
    Alert.alert('Logging into Skype')
  }
}


function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
  };
}

const Main = connect(mapStateToProps, mapDispatchToProps)(MainView);
export { Main };


const styles = StyleSheet.create({
    titleText: {
        fontFamily: 'HelveticaNeue-Light',
        fontSize: 28,
        padding: 2,
    },
    subText: {
        fontFamily: 'HelveticaNeue-Thin',
        fontSize: 14,
    },
    title: {
        borderTopWidth: 30,
        borderColor: '#fff',
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    container: {
        flex: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderBottomWidth: 20,
        borderRightWidth: 50,
        borderColor: '#fff',
        backgroundColor: '#fff',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        height: 50,
        width: 175,
        padding: 60,
        alignItems: 'center',
    },
    touch: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});