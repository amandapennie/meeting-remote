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
      <View style={styles.title}>,
      <Text style={styles.titleText}> Unsupported Provider </Text>,
      <Text style={styles.subText}>
      </Text>,
      <Text style={styles.subText}> Meeting Remote does not currently support this provider. </Text>, 
      </View>,
    ];
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
        fontSize: 26,
        padding: 2,
        textAlign: 'center',
    },
    subText: {
        fontFamily: 'HelveticaNeue-Thin',
        fontSize: 20,
        textAlign: 'center',
    },
    title: {
        borderColor: '#fff',
        flex: 1,
        flexDirection: 'column',
        borderWidth: 30,
        flexWrap: 'wrap',
        justifyContent: 'center',
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
        alignSelf: 'center',
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
