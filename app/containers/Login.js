import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View, WebView } from 'react-native';
import { Actions as RouterActions } from 'react-native-router-flux';
import Config from '../config';
import url from 'url';

import * as providerActions from '../store/actions/provider';

const REDIRECT_URI = "https://mtg-remote.herokuapp.com/oauth/gtm/return"

export class LoginView extends React.Component {
  componentWillReceiveProps(nextProps) {
    if(nextProps.authenticatedProviders.hasOwnProperty(this.props.providerType)){
      RouterActions.providerDashboard({type: 'replace'});
    }
  }

  onNavigationStateChange(data) {
    console.log(data.url);
    if(data.loading === true && data.url.startsWith('https://mtg-remote.herokuapp.com/gtconf_return')){
      console.log('inside auth return');
      const queryData = url.parse(data.url, true).query;
      this.props.handleAuthResponse('gtm', queryData);
    }
  }

  getAuthorizeUri() {
    return `https://api.getgo.com/oauth/v2/authorize?client_id=${Config.gtm.consumerKey}&response_type=code&state=mr&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  }

  render() {
    return (
      <WebView
        source={{uri: this.getAuthorizeUri() }}
        style={{marginTop: 20}} 
        onNavigationStateChange={(data) => this.onNavigationStateChange(data)} />
    );
  }
}


function mapStateToProps(state, ownProps) {
  const {currentProviderType, authenticatedProviders}  = state.provider;
  return {
    providerType: currentProviderType,
    authenticatedProviders
  };
}


function mapDispatchToProps(dispatch, ownProps) {
  return {
    handleAuthResponse: (p,a) => dispatch(providerActions.handleAuthResponse(p,a)),
  };
}


const Login = connect(mapStateToProps, mapDispatchToProps)(LoginView);

export { Login };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});