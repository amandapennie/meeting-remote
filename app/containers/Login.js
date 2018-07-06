import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View, WebView, ActivityIndicator, Dimensions } from 'react-native';
import { Actions as RouterActions } from 'react-native-router-flux';
import { GTM_CONSUMER_KEY } from 'react-native-dotenv';
import url from 'url';

import LoadingView from '../components/LoadingView';

import * as providerActions from '../store/actions/provider';

const REDIRECT_URI = "https://mtg-remote.herokuapp.com/oauth/gtm/return"

export class ProviderLoginView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loading: true, ...Dimensions.get('window') };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.authenticatedProviders.hasOwnProperty(this.props.providerType)){
      RouterActions.providerDashboard({type: 'replace'});
    }
  }

  onNavigationStateChange(data) {
    if(data.loading === true && data.url.startsWith('https://mtg-remote.herokuapp.com/gtconf_return')){
      this.setState({ processingAuthResp: true });
      const queryData = url.parse(data.url, true).query;
      this.props.handleAuthResponse('gtm', queryData);
    }
  }

  hideSpinner = () => {
    this.setState({ loading: false });
  }

  getAuthorizeUri() {
    return `https://api.getgo.com/oauth/v2/authorize?client_id=${GTM_CONSUMER_KEY}&response_type=code&state=mr&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  }

  render() {
    if(this.state.processingAuthResp) {
      return (
        <View style={{marginTop: 20, flex: 1}}>
          <LoadingView />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{uri: this.getAuthorizeUri() }}
          onLoad={() => (this.hideSpinner())}
          style={{marginTop: 20, flex: 1 }} 
          onNavigationStateChange={(data) => this.onNavigationStateChange(data)}
          startInLoadingState={true}
          renderLoading={
            ()=> {
              return (<LoadingView />);
            }
          } />
      </View>
    );
  }
}


function mapStateToProps(state, ownProps) {
  const { currentProviderType, authenticatedProviders }  = state.provider;
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


const Login = connect(mapStateToProps, mapDispatchToProps)(ProviderLoginView);

export { Login };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});