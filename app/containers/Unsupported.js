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
  Linking,
} from 'react-native';
import { connect } from 'react-redux';
import { Actions, Scene, Router, ActionConst } from 'react-native-router-flux';

class UnsupportedView extends React.Component {
  render() {
    return [
        <TouchableOpacity onPress={this._onPressZoom} style={ styles.touch }>
          <Image
            style={ styles.button }
            source={require('./logos/zoomw.png')}
          />      
        </TouchableOpacity>,    
      <View style={styles.title}>,
      <Text style={styles.titleText}> Interested in using Zoom? </Text>, 
      <Button style={styles.button} title='Yes' onPress= {this._onPressUnsupport}/>,
      <Button style={styles.button} title='No' onPress={this._onPressHome} />
      </View>,
    ];
  }

  _onPressUnsupport = () => {
    Alert.alert("Tracking user's click")
    //add tracking action
    Actions.pop()
  }

  _onPressHome = () => {
    Actions.pop()
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

const Unsupported = connect(mapStateToProps, mapDispatchToProps)(UnsupportedView);
export { Unsupported };

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
        borderColor: '#fff',
        flex: 1,
        flexDirection: 'column',
        borderTopWidth: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'wrap',
        borderColor: '#fff',
        backgroundColor: '#fff',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
    },
    button: {
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        alignItems: 'center',
    },
    touch: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 100,
        borderColor: '#fff',
    },
});
