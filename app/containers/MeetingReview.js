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
} from 'react-native';
import { connect } from 'react-redux';
import { Actions as RouterActions } from 'react-native-router-flux';
import { Scene, Router, ActionConst } from 'react-native-router-flux';
import { Stopwatch } from 'react-native-stopwatch-timer';
import StarRating from 'react-native-star-rating';
import * as providerActions from '../store/actions/provider';
import { track } from '../tracking';
import Config from '../config';
import ProviderButton from '../components/ProviderButton';
import HorizontalRule from '../components/HorizontalRule';

class MeetingReviewView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      starCount: 4.5
    };
  }

  onStarRatingPress = (rating) => {
    this.setState({
      starCount: rating
    });
  }

  render() {
    const {profile} = this.props;
    return (
       <View style={styles.container}>
          <View style={{marginTop: 10, marginBottom: 10, alignItems: 'center'}}>
            <Image source={require('../../assets/Logo.png')} style={{width: '75%', height: 37}} />
            {profile && <Text style={{color: Config.colors.lightGrey, fontSize: 9}}>Signed in as {profile.firstName} {profile.lastName}</Text> }
          </View>
          <View style={{flex:1, padding: 30, paddingLeft: 25, paddingRight: 25}}>
            <Text style={{color: "#ffffff", textAlign: 'center', fontSize: 24, marginBottom: 35}}>How well did this app help you start your meeting?</Text>
            <StarRating
              emptyStarColor={Config.colors.lightGrey}
              fullStarColor={Config.colors.primaryColor}
              disabled={false}
              maxStars={5}
              rating={this.state.starCount}
              selectedStar={this.onStarRatingPress} />
          </View>
          <View style={{padding: 30, paddingLeft: 25, paddingRight: 25}}>
            <ProviderButton
              onPress={this._onPressRate} 
              textAlign='center' 
              fontSize={20} 
              style={{paddingTop: 10, paddingBottom: 10}}>{`Rate ${this.state.starCount} star${(this.state.starCount==1)?"":"s"}`}</ProviderButton>
            <Text style={styles.text}>Have feedback? We would love to hear from you. Reach out to us at support@meetingremote.com</Text>
            <TouchableOpacity style={{margin: 25}} onPress={this._onPressSkip}>
                          <Text style={{color: "#ffffff", textAlign: 'center', fontSize: 20, marginBottom: 10}}>Skip Rating</Text>
            </TouchableOpacity>
          </View>
        </View>
    );
  }

  _onPressRate = () => {
    track('MEETING_END_RATED', this.props.userId, {
      rating: this.state.starCount,
      ...this.props.lastLaunchData
    });
    RouterActions.reset('providerDashboard');
  }

  _onPressSkip = () => {
    track('MEETING_END_RATING_SKIPPED', this.props.userId, this.props.lastLaunchData);
    RouterActions.reset('providerDashboard');
  }
}

function mapStateToProps(state, ownProps) {
  const bluetoothState = state.bluetooth;
  const peripheral = bluetoothState.connectedPeripherals[Object.keys(bluetoothState.connectedPeripherals)[0]];
  const meetingId = (state.provider.launchData) ? state.provider.launchData.meetingId : null;
  const currentProviderType = state.provider.currentProviderType;
  const profile = state.provider.authenticatedProviders[currentProviderType].profile;
  return {
    lastLaunchData: state.provider.lastLaunchData || {},
    bluetoothState,
    peripheral,
    providerType: state.provider.currentProviderType,
    meetingId: meetingId,
    profile,
    userId: state.provider.currentUserId
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    endMeeting: (options) => dispatch(providerActions.endMeeting(options)),
    shareLink: (meetingId) => dispatch(providerActions.shareLink(meetingId))
  };
}

const MeetingReview = connect(mapStateToProps, mapDispatchToProps)(MeetingReviewView);
export { MeetingReview };


const options = {
   container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 70,
    fontFamily: 'HelveticaNeue-Light',
    color: '#fff',
    fontWeight: 'bold',
  }
};

const styles = StyleSheet.create({
    container: {
      marginTop: 20,
      flex: 1,
      backgroundColor: Config.colors.darkGrey
    },
    text: {
      padding: 10,
      marginRight: 30,
      marginLeft: 30, 
      textAlign: 'center',
      color: Config.colors.lightGrey,
      fontSize: 10,
    },
    text2: {
      textAlign: 'center',
      color: Config.colors.lightGrey,
      fontSize: 10,
      fontWeight: 'bold',
    },
    button: {
        flex: 0.3,
        margin: 40,
        backgroundColor: '#e73',
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
