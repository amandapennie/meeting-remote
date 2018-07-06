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
import { types } from '../providers';
import * as providerActions from '../store/actions/provider';


class MainView extends React.Component {
  render() {
    return [
      <View style={styles.title} key="mainTitle">
        <Text style={styles.titleText} > Meeting Remote </Text>
        <Text style={styles.subText}> Choose your provider </Text>
      </View>,
      <View style={styles.container} key="providers">
        <TouchableOpacity onPress={this._onPressGTM} style={ styles.touch } key="gtm">
          <Image
            style={ styles.button }
            source={require('./logos/gtmw.png')} />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressBlueJeans} style={ styles.touch } key="bluejeans">
          <Image
            style={ styles.button }
            source={require('./logos/bluejeansw.png')} />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressHangout} style={ styles.touch } key="hangouts">
          <Image
            style={ styles.button }
            source={require('./logos/hangoutw.png')} />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressZoom} style={ styles.touch } key="zoom">
          <Image
            style={ styles.button }
            source={require('./logos/zoomw.png')} />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressWebex} style={ styles.touch } key="webex">
          <Image
            style={ styles.button }
            source={require('./logos/webexw.png')} />      
        </TouchableOpacity>
        <TouchableOpacity onPress={this._onPressSkype} style={ styles.touch } key="skype">
          <Image
            style={ styles.button }
            source={require('./logos/skypew.png')} />      
        </TouchableOpacity>
      </View>
    ];
  }
  
  _onPressGTM = () => {
    this.props.selectProvider(types.gtm);
  }

  _onPressBlueJeans = () => {
    this.props.selectProvider(types.bluejeans);   
  }

  _onPressWebex = () => {
    this.props.selectProvider(types.webex);
  }

  _onPressZoom = () => {
    this.props.selectProvider(types.zoom);
  }

  _onPressHangout = () => {
    this.props.selectProvider(types.hangout);
  }

  _onPressSkype = () => {
    this.props.selectProvider(types.skype);
  }
}

function mapStateToProps(state, ownProps) {
  return {
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    selectProvider: (providerType) => dispatch(providerActions.selectProvider(providerType))
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
        marginTop: 30,
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        backgroundColor: '#fff'
    },
    button: {
        width: 150,
        height: 150
    },
    touch: {
        flexBasis: '50%',
        backgroundColor: '#fff',
        alignItems: 'center',
        marginBottom: 25
    },
});